import urllib.request
import urllib.parse
import json
import random
from pymongo import MongoClient

# Conecta ao MongoDB 
client = MongoClient("mongodb://localhost:27017/")
db = client["scorefy_db"]

# Limpa tudo
print("Limpando banco de dados...")
db.users.delete_many({})
db.albums.delete_many({})
db.artists.delete_many({})
db.reviews.delete_many({})
db.playlists.delete_many({})
db.notifications.delete_many({})
db.lists.delete_many({})
db.track_ratings.delete_many({})
db.messages.delete_many({})

prefs = {"curtidas": True, "comentarios": True, "seguidores": True}

# Usuarios realistas
usuarios = [
    {"id_user": 1, "email": "lucas@ufop.br", "senha": "123", "username": "lucasfwx", "nome": "lucas", "bio": "hyperpop e r&b.", "localizacao": "SP", "imagem_url": "https://i.pinimg.com/736x/97/93/29/979329dc7dd788331cee69e96a43e9fa.jpg", "albuns_favoritos": [], "seguidores": [2, 3, 4], "seguindo": [2, 3], "pref_notificacoes": prefs},
    {"id_user": 2, "email": "maria@gmail.com", "senha": "123", "username": "mariacx_", "nome": "maria clara", "bio": "listening to lana del rey", "localizacao": "São Paulo, SP", "imagem_url": "https://i.pinimg.com/736x/c2/d4/aa/c2d4aa552dcbc841f686ff55e8c5cc23.jpg", "albuns_favoritos": [], "seguidores": [1, 3], "seguindo": [1, 4], "pref_notificacoes": prefs},
    {"id_user": 3, "email": "joao.indie@outlook.com", "senha": "123", "username": "jotapee", "nome": "joão", "bio": "fones de ouvido 24/7.", "localizacao": "RJ", "imagem_url": "https://i.pinimg.com/736x/9f/c5/6f/9fc56f19a167e5ea1b591581f1d2e355.jpg", "albuns_favoritos": [], "seguidores": [1, 2], "seguindo": [1, 2], "pref_notificacoes": prefs},
    {"id_user": 4, "email": "analu@yahoo.com", "senha": "123", "username": "anabxrros", "nome": "ana", "bio": "tudo que eu ouço vira minha personalidade", "localizacao": "BH", "imagem_url": "https://i.pinimg.com/736x/8e/87/ad/8e87ad9b1fb4f4cf3fc5820b0ad058f2.jpg", "albuns_favoritos": [], "seguidores": [2], "seguindo": [1], "pref_notificacoes": prefs},
    {"id_user": 5, "email": "felipe@gmail.com", "senha": "123", "username": "lipe_music", "nome": "felipe", "bio": "rock não morreu.", "localizacao": "PR", "imagem_url": "https://i.pinimg.com/736x/fe/e4/57/fee457a40374415ef1037034f3050341.jpg", "albuns_favoritos": [], "seguidores": [1], "seguindo": [1], "pref_notificacoes": prefs},
    {"id_user": 6, "email": "bea@hotmail.com", "senha": "123", "username": "beaxz", "nome": "bia", "bio": "opinando sobre álbuns que ninguém pediu.", "localizacao": "BA", "imagem_url": "https://i.pinimg.com/1200x/ae/ef/53/aeef53aed5cd212048f6a9ad9d9357c4.jpg", "albuns_favoritos": [], "seguidores": [1], "seguindo": [], "pref_notificacoes": prefs},
    {"id_user": 7, "email": "carlosdj@gmail.com", "senha": "123", "username": "virginiafonseca", "nome": "Cadu", "bio": "beats & synths", "localizacao": "SC", "imagem_url": "https://i.pinimg.com/736x/c4/d5/35/c4d53514d7eceb2eb211807066a101a2.jpg", "albuns_favoritos": [], "seguidores": [1], "seguindo": [], "pref_notificacoes": prefs},
    {"id_user": 8, "email": "fe.lima@uol.com.br", "senha": "123", "username": "fernanda_", "nome": "nanda", "bio": "só pop de qualidade.", "localizacao": "PE", "imagem_url": "https://i.pinimg.com/1200x/1a/38/8f/1a388fdc7362b6f88176096b14922ef8.jpg", "albuns_favoritos": [], "seguidores": [], "seguindo": [2], "pref_notificacoes": prefs},
    {"id_user": 9, "email": "rafael@email.com", "senha": "123", "username": "fael", "nome": "fael", "bio": "entusiasta de musica", "localizacao": "MG", "imagem_url": "https://i.pinimg.com/736x/c8/f7/dc/c8f7dce8802e30883da7366ae1437f95.jpg", "albuns_favoritos": [], "seguidores": [3], "seguindo": [], "pref_notificacoes": prefs},
    {"id_user": 10, "email": "julia@gmail.com", "senha": "123", "username": "julhinhas", "nome": "ju", "bio": "respeito o gosto de todo mundo menos de quem ouve taylor swift", "localizacao": "DF", "imagem_url": "https://i.pinimg.com/736x/15/8d/b6/158db626e765b345d10f11a0483a7e1c.jpg", "albuns_favoritos": [], "seguidores": [], "seguindo": [], "pref_notificacoes": prefs},
    {"id_user": 11, "email": "gabriel@gmail.com", "senha": "123", "username": "tavo", "nome": "tav", "bio": "chorao", "localizacao": "AM", "imagem_url": "https://i.pinimg.com/736x/55/37/cd/5537cd22b6075fb4c40bf479a2a524ae.jpg", "albuns_favoritos": [], "seguidores": [], "seguindo": [], "pref_notificacoes": prefs}
]

