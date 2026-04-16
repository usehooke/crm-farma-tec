import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, Calendar, MapPin, Map } from 'lucide-react';
import type { Medico } from '../../hooks/useMedicos';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KanbanCardProps {
    medico: Medico;
    isDraggingOverlay?: boolean;
    onClick?: () => void;
}

/**
 * Card do Médico para o Kanban (@Agent-ComponentSniper)
 * Otimizado para Gesto Mobile de Arraste (Feedback Tátil/Visual)
 */
export const KanbanCard = ({ medico, isDraggingOverlay, onClick }: KanbanCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: medico.id,
        // O sensor de delay de 250ms no Board permite que o card NÃO seja 'touch-none'
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    // Formatação de data ultra-compacta para Kanban
    const compactDate = (date: string | undefined): string => {
        if (!date) return 'S/Visita';
        const d = new Date(date);
        return isValid(d) ? format(d, 'dd MMM', { locale: ptBR }) : '---';
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            onClick={() => {
                // Previne abrir se estiver arrastando
                if (isDragging) return;
                onClick?.();
            }}
            /* 
               [FIX]: Removido 'touch-none' total. 
               O browser agora consegue scrollar a coluna se o toque for rápido. 
               O arraste só ativa após o delay de 250ms.
            */
            className={`
                group bg-white dark:bg-slate-800 p-5 rounded-[22px] border-2 transition-all duration-300 relative
                ${isDraggingOverlay ? 'shadow-2xl ring-4 ring-brand-teal/30 scale-105 border-brand-teal' : 'border-slate-50 dark:border-slate-800 shadow-sm hover:border-brand-teal/30'}
                ${isDragging ? 'z-0' : 'z-10'}
                cursor-grab active:cursor-grabbing
            `}
        >
            <div className="flex flex-col gap-3">
                <header className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isDraggingOverlay ? 'bg-brand-teal text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-400'
                    }`}>
                        <User size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-black text-[13px] text-brand-dark dark:text-white truncate leading-tight">
                            {medico.nome}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <Map size={10} className="text-brand-teal" />
                            {medico.localizacao?.split(',')[0]}
                        </p>
                    </div>
                </header>

                <div className="h-[1px] bg-slate-50 dark:bg-slate-700/50 w-full" />

                <footer className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-brand-teal/60" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                            {compactDate(medico.ultimoContato)}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className={`w-1.5 h-1.5 rounded-full ${medico.status === 'Parceiro Ativo' ? 'bg-brand-teal shadow-[0_0_6px_rgba(45,212,191,0.5)]' : 'bg-amber-500'}`} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            {medico.crm?.split('/')[0] || 'Doc'}
                        </span>
                    </div>
                </footer>
            </div>

            {/* Feedback Visual de Interatividade no Canto */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-teal/40" />
            </div>
        </div>
    );
};
