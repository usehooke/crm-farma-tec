import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const BannerInstalacao = () => {
    const { promptInstalacao, instalarApp, isIOS, isInstalled } = usePWAInstall();
    const [fechado, setFechado] = useState(false);

    // Se já estiver instalado ou o usuário fechou o banner, não renderiza nada (Negative Space)
    if (isInstalled || fechado) return null;
    // Só mostra o banner se o Android liberar o prompt ou se for iOS
    if (!promptInstalacao && !isIOS) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-4 left-4 right-4 z-[60] p-4 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff] flex items-center justify-between border border-white/50"
            >
                <div className="flex items-center gap-3">
                    {/* Mini logo da cruz */}
                    <div className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center shadow-inner">
                        <span className="text-white font-bold text-sm tracking-wider">IQ</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-dark">Instalar FarmaClinIQ</span>
                        <span className="text-xs text-slate-500">
                            {isIOS ? 'Adicione à Tela de Início' : 'Acesso rápido e offline'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isIOS ? (
                        // Instrução passiva para iPhone
                        <div className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-3 py-2 rounded-lg">
                            <Share size={14} /> iOS
                        </div>
                    ) : (
                        // Botão de ação direta para Android
                        <button
                            onClick={instalarApp}
                            className="flex items-center gap-1 text-xs font-bold text-white bg-primary px-3 py-2 rounded-lg shadow-md shadow-primary/30 active:scale-95 transition-transform"
                        >
                            <Download size={14} /> Instalar
                        </button>
                    )}

                    {/* Botão para dispensar o aviso */}
                    <button
                        onClick={() => setFechado(true)}
                        className="p-1 rounded-full text-slate-400 active:bg-slate-200 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
