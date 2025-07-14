# Frontend - Sistema PH Colombia
# Versiones Funcionales: Next.js 15.3.5, React 19.0.0, Node 20
# Fecha: 2025-07-13

FROM node:20-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY next.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY jest.config.js ./
COPY eslint.config.mjs ./
COPY tailwind.config.ts ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Exponer puerto 3002 (puerto definitivo)
EXPOSE 3002

# Comando para iniciar la aplicación en puerto 3002
CMD ["npm", "run", "start", "--", "-p", "3002"]
