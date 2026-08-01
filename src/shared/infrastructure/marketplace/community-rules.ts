/**
 * 🌐 Marketplace de Regras Comunitárias (Community Rules Engine)
 *
 * Gerencia o registro, busca e distribuição de regras customizadas de auditoria
 * criadas pela comunidade (LGPD Brasil, HIPAA Saúde, Segurança Financeira, etc).
 */

export interface CommunityRuleDTO {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  category: 'LGPD' | 'HIPAA' | 'FINTECH' | 'GENERAL';
  author: string;
  downloads: number;
  isPublic: boolean;
}

const initialRules: CommunityRuleDTO[] = [
  {
    id: 'rule-lgpd-01',
    ruleId: 'LGPD_CPF_EXPOSURE',
    title: 'Proteção contra Exposição de CPF/CNPJ (LGPD Brasil)',
    description:
      'Bloqueia o armazenamento de CPF ou CNPJ sem criptografia em banco de dados ou logs.',
    category: 'LGPD',
    author: 'Comunidade Makers BR',
    downloads: 1420,
    isPublic: true,
  },
  {
    id: 'rule-hipaa-01',
    ruleId: 'HIPAA_PHI_LOGGING',
    title: 'Conformidade HIPAA em Logs de Saúde',
    description:
      'Garante que dados de identificação de pacientes (PHI) não sejam gravados em logs do Pino/Console.',
    category: 'HIPAA',
    author: 'HealthTech Security Labs',
    downloads: 890,
    isPublic: true,
  },
];

export function listCommunityRules(category?: string): CommunityRuleDTO[] {
  if (category) {
    return initialRules.filter((r) => r.category.toUpperCase() === category.toUpperCase());
  }
  return initialRules;
}

export function registerCommunityRule(rule: CommunityRuleDTO): CommunityRuleDTO {
  initialRules.push(rule);
  return rule;
}
