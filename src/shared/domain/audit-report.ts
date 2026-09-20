// src/shared/domain/audit-report.ts
// Relatorio do Auditor em contexto fresco (roadmap 3.5). Dominio PURO.
// O auditor (subagente/modelo/pessoa que NAO escreveu o codigo) revisa o diff e
// entrega um JSON. Este modulo valida o relatorio por codigo: exige EVIDENCIA em
// cada achado e BLOQUEIA um "APPROVED" que contradiz achados CRITICAL/HIGH abertos.
//
// Limite declarado (Dogma Zero): o codigo NAO consegue provar que o contexto do
// auditor foi realmente limpo nem que o modelo e diferente — esses campos sao
// declaracoes do auditor, registradas e exibidas, nao verificadas. O que o codigo
// garante e a consistencia interna do relatorio e a presenca de evidencia.

import { z } from 'zod';

export const AUDIT_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export const AuditFindingSchema = z
  .object({
    severity: z.enum(AUDIT_SEVERITIES),
    claim: z.string().min(10, 'descreva o problema (min. 10 caracteres)'),
    file: z.string().min(1),
    line: z.number().int().min(1),
    evidence: z.string().min(5, 'cite o trecho de codigo que prova o achado'),
    status: z.enum(['OPEN', 'RESOLVED']),
    resolution: z.string().optional(),
  })
  .superRefine((f, ctx) => {
    if (f.status === 'RESOLVED' && (!f.resolution || f.resolution.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['resolution'],
        message: 'achado RESOLVED exige "resolution" (o que foi feito para resolver)',
      });
    }
  });

export const AuditReportSchema = z.object({
  reviewer: z.string().min(1),
  model: z.string().min(1),
  authorModel: z.string().min(1).optional(),
  contextIsolation: z.enum(['fresh', 'shared']),
  reviewedAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'data/hora ISO invalida'),
  scope: z.string().min(1),
  reviewedCommit: z.string().min(4).optional(),
  verdict: z.enum(['APPROVED', 'REJECTED']),
  findings: z.array(AuditFindingSchema),
});

export type AuditReport = z.infer<typeof AuditReportSchema>;

export type AuditStatus = 'APPROVED' | 'REJECTED' | 'INVALID';

export interface AuditEvaluation {
  status: AuditStatus;
  independent: boolean;
  sameModel: boolean;
  ageDays: number | null;
  openBlocking: number;
  problems: string[];
  notes: string[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function evaluateAuditReport(raw: unknown, now: Date = new Date()): AuditEvaluation {
  const parsed = AuditReportSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 'INVALID',
      independent: false,
      sameModel: false,
      ageDays: null,
      openBlocking: 0,
      problems: parsed.error.issues.map((i) => `${i.path.join('.') || '(raiz)'}: ${i.message}`),
      notes: [],
    };
  }

  const report = parsed.data;
  const problems: string[] = [];
  const notes: string[] = [];

  const reviewedMs = Date.parse(report.reviewedAt);
  const ageDays = (now.getTime() - reviewedMs) / MS_PER_DAY;
  if (ageDays < -0.01) {
    problems.push('reviewedAt esta no futuro: relatorio nao e confiavel');
  }

  const openBlocking = report.findings.filter(
    (f) => f.status === 'OPEN' && (f.severity === 'CRITICAL' || f.severity === 'HIGH')
  ).length;

  const independent = report.contextIsolation === 'fresh';
  if (!independent) {
    notes.push('contextIsolation="shared": nao conta como revisao independente');
  }

  const sameModel =
    report.authorModel !== undefined &&
    report.authorModel.trim().toLowerCase() === report.model.trim().toLowerCase();
  if (sameModel) {
    notes.push('mesmo modelo escreveu e auditou: independencia reduzida (ideal: outro modelo)');
  }

  let status: AuditStatus;
  if (problems.length > 0) {
    status = 'INVALID';
  } else if (report.verdict === 'REJECTED') {
    status = 'REJECTED';
  } else if (openBlocking > 0) {
    status = 'REJECTED';
    problems.push(
      `relatorio declara APPROVED mas ha ${String(openBlocking)} achado(s) CRITICAL/HIGH abertos: o auditor bloqueia`
    );
  } else {
    status = 'APPROVED';
  }

  return { status, independent, sameModel, ageDays, openBlocking, problems, notes };
}
