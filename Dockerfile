# Imagem base
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código do projeto
COPY . .

# Build do Next.js
RUN npm run build

# Expõe a porta (pode mudar conforme precisar)
EXPOSE 4000

# Comando para iniciar
CMD ["npm", "start"]
