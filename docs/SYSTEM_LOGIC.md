# Loja Leoneth – Lógica do Sistema e Casos de Uso

Este documento descreve como a plataforma Loja Leoneth é estruturada, como funcionam seus fluxos críticos e quais casos de uso cada módulo cobre. Ele consolida o conhecimento do backend Django REST (`backend/`) e do frontend Next.js (`frontend/`).

## 1. Arquitetura em Alto Nível

- **Frontend**: loja single-page em Next.js 15 (React 19) localizada em `frontend/src/app`. Renderiza seções de marketing (banners, categorias, cards de produto) e consome o backend via namespace `/api` usando Axios. Os componentes garantem responsividade e direcionam o usuário para o WhatsApp ou para páginas de detalhes. Lint via `npm run lint`.
- **Backend**: API REST em Django 5.2 (`backend/`) com Django REST Framework e SimpleJWT. Principais apps:
  - `accounts`: registro, autenticação (cliente/admin), gestão de perfil, verificação de e-mail e redefinição de senha.
  - `produtos`: catálogo (categorias, produtos, banners), intenções de compra, suporte e permissões de avaliação.
- **Persistência**: SQLite (`backend/db.sqlite3`) em desenvolvimento. Imagens de produtos e banners ficam no Cloudinary via `CloudinaryField`.
- **Envio de E-mail**: `accounts/email.py` centraliza os disparos transacionais usando `EmailMessage` do Django configurado por variáveis de ambiente (host SMTP, porta, credenciais, TLS/SSL, remetente padrão e URLs do frontend).
- **Autenticação**: tokens JWT (SimpleJWT). Fluxos de cliente e admin emitem access/refresh; rotas restritas verificam `is_staff` e permissões.

## 2. Tecnologias Utilizadas

- **Linguagens**: JavaScript/TypeScript (Next.js), Python 3.13 (Django) e SQL (SQLite).
- **Frameworks Frontend**: Next.js 15, React 19, componentes client-side com CSS Modules/Tailwind-like utilitários definidos em `globals.css`.
- **Frameworks Backend**: Django 5.2, Django REST Framework, SimpleJWT, Django Admin.
- **Infraestrutura e Serviços**:
   - Cloudinary para armazenamento de imagens (produtos, banners, fotos de avaliação).
   - SMTP configurável via `.env` (Gmail, serviços externos ou console backend para dev).
   - Docker Compose opcional (observado pelo uso de `docker compose up -d --build`).
- **Bibliotecas de Apoio**:
   - `rest_framework_simplejwt` para autenticação JWT.
   - `drf_yasg` para documentação Swagger.
   - `corsheaders` para CORS liberado ao frontend.
   - `axios` no frontend para chamadas HTTP.
   - `cloudinary` e `cloudinary_storage` para integração com CDN.
- **Ferramentas de Qualidade**: `npm run lint` (ESLint) no frontend, `python manage.py test accounts` para backend.

## 3. Modelos de Domínio Principais

### App Accounts (`backend/accounts/models.py`)

- `Customer`: 1:1 com `User` do Django. Armazena `full_name`, `phone_number`, `email_verified`. Timestamps servem a métricas administrativas.
- `EmailVerificationToken`: token aleatório de 64 caracteres, expira em 24h e é de uso único. Criado no registro.
- `PasswordResetToken`: token aleatório de 64 caracteres, expira em 2h e é de uso único. Criado no fluxo de esqueci a senha.

### App Produtos (`backend/produtos/models.py`)

