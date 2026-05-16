# CSI606-2026-01 - Remoto - Proposta de Trabalho Final

**Discente:** Rafael Araújo de Souza

## Resumo
O **Scorefy** será uma rede social moderna e interativa dedicada aos apaixonados por música, inspirada em plataformas consolidadas de catalogação como o *RateYourMusic*. O objetivo principal do projeto será permitir que os utilizadores descubram, avaliem, cataloguem álbuns e interajam uns com os outros através de um sistema social completo. A aplicação será planejada com foco em uma arquitetura de microsserviços estruturada com o uso de um Sistema de Gestão de Banco de Dados Não-Relacional (MongoDB), recorrendo estritamente a queries nativas de forma a evidenciar o domínio na manipulação direta de dados.

## 1. Tema
O trabalho final terá como tema o desenvolvimento de uma plataforma web voltada para a catalogação musical e interações em comunidade, focando na aplicação prática de consultas nativas e pipelines de agregação avançados sobre um banco de dados NoSQL.

## 2. Escopo
Este projeto terá como meta a implementação das seguintes funcionalidades:
* **Rede Social e Perfis Personalizáveis:** Criação de perfis contendo informações customizadas pelo usuário (como biografia e localização), além de um sistema de conexões projetado para alimentar uma timeline dinâmica com as atividades e atualizações mais recentes dos usuários seguidos.
* **Avaliações e Críticas (Reviews):** Desenvolvimento de uma seção para avaliação detalhada de álbuns por meio de notas quantitativas e resenhas textuais. O sistema preverá interações sociais nessas postagens, tais como curtidas e respostas estruturadas com suporte a menções diretas a outros membros da plataforma.
* **Central de Notificações:** Alertas estruturados para atualizar os usuários em tempo real sobre novas interações na rede, como novos seguidores, reações em suas críticas e menções em comentários.
* **Listas Customizadas (Playlists de Álbuns):** Criação e organização de coleções personalizadas de álbuns, permitindo o agrupamento temático de mídias de forma fluida. O sistema contará com recursos visuais dinâmicos para a identificação das listas, baseando-se nos elementos inclusos ou por meio de referências externas.
* **Busca Global Dinâmica e Agregações:** Mecanismos de pesquisa robustos para encontrar álbuns, artistas e usuários utilizando múltiplos filtros combinados. Pipelines de agregação do MongoDB serão propostos para processar o volume de interações e gerar seções dinâmicas automaticamente, como tendências da comunidade e os itens mais recomendados do período.

## 3. Restrições
Para delimitar o desenvolvimento do trabalho, serão consideradas as seguintes restrições:
* **Zero ORM:** Toda a comunicação técnica com o banco de dados MongoDB deverá obrigatoriamente ser construída de forma direta pelo driver nativo `pymongo`, vetando o uso de frameworks de mapeamento de objetos.
* **Sem Streaming ou Reprodução de Áudio:** O escopo do projeto focará apenas nos aspectos sociais e de catalogação de dados musicais, não contemplando tocadores internos de música ou transmissão de áudio.
* **Independência de APIs de Streaming:** Toda a massa de dados referentes a artistas e álbuns será cadastrada e gerenciada localmente nas coleções planejadas para o banco de dados, sem sincronização externa de reprodutores de terceiros.

## 4. Protótipo
Os protótipos de tela para a interface do sistema (incluindo as páginas de Login, Feed de Atividades, Perfil, Exibição de Álbuns e Criação de Listas) estão sendo cosntruídos localmente e atualizarei neste repositório.

## 5. Referências
* MONGODB. *MongoDB Documentation: Aggregation Operations*. Disponível em: <https://www.mongodb.com/docs/manual/aggregation/>.
* PALLETS PROJECTS. *Flask Documentation (v3.0.x)*. Disponível em: <https://flask.palletsprojects.com/>.
* REACT. *React Documentation: Quick Start*. Disponível em: <https://react.dev/>.
