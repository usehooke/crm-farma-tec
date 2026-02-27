import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Database, ShieldCheck, LogOut, Tag, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../services/firebaseConfig';
import { fazerPushParaNuvem, importarCarteiraTop50 } from '../services/syncService';
import { signOut } from 'firebase/auth';
import { useConfig, STORAGE_KEY_MEDICOS } from '../context/ConfigContext';

export const Configuracoes = () => {
    const {
        nomeUsuario,
        setNomeUsuario,
        telefoneUsuario,
        setTelefoneUsuario,
        vipTags,
        salvarVipTags,
        googleConectado,
        setGoogleConectado,
        isDarkMode,
        setIsDarkMode
    } = useConfig();

    const [isSyncing, setIsSyncing] = useState(false);
    const [novaTagNome, setNovaTagNome] = useState('');

    const handleSalvarPerfil = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNomeUsuario(e.target.value);

        // Também salva no formato antigo para retrocompatibilidade se necessário
        const profileStr = localStorage.getItem('@farmaTec:profile') || '{}';
        const profile = JSON.parse(profileStr);
        profile.nome = e.target.value;
        localStorage.setItem('@farmaTec:profile', JSON.stringify(profile));
    };

    const handleAtualizarNomeTag = (id: string, novoNome: string) => {
        const tagsAtualizadas = vipTags.map(tag =>
            tag.id === id ? { ...tag, name: novoNome } : tag
        );
        salvarVipTags(tagsAtualizadas);
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

        salvarVipTags([...vipTags, novaTag]);
        setNovaTagNome('');
    };

    const handleRemoverTag = (id: string) => {
        if (vipTags.length <= 1) {
            toast.error('Você precisa ter pelo menos uma tag.');
            return;
        }
        const tagsAtualizadas = vipTags.filter(tag => tag.id !== id);
        salvarVipTags(tagsAtualizadas);
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
            const medicosRaw = localStorage.getItem(STORAGE_KEY_MEDICOS) || '[]';
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

    const handleImportarVip = async () => {
        if (!auth.currentUser) return;

        const toastId = toast.loading('Processando Carga VIP SP...');
        const result = await importarCarteiraTop50(auth.currentUser.uid);

        if (result.success) {
            toast.success(`✅ ${result.count} Médicos importados com sucesso!`, { id: toastId });
            // Força um pull para atualizar o estado local
            window.location.reload(); // Forma mais simples de garantir que o ConfigContext recarregue tudo da nuvem/local
        } else {
            toast.error('Erro ao importar base VIP.', { id: toastId });
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
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-2">NOME DE EXIBIÇÃO</label>
                            <input
                                type="text"
                                value={nomeUsuario}
                                onChange={handleSalvarPerfil}
                                placeholder="Ex: Ariani"
                                className="w-full bg-transparent border-b border-slate-300 pb-2 text-brand-dark font-medium outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Telefone de Contato (WhatsApp)</label>
                            <input
                                type="text"
                                value={telefoneUsuario}
                                onChange={(e) => setTelefoneUsuario(e.target.value)}
                                placeholder="Ex: 11999999999"
                                className="w-full bg-transparent border-b border-slate-300 pb-2 text-brand-dark font-medium outline-none focus:border-primary transition-colors"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 italic">* Usado para gerar seu QR Code de Cartão Digital.</p>
                        </div>
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

                {/* Bloco 2.2: Personalização (Tema) */}
                <section className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-primary" />
                            <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide">Aparência</h2>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between p-3 bg-brand-white rounded-xl shadow-inner">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-brand-dark">Tema Escuro</span>
                            <span className="text-xs text-slate-500">Reduz o cansaço visual</span>
                        </div>

                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isDarkMode ? 'bg-brand-teal' : 'bg-slate-300'}`}
                        >
                            <motion.div
                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                                animate={{ x: isDarkMode ? 24 : 0 }}
                            />
                        </button>
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

                    {/* Botão Secreto Ariani */}
                    {(auth.currentUser?.email === 'ariani@elmeco.com.br' || auth.currentUser?.email === 'nando@hooke.com.br' || auth.currentUser?.uid === 'MnXg91W7xwNGqAKDE3DzC6dIitg1') && (
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Acesso Administrativo</p>
                            <button
                                onClick={handleImportarVip}
                                className="w-full py-4 bg-brand-white text-brand-teal border-2 border-brand-teal/20 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-brand-teal/5 transition-all flex items-center justify-center gap-2"
                            >
                                <ShieldCheck size={16} /> Importar Planilha SP (Vip)
                            </button>
                        </div>
                    )}
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
