import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, BookOpen, X, Plus, Trash2, Link, PlayCircle, FileText, Globe } from 'lucide-react';
import { LISTA_PROTOCOLOS, type Protocolo } from '../data/protocolos';
import { useMedicos } from '../hooks/useMedicos';
import { useConfig } from '../context/ConfigContext';
import {
    escutarProtocolos,
    adicionarProtocolo,
    removerProtocolo,
    seedProtocolosIniciais
} from '../services/protocoloService';
import { toast } from 'sonner';

/**
 * Biblioteca de Protocolos e Materiais Elite v3.0 (@Agent-UX)
 * Agora com ergonomia Android reforçada e cards neomórficos premium.
 */
export const Protocolos = () => {
    const { medicos, adicionarLog } = useMedicos();
    const { user } = useConfig();
    const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
    const [busca, setBusca] = useState('');
    const [showShareSheet, setShowShareSheet] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [protocoloSelecionado, setProtocoloSelecionado] = useState<Protocolo | null>(null);

    // Form state for new protocol
    const [novoProtocolo, setNovoProtocolo] = useState({
        titulo: '',
        categoria: 'Hormonal',
        descricao: '',
        pdfUrl: '',
        capaUrl: 'https://images.unsplash.com/photo-1576091160550-217359f4b0d4?auto=format&fit=crop&w=300'
    });

    useEffect(() => {
        if (!user) return;

        const unsubscribe = escutarProtocolos(user.uid, (data) => {
            if (data.length === 0) {
                seedProtocolosIniciais(user.uid, LISTA_PROTOCOLOS);
            } else {
                setProtocolos(data);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const filtrarProtocolos = protocolos.filter(p =>
        p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busca.toLowerCase())
    );

    const medicosRecentes = medicos.slice(0, 5);

    const handleShareClick = (p: Protocolo) => {
        setProtocoloSelecionado(p);
        setShowShareSheet(true);
    };

    const handleAddProtocolo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await adicionarProtocolo(user.uid, novoProtocolo);
            toast.success('Protocolo adicionado com sucesso!');
            setShowAddModal(false);
            setNovoProtocolo({
                titulo: '',
                categoria: 'Hormonal',
                descricao: '',
                pdfUrl: '',
                capaUrl: 'https://images.unsplash.com/photo-1576091160550-217359f4b0d4?auto=format&fit=crop&w=300'
            });
        } catch (error) {
            toast.error('Erro ao adicionar protocolo.');
        }
    };

    const handleDeleteProtocolo = async (id: string) => {
        if (!user) return;
        if (!window.confirm('Tem a certeza que deseja excluir este material?')) return;

        try {
            await removerProtocolo(user.uid, id);
            toast.success('Protocolo removido!');
        } catch (error) {
            toast.error('Erro ao remover protocolo.');
        }
    };

    const getIconForLink = (url: string) => {
        const normalizedUrl = url.toLowerCase();
        if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
            return <PlayCircle size={14} />;
        }
        if (normalizedUrl.includes('.pdf')) {
            return <FileText size={14} />;
        }
        return <Globe size={14} />;
    };

    const dispararWhatsapp = (telefone: string, p: Protocolo, idMedico: string) => {
        adicionarLog(idMedico, `📄 Enviado Protocolo: ${p.titulo} via Biblioteca IQ`, { tipo: 'envio_material' });
        toast.success('Envio registrado no CRM!');

        const msg = window.encodeURIComponent(
            `Olá Dr(a), conforme conversamos na FarmaClinQI, aqui está o material: *${p.titulo}*\n\nLink: ${p.pdfUrl}`
        );
        window.open(`https://api.whatsapp.com/send?phone=${telefone.replace(/\D/g, '')}&text=${msg}`, '_blank');
        setShowShareSheet(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="min-h-screen bg-brand-white dark:bg-slate-950 px-5 pt-8 pb-40"
        >
            <header className="mb-10 max-w-[600px] mx-auto">
                <h1 className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter italic">Biblioteca Elite</h1>
                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-2">Acervo Científico de Alta Performance</p>
            </header>

            <div className="max-w-[600px] mx-auto">
                <div className="relative mb-10">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-teal z-10">
                        <Search size={18} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar material..."
                        className="w-full pl-14 pr-6 py-5 rounded-[28px] bg-white dark:bg-slate-900 shadow-soft-in border-none text-sm font-bold text-brand-dark dark:text-slate-200 focus:ring-2 focus:ring-brand-teal/20 transition-all outline-none"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {filtrarProtocolos.map((p) => (
                        <motion.div
                            key={p.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-[32px] bg-white dark:bg-slate-900 shadow-soft-out border border-white dark:border-slate-800 flex flex-col sm:flex-row gap-6 transition-all group relative"
                        >
                            {/* Capa do Material */}
                            <div className="relative shrink-0">
                                <img src={p.capaUrl} className="w-full sm:w-32 h-40 sm:h-32 rounded-[24px] object-cover shadow-lg" alt={p.titulo} />
                                <div className="absolute top-3 left-3 px-2 py-1 bg-brand-teal text-white text-[8px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                                    {p.categoria}
                                </div>
                            </div>

                            <div className="flex flex-col justify-between flex-1">
                                <div className="mb-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-black text-brand-dark dark:text-white leading-tight mb-2 pr-8">{p.titulo}</h3>
                                        <button
                                            onClick={() => handleDeleteProtocolo(p.id)}
                                            className="p-2 text-slate-200 hover:text-red-500 transition-colors absolute top-6 right-6"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed line-clamp-2">{p.descricao}</p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => window.open(p.pdfUrl, '_blank')}
                                        className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-brand-dark dark:text-slate-200 text-[10px] font-black border border-slate-100 dark:border-slate-700 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                                    >
                                        {getIconForLink(p.pdfUrl)} ACESSAR
                                    </button>
                                    <button
                                        onClick={() => handleShareClick(p)}
                                        className="flex-1 py-4 bg-brand-teal text-white rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 shadow-xl shadow-brand-teal/20 active:scale-95 transition-all"
                                    >
                                        <Send size={14} /> ENVIAR
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {filtrarProtocolos.length === 0 && (
                        <div className="py-20 text-center opacity-40">
                            <BookOpen size={64} className="mx-auto text-slate-300 mb-6" />
                            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Nenhum material encontrado</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contextual FAB - Adicionar Novo Material (@Agent-UX Ergonomics) */}
            <div className="fixed bottom-28 right-8 z-[100] lg:hidden">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-16 h-16 rounded-full bg-brand-dark dark:bg-brand-teal text-white flex items-center justify-center shadow-2xl border-4 border-white active:scale-90 transition-all"
                    title="Adicionar Novo Material"
                >
                    <Plus size={32} strokeWidth={3} />
                </button>
            </div>

            {/* Modal de Adição - Elite v3.0 */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            className="bg-brand-white dark:bg-slate-900 w-full max-w-lg rounded-t-[48px] sm:rounded-[48px] shadow-2xl p-10 relative z-10 overflow-hidden"
                        >
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8 sm:hidden" />
                            <h2 className="text-3xl font-black text-brand-dark dark:text-white mb-8 tracking-tighter italic">Novo Material</h2>

                            <form onSubmit={handleAddProtocolo} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Título do Material</label>
                                    <input
                                        type="text" required
                                        className="w-full p-5 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-soft-in text-sm font-bold outline-none focus:ring-2 focus:ring-brand-teal/20"
                                        value={novoProtocolo.titulo}
                                        onChange={e => setNovoProtocolo({ ...novoProtocolo, titulo: e.target.value })}
                                        placeholder="Ex: Guia de Modulação Hormonal"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Categoria</label>
                                        <select
                                            className="w-full p-5 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-soft-in text-sm font-bold outline-none focus:ring-2 focus:ring-brand-teal/20 appearance-none"
                                            value={novoProtocolo.categoria}
                                            onChange={e => setNovoProtocolo({ ...novoProtocolo, categoria: e.target.value })}
                                        >
                                            <option value="Hormonal">Hormonal</option>
                                            <option value="Emagrecimento">Emagrecimento</option>
                                            <option value="Longevidade">Longevidade</option>
                                            <option value="Estética">Estética</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Link PDF/WEB</label>
                                        <input
                                            type="url" required
                                            className="w-full p-5 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-soft-in text-sm font-bold outline-none focus:ring-2 focus:ring-brand-teal/20"
                                            value={novoProtocolo.pdfUrl}
                                            onChange={e => setNovoProtocolo({ ...novoProtocolo, pdfUrl: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Descrição Breve</label>
                                    <textarea
                                        required
                                        className="w-full p-5 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-soft-in text-sm font-bold outline-none focus:ring-2 focus:ring-brand-teal/20 h-24 resize-none"
                                        value={novoProtocolo.descricao}
                                        onChange={e => setNovoProtocolo({ ...novoProtocolo, descricao: e.target.value })}
                                        placeholder="Principais pontos abordados neste material..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-5 rounded-3xl bg-brand-teal text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-teal/20 active:scale-95 transition-all"
                                    >
                                        Salvar Material
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Share Sheet - Elite v3.0 */}
            <AnimatePresence>
                {showShareSheet && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowShareSheet(false)}
                            className="fixed inset-0 bg-brand-dark/50 z-[105] backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            className="fixed inset-x-0 bottom-0 z-[110] bg-brand-white dark:bg-slate-900 rounded-t-[56px] shadow-2xl p-10 pb-16 border-t border-white/50 dark:border-slate-800"
                        >
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-10" />
                            <h2 className="text-2xl font-black text-brand-dark dark:text-white mb-2 text-center italic tracking-tighter">Enviar ao Médico</h2>
                            <p className="text-[10px] font-black text-slate-400 text-center mb-10 uppercase tracking-[0.2em]">Selecione um contato estratégico</p>

                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                                {medicosRecentes.length > 0 ? (
                                    medicosRecentes.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => protocoloSelecionado && dispararWhatsapp(m.telefone, protocoloSelecionado, m.id)}
                                            className="w-full p-5 rounded-[28px] bg-white dark:bg-slate-800 flex items-center justify-between shadow-soft-out border border-transparent active:border-brand-teal/20 active:scale-[0.98] transition-all group"
                                        >
                                            <div className="text-left">
                                                <p className="text-sm font-black text-brand-dark dark:text-slate-100">{m.nome}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{m.especialidade} | {m.crm}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                                                <Send size={20} />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-12 text-center rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-bold text-slate-400">Nenhum médico recente encontrado.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
