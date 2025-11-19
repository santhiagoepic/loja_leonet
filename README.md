# 🛍️ Loja Leonet

Projeto **fullstack** para uma loja virtual, utilizando **Django** no backend e **Next.js** no frontend. A plataforma oferece catálogo completo, intenções de compra, central de suporte autenticada e painel administrativo.

---

## 📂 Estrutura do Projeto

```bash
backend/
core/
produtos/
db.sqlite3
manage.py
requirements.txt

frontend/
src/
public/
package.json
next.config.mjs
```

---

## ⚙️ Backend (Django)

- **Framework:** Django 5.2 + Django REST Framework + SimpleJWT  
- **Banco de Dados:** SQLite (pode ser trocado por Postgres facilmente)  
- **Principais Apps:**  
    - `core`: Configurações globais, Swagger e roteamento  
    - `produtos`: Produtos, categorias, banners, suporte, intenções de compra e avaliações  
    - `accounts`: Registro, autenticação JWT, verificação de e-mail, resets de senha e painel admin  
- **Integrações:** Cloudinary (imagens) e SMTP para envio de e-mail transacional  

### 🚀 Como rodar o backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

O backend rodará em: <http://127.0.0.1:8000/>

### ✅ Testes automatizados

```bash
cd backend
python manage.py test produtos
```

> Esses testes cobrem o fluxo completo de intenções, AllowedRatings e CRUD administrativo.

### 🔐 Autenticação e perfis

- Clientes se registram via `POST /api/client/auth/register/`, recebem token de verificação e só podem logar após confirmar o e-mail.
- JWT é gerenciado com SimpleJWT (`/api/client/auth/login/`, `/auth/refresh/`, `/auth/token-verify/`).
- Fluxos de esqueci/reset de senha expostos em `/auth/forgot-password/` e `/auth/reset-password/`.
- Há rotas equivalentes para administradores sob `/api/admin/auth/*`.

### 🛒 Fluxo de intenção de compra e avaliações

1. Cliente cria uma intenção em `/api/pedidos-intencao/`.
2. Administrador confirma/cancela no mesmo endpoint (requer staff).
3. Ao concluir uma compra, o sistema gera automaticamente um registro `AllowedRating` válido por 30 dias.
4. Apenas enquanto a permissão estiver ativa (e não utilizada) o cliente consegue avaliar (`POST /api/avaliacoes/`).

### 🧰 Pré-requisitos

- Arquivo `.env` com as credenciais:
    - `CLOUDINARY_URL`
    - `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_PORT`, `EMAIL_USE_TLS`
- Configure variável `FRONTEND_URL` para e-mails com link correto.
- Para testes que envolvem Cloudinary, usamos mocking — basta rodar `python manage.py test`.

### 🎨 Frontend (Next.js + React)

- Framework: Next.js 14 (App Router) + TailwindCSS
- Contexto de autenticação com JWT (clientes logados carregam tokens no `AuthProvider`)
- Páginas principais: `/`, `/feminino`, `/masculino`, `/infantil`, `/acessorios`, `/suporte`, `/conta`
- Nova central de suporte exibe métricas pessoais, histórico de chamados e formulário inteligente

🚀 Como rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend rodará em: <http://localhost:3000/>

### 🛠️ Funcionalidades em destaque

- **Catálogo inteligente** por categoria/tipo com banners e destaques.
- **Intenções de compra** com fluxo cliente → staff, integradas ao AllowedRating.
- **Central de suporte autenticada**: cada cliente vê apenas seus chamados, abre tickets com preenchimento automático e acompanha métricas pessoais.
- **Sistema de avaliações verificado** com upload obrigatório de foto e expiração configurável dos tokens.
- **Painel administrativo** completo (produtos, banners, clientes, AllowedRatings, pedidos) via `/api/admin/*`.
- **Integração com Cloudinary** para imagens e envio de e-mails transacionais.

### 🌐 APIs Disponíveis

- **Home & Conteúdo**
    - `GET /api/home/`
    - `GET /api/banners/`
    - `GET /api/contato/`
- **Produtos**
    - `GET /api/produtos_feminina/`
    - `GET /api/produtos_masculina/`
    - `GET /api/produtos_infantil/`
    - `GET /api/produtos_acessorios/`
    - `GET /api/produtos/?category=...`
    - `GET /api/produtos/<id>/`
- **Intenções de Compra**
    - `GET|POST /api/pedidos-intencao/` (cliente)
    - `PATCH|DELETE /api/pedidos-intencao/<id>/` (admin)
- **Avaliações**
    - `GET /api/avaliacoes/?produto_id=...`
    - `POST /api/avaliacoes/` (requer AllowedRating ativo)
    - `PATCH|DELETE /api/avaliacoes/<id>/` (staff/autor)
- **Suporte ao Cliente**
    - `GET|POST /api/suporte/` (autenticado, retorna chamados do usuário)
- **Autenticação do Cliente**
    - `POST /api/client/auth/register/`
    - `POST /api/client/auth/login/`
    - `POST /api/client/auth/refresh/`
    - `POST /api/client/auth/token-verify/`
    - `POST /api/client/auth/verify-email/`
    - `POST /api/client/auth/forgot-password/`
    - `POST /api/client/auth/reset-password/`
    - `GET|PATCH /api/client/me/`
- **Autenticação do Admin**
    - `POST /api/admin/auth/login/`
    - `POST /api/admin/auth/refresh/`
    - `POST /api/admin/auth/token-verify/`
    - `GET /api/admin/dashboard/summary/`
- **Admin Recursos (JWT staff obrigatório)**
    - `CRUD /api/admin/produtos/` (com `POST /<id>/atualizar-estoque/`)
    - `CRUD /api/admin/categorias/`
    - `CRUD /api/admin/banners/`
    - `CRUD /api/admin/avaliacoes/`
    - `GET|PATCH /api/admin/clientes/`
    - `CRUD /api/admin/allowed-ratings/`
    - `CRUD /api/admin/configuracoes/` (dados de contato)

### ⚠️ Observações Importantes

- Configure corretamente as credenciais do Cloudinary no backend.
- O frontend espera que o backend esteja rodando em <http://127.0.0.1:8000>.
- Documentação Swagger disponível em <http://127.0.0.1:8000/swagger/> (use "Authorize" com Bearer JWT).

### 📄 Recursos adicionais

- Documento de apresentação para a faculdade: veja `docs/apresentacao-loja-leonet.md` (contém roteiro de pitch e destaques visuais).

### 👨‍💻 Desenvolvido por

- Mateus Santiago
- Rick José
- Elvis Almeida
- Rebeka Ferreira
- Sinara Bonilha

Fullstack e-commerce com Django + Next.js.
