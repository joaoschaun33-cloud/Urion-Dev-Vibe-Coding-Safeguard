# Makefile — Comandos padronizados para IA e desenvolvedores

.PHONY: dev build test test-smoke lint lint-fix format setup doctor clean

# 🚀 Desenvolvimento
dev:
	@echo "🚀 Iniciando ambiente de desenvolvimento..."
	@npm run dev

# 🔨 Build
build:
	@echo "🔨 Compilando projeto..."
	@npm run build

# 🧪 Testes
test:
	@echo "🧪 Rodando testes..."
	@npm run test

test-smoke:
	@echo "🧪 Rodando smoke tests..."
	@npm run test:smoke

# 🔍 Qualidade de Código
lint:
	@echo "🔍 Rodando linter..."
	@npm run lint

lint-fix:
	@echo "🔧 Corrigindo problemas do linter..."
	@npm run lint:fix

format:
	@echo "✨ Formatando código..."
	@npm run format

# 🩺 Diagnóstico
doctor:
	@echo "🩺 Rodando cursor-doctor..."
	@npm run cursor-doctor

# ⚙️ Setup
setup:
	@echo "⚙️ Configurando ambiente pela primeira vez..."
	@bash first-time.sh

# 🧹 Limpeza
clean:
	@echo "🧹 Limpando arquivos temporários..."
	@rm -rf node_modules dist build .next coverage
	@echo "✅ Limpo! Rode 'npm install' para reinstalar."

# 📦 Instalação de dependências
install:
	@echo "📦 Instalando dependências..."
	@npm install

# 🔄 Full check (CI local)
check: lint test-smoke doctor
	@echo "✅ Todos os checks passaram!"
