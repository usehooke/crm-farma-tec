console.log('App Iniciado');
import { useState, useEffect } from 'react';
import { useMedicos } from './hooks/useMedicos';
import { Plus } from 'lucide-react';
import { Toaster } from 'sonner';
import { MainLayout } from './components/MainLayout';
import { ViewHome } from './components/ViewHome';
import { Documentos } from './components/Documentos';
import { Configuracoes } from './components/Configuracoes';
import { Agendamento } from './components/Agendamento';
import { SplashScreen } from './components/SplashScreen';
import { Protocolos } from './components/Protocolos';
import type { ViewName } from './components/MainLayout';
import { AnimatePresence, motion } from 'framer-motion';

import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, hasValidConfig } from './services/firebaseConfig';
import { Auth } from './views/Auth';
import { fazerPullDaNuvem } from './services/syncService';
import { ConfigErrorScreen } from './components/ConfigErrorScreen';

import { ConfigProvider, useConfig } from './context/ConfigContext';
import { ModalProvider, useModal } from './context/ModalContext';

function AppContent() {
  const { loadingConfig, setUser } = useConfig();
  const { openModal } = useModal();
  const { medicos, atualizarMedico, adicionarLog } = useMedicos();

  const [currentView, setCurrentView] = useState<ViewName>('home');
  const [showSplash, setShowSplash] = useState(true);

  // Authentication State
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (!hasValidConfig) return;

    const constSubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user); // Sincroniza com o ConfigContext para isolar LocalStorage
      if (user) {
        // Usuário logado: Garante que os dados mais recentes são baixados
        try {
          await fazerPullDaNuvem(user.uid);
        } catch (e) {
          console.error("Erro ao puxar dados nativos da nuvem", e);
        }
      }
      setUsuarioLogado(user);
      setIsAuthLoading(false);
    });

    return () => constSubscribe();
  }, []);

  const tabs: typeof medicos[0]['status'][] = ['Prospecção', 'Apresentada', 'Parceiro Ativo', 'Monitoramento'];

  useEffect(() => {
    // Splash screen timer
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, [currentView]); // Re-fetch when view changes

  if (!hasValidConfig) {
    return <ConfigErrorScreen />;
  }

  if (isAuthLoading || loadingConfig) {
    return (
      <div className="min-h-screen bg-brand-white flex flex-col justify-center items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-[32px] bg-surface shadow-[10px_10px_20px_#e5e5e5,-10px_-10px_20px_#ffffff] flex items-center justify-center relative overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-12 h-12 rounded-2xl bg-brand-teal flex items-center justify-center text-white font-black text-2xl shadow-lg z-10"
          >
            IQ
          </motion.div>

          {/* Soft Ripple effect */}
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            className="absolute inset-0 bg-brand-teal/10 rounded-full"
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-slate-400 font-bold text-xs uppercase tracking-[0.2em]"
        >
          Iniciando FarmaclinIQ
        </motion.p>
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
          <ViewHome medicos={medicos} atualizarMedico={atualizarMedico} openHistory={(m) => openModal('historico', m)} tabs={tabs} />
        )}
        {currentView === 'agenda' && <Agendamento medicos={medicos} adicionarLog={adicionarLog} />}
        {currentView === 'documentos' && <Documentos />}
        {currentView === 'protocolos' && <Protocolos />}
        {currentView === 'configuracoes' && <Configuracoes />}
      </MainLayout>

      {/* FAB Oculto temporariamente, as Views devem prover seus botões de ação (Ex: Agendamento FAB) ou ViewHome */}
      {currentView === 'home' && (
        <button
          onClick={() => openModal('form')}
          className="fixed bottom-24 right-6 bg-primary hover:bg-opacity-90 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[4px_4px_10px_#e2e8f0,-4px_-4px_10px_#ffffff] transition-all active:scale-95 z-40"
          title="Novo Registro"
        >
          <Plus size={28} />
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </ConfigProvider>
  );
}
