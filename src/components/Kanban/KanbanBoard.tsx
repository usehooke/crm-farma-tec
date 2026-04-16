import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { Medico } from '../../hooks/useMedicos';

interface KanbanBoardProps {
    medicos: Medico[];
    onAtualizarMedico: (id: string, updates: Partial<Medico>) => void;
    onSelectMedico?: (id: string) => void;
}

const COLUMNS = [
    { id: 'Prospecção', title: '📊 Prospecção' },
    { id: 'Apresentada', title: '🤝 Apresentada' },
    { id: 'Parceiro Ativo', title: '⭐ Parceiro Ativo' },
    { id: 'Monitoramento', title: '🔍 Monitoramento' },
];

export const KanbanBoard = ({ medicos, onAtualizarMedico, onSelectMedico }: KanbanBoardProps) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                // [FIX]: Long Press (250ms) para mobile. 
                // Permite o scroll nativo ao deslizar e o drag apenas ao segurar.
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const medicoId = active.id as string;
        const newStatus = over.id as string;

        const medico = medicos.find(m => m.id === medicoId);
        
        if (medico && medico.status !== newStatus && COLUMNS.some(c => c.id === newStatus)) {
            onAtualizarMedico(medicoId, { status: newStatus as any });
        }

        setActiveId(null);
    };

    const getMedicosByStatus = (status: string) => {
        return medicos.filter(m => m.status === status);
    };

    const activeMedico = activeId ? medicos.find(m => m.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 h-full p-4 overflow-x-auto no-scrollbar lg:justify-start touch-pan-y">
                {COLUMNS.map((col) => (
                    <KanbanColumn 
                        key={col.id} 
                        id={col.id} 
                        title={col.title} 
                        medicos={getMedicosByStatus(col.id)} 
                        onSelectMedico={onSelectMedico}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: '0.4',
                        },
                    },
                }),
            }}>
                {activeMedico ? (
                    <div className="scale-110 rotate-2 cursor-grabbing">
                        <KanbanCard 
                            medico={activeMedico} 
                            isDraggingOverlay 
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
