import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Database, ShieldCheck, LogOut, Tag, Plus, X, HelpCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../services/firebaseConfig';
import { fazerPushParaNuvem, importarCarteiraTop50 } from '../services/syncService';
import { signOut } from 'firebase/auth';
import { useConfig, STORAGE_KEY_MEDICOS } from '../context/ConfigContext';
import { useMedicos } from '../hooks/useMedicos';
import { useModal } from '../context/ModalContext';

/**
 * Tela de Configurações (@Agent-SettingsPanel)
 * Otimizada para Mobile Android (Thumb Zone e Contraste Máximo)
 */
export const Configuracoes = () => {
    const {
        nomeUsuario,
        setNomeUsuario,
        telefoneUsuario,
        setTelefoneUsuario,
        vipTags,
        salvarVipTags,
        isDarkMode,
        setIsDarkMode
    } = useConfig();

    const [isSyncing, setIsSyncing] = useState(false);
    const [isMerging, setIsMerging] = useState(false);
    const [novaTagNome, setNovaTagNome] = useState('');

    const { limparBaseDuplicada } = useMedicos();
    const { openModal } = useModal();

    const handleSalvarPerfil = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNomeUsuario(e.target.value);
        const profileStr = localStorage.getItem('@FarmaClinIQ:profile') || '{}';
        const profile = JSON.parse(profileStr);
        profile.nome = e.target.value;
        localStorage.setItem('@FarmaClinIQ:profile', JSON.stringify(profile));
    };

    const handleAdicionarTag = () => {
        if (!novaTagNome.trim()) return;
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

    const handleCloudBackup = async () => {
        if (!auth.currentUser) return;
        setIsSyncing(true);
        try {
            const medicosRaw = localStorage.getItem(STORAGE_KEY_MEDICOS) || '[]';
            const medicos = JSON.parse(medicosRaw);
            await fazerPushParaNuvem(auth.currentUser.uid, medicos);
            toast.success('Backup em Nuvem seguro!', {
                style: { backgroundColor: '#131c31', color: '#2dd4bf', borderColor: '#2dd4bf' }
            });
        } catch (error) {
            toast.error('Falha ao sincronizar.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLogoutApp = () => {
        signOut(auth).then(() => {
            localStorage.clear();
            window.location.href = '/';
        });
    };

    return (
        <motion.div
            className="flex-1 bg-brand-white dark:bg-slate-900 px-6 pt-10 pb-40 overflow-y-auto no-scrollbar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <header className="mb-10">
                <h1 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Privacidade & Ajustes</h1>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">Personalização da sua Inteligência CRM</p>
            </header>

            <div className="space-y-8">
                {/* Central de Ajuda - IMPACTO VISUAL */}
                <section
                    onClick={() => openModal('guia')}
                    className="p-8 rounded-[36px] bg-brand-teal text-white shadow-2xl shadow-brand-teal/20 cursor-pointer active:scale-95 transition-all flex items-center justify-between border-b-4 border-brand-teal/30"
                >
                    <div className="flex gap-6 items-center">
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                            <HelpCircle size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Manual da Ariani</h2>
                            <p className="text-[11px] text-white/80 font-black uppercase tracking-widest mt-1">Dicas & Macetes Profissionais</p>
                        </div>
                    </div>
                </section>

                {/* Perfil Profissional */}
                <section className="p-8 rounded-[36px] bg-white dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-brand-teal/10 rounded-lg">
                            <User size={20} className="text-brand-teal" />
                        </div>
                        <h2 className="text-[11px] font-black text-brand-dark dark:text-white uppercase tracking-widest">Identidade no Sistema</h2>
                    </div>
                    
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Seu Nome</label>
                            <input
                                type="text"
                                value={nomeUsuario}
                                onChange={handleSalvarPerfil}
                                className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl px-5 py-4 text-base font-bold text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={12} className="text-brand-teal" /> WhatsApp (QR Card)
                            </label>
                            <input
                                type="text"
                                value={telefoneUsuario}
                                onChange={(e) => setTelefoneUsuario(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl px-5 py-4 text-base font-bold text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Tags de Classificação - UX REFINADO */}
                <section className="p-8 rounded-[36px] bg-white dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-brand-teal/10 rounded-lg">
                            <Tag size={20} className="text-brand-teal" />
                        </div>
                        <h2 className="text-[11px] font-black text-brand-dark dark:text-white uppercase tracking-widest">Etiquetas VIP SP</h2>
                    </div>

                    <div className="space-y-4 mb-8">
                        {vipTags.map((tag) => (
                            <div key={tag.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl">
                                <div className={`w-6 h-6 rounded-lg ${tag.color} shadow-lg shrink-0`} />
                                <input
                                    type="text"
                                    value={tag.name}
                                    onChange={(e) => {
                                        const updated = vipTags.map(t => t.id === tag.id ? { ...t, name: e.target.value } : t);
                                        salvarVipTags(updated);
                                    }}
                                    className="flex-1 bg-transparent text-sm text-brand-dark dark:text-white font-black outline-none"
                                />
                                <button onClick={() => {
                                    if(vipTags.length > 1) salvarVipTags(vipTags.filter(t => t.id !== tag.id));
                                    else toast.error('Tenha ao menos uma tag.');
                                }} className="p-2 text-slate-300 hover:text-red-500">
                                    <X size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={novaTagNome}
                            onChange={(e) => setNovaTagNome(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl text-sm font-bold dark:text-white"
                            placeholder="Nova etiqueta..."
                        />
                        <button onClick={handleAdicionarTag} className="bg-brand-teal text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
                            <Plus size={24} />
                        </button>
                    </div>
                </section>

                {/* Segurança e Aparência */}
                <section className="grid grid-cols-1 gap-6">
                    <div className="p-8 rounded-[36px] bg-white dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-teal/5 rounded-2xl">
                                <ShieldCheck size={24} className="text-brand-teal" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-brand-dark dark:text-white">Modo Escuro (Dark)</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Conforto Visual Noturno</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`w-16 h-8 rounded-full p-1 transition-all ${isDarkMode ? 'bg-brand-teal' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <motion.div
                                className="w-6 h-6 bg-white rounded-full shadow-lg"
                                animate={{ x: isDarkMode ? 32 : 0 }}
                            />
                        </button>
                    </div>
                </section>

                {/* Sincronização e Admin */}
                <section className="p-8 rounded-[36px] bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-teal/10 rounded-lg">
                            <Database size={20} className="text-brand-teal" />
                        </div>
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Segurança de Dados</h2>
                    </div>

                    <button
                        onClick={handleCloudBackup}
                        disabled={isSyncing}
                        className="w-full py-5 bg-brand-teal text-white rounded-3xl font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-brand-teal/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Database size={20} /> {isSyncing ? 'PROTEGENDO...' : 'BACKUP EM NUVEM AGORA'}
                    </button>

                    {((auth.currentUser?.email?.toLowerCase() === 'ariani.afonso@elmeco.com.br' || auth.currentUser?.email?.toLowerCase() === 'ariani_vicente@yahoo.com.br' || auth.currentUser?.email === 'nando@FarmaClinQI.com.br' || auth.currentUser?.uid === 'MnXg91W7xwNGqAKDE3DzC6dIitg1')) && (
                        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
                            <button
                                onClick={() => importarCarteiraTop50(auth.currentUser!.uid).then(r => r.success && window.location.reload())}
                                className="w-full py-4 text-[10px] font-black text-brand-teal border-2 border-brand-teal/20 rounded-2xl uppercase tracking-[0.2em]"
                            >
                                CARGA VIP SP (TOP 50)
                            </button>
                            <button
                                onClick={async () => {
                                    if(confirm("Confirmar Higienização?")) {
                                        setIsMerging(true);
                                        const res = await limparBaseDuplicada();
                                        toast.success(`${res.mergedCount} registros limpos!`);
                                        setIsMerging(false);
                                    }
                                }}
                                disabled={isMerging}
                                className="w-full py-4 text-[10px] font-black text-red-400 border-2 border-red-500/10 rounded-2xl uppercase tracking-[0.2em]"
                            >
                                LIMPAR DUPLICITADOS
                            </button>
                        </div>
                    )}
                </section>

                {/* LOGOUT FINAL */}
                <button
                    onClick={handleLogoutApp}
                    className="w-full py-6 text-[12px] font-black text-red-500 bg-red-50 dark:bg-red-950/20 rounded-[32px] uppercase tracking-[0.3em] active:scale-95 transition-all border-2 border-red-100 dark:border-red-950/50 mb-10"
                >
                    <LogOut size={20} className="inline mr-3 mb-1" /> ENCERRAR SESSÃO
                </button>
            </div>
        </motion.div>
    );
};
