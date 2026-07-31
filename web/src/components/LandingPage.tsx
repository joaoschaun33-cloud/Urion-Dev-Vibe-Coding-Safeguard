import { useState } from 'react';
import { 
  ShieldCheck, 
  Terminal as TerminalIcon, 
  AlertTriangle, 
  Zap, 
  Layers, 
  Copy, 
  Check, 
  ArrowRight, 
  FileCode2, 
  Activity,
  Play,
  Calculator,
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onOpenDashboard: () => void;
}

export function LandingPage({ onOpenDashboard }: LandingPageProps) {
  const [copied, setCopied] = useState(false);
  const [simulatedPrompt, setSimulatedPrompt] = useState('create_user_route');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Calculadora State
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [teamSize, setTeamSize] = useState(2);

  const command = 'npx create-vibe-safeguard meu-novo-app';

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSimulation = (type: string) => {
    setSimulatedPrompt(type);
    setIsSimulating(true);
    setSimulationResult(null);

    setTimeout(() => {
      setIsSimulating(false);
      if (type === 'vulnerable') {
        setSimulationResult('❌ BLOQUEADO PELO SAFEGUARD: Tentativa de injeção de credencial estática e rota sem tratamento RFC 7807 detectada!');
      } else if (type === 'prompt_injection') {
        setSimulationResult('🛡️ INTERCEPTADO PELO DOGMA ZERO: Instrução oculta em Markdown ignorada! Conteúdo tratado como texto passivo.');
      } else {
        setSimulationResult('✅ APROVADO: Código FSD com Zod DTO e testes unitários 100% em conformidade com o AGENTS.md!');
      }
    }, 1200);
  };

  // Cálculo de Horas Salvas de Débito Técnico por ano
  const hoursSavedPerYear = Math.round(hoursPerWeek * 52 * 0.4 * teamSize);
  const moneySavedPerYear = Math.round(hoursSavedPerYear * 150);

  return (
    <div className="min-h-screen bg-[#06080F] text-gray-100 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* Dynamic Glow Overlays */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/10 blur-[160px] rounded-full" />
        <div className="absolute top-[40%] -left-[15%] w-[600px] h-[500px] bg-emerald-600/10 blur-[160px] rounded-full" />
        <div className="absolute top-[70%] -right-[15%] w-[600px] h-[500px] bg-purple-600/10 blur-[160px] rounded-full" />
      </div>

      {/* Top Banner / Announcement */}
      <div className="bg-gradient-to-r from-violet-900/40 via-purple-900/40 to-violet-900/40 border-b border-violet-500/20 py-2 text-center text-xs text-violet-300 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <strong>Urion Vibe Safeguard v1.0</strong> — A primeira plataforma open source de governança de IA do Brasil.
        </span>
      </div>

      {/* Header */}
      <header className="border-b border-gray-800/60 bg-[#06080F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 p-0.5 shadow-lg shadow-violet-600/20">
              <div className="w-full h-full bg-[#06080F] rounded-[10px] flex items-center justify-center text-violet-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">URION <span className="text-violet-400 font-normal">SAFEGUARD</span></span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors py-2 px-3.5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> GitHub ⭐
            </a>
            <button
              onClick={onOpenDashboard}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-violet-600/25"
            >
              <Activity className="w-4 h-4" /> Painel de Controle Demo
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20 backdrop-blur-md">
          <Lock className="w-3.5 h-3.5 text-emerald-400" /> Governança de IA de Nível Corporativo
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-[1.08]">
          Projeta seus projetos com IA <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-300 to-emerald-400">
            antes que o código colapse.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-normal">
          O <strong>Urion Safeguard</strong> é o escudo definitivo para desenvolvedores e solopreneurs. 
          Imponha <strong className="text-white">Dogma Zero</strong>, <strong className="text-white">Spec-Driven Development</strong> e auditoria AST contínua contra alucinações de IA.
        </p>

        {/* Copy CLI Box */}
        <div className="max-w-xl mx-auto pt-2">
          <div className="bg-gray-900/90 border border-violet-500/30 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 pl-3 text-xs font-mono text-gray-200 overflow-x-auto">
              <span className="text-violet-400 font-bold select-none">$</span>
              <span>{command}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Comando'}
            </button>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onOpenDashboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all shadow-2xl shadow-violet-600/30"
          >
            Testar Painel de Auditoria <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900/80 hover:bg-gray-800 text-gray-300 font-semibold px-8 py-4 rounded-xl text-sm border border-gray-800 transition-all"
          >
            Ver Documentação no GitHub
          </a>
        </div>
      </section>

      {/* MANIFESTO DO FUNDADOR & AUTORIDADE */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-b from-gray-900/90 to-[#0A0E1A] border border-violet-500/20 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 blur-[120px] rounded-full" />
          
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest">
              <Zap className="w-4 h-4 text-violet-400" /> Manifesto do Fundador
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              "85% dos projetos feitos apenas com prompts de IA são abandonados em 3 semanas por caos de arquitetura."
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              O Vibe Coding trouxe uma velocidade sem precedentes, mas criou uma epidemia silenciosa: <strong>código espaguete, alucinações de API, vazamento de secrets e falta absoluta de testes</strong>.
            </p>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              O <strong>Urion Safeguard</strong> foi desenvolvido para ser o antídoto definitivo. Nós não impedimos a IA de codificar — nós colocamos **trilhos de engenharia de elite** para que a IA nunca consiga destruir o seu projeto.
            </p>

            <div className="pt-4 border-t border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300">
                JS
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">João Schaun</h4>
                <p className="text-xs text-gray-400">Criador do Urion Safeguard & Product Owner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULADOR INTERATIVO DO SAFEGUARD */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-gray-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Simulador do Safeguard em Tempo Real</h2>
          <p className="text-sm text-gray-400">Veja como a nossa engine de AST e Dogma Zero interceptam código vulnerável antes de chegar ao repositório.</p>
        </div>

        <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-2xl backdrop-blur-xl">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Escolha um Cenário de Teste:</h3>
            
            <button
              onClick={() => handleRunSimulation('vulnerable')}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                simulatedPrompt === 'vulnerable' ? 'bg-red-500/10 border-red-500/40 text-white' : 'bg-gray-800/40 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-red-400">
                <AlertTriangle className="w-4 h-4" /> 1. Injeção de Secret & Sem RFC 7807
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Simula IA tentando colocar API Key hardcoded em controller.</p>
            </button>

            <button
              onClick={() => handleRunSimulation('prompt_injection')}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                simulatedPrompt === 'prompt_injection' ? 'bg-amber-500/10 border-amber-500/40 text-white' : 'bg-gray-800/40 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                <Lock className="w-4 h-4" /> 2. Injeção Oculta em Markdown (.md)
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Simula prompt malicioso tentando exfiltrar o arquivo .env.</p>
            </button>

            <button
              onClick={() => handleRunSimulation('valid')}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                simulatedPrompt === 'valid' ? 'bg-emerald-500/10 border-emerald-500/40 text-white' : 'bg-gray-800/40 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 3. Código FSD Limpo com Zod & Testes
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Código em 100% conformidade com a arquitetura Urion.</p>
            </button>
          </div>

          {/* Terminal Display */}
          <div className="lg:col-span-8 bg-[#04060A] border border-gray-800 rounded-2xl p-5 font-mono text-xs flex flex-col justify-between min-h-[280px]">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 mb-4 text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] text-gray-400 ml-2">guardian-ast-engine.ts</span>
              </div>
              <span className="text-[10px] text-violet-400 font-semibold">SAFEGUARD ACTIVE</span>
            </div>

            <div className="space-y-3 flex-1">
              <div className="text-gray-400">
                <span className="text-violet-400 font-bold">$</span> urion-safeguard audit --target=src/
              </div>

              {isSimulating ? (
                <div className="text-violet-300 animate-pulse flex items-center gap-2 py-4">
                  <Play className="w-4 h-4 animate-spin" /> Analisando AST, verificando segredos e validando rotas...
                </div>
              ) : (
                <div className="py-2 space-y-2">
                  <p className="text-gray-300">🔍 Escaneando diretórios de código e especificações .md...</p>
                  {simulationResult && (
                    <div className={`p-3.5 rounded-xl border text-xs font-sans leading-relaxed ${
                      simulationResult.includes('BLOQUEADO') ? 'bg-red-950/40 border-red-500/40 text-red-300' :
                      simulationResult.includes('INTERCEPTADO') ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' :
                      'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    }`}>
                      {simulationResult}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-800/60 text-[10px] text-gray-400 flex items-center justify-between">
              <span>Status AST: Integrity Validated</span>
              <span>Dogma Zero: Enforced</span>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULADORA DE ECONOMIA E ROI */}
      <section className="py-20 px-6 max-w-5xl mx-auto border-t border-gray-800/60">
        <div className="bg-gradient-to-br from-violet-950/30 via-gray-900 to-gray-900 border border-violet-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="flex items-center gap-3 text-violet-400 font-bold text-xs uppercase tracking-wider">
            <Calculator className="w-5 h-5 text-violet-400" /> Calculadora de Economia de Tempo & Risco
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Quanto você perde corrigindo erros da IA?</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Sem salvaguarda, desenvolvedores passam em média 40% do tempo refatorando código espaguete e bugs introduzidos por prompts.
              </p>

              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span>Horas de IA por semana (por dev):</span>
                    <span className="text-violet-400 font-bold">{hoursPerWeek}h / semana</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full accent-violet-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span>Tamanho da Equipe / Devs:</span>
                    <span className="text-violet-400 font-bold">{teamSize} pessoa(s)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full accent-violet-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="bg-gray-950/80 border border-violet-500/30 rounded-2xl p-6 text-center space-y-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Horas de Retrabalho Salvas / Ano</p>
                <p className="text-5xl font-extrabold text-emerald-400 mt-2">{hoursSavedPerYear}h</p>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Economia Estimada de Débito Técnico</p>
                <p className="text-3xl font-extrabold text-white mt-1">R$ {moneySavedPerYear.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE DOS 4 PILARES */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-gray-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">4 Pilares de Engenharia Inquebráveis</h2>
          <p className="text-sm text-gray-400">Desenvolvido sob rigor técnico para garantir escalabilidade ilimitada.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#0B0F19] border border-gray-800 rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-violet-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Dogma Zero — Honestidade Absoluta da IA</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                Conjunto de heurísticas (`AGENTS.md` e `.cursor/rules/honesty.mdc`) que obriga qualquer assistente de IA a admitir incertezas, declarar o nível de certeza antes de propor código e nunca omitir riscos técnicos.
              </p>
            </div>
          </div>

          <div className="bg-[#0B0F19] border border-gray-800 rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Spec-Scanner em Tempo Real</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Varredura contínua dos arquivos `.md` em `00-context/` e `01-product/`, calculando a taxa de conclusão de requisitos em tempo real.
              </p>
            </div>
          </div>

          <div className="bg-[#0B0F19] border border-gray-800 rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Sincronização Multi-IDE</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Compatibilidade nativa via `npm run sync:rules` para Cursor, Claude Code (`CLAUDE.md`), Windsurf (`.windsurfrules`) e GitHub Copilot.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 bg-[#0B0F19] border border-gray-800 rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TerminalIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Doctor AST & Varredura de Secrets</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                Engine de auditoria estática em 1 segundo que bloqueia `console.log()` residuais, detecta vazamento de tokens e exige 100% de cobertura de testes por controller.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800/60 py-12 px-6 text-center text-xs text-gray-500 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-violet-400" />
          <span className="font-extrabold text-sm text-white">URION SAFEGUARD</span>
        </div>
        <p className="max-w-md mx-auto">Desenvolvido para proteger a nova geração de criadores e engenheiros de software no Brasil e no mundo.</p>
        <p>© 2026 Open Source sob Licença MIT — Urion Safeguard.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
