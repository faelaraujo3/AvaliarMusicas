from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import re
from bson import ObjectId
import urllib.request
import json
app = Flask(__name__)
CORS(app)

# MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["scorefy_db"]

# Coleções
usuarios_col = db["users"]
artistas_col = db["artists"]
albuns_col = db["albums"]
criticas_col = db["reviews"]
notificacoes_col = db["notifications"]
listas_col = db["lists"]
messages_col = db["messages"]
track_ratings_col = db["track_ratings"]

def fetch_deezer_album(album_id):
    try:
        url = f"https://api.deezer.com/album/{album_id}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
        
        if 'error' in data:
            return None
            
        duration = data.get('duration', 0)
        minutes = duration // 60
        hours = minutes // 60
        remaining_minutes = minutes % 60
        
        nb_tracks = data.get('nb_tracks', 0)
        
        if hours > 0:
            description = f"{nb_tracks} músicas • {hours} horas e {remaining_minutes} minutos"
        else:
            description = f"{nb_tracks} músicas • {minutes} minutos"

        album_doc = {
            "id_album": data['id'],
            "title": data['title'],
            "id_artista": data['artist']['id'],
            "year": int(data['release_date'][:4]) if 'release_date' in data else None,
            "genre": data['genres']['data'][0]['name'] if 'genres' in data and data['genres']['data'] else "Desconhecido",
            "image": data.get('cover_xl') or data.get('cover_big') or data.get('cover'),
            "artist": data['artist']['name'],
            "description": description,
            "record_type": data.get('record_type', 'album'),
            "tracks": data['tracks']['data'] if 'tracks' in data else []
        }
        
        # atualiza ou insere o artista no cache
        artistas_col.update_one(
            {"id_artista": data['artist']['id']},
            {"$set": {
                "id_artista": data['artist']['id'],
                "name": data['artist']['name'],
                "image_url": data['artist'].get('picture_xl') or data['artist'].get('picture_big') or data['artist'].get('picture')
            }},
            upsert=True
        )
        
        # atualiza ou insere o album no cache
        albuns_col.update_one(
            {"id_album": data['id']},
            {"$set": album_doc},
            upsert=True
        )
        return album_doc
    except Exception as e:
        print(f"Error fetching Deezer album {album_id}: {e}")
        return None

# --- ROTA DE LOGIN ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')
    usuario = usuarios_col.find_one({"email": email, "senha": senha}, {"_id": 0})
    if not usuario:
        return jsonify({"error": "E-mail ou palavra-passe incorretos"}), 401
    return jsonify({"message": "Login realizado com sucesso!", "user": usuario}), 200

# --- ROTA DE REGISTO ---
@app.route('/api/registrar', methods=['POST'])
def registrar():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')
    nome = data.get('nome')
    username = data.get('username') 

    if usuarios_col.find_one({"username": username}):
        return jsonify({"error": "Este nome de usuário já está em uso"}), 400
    
    if not email or not senha or not nome or not username:
        return jsonify({"error": "E-mail, senha, nome e username são obrigatórios"}), 400
    
    if usuarios_col.find_one({"email": email}):
        return jsonify({"error": "E-mail já cadastrado!"}), 400

    ultimo_usuario = usuarios_col.find_one(sort=[("id_user", -1)])
    proximo_id = (ultimo_usuario["id_user"] + 1) if ultimo_usuario else 1

    novo_usuario = {
        "id_user": proximo_id,
        "email": email,
        "senha": senha,
        "username": username,
        "nome": nome,
        "bio": "",
        "localizacao": "",
        "imagem_url": "",
        "albuns_favoritos": [],
        "notifications": [], 
        "seguidores": [],
        "seguindo": [],
        "pref_notificacoes": {
            "curtidas": True,
            "respostas": True,
            "seguidores": True
        }
    }
    
    usuarios_col.insert_one(novo_usuario)

    return jsonify({
        "message": "Conta criada com sucesso!", 
        "id_user": proximo_id,
        "username": username
    }), 201
    
# --- BUSCA E LISTAGEM com ano genero etc ---
@app.route('/api/busca', methods=['GET'])
def busca_global():
    import urllib.parse
    import re
    from concurrent.futures import ThreadPoolExecutor

    termo_original = request.args.get('q', '')
    
    # Extrai filtro de ano customizado: year:2024
    ano_filtro = None
    match = re.search(r'year:(\d{4})', termo_original)
    if match:
        ano_filtro = match.group(1)
        termo = termo_original.replace(match.group(0), '').strip()
    else:
        termo = termo_original

    if not termo:
        return jsonify({"artistas": [], "albuns": [], "usuarios": []}), 200

    albuns = []
    artistas = []

    try:
        url_a = f"https://api.deezer.com/search/album?q={urllib.parse.quote(termo)}&limit=15"
        req_a = urllib.request.Request(url_a, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_a) as res:
            data_a = json.loads(res.read().decode()).get('data', [])
            # Se houver filtro de ano, busca os detalhes em paralelo pra não demorar
            if ano_filtro:
                def fetch_album_details(a):
                    try:
                        url_detail = f"https://api.deezer.com/album/{a['id']}"
                        req_det = urllib.request.Request(url_detail, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req_det) as res_det:
                            return json.loads(res_det.read().decode())
                    except:
                        return None

                with ThreadPoolExecutor(max_workers=15) as executor:
                    detalhes = list(executor.map(fetch_album_details, data_a))
                
                for idx, det in enumerate(detalhes):
                    if det and det.get('release_date', '').startswith(ano_filtro):
                        a = data_a[idx]
                        album_doc = {
                            "id_album": a['id'],
                            "title": a['title'],
                            "id_artista": a['artist']['id'],
                            "image": a.get('cover_xl') or a.get('cover_big') or a.get('cover'),
                            "artist": a['artist']['name'],
                            "record_type": a.get('record_type', 'album'),
                            "release_date": det.get('release_date')
                        }
                        albuns_col.update_one({"id_album": a['id']}, {"$set": album_doc}, upsert=True)
                        albuns.append(album_doc)
            else:
                for a in data_a:
                    album_doc = {
                        "id_album": a['id'],
                        "title": a['title'],
                        "id_artista": a['artist']['id'],
                        "image": a.get('cover_xl') or a.get('cover_big') or a.get('cover'),
                        "artist": a['artist']['name'],
                        "record_type": a.get('record_type', 'album')
                    }
                    albuns_col.update_one({"id_album": a['id']}, {"$set": album_doc}, upsert=True)
                    albuns.append(album_doc)
    except Exception as e:
        print("Erro Deezer Albums:", e)

    try:
        url_art = f"https://api.deezer.com/search/artist?q={urllib.parse.quote(termo)}&limit=10"
        req_art = urllib.request.Request(url_art, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_art) as res:
            data_art = json.loads(res.read().decode()).get('data', [])
            for art in data_art:
                artist_doc = {
                    "id_artista": art['id'],
                    "name": art['name'],
                    "image_url": art.get('picture_xl') or art.get('picture_big') or art.get('picture')
                }
                artistas_col.update_one({"id_artista": art['id']}, {"$set": artist_doc}, upsert=True)
                artistas.append(artist_doc)
    except Exception as e:
        print("Erro Deezer Artists:", e)

    usuarios = list(usuarios_col.find({
        "$or": [
            {"username": {"$regex": termo, "$options": "i"}},
            {"nome": {"$regex": termo, "$options": "i"}}
        ]
    }, {"_id": 0, "senha": 0})) 

    return jsonify({"artistas": artistas, "albuns": albuns, "usuarios": usuarios}), 200

