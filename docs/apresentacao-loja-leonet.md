# Apresentação – Loja Leonet

> Versão curta para seminários / banca de faculdade. Utilize como roteiro durante a demonstração.

## 1. Abertura

- **Contexto:** o varejo de moda precisa estar onde o cliente está – no celular. A Leonet Modas nasceu para levar curadoria, atendimento humanizado e suporte ágil para o digital.
- **Objetivo da plataforma:** unificar vitrine, intenção de compra, avaliações e suporte em uma única experiência.
- **Stack chave:** Django + Django REST Framework no backend, Next.js 14 + Tailwind no frontend e Cloudinary para mídia.

## 2. Arquitetura em 3 blocos

| Camada | O que entrega | Tecnologias |
| --- | --- | --- |
| **API Pública (`/api`)** | Catálogo, intenções, avaliações e suporte autenticado | Django REST Framework, SimpleJWT |
| **API Cliente (`/api/client`)** | Registro, login, refresh de token, perfil | SimpleJWT + Fluxos de e-mail (verificação e reset) |
| **API Admin (`/api/admin`)** | Painel completo para staff (produtos, banners, AllowedRatings, clientes) | DRF ViewSets + permissões `IsAdminUser` |

> Demonstre rapidamente no Swagger (`/swagger`) que os namespaces estão separados e documentados.

## 3. Jornada do cliente

1. **Descoberta** – entra na home e filtra por categoria/tipo. Os banners vêm do Cloudinary e são administráveis.
2. **Intenção de compra** – ao gostar de um item, o cliente abre um pedido (`/api/pedidos-intencao/`). Isso vira uma fila para a equipe.
3. **Confirmação** – um administrador muda o status para *concluída*, liberando automaticamente um `AllowedRating` (token válido por 30 dias).
4. **Avaliação verificada** – o cliente só consegue avaliar se tiver uma compra concluída e faz upload obrigatório da foto do produto.
5. **Suporte personalizado** – na nova página `/suporte`, ele vê métricas pessoais, histórico de tickets e abre novos chamados com os dados já preenchidos.

## 4. Destaques da Central de Suporte

- **Autenticação obrigatória:** o endpoint retorna apenas os tickets do usuário logado.
- **Dashboard instantâneo:** cards de “total de chamados” e “último contato”, mais a linha do tempo dos tickets.
- **Formulário inteligente:** pré-preenche nome e e-mail, aceita ID opcional de produto e orienta sobre o tipo de suporte.
- **Backoffice sincronizado:** cada chamado fica disponível no Django Admin, facilitando follow-up.

Sugestão de demonstração rápida:
1. Logar com um cliente já verificado.
2. Abrir `/suporte`, mostrar os cards e o histórico existente.
3. Registrar um novo chamado e provar que ele aparece imediatamente na lista.
4. Exibir no admin como o ticket chegou com vínculo ao usuário.

## 5. Diferenciais técnicos

- **AllowedRating automático:** garante que apenas compradores reais avaliem, evitando fraudes.
- **Cloudinary + mocks em testes:** mesma infraestrutura usada em produção, mas com testes confiáveis.
- **Design responsivo:** header animado, footer institucional completo e suporte com layout moderno.
- **Testes focados:** suíte `python manage.py test produtos` cobre intenções, avaliações e permissões administrativas.

## 6. Checklist para a apresentação

- ✅ Backend rodando em `http://127.0.0.1:8000/`
- ✅ Frontend em `http://localhost:3000/`
- ✅ Usuário cliente com e-mail verificado (para acessar `/suporte`)
- ✅ Usuário staff para mostrar o admin (`/admin/` ou APIs `/api/admin/*`)
- ✅ Variáveis `.env` configuradas (Cloudinary + SMTP) para ilustrar upload/envio de e-mail

## 7. Call to action final

> "Com a Leonet, o cliente não apenas compra: ele conversa, avalia e recebe suporte em um só lugar. É a curadoria da loja física com a conveniência do digital."