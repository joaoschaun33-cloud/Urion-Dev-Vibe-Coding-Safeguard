# Politica de Seguranca

## Versoes Suportadas

| Versao | Suportada |
|--------|-----------|
| 1.x    | ✅ Sim |

## Relatando Vulnerabilidades

**NUNCA abra uma issue publica para vulnerabilidades de seguranca.**

### Processo Responsavel de Divulgacao

1. **Reporte privado**: Envie um email para [security@seu-projeto.com] com:
   - Descricao da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestoes de mitigacao (se houver)

2. **Confirmacao**: Voce recebera uma confirmacao em 48h.

3. **Investigacao**: A equipe investigara e avaliara o impacto.

4. **Correcao**: Uma correcao sera desenvolvida e testada.

5. **Divulgacao**: Apos a correcao, uma divulgacao coordenada sera feita:
   - CHANGELOG.md atualizado
   - Release de patch (semver)
   - Aviso a usuarios afetados

## Praticas de Seguranca do Projeto

- SAST automatico em todo PR (Semgrep)
- Secret scanning (TruffleHog)
- Dependency audit (npm audit)
- Nenhuma credencial em codigo (validado em CI)
- Headers de seguranca (Helmet)
- Rate limiting em endpoints publicos
- JWT com refresh token rotation
- Input validation em todas as entradas

## Reconhecimento

Contribuidores que reportarem vulnerabilidades de forma responsavel serao creditados no CHANGELOG (a menos que prefiram anonimato).
