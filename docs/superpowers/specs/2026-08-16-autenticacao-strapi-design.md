# Autenticação completa com Strapi

## Objetivo

Implementar autenticação completa no frontend Next.js usando o Strapi 5.52 como autoridade de identidade, com cadastro público, confirmação de e-mail, login por senha e Google, recuperação e alteração de senha, renovação de sessão, logout e proteção da área do aluno.

O frontend será publicado separadamente do backend no Dokploy. O PostgreSQL será o banco de dados do Strapi e os dois projetos terão imagens Docker próprias.

## Escopo

Esta entrega inclui:

- Cadastro público por e-mail e senha
- Confirmação obrigatória de e-mail
- Reenvio de confirmação
- Login por e-mail e senha
- Login com Google OAuth 2.0
- Recuperação e redefinição de senha
- Alteração de senha por usuário autenticado
- Renovação automática da sessão
- Logout com revogação da sessão
- Proteção da rota localizada `/dashboard`
- Redirecionamento para o destino original após autenticação
- Mensagens de autenticação em `pt-br`, `en-us` e `fr-fr`
- Configuração SMTP genérica por variáveis de ambiente
- Configuração reproduzível do Users & Permissions
- PostgreSQL local para validação integrada
- Dockerfiles independentes para Next.js e Strapi
- Arquivos de exemplo de ambiente e documentação operacional

Não fazem parte desta entrega:

- Login com provedores diferentes do Google
- Painel administrativo próprio no frontend
- Gestão visual de todas as sessões ativas
- Autenticação multifator
- Migração do conteúdo estático atual para o Strapi

O painel nativo do Strapi será usado para administração. A rota `/admin` do frontend deixará de representar uma área administrativa do produto.

## Arquitetura

O Next.js funcionará como Backend for Frontend para autenticação. O navegador acessará somente Route Handlers em `/api/auth/*`. Esses handlers validarão a entrada, chamarão a API do Strapi e converterão as credenciais emitidas pelo Strapi em cookies seguros do domínio do frontend.

O access token e o refresh token não serão expostos ao JavaScript. Ambos serão armazenados em cookies `HttpOnly`, com `SameSite=Lax`, `Secure` em produção e duração compatível com a configuração de sessão do Strapi. Os cookies não conterão senha, código de confirmação ou credenciais do Google.

O `proxy.ts` verificará rotas privadas. A presença do cookie não será tratada como prova de autenticação: o fluxo validará o access token no Strapi e tentará uma única rotação do refresh token quando necessário. Uma falha de validação ou renovação apagará a sessão local e redirecionará para o login com um parâmetro de retorno limitado a caminhos internos.

O Strapi continuará responsável por usuários, senhas, confirmação de e-mail, provedores, emissão e rotação de tokens, bloqueio de conta e revogação de sessão. O Next.js não manterá uma segunda base de usuários nem emitirá tokens próprios.

## Componentes do frontend

### Cliente Strapi no servidor

Um módulo exclusivo do servidor centralizará chamadas de autenticação ao Strapi, timeouts, leitura segura de respostas e normalização de falhas. A URL interna do Strapi será usada nas comunicações entre containers. Nenhum componente cliente importará esse módulo.

### Sessão

Um módulo de sessão será responsável pelos nomes, atributos, leitura, gravação e remoção dos cookies. Outro módulo coordenará validação do usuário atual e renovação de tokens para evitar lógica duplicada entre Route Handlers, páginas protegidas e proxy.

### Route Handlers

Serão criados handlers para:

- Cadastro
- Login local
- Início do login Google
- Callback do Google
- Consulta da sessão atual
- Renovação
- Logout
- Esqueci a senha
- Redefinição de senha
- Reenvio de confirmação
- Alteração de senha

Os handlers que modificam estado aceitarão somente o método esperado, JSON com tamanho limitado e requisições de origem válida. As respostas públicas usarão um contrato estável do frontend, sem repassar mensagens internas do Strapi.

### Páginas

As páginas localizadas cobrirão login, cadastro, aviso de confirmação, confirmação concluída, solicitação de recuperação, redefinição e segurança da conta. O layout atual será preservado e os novos controles seguirão os estilos existentes.

O espaço reservado para provedor social será substituído por um botão funcional do Google. O cabeçalho apresentará entrada ou informações da sessão e logout conforme o estado autenticado. O dashboard será protegido e exibirá um acesso para alteração de senha.

### Internacionalização