db.users.insert_many(usuarios)
print("Usuários inseridos.")

# IDs dos albuns no Deezer
albums_ids = {
    "billie_hmhas": 586786102,
    "olivia_sour": 231552772,
    "olivia_guts": 484372295,
    "ariana_eternal": 556294552,
    "taylor_folklore": 162683632,
    "pinkpantheress": 508390151,
    "zara_venus": 544141312,
    "marina_vicio": 431239617,
    "badbunny_verano": 316164367,
    "travis_utopia": 469682765,
    "newjeans_getup": 466106885,
    "aespa_armageddon": 653112011,
    "paramore_tiw": 403447057,
    "linkin_meteora": 1346746,
    "the_weeknd_after_hours": 137272602,
    "dua_lipa_fn": 182811182,
    "sza_sos": 383703577,
    "kendrick_tpab": 9896728,
    "arctic_am": 6899610,
    "gaga_fame_monster": 107877682,
    "rosalia_motomami": 302867697,
    "charli_brat": 597350882,
    "chappell_roan": 488063815,
    "luisa_escandalo": 480890205,
    "jao_super": 474461765,
    "pabllo_batidao": 660710051,
    "liniker_caju": 713384901,
    "matue_maquina": 166848802,
    "beyonce_cowboy": 565889181,
    "sabrina_sns": 631839161,
    "tyla_tyla": 561878142,
    "troye_sivan": 458913455,
    "tate_mcrae": 519889932,
    "dua_radical": 579783251,
    "gracie_abrams": 603616662,
    "olivia_new": 1002561451,
    "badbunny_nadie": 693008911,
    "single_wink": 1011886121,
    "single_guess": 623577791,
    "single_jeep": 972329021,
    "single_hate": 991609961,
    "single_morning": 1020773921,
    "single_dracula": 910510411
}

