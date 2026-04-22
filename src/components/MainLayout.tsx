import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, BarChart2, Settings, BookOpen, StickyNote, Palette, X } from 'lucide-react';
import { BannerInstalacao } from './BannerInstalacao';
import { PostItContainer } from './PostIt/PostItContainer';
import { StatusIndicator } from './ui/NotificationHub';

export type ViewName = 'home' | 'agenda' | 'notas' | 'documentos' | 'protocolos' | 'configuracoes' | 'design';

interface MainLayoutProps {
    children: React.ReactNode;
    activeTab: ViewName;
    setActiveTab: (tab: ViewName) => void;
    isContextActive?: boolean;
}

export const MainLayout = ({ children, activeTab, setActiveTab, isContextActive = false }: MainLayoutProps) => {
    const navItems = [
        { id: 'home', label: 'Início', icon: Home },
        { id: 'agenda', label: 'Agenda', icon: Calendar },
        { id: 'notas', label: 'Notas', icon: StickyNote },
        { id: 'documentos', label: 'Estatísticas', icon: BarChart2 },
        { id: 'protocolos', label: 'Biblioteca', icon: BookOpen },
        { id: 'configuracoes', label: 'Ajustes', icon: Settings },
        { id: 'design', label: 'Design', icon: Palette },
    ] as const;

    return (
        <div className="min-h-screen bg-brand-white dark:bg-slate-950 relative overflow-hidden flex transition-colors duration-500">

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

            {/* Área de Conteúdo principal */}
            <main className="w-full lg:max-w-none max-w-[600px] h-screen pb-32 lg:pb-0 overflow-x-hidden relative bg-brand-white dark:bg-slate-950 shadow-2xl lg:shadow-none z-10 transition-all duration-300">
                {/* Header Fixo do App */}
                <header className="sticky top-0 z-40 bg-brand-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-transparent dark:border-slate-800/50">
                    <h1 className="text-2xl tracking-tighter">
                        <span className="text-brand-dark dark:text-white font-black">FarmaClin</span>
                        <span className="text-brand-teal font-black">QI</span>
                    </h1>
                    <StatusIndicator status="online" />
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.02, y: -10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="flex-1 flex flex-col w-full mx-auto overflow-hidden"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Sidebar Desktop - PostIt Container */}
            {activeTab !== 'notas' && activeTab !== 'home' && (
                <aside className="hidden lg:block w-[320px] xl:w-[400px] h-screen bg-surface dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 overflow-y-auto no-scrollbar relative z-10">
                    <PostItContainer isSidebar={true} />
                </aside>
            )}

            {/* Bottom Navigation Bar */}
            <AnimatePresence>
                {!isContextActive && (
                    <motion.nav 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-4 pb-6 pt-3 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-40 lg:hidden border-t border-white/5 dark:border-white/10"
                    >
                        <ul className="flex justify-between items-center px-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;

                                return (
                                    <li key={item.id} className="flex-1">
                                        <button
                                            onClick={() => setActiveTab(item.id as ViewName)}
                                            className="w-full h-12 flex flex-col items-center justify-center gap-0.5 relative active:scale-90 transition-transform"
                                            aria-label={item.label}
                                        >
                                            <div className={`relative z-10 p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-brand-teal/10 scale-110 shadow-[0_0_15px_rgba(30,95,175,0.1)]' : 'bg-transparent'}`}>
                                                <Icon
                                                    size={22}
                                                    strokeWidth={isActive ? 3 : 2}
                                                    className={`transition-colors duration-300 ${isActive ? 'text-brand-teal' : 'text-slate-400'}`}
                                                />
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeIndicator"
                                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-teal rounded-full"
                                                    />
                                                )}
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 z-10 ${isActive ? 'text-brand-teal' : 'text-slate-400'}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.nav>
                )}
            </AnimatePresence>
        </div>
    );
};
