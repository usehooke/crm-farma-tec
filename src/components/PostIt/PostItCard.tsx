import { motion } from 'framer-motion';
import { Trash2, Edit3, Pin, PinOff, CheckCircle2, Circle } from 'lucide-react';
import type { NotaLivre } from '../../context/ConfigContext';

interface PostItCardProps {
    postIt: NotaLivre;
    onEdit: (postIt: NotaLivre) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string, currentlyPinned: boolean) => void;
    onToggleChecklistItem: (postItId: string, itemId: string) => void;
}

export const PostItCard = ({ postIt, onEdit, onDelete, onTogglePin, onToggleChecklistItem }: PostItCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-5 rounded-[24px] shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800 relative group transition-all duration-300 ${postIt.cor || 'bg-yellow-100'} ${postIt.fixada ? 'ring-2 ring-brand-teal' : ''}`}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-brand-dark text-lg pr-4 flex items-center gap-2">
                    {postIt.fixada && <Pin size={16} className="text-brand-teal fill-brand-teal transform rotate-45" />}
                    {postIt.titulo}
                </h3>
                <div className="flex gap-2 shrink-0">
                    <button onClick={() => onTogglePin(postIt.id, !!postIt.fixada)} className={`p-1.5 rounded-full bg-white/50 transition-colors ${postIt.fixada ? 'text-brand-teal hover:text-slate-500' : 'text-slate-500 hover:text-brand-teal'}`} title={postIt.fixada ? "Desfixar" : "Fixar"}>
                        {postIt.fixada ? <PinOff size={16} /> : <Pin size={16} />}
                    </button>
                    <button onClick={() => onEdit(postIt)} className="p-1.5 rounded-full bg-white/50 text-slate-500 hover:text-brand-teal transition-colors" title="Editar">
                        <Edit3 size={16} />
                    </button>
                    <button onClick={() => onDelete(postIt.id)} className="p-1.5 rounded-full bg-white/50 text-slate-500 hover:text-red-500 transition-colors" title="Excluir">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {postIt.conteudo && (
                <div className="text-sm text-slate-800/80 font-medium leading-relaxed whitespace-pre-wrap mb-3">
                    {postIt.conteudo}
                </div>
            )}

            {postIt.checklist && postIt.checklist.length > 0 && (
                <div className="space-y-2 mt-4">
                    {(postIt.checklist || []).map(item => (
                        <div
                            key={item?.id}
                            onClick={() => onToggleChecklistItem(postIt.id, item.id)}
                            className="flex items-start gap-2 cursor-pointer group/item"
                        >
                            <div className="mt-0.5 shrink-0 transition-colors duration-200">
                                {item?.concluido ? (
                                    <CheckCircle2 size={16} className="text-brand-teal" />
                                ) : (
                                    <Circle size={16} className="text-slate-400 group-hover/item:text-brand-teal" />
                                )}
                            </div>
                            <span className={`text-sm font-medium transition-all duration-200 ${item?.concluido ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {item?.texto}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="w-full h-[1px] bg-black/5 my-3"></div>
            <p className="text-[10px] text-slate-500/70 font-bold uppercase tracking-wider">
                {new Date(postIt.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
        </motion.div>
    );
};
