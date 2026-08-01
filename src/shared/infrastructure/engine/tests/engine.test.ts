import { describe, it, expect } from 'vitest';
import { inferCanonicalArchitecture, BusinessProfile } from '../decision-engine';
import { scanExistingProject } from '../adopt-scanner';

describe('Urion Decision Engine & Adopt Scanner', () => {
  it('deve inferir arquitetura saas-supabase-stripe quando houver pagamento', () => {
    const profile: BusinessProfile = {
      appName: 'Pizzaria SaaS',
      targetAudience: 'CLIENTS',
      neededFeatures: ['LOGIN', 'PAYMENT', 'DASHBOARD'],
      platform: 'LOVABLE',
      speedOrScale: 'SCALE_READY',
    };

    const arch = inferCanonicalArchitecture(profile);

    expect(arch.type).toBe('saas-supabase-stripe');
    expect(arch.hasStripeWrapper).toBe(true);
    expect(arch.recommendedDb).toBe('Supabase Postgres');
  });

  it('deve inferir arquitetura lean-crud para lançamentos em 3 dias', () => {
    const profile: BusinessProfile = {
      appName: 'Meu MVP Rápido',
      targetAudience: 'PERSONAL',
      neededFeatures: [],
      platform: 'CURSOR',
      speedOrScale: 'FAST_3_DAYS',
    };

    const arch = inferCanonicalArchitecture(profile);

    expect(arch.type).toBe('lean-crud');
    expect(arch.recommendedDb).toBe('SQLite');
  });

  it('deve detectar o estado do projeto no modo resgate', () => {
    const result = scanExistingProject(process.cwd());

    expect(result.isExistingProject).toBe(true);
    expect(result.safetyMap.safeZones.length).toBeGreaterThan(0);
  });
});
