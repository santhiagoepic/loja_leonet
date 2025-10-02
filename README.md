# 🛍️ Loja Leonet

Projeto **fullstack** para uma loja virtual, utilizando **Django** no backend e **Next.js** no frontend.

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

- **Framework:** Django 5.2 + Django REST Framework  
- **Banco de Dados:** SQLite  
- **Principais Apps:**  
  - `core`: Configurações do projeto  
  - `produtos`: Modelos, views e APIs de produtos, categorias, banners, avaliações e suporte  
- **Integração:** Cloudinary para upload e gerenciamento de imagens  

### 🚀 Como rodar o backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

O backend rodará em: http://127.0.0.1:8000/

### 🎨 Frontend (Next.js + React)

Framework: Next.js

Principais páginas:

- /feminino
- /masculino
- /infantil
- /acessorios

Consome as APIs fornecidas pelo backend

🚀 Como rodar o frontend

```bash
frontend
npm install
npm run dev
```

O frontend rodará em: http://localhost:3000/

### 🛠️ Funcionalidades

- Listagem de produtos por categoria e tipo
- Exibição de destaques, banners e informações de contato
- Sistema de avaliações de produtos (CRUD completo)
- Suporte ao cliente integrado
- Integração de imagens via Cloudinary

### 🌐 APIs Disponíveis

 - Home:

     - GET /api/home/ → Dados para página inicial

 - Produtos:

     - GET /api/produtos_feminina/

     - GET /api/produtos_masculina/

     - GET /api/produtos_infantil/

     - GET /api/produtos_acessorios/

 - Avaliações:

     - GET/POST/PUT/DELETE /api/avaliacoes/

- Suporte ao Cliente:

     -  GET/POST /api/suporte/

### ⚠️ Observações Importantes

 - Configure corretamente as credenciais do Cloudinary no backend.

 - O frontend espera que o backend esteja rodando em http://127.0.0.1:8000

### 👨‍💻 Desenvolvido por

 - Mateus Santiago
 - Rick José
 - Elvis Almeida
 - Rebeka Ferreira
 - Sinara Bonilha

Fullstack e-commerce com Django + Next.js.