# Realistas Reviews
reviews_data = [
    # Billie Eilish - HMHAS
    {"id_album": albums_ids["billie_hmhas"], "id_user": 11, "nota": 5, "texto": "A evolução da Billie nesse álbum é absurda. A produção do Finneas nunca esteve tão limpa e criativa. LUNCH e The Greatest são definitivamente os pontos altos do disco.", "respostas": ["Parei pra ver a letra de the greatest e to assim https://media.tenor.com/sl4Ug_fDbLAAAAAM/sigh.gif", "Lunch é literalmente a pior do álbum... https://i.imgur.com/CfkBpuA.gif"]},
    {"id_album": albums_ids["billie_hmhas"], "id_user": 2, "nota": 4.5, "texto": "obrigado billie por fazer um album onde vc finalmente canta com vontade, the greatest me fez levitar no quarto", "respostas": ["eu real achei q ia voar na hora da transição kkkk", "os vocais de anjo"]},
    {"id_album": albums_ids["billie_hmhas"], "id_user": 6, "nota": 5, "texto": "ela nao erra nunca impressionante", "respostas": ["simplesmente a maior"]},
    
    # Olivia Rodrigo - SOUR
    {"id_album": albums_ids["olivia_sour"], "id_user": 10, "nota": 4, "texto": "a olivia me fez ter raiva de um ex que eu nunca tive", "respostas": ["kkkkk ne, brutal tocou na alma", "joshua basset vc me paga"]},
    {"id_album": albums_ids["olivia_sour"], "id_user": 8, "nota": 5, "texto": "Traitor é uma das melhores composições pop recentes. O álbum inteiro captura muito bem a sensação caótica de ser adolescente.", "respostas": ["Traitor realmente destrói qualquer um."]},
    
    # Olivia Rodrigo - GUTS
    {"id_album": albums_ids["olivia_guts"], "id_user": 2, "nota": 4.5, "texto": "ela virou a avril lavigne da nossa geraçao e isso é um elogio gigante. bad idea right é mto viciante socorro", "respostas": ["total vibe anos 2000 amo", "guitarras roubaram a cena"]},
    {"id_album": albums_ids["olivia_guts"], "id_user": 3, "nota": 3.5, "texto": "É uma sequência segura. Não muda muito a fórmula do primeiro álbum, mas faixas como Teenage Dream mostram que ela tem muito talento compondo no piano.", "respostas": ["As baladas finais são as melhores."]},
    
    # Ariana Grande - Eternal Sunshine
    {"id_album": albums_ids["ariana_eternal"], "id_user": 8, "nota": 5, "texto": "Max Martin e Ariana formam uma dupla imbatível. O álbum flui incrivelmente bem e We Can't Be Friends é de longe a melhor música pop do ano.", "respostas": ["Ela sabe muito, to em duvida ainda de qual gostei mais https://media.tenor.com/f3HCyM-czyoAAAAM/acheimagra-stan-twitter.gif"]},
    {"id_album": albums_ids["ariana_eternal"], "id_user": 4, "nota": 4.5, "texto": "a ariana fazendo um album inteiro baseado naquele filme do jim carrey foi a coisa mais genial q ela ja fez", "respostas": ["we cant be friends me faz chorar muito", "o conceito ta maravilhoso"]},
    
    # Taylor Swift - Folklore
    {"id_album": albums_ids["taylor_folklore"], "id_user": 2, "nota": 5, "texto": "quem diria que um isolamento na cabana faria ela criar a maior obra de arte da decada ne. august me deixa em pedaços", "respostas": ["august e cardigan sao um evento canonico", "melhor fase dela"]},
    {"id_album": albums_ids["taylor_folklore"], "id_user": 5, "nota": 4.5, "texto": "A mudança pro indie folk foi o maior acerto da carreira dela. A produção do Aaron Dessner combinada com a habilidade dela de contar histórias criou um álbum inesquecível.", "respostas": ["A atmosfera acústica é perfeita."]},
    
    # PinkPantheress
    {"id_album": albums_ids["pinkpantheress"], "id_user": 7, "nota": 4, "texto": "se as musicas tivessem mais de 1 minuto e meio seria 5 estrelas", "respostas": ["kkkk juro, acaba qndo ta ficando bom", "estetica maravilhosa pelo menos"]},
    
    # Zara Larsson
    {"id_album": albums_ids["zara_venus"], "id_user": 8, "nota": 3.5, "texto": "Um álbum pop bem divertido e direto ao ponto. Can't Tame Her tem uma vibe anos 80 incrível pra tocar em festas.", "respostas": ["Ótimo pra ouvir na academia ou no carro.", "Cumpre bem a função de pop despretensioso."]},
    
    # Marina Sena
    {"id_album": albums_ids["marina_vicio"], "id_user": 6, "nota": 5, "texto": "A produção desse álbum é absurda. A mistura de pop contemporâneo com elementos de MPB e batidas bem marcadas funcionou muito bem. Tudo Pra Amar Você é contagiante.", "respostas": ["Melhorou muito em relação ao primeiro álbum.", "Os graves nas músicas estão sensacionais."]},
    {"id_album": albums_ids["marina_vicio"], "id_user": 9, "nota": 4.5, "texto": "marina vc é patrimonio historico brasileiro", "respostas": ["diva ne", "o grave bate forte demais"]},
    
    # Bad Bunny
    {"id_album": albums_ids["badbunny_verano"], "id_user": 9, "nota": 5, "texto": "eu nem falo espanhol mas passei o verao todo cantando titi me pregunto igual um nativo. benito o maior do mundo apenas", "respostas": ["kkkk real, impossivel n viciar", "melhor album da carreira facil"]},
    
    # Travis Scott
    {"id_album": albums_ids["travis_utopia"], "id_user": 9, "nota": 4, "texto": "As batidas são incrivelmente pesadas e complexas. Fica evidente a inspiração no Yeezus do Kanye West, mas o Travis consegue colocar a própria assinatura. Fein é insana.", "respostas": ["A produção é impecável do começo ao fim.", "Fein ao vivo deve ser uma experiência absurda."]},
    
    # NewJeans
    {"id_album": albums_ids["newjeans_getup"], "id_user": 10, "nota": 5, "texto": "super shy tocando no repeat no meu cerebro faz 6 meses. elas salvaram o kpop", "respostas": ["a coreografia vive alugada na minha cabeça", "melhor girlgroup hj em dia"]},
    
    # Aespa
    {"id_album": albums_ids["aespa_armageddon"], "id_user": 10, "nota": 4.5, "texto": "Uma das melhores produções de pop eletrônico do ano. Supernova mistura vocais potentes com instrumentais super experimentais que lembram o hyperpop.", "respostas": ["Os sintetizadores estão muito pesados, combinou demais."]},
    {"id_album": albums_ids["aespa_armageddon"], "id_user": 5, "nota": 5, "texto": "su su su supernova literalmente abduzida pelas divas coreanas", "respostas": ["kkkkk muito boa"]},
    
    # Paramore
    {"id_album": albums_ids["paramore_tiw"], "id_user": 5, "nota": 4.5, "texto": "A transição deles para um som mais puxado pro pós-punk foi excelente. As guitarras estão muito rítmicas e as letras sobre ansiedade são bastante realistas e maduras.", "respostas": ["Hayley continua entregando muito nos vocais."]},
    {"id_album": albums_ids["paramore_tiw"], "id_user": 8, "nota": 4, "texto": "30 anos nas costas e chorando por musica de ex emo, nada mudou", "respostas": ["a gnt amadureceu junto com eles pelo menos kkk"]},
    
    # Linkin Park
    {"id_album": albums_ids["linkin_meteora"], "id_user": 1, "nota": 5, "texto": "Um clássico incontestável do nu metal. A forma como eles misturaram rap, rock pesado e batidas eletrônicas marcou os anos 2000. Numb e Faint não envelheceram um dia sequer.", "respostas": ["Chester faz uma falta enorme."]},
    {"id_album": albums_ids["linkin_meteora"], "id_user": 5, "nota": 5, "texto": "se vc não gritou crawling in my skin no chuveiro vc nao viveu os anos 2000 direito", "respostas": ["fato historico", "melhor album deles disparado"]},

    # Charli XCX - Brat
    {"id_album": albums_ids["charli_brat"], "id_user": 6, "nota": 5, "texto": "brat summer é um estilo de vida, quem não entendeu von dutch está vivendo errado.", "respostas": ["só quem tem o espirito da charli entende", "bumping that"]},
    {"id_album": albums_ids["charli_brat"], "id_user": 2, "nota": 4.5, "texto": "O melhor álbum focado em música de boate do ano. As batidas são sujas, pesadas e intensas, mas no fundo as letras são super vulneráveis e falam sobre as inseguranças dela de forma muito honesta.", "respostas": ["A quebra de expectativa entre as batidas de rave e as faixas mais acústicas é muito interessante."]},

    # Chappell Roan
    {"id_album": albums_ids["chappell_roan"], "id_user": 10, "nota": 5, "texto": "finalmente as lésbicas tem o seu próprio david bowie. que album maluco e divertido", "respostas": ["kkkkk a definicao perfeita", "hot to go hino nacional"]},

    # Rosalía
    {"id_album": albums_ids["rosalia_motomami"], "id_user": 9, "nota": 5, "texto": "A desconstrução que ela fez nesse álbum é genial. Misturar flamenco tradicional com batidas distorcidas de reggaeton e jazz foi um risco gigante que compensou demais. Um disco único.", "respostas": ["O design de som é super experimental."]},

    # Kendrick Lamar
    {"id_album": albums_ids["kendrick_tpab"], "id_user": 1, "nota": 5, "texto": "Um dos álbuns mais importantes da história do hip hop. As instrumentações com jazz ao vivo são ricas em detalhes e as rimas são dignas de prêmios literários. Alright é um clássico absoluto.", "respostas": ["Musicalmente denso e perfeitamente bem escrito."]},
    {"id_album": albums_ids["kendrick_tpab"], "id_user": 7, "nota": 5, "texto": "falar o q? o cara simplesmente recriou o jazz rap moderno", "respostas": ["gênio não tem como", "muito cedo pra falar maior de todos os tempos? https://media.tenor.com/prT_agJ7F98AAAAM/the-rock-the-rock-sus.gif"]},

    # SZA
    {"id_album": albums_ids["sza_sos"], "id_user": 4, "nota": 4.5, "texto": "eu perdoaria uma traição ouvindo isso aq", "respostas": ["kkkk pior q eu tb", "a voz dela te convence de qlqer coisa"]},

    # The Weeknd
    {"id_album": albums_ids["the_weeknd_after_hours"], "id_user": 7, "nota": 5, "texto": "O conceito visual e musical de After Hours é a perfeição. Ele pegou a inspiração dos anos 80 e conseguiu fazer soar super obscuro e moderno. Blinding Lights não fez tanto sucesso à toa.", "respostas": ["Os sintetizadores nesse disco são incríveis."]},

    # Lady Gaga
    {"id_album": albums_ids["gaga_fame_monster"], "id_user": 8, "nota": 5, "texto": "bad romance inventou a musica pop ngm tira da minha cabeça, se n fosse isso a industria seria tao chata hj", "respostas": ["gaga mudou a historia msm", "fatos atras de fatos"]},

    # Arctic Monkeys
    {"id_album": albums_ids["arctic_am"], "id_user": 3, "nota": 4, "texto": "esse album inteiro tem cheiro de cigarro e jaqueta de couro kkk mt bom.", "respostas": ["kkkk exato", "tumblr 2014 puro"]},

    # Luísa Sonza
    {"id_album": albums_ids["luisa_escandalo"], "id_user": 6, "nota": 4, "texto": "O disco mostra uma grande evolução musical. A forma como ela transita entre faixas puramente pop e arranjos mais complexos influenciados por bossa nova é admirável.", "respostas": ["Os instrumentais de fundo estão muito bem trabalhados."]},
    
    # Jão
    {"id_album": albums_ids["jao_super"], "id_user": 4, "nota": 4, "texto": "chorando deitado no chao gelado ouvindo alinhamento milenar normal terça feira", "respostas": ["ele ama fazer a gnt sofrer", "eu sofro em publico nos shows dele"]},

    # Pabllo Vittar
    {"id_album": albums_ids["pabllo_batidao"], "id_user": 8, "nota": 5, "texto": "Uma homenagem fantástica ao tecnobrega, calypso e forró. O álbum consegue modernizar esses estilos regionais e colocar batidas eletrônicas sem perder a essência. Divertido e muito bem produzido.", "respostas": ["A forma como os ritmos foram misturados é genial.", "Muito ritmo e energia."]},

    # Liniker
    {"id_album": albums_ids["liniker_caju"], "id_user": 6, "nota": 5, "texto": "só um chá quente nesse friozinho ouvindo caju pra me curar", "respostas": ["vibe total de domingo a tarde", "voz impecavel essa mulher tem"]},

    # Matuê
    {"id_album": albums_ids["matue_maquina"], "id_user": 9, "nota": 4.5, "texto": "Mudou completamente a cara do rap e trap nacional. A produção psicodélica com graves potentes e o uso criativo do auto-tune viraram referência para todo mundo que veio depois.", "respostas": ["O impacto desse disco na cena é gigante."]},

    # Sabrina Carpenter
    {"id_album": albums_ids["sabrina_sns"], "id_user": 2, "nota": 4.5, "texto": "a gata finalmente decolou ne, os trocadilhos q ela faz nas musicas sao bom dmais mds espresso é o som de quem vive a vida mansa", "respostas": ["kkkkk vdd", "pop perfection, ela hitou mt"]},

    # Beyoncé
    {"id_album": albums_ids["beyonce_cowboy"], "id_user": 1, "nota": 5, "texto": "A construção desse álbum é colossal. Ela explora a fundo a raiz negra da música country e entrega vocais fantásticos acompanhados de corais e instrumentais impecáveis.", "respostas": ["Uma pesquisa musical maravilhosa transformada em arte."]},

    # Tyla
    {"id_album": albums_ids["tyla_tyla"], "id_user": 6, "nota": 4.5, "texto": "que album delicinha, bota pra tocar enquanto arruma a casa e tu vira uma diva pop limpando as janelas", "respostas": ["mds sim kkkkk", "water me pegou mt"]},

    # Troye Sivan
    {"id_album": albums_ids["troye_sivan"], "id_user": 4, "nota": 4, "texto": "Um excelente projeto focado em música dance e house. O ritmo é contagiante e a energia de clube noturno é muito bem mantida através das faixas. Muito bom para festas.", "respostas": ["Rush tem uma batida muito imersiva."]},

    # Tate McRae
    {"id_album": albums_ids["tate_mcrae"], "id_user": 8, "nota": 4, "texto": "ela jura que é a britney spears mas no bom sentido kkk greedy tem cara de hit de 2011 q saudade q eu tava disso", "respostas": ["o pop q eu tava precisando real"]},

    # Dua Lipa
    {"id_album": albums_ids["dua_radical"], "id_user": 2, "nota": 4, "texto": "As linhas de baixo desse álbum são fenomenais. Ela optou por uma abordagem mais orgânica, com influências sutis de psicodelia, resultando em um pop despretensioso e de muita qualidade.", "respostas": ["A gravação dos instrumentais ao vivo fez toda a diferença."]},

    # Gracie Abrams
    {"id_album": albums_ids["gracie_abrams"], "id_user": 10, "nota": 4.5, "texto": "o psiquiatra me proibiu de ouvir esse aqui", "respostas": ["choro livre ouvindo ela ne", "A ponte de I Love You, I'm Sorry é doida demais kkk"]},
    
    # Olivia Rodrigo - you seem pretty sad for a girl so in love
    {"id_album": albums_ids["olivia_new"], "id_user": 2, "nota": 5, "texto": "Ela não cansa de fazer hino triste que destrói a gente. A produção minimalista deixou a voz dela brilhar como nunca.", "respostas": ["Essa doeu na alma.", "Ela tem o dom de ler diários alheios e transformar em música!"]},
    {"id_album": albums_ids["olivia_new"], "id_user": 4, "nota": 4.5, "texto": "olivia rodrigo pagando minha terapia amanhã pq esse album me quebrou", "respostas": []},
    {"id_album": albums_ids["olivia_new"], "id_user": 8, "nota": 4, "texto": "Mais um projeto onde ela mostra sua vulnerabilidade e acerta em cheio. Tem algumas repetições, mas no geral é belíssimo.", "respostas": []},

    # Bad Bunny - Nadie Sabe
    {"id_album": albums_ids["badbunny_nadie"], "id_user": 9, "nota": 4.5, "texto": "o coelho mau voltou pro trap raiz e eu to muito feliz com isso, monaco é hit absoluto", "respostas": ["ele no trap é incomparável", "beat muito sujo, amei"]},
    {"id_album": albums_ids["badbunny_nadie"], "id_user": 7, "nota": 4, "texto": "As transições de beat ao longo do álbum são espetaculares. Ele sabe produzir um disco que funciona tanto pra ouvir de fone quanto na balada.", "respostas": []},

    # Singles Diversos
    {"id_album": albums_ids["single_wink"], "id_user": 10, "nota": 4.5, "texto": "A melhor até agora das tres musicas que ela lançou pra esse album, vamo ver se é tudo isso mesmo dona charli.", "respostas": []},
    {"id_album": albums_ids["single_guess"], "id_user": 11, "nota": 5, "texto": "A química da Charli com a Billie nessa faixa foi simplesmente insana. O verso da Billie mudou vidas.", "respostas": ["GUESS GUESS GUESS GUESS!!!!!", "tô no repeat desde que lançou!"]},
    {"id_album": albums_ids["single_jeep"], "id_user": 9, "nota": 4, "texto": "Letra muito camp meu deus foi tudo o que eu pedi", "respostas": []},
    {"id_album": albums_ids["single_hate"], "id_user": 4, "nota": 5, "texto": "odeio que essa música viciou tanto a minha cabeça, melodia muito grudenta", "respostas": []},
    {"id_album": albums_ids["single_morning"], "id_user": 7, "nota": 4, "texto": "Amei que ela finalmente lançou essa, nao aguentava mais ouvir só pelo tiktok.", "respostas": []},
    {"id_album": albums_ids["single_dracula"], "id_user": 5, "nota": 4.5, "texto": "Jennie salvou essa música do fracasso.", "respostas": []}
]

