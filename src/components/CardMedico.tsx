import { differenceInDays, parseISO } from 'date-fns';
import { Phone, Clock, FileText, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Medico } from '../hooks/useMedicos';
import { AVAILABLE_TAGS } from './FormMedico';

interface CardMedicoProps {
    medico: Medico;
    onUpdateStatus: (id: string, newStatus: Medico['status']) => void;
    onViewHistory: (medico: Medico) => void;
}

export function CardMedico({ medico, onUpdateStatus, onViewHistory }: CardMedicoProps) {
    const daysSince = medico.ultimoContato
        ? differenceInDays(new Date(), parseISO(medico.ultimoContato))
        : 999;

    const isUrgent = daysSince > 30;
    const isWarning = medico.status === 'Apresentada' && daysSince > 7 && !isUrgent;

    const zapLink = `https://wa.me/${medico.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Olá, Dr(a). ${medico.nome}! Tudo bem? Gostaria de saber como estão os protocolos Elmeco.`
    )}`;

    const callLink = `tel:${medico.telefone.replace(/\D/g, '')}`;

    let borderClass = "border-slate-200";
    if (isUrgent) borderClass = "border-red-400";
    if (isWarning) borderClass = "border-yellow-400";

    const getStatusColor = (status: Medico['status']) => {
        switch (status) {
            case 'Prospecção': return 'bg-slate-100 text-slate-700';
            case 'Apresentada': return 'bg-orange-50 text-orange-700';
            case 'Parceiro Ativo': return 'bg-blue-50 text-blue-700';
            case 'Monitoramento': return 'bg-red-50 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`border-[1.5px] p-4 rounded-xl bg-white shadow-sm mb-3 transition-all hover:shadow-md ${borderClass}`}
        >
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-100/80 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-slate-200">
                            {medico.especialidade}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1">{medico.nome}</h3>
                    {medico.localizacao && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{medico.localizacao}</p>
                    )}

                    {/* Exibição de Tags VIPs */}
                    {medico.tags && medico.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {medico.tags.map(tagId => {
                                const tagData = AVAILABLE_TAGS.find(t => t.id === tagId);
                                if (!tagData) return null;
                                return (
                                    <span key={tagId} className={`text-[9px] px-1.5 py-0.5 rounded font-bold border uppercase tracking-wider ${tagData.cor}`}>
                                        {tagData.label}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>

                <select
                    value={medico.status}
                    onChange={(e) => onUpdateStatus(medico.id, e.target.value as Medico['status'])}
                    className={`${getStatusColor(medico.status)} font-medium text-[11px] px-2 py-1.5 rounded-lg focus:ring-0 cursor-pointer border-none outline-none text-center shadow-sm appearance-none min-w-[100px]`}
                    title="Alterar Status"
                >
                    <option value="Prospecção">Prospecção</option>
                    <option value="Apresentada">Apresentada</option>
                    <option value="Parceiro Ativo">Parceiro Ativo</option>
                    <option value="Monitoramento">Monitoramento</option>
                </select>
            </div>

            {/* Alertas Visuais */}
            {isUrgent && (
                <div className="mt-3 text-[11px] font-bold text-red-600 bg-red-50/80 px-3 py-2 rounded-lg border border-red-100 flex items-center shadow-sm">
                    <Clock size={14} className="mr-1.5 shrink-0" /> Contato atrasado há muito tempo (&gt;30d)
                </div>
            )}

            {isWarning && (
                <div className="mt-3 text-[11px] font-bold text-yellow-700 bg-yellow-50/80 px-3 py-2 rounded-lg border border-yellow-200 flex items-center shadow-sm animate-pulse-slow">
                    <FileText size={14} className="mr-1.5 shrink-0" /> Cutucar com dúvida técnica (Apresentado há {daysSince}d)
                </div>
            )}

            {/* Resumo Rápido da Timeline */}
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    <Clock size={12} className="mr-1" />
                    {daysSince === 0 ? 'Contatado hoje' :
                        daysSince === 1 ? 'Ontem' :
                            daysSince > 900 ? 'Nunca contatado' : `Há ${daysSince} dias`}
                </div>

                <div className="text-[10px] text-slate-400 font-medium">
                    {medico.logVisitas.length} log(s)
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <a
                    href={callLink}
                    className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 w-10 h-10 flex items-center justify-center rounded-lg transition-colors border border-slate-200"
                    title="Ligar (Telefone)"
                >
                    <Smartphone size={18} />
                </a>
                <a
                    href={zapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center flex items-center justify-center h-10 rounded-lg text-sm font-bold transition-all shadow-sm shadow-green-200"
                >
                    <Phone size={14} className="mr-1.5" />
                    WhatsApp
                </a>
                <button
                    onClick={() => onViewHistory(medico)}
                    className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 h-10 rounded-lg text-sm font-bold transition-all shadow-sm"
                >
                    Ver Histórico
                </button>
            </div>
        </motion.div>
    );
}
