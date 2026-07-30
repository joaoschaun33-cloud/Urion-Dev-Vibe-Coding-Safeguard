# Governance — Governanca do Codigo

> Regras para manter a qualidade do codigo enquanto o time e a IA crescem.

---

## 🏛️ Principios de Governanca

1. **Padroes antes de codigo**: Regras claras evitam debates infinitos.
2. **Automacao sobre processo**: CI/CD verifica regras, nao depende de memoria humana.
3. **Transparencia**: Todas as decisoes documentadas em `decisions-log.md`.
4. **Revisao obrigatoria**: Nada vai para `main` sem revisao (humana ou IA).

---

## 📋 Regras de Contribuicao

### Code Review
- Todo PR precisa de pelo menos 1 aprovacao
- Checklist de revisao em `prompts/code-review.md`
- CI deve passar antes do merge
- Nao mergeie em horario fora do expediente (a menos que hotfix)

### Branch Protection
- `main`: require PR, require review, require CI pass
- `develop`: require PR, require CI pass
- Force push: proibido em `main` e `develop`

### Semantic Versioning
```
MAJOR.MINOR.PATCH
1.2.3
```
- **MAJOR**: breaking change (muda API, remove campo)
- **MINOR**: feature nova, backward compatible
- **PATCH**: bugfix, backward compatible

---

## 🔄 Ciclo de Release

1. **Feature completa** → PR para `develop`
2. **Sprint/release** → Merge `develop` → `main`
3. **Tag** → `git tag v1.2.3`
4. **CHANGELOG** → Atualize `CHANGELOG.md`
5. **Deploy** → Siga `prompts/deployment.md`

---

## 📊 Metricas de Qualidade

| Metrica | Meta | Como Medir |
|---------|------|------------|
| Cobertura de testes | >= 80% | `npm run test:coverage` |
| Debt ratio (SonarQube) | < 5% | SonarQube/Semgrep |
| Tempo medio de PR | < 2 dias | GitHub API |
| Revert rate | < 2% | Git history |
| Bug escape rate | < 5% | Bugs em prod / total de bugs |

---

## 🗑️ Deprecacao

Quando remover codigo:
1. Marque como `@deprecated` com data de remocao
2. Adicione ao CHANGELOG
3. Comunique ao time
4. Remova na proxima versao MAJOR (ou apos 2 MINOR)
