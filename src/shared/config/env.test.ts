import { describe, it, expect } from 'vitest';
import { envSchema } from './env';

describe('envSchema', () => {
  it('aplica defaults em desenvolvimento', () => {
    const parsed = envSchema.parse({});
    expect(parsed.PORT).toBe('3000');
    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.LOG_LEVEL).toBe('info');
    expect(parsed.REDIS_HOST).toBe('localhost');
    expect(parsed.REDIS_PORT).toBe('6379');
  });

  it('exige DATABASE_URL e CORS_ORIGIN em producao', () => {
    const result = envSchema.safeParse({ NODE_ENV: 'production' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain('DATABASE_URL');
      expect(paths).toContain('CORS_ORIGIN');
    }
  });

  it('aceita producao quando as variaveis obrigatorias existem', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://u:p@h:5432/db',
      CORS_ORIGIN: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita NODE_ENV e LOG_LEVEL invalidos', () => {
    expect(envSchema.safeParse({ NODE_ENV: 'staging' }).success).toBe(false);
    expect(envSchema.safeParse({ LOG_LEVEL: 'verbose' }).success).toBe(false);
  });
});
