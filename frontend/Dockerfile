FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY next.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY jest.config.js ./
COPY eslint.config.mjs ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
