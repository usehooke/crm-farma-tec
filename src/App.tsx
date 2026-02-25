import { useState, useEffect } from 'react';
import { useMedicos, type Medico } from './hooks/useMedicos';
import { FormMedico } from './components/FormMedico';
import { HistoricoModal } from './components/HistoricoModal';
import { DashboardModal } from './components/DashboardModal';
import { Plus } from 'lucide-react';
import { Toaster } from 'sonner';
import { MainLayout } from './components/MainLayout';
import { ViewHome } from './components/ViewHome';
import { Documentos } from './components/Documentos';
import { Configuracoes } from './components/Configuracoes';
import { Agendamento } from './components/Agendamento';
import { SplashScreen } from './components/SplashScreen';
import type { ViewName } from './components/MainLayout';
import { AnimatePresence } from 'framer-motion';

import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './services/firebaseConfig';
import { Auth } from './views/Auth';
import { fazerPullDaNuvem } from './services/syncService';

function App() {
  const { medicos, adicionarMedico, atualizarMedico, adicionarLog } = useMedicos();

  const [currentView, setCurrentView] = useState<ViewName>('home');
  const [showSplash, setShowSplash] = useState(true);

  // Authentication State
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const constSubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuário logado: Garante que os dados mais recentes são baixados
        try {
          await fazerPullDaNuvem(user.uid);
          // Como alteramos o LocalStorage diretamente pelo service, um window.location.reload() 
          // ou apenas forçar o state do PWA poderia ser feito. No mínimo gravamos o usuário logado para liberar tela.
        } catch (e) {
          console.error("Erro ao puxar dados nativos da nuvem", e);
        }
      }
      setUsuarioLogado(user);
      setIsAuthLoading(false);
    });

    return () => constSubscribe();
  }, []);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [medicoEditando, setMedicoEditando] = useState<Medico | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [medicoHistorico, setMedicoHistorico] = useState<Medico | null>(null);



  const tabs: Medico['status'][] = ['Prospecção', 'Apresentada', 'Parceiro Ativo', 'Monitoramento'];

  useEffect(() => {
    // Splash screen timer
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, [currentView]); // Re-fetch when view changes

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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-brand-white flex justify-center items-center">
        {/* Simple Loader Placeholder */}
        <div className="w-12 h-12 rounded-2xl bg-brand-teal flex items-center justify-center text-white font-black text-2xl animate-pulse">
          IQ
        </div>
      </div>
    );
  }

  if (!usuarioLogado) {
    return <Auth />;
  }

  return (
    <div className="font-sans text-slate-800">
      <Toaster position="top-center" richColors />

      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <MainLayout activeTab={currentView} setActiveTab={setCurrentView}>
        {/* Dynamic View Routing */}
        {currentView === 'home' && (
          <ViewHome medicos={medicos} atualizarMedico={atualizarMedico} openHistory={openHistory} tabs={tabs} />
        )}
        {currentView === 'agenda' && <Agendamento medicos={medicos} adicionarLog={adicionarLog} />}
        {currentView === 'documentos' && <Documentos />}
        {currentView === 'configuracoes' && <Configuracoes />}
      </MainLayout>

      {/* FAB Oculto temporariamente, as Views devem prover seus botões de ação (Ex: Agendamento FAB) ou ViewHome */}
      {currentView === 'home' && (
        <button
          onClick={openNewForm}
          className="fixed bottom-24 right-6 bg-primary hover:bg-opacity-90 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[4px_4px_10px_#e2e8f0,-4px_-4px_10px_#ffffff] transition-all active:scale-95 z-40"
          title="Novo Registro"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Modals mantidos no root */}
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
          if (medicoHistorico) {
            setMedicoHistorico({
              ...medicoHistorico,
              logVisitas: [{ id: crypto.randomUUID(), nota, data: new Date().toISOString() }, ...medicoHistorico.logVisitas],
              ultimoContato: new Date().toISOString()
            });
          }
        }}
      />

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
