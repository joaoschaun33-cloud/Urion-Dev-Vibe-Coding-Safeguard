import React, { useState } from 'react';
import { Check, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';

/**
 * 🛡️ Logo Oficial da Urion (Escudo Hexagonal Neon com 'U' Estilizado)
 */
export const UrionLogoMark: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="urion-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="50%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="urion-u-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E0E7FF" />
      </linearGradient>
    </defs>
    {/* Outer Shield Hexagon */}
    <path
      d="M16 2L28 7V16C28 23.5 22.8 28.5 16 30C9.2 28.5 4 23.5 4 16V7L16 2Z"
      fill="url(#urion-shield-grad)"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="1.5"
    />
    {/* Inner Stylized U */}
    <path
      d="M11 10V17C11 19.8 13.2 22 16 22C18.8 22 21 19.8 21 17V10H18.5V17C18.5 18.4 17.4 19.5 16 19.5C14.6 19.5 13.5 18.4 13.5 17V10H11Z"
      fill="url(#urion-u-grad)"
    />
  </svg>
);

export interface UrionBadgeProps {
  score?: number;
  projectName?: string;
  lastAuditDate?: string;
  variant?: 'shield' | 'score' | 'glass' | 'minimal';
}

export const UrionBadge: React.FC<UrionBadgeProps> = ({
  score = 100,
  projectName = 'Vibe Project',
  lastAuditDate = new Date().toLocaleDateString('pt-BR'),
  variant = 'shield',
}) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(variant);

  const getEmbedCode = (v: string) => {
    const baseUrl = 'https://urion.ia.br';
    return `<a href="${baseUrl}/verify/${encodeURIComponent(
      projectName
    )}" target="_blank" rel="noopener noreferrer">
  <img src="${baseUrl}/api/badge/${v}?project=${encodeURIComponent(
      projectName
    )}" alt="Protected by Urion Safeguard" />
</a>`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmbedCode(selectedVariant));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto p-6 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl">
      {/* Header do Widget */}
      <div className="flex items-center justify-between w-full pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
            <UrionLogoMark size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Selo de Confiança Urion Verified
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                FAANG-GRADE
              </span>
            </h3>
            <p className="text-sm text-slate-400">
              Badge pública e auditável para embutir em seus projetos No-Code / Vibe Coding.
            </p>
          </div>
        </div>
      </div>

      {/* Seletor de Variações */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {(['shield', 'score', 'glass', 'minimal'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setSelectedVariant(v)}
            className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col items-center gap-2 ${
              selectedVariant === v
                ? 'bg-violet-600/20 border-violet-500 text-white shadow-lg shadow-violet-500/10'
                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <span className="capitalize">{v} Badge</span>
          </button>
        ))}
      </div>

      {/* Preview Ao Vivo da Badge Selecionada */}
      <div className="w-full p-8 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center gap-4 min-h-[140px] relative overflow-hidden">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
          Preview da Badge no seu Site:
        </div>

        {/* Renderização das Variações com Logo Urion */}
        {selectedVariant === 'shield' && (
          <div
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer group flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-violet-900/40 via-indigo-900/40 to-slate-900/60 hover:from-violet-900/60 hover:to-indigo-900/60 border border-violet-500/40 hover:border-violet-400 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <UrionLogoMark size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-white">Protected by Urion Safeguard</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-violet-500 text-white rounded-md">
              100%
            </span>
          </div>
        )}

        {selectedVariant === 'score' && (
          <div
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer group flex items-center gap-3 px-4 py-2 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 rounded-xl shadow-lg transition-all duration-300"
          >
            <UrionLogoMark size={22} />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">URION VERIFIED SCORE</span>
              <span className="text-sm font-extrabold text-emerald-400">{score}/100 SAFEGUARD</span>
            </div>
          </div>
        )}

        {selectedVariant === 'glass' && (
          <div
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer group flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/15 hover:border-white/30 rounded-2xl shadow-xl transition-all duration-300"
          >
            <UrionLogoMark size={18} />
            <span className="text-xs font-semibold text-slate-200">Urion Verified Project</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {selectedVariant === 'minimal' && (
          <div
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg text-xs font-mono text-slate-300 transition-colors"
          >
            <UrionLogoMark size={16} />
            <span>urion-safe: {score}%</span>
          </div>
        )}

        <span className="text-[11px] text-slate-500">
          (Clique na badge para simular a visão do seu cliente)
        </span>
      </div>

      {/* Caixa de Código Embed */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Código HTML / Embed para copiar:</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar Embed'}
          </button>
        </div>
        <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-violet-300 overflow-x-auto">
          {getEmbedCode(selectedVariant)}
        </pre>
      </div>

      {/* Modal Auditável Simulado ao Clicar na Badge */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                  <UrionLogoMark size={28} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Relatório Público de Auditoria</h4>
                  <p className="text-xs text-slate-400">Projeto: {projectName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                <CheckCircle2 className="w-5 h-5" />
                {score}/100 SAFEGUARD VERIFIED
              </div>
              <span className="text-xs text-slate-400">Auditado em: {lastAuditDate}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-800/40 rounded-lg border border-slate-800">
                <span className="text-slate-400">AST Code Quality Audit</span>
                <span className="text-emerald-400 font-semibold">100% (Zero leaks / log)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-800/40 rounded-lg border border-slate-800">
                <span className="text-slate-400">Dogma Zero Test Evaluator</span>
                <span className="text-emerald-400 font-semibold">100% Real Tests</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-800/40 rounded-lg border border-slate-800">
                <span className="text-slate-400">No-Code / Declarative Scans</span>
                <span className="text-emerald-400 font-semibold">n8n, Make & OpenAPI OK</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-800">
              Certificado pela infraestrutura de resiliência Urion Trust & Safety.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
