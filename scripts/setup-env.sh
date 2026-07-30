#!/bin/bash
# setup-env.sh — Configura ambiente de desenvolvimento

set -e

echo "⚙️  Configurando ambiente..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nao encontrado. Instale o Node.js 20+."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js $NODE_VERSION encontrado. Requerido: 20+."
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Configurar .env
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "⚙️  Criando .env a partir de .env.example..."
    cp .env.example .env
    echo "   ⚠️  Edite .env com seus valores reais!"
fi

# Verificar saude
echo "🩺 Verificando saude do repositorio..."
npm run cursor-doctor

echo "✅ Ambiente configurado!"