As novas mensagens serão adicionadas aos três arquivos JSON existentes e ao tipo `Dictionary`. Mensagens de validação serão definidas pelo frontend. Erros internos do Strapi serão mapeados para códigos públicos conhecidos antes de serem traduzidos.

## Componentes do backend

### Users & Permissions

O plugin permanecerá em `jwtManagement: "refresh"`. A configuração de sessões será adequada ao uso pelo BFF, permitindo que o Next.js receba os tokens na comunicação interna e defina os próprios cookies do domínio público.

O bootstrap aplicará de forma idempotente as configurações necessárias:

- Cadastro público habilitado
- E-mail único habilitado
- Confirmação obrigatória habilitada
- Função autenticada como função padrão
- URL de redefinição apontando para uma rota não localizada do frontend
- Redirecionamento de confirmação apontando para uma rota não localizada do frontend
- Provedor Google habilitado somente quando todas as credenciais estiverem presentes

As rotas não localizadas serão convertidas pelo proxy de internacionalização para o idioma persistido no cookie, preservando os parâmetros de confirmação ou redefinição.

### Google OAuth

O Strapi iniciará e concluirá a comunicação com o Google. A URL autorizada no Google apontará para o callback público do Strapi. Depois da autorização, o Strapi redirecionará para um callback do Next.js, que concluirá a troca pelo JWT e pelo refresh token do Users & Permissions, gravará os cookies e removerá credenciais da URL final.

As chaves do Google serão lidas exclusivamente de variáveis de ambiente. O callback aceito pelo Strapi será restrito à origem pública configurada do frontend.

### E-mail

O backend usará `@strapi/provider-email-nodemailer`. Host, porta, modo seguro, usuário, senha, remetente e endereço de resposta serão configuráveis. Os templates de confirmação e recuperação serão configurados para gerar links para as rotas previstas nesta especificação.

O fluxo de recuperação sempre retornará sucesso ao cliente, mesmo quando a conta não existir ou estiver bloqueada. Essa propriedade já existe no controlador do Strapi e será preservada pelo BFF.

### PostgreSQL

A conexão aceitará `DATABASE_URL` ou os campos separados já suportados em `config/database.ts`. SSL e rejeição de certificados serão configuráveis. O ambiente local usará um serviço PostgreSQL com volume persistente e health check.

## Fluxos

### Cadastro e confirmação

1. O usuário informa e-mail, senha e confirmação.
2. O frontend valida formato, igualdade e requisitos mínimos.
3. O BFF usa o e-mail normalizado também como `username` interno.
4. O Strapi cria uma conta local ainda não confirmada e envia o e-mail.
5. O frontend mostra uma tela neutra com opção de reenvio.
6. O link passa pelo endpoint de confirmação do Strapi.
7. Após o consumo do token, o usuário retorna ao frontend e pode entrar.

### Login local

1. O usuário informa e-mail e senha.
2. O BFF envia as credenciais ao endpoint local do Strapi.
3. Contas inexistentes ou senhas inválidas recebem o mesmo erro público.
4. Conta não confirmada recebe uma ação para reenviar a mensagem.
5. Em caso de sucesso, o BFF grava os cookies e redireciona para um caminho interno previamente solicitado ou para o dashboard.

### Login Google

1. O usuário inicia o fluxo pelo botão Google.
2. O BFF registra um destino interno permitido e redireciona ao conector Google do Strapi.
3. O Strapi usa `state` na sessão OAuth e conclui o callback do Google.
4. O callback do Next.js troca a credencial do provedor por tokens do Strapi.
5. O BFF grava os cookies e redireciona sem tokens na URL.

### Recuperação

1. O usuário informa o e-mail.
2. O BFF solicita a recuperação ao Strapi.
3. A resposta pública é sempre a mesma.
4. O link recebido contém um código de uso único e chega à página de redefinição.
5. O BFF envia o código e a nova senha ao Strapi.
6. O Strapi invalida tokens antigos e emite uma nova sessão.

### Renovação e logout

1. A sessão é validada no Strapi antes de liberar conteúdo privado.
2. Um access token expirado aciona uma única rotação do refresh token.
3. Os dois cookies são atualizados de forma atômica quando a rotação funciona.
4. Uma falha remove ambos e exige novo login.
5. O logout solicita a revogação ao Strapi antes de apagar os cookies locais.

### Alteração de senha

1. O usuário informa senha atual, nova senha e confirmação.
2. O BFF envia a alteração autenticada ao Strapi.
3. O Strapi valida a senha atual, altera a credencial e invalida sessões anteriores.
4. A nova sessão substitui os cookies atuais.

