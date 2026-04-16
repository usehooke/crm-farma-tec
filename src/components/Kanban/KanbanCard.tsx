import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { User, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Medico } from '../../hooks/useMedicos';

interface KanbanCardProps {
    medico: Medico;
}

export const KanbanCard = ({ medico }: KanbanCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: medico.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            className="group touch-none mb-3"
        >
            <motion.div 
                whileHover={{ y: -2 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-teal/30 hover:shadow-md transition-all active:scale-[0.98]"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-black text-brand-dark truncate">{medico.nome}</h4>
                        <p className="text-[9px] font-bold text-brand-teal uppercase tracking-wider">{medico.especialidade}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin size={10} />
                        <span className="text-[9px] font-semibold truncate leading-none">{medico.localizacao}</span>
                    </div>
                    {medico.ultimoContato && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                            <Calendar size={10} />
                            <span className="text-[8px] font-bold uppercase tracking-tighter">
                                {format(new Date(medico.ultimoContato), "dd MMM", { locale: ptBR })}
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
