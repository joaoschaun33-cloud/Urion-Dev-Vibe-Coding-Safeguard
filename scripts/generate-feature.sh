#!/bin/bash
# generate-feature.sh — Gera estrutura de nova feature automaticamente

set -e

if [ -z "$1" ]; then
  echo "❌ Uso: bash scripts/generate-feature.sh <nome-da-feature>"
  echo "   Exemplo: bash scripts/generate-feature.sh user-profile"
  exit 1
fi

FEATURE_NAME=$1
FEATURE_DIR="src/features/$FEATURE_NAME"

if [ -d "$FEATURE_DIR" ]; then
  echo "❌ Feature '$FEATURE_NAME' ja existe em $FEATURE_DIR"
  exit 1
fi

echo "🏗️  Gerando feature: $FEATURE_NAME..."

# Criar diretorios
mkdir -p "$FEATURE_DIR"/{domain,application/dto,infrastructure,presentation,tests/{unit,integration}}

# Copiar templates
cp templates/feature/domain/entity.ts "$FEATURE_DIR/domain/entity.ts"
cp templates/feature/domain/repository.interface.ts "$FEATURE_DIR/domain/repository.interface.ts"
cp templates/feature/domain/errors.ts "$FEATURE_DIR/domain/errors.ts"
cp templates/feature/application/use-case.ts "$FEATURE_DIR/application/create-$FEATURE_NAME.ts"
cp templates/feature/application/dto/input.dto.ts "$FEATURE_DIR/application/dto/create-$FEATURE_NAME.dto.ts"
cp templates/feature/application/dto/output.dto.ts "$FEATURE_DIR/application/dto/$FEATURE_NAME-response.dto.ts"
cp templates/feature/infrastructure/repository.impl.ts "$FEATURE_DIR/infrastructure/$FEATURE_NAME-repository.impl.ts"
cp templates/feature/presentation/controller.ts "$FEATURE_DIR/presentation/$FEATURE_NAME-controller.ts"
cp templates/feature/tests/unit/use-case.test.ts "$FEATURE_DIR/tests/unit/create-$FEATURE_NAME.test.ts"

echo "✅ Feature '$FEATURE_NAME' criada em $FEATURE_DIR"
echo ""
echo "Proximos passos:"
echo "  1. Edite os arquivos em $FEATURE_DIR/"
echo "  2. Adapte entidade, use case, DTOs e controller"
echo "  3. Escreva testes em tests/unit/ e tests/integration/"
echo "  4. Registre a rota em app/routes.ts"
echo "  5. Execute: make test-smoke"
