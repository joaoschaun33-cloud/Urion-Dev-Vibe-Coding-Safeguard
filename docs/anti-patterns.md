# Anti-Patterns — Catalogo de Alucinacoes da IA

> Este documento cataloga erros comuns que IAs cometem em vibe coding.
> Leia antes de codar. Atualize quando encontrar novos.

---

## 🧠 Alucinacoes Comuns

### A1. API Inexistente
**Sintoma**: A IA sugere usar `lib.metodo()` que nao existe.
**Causa**: A IA confundiu bibliotecas ou inventou uma API.
**Prevencao**: `.cursor/rules/honesty.mdc` — a IA deve admitir quando nao conhece uma API.
**Exemplo**:
```typescript
// ❌ Alucinacao
import { calculateTax } from 'finance-js'; // biblioteca nao existe

// ✅ Real
import { TaxCalculator } from '@/shared/domain/tax-calculator'; // nosso codigo
```

### A2. Versao Errada
**Sintoma**: A IA usa sintaxe de uma versao mais nova/velha da biblioteca.
**Causa**: O modelo foi treinado em dados desatualizados.
**Prevencao**: `package.json` com versoes fixas. A IA deve verificar a versao antes de sugerir.
**Exemplo**:
```typescript
// ❌ Alucinacao (React 19 syntax em projeto React 18)
const [data, formAction] = useActionState(action, null);

// ✅ Real (React 18)
const [state, dispatch] = useReducer(reducer, initialState);
```

### A3. Pattern Anti-Arquitetura
**Sintoma**: A IA coloca logica de negocio no componente React ou controller.
**Causa**: A IA segue exemplos genericos da internet em vez de AGENTS.md.
**Prevencao**: `AGENTS.md` Dogma 1 + `.cursor/rules/backend.mdc`.
**Exemplo**:
```typescript
// ❌ Alucinacao
function UserCard({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Logica de negocio no componente!
    if (userId.startsWith('admin_')) {
      setRole('ADMIN'); // REGRA DE NEGOCIO NA UI!
    }
  }, [userId]);
}

// ✅ Real
// Componente burro: recebe dados e dispara eventos
// Regra de negocio em src/features/user/domain/role-policy.ts
```

### A4. Esquecer de Tratar Erro
**Sintoma**: Codigo async sem try/catch, sem estados de erro.
**Causa**: A IA otimizou para o caminho feliz.
**Prevencao**: `AGENTS.md` Dogma 3 + `.cursor/rules/frontend.mdc`.
**Exemplo**:
```typescript
// ❌ Alucinacao
const data = await fetchUser(); // se falhar, crasha tudo

// ✅ Real
const [data, error] = await safeFetchUser();
if (error) {
  return <ErrorState error={error} />;
}
```

### A5. Mock Incorreto em Testes
**Sintoma**: Teste passa mas nao testa nada util. Mocka demais.
**Causa**: A IA gerou teste para cobertura, nao para validar comportamento.
**Prevencao**: `.cursor/rules/testing.mdc`.
**Exemplo**:
```typescript
// ❌ Alucinacao
it('deve chamar o servico', () => {
  const mockService = { save: vi.fn() };
  mockService.save(); // mocka e chama, mas nao testa logica
  expect(mockService.save).toHaveBeenCalled();
});

// ✅ Real
it('deve salvar usuario com email normalizado', async () => {
  const repo = new InMemoryUserRepository();
  const useCase = new CreateUserUseCase(repo);

  await useCase.execute({ email: '  Test@Email.COM  ' });

  const saved = await repo.findByEmail('test@email.com');
  expect(saved).not.toBeNull();
});
```

### A6. Suposicao de Estado do Banco
**Sintoma**: Migration destrutiva sem backup ou sem janela de manutencao.
**Causa**: A IA nao considerou dados existentes.
**Prevencao**: `.cursor/rules/database-skill.mdc`.
**Exemplo**:
```sql
-- ❌ Alucinacao
ALTER TABLE users DROP COLUMN phone; -- perde dados!

-- ✅ Real
-- 1. Cria nova coluna
-- 2. Migra dados em background job
-- 3. Depreca coluna antiga (soft delete)
-- 4. Remove em migration futura (apos confirmar migracao)
```

### A7. Ignorar Acessibilidade
**Sintoma**: Componente sem `alt`, sem focus, sem labels.
**Causa**: A IA gerou componente visual sem considerar a11y.
**Prevencao**: `.cursor/rules/accessibility.mdc`.

### A8. Performance Ocasional
**Sintoma**: Codigo funciona em dev, explode em producao (N+1, memory leak).
**Causa**: A IA nao testou com volume real de dados.
**Prevencao**: `.cursor/rules/performance.mdc` + testes de carga.

---

## 🛡️ Como Evitar Alucinacoes

1. **Contexto focado**: Use `@` para mencionar arquivos de regras
2. **Validacao continua**: `make check` a cada 15-25 min
3. **Testes de integracao**: Testam o fluxo real, nao apenas mocks
4. **Revisao humana**: Sempre revise codigo critico
5. **Documente**: Quando encontrar uma alucinacao, adicione a este catalogo

---

## 📝 Template de Registro de Alucinacao

```markdown
### [DATA] — [Nome da Alucinacao]

**IA**: [Cursor/Copilot/ChatGPT/etc.]
**Contexto**: [O que estava sendo desenvolvido]
**Sintoma**: [O que a IA gerou de errado]
**Causa Raiz**: [Por que a IA errou]
**Prevencao**: [Qual regra/documento deve ser seguido]
**Correcao**: [Como foi corrigido]
```
