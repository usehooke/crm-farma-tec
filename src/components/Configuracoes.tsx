import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Database, ShieldCheck, LogOut, Tag, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../services/firebaseConfig';
import { fazerPushParaNuvem } from '../services/syncService';
import { signOut } from 'firebase/auth';

export const Configuracoes = () => {
    const [nome, setNome] = useState('');
    const [googleConectado, setGoogleConectado] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [vipTags, setVipTags] = useState<{ id: string, name: string, color: string }[]>([]);
    const [novaTagNome, setNovaTagNome] = useState('');

    const defaultTags = [
        { id: '1', name: 'Prescritor Alto', color: 'bg-green-500' },
        { id: '2', name: 'Potencial', color: 'bg-blue-500' },
        { id: '3', name: 'KOL', color: 'bg-purple-500' }
    ];

    // Simula a checagem inicial do token no LocalStorage
    useEffect(() => {
        const token = localStorage.getItem('@farmaTec:google_api_key');
        const nomeSalvo = localStorage.getItem('@FarmaClinIQ:user_nome');
        const tagsSalvas = localStorage.getItem('@FarmaClinIQ:vip_tags');

        if (token) setGoogleConectado(true);
        if (nomeSalvo) setNome(nomeSalvo);
        if (tagsSalvas) {
            setVipTags(JSON.parse(tagsSalvas));
        } else {
            setVipTags(defaultTags);
        }
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

    const salvarTags = (novasTags: typeof vipTags) => {
        setVipTags(novasTags);
        localStorage.setItem('@FarmaClinIQ:vip_tags', JSON.stringify(novasTags));
    };

    const handleAtualizarNomeTag = (id: string, novoNome: string) => {
        const tagsAtualizadas = vipTags.map(tag =>
            tag.id === id ? { ...tag, name: novoNome } : tag
        );
        salvarTags(tagsAtualizadas);
    };

    const handleAdicionarTag = () => {
        if (!novaTagNome.trim()) return;

        // Cores disponíveis para novas tags
        const cores = ['bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'];
        const corAleatoria = cores[Math.floor(Math.random() * cores.length)];

        const novaTag = {
            id: Date.now().toString(),
            name: novaTagNome.trim(),
            color: corAleatoria
        };

        salvarTags([...vipTags, novaTag]);
        setNovaTagNome('');
    };

    const handleRemoverTag = (id: string) => {
        if (vipTags.length <= 1) {
            toast.error('Você precisa ter pelo menos uma tag.');
            return;
        }
        const tagsAtualizadas = vipTags.filter(tag => tag.id !== id);
        salvarTags(tagsAtualizadas);
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
            localStorage.removeItem('@farmaTec:google_api_key');
            localStorage.removeItem('@FarmaClinIQ:user_nome');
            localStorage.removeItem('@farmaTec:profile');
            // A redireção para Auth.tsx ocorrerá automaticamente via onAuthStateChanged no App.tsx
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

                {/* Bloco 2.5: Etiquetas Customizadas */}
                <section className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-4">
                        <Tag size={18} className="text-primary" />
                        <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide">Etiquetas VIP</h2>
                    </div>

                    <div className="space-y-3 mb-4">
                        {vipTags.map((tag) => (
                            <div key={tag.id} className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${tag.color} shadow-sm shrink-0`} />
                                <input
                                    type="text"
                                    value={tag.name}
                                    onChange={(e) => handleAtualizarNomeTag(tag.id, e.target.value)}
                                    className="flex-1 bg-brand-white border-none rounded-xl px-3 py-2 text-sm text-brand-dark font-medium shadow-inner outline-none focus:ring-1 focus:ring-primary transition-all"
                                />
                                <button
                                    onClick={() => handleRemoverTag(tag.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                        <input
                            type="text"
                            value={novaTagNome}
                            onChange={(e) => setNovaTagNome(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdicionarTag()}
                            placeholder="Nova etiqueta..."
                            className="flex-1 bg-transparent border-b border-slate-300 pb-2 text-sm text-brand-dark outline-none focus:border-primary transition-colors"
                        />
                        <button
                            onClick={handleAdicionarTag}
                            disabled={!novaTagNome.trim()}
                            className="p-2 bg-surface rounded-xl text-primary shadow-[2px_2px_5px_#e5e5e5,-2px_-2px_5px_#ffffff] active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shrink-0"
                        >
                            <Plus size={18} />
                        </button>
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
                        className="w-full mt-2 flex justify-center items-center gap-2 text-sm font-bold text-red-500 bg-surface py-3 rounded-xl shadow-[inset_4px_4px_8px_#e5e5e5,inset_-4px_-4px_8px_#ffffff] active:scale-95 transition-transform"
                    >
                        <LogOut size={16} /> Sair da Conta
                    </button>
                </section>
            </div>
        </motion.div>
    );
};