## Segurança

- Tokens não serão armazenados em `localStorage`, `sessionStorage` ou estado React persistido.
- Cookies de autenticação serão `HttpOnly`, `SameSite=Lax`, `Secure` em produção e terão caminho restrito ao necessário.
- Redirecionamentos aceitarão somente caminhos locais iniciados por `/` e rejeitarão URLs com host.
- Requisições de alteração de estado validarão `Origin` contra a origem pública do frontend.
- Respostas e logs não incluirão senha, token, código ou segredo.
- O CORS do Strapi aceitará apenas origens configuradas.
- O rate limit do Users & Permissions permanecerá nos endpoints sensíveis.
- Mensagens de login não distinguirão conta inexistente de senha inválida.
- A recuperação de senha não revelará a existência da conta.
- Segredos reais não serão versionados.
- Produção exigirá HTTPS para frontend, Strapi e callbacks externos.

## Tratamento de erros

O BFF mapeará erros conhecidos para códigos públicos como `INVALID_CREDENTIALS`, `EMAIL_NOT_CONFIRMED`, `ACCOUNT_BLOCKED`, `EMAIL_ALREADY_USED`, `INVALID_RESET_CODE`, `RATE_LIMITED` e `SERVICE_UNAVAILABLE`.

Os formulários exibirão erros de campo para validação local e uma mensagem geral para falhas remotas. Estados de envio impedirão submissão duplicada. Falhas de rede terão timeout e permitirão nova tentativa. Exceções não reconhecidas serão registradas sem conteúdo sensível e apresentadas como indisponibilidade temporária.

## Docker e Dokploy

O frontend terá uma imagem multi-stage com `output: "standalone"`, usuário não privilegiado e health check HTTP. Somente variáveis públicas indispensáveis entrarão no build; URLs internas e segredos serão fornecidos em runtime.

O backend terá uma imagem multi-stage para construir o painel do Strapi e iniciar em modo de produção com usuário não privilegiado. O diretório de uploads será preparado para volume persistente. A imagem não conterá o arquivo `.env` local.

O `compose.yaml` na raiz comum servirá apenas ao desenvolvimento e à validação local, reunindo frontend, backend e PostgreSQL. No Dokploy, cada aplicação poderá usar seu próprio Dockerfile e compartilhar a rede interna com o banco gerenciado pelo painel.

As configurações distinguirão:

- URL pública do frontend
- URL pública do Strapi
- URL interna do Strapi acessível pelo Next.js
- URL do PostgreSQL
- Origens CORS
- Credenciais SMTP
- Credenciais Google
- Segredos do Strapi

## Testes

O frontend ganhará uma base de testes compatível com Next.js e TypeScript. Os testes unitários e de integração cobrirão:

- Validação e normalização dos dados dos formulários
- Mapeamento de erros do Strapi
- Atributos e remoção dos cookies
- Rejeição de redirecionamentos externos
- Login bem-sucedido e inválido
- Cadastro aguardando confirmação
- Recuperação com resposta neutra
- Renovação única e encerramento após falha
- Proteção do dashboard
- Logout e alteração de senha
- Contratos dos callbacks do Google

A validação integrada local usará Strapi e PostgreSQL reais para cadastro, confirmação controlada, login, renovação, recuperação e logout. O build de produção e os health checks das duas imagens também serão executados.

Google OAuth e envio SMTP real dependerão das credenciais fornecidas pelo operador. Sem elas, os testes automatizados validarão os contratos e o comportamento de configuração, mas não alegarão que houve entrega externa pelo Google ou pelo servidor de e-mail.

## Critérios de aceite

- Um visitante cria conta e recebe solicitação de confirmação.
- Uma conta não confirmada não consegue login local.
- Uma conta confirmada entra e acessa o dashboard.
- O login Google cria ou recupera uma conta e abre uma sessão do Strapi.
- O usuário solicita e conclui a redefinição de senha sem exposição da existência da conta.
- O usuário autenticado altera a senha informando a senha atual.
- Uma sessão com access token expirado é renovada uma vez.
- Uma sessão inválida é removida e redirecionada ao login.
- O logout revoga a sessão no Strapi e remove os cookies.
- Nenhum token de autenticação fica acessível ao JavaScript do navegador.
- Todos os fluxos exibem textos nos três idiomas suportados.
- Frontend e backend compilam em imagens Docker independentes.
- O conjunto local funciona com PostgreSQL e passa pelos testes automatizados.
- Nenhum comentário é adicionado ao código novo ou alterado.
