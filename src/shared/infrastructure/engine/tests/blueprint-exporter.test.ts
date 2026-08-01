import { describe, it, expect } from 'vitest';
import { exportProjectBlueprint, recordAuditTimelineEvent } from '../blueprint-exporter';
import fs from 'node:fs';
import path from 'node:path';

describe('Blueprint Exporter (Casos de Uso Reais)', () => {
  it('deve gerar um arquivo JSON anonimizado de estudo de caso na pasta docs/use-cases/', () => {
    const blueprint = exportProjectBlueprint('Sibanki Fintech', process.cwd());

    expect(blueprint.caseName).toBe('sibanki-fintech');
    expect(blueprint.communityRulesGenerated.length).toBeGreaterThan(0);

    const exportedFile = path.join(process.cwd(), 'docs', 'use-cases', 'case-sibanki-fintech.json');
    expect(fs.existsSync(exportedFile)).toBe(true);

    fs.unlinkSync(exportedFile);
  });

  it('deve registrar eventos do histórico do projeto (bloqueios, liberações e auto-fix)', () => {
    const updatedBlueprint = recordAuditTimelineEvent(
      'Sibanki Fintech',
      {
        eventType: 'BLOCKED_BY_GUARDRAIL',
        scoreAtEvent: 45,
        reason: 'Chave de API hardcoded no frontend detectada pela extensão',
      },
      process.cwd()
    );

    expect(updatedBlueprint.auditTimeline.length).toBeGreaterThan(0);
    expect(updatedBlueprint.auditTimeline[0].eventType).toBe('BLOCKED_BY_GUARDRAIL');
    expect(updatedBlueprint.auditTimeline[0].scoreAtEvent).toBe(45);

    const exportedFile = path.join(process.cwd(), 'docs', 'use-cases', 'case-sibanki-fintech.json');
    if (fs.existsSync(exportedFile)) {
      fs.unlinkSync(exportedFile);
    }
  });
});
