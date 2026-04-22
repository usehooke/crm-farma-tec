import { motion } from 'framer-motion';
import { 
    Users, 
    Calendar, 
    BarChart2, 
    BookOpen, 
    StickyNote, 
    HelpCircle,
    ChevronRight,
    Star
} from 'lucide-react';
import type { ViewName } from './MainLayout';

interface ViewLaunchpadProps {
    onNavigate: (view: ViewName) => void;
    userName?: string;
}

/**
 * ViewLaunchpad Elite v1.0 (@Agent-UX)
 * Painel de aplicativos centralizado para navegação intuitiva.
 */
export const ViewLaunchpad = ({ onNavigate, userName = "Ariani" }: ViewLaunchpadProps) => {
    const apps = [
        { id: 'home_list', label: 'Meus Médicos', icon: Users, color: 'bg-brand-teal', desc: 'Gerencie sua lista de profissionais' },
        { id: 'agenda', label: 'Minha Agenda', icon: Calendar, color: 'bg-blue-500', desc: 'Veja visitas e compromissos' },
        { id: 'documentos', label: 'Estatísticas', icon: BarChart2, color: 'bg-purple-500', desc: 'Análise de performance IQ' },
        { id: 'protocolos', label: 'Biblioteca', icon: BookOpen, color: 'bg-amber-500', desc: 'Protocolos e documentos' },
        { id: 'notas', label: 'Bloco de Notas', icon: StickyNote, color: 'bg-slate-700', desc: 'Suas anotações rápidas' },
        { id: 'ajuda', label: 'Ajuda & Guia', icon: HelpCircle, color: 'bg-green-600', desc: 'Como usar o sistema' },
    ] as const;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="flex-1 bg-brand-white dark:bg-slate-950 p-6 pb-40 overflow-y-auto no-scrollbar">
            <header className="mb-10 pt-6">
                <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-brand-teal fill-brand-teal" />
                    <span className="text-[10px] font-black text-brand-teal uppercase tracking-[0.3em]">Elite Intelligence</span>
                </div>
                <h1 className="text-4xl font-black text-brand-dark dark:text-white tracking-tighter leading-none">
                    Olá, <span className="text-brand-teal">{userName}</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">O que vamos fazer agora?</p>
            </header>

            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
                {apps.map((app) => {
                    const Icon = app.icon;
                    return (
                        <motion.button
                            key={app.id}
                            variants={item}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onNavigate(app.id === 'home_list' ? 'home' : app.id as ViewName)}
                            className="group flex items-center gap-5 p-7 bg-white dark:bg-slate-900 rounded-[32px] shadow-soft-out dark:shadow-none border border-white dark:border-slate-800 text-left transition-all hover:shadow-xl active:bg-slate-50 dark:active:bg-slate-800"
                        >
                            <div className={`w-14 h-14 rounded-[20px] ${app.color} text-white flex items-center justify-center shadow-lg shadow-current/10 shrink-0`}>
                                <Icon size={28} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-black text-brand-dark dark:text-white leading-none mb-1.5">{app.label}</h3>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide truncate">{app.desc}</p>
                            </div>
                            <ChevronRight size={18} className="text-slate-200 group-hover:text-brand-teal transition-colors" />
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Quick Stats / Feedback Area */}
            <div className="mt-10 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border border-white dark:border-slate-800 shadow-inner">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acesso Rápido</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Última Visita</p>
                        <p className="text-xs font-bold text-brand-dark dark:text-white">Há 2 horas</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Próximo Retorno</p>
                        <p className="text-xs font-bold text-brand-teal">Hoje, 14:00</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
