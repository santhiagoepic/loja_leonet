# Apresentação — Loja Leoneth

Este documento é um roteiro curto para apresentar o projeto **Loja Leoneth** (visão geral, objetivo, funcionalidades e arquitetura).

## 1) O que é
A **Loja Leoneth** é um e-commerce com:
- Área do cliente (vitrine, busca, carrinho/fluxo de compra conforme implementado)
- Área administrativa (cadastros, gestão de produtos/banners/categorias/tipos conforme telas do admin)

## 2) Objetivo
Centralizar a vitrine e a operação de uma loja de moda em uma aplicação web, separando:
- Experiência do cliente (navegação e compra)
- Operação interna (administração e gestão do catálogo)

## 3) Principais funcionalidades (alto nível)
- Autenticação de cliente e admin
- Catálogo de produtos, categorias/tipos e banners
- Páginas públicas (home, categorias, produto, contato, conta)
- Painel admin com rotas dedicadas

## 4) Arquitetura
- **Frontend**: Next.js (App Router)
- **Backend**: Django + Django REST Framework
- **Banco**: SQLite (arquivo `backend/db.sqlite3`)
- **Infra**: Docker Compose (subir frontend e backend)

## 5) Links úteis
- Manual do Admin: `docs/manual-admin.md`
- Manual do Cliente: `docs/manual-cliente.md`
- Lógica do sistema: `SYSTEM_LOGIC.md` e `docs/SYSTEM_LOGIC.md`

## 6) Como apresentar (sugestão de pitch)
1. Problema: organizar vitrine + operação/admin
2. Solução: Loja Leoneth com app para cliente + painel administrativo
3. Demonstração rápida: home → produto → conta; admin → produtos/banners
4. Stack e arquitetura: Next.js + Django/DRF + SQLite + Docker
5. Próximos passos: evoluir módulos ainda “Em desenvolvimento” (se aplicável) e refinar UX
