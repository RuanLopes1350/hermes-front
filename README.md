# Hermes Console (Frontend) 💻

O **hermes-front** é o painel administrativo moderno para o ecossistema **Hermes**, um Gateway de E-mails Transacionais open-source. Construído com **Next.js 16.2 (App Router)**, permite aos gestores e desenvolvedores gerenciar completamente sua infraestrutura de e-mails em um dashboard intuitivo e responsivo.

---

[API Backend](https://github.com/RuanLopes1350/hermes-api) • [Pacote Client (NPM)](https://github.com/RuanLopes1350/hermes-client)

---

## 🌟 Principais Funcionalidades

- **Gerenciamento de Serviços (Multi-tenant):** Isole configurações (chaves de API, templates, logs) em namespaces separados ("Serviços").
- **Dashboard Analítico:** Visualize estatísticas de envios (entregues, falhos) em tempo real via gráficos **ECharts** atualizados por SSE.
- **Gestão de Credenciais:** Adicione credenciais SMTP clássicas ou utilize o fluxo moderno e seguro do **Google OAuth2** diretamente pelo painel.
- **Chaves de API Seguras:** Crie, visualize e gerencie API Keys para uso nos seus projetos clientes.
- **Editor de Templates MJML:** Crie e-mails visualmente responsivos utilizando o **Monaco Editor** integrado com preview ao vivo em iframe.
- **Logs e Auditoria em Tempo Real:** Rastreamento do status das mensagens (pendente, enviado, tentando novamente, falhou) via Server-Sent Events (SSE).

---

## 🚀 Stack Tecnológico

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Next.js** | 16.2 | Framework React (App Router) |
| **React** | 19 | Biblioteca UI |
| **TypeScript** | 5.9 | Tipagem estática |
| **Tailwind CSS** | v4 | Estilização utilitária |
| **shadcn/ui + Radix UI** | — | Componentes UI acessíveis |
| **ECharts** | 6.x | Gráficos analíticos |
| **Monaco Editor** | 4.7 | Editor de templates MJML/HTML |
| **Better Auth** | 1.6 | Autenticação (compartilhada com a API) |
| **TanStack Query** | 5.x | Gerenciamento de estado assíncrono |
| **hermes-client** | 1.2 | SDK para consumo da API Hermes |

---

## ⚙️ Pré-requisitos

Para que o frontend funcione adequadamente, você precisará ter o **hermes-api** rodando (localmente na porta `3001` ou em um servidor remoto).

---

## 🛠️ Como executar localmente

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do `hermes-front`:
```env
# URL da Hermes API (obrigatório)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Nota:** Certifique-se que `http://localhost:3000` está listado em `AUTH_TRUSTED_ORIGINS` no `.env` da `hermes-api`.

### 3. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

### 4. Acesse o painel
Abra [http://localhost:3000](http://localhost:3000) no seu navegador. Faça login com as credenciais definidas no `ADMIN_EMAIL` e `ADMIN_PASSWORD` do `.env` da API.

---

## 📜 Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento Next.js |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção (requer build) |
| `npm run format:fix` | Formata o código com Prettier |

---

## 🗂️ Estrutura do Projeto

```
hermes-front/src/
├── app/               # Páginas e layouts do Next.js App Router
│   ├── (auth)/        # Rotas de autenticação (login, registro)
│   └── (system)/      # Rotas protegidas do painel administrativo
├── components/        # UI Design System (shadcn/Radix/Tailwind v4)
├── constants/         # Constantes globais da aplicação
├── hooks/             # React hooks customizados (ex: useSSE)
├── lib/               # Integrações externas
│   ├── api.ts         # Cliente HTTP para a Hermes API
│   └── auth-client.ts # Configuração do Better Auth (client-side)
└── types/             # Tipos TypeScript do frontend
```

---

## 🔗 Comunicação com a API

O frontend se comunica com a `hermes-api` de duas formas:

1. **Sessão (Better Auth):** Para acesso ao painel administrativo, utiliza sessão gerenciada pelo Better Auth via cookies HTTPOnly ou Bearer Token no cabeçalho `Authorization`.
2. **SDK hermes-client:** O painel utiliza o SDK `@ruanlopes1350/hermes-client` para operações de envio de e-mails a partir do contexto do frontend.
