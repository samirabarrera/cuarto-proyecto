FROM node:22-alpine
WORKDIR /app

# Instalar dependencias primero (mejor cache de Docker)
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000
CMD ["node", "server.js"]