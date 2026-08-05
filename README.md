# 🛡️ Urion VibeGuard

> **O Guarda-Costas Digital para Vibe Coders e Criadores No-Code / Low-Code.**

[![npm version](https://img.shields.io/npm/v/urion-safeguard.svg?style=flat-square&color=cyan)](https://www.npmjs.com/package/urion-safeguard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Urion Verified Grade A](https://img.shields.io/badge/Urion_Verified-Grade_A-brightgreen.svg?style=flat-square)](https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard)

Ferramentas como **Cursor, Lovable, Bolt e v0** permitem criar aplicativos completos em minutos apenas com prompts. No entanto, pesquisas recentes mostram que **cerca de 45% do código gerado por IA introduz falhas de segurança conhecidas** ([Veracode, 2025](https://www.veracode.com/blog/ai-generated-code-security-risks/)) — como chaves de API expostas, logins desprotegidos e riscos de invasão de banco de dados.

O **Urion VibeGuard** é uma ferramenta ultraleve e sem fricção que analisa seu código instantaneamente, explica os riscos em **português simples** e impede que seu aplicativo seja hackeado.

---

## 🚀 Uso Rápido em 3 Segundos (Zero Setup)

Você **não** precisa instalar nada, não precisa de banco de dados e nem configurar servidores. Basta rodar o comando abaixo na pasta do seu projeto:

```bash
npx urion-safeguard vibeguard
```

### ⚡ O que acontece quando você roda?

1. **Varredura Instantânea**: Analisa seu código procurando as 5 falhas mais letais de apps gerados por IA.
2. **Diagnóstico Amigável**: Mostra seu **Score de Segurança (0 a 100)** e explica em português simples o risco real de cada problema.
3. **Como Corrigir**: Explica, em português simples, o passo a passo para corrigir manualmente cada risco encontrado.

---

## 🎯 As 5 Vulnerabilidades Que o Urion Bloqueia

| Vulnerabilidade              | O Risco Real para Seu App                                                                                         | Como o Urion Resolve                                                               |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| 🔑 **Secrets Hardcoded**     | Chaves Stripe, OpenAI ou AWS expostas no código público podem gerar cobranças de milhares de reais no seu cartão. | Identifica chaves expostas e orienta a migração para variáveis de ambiente `.env`. |
| 🔓 **Auth Client-Side**      | Login do usuário salvo no `localStorage` do navegador pode ser roubado por scripts maliciosos.                    | Recomenda o uso de Cookies seguros `HttpOnly`.                                     |
| 🛡️ **SQL Injection**         | Entradas de texto desprotegidas permitem que hackers apaguem ou baixem todo o seu banco de dados.                 | Detecta interpolação de texto e exige Prepared Statements / ORM.                   |
| ⚠️ **Exibição XSS**          | Exibir textos externos sem filtragem permite a invasores controlar a tela dos seus usuários.                      | Alerta a necessidade da biblioteca de sanitização `DOMPurify`.                     |
| 🚦 **Rate Limiting Ausente** | Páginas de login sem limite de tentativas facilitam ataques de robôs adivinhando senhas.                          | Alerta a ausência de bloqueio contra força bruta em rotas sensíveis.               |

---

## 🤖 Prevenção em Tempo Real com IA (Cursor / Claude / Antigravity)

Além do scanner de terminal, o Urion traz regras ativas para que a IA **nunca gere código inseguro**:

### 1. Regras Automáticas `.cursor/rules/security.mdc`

Copie o arquivo `.cursor/rules/security.mdc` para o seu projeto. O Cursor passará a recusar a geração de chaves expostas ou rotas inseguras automaticamente.

### 2. Servidor MCP (`@urion/mcp-server`)

Integre o motor VibeGuard como Servidor MCP no seu ambiente para interceptação neural em tempo real.

---

## 🏆 Selo Urion Verified

Seu projeto alcançou **Score ≥ 90** no VibeGuard? Adicione o selo oficial ao seu `README.md` para transmitir confiança total aos seus clientes e investidores:

```markdown
[![Urion Verified Grade A](https://img.shields.io/badge/Urion_Verified-Grade_A-brightgreen.svg?style=flat-square)](https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard)
```

---

## 📄 Licença

Distribuído sob a licença MIT. Criado para proteger a comunidade de Vibe Coders e Makers.
