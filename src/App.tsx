import { useState, useMemo } from 'react';
import { differenceInDays, parseISO, subDays } from 'date-fns';
import { useMedicos, type Medico } from './hooks/useMedicos';
import { CardMedico } from './components/CardMedico';
import { FormMedico } from './components/FormMedico';
import { HistoricoModal } from './components/HistoricoModal';
import { DashboardModal } from './components/DashboardModal';
import { useExcelActions } from './hooks/useExcelActions';
import { Users, Plus, Download, FileSpreadsheet, Search, Filter, BarChart3, Upload, FileDigit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useRef } from 'react';

function App() {
  const { medicos, adicionarMedico, atualizarMedico, adicionarLog } = useMedicos();

  // States
  const [activeTab, setActiveTab] = useState<Medico['status']>('Prospecção');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [medicoEditando, setMedicoEditando] = useState<Medico | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [medicoHistorico, setMedicoHistorico] = useState<Medico | null>(null);
  // Custom Excel Hook
  const { handleImport, exportBase, exportDiario } = useExcelActions(medicos, adicionarMedico, atualizarMedico);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: Medico['status'][] = ['Prospecção', 'Apresentada', 'Parceiro Ativo', 'Monitoramento'];

  // --- Lógica de Filtros e Busca ---
  const medicosFiltrados = useMemo(() => {
    return medicos.filter(m => {
      // 1. Filtro da Aba
      if (m.status !== activeTab) return false;

      // 2. Filtro de Urgência (Follow-up)
      if (showUrgentOnly) {
        const daysSince = m.ultimoContato ? differenceInDays(new Date(), parseISO(m.ultimoContato)) : 999;
        const isUrgent = daysSince > 30;
        const isWarning = m.status === 'Apresentada' && daysSince > 7 && !isUrgent;
        if (!isUrgent && !isWarning) return false;
      }

      // 3. Busca por Texto (Nome ou Especialidade ou Local)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return m.nome.toLowerCase().includes(q) ||
          m.especialidade.toLowerCase().includes(q) ||
          m.localizacao.toLowerCase().includes(q);
      }

      return true;
    });
  }, [medicos, activeTab, searchQuery, showUrgentOnly]);


  // --- Gerador de Relatório Estratégico ---
  const gerarRelatorio = () => {
    const hoje = new Date();
    const seteDiasAtras = subDays(hoje, 7);

    let duvidasResolvidas = 0;

    // Varre logs dos últimos 7 dias
    medicos.forEach(m => {
      m.logVisitas.forEach(log => {
        const logDate = parseISO(log.data);
        if (logDate >= seteDiasAtras && logDate <= hoje) {
          duvidasResolvidas++;
        }
      });
    });

    // Filtra ativados recentemente (aproximação usando logs com a palavra Ativo, ou simplemente número atual de ativos - se tivéssemos tracking preciso de data de status).
    // Como V2, vamos contar o total de ativos como marco atual, pois tracking preciso exigiria campo 'dataMudancaStatus'.
    const totalAtivos = medicos.filter(m => m.status === 'Parceiro Ativo').length;

    // Engajamento (Médicos contatados na semana vs Total)
    const medicosContatados = medicos.filter(m => m.logVisitas.some(log => parseISO(log.data) >= seteDiasAtras)).length;
    let taxaEngajamento = 0;
    if (medicos.length > 0) {
      taxaEngajamento = Math.round((medicosContatados / medicos.length) * 100);
    }

    const proximosPassos = medicos.filter(m => m.status === 'Apresentada' || m.status === 'Prospecção').length;

    const textoBase =
      `*Relatório Semanal Farma Tec 📊*

✅ *Atendimento Técnico:* ${duvidasResolvidas} dúvidas/logs registrados.
🤝 *Parcerias Atuais:* ${totalAtivos} médicos como Parceiros Ativos.
📈 *Engajamento:* ${taxaEngajamento}% da base foi contatada esta semana.
📅 *Próximos Passos (Pipeline):* ${proximosPassos} médicos mapeados nas etapas iniciais.

_Gerado via CRM Farma Tec V3.0_`;

    navigator.clipboard.writeText(textoBase).then(() => {
      toast.success('Relatório copiado para o WhatsApp!', {
        description: 'Basta colar na sua conversa com seu gestor.',
        icon: '📋'
      });
    }).catch(() => {
      toast.error('Erro ao copiar relatório.');
    });
  };


  // --- UI Helpers ---

  const openNewForm = () => {
    setMedicoEditando(null);
    setIsFormOpen(true);
  };

  const openHistory = (medico: Medico) => {
    setMedicoHistorico(medico);
    setIsHistoryOpen(true);
  };

  const handleSaveForm = (dados: Omit<Medico, 'id' | 'logVisitas'>) => {
    if (medicoEditando) {
      atualizarMedico(medicoEditando.id, dados);
    } else {
      adicionarMedico({ ...dados, logVisitas: [] });
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
      // Reset file input so same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex justify-center">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-[600px] bg-white min-h-screen shadow-xl relative pb-20 overflow-x-hidden">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-elmeco-navy p-2 rounded-lg shadow-sm">
                <Users size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">CRM Farma Tec</h1>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsDashboardOpen(true)}
                className="p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-full transition-colors flex items-center justify-center border border-slate-200 shadow-sm bg-white"
                title="Painel de Desempenho (Analytics Gráfico)"
              >
                <BarChart3 size={18} />
              </button>

              <div className="h-6 w-px bg-slate-200 my-auto mx-1" />

              <button
                onClick={triggerFileUpload}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center border border-slate-200 shadow-sm bg-white"
                title="Subir Planilha Excel (Importar Base)"
              >
                <Upload size={18} />
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  className="hidden"
                />
              </button>

              <button
                onClick={exportBase}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center border border-slate-200 shadow-sm bg-white"
                title="Baixar Tabela de Base de Médicos (.xlsx)"
              >
                <Download size={18} />
              </button>

              <button
                onClick={exportDiario}
                className="p-2 text-green-700 hover:bg-green-100 bg-green-50 rounded-full transition-colors flex items-center justify-center border border-green-200 shadow-sm"
                title="Extrair Diário de Bordo Corporativo (Logs .xlsx)"
              >
                <FileDigit size={18} />
              </button>

              <button
                onClick={gerarRelatorio}
                className="p-2 text-slate-600 hover:bg-green-50 hover:text-green-700 rounded-full transition-colors flex items-center justify-center border border-slate-200 shadow-sm bg-white"
                title="Área de Transferência: Relatório de WhatsApp"
              >
                <FileSpreadsheet size={18} />
              </button>

              <div className="h-6 w-px bg-slate-200 my-auto mx-1" />

              <button
                onClick={openNewForm}
                className="bg-black hover:bg-slate-800 text-white px-3 py-2 rounded-xl font-bold text-[13px] flex items-center shadow-md transition-all active:scale-95"
              >
                <Plus size={16} className="mr-1" /> Novo
              </button>
            </div>
          </div>

          {/* Search Bar & Primary Filters */}
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou clínica..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-elmeco-blue outline-none transition-shadow"
              />
            </div>
            <button
              onClick={() => setShowUrgentOnly(!showUrgentOnly)}
              className={`px-3 py-2 rounded-xl border flex items-center text-xs font-bold transition-colors ${showUrgentOnly ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              <Filter size={14} className="mr-1" />
              Atenção
            </button>
          </div>
        </header>

        <main>
          {/* Kanban / Tabs Section */}
          <section className="pt-4 bg-slate-50 min-h-[70vh]">
            {/* Menu de Abas */}
            <div className="flex overflow-x-auto hide-scrollbar px-4 mb-4 gap-2 pb-2">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-2.5 flex-shrink-0 rounded-full font-bold text-sm transition-all flex items-center shadow-sm ${activeTab === tab
                    ? 'bg-elmeco-navy text-white ring-2 ring-elmeco-navy ring-offset-2 ring-offset-slate-50'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {tab}
                  <span className={`ml-2 inline-flex items-center justify-center text-[10px] rounded-full h-5 w-5 font-black ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {medicos.filter(m => m.status === tab).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Cards Area */}
            <div className="px-4">
              <AnimatePresence mode="popLayout">
                {medicosFiltrados.map(medico => (
                  <CardMedico
                    key={medico.id}
                    medico={medico}
                    onUpdateStatus={(id, status) => atualizarMedico(id, { status })}
                    onViewHistory={openHistory}
                  />
                ))}
              </AnimatePresence>

              {medicosFiltrados.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 mt-4 text-center text-slate-400 bg-white border border-dashed border-slate-300 rounded-2xl"
                >
                  <Users size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold">Nenhum médico encontrado.</p>
                  {(searchQuery || showUrgentOnly) && <p className="text-xs mt-1">Tente remover os filtros.</p>}
                </motion.div>
              )}
            </div>
          </section>
        </main>

        <FormMedico
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveForm}
          medicoEditando={medicoEditando}
        />

        <HistoricoModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          medico={medicoHistorico}
          onAddLog={(id, nota) => {
            adicionarLog(id, nota);
            // Refresh local copy in modal immediately to avoid weird UX
            if (medicoHistorico) {
              setMedicoHistorico({
                ...medicoHistorico,
                logVisitas: [{ id: crypto.randomUUID(), nota, data: new Date().toISOString() }, ...medicoHistorico.logVisitas],
                ultimoContato: new Date().toISOString()
              });
            }
          }}
        />
      </div>

      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        medicos={medicos}
        tabs={tabs}
      />
    </div>
  );
}

export default App;
