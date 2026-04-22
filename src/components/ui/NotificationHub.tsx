
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
    online: { color: 'bg-brand-teal-400', text: 'Conectado', icon: <CheckCircle2 size={10} /> },
    offline: { color: 'bg-red-500', text: 'Desconectado', icon: <Bell size={10} /> },
    syncing: { color: 'bg-amber-400 animate-pulse', text: 'Sincronizando', icon: <Bell size={10} /> },
  };

  const current = configs[status] || configs.online;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 shadow-sm transition-all hover:shadow-md cursor-help group">
      <div className={`w-2 h-2 rounded-full ${current.color}`} />
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hidden sm:block">
        Hub {current.text}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl scale-95 group-hover:scale-100 duration-300 transform origin-bottom">
        <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
            {current.icon} Sistema Elite Operacional
        </p>
      </div>
    </div>
  );
};
