import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Plus, 
  Layers,
  FileCode2,
  FileText,
  Activity
} from 'lucide-react';

interface HealthMetrics {
  testsPassing: number;
  totalTests: number;
  mdcRulesActive: number;
  architectureViolations: number;
}

interface ProjectHealth {
  id: string;
  projectName: string;
  score: number;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  metrics: HealthMetrics;
  createdAt: string;
}

interface SpecDocument {
  id: string;
  title: string;
  filePath: string;
  status: 'DRAFT' | 'APPROVED' | 'OUTDATED';
  acceptanceCriteriaCount: number;
  isValidated: boolean;
  createdAt: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<'health' | 'specs'>('health');
  
  // Health State
  const [reports, setReports] = useState<ProjectHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Specs State
  const [specs, setSpecs] = useState<SpecDocument[]>([]);

  // Modal Health State
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('Meu Projeto Vibe');
  const [testsPassing, setTestsPassing] = useState(34);
  const [totalTests, setTotalTests] = useState(34);
  const [mdcRulesActive, setMdcRulesActive] = useState(9);
  const [architectureViolations, setArchitectureViolations] = useState(0);

  // Modal Spec State
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [specTitle, setSpecTitle] = useState('PRD do Sistema');
  const [specFilePath, setSpecFilePath] = useState('00-context/prd.md');
  const [acceptanceCriteriaCount, setAcceptanceCriteriaCount] = useState(5);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/project-health');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch {
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecs = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/specs');
      if (res.ok) {
        const data = await res.json();
        setSpecs(data);
      }
    } catch (err) {
      console.error('Erro ao buscar especificações:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchSpecs();
  }, []);

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/v1/project-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          metrics: {
            testsPassing: Number(testsPassing),
            totalTests: Number(totalTests),
            mdcRulesActive: Number(mdcRulesActive),
            architectureViolations: Number(architectureViolations),
          },
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchHealth();
      }
    } catch (err) {
      console.error('Erro ao enviar auditoria:', err);
    }
  };

  const handleCreateSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/v1/specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: specTitle,
          filePath: specFilePath,
          acceptanceCriteriaCount: Number(acceptanceCriteriaCount),
        }),
      });

      if (res.ok) {
        setShowSpecModal(false);
        fetchSpecs();
      }
    } catch (err) {
      console.error('Erro ao cadastrar especificação:', err);
    }
  };

  const latestReport = reports[reports.length - 1] || {
    projectName: 'Vibe Coding Safeguard Repo',
    score: 100,
    status: 'EXCELLENT',
    metrics: { testsPassing: 34, totalTests: 34, mdcRulesActive: 9, architectureViolations: 0 },
    createdAt: new Date().toISOString()
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> {status === 'APPROVED' ? 'APROVADO' : 'EXCELENTE'}</span>;
      case 'GOOD':
      case 'DRAFT':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> {status === 'DRAFT' ? 'RASCUNHO' : 'BOM'}</span>;
      case 'WARNING':
      case 'OUTDATED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><AlertTriangle className="w-3.5 h-3.5" /> {status === 'OUTDATED' ? 'DESATUALIZADO' : 'ATENÇÃO'}</span>;
      case 'CRITICAL':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3.5 h-3.5" /> CRÍTICO</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-gray-800/60 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none tracking-tight">Vibe Safeguard</h1>
                <p className="text-xs text-gray-400 mt-0.5">Product Owner & Architecture Guard</p>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="flex items-center gap-1 bg-gray-900/60 p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => setActiveTab('health')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'health' ? 'bg-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> Saúde do Projeto
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'specs' ? 'bg-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Especificações SDD
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-gray-400">{apiOnline ? 'API Conectada' : 'API Desconectada'}</span>
            </div>

            {activeTab === 'health' ? (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-violet-600/20"
              >
                <Plus className="w-4 h-4" /> Nova Auditoria
              </button>
            ) : (
              <button
                onClick={() => setShowSpecModal(true)}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-violet-600/20"
              >
                <Plus className="w-4 h-4" /> Nova Especificação
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {activeTab === 'health' ? (
          <>
            {/* Top Hero Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Score Card */}
              <div className="lg:col-span-1 bg-[#111827] border border-gray-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pontuação de Saúde</p>
                    <h2 className="text-xl font-bold text-white mt-1">{latestReport.projectName}</h2>
                  </div>
                  {getStatusBadge(latestReport.status)}
                </div>

                <div className="my-6 flex items-baseline gap-2">
                  <span className="text-6xl font-extrabold tracking-tight text-white">{latestReport.score}</span>
                  <span className="text-gray-400 text-xl font-medium">/ 100</span>
                </div>

                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      latestReport.score >= 90 ? 'bg-emerald-500' :
                      latestReport.score >= 75 ? 'bg-blue-500' :
                      latestReport.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${latestReport.score}%` }}
                  />
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Testes Automatizados</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-white">{latestReport.metrics.testsPassing} <span className="text-sm font-normal text-gray-400">/ {latestReport.metrics.totalTests}</span></p>
                    <p className="text-xs text-emerald-400 mt-1">100% de aprovação</p>
                  </div>
                </div>

                <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Regras MDC Ativas</span>
                    <FileCode2 className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-white">{latestReport.metrics.mdcRulesActive}</p>
                    <p className="text-xs text-violet-400 mt-1">Proteções de IA operantes</p>
                  </div>
                </div>

                <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Violações de Arquitetura</span>
                    <Layers className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-white">{latestReport.metrics.architectureViolations}</p>
                    <p className="text-xs text-gray-400 mt-1">Desvio arquitetural nulo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Histórico de Auditorias de Saúde</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Relatórios registrados no backend</p>
                </div>

                <button 
                  onClick={fetchHealth} 
                  className="p-2 text-gray-400 hover:text-white rounded-lg border border-gray-800 hover:border-gray-700 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-gray-900/50 text-xs uppercase font-semibold text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3">Projeto</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Testes</th>
                      <th className="px-4 py-3">MDC Rules</th>
                      <th className="px-4 py-3">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-white">{report.projectName}</td>
                        <td className="px-4 py-3.5 font-bold text-white">{report.score}</td>
                        <td className="px-4 py-3.5">{getStatusBadge(report.status)}</td>
                        <td className="px-4 py-3.5">{report.metrics.testsPassing} / {report.metrics.totalTests}</td>
                        <td className="px-4 py-3.5">{report.metrics.mdcRulesActive}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">{new Date(report.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Tab Especificações SDD */
          <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Especificações de Produto (SDD)</h3>
                <p className="text-xs text-gray-400 mt-0.5">Documentos Markdown versionados em 00-context/ e 01-product/</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={async () => {
                    await fetch('http://localhost:3000/api/v1/specs/scan');
                    fetchSpecs();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs font-semibold hover:bg-violet-600/30 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Escanear Arquivos Markdown (.md)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specs.map((spec) => (
                <div key={spec.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-violet-500/40 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-violet-400 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-white text-sm">{spec.title}</h4>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{spec.filePath}</p>
                      </div>
                    </div>
                    {getStatusBadge(spec.status)}
                  </div>

                  <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400">
                    <span>Critérios de Aceite: <strong className="text-white">{spec.acceptanceCriteriaCount}</strong></span>
                    <span className="text-emerald-400 font-semibold">{spec.isValidated ? '✓ Validado' : 'Pendências'}</span>
                  </div>
                </div>
              ))}

              {specs.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-gray-800 rounded-xl">
                  <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="font-medium">Nenhuma especificação cadastrada na API.</p>
                  <p className="text-xs text-gray-500 mt-1">Clique em "Nova Especificação" para registrar um documento Markdown.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Nova Auditoria */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Registrar Nova Auditoria</h3>

            <form onSubmit={handleCreateAudit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Nome do Projeto</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Testes Passando</label>
                  <input
                    type="number"
                    value={testsPassing}
                    onChange={(e) => setTestsPassing(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Total de Testes</label>
                  <input
                    type="number"
                    value={totalTests}
                    onChange={(e) => setTotalTests(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Regras MDC Ativas</label>
                  <input
                    type="number"
                    value={mdcRulesActive}
                    onChange={(e) => setMdcRulesActive(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Violações Arquitetura</label>
                  <input
                    type="number"
                    value={architectureViolations}
                    onChange={(e) => setArchitectureViolations(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-lg shadow-violet-600/20 transition-all"
                >
                  Salvar Auditoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Especificação */}
      {showSpecModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Cadastrar Especificação SDD</h3>

            <form onSubmit={handleCreateSpec} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Título da Especificação</label>
                <input
                  type="text"
                  value={specTitle}
                  onChange={(e) => setSpecTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-violet-500"
                  placeholder="Ex: PRD da Autenticação"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Caminho do Arquivo (filePath)</label>
                <input
                  type="text"
                  value={specFilePath}
                  onChange={(e) => setSpecFilePath(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-violet-500"
                  placeholder="Ex: 00-context/prd.md"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Critérios de Aceite Cadastrados</label>
                <input
                  type="number"
                  value={acceptanceCriteriaCount}
                  onChange={(e) => setAcceptanceCriteriaCount(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowSpecModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-lg shadow-violet-600/20 transition-all"
                >
                  Salvar Especificação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
