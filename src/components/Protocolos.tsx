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
                // Se estiver vazio, podemos opcionalmente carregar o seed inicial
                // Para não ser intrusivo, apenas mostramos a lista vazia ou fazemos o seed automático
                // Vamos fazer o seed automático para garantir que ela comece com algo se for a primeira vez
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
            return <PlayCircle size={12} />;
        }
        if (normalizedUrl.includes('.pdf')) {
            return <FileText size={12} />;
        }
        return <Globe size={12} />;
    };

    const dispararWhatsapp = (telefone: string, p: Protocolo, idMedico: string) => {
        adicionarLog(idMedico, `📄 Enviado Protocolo: ${p.titulo} via Biblioteca IQ`, 'envio_material');
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
            className="min-h-screen bg-brand-white dark:bg-slate-950 px-5 pt-8 pb-32"
        >
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter">Biblioteca IQ</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Materiais científicos e protocolos Elmeco.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                >
                    <Plus size={24} />
                </button>
            </header>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por tema ou categoria..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface dark:bg-slate-900 shadow-inner dark:shadow-none border-none text-sm text-brand-dark dark:text-slate-200 focus:ring-2 focus:ring-brand-teal/20 transition-all outline-none"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filtrarProtocolos.map((p) => (
                    <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-3xl bg-surface dark:bg-slate-900 shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff] dark:shadow-none border border-white/40 dark:border-slate-800 flex gap-4 transition-colors relative group"
                    >
                        <img src={p.capaUrl} className="w-24 h-24 rounded-2xl object-cover shadow-sm" alt={p.titulo} />

                        <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                            <div>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black uppercase text-brand-teal tracking-widest">{p.categoria}</span>
                                    <button
                                        onClick={() => handleDeleteProtocolo(p.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <h3 className="text-sm font-bold text-brand-dark dark:text-white leading-tight mt-1 truncate">{p.titulo}</h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{p.descricao}</p>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => window.open(p.pdfUrl, '_blank')}
                                    className="flex-1 py-2 bg-brand-white dark:bg-slate-800 rounded-xl text-brand-dark dark:text-slate-200 text-[10px] font-black border border-slate-100 dark:border-slate-700 flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                                >
                                    {getIconForLink(p.pdfUrl)} VER MATERIAL
                                </button>
                                <button
                                    onClick={() => handleShareClick(p)}
                                    className="flex-1 py-2 bg-primary text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 shadow-md shadow-primary/20 active:scale-95 transition-all"
                                >
                                    <Send size={12} /> ENVIAR
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filtrarProtocolos.length === 0 && (
                    <div className="py-20 text-center">
                        <BookOpen size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                        <p className="text-slate-400 dark:text-slate-600 font-bold uppercase text-xs tracking-widest">Nenhum protocolo encontrado</p>
                    </div>
                )}
            </div>

            {/* Modal de Adição Neumórfico */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-surface dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-2xl p-8 relative z-10 overflow-hidden"
                        >
                            <h2 className="text-2xl font-black text-brand-dark dark:text-white mb-6 tracking-tight italic">Novo Material IQ</h2>

                            <form onSubmit={handleAddProtocolo} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Título</label>
                                    <input
                                        type="text" required
                                        className="w-full p-4 rounded-2xl bg-brand-white dark:bg-slate-800 border-none shadow-inner text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={novoProtocolo.titulo}
                                        onChange={e => setNovoProtocolo({ ...novoProtocolo, titulo: e.target.value })}
                                        placeholder="Ex: Protocolo de Longevidade"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Categoria</label>
                                        <input
                                            list="categorias-padrão"
                                            className="w-full p-4 rounded-2xl bg-brand-white dark:bg-slate-800 border-none shadow-inner text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                            value={novoProtocolo.categoria}
                                            onChange={e => setNovoProtocolo({ ...novoProtocolo, categoria: e.target.value })}
                                            placeholder="Selecione ou digite..."
                                        />
                                        <datalist id="categorias-padrão">
                                            <option value="Hormonal" />
                                            <option value="Emagrecimento" />
                                            <option value="Longevidade" />
                                            <option value="Estética" />
                                            <option value="Outros" />
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Capa (Opcional)</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 rounded-2xl bg-brand-white dark:bg-slate-800 border-none shadow-inner text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                            value={novoProtocolo.capaUrl}
                                            onChange={e => setNovoProtocolo({ ...novoProtocolo, capaUrl: e.target.value })}
                                            placeholder="URL da Imagem"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Resumo</label>
                                    <textarea
                                        required
                                        className="w-full p-4 rounded-2xl bg-brand-white dark:bg-slate-800 border-none shadow-inner text-sm outline-none focus:ring-2 focus:ring-primary/20 h-24 resize-none"
                                        value={novoProtocolo.descricao}
                                        onChange={e => setNovoProtocolo({ ...novoProtocolo, descricao: e.target.value })}
                                        placeholder="Breve descrição do material..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Link do Material (PDF, Site ou Vídeo)</label>
                                    <div className="relative">
                                        <Link size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="url" required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-brand-white dark:bg-slate-800 border-none shadow-inner text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                            value={novoProtocolo.pdfUrl}
                                            onChange={e => setNovoProtocolo({ ...novoProtocolo, pdfUrl: e.target.value })}
                                            placeholder="https://youtube.com/... ou site..."
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-sm active:scale-95 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                    >
                                        Salvar Material
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Share Sheet (Bottom Drawer) */}
            <AnimatePresence>
                {showShareSheet && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowShareSheet(false)}
                            className="fixed inset-0 bg-black/40 z-[105] backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 z-[110] bg-surface dark:bg-slate-900 rounded-t-[40px] shadow-[-10px_-10px_30px_rgba(0,0,0,0.1)] p-8 border-t border-white dark:border-slate-800"
                        >
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />
                            <h2 className="text-xl font-black text-brand-dark dark:text-white mb-1 text-center italic tracking-tighter">Enviar ao Médico</h2>
                            <p className="text-xs text-slate-500 text-center mb-6">Escolha um contato da sua base FarmaClinIQ</p>

                            <div className="space-y-3 max-h-68 overflow-y-auto pr-2 custom-scrollbar">
                                {medicosRecentes.length > 0 ? (
                                    medicosRecentes.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => protocoloSelecionado && dispararWhatsapp(m.telefone, protocoloSelecionado, m.id)}
                                            className="w-full p-4 rounded-2xl bg-brand-white dark:bg-slate-800 flex items-center justify-between shadow-sm active:bg-slate-50 dark:active:bg-slate-700 border border-slate-50 dark:border-slate-700 transition-all group"
                                        >
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-brand-dark dark:text-slate-200 group-active:text-primary">{m.nome}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{m.especialidade}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal shadow-inner">
                                                <Send size={16} />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-8 text-center bg-brand-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <p className="text-xs text-slate-400">Nenhum médico cadastrado para envio rápido.</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowShareSheet(false)}
                                className="w-full mt-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <X size={16} /> Cancelar
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
