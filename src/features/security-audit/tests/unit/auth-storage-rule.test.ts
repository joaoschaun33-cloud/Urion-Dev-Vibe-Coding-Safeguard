// Regressao da regra AUTH_CLIENT_SIDE (credencial guardada no navegador). Ampliada apos a
// medicao em 81 repositorios reais: a regra antiga so achava 6 de 11 projetos com o problema.
import { describe, expect, it } from 'vitest';
import { VIBE_GUARD_RULES } from '../../domain/vibe-guard-rules';

const re = VIBE_GUARD_RULES.find((r) => r.id === 'AUTH_CLIENT_SIDE')?.regex as RegExp;

describe('AUTH_CLIENT_SIDE — deve acusar credencial em web storage / cookie de navegador', () => {
  it.each([
    "localStorage.setItem('token', data.token);",
    'sessionStorage.setItem("jwt", d.jwt);',
    'localStorage.setItem("accessToken", x)',
    "localStorage.setItem('access_token', access);",
    "localStorage.setItem('authToken', t)",
    "localStorage.setItem('spotify_token', tokenData.access_token);",
    "sessionStorage.setItem('googleFitAccessToken', accessToken);",
    "localStorage.setItem('supabase.auth.token', JSON.stringify(s))",
    "localStorage.setItem('session', v)",
    'localStorage.token = t;',
    "localStorage['token'] = t;",
    'document.cookie = "session=" + t + "; path=/";',
    'document.cookie = `token=${t}; path=/`;',
  ])('%s', (line) => {
    expect(re.test(line)).toBe(true);
  });
});

describe('AUTH_CLIENT_SIDE — NAO deve acusar preferencia de UI nem comparacao', () => {
  it.each([
    "localStorage.setItem('theme', 'dark')",
    "localStorage.setItem('language', 'pt')",
    "sessionStorage.setItem('cartId', id)",
    "localStorage.setItem('tokenizerMode', 'fast')",
    "localStorage.setItem('session-filter', f)",
    'if (localStorage.token === x) {}',
    'document.cookie = "theme=dark"',
    "document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';",
  ])('%s', (line) => {
    expect(re.test(line)).toBe(false);
  });
});
