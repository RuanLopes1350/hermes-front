# 🕊️ Hermes Console - Painel Administrativo

> 🇬🇧 **Looking for the English version?** [README.en.md](README.en.md)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

**Painel administrativo moderno para o ecossistema Hermes - Gateway de E-mails Transacionais.**

[API Backend](https://github.com/RuanLopes1350/hermes-api) • [Pacote Client (NPM)](https://github.com/RuanLopes1350/hermes-client)

</div>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Principais Funcionalidades](#-principais-funcionalidades)
- [Stack Tecnológico](#-stack-tecnológico)
- [Pré-requisitos](#️-pré-requisitos)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Como Executar Localmente](#️-como-executar-localmente)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#️-estrutura-do-projeto)
- [Comunicação com a API](#-comunicação-com-a-api)

---

## 🎯 Sobre o Projeto

O **hermes-front** é o painel administrativo do ecossistema **Hermes**. Construído com **Next.js 16.2 (App Router)**, permite que gestores e desenvolvedores gerenciem completamente a infraestrutura de e-mails transacionais por meio de um dashboard intuitivo, responsivo e atualizado em tempo real.

---

## 🌟 Principais Funcionalidades

- **Gerenciamento de Serviços (Multi-tenant):** Isole configurações (chaves de API, templates, logs) em namespaces separados ("Serviços").
- **Dashboard Analítico em Tempo Real:** Visualize estatísticas de envio (entregues, falhos, pendentes) via gráficos **ECharts** atualizados por Server-Sent Events.
- **Gestão de Credenciais SMTP:** Adicione credenciais SMTP clássicas (senha/App Password) ou utilize o fluxo de autorização **Google OAuth2** diretamente pelo painel.
- **Chaves de API Seguras:** Crie, visualize e gerencie API Keys para projetos integrados.
- **Editor de Templates MJML:** Crie e-mails responsivos com o **Monaco Editor** integrado e preview ao vivo em iframe.
- **Logs e Auditoria em Tempo Real:** Rastreie o status de cada mensagem (pendente, enviado, retentando, falhou) via SSE.

---

## 🚀 Stack Tecnológico

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Next.js** | 16.2 | Framework React (App Router) |
| **React** | 19 | Biblioteca de UI |
| **TypeScript** | 5.9 | Tipagem estática |
| **Tailwind CSS** | v4 | Estilização utilitária |
| **shadcn/ui + Radix UI** | - | Componentes UI acessíveis |
| **ECharts** | 6.x | Gráficos analíticos |
| **Monaco Editor** | 4.7 | Editor de templates MJML |
| **Better Auth** | 1.6 | Autenticação (compartilhada com a API) |
| **TanStack Query** | 5.x | Gerenciamento de estado assíncrono |
| **hermes-client** | 1.2.2 | SDK para consumo da Hermes API |

---

## ⚙️ Pré-requisitos

Para que o frontend funcione, você precisará da **hermes-api** rodando (localmente na porta `3001` ou em um servidor remoto). Consulte o [README da API](https://github.com/RuanLopes1350/hermes-api) para instruções de configuração.

---

## 🔑 Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha os valores:

```env
# URL base da Hermes API (obrigatório)
NEXT_PUBLIC_API_URL=http://localhost:3001

# URL pública deste frontend (obrigatório para SEO/OpenGraph)
# Em produção, use o domínio real (ex: https://app.seudominio.com)
# Atenção: variável NEXT_PUBLIC_* é embutida no bundle em tempo de build.
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Importante:** Certifique-se de que a URL do frontend (`NEXT_PUBLIC_APP_URL`) esteja listada em `AUTH_TRUSTED_ORIGINS` no `.env` da `hermes-api`.

---

## 🛠️ Como Executar Localmente

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com os valores corretos
```

### 3. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

### 4. Acesse o painel
Abra [http://localhost:3000](http://localhost:3000) no navegador. Faça login com as credenciais definidas em `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env` da API.

---

## 📜 Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento Next.js |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção (requer build) |
| `npm run lint` | Executa o ESLint |
| `npm run format:fix` | Formata o código com Prettier |
| `npm run format:check` | Verifica a formatação sem alterar arquivos |

---

## 🗂️ Estrutura do Projeto

```
hermes-front/src/
├── app/                        # Páginas e layouts (Next.js App Router)
│   ├── (auth)/                 # Rotas públicas de autenticação (login)
│   └── (system)/               # Rotas protegidas do painel administrativo
├── components/                 # UI Design System (shadcn/Radix/Tailwind)
├── constants/                  # Constantes globais da aplicação
├── hooks/                      # React hooks customizados (ex: useSSE)
├── lib/
│   ├── api.ts                  # Cliente HTTP para a Hermes API
│   └── auth-client.ts          # Configuração do Better Auth (client-side)
├── middleware.ts               # Middleware Next.js (proteção de rotas)
└── types/                      # Tipos TypeScript do frontend
```

---

## 🔗 Comunicação com a API

O frontend se comunica com a `hermes-api` de duas formas:

1. **Sessão (Better Auth):** Para acesso ao painel administrativo, utiliza sessão gerenciada pelo Better Auth via cookies HTTPOnly ou Bearer Token no cabeçalho `Authorization`.
2. **SDK `hermes-client`:** O painel utiliza o SDK `@ruanlopes1350/hermes-client` (v1.2.2) para operações de envio de e-mails originadas do contexto do frontend.

---

Desenvolvido por [Ruan Lopes](https://github.com/RuanLopes1350). Licença ISC.
