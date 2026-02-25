import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, CalendarCheck2, User } from 'lucide-react';
import { syncVisitaGoogleCalendar, type VisitaEvent } from '../services/googleCalendar';
import type { Medico } from '../hooks/useMedicos';
import { toast } from 'sonner';

interface AgendamentoProps {
    medicos: Medico[];
    adicionarLog: (medicoId: string, nota: string) => void;
}

export const Agendamento = ({ medicos, adicionarLog }: AgendamentoProps) => {

    const [selectedMedico, setSelectedMedico] = useState('');
    const [tipoVisita, setTipoVisita] = useState('Técnica');
    const [dataAgenda, setDataAgenda] = useState('');
    const [horaAgenda, setHoraAgenda] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [syncGoogle, setSyncGoogle] = useState(true);

    // Variantes para a entrada suave da tela
    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4 } }
    };

    const handleSave = async () => {
        if (!selectedMedico || !dataAgenda || !horaAgenda) {
            toast.error('Preencha médico, data e hora.');
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

                toast.success('Agendamento criado e sincronizado com a nuvem!', { id: 'sync-google' });

                // Reset form
                setSelectedMedico('');
                setDataAgenda('');
                setHoraAgenda('');
                setObservacoes('');
            } catch (error: any) {
                toast.error(error.message || 'Falha ao sincronizar com o Google Agenda.', { id: 'sync-google' });
                // Reseta apenas se quiser, mas aqui vou manter os dados caso o usuário queira tentar de novo.
            }
        } else {
            toast.success('Agendamento salvo localmente (Offline).');
            setSelectedMedico('');
            setDataAgenda('');
            setHoraAgenda('');
            setObservacoes('');
        }
    };

    return (
        <motion.div
            className="flex-1 bg-brand-white px-5 pt-8 pb-32"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Agendar</h1>
                <p className="text-sm text-slate-500 mt-1">Defina o próximo ponto de contato.</p>
            </header>

            <div className="space-y-6">

                {/* Seleção de Médico */}
                <div className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]">
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

                {/* Card Neumórfico: Data e Hora */}
                <div className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff] flex gap-4">
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
                    <div className="w-[1px] bg-slate-200"></div> {/* Divisor suave */}
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
                                    : 'bg-surface text-slate-500 shadow-[4px_4px_8px_#e5e5e5,-4px_-4px_8px_#ffffff]'
                                    }`}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card Neumórfico: Observações */}
                <div className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]">
                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark mb-2 uppercase tracking-wide">
                        <FileText size={14} className="text-brand-teal" /> Pauta da Visita
                    </label>
                    <textarea
                        rows={3}
                        value={observacoes}
                        onChange={e => setObservacoes(e.target.value)}
                        placeholder="Ex: Levar amostras grátis e discutir nova dosagem..."
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
                        onClick={() => setSyncGoogle(!syncGoogle)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${syncGoogle ? 'bg-brand-teal' : 'bg-slate-300'}`}
                    >
                        <motion.div
                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{ x: syncGoogle ? 24 : 0 }}
                        />
                    </button>
                </div>
            </div>

            {/* Botão de Ação Flutuante (FAB) na base da tela */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-5 z-10">
                <button
                    onClick={handleSave}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-[0_8px_20px_rgba(30,95,175,0.4)] active:scale-95 transition-transform flex justify-center items-center gap-2"
                >
                    Confirmar Agendamento
                </button>
            </div>
        </motion.div>
    );
};
