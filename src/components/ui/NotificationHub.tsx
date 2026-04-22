
import { Toaster as SonnerToaster } from 'sonner';
import { Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const NotificationHub = () => {
  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        className: 'rounded-[24px] p-4 shadow-2xl border-none font-bold text-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl',
        style: {
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 20px rgba(45, 212, 191, 0.05)',
        },
      }}
      icons={{
        success: <CheckCircle2 className="text-brand-teal-400" size={18} />,
        info: <Info className="text-blue-500" size={18} />,
        warning: <AlertTriangle className="text-amber-500" size={18} />,
        error: <AlertTriangle className="text-red-500" size={18} />,
      }}
    />
  );
};

// Componente decorativo opcional para o status da rede ou atualizações em tempo real
export const StatusIndicator = ({ status = 'online' }: { status?: 'online' | 'offline' | 'syncing' }) => {
  const configs = {
    online: { color: 'bg-green-500', text: 'Tudo Salvo', icon: <CheckCircle2 size={12} className="text-white" /> },
    offline: { color: 'bg-red-500', text: 'Sem Internet', icon: <AlertTriangle size={12} className="text-white" /> },
    syncing: { color: 'bg-amber-500 animate-pulse', text: 'Salvando...', icon: <CheckCircle2 size={12} className="text-white" /> },
  };

  const current = configs[status] || configs.online;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all group">
      <div className={`w-2.5 h-2.5 rounded-full ${current.color} shadow-sm`} />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
        {current.text}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl scale-95 group-hover:scale-100 duration-300 transform origin-bottom">
        <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
            {current.icon} Sistema Elite Operacional
        </p>
      </div>
    </div>
  );
};
