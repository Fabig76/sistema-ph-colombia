#!/bin/bash

echo "🚀 Iniciando Prisma Studio para Sistema PH Colombia..."
echo "📊 URL: http://localhost:5555"
echo "🌐 Browser Preview disponible en Windsurf"
echo ""

cd "/Users/imac/Paz y salvos ph/sistema-ph-colombia/backend"

# Verificar que PostgreSQL esté corriendo
if ! docker ps | grep -q "ph-postgres"; then
    echo "❌ PostgreSQL no está corriendo. Iniciando..."
    cd "/Users/imac/Paz y salvos ph/sistema-ph-colombia"
    docker-compose up -d postgres
    echo "✅ PostgreSQL iniciado"
    cd backend
fi

# Iniciar Prisma Studio
echo "🎨 Abriendo Prisma Studio..."
DATABASE_URL="postgresql://phuser:phpass123@localhost:5432/ph_colombia" npx prisma studio --port 5555
