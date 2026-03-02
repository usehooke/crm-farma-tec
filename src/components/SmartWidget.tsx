import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';
import { CheckSquare, CalendarClock, ChevronRight } from 'lucide-react';
import { isToday } from 'date-fns';

export const SmartWidget = React.memo(function SmartWidget() {
    const { notas, eventos } = useConfig();

    const pendingTasksCount = useMemo(() => {
        let count = 0;
        notas.forEach(nota => {
            if (nota.checklist && nota.checklist.length > 0) {
                count += nota.checklist.filter(item => !item.concluido).length;
            } else if (nota.fixada) {
                // Uma nota fixada sem checklist conta como 1 "tarefa/atenção" pendente
                count += 1;
            }
        });
        return count;
    }, [notas]);

    const todayEventsCount = useMemo(() => {
        return eventos.filter((evento: any) => {
            if (!evento.dataOffset) return false;
            const eventDate = new Date(evento.dataOffset);
            return isToday(eventDate);
        }).length;
    }, [eventos]);

    if (pendingTasksCount === 0 && todayEventsCount === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 mx-5 p-4 rounded-2xl bg-gradient-to-br from-brand-teal to-primary shadow-[0_10px_25px_rgba(30,95,175,0.3)] text-white relative overflow-hidden"
        >
            {/* Decoração de Fundo */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-brand-light/20 rounded-full blur-xl"></div>

            <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3">Resumo do Dia</h3>

                <div className="space-y-3">
                    {pendingTasksCount > 0 && (
                        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <CheckSquare size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{pendingTasksCount} Tarefa{pendingTasksCount > 1 ? 's' : ''} Pendente{pendingTasksCount > 1 ? 's' : ''}</p>
                                    <p className="text-[10px] text-white/70">Nos seus Post-its</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-white/50" />
                        </div>
                    )}

                    {todayEventsCount > 0 && (
                        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <CalendarClock size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{todayEventsCount} Evento{todayEventsCount > 1 ? 's' : ''} Hoje</p>
                                    <p className="text-[10px] text-white/70">Na sua Agenda</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-white/50" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});
