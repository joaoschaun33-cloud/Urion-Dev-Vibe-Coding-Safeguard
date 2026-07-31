import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  ArrowRight, 
  Activity,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  onOpenDashboard: () => void;
}

export function LandingPage({ onOpenDashboard }: LandingPageProps) {
  const [heroTyped, setHeroTyped] = useState('');
  const [heroPhase, setHeroPhase] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeCliTab, setActiveCliTab] = useState<'doctor' | 'generate' | 'spec:lint' | 'dev:web'>('doctor');
  const [autoFixed, setAutoFixed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fullHeadlines = [
    "A IA MENTIU.\nSEU PROJETO\nCOLAPSOU.",
    "O URION\nNÃO DEIXA."
  ];

  // Typing effect
  useEffect(() => {
    let idx = 0;
    const target = fullHeadlines[heroPhase];
    setHeroTyped('');
    const interval = setInterval(() => {
      if (idx <= target.length) {
        setHeroTyped(target.slice(0, idx));
        idx++;
      } else {
        clearInterval(interval);
        if (heroPhase === 0) {
          setTimeout(() => setHeroPhase(1), 1200);
        }
      }
    }, 32);
    return () => clearInterval(interval);
  }, [heroPhase]);

  const copyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setToast(`Copiado: ${cmd}`);
    setTimeout(() => setToast(null), 2500);
    setTimeout(() => setCopied(null), 2000);
  };

  const cliOutputs = {
    doctor: `$ npx urion doctor --strict

✓ 00-context/vision.md       present
✓ 00-context/prd.md          12 stories mapped
✗ features/auth → features/payment  [FSD violation]
  └─ src/features/auth/hooks/useSession.ts:14
✗ honesty.mdc violation      claim without evidence
  └─ .cursor/rules/honesty.mdc:4

Score 92/100 — 2 fixable
> npx urion fix --auto`,
    generate: `$ npm run generate:feature checkout

▸ Scaffolding FSD slice...
  features/checkout/
  ├─ domain/ checkout.entity.ts
  ├─ application/ checkout.usecase.ts
  ├─ presentation/ checkout.controller.ts
  └─ index.ts [public API only]

✓ Linter passed
✓ Spec linked: US-07 @implements checkout
✓ No cross-imports detected`,
    'spec:lint': `$ npm run spec:lint

Checking orphan code...
✗ src/components/RandomButton.tsx
  → No @implements tag, no PRD reference
  → Suggestion: link to US-03 or delete

✓ 00-context/prd.md coverage: 94%
✓ All features traceable to vision.md`,
    'dev:web': `$ npm run dev:web

▲ Vite + React
- Local:   http://localhost:5173
- Dashboard: http://localhost:5173/_urion

[URION] watching 00-context/...
[URION] Score overlay injected ✓
[URION] FSD guard active`
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 selection:bg-[#8B5CF6]/30 selection:text-white overflow-x-hidden font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap');
        .space-font { font-family: 'Space Grotesk', Inter, system-ui, sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace !important; }
        .grid-bg {
          background-image: 
            linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .glow { box-shadow: 0 0 80px rgba(139,92,246,0.18), inset 0 1px 0 rgba(255,255,255,0.06); }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] mono text-[12px] bg-white text-black px-4 py-2 rounded-full shadow-xl border border-black/10 flex items-center gap-2 max-w-[90vw]">
          <Check className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{toast}</span>
        </div>
      )}

      {/* TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-violet-900/40 via-purple-900/40 to-violet-900/40 border-b border-violet-500/20 py-2 text-center text-xs text-violet-300 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <strong>Urion Dev Vibe Coding Safeguard v1.0</strong> — A primeira plataforma open source de governança de IA do Brasil.
        </span>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0B]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-bold tracking-tight space-font">URION.OS</span>
              <span className="h-2 w-2 rounded-full bg-[#8B5CF6] shadow-[0_0_12px_#8B5CF6]" />
            </div>
            <div className="hidden lg:flex items-center gap-6 text-[13px] text-zinc-400 mono">
              <a href="#manifesto" className="hover:text-white transition">Manifesto</a>
              <a href="#arquitetura" className="hover:text-white transition">Arquitetura FSD</a>
              <a href="#dogma" className="hover:text-white transition">Dogma Zero</a>
              <a href="#cli" className="hover:text-white transition">CLI Showcase</a>
              <a href="#comunidade" className="hover:text-white transition">Comunidade</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs mono text-zinc-400 hover:border-white/20 hover:text-white transition"
            >
              <svg className="w-4 h-4 fill-current inline-block" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> <span>GitHub ⭐</span>
            </a>
            <button 
              onClick={onOpenDashboard} 
              className="mono flex items-center gap-2 rounded-full bg-[#8B5CF6] text-white px-4 h-8 text-[12px] font-medium hover:bg-[#7C3AED] transition shadow-lg shadow-purple-600/20"
            >
              <Activity className="w-3.5 h-3.5" /> Painel de Controle Demo
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-[1280px] px-5 lg:px-8 pt-10 lg:pt-20 pb-16">
        <div className="absolute inset-0 -z-10 grid-bg opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)]" />
        <div className="absolute left-1/2 top-24 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#8B5CF6]/[0.14] blur-[120px]" />

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-6 items-start">
          {/* HERO LEFT */}
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1 text-[11px] mono text-[#FF8A8A] mb-6">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#EF4444]" />
              ALERTA: 85% dos projetos vibe-coded colapsam em 30 dias por débito técnico
            </div>

            <h1 className="text-[36px] md:text-[56px] lg:text-[64px] font-bold leading-[0.9] tracking-[-0.04em] min-h-[190px] md:min-h-[260px] whitespace-pre-line space-font">
              <span className={heroPhase === 0 ? "text-white" : "text-zinc-500 line-through decoration-[#EF4444]/60 decoration-4"}>
                {heroPhase === 0 ? heroTyped : fullHeadlines[0]}
              </span>
              {heroPhase === 1 && (
                <span className="block mt-2 text-white">
                  <span className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">{heroTyped}</span>
                  <span className="ml-1 inline-block h-[0.9em] w-[10px] -mb-1 bg-[#8B5CF6] animate-pulse" />
                </span>
              )}
            </h1>

            <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-zinc-400">
              O Sistema Operacional Open Source para Vibe Coding que impõe <span className="text-white font-semibold">Honestidade Absoluta</span>, <span className="text-white font-semibold">Feature-Sliced Design (FSD)</span> e <span className="text-white font-semibold">Spec-Driven Development</span>. Seu sonho digital não vira código espaguete.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <div className="group flex items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] pl-4 pr-2 py-2 glow hover:border-[#8B5CF6]/40 transition">
                <span className="mono text-[13px] text-zinc-300">$ npx create-vibe-safeguard meu-app</span>
                <button 
                  onClick={() => copyCmd('npx create-vibe-safeguard meu-app')} 
                  className="ml-2 flex h-7 w-7 items-center justify-center rounded-[8px] bg-white text-black hover:bg-zinc-100"
                >
                  {copied === 'npx create-vibe-safeguard meu-app' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <button 
                onClick={onOpenDashboard} 
                className="mono flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.06] px-5 text-[13px] hover:bg-white/[0.1] transition"
              >
                Abrir Dashboard Demo <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 text-[12px] mono text-zinc-500">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => <div key={i} className="h-6 w-6 rounded-full border border-[#0A0A0B] bg-violet-900 flex items-center justify-center text-[10px] text-violet-200 font-bold">{String.fromCharCode(64+i)}</div>)}
              </div>
              <span>Usado por criadores que usam <b className="text-zinc-200">Cursor, Antigravity, Windsurf & Copilot</b></span>
            </div>
          </div>

          {/* HERO RIGHT: TERMINAL SIMULATOR */}
          <div className="relative lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#111113] glow">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#EF4444]" />
                  <div className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                  <div className="h-3 w-3 rounded-full bg-[#10B981]" />
                  <span className="ml-2 mono text-[12px] text-zinc-400">urion-safeguard-cli v1.0.0</span>
                </div>
                <div className="mono text-[11px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">AST PROTECTED</div>
              </div>

              <div className="p-4 mono text-[12px] leading-[1.8]">
                <div className="text-zinc-500">// Simule a interceptação de código gerado por IA:</div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[#8B5CF6] font-bold">$</span>
                  <span className="text-white">npx urion doctor --inspect</span>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-2 text-emerald-400">
                    <span>✓</span> <span>00-context/prd.md — 12 histórias validadas</span>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-400">
                    <span>✓</span> <span>Dogma Zero — IA auditada sem alucinações de teste</span>
                  </div>
                  <div className="flex items-start gap-2 text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-800/40">
                    <span>✗</span> 
                    <div>
                      <div className="font-bold">VIOLAÇÃO DE ARQUITETURA FSD DETECTADA</div>
                      <div className="text-zinc-400 text-[11px]">features/auth importou diretamente features/payment</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-amber-400 font-bold">SCORE DE SAÚDE: 92/100</span>
                  <button 
                    onClick={() => { setAutoFixed(true); setToast('Auto-fix executado: FSD refatorado!'); }}
                    className="bg-[#8B5CF6] text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-[#7C3AED] transition"
                  >
                    {autoFixed ? 'Fixed ✓' : 'Auto-fix All'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO DO FUNDADOR */}
      <section id="manifesto" className="border-y border-white/[0.06] bg-gradient-to-b from-[#0A0A0B] via-[#0F0F12] to-[#0A0A0B] py-16">
        <div className="mx-auto max-w-[960px] px-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 mono text-xs mb-6">
            📜 MANIFESTO DO FUNDADOR — JOÃO SCHAUN
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 space-font">
            "Vibe Coding sem governança não é futuro. É pesadelo programado."
          </h2>
          <p className="text-zinc-300 text-lg leading-relaxed space-y-4 font-normal text-left bg-zinc-900/60 p-8 rounded-2xl border border-white/10 shadow-2xl">
            <span>
              Construir produtos com assistentes de IA como Cursor ou Gemini é incrível nos primeiros 3 dias. Mas no 30º dia, o castelo de cartas cai: segredos expostos, componentes misturados com banco de dados e testes falsos criados pela própria IA.
            </span>
            <br /><br />
            <span>
              O **Urion Safeguard** nasce para devolver a soberania técnica para o desenvolvedor e o solopreneur. Não estamos aqui para impedir a IA de programar, mas para garantir que **ela siga dogmas inquebráveis de Clean Architecture e honestidade.**
            </span>
          </p>
        </div>
      </section>

      {/* COMPARATIVO BRUTAL */}
      <section className="mx-auto max-w-[1280px] px-5 lg:px-8 py-16 lg:py-20">
        <h2 className="text-[28px] lg:text-[40px] font-bold tracking-tight leading-[0.95] mb-8 space-font">
          Template genérico vs<br/><span className="text-[#8B5CF6]">URION SAFEGUARD</span> — comparação brutal
        </h2>
        <div className="overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#111113]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="mono text-[11px] text-zinc-500 border-b border-white/10">
                <tr>
                  <th className="p-4 font-medium">Recurso</th>
                  <th className="p-4 font-medium">Outros Templates / Vibe Coding Solto</th>
                  <th className="p-4 font-medium text-white">URION SAFEGUARD</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {[
                  ['Proteção contra Alucinações de IA','✗ Aceita respostas sem provas','✓ Dogma Zero com enforcement estrito'],
                  ['Arquitetura de Projeto','✗ Código misturado e sem padrão','✓ Feature-Sliced Design (FSD) isolado'],
                  ['Auditoria Estática em 1 segundo','✗ Não possui auditoria','✓ Doctor CLI + AST Scanner contínuo'],
                  ['Especificações como Código','✗ Markdown esquecido','✓ Spec-Driven Development (SDD) vinculado'],
                  ['Proteção contra Prompt Injection','✗ Vulnerável a injeção em docs','✓ Sanitização passiva contra injeções'],
                  ['Modelo de Licença','✗ SaaS pago com mensalidade','✓ 100% Open Source (MIT) para sempre'],
                ].map((row,i)=>(
                  <tr key={i} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                    <td className="p-4 text-zinc-300 font-medium">{row[0]}</td>
                    <td className="p-4 text-zinc-500">{row[1]}</td>
                    <td className="p-4 text-white font-medium flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CLI SHOWCASE */}
      <section id="cli" className="mx-auto max-w-[1280px] px-5 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <h2 className="text-[26px] lg:text-[36px] font-bold tracking-tight space-font">CLI Showcase — Saída Real do Terminal</h2>
          <div className="flex gap-1 rounded-full bg-white/[0.06] p-1 border border-white/10 w-fit">
            {(['doctor','generate','spec:lint','dev:web'] as const).map(tab=>(
              <button 
                key={tab} 
                onClick={()=>setActiveCliTab(tab)} 
                className={`mono text-[12px] px-3 py-1.5 rounded-full transition ${activeCliTab===tab?'bg-[#8B5CF6] text-white':'text-zinc-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#0A0A0A]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <Cpu className="h-4 w-4 text-[#8B5CF6]" />
            <span className="mono text-[12px] text-zinc-400">$ urion cli v1.0.0</span>
          </div>
          <pre className="p-5 mono text-[12px] leading-5 text-zinc-300 overflow-x-auto whitespace-pre-wrap min-h-[200px]">{cliOutputs[activeCliTab]}</pre>
        </div>
      </section>

      {/* MODELO OPEN SOURCE & COMUNIDADE (SUBSTITUINDO OS PLANOS COMERCIAIS FECHADOS) */}
      <section id="comunidade" className="border-t border-white/[0.06] bg-[#0F0F10] py-20">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <h2 className="text-[28px] lg:text-[42px] font-bold tracking-tight leading-[0.95] text-center space-font">
            100% Open Source. Feito por Solopreneurs para Solopreneurs.
          </h2>
          <p className="mt-4 text-center text-zinc-400 max-w-2xl mx-auto text-sm">
            Sem mensalidades escondidas nem lock-in. Escolha como quer fazer parte do movimento de governança em IA:
          </p>

          <div className="mt-12 grid lg:grid-cols-3 gap-6 max-w-[1060px] mx-auto">
            {/* OPC 1: COMMUNITY */}
            <div className="rounded-[20px] border border-white/10 p-6 bg-[#111113] flex flex-col justify-between">
              <div>
                <div className="mono text-[11px] tracking-widest text-emerald-400 font-bold">100% GRÁTIS</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[32px] font-bold">R$ 0</span>
                  <span className="mono text-[12px] text-zinc-500">/ para sempre (MIT)</span>
                </div>
                <div className="mt-6 space-y-2.5 mono text-[12px] text-zinc-300">
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Template FSD completo</span></div>
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Doctor CLI estático em 1s</span></div>
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Regras Dogma Zero (AGENTS.md)</span></div>
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Dashboard Web React embutido</span></div>
                </div>
              </div>
              <button 
                onClick={() => copyCmd('npx create-vibe-safeguard meu-app')} 
                className="mt-8 h-10 rounded-full mono text-[13px] font-medium bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white transition"
              >
                Clonar via NPX
              </button>
            </div>

            {/* OPC 2: SPONSOR */}
            <div className="relative rounded-[20px] border border-[#8B5CF6]/50 bg-[#8B5CF6]/[0.06] p-6 glow flex flex-col justify-between">
              <div className="absolute -top-3 left-6 mono text-[10px] tracking-widest rounded-full bg-[#8B5CF6] px-2.5 py-1 text-white font-bold">RECOMENDADO</div>
              <div>
                <div className="mono text-[11px] tracking-widest text-[#C4B5FD] font-bold">COMUNIDADE & SPONSOR</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[32px] font-bold">Apoiar</span>
                  <span className="mono text-[12px] text-zinc-400">no GitHub</span>
                </div>
                <div className="mt-6 space-y-2.5 mono text-[12px] text-zinc-200">
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Tudo do plano Community</span></div>
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Acesso ao Discord VIP de Vibe Coders</span></div>
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Prioridade na escolha de novas features</span></div>
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Badge de Apoiador no Repositório</span></div>
                </div>
              </div>
              <a 
                href="https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard" 
                target="_blank" 
                rel="noreferrer"
                className="mt-8 h-10 rounded-full mono text-[13px] font-medium bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <svg className="w-4 h-4 fill-current inline-block" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> Dar Star & Apoiar no GitHub
              </a>
            </div>

            {/* OPC 3: ENTERPRISE */}
            <div className="rounded-[20px] border border-white/10 p-6 bg-[#111113] flex flex-col justify-between">
              <div>
                <div className="mono text-[11px] tracking-widest text-zinc-400 font-bold">CONSULTORIA 1:1</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[32px] font-bold">Sob Demanda</span>
                </div>
                <div className="mt-6 space-y-2.5 mono text-[12px] text-zinc-300">
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Implementação em projetos legados</span></div>
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Treinamento de Prompting Seguro (HIPAA/GDPR)</span></div>
                  <div className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" /><span>Setup de CI/CD Customizado para Empresas</span></div>
                </div>
              </div>
              <a 
                href="mailto:joaoschaun@gmail.com" 
                className="mt-8 h-10 rounded-full mono text-[13px] font-medium bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white transition flex items-center justify-center"
              >
                Falar com João Schaun
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="relative border-t border-white/[0.06] bg-[#0A0A0B] overflow-hidden">
        <div className="relative mx-auto max-w-[1280px] px-5 lg:px-8 py-16 text-center">
          <h2 className="text-[32px] lg:text-[54px] font-bold tracking-tight leading-[0.9] space-font">
            Clone. Crie com IA.<br/>
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">Proteja seu projeto.</span>
          </h2>
          <p className="mt-4 mx-auto max-w-[520px] text-[14px] text-zinc-400">
            Sua visão merece um código limpo. O Urion Safeguard garante que você nunca precise jogar tudo fora.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <div className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] pl-4 pr-2 py-2 glow">
              <span className="mono text-[13px]">$ npx create-vibe-safeguard meu-app</span>
              <button 
                onClick={() => copyCmd('npx create-vibe-safeguard meu-app')} 
                className="ml-2 h-7 w-7 grid place-items-center rounded-[8px] bg-white text-black"
              >
                {copied === 'npx create-vibe-safeguard meu-app' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-[12px] mono text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-300">URION.OS</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" /> Vibe Coding Safeguard • urion.ia.br
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
              <span>© 2026 João Schaun • Urion Dev</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
