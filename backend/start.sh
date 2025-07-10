#!/bin/sh

echo "🔄 Generando cliente Prisma..."
npx prisma generate

echo "🗃️  Ejecutando migraciones..."
npx prisma migrate deploy || echo "⚠️  Sin migraciones pendientes"

echo "🚀 Iniciando aplicación..."
exec npm start
