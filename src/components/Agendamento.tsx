import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    User, 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    CheckCircle2,
    CalendarDays,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameDay, 
    isToday,
    startOfWeek,
    endOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMedicos } from '../hooks/useMedicos';
import { toast } from 'sonner';

/**
 * Agendamento Elite v3.0 (@Agent-UX)
 * Agora com estado descentralizado e otimização de renderização.
 */
export const Agendamento = () => {
    const { medicos, adicionarLog } = useMedicos();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'day'>('month');
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Form State
    const [modo, setModo] = useState<'Visita' | 'Evento'>('Visita');
    const [medicoId, setMedicoId] = useState('');
    const [horario, setHorario] = useState('09:00');
    const [descricao, setDescricao] = useState('');

    // Calendar logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const handleSave = () => {
        if (modo === 'Visita') {
            if (!medicoId) {
                toast.error('Selecione um médico');
                return;
            }
            
            adicionarLog(medicoId, `📅 Visita AGENDADA para ${format(selectedDate, "dd/MM 'às' HH:mm")}`, {
                tipo: 'presencial',
                data: selectedDate.toISOString()
            });
            
            toast.success('Agendamento registrado!');
        } else {
            toast.success('Evento criado no calendário local');
        }
        
        setShowAddModal(false);
        setMedicoId('');
        setDescricao('');
    };

    const medicosOrdenados = useMemo(() => 
        [...medicos].sort((a, b) => a.nome.localeCompare(b.nome)), 
    [medicos]);

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <motion.div
            className="flex-1 bg-brand-white px-5 pt-8 pb-40"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-brand-dark tracking-tighter italic">Agenda Elite</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Planejamento Estratégico</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setView(view === 'month' ? 'day' : 'month')}
                        className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-brand-dark active:scale-90 transition-transform"
                    >
                        <CalendarDays size={20} />
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="w-10 h-10 rounded-xl bg-brand-teal text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </header>

            {view === 'month' ? (
                <div className="bg-white rounded-[32px] p-6 shadow-soft-out border border-white">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h2 className="text-sm font-black text-brand-dark uppercase tracking-widest">
                            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        </h2>
                        <div className="flex gap-4">
                            <button onClick={prevMonth} className="text-slate-400 p-1"><ChevronLeft size={20} /></button>
                            <button onClick={nextMonth} className="text-slate-400 p-1"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-4">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-slate-300 py-2">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                            
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setSelectedDate(day);
                                        // setView('day');
                                    }}
                                    className={`
                                        aspect-square flex flex-col items-center justify-center rounded-2xl text-xs font-bold transition-all relative
                                        ${isSelected ? 'bg-brand-teal text-white shadow-lg scale-110 z-10' : ''}
                                        ${!isSelected && isCurrentMonth ? 'text-brand-dark hover:bg-slate-50' : ''}
                                        ${!isSelected && !isCurrentMonth ? 'text-slate-200' : ''}
                                        ${isToday(day) && !isSelected ? 'border-2 border-brand-teal/30 text-brand-teal' : ''}
                                    `}
                                >
                                    {format(day, 'd')}
                                    {isToday(day) && !isSelected && (
                                        <div className="absolute bottom-1 w-1 h-1 bg-brand-teal rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Day View Implementation */}
                    <div className="bg-brand-teal p-6 rounded-[32px] text-white shadow-xl mb-6">
                        <h2 className="text-xl font-black italic">{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</h2>
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1">3 Compromissos Confirmados</p>
                    </div>
                </div>
            )}

            {/* Listagem de Visitas do Dia Selecionado */}
            <div className="mt-8 space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-4">Próximos Passos</h3>
                <div className="bg-white rounded-[32px] p-6 shadow-soft-out border border-white flex items-center gap-4 group active:scale-[0.98] transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-brand-dark shrink-0">
                        <span className="text-xs font-black">09:00</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-brand-dark truncate">Dr. Ricardo Souza</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">Longevidade | Itaim Bibi</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                        <CheckCircle2 size={20} />
                    </div>
                </div>
            </div>

            {/* Modal de Agendamento - Elite v3.0 */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            className="bg-brand-white w-full max-w-lg rounded-t-[48px] sm:rounded-[48px] shadow-2xl p-10 relative z-10 overflow-hidden"
                        >
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 sm:hidden" />
                            <h2 className="text-3xl font-black text-brand-dark mb-8 tracking-tighter italic">Novo Registro</h2>

                            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                                <button 
                                    onClick={() => setModo('Visita')}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${modo === 'Visita' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-400'}`}
                                >
                                    VISITA
                                </button>
                                <button 
                                    onClick={() => setModo('Evento')}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${modo === 'Evento' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-400'}`}
                                >
                                    EVENTO
                                </button>
                            </div>

                            <form className="space-y-6">
                                {modo === 'Visita' ? (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Médico Associado</label>
                                        <select 
                                            value={medicoId}
                                            onChange={(e) => setMedicoId(e.target.value)}
                                            className="w-full p-5 rounded-2xl bg-white border-none shadow-soft-in text-sm font-bold outline-none focus:ring-2 focus:ring-brand-teal/20 appearance-none"
                                        >
                                            <option value="">Selecione o profissional...</option>
                                            {medicosOrdenados.map(m => (
                                                <option key={m.id} value={m.id}>{m.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Descrição do Evento</label>
                                        <input 
                                            type="text" 
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                            placeholder="Ex: Congresso Elmeco VIP"
                                            className="w-full p-5 rounded-2xl bg-white border-none shadow-soft-in text-sm font-bold outline-none focus:ring-2 focus:ring-brand-teal/20"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Data</label>
                                        <div className="w-full p-5 rounded-2xl bg-slate-50 text-slate-500 text-sm font-black flex items-center gap-2">
                                            <CalendarIcon size={16} /> {format(selectedDate, 'dd/MM/yyyy')}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Horário</label>
                                        <input 
                                            type="time" 
                                            value={horario}
                                            onChange={(e) => setHorario(e.target.value)}
                                            className="w-full p-5 rounded-2xl bg-white border-none shadow-soft-in text-sm font-bold outline-none focus:ring-2 focus:ring-brand-teal/20"
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="flex gap-4 mt-10">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-5 rounded-3xl bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-5 rounded-3xl bg-brand-teal text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-teal/20 active:scale-95 transition-all"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Fab Base Tela - Posicionado acima do Bottom Nav (@Agent-UX) */}
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-5 z-20">
                <button
                    onClick={handleSave}
                    className="w-full py-5 rounded-[28px] bg-brand-dark text-white font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex justify-center items-center gap-3"
                >
                    Confirmar {modo === 'Visita' ? 'Agendamento' : 'Evento'}
                </button>
            </div>
        </motion.div>
    );
};
