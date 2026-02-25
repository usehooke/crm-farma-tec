import { useState, useEffect } from 'react';

export function usePWAInstall() {
    const [promptInstalacao, setPromptInstalacao] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Captura o evento nativo do Chrome/Android para instalar
        const handler = (e: Event) => {
            e.preventDefault();
            setPromptInstalacao(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // Detecta se é iOS (Safari não suporta o prompt automático, precisa de instrução manual)
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        // Detecta se o app JÁ ESTÁ rodando como aplicativo nativo (standalone)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const instalarApp = async () => {
        if (promptInstalacao) {
            promptInstalacao.prompt();
            const { outcome } = await promptInstalacao.userChoice;
            if (outcome === 'accepted') {
                setPromptInstalacao(null);
            }
        }
    };

    return { promptInstalacao, instalarApp, isIOS, isInstalled };
}
