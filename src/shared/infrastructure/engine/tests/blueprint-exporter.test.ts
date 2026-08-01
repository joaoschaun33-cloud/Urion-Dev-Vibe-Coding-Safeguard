import { describe, it, expect } from 'vitest';
import { exportProjectBlueprint } from '../blueprint-exporter';
import fs from 'node:fs';
import path from 'node:path';

describe('Blueprint Exporter (Casos de Uso Reais)', () => {
  it('deve gerar um arquivo JSON anonimizado de estudo de caso na pasta docs/use-cases/', () => {
    const blueprint = exportProjectBlueprint('Sibanki Fintech', process.cwd());

    expect(blueprint.caseName).toBe('sibanki-fintech');
    expect(blueprint.communityRulesGenerated.length).toBeGreaterThan(0);

    const exportedFile = path.join(process.cwd(), 'docs', 'use-cases', 'case-sibanki-fintech.json');
    expect(fs.existsSync(exportedFile)).toBe(true);

    // Limpa o arquivo de teste gerado
    fs.unlinkSync(exportedFile);
  });
});