- `Categoria`: agrupamentos (Feminina, Masculina) com slug para rotas.
- `TipoItem`: granularidade adicional (Blusa, Calça) também com slug.
- `Produto`: nome, descrição, preço, imagem Cloudinary, categoria, tipo, `link_whatsapp`, `em_destaque` e `estoque`.
- `Banner`: imagem Cloudinary ativada/desativada via flag `ativo` para o carrossel inicial.
- `Contato`: textos institucionais (endereço, Instagram, sobre).
- `TipoAvaliacao`: classifica avaliações (ex.: Experiência no WhatsApp, Qualidade do produto).
- `Avaliacao`: review vinculado a produto/tipo com comentário, `nome_completo`, nota 0-10 (validação), `usuario` opcional, campos de verificação (`compra_verificada`, `verificado_por`, `verificado_em`) e `foto_produto`. Constraint impede duas avaliações do mesmo usuário autenticado para o mesmo produto.
- `PedidoIntencao`: registra a intenção originada do CTA do WhatsApp. Guarda `status` (`aguardando`, `concluida`, `cancelada`), timestamps, observações, dados de contato e quem confirmou. Mudanças de status sincronizam permissões de avaliação.
- `AllowedRating`: whitelist que habilita o cliente a enviar review após compra. Criada quando a intenção vira `concluida`, expira em 30 dias e é marcada como usada após o envio da avaliação. Intenções canceladas removem permissões pendentes.
- `Suporte`: chamado aberto pelo cliente contendo mensagem, produto relacionado, tipo de suporte, contato e e-mail.

## 4. Lógica de E-mail

Arquivo: `backend/accounts/email.py`

