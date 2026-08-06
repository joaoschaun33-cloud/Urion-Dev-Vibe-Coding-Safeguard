// src/features/security-audit/tests/unit/rules-source.test.ts
// Garante a FONTE UNICA: o dominio TS e o artefato .cjs gerado (consumido pelo CLI)
// devem estar em sincronia. Se este teste falhar, rode `npm run sync:rules:guard`.
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VIBE_GUARD_RULES } from '../../domain/vibe-guard-rules';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
// bin/lib/vibe-guard-rules.generated.cjs, a partir de src/features/security-audit/tests/unit/
const generatedPath = path.resolve(here, '../../../../../bin/lib/vibe-guard-rules.generated.cjs');
const { VIBE_GUARD_RULES: GENERATED_RULES } = require(generatedPath) as {
  VIBE_GUARD_RULES: Array<{
    id: string;
    regex: RegExp;
    severity: string;
    autoFixable: boolean;
  }>;
};

describe('Fonte unica das regras VibeGuard (dominio TS <-> .cjs gerado)', () => {
  it('tem a mesma quantidade de regras', () => {
    expect(GENERATED_RULES.length).toBe(VIBE_GUARD_RULES.length);
  });

  it('tem os mesmos ids na mesma ordem', () => {
    expect(GENERATED_RULES.map((r) => r.id)).toEqual(VIBE_GUARD_RULES.map((r) => r.id));
  });

  it('cada regra gerada tem regex identica (source + flags) a do dominio', () => {
    for (const domainRule of VIBE_GUARD_RULES) {
      const gen = GENERATED_RULES.find((r) => r.id === domainRule.id);
      expect(gen, `regra ${domainRule.id} ausente no gerado`).toBeDefined();
      expect(gen?.regex.source).toBe(domainRule.regex.source);
      expect(gen?.regex.flags).toBe(domainRule.regex.flags);
      expect(gen?.severity).toBe(domainRule.severity);
    }
  });

  it('a regra de secrets casa um segredo real e ignora frase comum', () => {
    const secret = GENERATED_RULES.find((r) => r.id === 'SECRETS_HARDCODED');
    expect(secret).toBeDefined();
    // Valor fixo, propositalmente NAO parecido com chave de provedor real
    // (evita disparar o secret-scanning do GitHub); ainda casa a regex generica.
    expect(secret?.regex.test('const api_key = "CHAVE_FALSA_DE_EXEMPLO_123456";')).toBe(true);
    expect(secret?.regex.test('Esta e apenas uma frase comum, sem segredos.')).toBe(false);
  });
});
