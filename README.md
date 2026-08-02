<!-- PROJECT SHIELDS & BADGES -->
<div align="center">

  <a href="https://urion.ia.br">
    <img src="docs/assets/banner.svg" alt="Urion Dev Vibe Coding Safeguard Banner" width="100%" max-width="800px" style="border-radius: 12px; margin-bottom: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  </a>

  <h1 align="center">🛡️ Urion Trust & Safety for Creators</h1>

  <p align="center">
    <strong>A Camada de Confiança Definitiva para Software Gerado por IA, Vibe Coding, No-Code e Low-Code.</strong>
    <br />
    <em>Publique com a certeza de um engenheiro sênior, mesmo sem ser um.</em>
    <br />
    <br />
    <a href="https://urion.ia.br"><strong>🚀 Acessar Plataforma & Dashboard Ao Vivo »</strong></a>
    <br />
    <br />
    <a href="#-quick-start-em-30-segundos">Início Rápido</a>
    ·
    <a href="#-recursos-principais--cobertura">Recursos & No-Code</a>
    ·
    <a href="#-quality-gate-webhook-vercel--netlify">Quality Gate Webhook</a>
    ·
    <a href="https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard/issues">Reportar Bug</a>
  </p>

  <!-- README TYPING ANIMATED SVG HEADER -->
  <p align="center">
    <a href="https://urion.ia.br">
      <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pause=1000&color=8B5CF6&center=true&vCenter=true&width=650&lines=Dogma+Zero%3A+A+IA+nunca+mente+sobre+testes.;Selo+P%C3%BAblico+Urion+Verified+para+No-Code+e+Vibe+Coding.;Quality+Gate+Webhook+para+Vercel%2C+Netlify+e+Railway.;Auditoria+de+Workflows+n8n%2C+Make.com+e+OpenAPI." alt="Readme Typing SVG" />
    </a>
  </p>

  <!-- BADGES -->
  <p align="center">
    <a href="https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard">
      <img src="https://img.shields.io/badge/Protected%20by-Urion%20Safeguard-8B5CF6?style=for-the-badge&logo=shield&logoColor=white" alt="Protected by Urion Safeguard" />
    </a>
    <a href="https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard/actions/workflows/vibe-safeguard-bot.yml">
      <img src="https://img.shields.io/badge/CI%20Pipeline-Passing-10B981?style=for-the-badge&logo=github&color=10B981" alt="CI Status" />
    </a>
    <a href="https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard/actions">
      <img src="https://img.shields.io/badge/Security%20Audit-Passing-10B981?style=for-the-badge&logo=shield&color=10B981" alt="Security Status" />
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&logo=open-source-initiative&color=F59E0B" alt="License MIT" />
    </a>
    <a href="https://nodejs.org">
      <img src="https://img.shields.io/badge/Node.js-v20.x-green?style=for-the-badge&logo=node.js&color=339933" alt="Node Version" />
    </a>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/React-v18.x-blue?style=for-the-badge&logo=react&color=61DAFB" alt="React Version" />
    </a>
    <a href="https://n8n.io">
      <img src="https://img.shields.io/badge/No--Code%20Audit-n8n%20%7C%20Make%20%7C%20OpenAPI-purple?style=for-the-badge&logo=n8n&color=8B5CF6" alt="No-Code Audit" />
    </a>
  </p>
</div>

---

## 📺 Dashboard & Selo Público Urion Verified

> **O problema:** 85% dos projetos criados apenas com prompts de IA (Cursor, Antigravity, Windsurf) colapsam no 2º mês por falta de arquitetura e segredos expostos, gerando descredibilização de mercado para makers e solopreneurs.

<div align="center">
  <a href="https://urion.ia.br">
    <img src="docs/assets/dashboard-preview.png" alt="Urion Safeguard Dashboard & Selo Urion Verified Preview" width="100%" style="max-width: 900px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
  </a>
  <p align="center" style="margin-top: 8px;">
    <sub>💡 <i>Exiba a badge pública auditável <strong>Urion Verified</strong> no rodapé do seu app para comprovar a qualidade do projeto a clientes e investidores.</i></sub>
  </p>
</div>

---

## ⚡ Quick Start em 30 Segundos (Zero-Docker)

Inicialize um novo projeto 100% blindado com a nossa CLI interativa em **1 único comando**:

