# --- ESTÁGIO DE CONSTRUÇÃO ---
FROM node:24-alpine AS builder
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala as dependências (usando ci para garantir integridade)
RUN npm ci

# Copia o restante do código
COPY . .

# Variável de ambiente necessária para o build do Next.js
# No Docker, por padrão ele buscará a API no host ou via rede interna do docker
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Executa o build
RUN npm run build

# --- ESTÁGIO DE PRODUÇÃO ---
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário para rodar o app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Inicia o servidor Next.js
CMD ["npm", "run", "start"]
