import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Database, ShieldCheck, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../services/firebaseConfig';
import { fazerPushParaNuvem } from '../services/syncService';
import { signOut } from 'firebase/auth';

export const Configuracoes = () => {
    const [nome, setNome] = useState('');
    const [googleConectado, setGoogleConectado] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Simula a checagem inicial do token no LocalStorage
    useEffect(() => {
        const token = localStorage.getItem('@farmaTec:google_api_key');
        const nomeSalvo = localStorage.getItem('@FarmaClinIQ:user_nome');
        if (token) setGoogleConectado(true);
        if (nomeSalvo) setNome(nomeSalvo);
    }, []);

    const handleSalvarPerfil = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNome(e.target.value);
        localStorage.setItem('@FarmaClinIQ:user_nome', e.target.value);

        // Também salva no formato antigo para retrocompatibilidade se necessário
        const profileStr = localStorage.getItem('@farmaTec:profile') || '{}';
        const profile = JSON.parse(profileStr);
        profile.nome = e.target.value;
        localStorage.setItem('@farmaTec:profile', JSON.stringify(profile));
    };

    const handleGoogleLogin = () => {
        // Implementação do Google Identity Services
        const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Requer Client ID real para produção, mas usaremos um mockup aqui para manter o fluxo

        if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
            toast.error('Client ID do Google não configurado no código.');
            // Para efeitos de demonstração no ambiente local, forçaremos a conexão:
            localStorage.setItem('@farmaTec:google_api_key', 'mock_token_for_demo');
            setGoogleConectado(true);
            toast.success('Mock: Conta conectada com sucesso!');
            return;
        }

        /* Código real para produção
        try {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/calendar.events',
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        localStorage.setItem('@farmaTec:google_api_key', tokenResponse.access_token);
                        setGoogleConectado(true);
                        toast.success('Conta conectada com sucesso!');
                    }
                },
            });
            client.requestAccessToken();
        } catch (error) {
            toast.error('Erro ao inicializar o Google Login.');
            console.error(error);
        }
        */
    };

    const handleCloudBackup = async () => {
        if (!auth.currentUser) {
            toast.error('Usuário não autenticado.');
            return;
        }

        setIsSyncing(true);
        try {
            const medicosRaw = localStorage.getItem('@FarmaClinIQ:medicos') || localStorage.getItem('@FarmaTec:medicos') || '[]';
            const medicos = JSON.parse(medicosRaw);

            await fazerPushParaNuvem(auth.currentUser.uid, medicos);

            toast.success('Backup em Nuvem realizado com sucesso!', {
                style: { backgroundColor: '#e6fcfc', color: '#00A8A8', borderColor: '#00A8A8' }, // verde-água (brand-teal) soft
            });
        } catch (error) {
            console.error(error);
            toast.error('Falha ao sincronizar com a nuvem.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLogoutApp = () => {
        signOut(auth).then(() => {
            // Unmount handled by onAuthStateChanged
        });
    };

    return (
        <motion.div
            className="flex-1 bg-brand-white px-5 pt-8 pb-32"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
        >
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Configurações</h1>
                <p className="text-sm text-slate-500 mt-1">Gerencie suas preferências e conexões.</p>
            </header>

            <div className="space-y-6">
                {/* Bloco 1: Perfil do Usuário */}
                <section className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-4">
                        <User size={18} className="text-primary" />
                        <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide">Perfil Profissional</h2>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2">NOME DE EXIBIÇÃO</label>
                        <input
                            type="text"
                            value={nome}
                            onChange={handleSalvarPerfil}
                            placeholder="Ex: Ariani"
                            className="w-full bg-transparent border-b border-slate-300 pb-2 text-brand-dark font-medium outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </section>

                {/* Bloco 2: Integrações (Google Calendar) */}
                <section className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar size={18} className="text-primary" />
                        <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide">Integrações</h2>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-brand-white rounded-xl shadow-inner">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-brand-dark">Google Calendar</span>
                            <span className="text-xs text-slate-500">
                                {googleConectado ? 'Sincronização ativa' : 'Não conectado'}
                            </span>
                        </div>

                        {googleConectado ? (
                            <button
                                onClick={() => {
                                    localStorage.removeItem('@farmaTec:google_api_key');
                                    setGoogleConectado(false);
                                    toast.info('Conta desconectada.');
                                }}
                                className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-surface px-3 py-1.5 rounded-lg active:scale-95 transition-transform shadow-[2px_2px_5px_#e5e5e5,-2px_-2px_5px_#ffffff]"
                            >
                                <LogOut size={12} /> Desconectar
                            </button>
                        ) : (
                            <button
                                onClick={handleGoogleLogin}
                                className="text-xs font-bold text-white bg-primary px-4 py-2 rounded-lg shadow-[4px_4px_10px_rgba(30,95,175,0.4),-4px_-4px_10px_rgba(255,255,255,0.8)] active:scale-95 transition-transform"
                            >
                                Conectar Conta
                            </button>
                        )}
                    </div>
                </section>

                {/* Bloco 3: Nuvem e Dados */}
                <section className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-4">
                        <Database size={18} className="text-primary" />
                        <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide">Backup em Nuvem</h2>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Envie uma cópia segura da sua carteira de médicos atual para os nossos servidores criptografados.
                    </p>
                    <button
                        onClick={handleCloudBackup}
                        disabled={isSyncing}
                        className={`w-full flex justify-center items-center gap-2 text-sm font-bold text-white py-3 rounded-xl shadow-[4px_4px_10px_rgba(30,95,175,0.4),-4px_-4px_10px_rgba(255,255,255,0.8)] transition-all ${isSyncing ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary active:scale-95'}`}
                    >
                        {isSyncing ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}>
                                <Database size={16} />
                            </motion.div>
                        ) : (
                            <Database size={16} />
                        )}
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                    </button>
                </section>

                {/* Bloco 4: Segurança */}
                <section className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck size={18} className="text-primary" />
                        <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide">Conta e Acessos</h2>
                    </div>

                    <button
                        onClick={handleLogoutApp}
                        className="w-full mt-2 flex justify-center items-center gap-2 text-sm font-bold text-red-500 bg-brand-white py-3 border border-red-100 rounded-xl shadow-[4px_4px_10px_#e5e5e5,-4px_-4px_10px_#ffffff] active:scale-95 transition-transform"
                    >
                        <LogOut size={16} /> Terminar Sessão
                    </button>
                </section>
            </div>
        </motion.div>
    );
};
