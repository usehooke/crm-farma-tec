import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, FileText, CalendarCheck2, User, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { syncVisitaGoogleCalendar, type VisitaEvent } from '../services/googleCalendar';
import type { Medico } from '../hooks/useMedicos';
import { useConfig } from '../context/ConfigContext';
import { generateUUID } from '../utils/utils';
import { toast } from 'sonner';

interface AgendamentoProps {
    medicos: Medico[];
    adicionarLog: (medicoId: string, nota: string) => void;
}

export const Agendamento = ({ medicos, adicionarLog }: AgendamentoProps) => {
    const { googleConectado, eventos, setEventos } = useConfig();

    const [modo, setModo] = useState<'Visita' | 'Evento'>('Visita');

    // Calendar UI State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMedico, setSelectedMedico] = useState('');
    const [tipoVisita, setTipoVisita] = useState('Técnica');

    // Evento State
    const [nomeEvento, setNomeEvento] = useState('');
    const [tipoEvento, setTipoEvento] = useState<'Congresso' | 'Feira' | 'Workshop' | 'Outros'>('Congresso');

    // Shared State
    const [dataAgenda, setDataAgenda] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [horaAgenda, setHoraAgenda] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [syncGoogle, setSyncGoogle] = useState(googleConectado);

    // Helpers Calendário
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const onDateClick = (day: Date) => {
        setSelectedDate(day);
        setDataAgenda(format(day, 'yyyy-MM-dd'));
    };

    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4 } }
    };

    const resetFields = () => {
        setSelectedMedico('');
        setNomeEvento('');
        setDataAgenda('');
        setHoraAgenda('');
        setObservacoes('');
    };

    const handleSave = async () => {
        if (!dataAgenda || !horaAgenda) {
            toast.error('Preencha data e hora.');
            return;
        }

        if (modo === 'Visita') {
            if (!selectedMedico) {
                toast.error('Selecione um médico.');
                return;
            }

            const medicoObj = medicos.find(m => m.id === selectedMedico);
            if (!medicoObj) return;

            const resumoVisita = observacoes ? `Visita ${tipoVisita} agendada. Pauta: ${observacoes}` : `Visita ${tipoVisita} agendada.`;

            // 1. Save Locally
            adicionarLog(selectedMedico, resumoVisita + ` (Para ${dataAgenda} às ${horaAgenda})`);

            // 2. Sync Google
            if (syncGoogle) {
                toast.info('Sincronizando com Google Calendar...', { id: 'sync-google' });

                try {
                    const visitaData: VisitaEvent = {
                        medicoNome: medicoObj.nome,
                        data: dataAgenda,
                        hora: horaAgenda,
                        tipo: tipoVisita,
                        pauta: observacoes,
                        localizacao: medicoObj.localizacao,
                        statusAtual: medicoObj.status,
                        especialidade: medicoObj.especialidade
                    };

                    await syncVisitaGoogleCalendar(visitaData);

                    toast.success('Agendamento criado e sincronizado!', { id: 'sync-google' });
                    resetFields();
                } catch (error: any) {
                    toast.error(error.message || 'Falha ao sincronizar com Google.', { id: 'sync-google' });
                }
            } else {
                toast.success('Agendamento salvo (Offline).');
                resetFields();
            }
        } else {
            // Evento
            if (!nomeEvento) {
                toast.error('Preencha o nome do evento.');
                return;
            }

            const novoEvento = {
                id: generateUUID(),
                titulo: nomeEvento,
                tipo: tipoEvento,
                data: dataAgenda,
                hora: horaAgenda,
                observacoes: observacoes
            };

            setEventos([...eventos, novoEvento]);

            if (syncGoogle) {
                toast.info('Sincronizando evento com Google Calendar...', { id: 'sync-google' });
                try {
                    const eventoData: VisitaEvent = {
                        medicoNome: `[EVENTO] ${nomeEvento}`,
                        data: dataAgenda,
                        hora: horaAgenda,
                        tipo: tipoEvento,
                        pauta: observacoes,
                        localizacao: '', // Could add a field for Event Location later
                        statusAtual: 'Prospecção',
                        especialidade: 'Geral'
                    };
                    await syncVisitaGoogleCalendar(eventoData);
                    toast.success('Evento criado e sincronizado!', { id: 'sync-google' });
                    resetFields();
                } catch (error: any) {
                    toast.error(error.message || 'Falha ao sincronizar com Google.', { id: 'sync-google' });
                }
            } else {
                toast.success('Evento salvo (Offline).');
                resetFields();
            }
        }
    };

    return (
        <motion.div
            className="flex-1 bg-brand-white px-5 pt-8 pb-40"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Agenda</h1>
                <p className="text-sm text-slate-500 mt-1">Sua programação Master.</p>
            </header>

            {/* Componente Calendário Master */}
            <div className="bg-surface rounded-3xl p-5 shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800 mb-8">
                {/* Header Calendário */}
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="p-2 text-slate-500 hover:text-primary transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide">
                        {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                    <button onClick={nextMonth} className="p-2 text-slate-500 hover:text-primary transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Dias da Semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, i) => (
                        <div key={i} className="text-center font-bold text-slate-400 text-xs py-1">
                            {dia}
                        </div>
                    ))}
                </div>

                {/* Grid de Dias */}
                <div className="grid grid-cols-7 gap-1">
                    {(() => {
                        const monthStart = startOfMonth(currentMonth);
                        const monthEnd = endOfMonth(monthStart);
                        const startDate = startOfWeek(monthStart);
                        const endDate = endOfWeek(monthEnd);
                        const rows = [];
                        let days = [];
                        let day = startDate;
                        let formattedDate = '';

                        while (day <= endDate) {
                            for (let i = 0; i < 7; i++) {
                                formattedDate = format(day, 'd');
                                const cloneDay = day;

                                // Verifica Eventos e Visitas para pontinhos
                                const hasEvent = (eventos || []).some(e => e?.data === format(cloneDay, 'yyyy-MM-dd'));
                                const hasVisita = (medicos || []).some(m =>
                                    (m?.logVisitas || []).some(log => log?.data && format(parseISO(log.data), 'yyyy-MM-dd') === format(cloneDay, 'yyyy-MM-dd')) ||
                                    (m?.proximaVisita && m.proximaVisita === format(cloneDay, 'yyyy-MM-dd'))
                                );

                                days.push(
                                    <div
                                        key={day.toString()}
                                        onClick={() => onDateClick(cloneDay)}
                                        className={`relative flex flex-col items-center justify-center h-10 w-10 mx-auto rounded-full cursor-pointer transition-all ${!isSameMonth(day, monthStart)
                                            ? 'text-slate-300 pointer-events-none'
                                            : isSameDay(day, selectedDate)
                                                ? 'bg-primary text-white shadow-[0_4px_10px_rgba(30,95,175,0.4)]'
                                                : isSameDay(day, new Date())
                                                    ? 'bg-brand-teal/10 text-brand-teal font-bold'
                                                    : 'text-brand-dark hover:bg-slate-100'
                                            }`}
                                    >
                                        <span className="text-sm z-10">{formattedDate}</span>
                                        {/* Pontos de Notificação */}
                                        <div className="absolute bottom-1 flex gap-1 z-10">
                                            {hasVisita && <div className={`w-1 h-1 rounded-full ${isSameDay(day, selectedDate) ? 'bg-white' : 'bg-brand-teal'}`} />}
                                            {hasEvent && <div className={`w-1 h-1 rounded-full ${isSameDay(day, selectedDate) ? 'bg-white' : 'bg-pink-400'}`} />}
                                        </div>
                                    </div>
                                );
                                day = addDays(day, 1);
                            }
                            rows.push(<div key={day.toString()} className="contents">{days}</div>);
                            days = [];
                        }
                        return rows;
                    })()}
                </div>
            </div>

            {/* Toggle Modo */}
            <div className="flex bg-surface p-1 rounded-2xl shadow-inner mb-6">
                <button
                    onClick={() => setModo('Visita')}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${modo === 'Visita' ? 'bg-white shadow-sm text-brand-dark' : 'text-slate-400'}`}
                >
                    Visita Médica
                </button>
                <button
                    onClick={() => setModo('Evento')}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${modo === 'Evento' ? 'bg-white shadow-sm text-brand-dark' : 'text-slate-400'}`}
                >
                    Evento Geral
                </button>
            </div>

            <div className="space-y-6">

                <AnimatePresence mode="wait">
                    {modo === 'Visita' ? (
                        <motion.div
                            key="visita-fields"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Seleção de Médico */}
                            <div className="p-5 rounded-2xl bg-surface shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800">
                                <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark mb-2 uppercase tracking-wide">
                                    <User size={14} className="text-brand-teal" /> Médico / Clínica
                                </label>
                                <select
                                    value={selectedMedico}
                                    onChange={(e) => setSelectedMedico(e.target.value)}
                                    className="w-full bg-transparent text-brand-dark font-medium outline-none text-sm"
                                >
                                    <option value="">Selecione um contato...</option>
                                    {medicos.map(m => (
                                        <option key={m.id} value={m.id}>{m.nome} - {m.especialidade}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Seleção Rápida: Tipo de Visita */}
                            <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-3">Tipo de Visita</label>
                                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                                    {['Técnica', 'Relacionamento', 'Follow-up'].map((tipo) => (
                                        <button
                                            key={tipo}
                                            onClick={() => setTipoVisita(tipo)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${tipoVisita === tipo
                                                ? 'bg-primary text-white shadow-[4px_4px_10px_rgba(30,95,175,0.4),-4px_-4px_10px_rgba(255,255,255,0.8)] scale-105'
                                                : 'bg-surface text-slate-500 shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800'
                                                }`}
                                        >
                                            {tipo}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="evento-fields"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Nome do Evento */}
                            <div className="p-5 rounded-2xl bg-surface shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800">
                                <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark mb-2 uppercase tracking-wide">
                                    <Ticket size={14} className="text-brand-teal" /> Nome do Evento
                                </label>
                                <input
                                    type="text"
                                    value={nomeEvento}
                                    onChange={e => setNomeEvento(e.target.value)}
                                    placeholder="Ex: Congresso SBD"
                                    className="w-full bg-transparent text-brand-dark font-medium outline-none text-sm placeholder:text-slate-400"
                                />
                            </div>

                            {/* Seleção Rápida: Tipo de Evento */}
                            <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-3">Tipo de Evento</label>
                                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                                    {['Congresso', 'Feira', 'Workshop', 'Outros'].map((tipo) => (
                                        <button
                                            key={tipo}
                                            onClick={() => setTipoEvento(tipo as any)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${tipoEvento === tipo
                                                ? 'bg-primary text-white shadow-[4px_4px_10px_rgba(30,95,175,0.4),-4px_-4px_10px_rgba(255,255,255,0.8)] scale-105'
                                                : 'bg-surface text-slate-500 shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800'
                                                }`}
                                        >
                                            {tipo}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Card Neumórfico: Data e Hora */}
                <div className="p-5 rounded-2xl bg-surface shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800 flex gap-4">
                    <div className="flex-1">
                        <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark mb-2 uppercase tracking-wide">
                            <Calendar size={14} className="text-brand-teal" /> Data
                        </label>
                        <input
                            type="date"
                            value={dataAgenda}
                            onChange={(e) => setDataAgenda(e.target.value)}
                            className="w-full bg-transparent text-brand-dark font-medium outline-none text-sm"
                        />
                    </div>
                    <div className="w-[1px] bg-slate-200"></div>
                    <div className="flex-1 pl-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark mb-2 uppercase tracking-wide">
                            <Clock size={14} className="text-brand-teal" /> Horário
                        </label>
                        <input
                            type="time"
                            value={horaAgenda}
                            onChange={(e) => setHoraAgenda(e.target.value)}
                            className="w-full bg-transparent text-brand-dark font-medium outline-none text-sm"
                        />
                    </div>
                </div>

                {/* Card Neumórfico: Observações */}
                <div className="p-5 rounded-2xl bg-surface shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800">
                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark mb-2 uppercase tracking-wide">
                        <FileText size={14} className="text-brand-teal" /> {modo === 'Visita' ? 'Pauta da Visita' : 'Detalhes do Evento'}
                    </label>
                    <textarea
                        rows={3}
                        value={observacoes}
                        onChange={e => setObservacoes(e.target.value)}
                        placeholder={modo === 'Visita' ? "Ex: Levar amostras grátis..." : "Ex: Apresentar novo produto no estande..."}
                        className="w-full bg-transparent text-sm text-brand-dark outline-none resize-none placeholder:text-slate-400"
                    ></textarea>
                </div>

                {/* Toggle de Sincronização Google */}
                <div className="flex items-center justify-between px-2 mt-4 pb-20">
                    <span className="text-sm font-medium text-brand-dark flex items-center gap-2">
                        <CalendarCheck2 size={16} className={syncGoogle ? "text-primary" : "text-slate-400"} />
                        Sync Google Calendar
                    </span>
                    <button
                        onClick={() => {
                            if (!googleConectado) {
                                toast.error('Conecte sua conta Google nas configurações primeiro.');
                                return;
                            }
                            setSyncGoogle(!syncGoogle);
                        }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${syncGoogle && googleConectado ? 'bg-brand-teal' : 'bg-slate-300'}`}
                    >
                        <motion.div
                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{ x: (syncGoogle && googleConectado) ? 24 : 0 }}
                        />
                    </button>
                </div>
            </div>

            {/* Fab Base Tela - Posicionado acima do Bottom Nav */}
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-5 z-20">
                <button
                    onClick={handleSave}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-[0_8px_20px_rgba(30,95,175,0.4)] active:scale-95 transition-transform flex justify-center items-center gap-2"
                >
                    Confirmar {modo === 'Visita' ? 'Agendamento' : 'Evento'}
                </button>
            </div>
        </motion.div>
    );
};
