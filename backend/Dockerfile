FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Instalar dependencias globales
RUN npm install -g prisma

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Generar cliente Prisma
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p logs tmp

# Exponer puerto
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
