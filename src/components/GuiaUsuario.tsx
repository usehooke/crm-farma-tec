import { 
    UserPlus, 
    ClipboardCheck, 
    Calendar, 
    HelpCircle,
    ChevronRight,
    Search,
    RefreshCw
} from 'lucide-react';
import { NeoCard } from './ui/NeoCard';

/**
 * GuiaUsuario Elite v1.0 (@Agent-Manual)
 * Focado em simplicidade extrema para usuários sênior.
 */
export const GuiaUsuario = () => {
    const tutoriais = [
        {
            icon: UserPlus,
            title: "Como cadastrar um médico",
            desc: "Toque no botão '+' verde no início para adicionar novos profissionais à sua lista.",
            color: "text-brand-teal"
        },
        {
            icon: ClipboardCheck,
            title: "Registrar uma visita",
            desc: "Abra a ficha do médico e toque em 'Registrar Visita'. Suas notas são salvas sozinhas!",
            color: "text-blue-500"
        },
        {
            icon: Calendar,
            title: "Ver sua agenda",
            desc: "Toque em 'Agenda' no menu inferior para ver os retornos planejados pela Inteligência.",
            color: "text-amber-500"
        },
        {
            icon: RefreshCw,
            title: "Sincronizar dados",
            desc: "O sistema salva tudo sozinho. Se estiver sem internet, ele enviará as notas assim que você conectar.",
            color: "text-purple-500"
        }
    ];

    return (
        <div className="flex-1 bg-brand-white dark:bg-slate-950 p-6 pb-40 overflow-y-auto no-scrollbar">
            <header className="mb-10 pt-4">
                <h1 className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter italic">Manual Simples</h1>
                <p className="text-xs font-black text-brand-teal-700 dark:text-brand-teal uppercase tracking-widest mt-2">Como usar o FarmaClinQI</p>
            </header>

            <div className="space-y-6">
                {/* Busca Simples */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="O que você precisa fazer hoje?" 
                        className="w-full h-14 bg-white dark:bg-slate-900 rounded-2xl pl-12 pr-4 shadow-soft-out border-none font-bold text-sm outline-none focus:ring-2 ring-brand-teal/20"
                    />
                </div>

                {/* Cards de Tutorial */}
                <div className="grid grid-cols-1 gap-4">
                    {tutoriais.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <NeoCard key={index} noPadding className="overflow-hidden group active:scale-95 transition-all">
                                <div className="p-6 flex items-start gap-5">
                                    <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${item.color} shadow-inner`}>
                                        <Icon size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-black text-brand-dark dark:text-white mb-1">{item.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                                    </div>
                                    <div className="self-center text-slate-300 group-hover:text-brand-teal transition-colors">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </NeoCard>
                        );
                    })}
                </div>

                {/* Seção de Suporte Direto */}
                <div className="mt-12 bg-brand-dark rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/20 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <HelpCircle className="text-brand-teal" size={24} />
                            <h2 className="text-lg font-black uppercase tracking-tight">Precisa de Ajuda?</h2>
                        </div>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed mb-8">
                            Se tiver alguma dúvida que não está aqui, nossa equipe de suporte está pronta para te atender no WhatsApp.
                        </p>
                        <button className="w-full py-4 bg-brand-teal text-brand-dark font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest">
                            Chamar Suporte no WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
