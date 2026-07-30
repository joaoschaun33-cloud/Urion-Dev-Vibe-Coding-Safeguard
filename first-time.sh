#!/bin/bash
# first-time.sh — Setup inicial automático do ambiente

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧠 Vibe Coding Template Repo — Setup Inicial               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar Node.js
echo "📋 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js 20+ e tente novamente."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js $NODE_VERSION encontrado. Requerido: 20+."
    exit 1
fi
echo "✅ Node.js $(node -v) detectado"

# 2. Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# 3. Copiar .env.example para .env (se existir)
if [ -f ".env.example" ]; then
    echo ""
    echo "⚙️  Configurando variáveis de ambiente..."
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo "✅ .env criado a partir de .env.example"
        echo "   ⚠️  Edite o arquivo .env com seus valores reais!"
    else
        echo "✅ .env já existe, pulando cópia"
    fi
else
    echo "⚠️  .env.example não encontrado. Crie seu .env manualmente."
fi

# 4. Configurar Husky
echo ""
echo "🐕 Configurando Husky..."
npx husky install 2>/dev/null || true

# 5. Rodar smoke tests iniciais
echo ""
echo "🧪 Rodando smoke tests..."
npm run test:smoke

# 6. Rodar cursor-doctor
echo ""
echo "🩺 Verificando saúde do repositório..."
npm run cursor-doctor

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Setup concluído com sucesso!                             ║"
echo "║                                                              ║"
echo "║  Próximos passos:                                            ║"
echo "║  1. Edite .env com suas configurações                       ║"
echo "║  2. Leia AGENTS.md e docs/ para entender as regras          ║"
echo "║  3. Execute: make dev                                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
