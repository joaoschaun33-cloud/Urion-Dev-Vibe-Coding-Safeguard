// src/features/spec-manager/application/check-spec-gate.ts
// Gate de spec (roadmap 3.3), PURO: dado o nome de uma feature e as specs
// candidatas do projeto, decide se a IA pode comecar a implementar ou se deve
// pedir/completar a spec antes (Spec-Driven Development).
// Limite declarado: verifica EXISTENCIA e criterios de aceite — nao julga a
// qualidade do texto nem se o PO aprovou a spec.

export interface SpecCandidate {
  path: string;
  content: string;
}

export type SpecGateStatus = 'SPEC_OK' | 'NEEDS_SPEC' | 'INCOMPLETE_SPEC';

export interface MatchedSpec {
  path: string;
  title: string;
  criteria: number;
  completedCriteria: number;
}

export interface SpecGateResult {
  status: SpecGateStatus;
  feature: string;
  spec: MatchedSpec | null;
  message: string;
  nextStep: string;
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CHECKBOX_RE = /^\s*[-*]\s+\[([ xX])\]/;
const BULLET_RE = /^\s*[-*]\s+\S/;
const HEADING_RE = /^#{1,6}\s/;
const CRITERIA_HEADING_RE = /^#{1,6}\s.*(crit[eé]rios?\s+de\s+aceit|acceptance\s+criteria)/i;

export function countCriteria(content: string): { total: number; completed: number } {
  let total = 0;
  let completed = 0;
  let inCriteriaSection = false;

  for (const line of content.split('\n')) {
    if (HEADING_RE.test(line)) {
      inCriteriaSection = CRITERIA_HEADING_RE.test(line);
      continue;
    }
    const checkbox = CHECKBOX_RE.exec(line);
    if (checkbox) {
      total++;
      if (checkbox[1].toLowerCase() === 'x') {
        completed++;
      }
    } else if (inCriteriaSection && BULLET_RE.test(line)) {
      total++;
    }
  }
  return { total, completed };
}

function titleOf(spec: SpecCandidate): string {
  const m = /^#\s+(.+)$/m.exec(spec.content);
  return m ? m[1].trim() : (spec.path.split('/').pop() ?? spec.path);
}

function matches(featureTokens: string[], spec: SpecCandidate): boolean {
  const haystack = `${slugify(spec.path.split('/').pop() ?? '')} ${slugify(titleOf(spec))}`;
  return featureTokens.every((t) => haystack.includes(t));
}

export function evaluateSpecGate(feature: string, specs: SpecCandidate[]): SpecGateResult {
  const featureSlug = slugify(feature);
  if (featureSlug.length === 0) {
    return {
      status: 'NEEDS_SPEC',
      feature,
      spec: null,
      message: 'Nome da feature vazio: nao ha como associar uma spec.',
      nextStep: 'Informe o nome da feature que sera implementada e chame o gate de novo.',
    };
  }

  const tokens = featureSlug.split('-').filter((t) => t.length > 0);
  const found = specs
    .filter((s) => matches(tokens, s))
    .map((s) => {
      const { total, completed } = countCriteria(s.content);
      return {
        path: s.path,
        title: titleOf(s),
        criteria: total,
        completedCriteria: completed,
      };
    })
    .sort((a, b) => b.criteria - a.criteria);

  if (found.length === 0) {
    return {
      status: 'NEEDS_SPEC',
      feature,
      spec: null,
      message: `Nenhuma spec encontrada para "${feature}". Codigo sem spec aprovada viola o processo Spec-Driven do projeto.`,
      nextStep:
        'NAO implemente ainda. Peca ao usuario para descrever a feature (ou escreva a spec com ele) em docs/01-product/ ou docs/specs/ com uma secao "Criterios de aceite" (lista de itens - [ ]) e chame o gate de novo.',
    };
  }

  const best = found[0];
  if (best.criteria === 0) {
    return {
      status: 'INCOMPLETE_SPEC',
      feature,
      spec: best,
      message: `A spec "${best.path}" existe mas nao tem criterios de aceite verificaveis.`,
      nextStep:
        'NAO implemente ainda. Adicione uma secao "Criterios de aceite" com itens verificaveis (- [ ] ...) em ' +
        best.path +
        ' e chame o gate de novo.',
    };
  }

  return {
    status: 'SPEC_OK',
    feature,
    spec: best,
    message: `Spec encontrada: "${best.path}" (${String(best.completedCriteria)}/${String(best.criteria)} criterios de aceite concluidos).`,
    nextStep: 'Pode implementar seguindo os criterios de aceite da spec.',
  };
}
