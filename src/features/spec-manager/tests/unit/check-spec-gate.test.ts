import { describe, it, expect } from 'vitest';
import { evaluateSpecGate, slugify } from '../../application/check-spec-gate';

const specWithCriteria = {
  path: 'docs/01-product/spec-login-google.md',
  content:
    '# Spec — Login com Google\n\n## Criterios de aceite\n\n- [ ] Botao visivel\n- [x] Token validado\n',
};

describe('slugify', () => {
  it('normaliza acentos, caixa e separadores', () => {
    expect(slugify('Login com Google!')).toBe('login-com-google');
    expect(slugify('  Autenticação  Básica ')).toBe('autenticacao-basica');
    expect(slugify('***')).toBe('');
  });
});

describe('evaluateSpecGate (roadmap 3.3)', () => {
  it('SPEC_OK quando ha spec da feature com criterios de aceite', () => {
    const r = evaluateSpecGate('login com google', [specWithCriteria]);
    expect(r.status).toBe('SPEC_OK');
    expect(r.spec?.path).toBe('docs/01-product/spec-login-google.md');
    expect(r.spec?.criteria).toBe(2);
    expect(r.spec?.completedCriteria).toBe(1);
  });

  it('NEEDS_SPEC quando nenhuma spec corresponde a feature', () => {
    const r = evaluateSpecGate('pagamento por pix', [specWithCriteria]);
    expect(r.status).toBe('NEEDS_SPEC');
    expect(r.spec).toBeNull();
    expect(r.nextStep).toContain('NAO implemente');
  });

  it('NEEDS_SPEC quando nao ha nenhuma spec no projeto', () => {
    expect(evaluateSpecGate('qualquer', []).status).toBe('NEEDS_SPEC');
  });

  it('INCOMPLETE_SPEC quando a spec existe sem criterios de aceite', () => {
    const r = evaluateSpecGate('login com google', [
      { path: 'docs/specs/login-google.md', content: '# Login com Google\n\nTexto solto.\n' },
    ]);
    expect(r.status).toBe('INCOMPLETE_SPEC');
    expect(r.spec?.criteria).toBe(0);
    expect(r.nextStep).toContain('docs/specs/login-google.md');
  });

  it('conta bullets sob o titulo "Criterios de aceite" mesmo sem checkbox', () => {
    const r = evaluateSpecGate('busca', [
      {
        path: 'docs/specs/busca.md',
        content:
          '# Busca\n\n## Critérios de Aceitação\n\n- Retorna em ate 1s\n- Ordena por relevancia\n\n## Notas\n\n- isto nao conta\n',
      },
    ]);
    expect(r.status).toBe('SPEC_OK');
    expect(r.spec?.criteria).toBe(2);
  });

  it('casa pelo titulo do documento, nao so pelo nome do arquivo', () => {
    const r = evaluateSpecGate('recuperar senha', [
      {
        path: 'docs/specs/auth-2.md',
        content: '# Recuperar Senha por e-mail\n\n- [ ] Envia link\n',
      },
    ]);
    expect(r.status).toBe('SPEC_OK');
  });

  it('prefere a spec com mais criterios quando ha varias candidatas', () => {
    const r = evaluateSpecGate('login', [
      { path: 'docs/specs/login-rascunho.md', content: '# Login\n\nsem criterios\n' },
      { path: 'docs/specs/login.md', content: '# Login\n\n- [ ] a\n- [ ] b\n- [ ] c\n' },
    ]);
    expect(r.status).toBe('SPEC_OK');
    expect(r.spec?.path).toBe('docs/specs/login.md');
  });

  it('feature vazia nao tem como associar spec', () => {
    const r = evaluateSpecGate('  ', [specWithCriteria]);
    expect(r.status).toBe('NEEDS_SPEC');
    expect(r.message).toContain('vazio');
  });
});
