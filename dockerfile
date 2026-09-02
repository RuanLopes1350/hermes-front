# --- ESTÁGIO DE CONSTRUÇÃO ---
FROM node:24-alpine AS builder
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Variável de ambiente necessária para o build do Next.js
ARG NEXT_PUBLIC_API_URL=https://api.hermes.qa.fslab.dev
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Executa o build (gerará a pasta .next/standalone devido à nova config)
RUN npm run build

# --- ESTÁGIO DE PRODUÇÃO ---
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copia a pasta public (assets estáticos originais)
COPY --from=builder /app/public ./public

# Copia a build standalone otimizada pelo Next.js (já inclui dependências exatas)
COPY --from=builder /app/.next/standalone ./

# Copia os arquivos estáticos do Next.js para dentro da estrutura do standalone
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# Inicia o servidor standalone do Next.js diretamente no Node
CMD ["node", "server.js"]
