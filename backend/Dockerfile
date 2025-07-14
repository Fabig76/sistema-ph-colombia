# Backend - Sistema PH Colombia
# Versiones Funcionales: Node 20, Express 5.1.0, Prisma 6.11.1
# Fecha: 2025-07-13

FROM node:20-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Instalar dependencias globales
RUN npm install -g prisma@6.11.1

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p logs tmp

# Copiar y configurar script de inicio
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Exponer puerto 3000 (puerto definitivo)
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar la aplicación
CMD ["sh", "/app/start.sh"]
