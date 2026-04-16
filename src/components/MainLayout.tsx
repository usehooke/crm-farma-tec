import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, BarChart2, Settings, BookOpen, StickyNote } from 'lucide-react';
import { BannerInstalacao } from './BannerInstalacao';
import { PostItContainer } from './PostIt/PostItContainer';

export type ViewName = 'home' | 'agenda' | 'notas' | 'documentos' | 'protocolos' | 'configuracoes';

// Interfaces para tipagem do componente
interface MainLayoutProps {
    children: React.ReactNode;
    activeTab: ViewName;
    setActiveTab: (tab: ViewName) => void;
}

export const MainLayout = ({ children, activeTab, setActiveTab }: MainLayoutProps) => {
    // Configuração das abas de navegação
    const navItems = [
        { id: 'home', label: 'Início', icon: Home },
        { id: 'agenda', label: 'Agenda', icon: Calendar },
        { id: 'notas', label: 'Notas', icon: StickyNote },
        { id: 'documentos', label: 'Estatísticas', icon: BarChart2 },
        { id: 'protocolos', label: 'Biblioteca', icon: BookOpen },
        { id: 'configuracoes', label: 'Ajustes', icon: Settings },
    ] as const;

    return (
        <div className="min-h-screen bg-brand-white relative overflow-hidden flex lg:bg-slate-50">

            {/* Sidebar Desktop (Slim/Exclusiva) */}
            <nav className="hidden lg:flex w-20 flex-col items-center py-8 bg-brand-dark border-r border-slate-800 shrink-0 z-50">
                <div className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center text-white font-black text-lg mb-10 shadow-lg shadow-brand-teal/20">
                    IQ
                </div>
                <ul className="flex flex-col gap-6 w-full px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id as ViewName)}
                                    className={`w-full flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-2xl transition-all ${isActive ? 'bg-brand-teal text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                                >
                                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-[8px] font-black uppercase tracking-tight">{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Banner de Instalação PWA Global */}
            <BannerInstalacao />

            {/* Área de Conteúdo principal (As telas são injetadas aqui) */}
            <main className="w-full lg:max-w-none max-w-[600px] h-screen pb-24 lg:pb-0 overflow-x-hidden relative bg-brand-white shadow-2xl lg:shadow-none z-20">
                {/* Header Fixo do App */}
                <header className="sticky top-0 z-40 bg-brand-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
                    <h1 className="text-2xl tracking-tighter">
                        <span className="text-brand-dark font-bold">FarmaClin</span>
                        <span className="text-brand-teal font-black">QI</span>
                    </h1>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab} // O key dinâmico força a re-renderização suave ao trocar de aba
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col w-full mx-auto overflow-hidden"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Sidebar Desktop - PostIt Container (Opcional ou Ajustado para o novo layout) */}
            {activeTab !== 'notas' && activeTab !== 'home' && (
                <aside className="hidden lg:block w-[320px] xl:w-[400px] h-screen bg-surface border-l border-slate-200 overflow-y-auto no-scrollbar relative z-10">
                    <PostItContainer isSidebar={true} />
                </aside>
            )}

            {/* Bottom Navigation Bar (Neumórfica v2) */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-4 pb-6 pt-3 bg-surface rounded-t-3xl shadow-[0_-8px_20px_rgba(0,0,0,0.03)] z-50 lg:hidden">
                <ul className="flex justify-between items-center px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <li key={item.id} className="flex-1">
                                <button
                                    onClick={() => setActiveTab(item.id as ViewName)}
                                    className="w-full flex flex-col items-center justify-center gap-1 py-2 active:scale-95 transition-transform"
                                >
                                    {/* Container do Ícone com animação de seleção */}
                                    <div className={`relative p-2 rounded-xl transition-colors duration-300 ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                                        <Icon
                                            size={24}
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className={`transition-colors duration-300 ${isActive ? 'text-primary' : 'text-slate-400'}`}
                                        />
                                        {/* Bolinha indicadora abaixo do ícone */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                                            />
                                        )}
                                    </div>

                                    {/* Texto do Menu */}
                                    <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

        </div>
    );
};