@app.route('/api/busca/faixas', methods=['GET'])
def busca_faixas():
    import urllib.parse
    termo = request.args.get('q', '')
    if not termo:
        return jsonify([]), 200

    faixas = []
    try:
        url = f"https://api.deezer.com/search/track?q={urllib.parse.quote(termo)}&limit=15"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode()).get('data', [])
            for t in data:
                # a gente precisa do preview_url pra tocar, entao so retorna se tiver
                if t.get('preview'):
                    faixas.append({
                        "id": t['id'],
                        "title": t['title'],
                        "artist": t['artist']['name'],
                        "album": {
                            "id": t['album']['id'],
                            "title": t['album']['title'],
                            "image": t['album'].get('cover_xl') or t['album'].get('cover_big') or t['album'].get('cover')
                        },
                        "preview": t['preview'],
                        "duration": t.get('duration', 0)
                    })
    except Exception as e:
        print("Erro Deezer Tracks:", e)

    return jsonify(faixas), 200

@app.route('/api/albuns', methods=['GET'])
def listar_albuns():
    genero = request.args.get('genero')
    pipeline = [
        {"$match": {"genre": {"$regex": f"^{genero}$", "$options": "i"}}} if genero else {"$match": {}},
        {"$lookup": {"from": "artists", "localField": "id_artista", "foreignField": "id_artista", "as": "art"}},
        {"$unwind": "$art"},
        {"$project": {"_id": 0, "id_album": 1, "title": 1, "genre": 1, "year": 1, "image": 1, "description": 1, "nome_artista": "$art.name"}}
    ]
    return jsonify(list(albuns_col.aggregate(pipeline))), 200

# --- SISTEMA DE REVIEWS ---
@app.route('/api/reviews', methods=['POST'])
def postar_review():
    data = request.json
    
    try:
        id_user = int(data.get('id_user'))
        id_album = int(data.get('id_album'))
        nota = float(data.get('nota'))
    except (ValueError, TypeError):
        return jsonify({"error": "Dados de ID ou Nota inválidos"}), 400

    usuario = usuarios_col.find_one({"id_user": id_user})
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    existente = criticas_col.find_one({"id_user": id_user, "id_album": id_album})
    if existente:
        return jsonify({"error": "Você já avaliou este álbum!"}), 400

    nova_review = {
        "id_user": id_user,
        "username": usuario.get('username') or usuario.get('nome'),
        "id_album": id_album,
        "nota": nota,
        "texto": data.get('texto'),
        "curtidas": [],
        "respostas": [],
        "data_postagem": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    criticas_col.insert_one(nova_review)
    return jsonify({"message": "Review publicada!"}), 201

@app.route('/api/reviews/<review_id>', methods=['DELETE'])
def deletar_review(review_id):
    criticas_col.delete_one({"_id": ObjectId(review_id)})
    return jsonify({"message": "Review excluída"}), 200

@app.route('/api/reviews/<review_id>', methods=['PUT'])
def editar_review(review_id):
    data = request.json
    criticas_col.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": {"texto": data.get('texto'), "nota": data.get('nota')}}
    )
    return jsonify({"message": "Review atualizada"}), 200

@app.route('/api/reviews/<review_id>/responder/delete', methods=['POST'])
def deletar_resposta_rota(review_id):
    data = request.json
    criticas_col.update_one(
        {"_id": ObjectId(review_id)},
        {"$pull": {"respostas": {"id_user": data['id_user'], "texto": data['texto']}}}
    )
    return jsonify({"status": "sucesso"}), 200

@app.route('/api/reviews/<review_id>/responder/edit', methods=['PUT'])
def editar_resposta_rota(review_id):
    data = request.json
    criticas_col.update_one(
        {"_id": ObjectId(review_id), "respostas.id_user": data['id_user'], "respostas.texto": data['texto_antigo']},
        {"$set": {"respostas.$.texto": data['novo_texto']}}
    )
    return jsonify({"status": "sucesso"}), 200

@app.route('/api/albuns/<int:id_album>', methods=['GET'])
def detalhes_album(id_album):
    # Tenta puxar dados fresquinhos do Deezer
    album = fetch_deezer_album(id_album)
    
    # Fallback pro cache local caso o Deezer falhe
    if not album:
        album = albuns_col.find_one({"id_album": id_album}, {"_id": 0})
        if not album: 
            return jsonify({"error": "Álbum não encontrado"}), 404
        
        if "id_artista" in album:
            artista_db = artistas_col.find_one({"id_artista": album["id_artista"]})
            album["artist"] = artista_db["name"] if artista_db else "Desconhecido"
        else:
            album["artist"] = "Desconhecido"
        
    reviews = list(criticas_col.find({"id_album": id_album}))
    notas = [r['nota'] for r in reviews if 'nota' in r]
    
    media = sum(notas) / len(notas) if notas else 0
    
    for r in reviews: 
        r['_id'] = str(r['_id'])
        
        user_db = usuarios_col.find_one({"id_user": r["id_user"]})
        if user_db:
            r['imagem_url'] = user_db.get('imagem_url', 'default_avatar.png')
            r['username'] = user_db.get('username') or user_db.get('nome')

        if "respostas" in r:
            for resp in r["respostas"]:
                resp_user_db = usuarios_col.find_one({"id_user": resp.get("id_user")})
                if resp_user_db:
                    resp['imagem_url'] = resp_user_db.get('imagem_url', 'default_avatar.png')
                    resp['username'] = resp_user_db.get('username') or resp_user_db.get('nome')
    
    return jsonify({
        "album": album, 
        "nota_media": round(media, 1), 
        "total_reviews": len(reviews), 
        "reviews": reviews
    }), 200

