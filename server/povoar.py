from pymongo import MongoClient

# Conecta ao MongoDB 
client = MongoClient("mongodb://mongodb:27017/")
db = client["scorefy_db"]

# Primeiro de tudo resetamos os dados do banco
db.users.delete_many({})
db.albums.delete_many({})
db.artists.delete_many({})
db.reviews.delete_many({})
db.playlists.delete_many({})
db.reviews.delete_many({})
db.notifications.delete_many({})
db.lists.delete_many({})

# Povoamento de Artistas
db.artists.insert_many([
    {"id_artista": 1, "name": "Linkin Park", "bio": "Banda de Nu Metal americana formada em California", "genre": "Nu Metal", "country": "EUA", "formed_year": 1996, "image_url": "https://cdn-images.dzcdn.net/images/artist/cc73698ecf7d3ce03f3b1079888d9c03/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 2, "name": "Billie Eilish", "bio": "Cantora e compositora de pop alternativo norte americana", "genre": "Pop", "country": "EUA", "formed_year": 2015, "image_url": "https://cdn-images.dzcdn.net/images/artist/8eab1a9a644889aabaca1e193e05f984/500x500.jpg"},
    {"id_artista": 3, "name": "Taylor Swift", "bio": "Cantora e compositora americana conhecida por misturar pop e country com letras autobiograficas", "genre": "Pop", "country": "EUA", "formed_year": 2006, "image_url": "https://thebackstage-deezer.com/wp-content/uploads/2024/07/taylor-swift3-500x463.jpg"},
    {"id_artista": 4, "name": "The Beatles", "bio": "Banda britanica de rock considerada uma das mais influentes da historia da musica", "genre": "Rock", "country": "Reino Unido", "formed_year": 1960, "image_url": "https://cdn-images.dzcdn.net/images/artist/fe9eb4463ea87452e84ed97e0c86b878/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 5, "name": "Nirvana", "bio": "Banda de grunge formada em Seattle que marcou os anos 90", "genre": "Grunge", "country": "EUA", "formed_year": 1987, "image_url": "https://cdn-images.dzcdn.net/images/artist/3ec5542ff520ee74e2befdaba32ef2ef/1900x1900-000000-81-0-0.jpg"},
    {"id_artista": 6, "name": "Legiao Urbana", "bio": "Banda brasileira de rock formada em Brasilia com letras marcantes e politicas", "genre": "Rock", "country": "Brasil", "formed_year": 1982, "image_url": "https://cdn-images.dzcdn.net/images/artist/27331b5535cf5a8fd0cece324c201a18/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 7, "name": "Dua Lipa", "bio": "Cantora britanica de pop conhecida por sucessos internacionais e estilo moderno", "genre": "Pop", "country": "Reino Unido", "formed_year": 2015, "image_url": "https://cdn-images.dzcdn.net/images/cover/da320055ebaebd2391445b7624d6fe7f/0x1900-000000-80-0-0.jpg"},
    {"id_artista": 8, "name": "Marina Sena", "bio": "Cantora brasileira de pop alternativo com sonoridade influenciada por musica brasileira", "genre": "Pop", "country": "Brasil", "formed_year": 2021, "image_url": "https://cdn-images.dzcdn.net/images/artist/0026ccb932df7c793d04cc72e950dad1/500x500.jpg"},
    {"id_artista": 9, "name": "Drake", "bio": "Rapper e cantor canadense conhecido por misturar hip hop e RnB", "genre": "Hip Hop", "country": "Canada", "formed_year": 2009, "image_url": "https://cdn-images.dzcdn.net/images/artist/5d2fa7f140a6bdc2c864c3465a61fc71/1900x1900-000000-81-0-0.jpg"},
    {"id_artista": 10, "name": "Lady Gaga", "bio": "Cantora e atriz americana conhecida por performances ousadas e sucessos no pop", "genre": "Pop", "country": "EUA", "formed_year": 2008, "image_url": "https://cdn-images.dzcdn.net/images/artist/7565262f7661b0d762621a8d69ba6f49/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 11, "name": "Arctic Monkeys", "bio": "Banda britanica de indie rock formada em Sheffield", "genre": "Rock", "country": "Reino Unido", "formed_year": 2002, "image_url": "https://cdn-images.dzcdn.net/images/artist/6c03e4c7c36800897fd468633286db24/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 12, "name": "Paramore", "bio": "Banda americana de pop punk liderada por Hayley Williams", "genre": "Pop Punk", "country": "EUA", "formed_year": 2004, "image_url": "https://cdn-images.dzcdn.net/images/artist/60dc1956a36a5e552384b4a32b0cbf9b/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 13, "name": "Bad Bunny", "bio": "Cantor porto riquenho de reggaeton e trap latino com grande impacto global", "genre": "Reggaeton", "country": "Porto Rico", "formed_year": 2016, "image_url": "https://cdn-images.dzcdn.net/images/artist/45aaf836629158d714432ae37e552ee7/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 14, "name": "Evanescence", "bio": "Banda americana de rock com influencias de metal e vocal feminino marcante", "genre": "Rock", "country": "EUA", "formed_year": 1995, "image_url": "https://cdn-images.dzcdn.net/images/artist/f833f7b583847c251f0286961f338551/500x500.jpg"},
    {"id_artista": 15, "name": "Travis Scott", "bio": "Rapper e produtor americano conhecido por estilo experimental no hip hop", "genre": "Hip Hop", "country": "EUA", "formed_year": 2013, "image_url": "https://cdn-images.dzcdn.net/images/cover/b8be81921aa5990f1cd3b7499d4d6501/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 16, "name": "Charlie Brown Jr", "bio": "Banda brasileira de rock que mistura skate punk rap e reggae", "genre": "Rock", "country": "Brasil", "formed_year": 1992, "image_url": "https://cdn-images.dzcdn.net/images/artist/1a2e562dde23cdbd9abea4bae13eb4fc/500x500.jpg"},
    {"id_artista": 17, "name": "Ivete Sangalo", "bio": "Cantora brasileira de axe e musica pop com forte presenca no carnaval", "genre": "Axe", "country": "Brasil", "formed_year": 1993, "image_url": "https://cdn-images.dzcdn.net/images/artist/79b386e807cd2ffbfb85d9dfe94207aa/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 18, "name": "My Chemical Romance", "bio": "Banda americana de rock associada ao movimento emo dos anos 2000", "genre": "Pop Punk", "country": "EUA", "formed_year": 2001, "image_url": "https://cdn-images.dzcdn.net/images/artist/e34296360cda10a29f85c7170a60178d/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 19, "name": "Olivia Rodrigo", "bio": "Cantora e compositora americana conhecida por musicas emocionais e letras pessoais", "genre": "Pop", "country": "EUA", "formed_year": 2015, "image_url": "https://cdn-images.dzcdn.net/images/artist/245d3346a03388562d56ab5a63f6549d/1900x1900-000000-80-0-0.jpg"},
    {"id_artista": 20, "name": "Lil Nas X", "bio": "Cantor americano conhecido por musicas inovadoras e letras provocativas", "genre": "Pop", "country": "EUA", "formed_year": 2018, "image_url": "https://cdn-images.dzcdn.net/images/cover/a65e86966cfd34b2aa292856136ef9ac/0x1900-000000-80-0-0.jpg"},
    {"id_artista": 21, "name": "Harry Styles", "bio": "Cantor britanico conhecido por carreira solo e estilo pop rock", "genre": "Pop", "country": "Reino Unido", "formed_year": 2017, "image_url": "https://cdn-images.dzcdn.net/images/artist/1151dba9b3edc0633adf35b64c21713f/200x200.jpg"},
    {"id_artista": 22, "name": "Addison Rae", "bio": "Artista pop/alternativa que ascendeu ao mainstream como influencer", "genre": "Pop", "country": "EUA", "formed_year": 2021, "image_url": "https://cdn-images.dzcdn.net/images/artist/a8bc8bbb055934154ffe5ab48e61d6d0/1000x1000-000000-80-0-0.jpg"},
    {"id_artista": 23, "name": "Lana Del Rey", "bio": "Cantora e compositora americana conhecida por seu estilo cinematográfico e letras poéticas", "genre": "Pop", "country": "EUA", "formed_year": 2012, "image_url": "https://cdn-images.dzcdn.net/images/artist/8994d3be1a59a72f887f1f8afd2d4c6c/1000x1000-000000-80-0-0.jpg"},
    {"id_artista": 24, "name": "The Marias", "bio": "Banda americana de indie pop com sonoridade suave e influencias latinas", "genre": "Indie Pop", "country": "EUA", "formed_year": 2017, "image_url": "https://cdn-images.dzcdn.net/images/artist/9a81e875aa2689278b4ad8c385aacd12/1000x1000-000000-80-0-0.jpg"},
    {"id_artista": 25, "name": "Grimes", "bio": "Cantora e produtora canadense conhecida por seu estilo experimental e letras provocativas", "genre": "Experimental", "country": "Canada", "formed_year": 2010, "image_url": "https://cdn-images.dzcdn.net/images/artist/8a207720e8bed18bab25883fba019dc7/500x500-000000-80-0-0.jpg"},
    {"id_artista": 26, "name": "PinkPantheress", "bio": "Cantora, produtora e compositora britânica conhecida por música drum-n-bass e estilos de garagem do Reino Unido", "genre": "UK Garage", "country": "Reino Unido", "formed_year": 2021, "image_url": "https://i.scdn.co/image/ab6761610000e5eb6bf10d74063b45938f5d8656"},
    {"id_artista": 27, "name": "Zara Larsson", "bio": "Cantora sueca conhecida por seu pop cativante e letras empoderadoras", "genre": "Pop", "country": "Suécia", "formed_year": 2013, "image_url": "https://i.scdn.co/image/ab6761610000e5eb11be9310ef4b23734c13b5c8"},
    {"id_artista": 28, "name": "KATSEYE", "bio": "Grupo feminino global com integrantes de várias partes do mundo", "genre": "Pop", "country": "Vários", "formed_year": 2023, "image_url": "https://i.scdn.co/image/ab6761610000e5eb484e326315e09b3f382a7960"},

])

# Povoamento de Álbuns (feitos de um a um com capas do deezer)
db.albums.insert_many([

    {
        "id_album": 1,
        "title": "Three Cheers for Sweet Revenge",
        "id_artista": 18,
        "year": 2004,
        "genre": "Emo-Pop",
        "description": "Album que consolidou o som emo do grupo",
        "image": "https://cdn-images.dzcdn.net/images/cover/9aba5b418a311c0bbefb6699ebc58a4b/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 2,
        "title": "The Black Parade",
        "id_artista": 18,
        "year": 2006,
        "genre": "Rock Opera",
        "description": "Album conceitual que marcou a carreira da banda",
        "image": "https://cdn-images.dzcdn.net/images/cover/ae78cd7f32230593392c8b76519e9044/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 3,
        "title": "Transpiracao Continua Prolongada",
        "id_artista": 16,
        "year": 1997,
        "genre": "Skate Punk",
        "description": "Album de estreia com forte influencia do skate punk",
        "image": "https://cdn-images.dzcdn.net/images/cover/ebc2a1f1dd88e1f1184f5f65dd50a651/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 4,
        "title": "Preco Curto Prazo Longo",
        "id_artista": 16,
        "year": 1999,
        "genre": "Skate Punk",
        "description": "Album que ampliou o sucesso nacional da banda",
        "image": "https://cdn-images.dzcdn.net/images/cover/e1e68b0c566b15c05e4b5512ad60edbc/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 5,
        "title": "Nadando com os Tubaroes",
        "id_artista": 16,
        "year": 2000,
        "genre": "Skate Punk",
        "description": "Album com letras intensas e sonoridade marcante",
        "image": "https://cdn-images.dzcdn.net/images/cover/b21f18394f35fa085a60fb0830e6c0b1/500x500.jpg"
    },

    {
        "id_album": 6,
        "title": "Acustico MTV Charlie Brown Jr",
        "id_artista": 16,
        "year": 2003,
        "genre": "Pop Rock",
        "description": "Album ao vivo em formato acustico com grandes sucessos da banda",
        "image": "https://cdn-images.dzcdn.net/images/cover/8b2e53b96f790c5716ea2c0f2952ca3b/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 7,
        "title": "Bocas Ordinarias",
        "id_artista": 16,
        "year": 2002,
        "genre": "Skate Punk",
        "description": "Album com sucessos populares e letras reflexivas",
        "image": "https://cdn-images.dzcdn.net/images/cover/0643a39cd1500460e282c216685270ad/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 8,
        "title": "Imunidade Musical",
        "id_artista": 16,
        "year": 2005,
        "genre": "Rap Rock",
        "description": "Album premiado com forte impacto no rock nacional",
        "image": "https://cdn-images.dzcdn.net/images/cover/710a0bb8222c01062271e44fbc00a8a2/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 9,
        "title": "All We Know Is Falling",
        "id_artista": 12,
        "year": 2005,
        "genre": "Pop Punk",
        "description": "Album de estreia com sonoridade emo pop",
        "image": "https://cdn-images.dzcdn.net/images/cover/3c761adbf435c7e1c6bc44cd9004bf08/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 10,
        "title": "RIOT",
        "id_artista": 12,
        "year": 2007,
        "genre": "Pop Punk",
        "description": "Album que levou a banda ao sucesso mundial",
        "image": "https://cdn-images.dzcdn.net/images/cover/22e912898ea9df52d73b10625538d615/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 11,
        "title": "brand new eyes",
        "id_artista": 12,
        "year": 2009,
        "genre": "Alternative Rock",
        "description": "Album com evolucao sonora e amadurecimento lirico",
        "image": "https://cdn-images.dzcdn.net/images/cover/1346bb36e5d61b9fea447a9b3ea50f54/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 12,
        "title": "Paramore",
        "id_artista": 12,
        "year": 2013,
        "genre": "Pop Rock",
        "description": "Album com estilo mais pop e experimental",
        "image": "https://cdn-images.dzcdn.net/images/cover/485d7cab7695e48f1420182647273de4/500x500.jpg"
    },

    {
        "id_album": 13,
        "title": "After Laughter",
        "id_artista": 12,
        "year": 2017,
        "genre": "Pop Rock",
        "description": "Album com sonoridade mais leve e influencias dos anos 80",
        "image": "https://cdn-images.dzcdn.net/images/cover/b43c1a8f1be9a9ee3654562e5a949426/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 14,
        "title": "This Is Why",
        "id_artista": 12,
        "year": 2023,
        "genre": "Alternative Rock",
        "description": "Album com abordagem mais madura e alternativa",
        "image": "https://cdn-images.dzcdn.net/images/cover/15b205611f8695468dece5be1fdfe981/500x500.jpg"
    },

    {
        "id_album": 15,
        "title": "WHEN WE ALL FALL ASLEEP WHERE DO WE GO",
        "id_artista": 2,
        "year": 2019,
        "genre": "Alternative Pop",
        "description": "Album de estreia com atmosfera sombria e moderna",
        "image": "https://cdn-images.dzcdn.net/images/cover/6630083f454d48eadb6a9b53f035d734/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 16,
        "title": "Happier Than Ever",
        "id_artista": 2,
        "year": 2021,
        "genre": "Alternative Pop",
        "description": "Album que mistura pop alternativo e vulnerabilidade",
        "image": "https://cdn-images.dzcdn.net/images/cover/bb2880548dd3bc71fb97def2eedec130/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 17,
        "title": "Fearless",
        "id_artista": 3,
        "year": 2008,
        "genre": "Country",
        "description": "Album country pop que consolidou sua carreira",
        "image": "https://cdn-images.dzcdn.net/images/cover/96a161f99836c790df03af3b6dbd9309/1900x1900-000000-81-0-0.jpg"
    },

    {
        "id_album": 18,
        "title": "Red",
        "id_artista": 3,
        "year": 2012,
        "genre": "Pop",
        "description": "Album que mistura country e pop com letras intensas",
        "image": "https://cdn-images.dzcdn.net/images/cover/74bb527e771a74e2e7478cacca15fbba/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 19,
        "title": "1989",
        "id_artista": 3,
        "year": 2014,
        "genre": "Pop",
        "description": "Album totalmente pop com grandes hits mundiais",
        "image": "https://cdn-images.dzcdn.net/images/cover/8c39b232a5edecdf5fffc14f551fa42b/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 20,
        "title": "reputation",
        "id_artista": 3,
        "year": 2017,
        "genre": "Pop",
        "description": "Album com sonoridade mais sombria e eletronica",
        "image": "https://cdn-images.dzcdn.net/images/cover/e6f3afd8a5c3d8ea797f458694166e47/1900x1900-000000-80-0-0.jpg"
    },

        {
        "id_album": 21,
        "title": "Lover",
        "id_artista": 3,
        "year": 2019,
        "genre": "Pop",
        "description": "Album com atmosfera romantica e colorida",
        "image": "https://cdn-images.dzcdn.net/images/cover/6111c5ab9729c8eac47883e4e50e9cf8/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 22,
        "title": "folklore",
        "id_artista": 3,
        "year": 2020,
        "genre": "Folk",
        "description": "Album mais intimista com influencias indie",
        "image": "https://cdn-images.dzcdn.net/images/cover/290abe93bdda84bb8b170f30a4998c4c/500x500.jpg"
    },

    {
        "id_album": 23,
        "title": "Future Nostalgia",
        "id_artista": 7,
        "year": 2020,
        "genre": "Pop",
        "description": "Album pop com forte influencia disco e anos 80",
        "image": "https://cdn-images.dzcdn.net/images/cover/3c5cd0eb919ff9a7767b8ac7acc89e40/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 24,
        "title": "Coisas Naturais",
        "id_artista": 8,
        "year": 2023,
        "genre": "Pop",
        "description": "Album com sonoridade brasileira moderna e sensual",
        "image": "https://cdn-images.dzcdn.net/images/cover/99541f56b36b6f4db2b8680f5a9c3262/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 25,
        "title": "Take Care",
        "id_artista": 9,
        "year": 2011,
        "genre": "Hip Hop",
        "description": "Album que consolidou Drake no rap mundial",
        "image": "https://cdn-images.dzcdn.net/images/cover/6e7a6c8f36669dcd11abe7e7c3222e91/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 26,
        "title": "Views",
        "id_artista": 9,
        "year": 2016,
        "genre": "Hip Hop",
        "description": "Album com mistura de rap e dancehall",
        "image": "https://cdn-images.dzcdn.net/images/cover/56bdb7a86a27fadb96332c0c8f1b8e81/1900x1900-000000-81-0-0.jpg"
    },

    {
        "id_album": 27,
        "title": "Scorpion",
        "id_artista": 9,
        "year": 2018,
        "genre": "Hip Hop",
        "description": "Album duplo com sucessos comerciais globais",
        "image": "https://cdn-images.dzcdn.net/images/cover/b69d3bcbd130ad4cc9259de543889e30/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 28,
        "title": "Dois",
        "id_artista": 6,
        "year": 1986,
        "genre": "Post-Punk",
        "description": "Album com classicos do rock brasileiro",
        "image": "https://cdn-images.dzcdn.net/images/cover/b4738becedbed0481ac71cee50b18d6b/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 29,
        "title": "Que Pais E Esse",
        "id_artista": 6,
        "year": 1987,
        "genre": "Post-Punk",
        "description": "Album com forte critica social e politica",
        "image": "https://cdn-images.dzcdn.net/images/cover/16404d6f94173cd2c1cb05fe476f5012/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 30,
        "title": "Revolver",
        "id_artista": 4,
        "year": 1966,
        "genre": "Rock",
        "description": "Album inovador que marcou a musica mundial",
        "image": "https://cdn-images.dzcdn.net/images/cover/6e1e24a3e4311371abd2c888b1f0e13e/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 31,
        "title": "Abbey Road",
        "id_artista": 4,
        "year": 1969,
        "genre": "Rock",
        "description": "Album classico com producao sofisticada",
        "image": "https://cdn-images.dzcdn.net/images/cover/aa94ab293730bb7845d2aa8c672b2c29/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 32,
        "title": "Let It Be",
        "id_artista": 4,
        "year": 1970,
        "genre": "Rock",
        "description": "Ultimo album lancado pela banda",
        "image": "https://cdn-images.dzcdn.net/images/cover/fcf05300b7c17ec77a6d01028a4bef61/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 33,
        "title": "The Fame",
        "id_artista": 10,
        "year": 2008,
        "genre": "Pop",
        "description": "Album de estreia com grandes hits pop",
        "image": "https://cdn-images.dzcdn.net/images/cover/cc24d60a998e1a296f0c22efa8ddffd2/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 34,
        "title": "The Fame Monster",
        "id_artista": 10,
        "year": 2009,
        "genre": "Pop",
        "description": "Reedicao com sucessos marcantes do pop",
        "image": "https://cdn-images.dzcdn.net/images/cover/fad7de079aa103d60ec1e2d1582c2281/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 35,
        "title": "Born This Way",
        "id_artista": 10,
        "year": 2011,
        "genre": "Pop",
        "description": "Album com mensagem de auto aceitacao",
        "image": "https://cdn-images.dzcdn.net/images/cover/d0790a19ca7b37af16029e10209d323a/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 36,
        "title": "ARTPOP",
        "id_artista": 10,
        "year": 2013,
        "genre": "Pop",
        "description": "Album ambicioso com influencias eletronicas",
        "image": "https://cdn-images.dzcdn.net/images/cover/2355b9a023e34665e347afa8b53fd9e1/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 37,
        "title": "Humbug",
        "id_artista": 11,
        "year": 2009,
        "genre": "Indie Rock",
        "description": "Album com sonoridade mais sombria e psicodelica",
        "image": "https://cdn-images.dzcdn.net/images/cover/13cdeb23547351f3ea543a2f5b4b9a4b/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 38,
        "title": "Suck It And See",
        "id_artista": 11,
        "year": 2011,
        "genre": "Indie Rock",
        "description": "Album com estilo mais romantico e direto",
        "image": "https://cdn-images.dzcdn.net/images/cover/9751005be2b826746df12c45b761573a/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 39,
        "title": "AM",
        "id_artista": 11,
        "year": 2013,
        "genre": "Indie Rock",
        "description": "Album com grande sucesso comercial da banda",
        "image": "https://cdn-images.dzcdn.net/images/cover/64e54e307bd5e2bdb27ffeb662fd910d/1900x1900-000000-81-0-0.jpg"
    },

    {
        "id_album": 40,
        "title": "Montero",
        "id_artista": 20,
        "year": 2021,
        "genre": "Pop",
        "description": "Album de estreia que consolidou Lil Nas X no cenario pop e rap mundial",
        "image": "https://cdn-images.dzcdn.net/images/cover/18e6daf0a1c70c1346c44670ff70645d/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 41,
        "title": "SOUR",
        "id_artista": 19,
        "year": 2021,
        "genre": "Pop Rock",
        "description": "Album de estreia com forte carga emocional e sucesso global",
        "image": "https://cdn-images.dzcdn.net/images/cover/e68da86fd7976135c2d2d1715afaef7c/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 42,
        "title": "The Life of a Showgirl",
        "id_artista": 3,
        "year": 2025,
        "genre": "Pop",
        "description": "Projeto que explora o lado performatico e teatral de Taylor Swift",
        "image": "https://cdn-images.dzcdn.net/images/cover/d0bed55a0efb3c5c3ddb3dacda67d9b3/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 43,
        "title": "Harrys House",
        "id_artista": 21,
        "year": 2022,
        "genre": "Pop",
        "description": "Album com sonoridade leve e influencias do pop contemporaneo",
        "image": "https://cdn-images.dzcdn.net/images/cover/b0e936124f59e669ddba02ebe5893f95/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 44,
        "title": "MAYHEM",
        "id_artista": 10,
        "year": 2025,
        "genre": "Pop",
        "description": "Album com estetica ousada e sonoridade intensa caracteristica de Lady Gaga",
        "image": "https://cdn-images.dzcdn.net/images/cover/5f70ffc30c43410fc2a88ae10baa91c7/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 45,
        "title": "HIT ME HARD AND SOFT",
        "id_artista": 2,
        "year": 2024,
        "genre": "Alternative Pop",
        "description": "Album que explora vulnerabilidade emocional com producao minimalista e atmosferica",
        "image": "https://cdn-images.dzcdn.net/images/cover/5d284b31cb9ddeb1a0c79aede5a94e1c/500x500.jpg"
    },

    {
        "id_album": 46,
        "title": "Meteora",
        "id_artista": 1,
        "year": 2003,
        "genre": "Nu Metal",
        "description": "Album que consolidou o sucesso mundial da banda com som pesado e melodico",
        "image": "https://cdn-images.dzcdn.net/images/cover/882448ab63952aa16e502c82db2df160/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 47,
        "title": "Hybrid Theory",
        "id_artista": 1,
        "year": 2000,
        "genre": "Nu Metal",
        "description": "Album de estreia que marcou o inicio do sucesso global do grupo",
        "image": "https://cdn-images.dzcdn.net/images/cover/033a271b5ec10842c287827c39244fb5/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 48,
        "title": "Addison",
        "id_artista": 22,
        "year": 2025,
        "genre": "Pop",
        "description": "Album de estréia da artista revelação do Scorefy",
        "image": "https://cdn-images.dzcdn.net/images/cover/6925f0e9f34b95ce5781480b249fd86d/1000x1000-000000-80-0-0.jpg"
    },

    {
        "id_album": 49,
        "title": "Lust For Life",
        "id_artista": 23,
        "year": 2017,
        "genre": "Alternative Pop",
        "description": "Album que mistura pop moderno com influencias de musica dos anos 70 e 80",
        "image": "https://cdn-images.dzcdn.net/images/cover/7120083b059299f380eb1fe3bca0eefb/1000x1000-000000-80-0-0.jpg"
    },
    
    {
        "id_album": 50,
        "title": "Norman Fucking Rockwell",
        "id_artista": 23,
        "year": 2019,
        "genre": "Alternative Pop",
        "description": "Album aclamado pela critica com letras introspectivas e sonoridade sofisticada",
        "image": "https://cdn-images.dzcdn.net/images/cover/c0f4f022fa51f13e877aae2e758e241d/1000x1000-000000-80-0-0.jpg"
    },

    {
        "id_album": 51,
        "title": "Chemtrails Over the Country Club",
        "id_artista": 23,
        "year": 2021,
        "genre": "Alternative Pop",
        "description": "Album que explora temas de identidade e pertencimento com sonoridade suave",
        "image": "https://cdn-images.dzcdn.net/images/cover/bfcc4fdda18be0e2f6fecc3aeebebe6c/500x500-000000-80-0-0.jpg"
    },

    {
        "id_album": 52,
        "title": "Blue Banisters",
        "id_artista": 23,
        "year": 2021,
        "genre": "Alternative Pop",
        "description": "Album que apresenta uma sonoridade mais madura e introspectiva",
        "image": "https://cdn-images.dzcdn.net/images/cover/c03cb054182a8e33a9588c8755f35d70/500x500-000000-80-0-0.jpg"
    },

    {
        "id_album": 53,
        "title": "Art Angels",
        "id_artista": 25,
        "year": 2015,
        "genre": "Experimental",
        "description": "Album que mistura pop, eletrônica e elementos experimentais com letras provocativas",
        "image": "https://cdn-images.dzcdn.net/images/cover/6a7fbeeb7632c81774d13d2bd0cc0f0b/1000x1000-000000-80-0-0.jpg"
    },

    { 
        "id_album": 54,
        "title": "Miss Anthropocene",
        "id_artista": 25,
        "year": 2020,
        "genre": "Experimental",
        "description": "Album que explora temas de identidade e feminilidade com sonoridade inovadora",
        "image": "https://cdn-images.dzcdn.net/images/cover/b069393ca5d13fea704e59d548d2c46d/500x500-000000-80-0-0.jpg"
    },

    {
        "id_album": 55,
        "title": "The Submarine",
        "id_artista": 24,
        "year": 2024,
        "genre": "Indie Pop",
        "description": "Album de estréia da banda americana de indie pop The Marias, com sonoridade suave e influências latinas",
        "image": "https://cdn-images.dzcdn.net/images/cover/574bd156ad04b9af443cdf6775cfa8c3/1000x1000-000000-80-0-0.jpg"
    },

    {
        "id_album": 56,
        "title": "DeBÍ TiRAR MáS FOToS",
        "id_artista": 13,
        "year": 2024,
        "genre": "Latin Pop",
        "description": "Álbum do Bad Bunny que honra suas raízes porto-riquenhas e mistura reggaeton, trap latino e influências de música tradicional, consolidando seu status como um dos artistas mais inovadores e influentes da música latina contemporânea",
        "image": "https://cdn-images.dzcdn.net/images/cover/d98eaccfbb945bdf68241d6de7fe6a49/500x500-000000-80-0-0.jpg"
    },

    {
        "id_album": 57,
        "title": "Bleach",
        "id_artista": 5,
        "year": 1989,
        "genre": "Grunge",
        "description": "Álbum de estreia da banda, marcando o início do movimento grunge com um som cru e pesado",
        "image": "https://cdn-images.dzcdn.net/images/cover/5c4474eb462a904d3b3e0ac13213e836/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 58,
        "title": "Nevermind",
        "id_artista": 5,
        "year": 1991,
        "genre": "Grunge",
        "description": "Um dos álbuns mais influentes da história do rock, revolucionou a música dos anos 90 e o cenário alternativo",
        "image": "https://cdn-images.dzcdn.net/images/cover/f0282817b697279e56df13909962a54a/0x1900-000000-80-0-0.jpg"
    },
    
    {
        "id_album": 59,
        "title": "In Utero",
        "id_artista": 5,
        "year": 1993,
        "genre": "Grunge",
        "description": "Último álbum de estúdio da banda, trazendo letras intensas e uma sonoridade menos polida",
        "image": "https://cdn-images.dzcdn.net/images/cover/4d0dfaf6d522f5323aebcc85903d92ac/0x1900-000000-80-0-0.jpg"
    },
    
    {
        "id_album": 60,
        "title": "Fallen",
        "id_artista": 14,
        "year": 2003,
        "genre": "Gothic Metal",
        "description": "Álbum de estreia de enorme sucesso global, misturando metal com arranjos sinfônicos e vocais potentes",
        "image": "https://cdn-images.dzcdn.net/images/cover/56c02d3764f5a078ceecd27b64b7d789/0x1900-000000-80-0-0.jpg"
    },
    
    {
        "id_album": 61,
        "title": "The Open Door",
        "id_artista": 14,
        "year": 2006,
        "genre": "Gothic Metal",
        "description": "Segundo álbum da banda, explorando melodias mais complexas e instrumentação clássica",
        "image": "https://cdn-images.dzcdn.net/images/cover/1ff74ac5b35955c8d4fe115ac1d1f41f/0x1900-000000-80-0-0.jpg"
    },
    
    {
        "id_album": 62,
        "title": "Rodeo",
        "id_artista": 15,
        "year": 2015,
        "genre": "Hip Hop",
        "description": "O álbum de estreia altamente aclamado que definiu a sonoridade única e espacial de Travis Scott",
        "image": "https://cdn-images.dzcdn.net/images/cover/c6fe182fb0f3485428906c7b21873046/0x1900-000000-80-0-0.jpg"
    },
    
    {
        "id_album": 63,
        "title": "Astroworld",
        "id_artista": 15,
        "year": 2018,
        "genre": "Hip Hop",
        "description": "Álbum conceitual revolucionário e um dos maiores marcos do rap moderno, repleto de colaborações épicas",
        "image": "https://cdn-images.dzcdn.net/images/cover/7df7ac6028591a5622f24cf32a555510/1900x1900-000000-80-0-0.jpg"
    },
    
    {
        "id_album": 64,
        "title": "Utopia",
        "id_artista": 15,
        "year": 2023,
        "genre": "Hip Hop",
        "description": "Um projeto ambicioso e imersivo com experimentações sonoras que quebram os padrões do trap",
        "image": "https://cdn-images.dzcdn.net/images/cover/6c91e64b7157f1332a4f6b0de9e4c714/0x1900-000000-80-0-0.jpg"
    },
    
    {
        "id_album": 65,
        "title": "Ivete Sangalo",
        "id_artista": 17,
        "year": 1999,
        "genre": "Axé",
        "description": "O álbum que lançou a carreira solo da cantora de axé e marcou o início de uma nova era na música baiana",
        "image": "https://cdn-images.dzcdn.net/images/cover/39e705b460413e01d3048ddf46e14227/1900x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 66,
        "title": "Festa",
        "id_artista": 17,
        "year": 2001,
        "genre": "Axé",
        "description": "Álbum icônico que dominou o Brasil com energia pura, se tornando um clássico instantâneo do Carnaval",
        "image": "https://cdn-images.dzcdn.net/images/cover/f3acd5859592d26f1b11dc44ca49e267/0x1900-000000-80-0-0.jpg"
    },

    {
        "id_album": 67,
        "title": "Fancy That",
        "id_artista": 26,
        "year": 2025,
        "genre": "Pop",
        "description": "Álbum fresh que mistura pop contemporâneo com música de garagem do Reino Unido.",
        "image": "https://cdn-images.dzcdn.net/images/cover/0b8720478ef28aedf91af614d36721ec/1000x1000-000000-80-0-0.jpg"

    },

    {
        "id_album": 68,
        "title": "Midnight Sun",
        "id_artista": 27,
        "year": 2025,
        "genre": "Pop",
        "description": "Álbum que traz o pop fresco e vibrante do verão de volta aos holofotes.",
        "image": "https://cdn-images.dzcdn.net/images/cover/19bf09a63824955c504abea3f958c584/1000x1000-000000-80-0-0.jpg"
    },
    {
        "id_album": 69,
        "title": "BEAUTIFUL CHAOS",
        "id_artista": 28,
        "year": 2025,
        "genre": "Pop",
        "description": "EP de estréia do grupo global que mistura elementos do Hyperpop com elementos de K-pop.",
        "image": "https://cdn-images.dzcdn.net/images/cover/ddcf71c7df8157bf0b7bc84708326434/1000x1000-000000-80-0-0.jpg"
    }
])




prefs = {"curtidas": True, "respostas": True, "seguidores": True}

usuarios = [
    {
        "id_user": 1, "email": "emerson@ufop.br", "senha": "123", "username": "EmersonS2", 
        "nome": "Emerson Ataide", "bio": "Amante de Nu Metal e Pop.", 
        "localizacao": "Minas Gerais", "imagem_url": "https://i.pinimg.com/736x/97/93/29/979329dc7dd788331cee69e96a43e9fa.jpg",
        "albuns_favoritos": [1, 43, 55], "seguidores": [2, 3, 4, 5], "seguindo": [2, 3, 6, 7], "notifications": [], "pref_notificacoes": prefs
    },
    {
        "id_user": 2, "email": "maria@gmail.com", "senha": "123", "username": "marillu", 
        "nome": "Maria Silva", "bio": "apenas uma garota vivendo num mundo pop", 
        "localizacao": "São Paulo, SP", "imagem_url": "https://i.pinimg.com/1200x/1a/a2/a5/1aa2a568ec5f4d721fa7f7bd5dda915b.jpg",
        "albuns_favoritos": [45, 44, 21], "seguidores": [1, 3, 8], "seguindo": [1, 4, 5], "notifications": [], "pref_notificacoes": prefs
    },
    {
        "id_user": 3, "email": "joao.indie@outlook.com", "senha": "123", "username": "joaoindie", 
        "nome": "João Pedro", "bio": "fones de ouvido 24/7.", 
        "localizacao": "Rio de Janeiro, RJ", "imagem_url": "https://i.pinimg.com/736x/9f/c5/6f/9fc56f19a167e5ea1b591581f1d2e355.jpg",
        "albuns_favoritos": [55, 39, 11], "seguidores": [1, 2], "seguindo": [1, 2, 9], "notifications": [], "pref_notificacoes": prefs
    },
    {
        "id_user": 4, "email": "analu@yahoo.com", "senha": "123", "username": "ana_lu", 
        "nome": "Ana Luiza", "bio": "tudo que eu ouço vira minha personalidade.", 
        "localizacao": "Belo Horizonte, MG", "imagem_url": "https://i.pinimg.com/736x/8e/87/ad/8e87ad9b1fb4f4cf3fc5820b0ad058f2.jpg",
        "albuns_favoritos": [67, 19, 23], "seguidores": [2], "seguindo": [1], "notifications": [], "pref_notificacoes": prefs
    },
    {
        "id_user": 5, "email": "lucas.rock@gmail.com", "senha": "123", "username": "lucas_rock", 
        "nome": "Lucas Martins", "bio": "rock não morreu.", 
        "localizacao": "Curitiba, MG", "imagem_url": "https://i.pinimg.com/736x/fe/e4/57/fee457a40374415ef1037034f3050341.jpg",
        "albuns_favoritos": [58, 2, 14], "seguidores": [1, 2], "seguindo": [1], "notifications": [], "pref_notificacoes": prefs
    },
    {
        "id_user": 6, "email": "bea.music@hotmail.com", "senha": "123", "username": "beaangel", 
        "nome": "Beatriz Costa", "bio": "opinando sobre álbuns que ninguém pediu.", 
        "localizacao": "Salvador, BA", "imagem_url": "https://i.pinimg.com/1200x/ae/ef/53/aeef53aed5cd212048f6a9ad9d9357c4.jpg",
        "albuns_favoritos": [24, 44], "seguidores": [1], "seguindo": [], "notifications": [], "pref_notificacoes": prefs
    },
    {
        "id_user": 7, "email": "carlosdj@gmail.com", "senha": "123", "username": "ccarlosdj", 
        "nome": "Carlos Eduardo", "bio": "beats & synths", 
        "localizacao": "Florianópolis, PR", "imagem_url": "https://i.pinimg.com/736x/c4/d5/35/c4d53514d7eceb2eb211807066a101a2.jpg",
        "albuns_favoritos": [56, 64], "seguidores": [1], "seguindo": [], "notifications": [], "pref_notificacoes": prefs
    },
    {
        "id_user": 8, "email": "fe.lima@uol.com.br", "senha": "123", "username": "fernanda_", 
        "nome": "Fernanda Lima", "bio": "só pop de qualidade.", 
        "localizacao": "Recife, BA", "imagem_url": "https://i.pinimg.com/1200x/1a/38/8f/1a388fdc7362b6f88176096b14922ef8.jpg",
        "albuns_favoritos": [67, 55], "seguidores": [], "seguindo": [2], "notifications": [], "pref_notificacoes": prefs
    },
    {
        "id_user": 9, "email": "rafael@email.com", "senha": "123", "username": "faelbin", 
        "nome": "fael", "bio": "pop e rap.", 
        "localizacao": "Joao Monlevade, MG", "imagem_url": "https://i.pinimg.com/736x/11/ca/f8/11caf8f0f748eda5722c1013c665a732.jpg",
        "albuns_favoritos": [64, 56, 15, 45], "seguidores": [3], "seguindo": [], "notifications": [], "pref_notificacoes": prefs
    },
    {
        "id_user": 10, "email": "julia.mendes@gmail.com", "senha": "123", "username": "julhinha", 
        "nome": "Julia Mendes", "bio": "aesthetic listener", 
        "localizacao": "Brasília, DF", "imagem_url": "https://i.pinimg.com/736x/f3/ce/b1/f3ceb1ca0bfcc0b17706945ff72ffad5.jpg",
        "albuns_favoritos": [24, 67], "seguidores": [], "seguindo": [], "notifications": [], "pref_notificacoes": prefs
    },
    {
        "id_user": 11, "email": "gabriel.t@gmail.com", "senha": "123", "username": "tavinho", 
        "nome": "Gabriel Tavares", "bio": "chorando com a billie", 
        "localizacao": "Manaus, RS", "imagem_url": "https://i.pinimg.com/736x/55/37/cd/5537cd22b6075fb4c40bf479a2a524ae.jpg",
        "albuns_favoritos": [45], "seguidores": [], "seguindo": [], "notifications": [], "pref_notificacoes": prefs
    }
]

db.users.insert_many(usuarios)

# Povoamento de reviews

def pega_nome(id_user):
    for u in usuarios:
        if u["id_user"] == id_user:
            return u["username"]

reviews = [
    {"id_user": 2, "id_album": 55, "nota": 5.0, "texto": "obra prima, simplesmente sem defeitos. to apaixonada pelas melodias. the marias salvou o ano!!", "curtidas": [1, 3, 4], "respostas": [], "data_postagem": "2026-02-23 14:30:00"},
    {"id_user": 4, "id_album": 55, "nota": 4.5, "texto": "vibe muito boa, perfeito pra ouvir no fone voltando pra casa na chuva.", "curtidas": [2, 10], "respostas": [], "data_postagem": "2026-02-22 18:15:00"},
    {"id_user": 8, "id_album": 55, "nota": 5.0, "texto": "cinematográfico demais, maria nunca erra! escutem run your mouth agora", "curtidas": [2], "respostas": [], "data_postagem": "2026-02-21 09:20:00"},
    
    {"id_user": 3, "id_album": 24, "nota": 4.0, "texto": "marina sena servindo vocais como sempre. a estética do album ta linda", "curtidas": [6, 10], "respostas": [], "data_postagem": "2026-02-23 20:00:00"},
    {"id_user": 6, "id_album": 24, "nota": 5.0, "texto": "HINOOOO DO VERAO!!! não paro de ouvir a faixa 2, repeat eterno", "curtidas": [1, 8], "respostas": [], "data_postagem": "2026-02-20 11:45:00"},
    {"id_user": 10, "id_album": 24, "nota": 3.5, "texto": "gostei mas achei q o vicio inerente era um pouco melhor kkkk mesmo assim ta na minha playlist", "curtidas": [], "respostas": [], "data_postagem": "2026-02-22 13:10:00"},
    
    {"id_user": 2, "id_album": 45, "nota": 5.0, "texto": "billie me destruiu nesse album, que produção absurda. the greatest é a melhor musica da carreira dela", "curtidas": [1, 4, 11], "respostas": [], "data_postagem": "2026-02-24 00:10:00"},
    {"id_user": 5, "id_album": 45, "nota": 4.5, "texto": "muito bom, o finneas é um genio tbm na produçao. rock vibes no final de umas faixas me pegou de surpresa", "curtidas": [2, 7], "respostas": [], "data_postagem": "2026-02-19 16:50:00"},
    {"id_user": 11, "id_album": 45, "nota": 5.0, "texto": "l'amour de ma vie me fez chorar no banho hoje de manha 10/10", "curtidas": [1, 2], "respostas": [], "data_postagem": "2026-02-23 08:30:00"},
    
    {"id_user": 7, "id_album": 56, "nota": 5.0, "texto": "EL CONEJO MALO NUNCA FALHA!!! album perfeito pro role", "curtidas": [9], "respostas": [], "data_postagem": "2026-02-23 23:45:00"},
    {"id_user": 9, "id_album": 56, "nota": 4.5, "texto": "trap pesadissimo, muito bom de vdd", "curtidas": [7, 1], "respostas": [], "data_postagem": "2026-02-21 21:15:00"},
    {"id_user": 1, "id_album": 56, "nota": 4.0, "texto": "curti bastante os beats, a produção tá insana. não é meu estilo favorito mas admito a genialidade", "curtidas": [7], "respostas": [], "data_postagem": "2026-02-22 19:20:00"},
    
    {"id_user": 4, "id_album": 67, "nota": 5.0, "texto": "ela sabe q é a maioral do uk garage ne. samples de 2000 mt bem usados", "curtidas": [8, 10], "respostas": [], "data_postagem": "2026-02-23 17:00:00"},
    {"id_user": 8, "id_album": 67, "nota": 4.5, "texto": "viciante!!! a unica coisa ruim é que as musicas deviam ser mais longas 😭😭", "curtidas": [4], "respostas": [], "data_postagem": "2026-02-22 10:40:00"},
    {"id_user": 10, "id_album": 67, "nota": 4.0, "texto": "muito fofinha a estética, super vibe y2k", "curtidas": [], "respostas": [], "data_postagem": "2026-02-18 14:55:00"},

    {"id_user": 2, "id_album": 44, "nota": 5.0, "texto": "A GAGA VOLTOU PRO POP!!!! ESTAMOS SALVOS", "curtidas": [1, 3, 4, 6], "respostas": [], "data_postagem": "2026-02-24 01:20:00"},
    {"id_user": 6, "id_album": 44, "nota": 4.0, "texto": "serviu conceito, coreografia e vocais pra ninguem botar defeito", "curtidas": [2], "respostas": [], "data_postagem": "2026-02-23 12:00:00"},
    {"id_user": 3, "id_album": 44, "nota": 5.0, "texto": "pop perfection. aoty. não aceito menos que grammys.", "curtidas": [2, 6, 8], "respostas": [], "data_postagem": "2026-02-22 22:30:00"},

    {"id_user": 5, "id_album": 14, "nota": 5.0, "texto": "hayley williams eu te amo entenda. as guitarras aqui tao espetaculares", "curtidas": [1, 3], "respostas": [], "data_postagem": "2026-02-20 09:10:00"},
    {"id_user": 1, "id_album": 14, "nota": 4.5, "texto": "baita album de rock alternativo! a bateria na faixa titulo é genial", "curtidas": [5], "respostas": [], "data_postagem": "2026-02-19 18:45:00"},

    {"id_user": 7, "id_album": 64, "nota": 4.0, "texto": "uma viagem sonora inexplicável", "curtidas": [9], "respostas": [], "data_postagem": "2026-02-18 20:30:00"},
    {"id_user": 9, "id_album": 64, "nota": 5.0, "texto": "travis não brinca em serviço ne pai. melhor experiencia musical q tive esse ano", "curtidas": [1, 7], "respostas": [], "data_postagem": "2026-02-23 21:50:00"},

    {"id_user": 2, "id_album": 42, "nota": 5.0, "texto": "poucos vao entender a genialidade desse album", "curtidas": [9], "respostas": [], "data_postagem": "2026-02-18 20:30:00"},
    {"id_user": 9, "id_album": 42, "nota": 1.0, "texto": "desapontou", "curtidas": [1, 7], "respostas": [], "data_postagem": "2026-02-23 21:50:00"},
    {"id_user": 10, "id_album": 42, "nota": 3.0, "texto": "esperava mais de voce taylor", "curtidas": [1, 7, 8, 9], "respostas": [], "data_postagem": "2026-02-23 21:50:00"},
    {"id_user": 6, "id_album": 42, "nota": 4.0, "texto": "eu acho que ficou decente, vocês estão exagerando", "curtidas": [1, 7], "respostas": [], "data_postagem": "2026-02-23 21:50:00"},
    {"id_user": 1, "id_album": 42, "nota": 3.5, "texto": "não era bem isso que eu esperava, mas serve eu acho", "curtidas": [], "respostas": [], "data_postagem": "2026-02-23 21:50:00"},
]

# Inserindo o username nas reviews antes de salvar
for r in reviews:
    r["username"] = pega_nome(r["id_user"])

db.reviews.insert_many(reviews)

# incluindo playlists
listas = [
    {
        "id_user": 1,
        "titulo": "Nu Metal e classicos",
        "descricao": "Aquelas pedradas que nunca envelhecem.",
        "capa_personalizada": "https://i.pinimg.com/736x/f6/39/fb/f639fb2b8eb2c11d4a78650e2470d37e.jpg",
        "albuns": [46, 47, 60, 61, 3, 7], 
        "data_criacao": "2026-02-20 15:00:00"
    },
    {
        "id_user": 1,
        "titulo": "música de chuveiro",
        "descricao": "gen z.",
        "capa_personalizada": "https://i.pinimg.com/736x/9e/17/7c/9e177c7df4bc92d09c2397a9fa7f4e34.jpg",
        "albuns": [45, 15, 42, 22, 55, 67], 
        "data_criacao": "2026-02-23 10:30:00"
    },
    {
        "id_user": 9,
        "titulo": "chill vibes",
        "descricao": "álbuns pra relaxar.",
        "capa_personalizada": "https://i.pinimg.com/736x/1e/6b/21/1e6b2114a7c2fc5768f68c3ec358ef2a.jpg",
        "albuns": [45, 15, 22, 55, 67], 
        "data_criacao": "2026-02-23 10:30:00"
    }
]

db.lists.insert_many(listas)

print("Banco resetado e povoado com sucesso!")