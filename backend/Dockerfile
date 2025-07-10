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

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p logs tmp

# Copiar y configurar script de inicio
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Exponer puerto
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["sh", "/app/start.sh"]