@app.route('/api/reviews/<review_id>', methods=['GET'])
def detalhes_review(review_id):
    try:
        review = criticas_col.find_one({"_id": ObjectId(review_id)})
        if not review:
            return jsonify({"error": "Review não encontrada"}), 404

        review['_id'] = str(review['_id'])
        
        # recupera os dados do autor da review
        user_db = usuarios_col.find_one({"id_user": review["id_user"]})
        if user_db:
            review['imagem_url'] = user_db.get('imagem_url', 'default_avatar.png')
            review['username'] = user_db.get('username') or user_db.get('nome')

        # popula as infos de usuario pra cada resposta da thread
        if "respostas" in review:
            for resp in review["respostas"]:
                try:
                    r_id_user = int(resp.get("id_user"))
                except:
                    r_id_user = resp.get("id_user")
                    
                resp_user_db = usuarios_col.find_one({"id_user": r_id_user})
                if resp_user_db:
                    resp['imagem_url'] = resp_user_db.get('imagem_url', 'default_avatar.png')
                    resp['username'] = resp_user_db.get('username') or resp_user_db.get('nome')
                    
        # puxa dados do album do db local (fallback pro cache se necessario futuramente)
        album_data = albuns_col.find_one({"id_album": review['id_album']}, {"_id": 0})
        if album_data:
            if "id_artista" in album_data:
                artista_db = artistas_col.find_one({"id_artista": album_data["id_artista"]})
                album_data["artist"] = artista_db.get("name", "Desconhecido") if artista_db else "Desconhecido"
            else:
                album_data["artist"] = "Desconhecido"
        else:
            album_data = None
            
        # busca as notas individuais que esse usuario deu pras faixas desse disco
        track_ratings_db = list(track_ratings_col.find({
            "id_user": review["id_user"],
            "id_album": review["id_album"]
        }, {"_id": 0}))

        # de-normaliza os titulos das faixas junto das notas usando as infos em album_data
        if album_data and "tracks" in album_data and "data" in album_data["tracks"]:
            track_dict = {t["id"]: t["title"] for t in album_data["tracks"]["data"]}
            for tr in track_ratings_db:
                tr["title"] = track_dict.get(tr["id_track"], f"Faixa {tr['id_track']}")
        
        review["track_ratings"] = track_ratings_db
            
        return jsonify({"review": review, "album": album_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- INTERAÇÕES E NOTIFICAÇÕES ---
@app.route('/api/reviews/<review_id>/curtir', methods=['POST'])
def curtir_review(review_id):
    data = request.json
    id_user_curtiu = data.get('id_user')
    
    # carrega o perfil de quem ta dando o like
    user_curtiu = usuarios_col.find_one({"id_user": id_user_curtiu})
    nome_quem_curtiu = user_curtiu.get('username') if user_curtiu else data.get('username', 'Alguém')
    imagem_quem_curtiu = user_curtiu.get('imagem_url') if user_curtiu else "default_avatar.png"
    
    review = criticas_col.find_one({"_id": ObjectId(review_id)})
    if not review:
        return jsonify({"error": "Review não encontrada"}), 404

    ja_curtiu = id_user_curtiu in review.get('curtidas', [])

    if ja_curtiu:
        criticas_col.update_one(
            {"_id": ObjectId(review_id)},
            {"$pull": {"curtidas": id_user_curtiu}}
        )
        return jsonify({"status": "unliked"}), 200
    else:
        criticas_col.update_one(
            {"_id": ObjectId(review_id)},
            {"$addToSet": {"curtidas": id_user_curtiu}}
        )

        if review['id_user'] != id_user_curtiu:
            user_alvo = usuarios_col.find_one({"id_user": review['id_user']})
            pref = user_alvo.get('pref_notificacoes', {}) if user_alvo else {}
            
            if pref.get('curtidas', True):
                album_db = albuns_col.find_one({"id_album": review['id_album']})
                nome_album = album_db['title'] if album_db else "Desconhecido"

                notificacoes_col.insert_one({
                    "para_id_user": review['id_user'],
                    "mensagem": f"@{nome_quem_curtiu} curtiu sua review do álbum {nome_album}!", 
                    "tipo": "curtida",
                    "imagem_url": imagem_quem_curtiu, 
                    "lida": False,
                    "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
                    "id_album": review['id_album']
                })

        return jsonify({"status": "liked"}), 200
    

@app.route('/api/notificacoes/<int:id_user>', methods=['GET'])
def obter_notificacoes(id_user):
    avisos = list(notificacoes_col.find({"para_id_user": id_user}).sort("_id", -1))
    for a in avisos: a['_id'] = str(a['_id'])
    return jsonify(avisos), 200

@app.route('/api/reviews/<review_id>/responder', methods=['POST'])
def responder_review(review_id):
    data = request.json
    id_resp = data.get('id_user')
    texto = data.get('texto')
    
    user_resp = usuarios_col.find_one({"id_user": id_resp})
    imagem_quem_resp = user_resp.get('imagem_url') if user_resp else "default_avatar.png"
    username_resp = user_resp.get('username') if user_resp else data.get('username', 'Alguém')
    
    nova_resposta = {
        "id_resposta": str(ObjectId()), 
        "id_user": id_resp,
        "username": username_resp,
        "texto": texto,
        "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "curtidas": [] 
    }

    review_alvo = criticas_col.find_one_and_update(
        {"_id": ObjectId(review_id)},
        {"$push": {"respostas": nova_resposta}}
    )

    if not review_alvo: return jsonify({"error": "Review não encontrada"}), 404

    if review_alvo['id_user'] != id_resp:
        user_alvo = usuarios_col.find_one({"id_user": review_alvo['id_user']})
        pref = user_alvo.get('pref_notificacoes', {}) if user_alvo else {}
        
        if pref.get('respostas', True):
            notificacoes_col.insert_one({
                "para_id_user": review_alvo['id_user'],
                "mensagem": f"@{username_resp} respondeu sua review!",
                "tipo": "resposta",
                "texto_comentario": texto,
                "imagem_url": imagem_quem_resp, 
                "lida": False,
                "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
                "id_album": review_alvo['id_album']
            })

    mencoes = set(re.findall(r'@(\w+)', texto))
    for m in mencoes:
        user_mencionado = usuarios_col.find_one({"username": m})
        if user_mencionado and user_mencionado['id_user'] != id_resp and user_mencionado['id_user'] != review_alvo['id_user']:
            pref_m = user_mencionado.get('pref_notificacoes', {})
            if pref_m.get('respostas', True):
                notificacoes_col.insert_one({
                    "para_id_user": user_mencionado['id_user'],
                    "mensagem": f"@{username_resp} mencionou você em um comentário!",
                    "tipo": "resposta",
                    "texto_comentario": texto,
                    "imagem_url": imagem_quem_resp, 
                    "lida": False,
                    "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
                    "id_album": review_alvo['id_album']
                })

    return jsonify({"message": "Resposta enviada!"}), 200

@app.route('/api/reviews/<review_id>/respostas/<id_resposta>/curtir', methods=['POST'])
def curtir_resposta(review_id, id_resposta):
    data = request.json
    id_user_curtiu = data.get('id_user')
    
    user_curtiu = usuarios_col.find_one({"id_user": id_user_curtiu})
    nome_quem_curtiu = user_curtiu.get('username') if user_curtiu else "Alguém"
    imagem_quem_curtiu = user_curtiu.get('imagem_url') if user_curtiu else "default_avatar.png"

    review = criticas_col.find_one({"_id": ObjectId(review_id)})
    if not review: return jsonify({"error": "Review não encontrada"}), 404
        
    resposta_alvo = next((r for r in review.get('respostas', []) if r.get('id_resposta') == id_resposta), None)
    if not resposta_alvo: return jsonify({"error": "Resposta não encontrada"}), 404
    
    ja_curtiu = id_user_curtiu in resposta_alvo.get('curtidas', [])
    
    if ja_curtiu:
        criticas_col.update_one(
            {"_id": ObjectId(review_id), "respostas.id_resposta": id_resposta},
            {"$pull": {"respostas.$.curtidas": id_user_curtiu}}
        )
        return jsonify({"status": "unliked"}), 200
    else:
        criticas_col.update_one(
            {"_id": ObjectId(review_id), "respostas.id_resposta": id_resposta},
            {"$addToSet": {"respostas.$.curtidas": id_user_curtiu}}
        )
        
        if resposta_alvo['id_user'] != id_user_curtiu:
            user_alvo = usuarios_col.find_one({"id_user": resposta_alvo['id_user']})
            pref = user_alvo.get('pref_notificacoes', {}) if user_alvo else {}
            
            if pref.get('curtidas', True):
                notificacoes_col.insert_one({
                    "para_id_user": resposta_alvo['id_user'],
                    "mensagem": f"@{nome_quem_curtiu} curtiu seu comentário!", 
                    "tipo": "curtida",
                    "texto_comentario": resposta_alvo['texto'],
                    "imagem_url": imagem_quem_curtiu, 
                    "lida": False,
                    "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
                    "id_album": review['id_album']
                })

        return jsonify({"status": "liked"}), 200

@app.route('/api/notificacoes/<notif_id>/ler', methods=['PATCH'])
def marcar_como_lida(notif_id):
    notificacoes_col.update_one(
        {"_id": ObjectId(notif_id)},
        {"$set": {"lida": True}}
    )
    return jsonify({"status": "sucesso"}), 200

# --- SEÇÕES DA HOME E FEED ---
def buscar_detalhes_album(lista_agregada):
    if not lista_agregada:
        return []
    
    ids = [item["_id"] for item in lista_agregada]
    albuns = list(albuns_col.find({"id_album": {"$in": ids}}, {"_id": 0}))
    albuns.sort(key=lambda x: ids.index(x["id_album"]))
    
    for alb in albuns:
        art = artistas_col.find_one({"id_artista": alb["id_artista"]})
        alb["artist"] = art["name"] if art else "Desconhecido"
        reviews = list(criticas_col.find({"id_album": alb["id_album"]}))
        notas = [r['nota'] for r in reviews if 'nota' in r]
        alb["rating"] = round(sum(notas) / len(notas), 1) if notas else 0.0

    return albuns

@app.route('/api/home/secoes', methods=['GET'])
def obter_secoes_home():
    pipeline_top = [
        {"$group": {"_id": "$id_album", "media": {"$avg": "$nota"}, "total": {"$sum": 1}}},
        {"$sort": {"media": -1, "total": -1}},
        {"$limit": 8}
    ]
    melhores_agregados = list(criticas_col.aggregate(pipeline_top))
    
    cutoff_trending = datetime.utcnow() - timedelta(hours=3) - timedelta(days=14)
    todas_criticas = list(criticas_col.find({}))
    pontuacoes = {}
    for c in todas_criticas:
        id_a = c.get("id_album")
        if not id_a: continue
        pts = 0
        ds = c.get("data_postagem")
        if ds:
            try:
                if datetime.strptime(ds, "%Y-%m-%d %H:%M:%S") >= cutoff_trending: pts += 1
            except: pass
        for resp in c.get("respostas", []):
            drs = resp.get("data")
            if drs:
                try:
                    if datetime.strptime(drs, "%d/%m/%Y %H:%M") >= cutoff_trending: pts += 1
                except: pass
        if pts > 0:
            pontuacoes[id_a] = pontuacoes.get(id_a, 0) + pts

    trending_agregados = [{"_id": k, "contagem": v} for k, v in sorted(pontuacoes.items(), key=lambda item: item[1], reverse=True)[:8]]

    novos_lancamentos = list(albuns_col.find({}, {"_id": 0}).sort("year", -1).limit(8))
    for nl in novos_lancamentos:
        art = artistas_col.find_one({"id_artista": nl["id_artista"]})
        nl["artist"] = art["name"] if art else "Desconhecido"
        reviews = list(criticas_col.find({"id_album": nl["id_album"]}))
        notas = [r['nota'] for r in reviews if 'nota' in r]
        nl["rating"] = round(sum(notas) / len(notas), 1) if notas else 0.0

    lista_trending = buscar_detalhes_album(trending_agregados)
    if not lista_trending:
        lista_trending = list(albuns_col.find({}, {"_id": 0}).limit(8))
        for x in lista_trending:
             art = artistas_col.find_one({"id_artista": x["id_artista"]})
             x["artist"] = art["name"] if art else "Desconhecido"
             reviews = list(criticas_col.find({"id_album": x["id_album"]}))
             notas = [r['nota'] for r in reviews if 'nota' in r]
             x["rating"] = round(sum(notas) / len(notas), 1) if notas else 0.0

    lista_top = buscar_detalhes_album(melhores_agregados)
    if not lista_top:
        lista_top = list(albuns_col.find({"$or": [{"record_type": "album"}, {"record_type": "ep"}, {"record_type": {"$exists": False}}]}, {"_id": 0}).skip(8).limit(8))
        for x in lista_top:
             art = artistas_col.find_one({"id_artista": x["id_artista"]})
             x["artist"] = art["name"] if art else "Desconhecido"
             reviews = list(criticas_col.find({"id_album": x["id_album"]}))
             notas = [r['nota'] for r in reviews if 'nota' in r]
             x["rating"] = round(sum(notas) / len(notas), 1) if notas else 0.0

    # Puxar Singles em Alta (por popularidade ou data)
    lista_singles = list(albuns_col.find({"record_type": "single"}, {"_id": 0}).sort("year", -1).limit(8))
    for x in lista_singles:
         art = artistas_col.find_one({"id_artista": x["id_artista"]})
         x["artist"] = art["name"] if art else "Desconhecido"
         reviews = list(criticas_col.find({"id_album": x["id_album"]}))
         notas = [r['nota'] for r in reviews if 'nota' in r]
         x["rating"] = round(sum(notas) / len(notas), 1) if notas else 0.0

    # Puxar Faixas mais bem avaliadas
    top_tracks = []
    pipeline_tracks = [
        {"$group": {"_id": {"id_album": "$id_album", "id_track": "$id_track"}, "media": {"$avg": "$nota"}, "count": {"$sum": 1}}},
        {"$sort": {"media": -1, "count": -1}},
        {"$limit": 10}
    ]
    melhores_tracks_db = list(track_ratings_col.aggregate(pipeline_tracks))

    if melhores_tracks_db:
        for t in melhores_tracks_db:
            id_a = t["_id"]["id_album"]
            id_t = t["_id"]["id_track"]
            alb = albuns_col.find_one({"id_album": id_a})
            if alb and 'tracks' in alb:
                track_data = next((x for x in alb['tracks'] if x['id'] == id_t), None)
                if track_data and track_data.get('preview'):
                    top_tracks.append({
                        "id": track_data['id'],
                        "title": track_data['title'],
                        "preview": track_data['preview'],
                        "duration": track_data.get('duration', 0),
                        "artist": alb.get('artist', 'Desconhecido'),
                        "album": {"id": alb['id_album'], "title": alb['title'], "image": alb.get('image')},
                        "rating": round(t["media"], 1)
                    })

    # Fallback se não houver tracks suficientes avaliadas
    if len(top_tracks) < 8:
        for alb in lista_trending + novos_lancamentos:
            if 'tracks' in alb:
                for tr in alb['tracks']:
                    if tr.get('preview') and not any(x['id'] == tr['id'] for x in top_tracks):
                        top_tracks.append({
                            "id": tr['id'],
                            "title": tr['title'],
                            "preview": tr['preview'],
                            "duration": tr.get('duration', 0),
                            "artist": alb.get('artist', 'Desconhecido'),
                            "album": {"id": alb['id_album'], "title": alb['title'], "image": alb.get('image')},
                            "rating": round(tr.get('rank', 0) / 100000, 1) if tr.get('rank') else 0
                        })
                    if len(top_tracks) >= 8: break
            if len(top_tracks) >= 8: break

    return jsonify({
        "trending": lista_trending,
        "top_rated": lista_top,
        "new_releases": novos_lancamentos,
        "trending_singles": lista_singles,
        "top_tracks": top_tracks
    })

def formatar_albuns(lista_ids_ou_docs):
    resultados = []
    if not lista_ids_ou_docs: return []

    primeiro_item = lista_ids_ou_docs[0]
    if "title" in primeiro_item:
        albuns_db = lista_ids_ou_docs
        ids_para_ordenar = None 
    else:
        ids_para_ordenar = [item["_id"] if "_id" in item else item["id_album"] for item in lista_ids_ou_docs]
        albuns_db = list(albuns_col.find({"id_album": {"$in": ids_para_ordenar}}, {"_id": 0}))
        if ids_para_ordenar:
            albuns_db.sort(key=lambda x: ids_para_ordenar.index(x["id_album"]))

    for album in albuns_db:
        art = artistas_col.find_one({"id_artista": album["id_artista"]})
        album["artist"] = art["name"] if art else "Desconhecido"
        reviews_album = list(criticas_col.find({"id_album": album["id_album"]}))
        notas = [r['nota'] for r in reviews_album if 'nota' in r]
        album["rating"] = round(sum(notas) / len(notas), 1) if notas else 0.0
        resultados.append(album)
    
    return resultados

@app.route('/api/lista/em-alta', methods=['GET'])
def lista_em_alta():
    cutoff_trending = datetime.utcnow() - timedelta(hours=3) - timedelta(days=14)
    todas_criticas = list(criticas_col.find({}))
    pontuacoes = {}
    for c in todas_criticas:
        id_a = c.get("id_album")
        if not id_a: continue
        pts = 0
        ds = c.get("data_postagem")
        if ds:
            try:
                if datetime.strptime(ds, "%Y-%m-%d %H:%M:%S") >= cutoff_trending: pts += 1
            except: pass
        for resp in c.get("respostas", []):
            drs = resp.get("data")
            if drs:
                try:
                    if datetime.strptime(drs, "%d/%m/%Y %H:%M") >= cutoff_trending: pts += 1
                except: pass
        if pts > 0:
            pontuacoes[id_a] = pontuacoes.get(id_a, 0) + pts

    ids = [{"_id": k, "contagem": v} for k, v in sorted(pontuacoes.items(), key=lambda item: item[1], reverse=True)[:50]]

    if not ids: 
        fallback = list(albuns_col.find({}, {"_id": 0}).sort("year", -1).limit(20))
        return jsonify(formatar_albuns(fallback))
    return jsonify(formatar_albuns(ids))

@app.route('/api/lista/singles-em-alta', methods=['GET'])
def lista_singles_em_alta():
    # Puxar Singles em Alta (por data)
    lista_singles = list(albuns_col.find({"record_type": "single"}, {"_id": 0}).sort("year", -1).limit(40))
    return jsonify(formatar_albuns(lista_singles))

@app.route('/api/lista/melhores-faixas', methods=['GET'])
def lista_melhores_faixas():
    top_tracks = []
    pipeline_tracks = [
        {"$group": {"_id": {"id_album": "$id_album", "id_track": "$id_track"}, "media": {"$avg": "$nota"}, "count": {"$sum": 1}}},
        {"$sort": {"media": -1, "count": -1}},
        {"$limit": 50}
    ]
    melhores_tracks_db = list(track_ratings_col.aggregate(pipeline_tracks))

    if melhores_tracks_db:
        for t in melhores_tracks_db:
            id_a = t["_id"]["id_album"]
            id_t = t["_id"]["id_track"]
            alb = albuns_col.find_one({"id_album": id_a})
            if alb and 'tracks' in alb:
                track_data = next((x for x in alb['tracks'] if x['id'] == id_t), None)
                if track_data and track_data.get('preview'):
                    top_tracks.append({
                        "id": track_data['id'],
                        "title": track_data['title'],
                        "preview": track_data['preview'],
                        "duration": track_data.get('duration', 0),
                        "artist": alb.get('artist', 'Desconhecido'),
                        "album": {"id": alb['id_album'], "title": alb['title'], "image": alb.get('image')},
                        "rating": round(t["media"], 1)
                    })

    if len(top_tracks) < 20:
        lista_trending = list(albuns_col.find({"$or": [{"record_type": "album"}, {"record_type": "ep"}, {"record_type": {"$exists": False}}]}, {"_id": 0}).sort("year", -1).limit(20))
        for alb in lista_trending:
            if 'tracks' in alb:
                for tr in alb['tracks']:
                    if tr.get('preview') and not any(x['id'] == tr['id'] for x in top_tracks):
                        top_tracks.append({
                            "id": tr['id'],
                            "title": tr['title'],
                            "preview": tr['preview'],
                            "duration": tr.get('duration', 0),
                            "artist": alb.get('artist', 'Desconhecido'),
                            "album": {"id": alb['id_album'], "title": alb['title'], "image": alb.get('image')},
                            "rating": round(tr.get('rank', 0) / 100000, 1) if tr.get('rank') else 0
                        })
                    if len(top_tracks) >= 30: break
            if len(top_tracks) >= 30: break

    return jsonify(top_tracks)

@app.route('/api/lista/melhores', methods=['GET'])
def lista_melhores():
    pipeline = [
        {"$group": {"_id": "$id_album", "media": {"$avg": "$rating"}}},
        {"$sort": {"media": -1}},
        {"$limit": 50}
    ]
    ids = list(criticas_col.aggregate(pipeline))
    if not ids: return jsonify(formatar_albuns(list(albuns_col.find({}, {"_id": 0}).limit(20))))
    return jsonify(formatar_albuns(ids))

@app.route('/api/lista/lancamentos', methods=['GET'])
def lista_lancamentos():
    albuns_cursor = albuns_col.find({}, {"_id": 0}).sort("year", -1).limit(50)
    return jsonify(formatar_albuns(list(albuns_cursor)))

# --- FAVORITOS E PERFIL ---
@app.route("/api/users/<int:id_user>/favorites", methods=["POST"])
def adicionar_favorito(id_user):
    data = request.json or {}
    id_album = data.get("id_album")

    if id_album is None: return jsonify({"error": "id_album é obrigatório"}), 400
    try: id_album = int(id_album)
    except (TypeError, ValueError): return jsonify({"error": "id_album deve ser número"}), 400

    usuario = usuarios_col.find_one({"id_user": id_user})
    if not usuario: return jsonify({"error": "Usuário não encontrado"}), 404

    favoritos = usuario.get("albuns_favoritos", [])
    if id_album in favoritos: return jsonify({"error": "Álbum já está nos favoritos"}), 400
    if len(favoritos) >= 5: return jsonify({"error": "Limite de 5 favoritos atingido"}), 400

    usuarios_col.update_one({"id_user": id_user}, {"$push": {"albuns_favoritos": id_album}})
    return jsonify({"message": "Álbum adicionado aos favoritos"}), 200

@app.route("/api/users/<int:id_user>/favorites/<int:id_album>", methods=["DELETE"])
def remover_favorito(id_user, id_album):
    usuario = usuarios_col.find_one({"id_user": id_user})
    if not usuario: return jsonify({"error": "Usuário não encontrado"}), 404

    favoritos = usuario.get("albuns_favoritos", [])
    if id_album not in favoritos: return jsonify({"error": "Álbum não está nos favoritos"}), 400

    usuarios_col.update_one({"id_user": id_user}, {"$pull": {"albuns_favoritos": id_album}})
    return jsonify({"message": "Álbum removido dos favoritos"}), 200

@app.route('/api/users/<int:id_user>', methods=['GET'])
def get_user_profile(id_user):
    usuario = usuarios_col.find_one({"id_user": id_user}, {"_id": 0, "senha": 0})
    if not usuario: return jsonify({"error": "Usuário não encontrado"}), 404

    fav_ids = usuario.get("albuns_favoritos", [])
    favoritos_detalhados = []
    if fav_ids:
        albuns_db = list(albuns_col.find({"id_album": {"$in": fav_ids}}, {"_id": 0}))
        for fid in fav_ids:
            found = next((a for a in albuns_db if a["id_album"] == fid), None)
            if found:
                if "artist" not in found and "id_artista" in found:
                    art = artistas_col.find_one({"id_artista": found["id_artista"]})
                    found["artist"] = art["name"] if art else "Desconhecido"
                favoritos_detalhados.append(found)

    user_reviews = list(criticas_col.find({"id_user": id_user}).sort("data_postagem", -1))
    for review in user_reviews:
        review['_id'] = str(review['_id'])
        album_data = albuns_col.find_one({"id_album": review['id_album']}, {"_id": 0, "title": 1, "image": 1, "id_artista": 1})
        if album_data:
            if "id_artista" in album_data:
                art = artistas_col.find_one({"id_artista": album_data["id_artista"]})
                album_data["artist"] = art["name"] if art else ""
            review["album_info"] = album_data

    listas_agregadas = list(listas_col.aggregate([
        {"$match": {"id_user": id_user}},
        {"$lookup": {
            "from": "albums",
            "localField": "albuns",
            "foreignField": "id_album",
            "as": "detalhes_albuns"
        }},
        {"$project": {
            "_id": {"$toString": "$_id"},
            "titulo": 1,
            "descricao": 1,
            "tipo": 1,
            "albuns": 1,
            "faixas": 1,
            "data_criacao": 1,
            "capa_personalizada": 1,
            "capas_albuns": {
                "$map": {"input": "$detalhes_albuns", "as": "a", "in": "$$a.image"}
            }
        }},
        {"$sort": {"data_criacao": -1}}
    ]))

    for lista in listas_agregadas:
        # Se for lista de faixas, extrai as imagens diretamente do objeto de faixa
        if lista.get("tipo") == "faixa":
            lista["capas"] = [f.get("album", {}).get("image") for f in lista.get("faixas", [])][:4]
        else:
            lista["capas"] = lista.get("capas_albuns", [])[:4]

    return jsonify({
        "user": usuario, 
        "favorites": favoritos_detalhados, 
        "reviews": user_reviews, 
        "listas": listas_agregadas,
        "seguidores": usuario.get("seguidores", []), 
        "seguindo": usuario.get("seguindo", []) 
    }), 200

@app.route('/api/users/<int:id_user>', methods=['PATCH'])
def update_user_profile(id_user):
    data = request.json
    campos_atualizar = {}

    if 'nome' in data: campos_atualizar['nome'] = data['nome']
    if 'bio' in data: campos_atualizar['bio'] = data['bio']
    if 'localizacao' in data: campos_atualizar['localizacao'] = data['localizacao']
    if 'imagem_url' in data: campos_atualizar['imagem_url'] = data['imagem_url']
    
    if 'email' in data:
        if usuarios_col.find_one({"email": data['email'], "id_user": {"$ne": id_user}}):
            return jsonify({"error": "Este e-mail já está em uso por outra pessoa."}), 400
        campos_atualizar['email'] = data['email']
        
    if 'username' in data:
        if usuarios_col.find_one({"username": data['username'], "id_user": {"$ne": id_user}}):
            return jsonify({"error": "Este nome de usuário já está em uso."}), 400
        campos_atualizar['username'] = data['username']

    if 'senha_nova' in data and 'senha_atual' in data:
        usuario = usuarios_col.find_one({"id_user": id_user})
        if not usuario or usuario.get('senha') != data['senha_atual']:
            return jsonify({"error": "A senha atual está incorreta."}), 400
        if data['senha_nova'] == data['senha_atual']:
            return jsonify({"error": "A nova senha não pode ser igual à atual."}), 400
        campos_atualizar['senha'] = data['senha_nova']

    if 'albuns_favoritos' in data:
        favoritos = data['albuns_favoritos']
        if isinstance(favoritos, list):
            lista_limpa = [int(x) for x in favoritos if isinstance(x, (int, str)) and str(x).isdigit()]
            campos_atualizar['albuns_favoritos'] = lista_limpa[:5]

    if 'pref_notificacoes' in data:
        campos_atualizar['pref_notificacoes'] = data['pref_notificacoes']

    if 'pinned_track' in data:
        campos_atualizar['pinned_track'] = data['pinned_track']

    if not campos_atualizar: return jsonify({"message": "Nada para atualizar"}), 200
    result = usuarios_col.update_one({"id_user": id_user}, {"$set": campos_atualizar})
    if result.matched_count == 0: return jsonify({"error": "Usuário não encontrado"}), 404

    user_atualizado = usuarios_col.find_one({"id_user": id_user}, {"_id": 0, "senha": 0})
    return jsonify({"message": "Dados atualizados com sucesso!", "user": user_atualizado}), 200

@app.route('/api/artistas/<int:id_artista>', methods=['GET'])
def detalhes_artista(id_artista):
    # Tenta puxar dados fresquinhos do Deezer
    try:
        url = f"https://api.deezer.com/artist/{id_artista}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
        
        if 'error' not in data:
            artista = {
                "id_artista": data['id'],
                "name": data['name'],
                "image_url": data.get('picture_xl') or data.get('picture_big') or data.get('picture')
            }
            artistas_col.update_one({"id_artista": id_artista}, {"$set": artista}, upsert=True)
        else:
            artista = artistas_col.find_one({"id_artista": id_artista}, {"_id": 0})
    except Exception:
        artista = artistas_col.find_one({"id_artista": id_artista}, {"_id": 0})

    if not artista: return jsonify({"error": "Artista não encontrado"}), 404

    # Buscar albuns do artista na deezer
    try:
        url_albuns = f"https://api.deezer.com/artist/{id_artista}/albums?limit=100"
        req_a = urllib.request.Request(url_albuns, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_a) as response_a:
            data_a = json.loads(response_a.read().decode())
        
        albuns = []
        if 'error' not in data_a and 'data' in data_a:
            for a in data_a['data']:
                album_doc = {
                    "id_album": a['id'],
                    "title": a['title'],
                    "id_artista": id_artista,
                    "year": int(a['release_date'][:4]) if 'release_date' in a else None,
                    "image": a.get('cover_xl') or a.get('cover_big') or a.get('cover'),
                    "record_type": a.get('record_type', 'album'),
                    "genre": a.get('genre_id', 'Desconhecido')
                }
                albuns_col.update_one({"id_album": a['id']}, {"$set": album_doc}, upsert=True)
                albuns.append(album_doc)
        else:
            albuns = list(albuns_col.find({"id_artista": id_artista}, {"_id": 0}))
    except Exception:
        albuns = list(albuns_col.find({"id_artista": id_artista}, {"_id": 0}))

    # Calcular nota de cada album
    total_notas = []
    for album in albuns:
        reviews = list(criticas_col.find({"id_album": album["id_album"]}))
        notas_album = [r['nota'] for r in reviews if 'nota' in r]
        
        album['nota_media'] = round(sum(notas_album) / len(notas_album), 1) if notas_album else 0
        total_notas.extend(notas_album)
        
    media_geral = sum(total_notas) / len(total_notas) if total_notas else 0

    return jsonify({
        "artista": artista,
        "albuns": albuns,
        "media_geral": round(media_geral, 1)
    }), 200

@app.route('/api/profile/username/<username>', methods=['GET'])
def get_profile_by_username(username):
    user = db.users.find_one({"username": username}, {"_id": 0, "password": 0})
    if not user: return jsonify({"error": "Usuário não encontrado"}), 404
    return jsonify(user)
    
@app.route('/api/users/<int:id_alvo>/follow', methods=['POST'])
def follow_user(id_alvo):
    data = request.json
    id_logado = data.get('id_user_logado')

    if not id_logado: return jsonify({"error": "Usuário não identificado"}), 400
    if id_logado == id_alvo: return jsonify({"error": "Você não pode seguir a si mesmo"}), 400

    user_alvo = db.users.find_one({"id_user": id_alvo})
    user_logado = db.users.find_one({"id_user": id_logado})

    if not user_alvo or not user_logado: return jsonify({"error": "Usuário não encontrado"}), 404

    if id_logado in user_alvo.get('seguidores', []):
        db.users.update_one({"id_user": id_alvo}, {"$pull": {"seguidores": id_logado}})
        db.users.update_one({"id_user": id_logado}, {"$pull": {"seguindo": id_alvo}})
        return jsonify({"status": "unfollowed", "message": "Você deixou de seguir este usuário"}), 200
    else:
        db.users.update_one({"id_user": id_alvo}, {"$push": {"seguidores": id_logado}})
        db.users.update_one({"id_user": id_logado}, {"$push": {"seguindo": id_alvo}})
        
        pref = user_alvo.get('pref_notificacoes', {})
        if pref.get('seguidores', True):
            notificacao = {
                "para_id_user": id_alvo, 
                "mensagem": f"@{user_logado['username']} começou a te seguir!",
                "lida": False,
                "tipo": "follow",
                "imagem_url": user_logado.get('imagem_url', 'default_avatar.png'), 
                "data": datetime.now().strftime("%d/%m/%Y %H:%M")
            }
            db.notifications.insert_one(notificacao)
        
        return jsonify({"status": "followed", "message": "Agora você está seguindo este usuário"}), 200
      
@app.route('/api/users/<int:id_user>/rede', methods=['GET'])
def buscar_rede_social(id_user):
    usuario = usuarios_col.find_one({"id_user": id_user})
    if not usuario: return jsonify({"error": "Usuário não encontrado"}), 404

    def buscar_detalhes(lista_ids):
        return list(usuarios_col.find(
            {"id_user": {"$in": lista_ids}},
            {"_id": 0, "id_user": 1, "username": 1, "nome": 1, "imagem_url": 1}
        ))

    return jsonify({
        "seguidores": buscar_detalhes(usuario.get("seguidores", [])),
        "seguindo": buscar_detalhes(usuario.get("seguindo", []))
    }), 200

@app.route('/api/feed/<int:id_user>', methods=['GET'])
def obter_feed_usuario(id_user):
    usuario = usuarios_col.find_one({"id_user": id_user})
    if not usuario: return jsonify({"error": "Usuário não encontrado"}), 404

    seguindo = usuario.get("seguindo", [])
    if not seguindo: return jsonify([]), 200

    feed_reviews = list(criticas_col.find({"id_user": {"$in": seguindo}}).sort("data_postagem", -1).limit(50))
    
    for review in feed_reviews:
        review['_id'] = str(review['_id'])
        autor = usuarios_col.find_one({"id_user": review["id_user"]})
        if autor:
            review['autor_nome'] = autor.get('nome', 'Usuário')
            review['autor_username'] = autor.get('username', '')
            review['autor_imagem'] = autor.get('imagem_url', 'default_avatar.png')
        
        album_data = albuns_col.find_one({"id_album": review['id_album']}, {"_id": 0, "title": 1, "image": 1, "id_artista": 1})
        if album_data:
            if "id_artista" in album_data:
                art = artistas_col.find_one({"id_artista": album_data["id_artista"]})
                album_data["artist"] = art["name"] if art else ""
            review["album_info"] = album_data

    return jsonify(feed_reviews), 200

# --- ROTAS DE LISTAS PERSONALIZADAS ---
@app.route('/api/users/<int:id_user>/listas', methods=['POST'])
def criar_lista(id_user):
    data = request.json
    nova_lista = {
        "id_user": id_user,
        "titulo": data.get("titulo", "Nova Playlist"),
        "descricao": data.get("descricao", ""),
        "tipo": data.get("tipo", "album"),
        "capa_personalizada": "", 
        "albuns": [],
        "faixas": [],
        "data_criacao": datetime.now().strftime("%d/%m/%Y %H:%M")
    }
    listas_col.insert_one(nova_lista)
    return jsonify({"message": "Lista criada!"}), 201

@app.route('/api/listas/<lista_id>', methods=['GET', 'PATCH', 'DELETE'])
def gerenciar_lista(lista_id):
    if request.method == 'DELETE':
        listas_col.delete_one({"_id": ObjectId(lista_id)})
        return jsonify({"message": "Lista excluída!"}), 200
        
    elif request.method == 'PATCH':
        data = request.json
        campos = {}
        if 'titulo' in data: campos['titulo'] = data['titulo']
        if 'descricao' in data: campos['descricao'] = data['descricao']
        if 'capa_personalizada' in data: campos['capa_personalizada'] = data['capa_personalizada']
        
        listas_col.update_one({"_id": ObjectId(lista_id)}, {"$set": campos})
        return jsonify({"message": "Lista atualizada!"}), 200
        
    elif request.method == 'GET':
        lista = listas_col.find_one({"_id": ObjectId(lista_id)})
        if not lista: return jsonify({"error": "Lista não encontrada"}), 404
        
        lista['_id'] = str(lista['_id'])
        
        dono = usuarios_col.find_one({"id_user": lista['id_user']}, {"_id":0, "username":1, "nome":1, "imagem_url":1})
        lista['criador'] = dono
        
        albuns_completos = []
        if lista.get('albuns'):
            albuns_db = list(albuns_col.find({"id_album": {"$in": lista['albuns']}}, {"_id": 0}))
            albuns_db.sort(key=lambda x: lista['albuns'].index(x["id_album"]))
            
            for alb in albuns_db:
                art = artistas_col.find_one({"id_artista": alb["id_artista"]})
                alb["artist"] = art["name"] if art else "Desconhecido"
                albuns_completos.append(alb)
                
        lista['albuns_detalhados'] = albuns_completos
        return jsonify(lista), 200

@app.route('/api/listas/<lista_id>/albuns', methods=['POST'])
def adicionar_album_lista(lista_id):
    id_album = request.json.get("id_album")
    listas_col.update_one({"_id": ObjectId(lista_id)}, {"$addToSet": {"albuns": int(id_album)}})
    return jsonify({"message": "Álbum adicionado à lista!"}), 200

@app.route('/api/listas/<lista_id>/albuns/<int:id_album>', methods=['DELETE'])
def remover_album_lista(lista_id, id_album):
    listas_col.update_one({"_id": ObjectId(lista_id)}, {"$pull": {"albuns": int(id_album)}})
    return jsonify({"message": "Álbum removido da lista!"}), 200

@app.route('/api/listas/<lista_id>/faixas', methods=['POST'])
def adicionar_faixa_lista(lista_id):
    faixa = request.json.get("faixa")
    listas_col.update_one(
        {"_id": ObjectId(lista_id), "faixas.id": {"$ne": faixa["id"]}}, 
        {"$push": {"faixas": faixa}}
    )
    return jsonify({"message": "Música adicionada à lista!"}), 200

@app.route('/api/listas/<lista_id>/faixas/<int:id_faixa>', methods=['DELETE'])
def remover_faixa_lista(lista_id, id_faixa):
    listas_col.update_one({"_id": ObjectId(lista_id)}, {"$pull": {"faixas": {"id": id_faixa}}})
    return jsonify({"message": "Música removida da lista!"}), 200


# --- SISTEMA DE CHAT ---
messages_col = db["messages"]

@app.route('/api/chat/conversas/<int:id_user>', methods=['GET'])
def listar_conversas(id_user):
    """Lista todas as conversas do usuário, agrupadas pelo outro participante."""
    todas = list(messages_col.find({
        "$or": [{"id_remetente": id_user}, {"id_destinatario": id_user}]
    }).sort("_id", -1))

    # Agrupa pelo outro usuário mantendo a ordem (mais recente primeiro)
    conversas = {}
    for msg in todas:
        outro_id = msg["id_destinatario"] if msg["id_remetente"] == id_user else msg["id_remetente"]
        if outro_id not in conversas:
            conversas[outro_id] = {"ultima_msg": msg, "nao_lidas": 0}
        if not msg.get("lida") and msg["id_destinatario"] == id_user:
            conversas[outro_id]["nao_lidas"] += 1

    resultado = []
    for outro_id, conv in conversas.items():
        outro_user = usuarios_col.find_one({"id_user": outro_id}, {"_id": 0, "senha": 0})
        if not outro_user:
            continue
        msg = conv["ultima_msg"]
        resultado.append({
            "usuario": outro_user,
            "ultima_mensagem": {
                "_id": str(msg["_id"]),
                "texto": msg.get("texto", ""),
                "tipo": msg.get("tipo", "texto"),
                "data": msg.get("data", ""),
                "id_remetente": msg["id_remetente"],
                "lida": msg.get("lida", True)
            },
            "nao_lidas": conv["nao_lidas"]
        })

    return jsonify(resultado), 200


@app.route('/api/chat/mensagens/<int:id_user>/<int:id_outro>', methods=['GET'])
def historico_mensagens(id_user, id_outro):
    """Retorna o histórico completo de mensagens entre dois usuários."""
    msgs = list(messages_col.find({
        "$or": [
            {"id_remetente": id_user, "id_destinatario": id_outro},
            {"id_remetente": id_outro, "id_destinatario": id_user}
        ]
    }).sort("_id", 1))

    for msg in msgs:
        msg["_id"] = str(msg["_id"])

    return jsonify(msgs), 200


@app.route('/api/chat/mensagens', methods=['POST'])
def enviar_mensagem():
    """Envia uma nova mensagem (texto ou álbum recomendado)."""
    data = request.json
    id_remetente = data.get("id_remetente")
    id_destinatario = data.get("id_destinatario")
    texto = data.get("texto", "")
    tipo = data.get("tipo", "texto")
    album = data.get("album", None)

    if not id_remetente or not id_destinatario:
        return jsonify({"error": "Dados inválidos"}), 400

    nova_msg = {
        "id_remetente": id_remetente,
        "id_destinatario": id_destinatario,
        "texto": texto,
        "tipo": tipo,
        "lida": False,
        "data": (datetime.utcnow() - timedelta(hours=3)).strftime("%d/%m/%Y %H:%M")
    }
    if album:
        nova_msg["album"] = album

    result = messages_col.insert_one(nova_msg)
    nova_msg["_id"] = str(result.inserted_id)
    del nova_msg["_id"]  # Remove para evitar serialização dupla

    inserted = messages_col.find_one({"_id": result.inserted_id})
    inserted["_id"] = str(inserted["_id"])

    return jsonify(inserted), 201


@app.route('/api/chat/mensagens/ler/<int:id_user>/<int:id_outro>', methods=['PATCH'])
def marcar_mensagens_lidas(id_user, id_outro):
    """Marca todas as mensagens recebidas de id_outro como lidas."""
    messages_col.update_many(
        {"id_remetente": id_outro, "id_destinatario": id_user, "lida": False},
        {"$set": {"lida": True}}
    )
    return jsonify({"status": "sucesso"}), 200

# --- TRACK RATINGS ---

@app.route('/api/albuns/<int:id_album>/tracks/ratings', methods=['GET'])
def get_track_ratings(id_album):
    id_user = request.args.get('id_user', type=int)
    
    # calcula a nota media por faixa
    pipeline = [
        {"$match": {"id_album": id_album}},
        {"$group": {"_id": "$id_track", "media": {"$avg": "$nota"}}}
    ]
    medias_cursor = track_ratings_col.aggregate(pipeline)
    medias = {str(item["_id"]): round(item["media"], 1) for item in medias_cursor}
    
    # pega as notas q o user logado deu pra essas faixas (se aplicavel)
    user_ratings = {}
    if id_user:
        user_cursor = track_ratings_col.find({"id_album": id_album, "id_user": id_user})
        user_ratings = {str(r["id_track"]): r["nota"] for r in user_cursor}
        
    return jsonify({
        "medias": medias,
        "user_ratings": user_ratings
    }), 200

@app.route('/api/users/<int:id_user>/stats', methods=['GET'])
def user_stats(id_user):
    # Reviews de Álbuns
    reviews = list(criticas_col.find({"id_user": id_user, "excluida": {"$ne": True}}))
    total_albums = len(reviews)
    avg_album_rating = sum(r.get('nota', 0) for r in reviews) / total_albums if total_albums > 0 else 0
    
    # Distribuição de Notas (Álbuns)
    rating_distribution = {str(i / 2): 0 for i in range(1, 11)} # de 0.5 ate 5.0
    for r in reviews:
        nota = str(float(r.get('nota', 0)))
        if nota in rating_distribution:
            rating_distribution[nota] += 1
            
    # Artista Mais Ouvido
    album_ids = [r['id_album'] for r in reviews]
    albuns = list(albuns_col.find({"id_album": {"$in": album_ids}}))
    artist_counts = {}
    for a in albuns:
        artist_counts[a.get('artist', 'Desconhecido')] = artist_counts.get(a.get('artist', 'Desconhecido'), 0) + 1
        
    top_artist = max(artist_counts, key=artist_counts.get) if artist_counts else "Nenhum"
    
    # Avaliações de Faixas (Track Ratings)
    track_ratings = list(track_ratings_col.find({"id_user": id_user}))
    total_tracks = len(track_ratings)
    avg_track_rating = sum(t.get('nota', 0) for t in track_ratings) / total_tracks if total_tracks > 0 else 0
    
    return jsonify({
        "total_albums": total_albums,
        "avg_album_rating": round(avg_album_rating, 1),
        "total_tracks": total_tracks,
        "avg_track_rating": round(avg_track_rating, 1),
        "top_artist": top_artist,
        "rating_distribution": rating_distribution
    }), 200

@app.route('/api/albuns/<int:id_album>/tracks/<int:id_track>/rate', methods=['POST'])
def rate_track(id_album, id_track):
    data = request.json
    id_user = data.get('id_user')
    nota = data.get('nota')
    
    if not id_user or nota is None:
        return jsonify({"error": "Dados inválidos"}), 400
        
    track_ratings_col.update_one(
        {"id_user": id_user, "id_album": id_album, "id_track": id_track},
        {"$set": {"nota": nota}},
        upsert=True
    )
    
    return jsonify({"status": "sucesso"}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)