```bash
# Executar a CLI interativa (v2.0) em qualquer projeto
npx urion-safeguard

# Ou subcomandos diretos
npx urion-safeguard scanner   # Raio-X completo e Health Score (0-100%)
npx urion-safeguard blueprint # Transmitir blueprint anonimizado (SHA-256)
npx urion-safeguard rules     # Verificar regras MDC (.cursor/rules/)
```

Ou rode o repositório localmente em 3 passos simples (sem necessidade de Docker):

```bash
# 1. Clonar o repositório oficial
git clone https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard.git && cd Urion-Dev-Vibe-Coding-Safeguard

# 2. Instalar dependências e preparar o banco local (SQLite)
npm install && npx prisma db push

# 3. Executar o Doctor CLI e o Dashboard Web
npm run cursor-doctor
npm run dev:web
```

- 🌐 **Dashboard Web**: http://localhost:5173
- 🔌 **API REST Backend**: http://localhost:3000/api/v1/health

> 💡 _Nota para Produção:_ O uso de PostgreSQL/Docker-Compose (`docker-compose up -d`) é **opcional** e recomendado apenas para ambientes de homologação e produção enterprise.

---

## 🧩 Recursos Principais & Cobertura

### 1. Suporte a Artefatos No-Code & Low-Code (`NoCodeArtifactScanner`)

O Urion varre não apenas código tradicional (JS/TS, Python), mas também estruturas declarativas e automações visuais:

- ⚡ **Workflows do n8n:** Detecta chaves de API e segredos hardcoded em nós de automação.
- 🔄 **Blueprints do Make.com:** Identifica tokens de autenticação expostos no fluxo.
- 📜 **OpenAPI / Swagger Specs:** Valida se os endpoints possuem autenticação global (`security`) configurada.
- 📦 **YAML / JSON Configs:** Varre arquivos de implantação Docker-Compose e CI/CD.

### 2. Quality Gate Webhook (Vercel / Netlify / Railway)

Intercepta o deploy em plataformas de hospedagem e aplica o **Quality Gate**:

- Endpoint: `POST /webhooks/deploy-quality-gate`
- Retorna **`HTTP 200 (APPROVED)`** para deploys limpos ou **`HTTP 422 (REJECTED)`** para barrar implantações inseguras em produção.

### 3. GitHub Action Bot (PR Feedback Empático)

Robô integrado ao GitHub (`.github/workflows/vibe-safeguard-bot.yml`) que analisa Pull Requests e comenta relatórios didáticos com tom amigável para vibe coders.

---

## 🧪 Exemplos Práticos

### 1. Gerar uma Nova Feature Isolada (FSD Auto-Wired)

Em vez de deixar a IA misturar rotas com banco de dados, use o scaffold CLI:

```bash
npm run generate:feature checkout
```

_Gera as camadas `domain`, `application`, `infrastructure`, `presentation` e registra automaticamente no DI Container e Express Routes._

### 2. Auditoria AST Estática & No-Code Instantânea

Detecte vazamentos de segredos e `console.log` residuais em 1 segundo:

```bash
npm run cursor-doctor
```

---

## 🛡️ Os 4 Pilares do Urion Safeguard

| Pilar                                | Como Protege Seu Projeto                                                                               |
| :----------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **1. Dogma Zero (`AGENTS.md`)**      | Obriga a IA a ser 100% honesta. Bloqueia PRs se a IA alegar que "os testes passaram" sem gerar provas. |
| **2. Feature-Sliced Design (FSD)**   | Impede importações cruzadas entre funcionalidades. `features/auth` nunca importa `features/payment`.   |
| **3. Spec-Driven Development (SDD)** | Conecta especificações em `docs/00-context/prd.md` ao código via tags `@implements US-*`.              |
| **4. No-Code Trust Layer**           | Audita automações n8n, Make e OpenAPI, gerando o selo público de garantia **Urion Verified**.          |

---

## 🤝 Como Contribuir

Contribuições são o que tornam a comunidade open source um lugar incrível!

1. Faça um Fork do projeto (`git checkout -b feature/IncrivelFeature`)
2. Commit suas alterações (`git commit -m 'feat: adicionar IncrivelFeature'`)
3. Push para a branch (`git push origin feature/IncrivelFeature`)
4. Abra um **Pull Request**

---

## 📄 Licença e Autor

Distribuído sob a Licença MIT. Veja `LICENSE` para mais informações.

Criado e Mantido por **[João Schaun](https://github.com/joaoschaun33-cloud)**.
