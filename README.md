# Hermes Console (Frontend) 💻

O **hermes-front** é o painel administrativo moderno para o ecossistema **Hermes**, um Gateway de E-mails Transacionais open-source. Construído com **Next.js**, ele permite aos gestores e desenvolvedores gerenciar completamente sua infraestrutura de e-mails em um dashboard intuitivo e responsivo.

## 🌟 Principais Funcionalidades

- **Gerenciamento de Serviços (Multi-tenant)**: Isole suas configurações (chaves de API, templates, logs) em namespaces diferentes ("Serviços").
- **Dashboard Analítico**: Visualize estatísticas de envios (entregues, falhos, taxas de abertura) via gráficos usando **ECharts**.
- **Gestão de Credenciais**: Adicione credenciais SMTP clássicas ou utilize o fluxo moderno e seguro do **Google OAuth2**.
- **Chaves de API Seguras**: Crie e rotacione API Keys para uso nos seus projetos clientes.
- **Editor de Templates MJML**: Crie e-mails visualmente responsivos utilizando o **Monaco Editor** integrado com visualização (preview) ao vivo.
- **Logs e Auditoria**: Rastreamento em tempo real do status das mensagens (pendente, enviado, tentando novamente, falhou) via Server-Sent Events (SSE).

## 🚀 Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/) & Radix UI
- **Gráficos**: ECharts
- **Editor de Código**: `@monaco-editor/react` para edição de templates (MJML/HTML)
- **Autenticação**: Better Auth (compartilhado com a API)

## ⚙️ Pré-requisitos

Para que o frontend funcione adequadamente, você precisará ter o **hermes-api** rodando localmente (ou em um servidor de sua escolha).

## 🛠️ Como executar localmente

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente**:
   Crie um arquivo `.env` na raiz do frontend (`hermes-front`) informando a URL da API, por exemplo:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3333
   ```
   *(Ajuste de acordo com a sua configuração do backend).*

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse o painel**:
   Abra [http://localhost:3000](http://localhost:3000) com o seu navegador para acessar o console do Hermes. Faça o login ou registre-se utilizando a autenticação fornecida pela API.
