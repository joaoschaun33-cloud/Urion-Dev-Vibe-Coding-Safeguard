// scripts/sync-vibe-guard-rules.ts
// Gera bin/lib/vibe-guard-rules.generated.cjs a partir da FONTE CANONICA:
// src/features/security-audit/domain/vibe-guard-rules.ts (Dogma: fonte unica).
// Rode: npm run sync:rules:guard  (executado automaticamente no build).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VIBE_GUARD_RULES } from '../src/features/security-audit/domain/vibe-guard-rules';

const here = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(here, '../bin/lib/vibe-guard-rules.generated.cjs');

const body = VIBE_GUARD_RULES.map((r) =>
  [
    '  {',
    `    id: ${JSON.stringify(r.id)},`,
    `    title: ${JSON.stringify(r.title)},`,
    `    regex: new RegExp(${JSON.stringify(r.regex.source)}, ${JSON.stringify(r.regex.flags)}),`,
    `    severity: ${JSON.stringify(r.severity)},`,
    `    descriptionLeiga: ${JSON.stringify(r.descriptionLeiga)},`,
    `    riscoReal: ${JSON.stringify(r.riscoReal)},`,
    `    recomendacaoLeiga: ${JSON.stringify(r.recomendacaoLeiga)},`,
    `    autoFixable: ${JSON.stringify(r.autoFixable)},`,
    '  },',
  ].join('\n'),
).join('\n');

const content = [
  '// bin/lib/vibe-guard-rules.generated.cjs',
  '// ARQUIVO GERADO AUTOMATICAMENTE — NAO EDITE A MAO.',
  '// Fonte: src/features/security-audit/domain/vibe-guard-rules.ts',
  '// Regenere com: npm run sync:rules:guard',
  '',
  'const VIBE_GUARD_RULES = [',
  body,
  '];',
  '',
  'module.exports = { VIBE_GUARD_RULES };',
  '',
].join('\n');

fs.writeFileSync(outPath, content, 'utf8');
// eslint-disable-next-line no-console
console.log(
  `✓ Regras geradas em ${path.relative(process.cwd(), outPath)} (${String(VIBE_GUARD_RULES.length)} regras).`,
);
