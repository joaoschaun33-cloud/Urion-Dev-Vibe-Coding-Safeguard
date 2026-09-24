import { confusion, pct, pctWithInterval, sum, type Confusion } from './metrics';
import type { BenchCase, CaseOutcome, EngineName } from './types';

export interface EngineRun {
  engine: EngineName;
  label: string;
  rules: readonly string[];
  outcomes: CaseOutcome[];
}

interface RuleRow {
  rule: string;
  c: Confusion;
}

function rows(run: EngineRun): RuleRow[] {
  return run.rules.map((rule) => ({ rule, c: confusion(run.outcomes, rule) }));
}

function table(run: EngineRun): string {
  const lines = [
    '| Regra | Casos vulneráveis | Detectou (TP) | Perdeu (FN) | Alarme falso (FP) | Recall (IC 95%) | Precisão (IC 95%) |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const { rule, c } of rows(run)) {
    lines.push(
      `| \`${rule}\` | ${String(c.tp + c.fn)} | ${String(c.tp)} | ${String(c.fn)} | ${String(c.fp)} | ${pctWithInterval(c.tp, c.tp + c.fn)} | ${pctWithInterval(c.tp, c.tp + c.fp)} |`
    );
  }
  const t = sum(rows(run).map((r) => r.c));
  lines.push(
    `| **Total (micro)** | **${String(t.tp + t.fn)}** | **${String(t.tp)}** | **${String(t.fn)}** | **${String(t.fp)}** | **${pctWithInterval(t.tp, t.tp + t.fn)}** | **${pctWithInterval(t.tp, t.tp + t.fp)}** |`
  );
  return lines.join('\n');
}

function detail(run: EngineRun, cases: ReadonlyMap<string, BenchCase>): string {
  const out: string[] = [];
  for (const rule of run.rules) {
    const missed = run.outcomes.filter((o) => o.expected.has(rule) && !o.fired.has(rule));
    const falseAlarms = run.outcomes.filter((o) => !o.expected.has(rule) && o.fired.has(rule));
    if (missed.length === 0 && falseAlarms.length === 0) {
      continue;
    }
    out.push(`#### \`${rule}\``);
    for (const o of missed) {
      out.push(`- **Perdeu** \`${o.id}\` — ${cases.get(o.id)?.why ?? ''}`);
    }
    for (const o of falseAlarms) {
      out.push(`- **Alarme falso** \`${o.id}\` — ${cases.get(o.id)?.why ?? ''}`);
    }
    out.push('');
  }
  return out.length > 0 ? out.join('\n') : '_Nenhum erro neste motor._\n';
}

export function renderReport(
  runs: readonly EngineRun[],
  cases: readonly BenchCase[],
  meta: { version: string }
): string {
  const byId = new Map(cases.map((c) => [c.id, c]));
  const positives = cases.filter(
    (c) => (c.expect.vibeguard?.length ?? 0) + (c.expect.checks?.length ?? 0) > 0
  ).length;

  const parts: string[] = [
    '# Benchmark dos detectores (resultado gerado)',
    '',
    `> Gerado por \`npm run benchmark\` (urion-safeguard ${meta.version}). **Não edite à mão** — rode o comando de novo.`,
    '',
    '## Como ler (e por que não confiar cegamente)',
    '',
    `- **Corpus sintético:** ${String(cases.length)} mini-projetos (${String(positives)} vulneráveis, ${String(cases.length - positives)} seguros), escritos pela própria equipe a partir de padrões reais de apps gerados por IA. **Quem escreveu o corpus conhece os detectores**: os números tendem a ser **otimistas**. O teste que vale é rodar em repositórios reais (passo 3 do plano).`,
    '- **Granularidade:** por *caso* (a regra disparou neste projeto? sim/não), não por linha. Acertar a regra na linha errada conta como acerto.',
    '- **Intervalo de confiança (IC 95%, Wilson):** com poucos casos por regra, o intervalo é largo — e deve ser. Um "100%" com 8 casos ainda é compatível com ~68% na população.',
    '- **Falso positivo** = a regra disparou onde o gabarito diz que não deveria (inclusive disparos incidentais de outras regras).',
    '- **Gabarito é opinião fundamentada:** cada caso tem uma justificativa (`why`); casos discutíveis estão listados abaixo com ela, para quem discordar contestar caso a caso.',
    '',
  ];
  for (const run of runs) {
    parts.push(`## ${run.label}`, '', table(run), '', '### Erros por regra', '', detail(run, byId));
  }
  return parts.join('\n');
}

export function consoleSummary(runs: readonly EngineRun[]): string {
  const lines: string[] = [];
  for (const run of runs) {
    lines.push(`\n${run.label}`);
    for (const { rule, c } of rows(run)) {
      const recall = c.tp + c.fn === 0 ? null : c.tp / (c.tp + c.fn);
      const prec = c.tp + c.fp === 0 ? null : c.tp / (c.tp + c.fp);
      lines.push(
        `  ${rule.padEnd(24)} TP=${String(c.tp).padStart(2)} FN=${String(c.fn).padStart(2)} FP=${String(c.fp).padStart(2)}  recall=${pct(recall).padStart(4)}  precisao=${pct(prec).padStart(4)}`
      );
    }
  }
  return lines.join('\n');
}
