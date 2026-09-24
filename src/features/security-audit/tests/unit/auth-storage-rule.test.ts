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
    // Achados em dados NUNCA vistos (o regex antigo perdia ~2/3): flag de login, chave em constante, session_id.
    'localStorage.setItem("gcet_admin_auth", "true");',
    "sessionStorage.setItem('admin_authenticated', 'true');",
    'localStorage.setItem("isAuthenticated", "true");',
    'window.localStorage.setItem(ACCESS_TOKEN_KEY, nextToken);',
    'localStorage.setItem(TOKEN_KEY, token);',
    'localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));',
    "sessionStorage.setItem('session_id', id);",
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
    "localStorage.setItem('cart_session_id', s)",
    "sessionStorage.setItem('post_auth_redirect', p)",
    "sessionStorage.setItem('hmrc_oauth_state', s)",
    "localStorage.setItem('sliding_banner_dismissed_session', 'true')",
    'localStorage.setItem(THEME_KEY, t)',
    'localStorage.setItem(SESSIONS_KEY, JSON.stringify(s))',
    "localStorage.setItem('authorName', n)",
  ])('%s', (line) => {
    expect(re.test(line)).toBe(false);
  });
});
