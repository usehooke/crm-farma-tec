import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import type { Medico } from '../../hooks/useMedicos';

interface KanbanColumnProps {
    id: string;
    title: string;
    medicos: Medico[];
}

export const KanbanColumn = ({ id, title, medicos }: KanbanColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className={`flex flex-col w-72 shrink-0 bg-slate-50/50 rounded-3xl p-4 h-full border transition-all duration-200 ${isOver ? 'border-brand-teal/40 bg-brand-teal/5 shadow-inner' : 'border-white/40'}`}>
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
                <span className="text-[10px] font-black bg-white text-brand-teal px-2 py-0.5 rounded-lg shadow-sm border border-slate-50">
                    {medicos.length}
                </span>
            </div>

            <div 
                ref={setNodeRef}
                className="flex-1 overflow-y-auto no-scrollbar min-h-[50px]"
            >
                <SortableContext 
                    id={id}
                    items={medicos.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col">
                        {medicos.map((medico) => (
                            <KanbanCard key={medico.id} medico={medico} />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
};
