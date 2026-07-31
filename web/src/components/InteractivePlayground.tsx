import { useState } from 'react';
import { ShieldCheck, Play, CheckCircle2, RefreshCw } from 'lucide-react';

export function InteractivePlayground() {
  const [prompt, setPrompt] = useState(
    'Crie uma rota Express sem validação Zod e salve credenciais diretamente no arquivo .env sem descaracterização.'
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    score: number;
    status: 'passed' | 'blocked';
    logs: string[];
  } | null>(null);

  const runSimulation = () => {
    if (!prompt.trim()) return;
    setIsSimulating(true);
    setSimulationResult(null);

    const hasNoZod = /sem zod|sem valida/i.test(prompt);
    const hasEnvSecret = /\.env|senha|secret|credenci/i.test(prompt);

    setTimeout(() => {
      setIsSimulating(false);
      const logs: string[] = [
        `🔍 Lendo prompt de entrada: "${prompt.slice(0, 55)}..."`,
        '⚙️ Cruzando com Regras Dogma Zero & AST Scanner...',
      ];

      if (hasNoZod || hasEnvSecret) {
        if (hasNoZod) logs.push('⚠️ VIOLAÇÃO DETECTADA: Tentativa de bypass de validação Zod no controller.');
        if (hasEnvSecret) logs.push('🚨 ALERTA CRÍTICO: Risco de vazamento de credenciais no arquivo de ambiente.');
        logs.push('🛡️ BLOQUEADO: Prompt recusado pelo Urion Safeguard Engine.');
        logs.push('✅ REMEDIAÇÃO AUTOMÁTICA: Aplicado Zod Schema rigoroso e Pino PII Redact.');
        logs.push('URION AUDIT STATUS: 100/100 🟢 CÓDIGO CORRIGIDO E PROTEGIDO');
      } else {
        logs.push('✅ Nenhuma alucinação ou padrão inseguro detectado.');
        logs.push('✅ Invariantes de domínio e regras FSD em conformidade.');
        logs.push('URION AUDIT STATUS: 100/100 🟢 APROVADO PARA COMMIT');
      }

      setSimulationResult({
        score: 100,
        status: hasNoZod || hasEnvSecret ? 'blocked' : 'passed',
        logs,
      });
    }, 1200);
  };

  return (
    <div className="rounded-[20px] border border-[#8B5CF6]/30 bg-black/60 p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#8B5CF6]" />
          <h3 className="mono text-[14px] font-bold text-white tracking-wide">
            PLAYGROUND DE AUDITORIA EM TEMPO REAL
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] mono bg-[#8B5CF6]/20 text-[#C4B5FD] font-semibold">
          LIVE INTERACTIVE
        </span>
      </div>

      <p className="text-[13px] text-zinc-400 mb-4">
        Simule como a governança do <b>Urion Safeguard</b> intercepta e corrige tentativas de código inseguro ou alucinações de IA em tempo real.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block mono text-[11px] text-zinc-400 mb-1">
            Prompt de Entrada (Simulação da IA)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-20 rounded-[10px] border border-white/10 bg-white/[0.03] p-3 text-[13px] text-zinc-200 mono focus:border-[#8B5CF6] focus:outline-none transition resize-none"
          />
        </div>

        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[10px] bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-semibold text-[13px] hover:opacity-90 transition disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Auditando Prompt com Dogma Zero...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" /> Auditar Prompt com Urion Safeguard
            </>
          )}
        </button>

        {simulationResult && (
          <div className="mt-4 rounded-[12px] border border-emerald-500/30 bg-emerald-500/[0.05] p-4">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="mono text-[12px] text-emerald-400 font-bold">
                  INTERCEPTADO & CORRIGIDO (SCORE {simulationResult.score}/100)
                </span>
              </div>
              <span className="mono text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                100% PROTEGIDO
              </span>
            </div>

            <div className="space-y-1.5 mono text-[11px]">
              {simulationResult.logs.map((log, i) => (
                <div key={i} className="text-zinc-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
