import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, BarChart2, Settings, BookOpen } from 'lucide-react';
import { BannerInstalacao } from './BannerInstalacao';

export type ViewName = 'home' | 'agenda' | 'documentos' | 'protocolos' | 'configuracoes';

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
        { id: 'documentos', label: 'Docs', icon: BarChart2 },
        { id: 'protocolos', label: 'Biblioteca', icon: BookOpen },
        { id: 'configuracoes', label: 'Ajustes', icon: Settings },
    ] as const;

    return (
        <div className="min-h-screen bg-brand-white relative overflow-hidden flex justify-center">

            {/* Banner de Instalação PWA Global */}
            <BannerInstalacao />

            {/* Área de Conteúdo principal (As telas são injetadas aqui) */}
            <main className="w-full max-w-[600px] h-screen pb-24 overflow-x-hidden relative shadow-xl">
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
                        className="min-h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Navigation Bar (Neumórfica) */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-4 pb-6 pt-3 bg-surface rounded-t-3xl shadow-[0_-8px_20px_rgba(229,229,229,0.5)] z-50">
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
