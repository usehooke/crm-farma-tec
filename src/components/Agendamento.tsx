import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    CalendarDays,
    Clock,
    MessageSquare,
    Check
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
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';

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

    // Intelligence: Identify days with auto-returns
    const getReturnsForDay = (day: Date) => {
        return medicos.filter(m => m.dataRetorno && isSameDay(new Date(m.dataRetorno), day));
    };

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
            toast.success('Evento criado localmente');
        }
        
        setShowAddModal(false);
        setMedicoId('');
        setDescricao('');
    };

    const medicosOrdenados = useMemo(() => 
        [...medicos]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map(m => ({ value: m.id, label: m.nome })), 
    [medicos]);

    const pageVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 }
    };

    return (
        <motion.div
            className="flex-1 bg-brand-white dark:bg-slate-950 px-5 pt-8 pb-52 shadow-inner min-h-screen"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <header className="mb-8 flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter leading-none">Agenda Elite</h1>
                    <p className="text-[10px] font-black text-brand-teal-400 uppercase tracking-[0.3em] mt-2">Intelligence Planning</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        size="icon" 
                        onClick={() => setView(view === 'month' ? 'day' : 'month')}
                        className="rounded-2xl"
                    >
                        <CalendarDays size={20} />
                    </Button>
                    <Button 
                        size="icon" 
                        onClick={() => setShowAddModal(true)}
                        className="rounded-2xl shadow-lg shadow-brand-teal-400/30"
                    >
                        <Plus size={22} />
                    </Button>
                </div>
            </header>

            {view === 'month' ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-soft-out dark:shadow-none border border-slate-50 dark:border-slate-800"
                >
                    <div className="flex justify-between items-center mb-8 px-2">
                        <h2 className="text-sm font-black text-brand-dark dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-brand-teal-400 rounded-full animate-pulse" />
                            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        </h2>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-slate-400"><ChevronLeft size={18} /></Button>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-slate-400"><ChevronRight size={18} /></Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-4">
                        {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase py-2">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                            const hasReturns = getReturnsForDay(day).length > 0;
                            
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setSelectedDate(day);
                                        if (hasReturns || isToday(day)) setView('day');
                                    }}
                                    className={`
                                        aspect-square flex flex-col items-center justify-center rounded-2xl text-xs font-bold transition-all relative
                                        active:scale-90
                                        ${isSelected ? 'bg-brand-teal-400 text-white shadow-xl shadow-brand-teal-400/20 scale-105 z-10' : ''}
                                        ${!isSelected && isCurrentMonth ? 'text-brand-dark dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800' : ''}
                                        ${!isSelected && !isCurrentMonth ? 'text-slate-200 dark:text-slate-800' : ''}
                                        ${isToday(day) && !isSelected ? 'text-brand-teal-400' : ''}
                                    `}
                                >
                                    {format(day, 'd')}
                                    {hasReturns && !isSelected && (
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-teal-400 rounded-full border border-white dark:border-slate-900" />
                                    )}
                                    {isToday(day) && !isSelected && (
                                        <div className="absolute bottom-1.5 w-1 h-1 bg-brand-teal-400 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="bg-brand-teal-400 p-8 rounded-[40px] text-white shadow-2xl shadow-brand-teal-400/30">
                        <div className="flex justify-between items-start mb-2">
                             <h2 className="text-2xl font-black italic lowercase tracking-tight">
                                {format(selectedDate, "EEEE, dd 'de' MMM", { locale: ptBR })}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setView('month')} className="text-white/80 hover:text-white p-0 h-auto w-auto">
                                <X size={20} />
                            </Button>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Day Intelligence</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4">Itinerário & Retornos</h3>
                        
                        {/* Auto-Return Intelligence Cards */}
                        {getReturnsForDay(selectedDate).map(m => (
                            <div key={`retorno-${m.id}`} className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-soft-out dark:shadow-none border-l-8 border-brand-teal-400 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-teal-400/10 flex flex-col items-center justify-center text-brand-teal-400 shrink-0">
                                    <Clock size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-black text-brand-dark dark:text-white truncate">{m.nome}</h4>
                                        <span className="px-2 py-0.5 bg-brand-teal-400 text-white text-[8px] font-black rounded-full uppercase">Retorno IQ</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate mt-1">
                                        Vencimento configurado no cadastro
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-brand-teal-400">
                                    <MessageSquare size={20} />
                                </Button>
                            </div>
                        ))}

                        {/* Exemplo de Agendamento Vazio ou Listagem real aqui */}
                        {getReturnsForDay(selectedDate).length === 0 && (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                    <CalendarIcon size={32} />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nada planejado para este dia</p>
                                <Button variant="secondary" size="sm" onClick={() => setShowAddModal(true)} className="rounded-full">
                                    Agendar Agora
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            className="bg-brand-white dark:bg-slate-900 w-full max-w-lg rounded-t-[48px] sm:rounded-[48px] shadow-2xl p-10 relative z-10 overflow-hidden border-t border-white/20"
                        >
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8 sm:hidden" />
                            
                            <header className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter italic">Novo Registro</h2>
                                    <p className="text-[10px] font-black text-brand-teal-400 uppercase tracking-widest mt-1">Intelligence Entry</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="rounded-full">
                                    <X size={24} />
                                </Button>
                            </header>

                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
                                <button 
                                    onClick={() => setModo('Visita')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${modo === 'Visita' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-teal-400' : 'text-slate-400'}`}
                                >
                                    Visita
                                </button>
                                <button 
                                    onClick={() => setModo('Evento')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${modo === 'Evento' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-teal-400' : 'text-slate-400'}`}
                                >
                                    Evento
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                                {modo === 'Visita' ? (
                                    <Select 
                                        label="Médico Associado"
                                        value={medicoId}
                                        onChange={(e) => setMedicoId(e.target.value)}
                                        options={[{ value: '', label: 'Selecione o profissional...' }, ...medicosOrdenados]}
                                    />
                                ) : (
                                    <Input 
                                        label="Descrição do Evento"
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        placeholder="Ex: Congresso Elmeco VIP"
                                        leftIcon={MessageSquare}
                                    />
                                )}

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                         <label className="text-xs font-black text-slate-500 dark:text-slate-400 ml-2 uppercase tracking-widest block mb-2">Data</label>
                                         <div className="w-full p-4 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 text-sm font-bold flex items-center gap-3">
                                            <CalendarIcon size={16} /> {format(selectedDate, 'dd/MM/yyyy')}
                                         </div>
                                    </div>
                                    <Input 
                                        label="Horário"
                                        type="time"
                                        value={horario}
                                        onChange={(e) => setHorario(e.target.value)}
                                        leftIcon={Clock}
                                    />
                                </div>

                                <footer className="pt-6 flex gap-4">
                                    <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-14 uppercase text-[10px] tracking-widest">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="flex-[2] h-14 uppercase text-[10px] tracking-widest shadow-xl shadow-brand-teal-400/20">
                                        Confirmar Entry
                                    </Button>
                                </footer>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-lg px-5 z-20">
                <Button
                    onClick={handleSave}
                    className="w-full h-16 rounded-[28px] bg-brand-dark dark:bg-brand-teal-400 text-white font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex justify-center items-center gap-3 border-4 border-white dark:border-slate-900"
                >
                    <Check size={20} />
                    Confirmar {modo === 'Visita' ? 'Agendamento' : 'Evento'}
                </Button>
            </div>
        </motion.div>
    );
};

const X = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
