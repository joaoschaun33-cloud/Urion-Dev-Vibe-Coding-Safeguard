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
  Activity
} from 'lucide-react';

interface LandingPageProps {
  onOpenDashboard: () => void;
}

export function LandingPage({ onOpenDashboard }: LandingPageProps) {
  const [copied, setCopied] = useState(false);
  const command = 'npx create-vibe-safeguard meu-novo-app';

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-[60%] -left-[10%] w-[500px] h-[400px] bg-emerald-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="border-b border-gray-800/60 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Vibe Safeguard</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/joaoschaun33-cloud/dev-vibe-coding-template"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg border border-gray-800 hover:border-gray-700"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> GitHub ⭐
            </a>
            <button
              onClick={onOpenDashboard}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-violet-600/25"
            >
              <Activity className="w-4 h-4" /> Abrir Dashboard Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
          <Zap className="w-3.5 h-3.5 text-violet-400" /> Vibe Coding com Arquitetura Blindada v1.0
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Construa produtos com IA <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-300 to-emerald-400">
            sem transformar seu sonho num caos.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          O primeiro framework Open Source que impõe <strong className="text-gray-200 font-semibold">Dogma Zero (Honestidade da IA)</strong>, 
          <strong className="text-gray-200 font-semibold"> Spec-Driven Development</strong> e auditoria em tempo real para impedir alucinações e o colapso do projeto.
        </p>

        {/* Copy-Paste CLI Banner */}
        <div className="max-w-xl mx-auto pt-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-3 pl-3 text-xs font-mono text-gray-300 overflow-x-auto">
              <span className="text-violet-400 select-none">$</span>
              <span>{command}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onOpenDashboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-violet-600/25"
          >
            Explorar Dashboard de Saúde <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="https://github.com/joaoschaun33-cloud/dev-vibe-coding-template"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900/80 hover:bg-gray-800 text-gray-300 font-semibold px-6 py-3.5 rounded-xl text-sm border border-gray-800 transition-all"
          >
            Ver no GitHub
          </a>
        </div>
      </section>

      {/* Comparison Grid: Chaos vs Safeguard */}
      <section className="py-16 px-6 max-w-6xl mx-auto border-t border-gray-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">O Fim da Frustração no Vibe Coding</h2>
          <p className="text-sm text-gray-400 mt-2">Por que 80% dos projetos iniciados apenas com prompts acabam abandonados?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <div className="bg-[#111827]/40 border border-red-500/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" /> Vibe Coding Caótico (Sem Guardrails)
            </div>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span> A IA alucina APIs que não existem e inventa dados.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span> Mistura banco de dados, regras de negócio e rotas num código espaguete.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span> Nenhuma cobertura de testes — qualquer mudança quebra o sistema inteiro.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span> O criador perde o controle e abandona o sonho por desespero.
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
            <div className="flex items-center gap-3 text-emerald-400 font-bold text-base">
              <ShieldCheck className="w-5 h-5" /> Vibe Safeguard Architecture
            </div>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span> <strong>Dogma Zero</strong>: A IA é 100% honesta e admite quando não tem certeza.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span> <strong>Feature-Sliced Design (FSD)</strong>: Código 100% isolado e modular.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span> <strong>Spec-Driven Development</strong>: O Markdown manda, o código cumpre.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span> <strong>Auditoria em 1s</strong>: Sanidade e score visual de saúde (0-100) contínuos.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bento Grid Showcase */}
      <section className="py-16 px-6 max-w-6xl mx-auto border-t border-gray-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">4 Pilares Inquebráveis</h2>
          <p className="text-sm text-gray-400 mt-2">Engenharia pesada por baixo do capô, simplicidade total para você.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="md:col-span-2 bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dogma Zero — Honestidade Absoluta</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Regras heurísticas estritas (`AGENTS.md` e `.cursor/rules/honesty.mdc`) que impedem qualquer assistente de IA de alucinar bibliotecas, mentir sobre testes ou esconder erros técnicos.
              </p>
            </div>
            <div className="bg-gray-900/80 rounded-xl p-3 text-[11px] font-mono text-gray-400 border border-gray-800">
              <span className="text-emerald-400">AI &gt;</span> Nivel de certeza: ALTA — Testes 35/35 validados antes da proposta.
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Spec-Scanner ao Vivo</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                O backend lê seus documentos em `00-context/` e calcula o progresso de critérios de aceite `- [x]` em tempo real.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Multi-IDE Sincronizado</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Compatível com Cursor, Claude Code (`CLAUDE.md`), Windsurf (`.windsurfrules`) e GitHub Copilot.
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="md:col-span-2 bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TerminalIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Diagnósticos em 1 Segundo</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Comandos de sanidade rápida (`npm run doctor:cli` e `npm run cursor-doctor`) para você saber a saúde exata do seu software sem precisar entender de código.
              </p>
            </div>
            <div className="bg-gray-900/80 rounded-xl p-3 text-[11px] font-mono text-emerald-400 border border-gray-800">
              ✓ Health Score: [████████████████████] 100/100 (0 erros)
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-12 px-6 text-center text-xs text-gray-500 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-gray-300">Vibe Coding Safeguard & Product Owner Template</span>
        </div>
        <p>Desenvolvido para salvar projetos digitais de criadores e desenvolvedores no mundo inteiro.</p>
        <p>© 2026 Open Source sob Licença MIT.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
