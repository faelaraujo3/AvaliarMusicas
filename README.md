# Scorefy - Rede Social de Avaliação Musical

**Discente:** Rafael Araújo de Souza

## 🎵 Sobre o Projeto
O **Scorefy** é uma plataforma web moderna e interativa desenvolvida para a comunidade de fãs de música. Inspirado no formato de plataformas consolidadas como o *Letterboxd*, o Scorefy atua como uma rede social focada em música onde os usuários podem catalogar, avaliar e debater sobre seus álbuns, EPs e singles favoritos.

Ao contrário do que foi previsto na proposta inicial, o sistema não depende exclusivamente de dados manuais para seu funcionamento. O grande diferencial técnico é a **integração nativa em tempo real com a API Pública do Deezer**, permitindo que todo o acervo mundial de artistas e lançamentos esteja instantaneamente disponível na plataforma.

## 🚀 Funcionalidades Atuais

* **Busca Global em Tempo Real:** Sistema de pesquisa inteligente integrado ao banco de dados do Deezer que permite pesquisar artistas, faixas e álbuns. Além disso, conta com Filtros de Pesquisa por Ano de Lançamento.
* **Sistema Avançado de Avaliações (Reviews):** 
  * Notas gerais para os álbuns (escala de até 5 estrelas).
  * Notas exclusivas e detalhadas para **cada faixa** individual do álbum.
  * Resenhas em formato de texto rico, com suporte nativo a **GIFs** e imagens diretamente no corpo do comentário.
* **Rede Social Integrada:**
  * **Feed de Atividades Global:** Uma *timeline* dinâmica que reúne as avaliações mais recentes de toda a comunidade.
  * **Threads de Discussão:** As avaliações de outros usuários podem ser respondidas de forma alinhada, criando *threads* (fóruns) diretos sobre a opinião de um disco.
  * **Interações:** Sistema de curtidas nas críticas (likes).
* **Perfis e Conexões:** 
  * Perfis de usuário customizáveis com fotos e biografias.
  * Sistema de "Seguidores" e "Seguindo".
* **Central de Notificações Inteligente:** O usuário é alertado de forma contextual sempre que alguém interage com seu perfil, curte sua resenha ou responde ao seu comentário, tudo gerenciado por preferências do usuário.

## 🛠️ Tecnologias Utilizadas

A arquitetura do Scorefy foi dividida e construída com foco em desempenho, integração de APIs e escalabilidade:

### Front-end
* **React JS**: Biblioteca principal para a criação das interfaces de usuário responsivas e baseadas em componentes.
* **Vite**: Ferramenta de *build* moderna utilizada para garantir um desenvolvimento super rápido e empacotamento otimizado.
* **Design e UI/UX**: Interface Premium, focada no estilo *Glassmorphism* (efeitos de vidro translúcidos), *Dark Mode* vibrante, tipografias modernas, e animações/micro-interações projetadas para máximo engajamento e beleza estética.

### Back-end
* **Python**: Linguagem principal do servidor.
* **Flask**: Framework *micro-web* responsável por fornecer as rotas (REST API) que o Front-end consome.
* **Integração Externa (Deezer API)**: Comunicação síncrona via HTTP para buscar catálogo fonográfico oficial de forma automatizada e em tempo real, armazenando esses dados no banco local por mecanismo de cache.
* **Docker**: Containerização do ecossistema do servidor.

### Banco de Dados
* **MongoDB (NoSQL)**: O banco principal da aplicação, utilizando o driver oficial `pymongo`. O projeto cumpre o desafio de usar consultas e agregações puras no banco de dados não-relacional, eliminando completamente a dependência de frameworks ORM.

## 🔮 O que vem por aí (Próximos Passos)
O sistema está em contínua evolução. Entre as próximas funcionalidades planejadas, destacam-se:
* **Listening Diary (Diário de Escutas):** Um espaço no perfil para acompanhar e catalogar cronologicamente o que o usuário está ouvindo mês a mês.
* **Playlists/Listas Customizadas:** Uma ferramenta para o usuário criar ranqueamentos pessoais, como "Top 10 Álbuns do Ano", e compartilhar com a comunidade.

---
*Projeto desenvolvido para a disciplina CSI606-2026-01 (Trabalho Final).*
