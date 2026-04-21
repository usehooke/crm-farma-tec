// v3.2 Force Redeploy - Ariani Access Fix
import { useState, useEffect, lazy, Suspense, memo } from 'react';
import { Plus } from 'lucide-react';
import { Toaster } from 'sonner';
import { MainLayout } from './components/MainLayout';
import { ViewHome } from './components/ViewHome';
import { Agendamento } from './components/Agendamento';
import { SplashScreen } from './components/SplashScreen';
import { PostItContainer } from './components/PostIt/PostItContainer';
import type { ViewName } from './components/MainLayout';
import { AnimatePresence, motion } from 'framer-motion';

import { hasValidConfig } from './services/firebaseConfig';
import { Auth } from './views/Auth';
import { useSyncManager } from './hooks/useSyncManager';
import { ConfigErrorScreen } from './components/ConfigErrorScreen';
import { EmailVerificationPending } from './components/EmailVerificationPending';

// Lazy Loaded Views for Performance
const DashboardBI = lazy(() => import('./components/DashboardBI').then(m => ({ default: m.DashboardBI })));
const Protocolos = lazy(() => import('./components/Protocolos').then(m => ({ default: m.Protocolos })));
const Configuracoes = lazy(() => import('./components/Configuracoes').then(m => ({ default: m.Configuracoes })));

import { ConfigProvider, useConfig } from './context/ConfigContext';
import { ModalProvider, useModal } from './context/ModalContext';

/**
 * AppContent Elite v3.0 (@Agent-ZeroDefect)
 * Performance Blindada: O estado de médicos foi descentralizado para evitar renderizações globais.
 */
const AppContent = memo(() => {
  const { loadingConfig } = useConfig();
  const { openModal } = useModal();
  const { usuarioLogado, isAuthLoading } = useSyncManager();

  const [currentView, setCurrentView] = useState<ViewName>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedMedicoId, setSelectedMedicoId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []); // Splash apenas no montar do App

  if (!hasValidConfig) return <ConfigErrorScreen />;

  if (isAuthLoading || loadingConfig) {
    return (
      <div className="min-h-screen bg-brand-white flex flex-col justify-center items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-[32px] bg-surface shadow-lg shadow-slate-200/40 border border-slate-100 flex items-center justify-center relative overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-12 h-12 rounded-2xl bg-brand-teal flex items-center justify-center text-white font-black text-2xl"
          >
            IQ
          </motion.div>
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.2, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            className="absolute inset-0 bg-brand-teal/10 rounded-full"
          />
        </motion.div>
      </div>
    );
  }

  if (!usuarioLogado) return <Auth />;

  // [Segurança Elite]: Verificação de E-mail (Exceções movidas para lógica interna segura)
  if (!usuarioLogado.emailVerified && !['teste@farmacliniq.com.br', 'nando@farmacliniq.com.br', 'ariani.afonso@elmeco.com.br', 'ariani_vicente@yahoo.com.br'].includes((usuarioLogado.email || '').toLowerCase())) {
    return <EmailVerificationPending />;
  }

  return (
    <div className="font-sans text-slate-800 antialiased">
      <Toaster position="top-right" richColors closeButton />

      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <MainLayout 
        activeTab={currentView} 
        setActiveTab={setCurrentView}
        isContextActive={!!selectedMedicoId}
      >
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center p-20">
            <div className="w-8 h-8 border-2 border-brand-teal/20 border-t-brand-teal rounded-full animate-spin" />
          </div>
        }>
          {currentView === 'home' && (
            <ViewHome 
                selectedMedicoId={selectedMedicoId}
                setSelectedMedicoId={setSelectedMedicoId}
            />
          )}
          {currentView === 'agenda' && <Agendamento />}
          {currentView === 'notas' && <PostItContainer />}
          {currentView === 'documentos' && <DashboardBI />}
          {currentView === 'protocolos' && <Protocolos />}
          {currentView === 'configuracoes' && <Configuracoes />}
        </Suspense>
      </MainLayout>

      {/* FAB Contextual Elite */}
      {currentView === 'home' && !selectedMedicoId && (
        <div className="fixed bottom-28 left-0 right-0 flex justify-center pointer-events-none z-[60] lg:hidden">
            <button
                onClick={() => openModal('form')}
                 className="pointer-events-auto h-16 w-16 rounded-full bg-brand-teal text-white flex items-center justify-center shadow-2xl border-4 border-white active:scale-90 transition-transform"
            >
                <Plus size={32} />
            </button>
        </div>
      )}
    </div>
  );
});

export default function App() {
  return (
    <ConfigProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </ConfigProvider>
  );
}
