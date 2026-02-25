import { AlertTriangle } from 'lucide-react';

export const ConfigErrorScreen = () => {
    return (
        <div className="min-h-screen bg-brand-white flex flex-col justify-center items-center px-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-surface shadow-[8px_8px_16px_#e5e5e5,-8px_-8px_16px_#ffffff] flex items-center justify-center mb-6">
                <AlertTriangle size={36} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-brand-dark tracking-tight mb-3">
                Configuração Incompleta
            </h1>
            <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                Não foi possível inicializar o Firebase. Verifique se o ficheiro <strong className="text-slate-700">.env</strong> na raiz do projeto contém todas as variáveis necessárias.
            </p>
            <div className="bg-surface rounded-xl p-4 text-left shadow-inner w-full max-w-sm text-xs text-slate-600 space-y-2">
                <p><span className="font-bold text-red-500">✗</span> VITE_FIREBASE_API_KEY</p>
                <p><span className="font-bold text-slate-400">?</span> VITE_FIREBASE_AUTH_DOMAIN</p>
                <p><span className="font-bold text-slate-400">?</span> VITE_FIREBASE_PROJECT_ID</p>
            </div>
            <p className="mt-8 text-xs text-slate-400">
                Reinicie o servidor local após adicionar as chaves.
            </p>
        </div>
    );
};
