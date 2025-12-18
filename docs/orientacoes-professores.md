# Orientações para Professores Avaliadores

Bem-vindos à avaliação do sistema Loja Leoneth!

Este documento traz orientações para facilitar a análise e navegação dos professores durante a avaliação do sistema.

## Como acessar
- O sistema está disponível em ambiente local (localhost) ou pode ser hospedado conforme instruções do README.
- Existem dois perfis principais: **Administrador** (painel /admin) e **Cliente** (loja pública).

## Recomendações de Avaliação

### 1. Fluxo do Cliente
- Navegue pela loja, busque produtos, filtre por categoria.
- Visualize detalhes dos produtos.
- Realize uma intenção de compra (não há pagamento online, apenas registro de interesse).
- Teste o cadastro, login e edição de perfil.
- Avalie um produto após registrar intenção de compra.

### 2. Fluxo do Administrador
- Acesse o painel em `/admin` (usuário admin fornecido separadamente).
- Gerencie produtos, categorias, tipos, banners, avaliações e clientes.
- Modere avaliações e veja intenções de compra.
- Teste o botão "Logar como cliente de teste" para alternar entre perfis.

### 3. Funcionalidades em Desenvolvimento
- Algumas páginas podem exibir aviso de "em desenvolvimento".
- O sistema está preparado para expansão futura.

### 4. Observações Técnicas
- O backend utiliza Django REST Framework.
- O frontend é feito em Next.js (React).
- O sistema utiliza autenticação JWT para clientes e admins.

## Dicas para Professores
- Utilize os manuais em `/docs/manual-admin.md` e `/docs/manual-cliente.md` para referência rápida.
- Sinta-se à vontade para testar fluxos de erro, logout, e navegação entre perfis.
- Qualquer dúvida técnica, consulte o README ou entre em contato com o desenvolvedor.

Agradecemos pela avaliação e feedback!
