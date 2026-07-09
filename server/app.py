from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import re
from bson import ObjectId

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
    termo = request.args.get('q', '')
    if not termo:
        return jsonify({"artistas": [], "albuns": [], "usuarios": []}), 200

    artistas = list(artistas_col.find({"name": {"$regex": termo, "$options": "i"}}, {"_id": 0}))

    filtro_albuns = {
        "$or": [
            {"title": {"$regex": termo, "$options": "i"}},
            {"genre": {"$regex": termo, "$options": "i"}}
        ]
    }

    try:
        ano_busca = int(termo)
        filtro_albuns["$or"].append({"year": ano_busca})
    except ValueError:
        pass

    albuns = list(albuns_col.find(filtro_albuns, {"_id": 0}))

    for art in artistas:
        albuns_do_artista = list(albuns_col.find({"id_artista": art.get("id_artista")}, {"_id": 0}))
        for album in albuns_do_artista:
            if album not in albuns: 
                albuns.append(album)

    for album in albuns:
        artista_db = artistas_col.find_one({"id_artista": album.get("id_artista")})
        album["artist"] = artista_db["name"] if artista_db else "Desconhecido"

    usuarios = list(usuarios_col.find({
        "$or": [
            {"username": {"$regex": termo, "$options": "i"}},
            {"nome": {"$regex": termo, "$options": "i"}}
        ]
    }, {"_id": 0, "senha": 0})) 

    return jsonify({"artistas": artistas, "albuns": albuns, "usuarios": usuarios}), 200

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
    criticas_col.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": {"excluida": True, "texto": "Esta review foi excluída pelo autor", "nota": 0}}
    )
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
    album = albuns_col.find_one({"id_album": id_album}, {"_id": 0})
    if not album: return jsonify({"error": "Álbum não encontrado"}), 404

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

# --- INTERAÇÕES E NOTIFICAÇÕES ---
@app.route('/api/reviews/<review_id>/curtir', methods=['POST'])
def curtir_review(review_id):
    data = request.json
    id_user_curtiu = data.get('id_user')
    
    # busca quem está curtindo no banco
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
    
    uma_semana = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
    pipeline_trending = [
        {"$match": {"data_postagem": {"$gte": uma_semana}}},
        {"$group": {"_id": "$id_album", "contagem": {"$sum": 1}}},
        {"$sort": {"contagem": -1}},
        {"$limit": 8}
    ]
    trending_agregados = list(criticas_col.aggregate(pipeline_trending))

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
        lista_top = list(albuns_col.find({}, {"_id": 0}).skip(8).limit(8))
        for x in lista_top:
             art = artistas_col.find_one({"id_artista": x["id_artista"]})
             x["artist"] = art["name"] if art else "Desconhecido"
             reviews = list(criticas_col.find({"id_album": x["id_album"]}))
             notas = [r['nota'] for r in reviews if 'nota' in r]
             x["rating"] = round(sum(notas) / len(notas), 1) if notas else 0.0

    return jsonify({
        "trending": lista_trending,
        "top_rated": lista_top,
        "new_releases": novos_lancamentos
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
    uma_semana_atras = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
    pipeline = [
        {"$match": {"data_postagem": {"$gte": uma_semana_atras}}},
        {"$group": {"_id": "$id_album", "contagem": {"$sum": 1}}},
        {"$sort": {"contagem": -1}},
        {"$limit": 50} 
    ]
    ids = list(criticas_col.aggregate(pipeline))
    if not ids: 
        fallback = list(albuns_col.find({}, {"_id": 0}).sort("year", -1).limit(20))
        return jsonify(formatar_albuns(fallback))
    return jsonify(formatar_albuns(ids))

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
            "albuns": 1,
            "data_criacao": 1,
            "capa_personalizada": 1,
            "capas": {
                "$slice": [
                    {"$map": {"input": "$detalhes_albuns", "as": "a", "in": "$$a.image"}},
                    4
                ]
            }
        }},
        {"$sort": {"data_criacao": -1}}
    ]))

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

    if not campos_atualizar: return jsonify({"message": "Nada para atualizar"}), 200

    result = usuarios_col.update_one({"id_user": id_user}, {"$set": campos_atualizar})
    if result.matched_count == 0: return jsonify({"error": "Usuário não encontrado"}), 404

    user_atualizado = usuarios_col.find_one({"id_user": id_user}, {"_id": 0, "senha": 0})
    return jsonify({"message": "Dados atualizados com sucesso!", "user": user_atualizado}), 200

@app.route('/api/artistas/nome/<string:nome_artista>', methods=['GET'])
def detalhes_artista_por_nome(nome_artista):
    artista = artistas_col.find_one({"name": {"$regex": f"^{nome_artista}$", "$options": "i"}}, {"_id": 0})
    if not artista: return jsonify({"error": "Artista não encontrado"}), 404

    id_artista = artista.get("id_artista")
    albuns = list(albuns_col.find({"id_artista": id_artista}, {"_id": 0}))

    total_notas = []
    for album in albuns:
        reviews = list(criticas_col.find({"id_album": album["id_album"]}))
        for r in reviews:
            if 'nota' in r: total_notas.append(r['nota'])
        
        notas_album = [r['nota'] for r in reviews if 'nota' in r]
        album["rating"] = round(sum(notas_album) / len(notas_album), 1) if notas_album else 0.0

    media_artista = round(sum(total_notas) / len(total_notas), 1) if total_notas else 0.0

    return jsonify({"artista": artista, "media_geral": media_artista, "albuns": albuns}), 200

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
        "capa_personalizada": "", 
        "albuns": [],
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


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)