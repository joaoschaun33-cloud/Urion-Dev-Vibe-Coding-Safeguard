/**
 * 🧠 Urion Decision Engine (Motor de Decisão de Arquitetura Canônica)
 *
 * Mapeia respostas de negócios humanas (sem jargão técnico) para uma das 5
 * arquiteturas canônicas pré-definidas pelo Urion.
 */

export interface BusinessProfile {
  appName: string;
  targetAudience: 'PERSONAL' | 'CLIENTS' | 'PUBLIC';
  neededFeatures: Array<'LOGIN' | 'PAYMENT' | 'UPLOAD' | 'CHAT' | 'DASHBOARD' | 'REALTIME'>;
  platform: 'CURSOR' | 'LOVABLE' | 'BOLT' | 'V0' | 'WINDSURF' | 'OTHER';
  speedOrScale: 'FAST_3_DAYS' | 'SCALE_READY';
}

export type CanonicalArchitectureType =
  'lean-crud' | 'saas-supabase' | 'saas-supabase-stripe' | 'realtime-community' | 'internal-tool';

export interface CanonicalArchitectureConfig {
  type: CanonicalArchitectureType;
  displayName: string;
  humanReason: string;
  recommendedDb: 'SQLite' | 'Supabase Postgres' | 'PostgreSQL';
  hasStripeWrapper: boolean;
  hasRealtime: boolean;
}

export function inferCanonicalArchitecture(profile: BusinessProfile): CanonicalArchitectureConfig {
  const { neededFeatures, speedOrScale, targetAudience } = profile;

  if (neededFeatures.includes('PAYMENT')) {
    return {
      type: 'saas-supabase-stripe',
      displayName: 'SaaS Comercial com Pagamento Seguro',
      humanReason:
        'Seu app envolve cobranças financeiras. Definimos Supabase com RLS rigoroso e integração de pagamentos isolada via Stripe.',
      recommendedDb: 'Supabase Postgres',
      hasStripeWrapper: true,
      hasRealtime: false,
    };
  }

  if (neededFeatures.includes('CHAT') || neededFeatures.includes('REALTIME')) {
    return {
      type: 'realtime-community',
      displayName: 'Comunidade & Interação em Tempo Real',
      humanReason:
        'Seu app possui chat ou atualizações em tempo real. Configurada estrutura com Supabase Realtime e presenças ativas.',
      recommendedDb: 'Supabase Postgres',
      hasStripeWrapper: false,
      hasRealtime: true,
    };
  }

  if (neededFeatures.includes('LOGIN') || neededFeatures.includes('UPLOAD')) {
    return {
      type: 'saas-supabase',
      displayName: 'SaaS Padrão com Autenticação e Arquivos',
      humanReason:
        'App com login de usuários e upload de mídia. Escolhida arquitetura segura com storage blindado.',
      recommendedDb: 'Supabase Postgres',
      hasStripeWrapper: false,
      hasRealtime: false,
    };
  }

  if (speedOrScale === 'FAST_3_DAYS' || targetAudience === 'PERSONAL') {
    return {
      type: 'lean-crud',
      displayName: 'Aplicação Enxuta (Lançamento Rápido)',
      humanReason:
        'Foco em lançar rápido em poucos dias. Definido banco leve SQLite com suporte a até 10.000 usuários.',
      recommendedDb: 'SQLite',
      hasStripeWrapper: false,
      hasRealtime: false,
    };
  }

  return {
    type: 'internal-tool',
    displayName: 'Ferramenta Interna de Produtividade',
    humanReason: 'Ferramenta de uso operacional/interno com foco em formulários e dashboards.',
    recommendedDb: 'SQLite',
    hasStripeWrapper: false,
    hasRealtime: false,
  };
}
