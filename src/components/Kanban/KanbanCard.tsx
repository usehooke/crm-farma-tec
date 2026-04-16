import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { User, MapPin, Calendar } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Medico } from '../../hooks/useMedicos';

interface KanbanCardProps {
    medico: Medico;
    onClick?: () => void;
    isDraggingOverlay?: boolean;
}

export const KanbanCard = ({ medico, onClick, isDraggingOverlay }: KanbanCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: medico.id });

    // Helper para formatação segura de data no Card
    const safeFormat = (date: string | undefined | null, formatStr: string, fallback: string) => {
        if (!date) return fallback;
        try {
            const d = new Date(date);
            if (!isValid(d)) return fallback;
            return format(d, formatStr, { locale: ptBR });
        } catch {
            return fallback;
        }
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging && !isDraggingOverlay ? 0.3 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            onClick={(e) => {
                if (isDragging) return;
                onClick?.();
            }}
            className={`group touch-none mb-3 cursor-pointer ${isDraggingOverlay ? 'z-50' : ''}`}
        >
            <motion.div 
                whileHover={{ y: -2 }}
                className={`p-4 rounded-2xl shadow-sm border transition-all ${
                    isDraggingOverlay 
                    ? 'bg-brand-teal text-white border-brand-teal shadow-[0_20px_40px_rgba(45,212,191,0.4)]' 
                    : 'bg-white border-slate-100 hover:border-brand-teal/30 hover:shadow-md'
                }`}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDraggingOverlay ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                        <User size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[11px] font-black truncate ${
                            isDraggingOverlay ? 'text-white' : 'text-brand-dark'
                        }`}>{medico.nome}</h4>
                        <p className={`text-[9px] font-bold uppercase tracking-wider ${
                            isDraggingOverlay ? 'text-white/80' : 'text-brand-teal'
                        }`}>{medico.especialidade}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className={`flex items-center gap-1.5 ${
                        isDraggingOverlay ? 'text-white/70' : 'text-slate-400'
                    }`}>
                        <MapPin size={10} />
                        <span className="text-[9px] font-semibold truncate leading-none">{medico.localizacao}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${
                        isDraggingOverlay ? 'text-white/60' : 'text-slate-300'
                    }`}>
                        <Calendar size={10} />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">
                            {safeFormat(medico.ultimoContato, "dd MMM", "Nunca")}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
