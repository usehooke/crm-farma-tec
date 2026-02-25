import { Home, Calendar, FileText, Settings } from 'lucide-react';

export type ViewName = 'home' | 'agenda' | 'documentos' | 'configuracoes';

interface BottomNavProps {
    currentView: ViewName;
    onChangeView: (view: ViewName) => void;
}

export function BottomNav({ currentView, onChangeView }: BottomNavProps) {
    const navItems = [
        { id: 'agenda', icon: Calendar, label: 'Agenda' },
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'documentos', icon: FileText, label: 'Docs' },
        { id: 'configuracoes', icon: Settings, label: 'Config' },
    ] as const;

    return (
        <div className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-3 pb-safe z-50 flex justify-between items-center shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-2xl">
            {navItems.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;

                return (
                    <button
                        key={item.id}
                        onClick={() => onChangeView(item.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Icon size={22} className={isActive ? 'fill-primary/10' : ''} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                            {item.label}
                        </span>
                        {isActive && (
                            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