print("Baixando álbuns do Deezer e injetando reviews...")
for rev in reviews_data:
    album_id = rev["id_album"]
    
    # Força o backend a buscar e cachear o álbum do Deezer
    try:
        url = f"http://localhost:5000/api/albuns/{album_id}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
    except Exception as e:
        print(f"Erro ao baixar álbum {album_id}: {e}")
        
    # Usa o endpoint de postar review nativo
    try:
        # Envia as configs basicas da review
        review_payload = {
            "id_album": rev["id_album"],
            "id_user": rev["id_user"],
            "nota": rev["nota"],
            "texto": rev["texto"]
        }
        data = json.dumps(review_payload).encode('utf-8')
        req_post = urllib.request.Request("http://localhost:5000/api/reviews", data=data, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req_post)
    except Exception as e:
        print(f"Erro ao postar review do álbum {album_id}: {e}")

print("Injetando curtidas e respostas...")
# Pegar todas as reviews inseridas no mongo
all_reviews = list(db.reviews.find({}))
all_user_ids = [1,2,3,4,5,6,7,8,9,10,11]

for review in all_reviews:
    # 1 a 4 curtidas aleatórias
    num_likes = random.randint(1, 4)
    likers = random.sample([uid for uid in all_user_ids if uid != review["id_user"]], num_likes)
    
    for liker in likers:
        try:
            req_like = urllib.request.Request(f"http://localhost:5000/api/reviews/{str(review['_id'])}/curtir", data=json.dumps({"id_user_logado": liker}).encode('utf-8'), headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req_like)
        except:
            pass

    # Tenta achar a definição da review no array original pra pegar as respostas específicas
    original_rev = next((item for item in reviews_data if item["texto"] == review["texto"]), None)
    
    if original_rev and "respostas" in original_rev and original_rev["respostas"]:
        # Se for pra adicionar resposta, adiciona todas as que estiverem lá para criar threads maiores
        if random.random() < 0.8:
            for reply_text in original_rev["respostas"]:
                replier = random.choice([uid for uid in all_user_ids if uid != review["id_user"]])
                
                reply_payload = {
                    "id_user": replier,
                    "texto": reply_text
                }
                
                try:
                    req_reply = urllib.request.Request(f"http://localhost:5000/api/reviews/{str(review['_id'])}/responder", data=json.dumps(reply_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                    urllib.request.urlopen(req_reply)
                except:
                    pass

print("Gerando track ratings para os álbuns da Olivia Rodrigo e Billie Eilish...")
# Gerar track ratings para Olivia Rodrigo e Billie Eilish
for alb_id in [albums_ids["olivia_new"], albums_ids["billie_hmhas"]]:
    alb_doc = db.albuns.find_one({"id_album": alb_id})
    if alb_doc and "tracks" in alb_doc:
        for t in alb_doc["tracks"]:
            for uid in random.sample(all_user_ids, 5): # 5 usuários dão nota pras faixas
                nota = random.choice([3, 3.5, 4, 4.5, 5])
                db.track_ratings.insert_one({
                    "id_user": uid,
                    "id_album": alb_id,
                    "id_track": t["id"],
                    "nota": nota
                })

print("Banco populado com sucesso e reviews/interações contextuais inseridas!")