1. **Configuração**: lê `EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, `EMAIL_USE_SSL`, `DEFAULT_FROM_EMAIL`, `FRONTEND_BASE_URL`, `FRONTEND_VERIFY_EMAIL_PATH`, `FRONTEND_RESET_PASSWORD_PATH` do `.env`. `DEFAULT_FROM_EMAIL` usa `EMAIL_HOST_USER` como fallback.
2. **Envio**: `_send_basic_email` monta um `DjangoEmailMessage`, anexa arquivos opcionais (validando caminhos) e dispara pelo backend configurado. Falhas levantam `EmailDeliveryError` após logar o contexto.
3. **Templates**:
   - `send_verification_email(user, token)`: instrução em texto e link `FRONTEND_BASE_URL + FRONTEND_VERIFY_EMAIL_PATH + ?token=<token>`.
   - `send_password_reset_email(user, token)`: link análogo apontando para `FRONTEND_RESET_PASSWORD_PATH`.
4. **Tratamento de erros**: as views capturam `EmailDeliveryError`, registram logs informativos e respondem ao cliente de forma amigável (202 Accepted no registro, 503 Service Unavailable no esqueci a senha) preservando o estado da conta.

## 5. Lógica das APIs e Casos de Uso

### 4.1 Registro e Confirmação de E-mail

1. **Endpoint**: `POST /api/client/auth/register/` (`RegisterView`).
2. **Fluxo**:
   - Valida payload com `RegisterSerializer` (e-mail único, senha forte).
   - Cria `User` (username=email) e `Customer`.
   - Gera `EmailVerificationToken` e tenta enviar o e-mail.
   - Resposta: `201 Created` se o envio ocorrer; `202 Accepted` com aviso se falhar.
3. **Caso de uso**: novo cliente deseja criar conta para comprar; exige confirmação de e-mail antes de liberar acesso completo.

### 4.2 Verificação de E-mail

1. **Endpoint**: `POST /api/client/auth/verify-email/` com `{ token }`.
2. **Fluxo**:
   - `EmailVerificationSerializer` garante existência, validade e não uso do token.
   - Marca `Customer.email_verified = True` e o token como usado.
   - Emite par JWT via `TokenPairSerializer` permitindo login imediato.
3. **Caso de uso**: ativar a conta e liberar ações protegidas.

### 4.3 Login do Cliente

1. **Endpoint**: `POST /api/client/auth/login/`.
2. **Regras** (`LoginSerializer`): aceita e-mail, username, telefone ou nome completo como identificador.
   - Tenta autenticar por e-mail, username literal, telefone (apenas dígitos) ou nome completo.
   - Sempre exige senha válida via `authenticate`.
3. **Bloqueio**: se o `Customer` existir, mas `email_verified=False`, retorna 403 com mensagem de confirmação pendente.
4. **Resposta**: tokens de acesso e refresh.

### 4.4 Esqueci e Redefinição de Senha

1. **Esqueci**: `POST /api/client/auth/forgot/`.
   - Valida o e-mail, cria `PasswordResetToken` e tenta enviar o link.
   - Em caso de falha no envio, responde 503; o token continua válido para nova tentativa.
2. **Reset**: `POST /api/client/auth/reset/` com `{ token, password }`.
   - Verifica token, expiração e uso único; aplica validadores de senha; persiste `User.set_password` e marca o token como usado.
3. **Caso de uso**: recuperar acesso com link seguro enviado por e-mail.

### 4.5 Perfil do Cliente

1. **Endpoint**: `GET/PATCH /api/client/profile/` (requer autenticação).
2. **GET**: retorna `CustomerSerializer` com nome, e-mail, status de verificação e telefone.
3. **PATCH**: `UpdateCustomerSerializer` garante dados válidos e replica `full_name` para `User.first_name`.
4. **Caso de uso**: permitir que o cliente gerencie seus dados básicos.

### 4.6 Autenticação e Dashboard de Admin

1. **Login Admin**: `POST /api/admin/auth/login/` reutiliza `LoginSerializer`, mas exige `user.is_staff`.
2. **Refresh**: `POST /api/admin/auth/token/refresh/` (SimpleJWT).
3. **Dashboard**: `GET /api/admin/dashboard/` (somente staff).
   - Calcula métricas: clientes totais/pedentes/novos (7 dias), intenções por status e criadas recentemente, reviews pendentes, permissões ativas e a expirar.
   - Usa agregações ORM (Count, filtros por data).
4. **Caso de uso**: oferecer visão operacional para acompanhamento de leads e avaliações.

### 4.7 Navegação de Catálogo e Detalhe (Frontend)

- `Categoria` e `TipoItem` alimentam componentes como `src/app/categoria/CategorySection.js` e `components/listarCategoria.js`.
- `ProductCard` mostra imagem, preço e botão que abre `link_whatsapp` em vez de carrinho tradicional.
- Páginas de detalhe exibem estoque, descrição e botão "Fale no WhatsApp".
- **Caso de uso**: visitante explora coleções curadas e inicia atendimento no WhatsApp para fechar o pedido.

### 4.8 Pipeline de Intenções de Compra

1. Ao iniciar contato pelo WhatsApp, o admin registra um `PedidoIntencao` ligando usuário ao produto.
2. Evolução de status:
   - `aguardando`: padrão enquanto a conversa está em andamento.
   - `concluida`: venda confirmada; cria `AllowedRating` (expira em 30 dias) e zera `used_at`.
   - `cancelada`: remove permissões de avaliação não utilizadas.
3. Admins podem registrar endereço, observações e quem confirmou.
4. **Caso de uso**: acompanhar pipeline de vendas e controlar quem pode avaliar.

### 4.9 Gestão de Avaliações

1. **Permissões**: apenas usuários com `AllowedRating` ativo podem enviar reviews verificados; `PedidoIntencao.marcar_status` cria/remove essas permissões.
2. **Avaliacao**: armazena nota 0-10, comentário, foto opcional e metadados. Admins marcam `compra_verificada` e o responsável.
3. **Caso de uso**: coletar depoimentos autênticos após compras confirmadas.

### 4.10 Banners e Conteúdo de Marketing

- Administra `Banner` (ativo/inativo) exibido em `src/app/banners/Banners.js`.
- Dados de `Contato` abastecem rodapé e página de contato (`src/app/contato/page.js`).

### 4.11 Solicitações de Suporte

- O modelo `Suporte` registra mensagens de ajuda com referência ao produto, tipo de suporte, telefone e e-mail para retorno.

## 5. Configuração de Ambiente

1. **.env** (raiz do backend): guarda chaves Cloudinary, URLs do frontend, SMTP, tempo de JWT etc. Exemplo:
   
   ```dotenv
   FRONTEND_BASE_URL=http://localhost:3000
   FRONTEND_VERIFY_EMAIL_PATH=/auth/verify-email
   FRONTEND_RESET_PASSWORD_PATH=/auth/reset-password
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=true
   EMAIL_HOST_USER=ms1442877@gmail.com
   EMAIL_HOST_PASSWORD=<senha_de_app>
   DEFAULT_FROM_EMAIL=ms1442877@gmail.com
   ```
   
2. **Execução local**:
   
   ```powershell
   cd backend
   C:/Users/<usuario>/AppData/Local/Programs/Python/Python313/python.exe -m pip install -r requirements.txt
   C:/Users/<usuario>/AppData/Local/Programs/Python/Python313/python.exe manage.py migrate
   C:/Users/<usuario>/AppData/Local/Programs/Python/Python313/python.exe manage.py runserver
   ```
   
   Frontend: `cd frontend && npm install && npm run dev`.
3. **Testes**: `python manage.py test accounts` cobre fluxos de autenticação/e-mail; frontend usa `npm run lint`.

## 6. Matriz Detalhada de Casos de Uso

| Caso de uso | Atores | Gatilho | Componentes backend | Resultado |
| --- | --- | --- | --- | --- |
| Navegar catálogo | Visitante | Acessa homepage | Endpoints de `Categoria`, `Produto`, `Banner` | Listas responsivas com CTA do WhatsApp |
| Registrar conta | Visitante | Envia formulário | `RegisterSerializer`, `RegisterView`, `EmailVerificationToken`, `send_verification_email` | Conta criada e e-mail disparado |
| Confirmar e-mail | Novo cliente | Clica no link do e-mail | `EmailVerificationSerializer`, `VerifyEmailView`, emissão JWT | E-mail marcado como verificado e tokens retornados |
| Login | Cliente | Envia credenciais | `LoginSerializer`, `LoginView`, SimpleJWT | Tokens de acesso e refresh |
| Esqueci a senha | Cliente | Solicita redefinição | `ForgotPasswordSerializer`, `PasswordResetToken`, `send_password_reset_email` | Recebe link de redefinição |
| Redefinir senha | Cliente | Usa link recebido | `ResetPasswordSerializer`, `ResetPasswordView` | Senha atualizada, token consumido |
| Atualizar perfil | Cliente autenticado | Edita dados | `CustomerProfileView`, `UpdateCustomerSerializer` | Perfil persistido |
| Registrar intenção | Cliente/Admin | Conversa no WhatsApp gera interesse | Criação de `PedidoIntencao` | Pipeline de vendas acompanhado |
| Concluir venda | Admin | Compra confirmada | `PedidoIntencao.marcar_status`, `AllowedRating.update_or_create` | Permissão de review concedida |
| Enviar avaliação | Cliente | Preenche formulário | `Avaliacao`, uso de `AllowedRating` | Depoimento salvo e permissão marcada |
| Login/Dashboard admin | Staff | Acessa painel | `AdminLoginView`, `AdminDashboardView` | Métricas operacionais |
| Gerenciar banners/contato | Staff | Atualiza conteúdo | Modelos/rotas `Banner` e `Contato` | Conteúdo do site sincronizado |
| Solicitar suporte | Cliente | Envia formulário | Modelo `Suporte` | Ticket registrado |

## 7. Observações Operacionais

- **Logs de erro**: todo fracasso no envio de e-mail gera log com e-mail do destinatário. Os testes simulam falhas (mockando `send_*_email`) para garantir o tratamento correto.
- **Segurança**: não existe carrinho/checkout interno; vendas finalizam no WhatsApp, evitando trânsito de dados sensíveis. Tokens JWT ficam no cliente; o backend protege rotas administrativas via `is_staff`.
- **Extensibilidade**: `AllowedRating` separa confirmação de compra do envio do review, permitindo automações futuras (ex.: lembrete automático). Campos `CloudinaryField` podem ser substituídos por storage local se necessário.

---

Este arquivo serve como referência rápida para quem está entrando no projeto, mostrando como cada funcionalidade conecta ações do frontend a registros no banco e aos fluxos de e-mail.
