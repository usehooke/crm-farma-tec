import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Search } from 'lucide-react';
import { usePostIts, PASTEL_COLORS } from '../../hooks/usePostIts';
import { PostItCard } from './PostItCard';
import { generateUUID } from '../../utils/utils';
import type { NotaLivre } from '../../context/ConfigContext';
import { toast } from 'sonner';

export const PostItContainer = ({ isSidebar = false }: { isSidebar?: boolean }) => {
    const { postIts, addPostIt, updatePostIt, removePostIt, togglePin, toggleChecklistItem } = usePostIts();
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formId, setFormId] = useState('');
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [cor, setCor] = useState(PASTEL_COLORS[0]);
    const [checklist, setChecklist] = useState<NotaLivre['checklist']>([]);
    const [novoItem, setNovoItem] = useState('');

    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4 } }
    };

    const notasFiltradas = useMemo(() => {
        let filtradas = postIts;

        if (searchQuery.trim() !== '') {
            const term = searchQuery.toLowerCase();
            filtradas = filtradas.filter(n =>
                n.titulo.toLowerCase().includes(term) ||
                n.conteudo.toLowerCase().includes(term) ||
                (n.checklist && n.checklist.some(item => item.texto.toLowerCase().includes(term)))
            );
        }

        return filtradas.sort((a, b) => {
            if (a.fixada && !b.fixada) return -1;
            if (!a.fixada && b.fixada) return 1;
            return new Date(b.data).getTime() - new Date(a.data).getTime();
        });
    }, [postIts, searchQuery]);

    const handleOpenForm = (nota?: NotaLivre) => {
        if (nota) {
            setFormId(nota.id);
            setTitulo(nota.titulo);
            setConteudo(nota.conteudo);
            setCor(nota.cor || PASTEL_COLORS[0]);
            setChecklist(nota.checklist || []);
        } else {
            setFormId('');
            setTitulo('');
            setConteudo('');
            setCor(PASTEL_COLORS[0]);
            setChecklist([]);
            setNovoItem('');
        }
        setIsEditing(true);
    };

    const handleAddChecklistItem = () => {
        if (!novoItem.trim()) return;
        setChecklist([...(checklist || []), { id: generateUUID(), texto: novoItem, concluido: false }]);
        setNovoItem('');
    };

    const handleRemoveChecklistItem = (id: string) => {
        setChecklist((checklist || []).filter(item => item.id !== id));
    };

    const handleSave = () => {
        if (!titulo && !conteudo && (!checklist || checklist.length === 0)) {
            toast.error('Preencha ao menos o título, conteúdo ou um item da lista.');
            return;
        }

        if (formId) {
            updatePostIt(formId, { titulo, conteudo, cor, checklist });
        } else {
            addPostIt(titulo, conteudo, cor, checklist);
        }
        setIsEditing(false);
    };

    return (
        <motion.div
            className={`flex-1 min-h-screen relative p-5 ${isSidebar ? 'bg-transparent pb-6' : 'bg-brand-white dark:bg-slate-900 pt-8 pb-32'}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <header className="mb-6 sticky top-0 bg-surface/80 dark:bg-slate-900/80 backdrop-blur-md pt-2 z-10 -mx-5 px-5 pb-2">
                <h1 className={`${isSidebar ? 'text-2xl' : 'text-3xl'} font-black text-brand-dark dark:text-white tracking-tight`}>Notas Criativas</h1>
                {!isSidebar && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Seus lembretes e post-its.</p>}
            </header>

            {!isEditing ? (
                <>
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar notas..."
                            className="w-full bg-surface dark:bg-slate-800 py-4 pl-11 pr-4 rounded-2xl text-sm font-bold text-brand-dark dark:text-white shadow-sm border border-slate-100 dark:border-slate-700 outline-none focus:border-brand-teal transition-all"
                        />
                    </div>

                    <div className={`grid gap-6 ${isSidebar ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        <AnimatePresence>
                            {notasFiltradas.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full text-center py-20"
                                >
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Plus className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhuma nota encontrada</p>
                                </motion.div>
                            ) : (
                                (notasFiltradas || []).map(nota => (
                                    <PostItCard
                                        key={nota?.id}
                                        postIt={nota}
                                        onEdit={handleOpenForm}
                                        onDelete={removePostIt}
                                        onTogglePin={togglePin}
                                        onToggleChecklistItem={toggleChecklistItem}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* [FIX]: FAB Center/Bottom for Mobile Accessibility */}
                    <button
                        onClick={() => handleOpenForm()}
                        className={`fixed ${isSidebar ? 'bottom-6 right-6' : 'bottom-28 left-1/2 -translate-x-1/2'} bg-brand-teal text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-brand-teal/30 transition-all active:scale-90 z-[100]`}
                        title="Novo Post-it"
                    >
                        <Plus size={32} />
                    </button>
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto space-y-6"
                >
                    <div className={`p-8 rounded-[32px] shadow-2xl transition-all duration-300 ${cor} border border-black/5`}>
                        <input
                            type="text"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            placeholder="Título da nota..."
                            className="w-full bg-transparent text-2xl font-black text-brand-dark outline-none placeholder:text-brand-dark/20 mb-6"
                        />
                        <textarea
                            rows={6}
                            value={conteudo}
                            onChange={e => setConteudo(e.target.value)}
                            placeholder="O que você está pensando?"
                            className="w-full bg-transparent text-base font-bold text-brand-dark/80 outline-none resize-none placeholder:text-brand-dark/20 leading-relaxed mb-6"
                        ></textarea>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-brand-dark/60 uppercase tracking-widest block">Lista de Tarefas</label>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {(checklist || []).map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex items-center gap-3 bg-black/5 p-3 rounded-xl"
                                        >
                                            <div className={`w-5 h-5 rounded-md border-2 border-brand-dark/30 flex items-center justify-center ${item.concluido ? 'bg-brand-dark' : ''}`}>
                                                {item.concluido && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className={`flex-1 text-sm font-bold ${item.concluido ? 'line-through text-brand-dark/40' : 'text-brand-dark'}`}>{item.texto}</span>
                                            <button onClick={() => handleRemoveChecklistItem(item.id)} className="text-brand-dark/20 hover:text-red-500 transition-colors">
                                                <X size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={novoItem}
                                    onChange={e => setNovoItem(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
                                    placeholder="Adicionar item..."
                                    className="flex-1 bg-white/40 px-4 py-3 rounded-xl text-sm outline-none placeholder:text-brand-dark/30 font-bold border border-transparent focus:border-brand-dark/10"
                                />
                                <button
                                    onClick={handleAddChecklistItem}
                                    className="bg-brand-dark text-white p-3 rounded-xl shadow-lg"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="h-[2px] bg-brand-dark/5 my-8"></div>

                        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                            {PASTEL_COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCor(c)}
                                    className={`w-10 h-10 shrink-0 rounded-2xl ${c} border-4 transition-all ${cor === c ? 'border-brand-dark ring-4 ring-brand-dark/10' : 'border-white/20'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest shadow-xl transition-all"
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] py-5 rounded-2xl bg-brand-teal text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-teal/20 transition-all active:scale-95"
                        >
                            GUARDAR NOTA IQ
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};
