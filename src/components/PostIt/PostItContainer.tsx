import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Search, ListPlus } from 'lucide-react';
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
            className={`flex-1 min-h-screen relative p-5 ${isSidebar ? 'bg-transparent pb-6' : 'bg-brand-white pt-8 pb-32'}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <header className="mb-6 sticky top-0 bg-surface/80 backdrop-blur-md pt-2 z-10 -mx-5 px-5 pb-2">
                <h1 className={`${isSidebar ? 'text-2xl' : 'text-3xl'} font-bold text-brand-dark tracking-tight`}>Post-its</h1>
                {!isSidebar && <p className="text-sm text-slate-500 mt-1">Sua parede virtual de notas coloridas.</p>}
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
                            placeholder="Buscar ideias, dicas..."
                            className="w-full bg-surface py-3 pl-11 pr-4 rounded-full text-sm font-medium text-brand-dark shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800 outline-none border border-transparent focus:border-brand-teal/30 focus:shadow-none transition-all"
                        />
                    </div>

                    <div className={`grid gap-4 ${isSidebar ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        <AnimatePresence>
                            {notasFiltradas.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full text-center py-10"
                                >
                                    <p className="text-slate-400 font-medium">Nenhum post-it encontrado.</p>
                                    <p className="text-sm text-slate-400 mt-2">Clique no botão abaixo para criar.</p>
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

                    <button
                        onClick={() => handleOpenForm()}
                        className={`fixed ${isSidebar ? 'bottom-6 right-6' : 'bottom-24 right-6'} bg-brand-teal hover:bg-opacity-90 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(45,212,191,0.4)] transition-all active:scale-95 z-40`}
                        title="Novo Post-it"
                    >
                        <Plus size={28} />
                    </button>
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className={`p-6 rounded-[24px] shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800 transition-colors duration-300 ${cor}`}>
                        <input
                            type="text"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            placeholder="Título do Post-it..."
                            className="w-full bg-transparent text-xl font-bold text-brand-dark outline-none placeholder:text-brand-dark/40 mb-4"
                        />
                        <div className="w-full h-[1px] bg-brand-dark/10 mb-4"></div>
                        <textarea
                            rows={4}
                            value={conteudo}
                            onChange={e => setConteudo(e.target.value)}
                            placeholder="Escreva sua nota livre aqui (opcional se usar checklist)..."
                            className="w-full bg-transparent text-sm font-medium text-brand-dark/80 outline-none resize-none placeholder:text-brand-dark/40 leading-relaxed mb-4"
                        ></textarea>

                        <div className="mb-4">
                            <label className="text-xs font-bold text-brand-dark/70 uppercase tracking-wider mb-2 block">Checklist</label>
                            <div className="space-y-2 mb-3">
                                <AnimatePresence>
                                    {(checklist || []).map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <div className={`w-4 h-4 rounded-full border border-brand-dark/30 flex items-center justify-center ${item.concluido ? 'bg-brand-dark/20' : ''}`} />
                                            <span className={`flex-1 text-sm font-medium ${item.concluido ? 'line-through text-brand-dark/50' : 'text-brand-dark/80'}`}>{item.texto}</span>
                                            <button onClick={() => handleRemoveChecklistItem(item.id)} className="text-brand-dark/40 hover:text-red-500/80 p-1">
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={novoItem}
                                    onChange={e => setNovoItem(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
                                    placeholder="Novo item da lista..."
                                    className="flex-1 bg-white/40 px-3 py-2 rounded-xl text-sm outline-none placeholder:text-brand-dark/40 font-medium border border-transparent focus:border-brand-dark/20"
                                />
                                <button
                                    onClick={handleAddChecklistItem}
                                    className="bg-brand-dark/10 hover:bg-brand-dark/20 text-brand-dark p-2 rounded-xl transition-colors"
                                >
                                    <ListPlus size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-brand-dark/10 my-4"></div>

                        <div className="flex gap-2 mb-2 overflow-x-auto pb-2 hide-scrollbar">
                            {PASTEL_COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCor(c)}
                                    className={`w-8 h-8 rounded-full ${c} shadow-sm border-2 transition-all ${cor === c ? 'border-brand-dark/50 scale-110' : 'border-black/5 hover:scale-110'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-4 rounded-2xl bg-surface text-brand-dark font-bold shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800 active:scale-95 transition-transform flex justify-center items-center gap-2"
                        >
                            <X size={20} /> Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-4 rounded-2xl bg-brand-teal text-white font-bold shadow-[0_8px_20px_rgba(45,212,191,0.4)] active:scale-95 transition-transform flex justify-center items-center gap-2"
                        >
                            <Check size={20} /> Salvar
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};
