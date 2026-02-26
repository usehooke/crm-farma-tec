import { differenceInDays, parseISO } from 'date-fns';
import { Phone, Clock, FileText, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Medico } from '../hooks/useMedicos';
import { useConfig } from '../context/ConfigContext';

interface CardMedicoProps {
    medico: Medico;
    onUpdateStatus: (id: string, newStatus: Medico['status']) => void;
    onViewHistory: (medico: Medico) => void;
}

export function CardMedico({ medico, onUpdateStatus, onViewHistory }: CardMedicoProps) {
    const { vipTags } = useConfig();
    const daysSince = medico.ultimoContato
        ? differenceInDays(new Date(), parseISO(medico.ultimoContato))
        : 999;

    // Helper to get initials for the avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

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
            className={`p-4 rounded-2xl bg-brand-white mb-4 transition-all shadow-[5px_5px_15px_#f2f2f2,-5px_-5px_15px_#ffffff] hover:shadow-[8px_8px_20px_#ebebeb,-8px_-8px_20px_#ffffff] ${borderClass !== 'border-slate-200' ? `border ${borderClass}` : 'border border-transparent'}`}
        >
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200 shadow-sm relative">
                    {getInitials(medico.nome)}
                    {/* Indicador de Status Simples (bolinha) associado ao avatar? Ou mantemos no seletor? Manteremos o seletor. */}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                            <h3 className="font-bold text-brand-dark text-[15px] leading-tight line-clamp-1">{medico.nome}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-slate-500 text-[11px] font-medium truncate">
                                    {medico.especialidade}
                                </span>
                                {medico.localizacao && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-500 text-[11px] truncate">
                                            {medico.localizacao}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* WhatsApp Flutuante Menor */}
                        <a
                            href={zapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 bg-primary hover:bg-opacity-90 text-white w-8 h-8 flex items-center justify-center rounded-full transition-all shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff]"
                            title="Conversar no WhatsApp"
                        >
                            <Phone size={14} className="fill-current" />
                        </a>
                    </div>

                    {/* Exibição de Tags VIPs */}
                    {medico.tags && medico.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {medico.tags.map(tagId => {
                                const tagData = vipTags.find(t => t.id === tagId);
                                if (!tagData) return null;
                                return (
                                    <span key={tagId} className={`text-[9px] px-1.5 py-0.5 rounded font-bold border uppercase tracking-wider ${tagData.color}`}>
                                        {tagData.name}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
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

            {/* Linha de Ações Inferior Minimalista */}
            <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <select
                    value={medico.status}
                    onChange={(e) => onUpdateStatus(medico.id, e.target.value as Medico['status'])}
                    className={`${getStatusColor(medico.status)} font-semibold text-[10px] px-2 py-1 rounded-lg focus:ring-0 cursor-pointer border-none outline-none text-center appearance-none min-w-[90px]`}
                    title="Alterar Status"
                >
                    <option value="Prospecção">Prospecção</option>
                    <option value="Apresentada">Apresentada</option>
                    <option value="Parceiro Ativo">Parceiro Ativo</option>
                    <option value="Monitoramento">Monitoramento</option>
                </select>

                <div className="flex gap-1.5">
                    <a
                        href={callLink}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-600 w-7 h-7 flex items-center justify-center rounded-lg transition-colors border border-slate-200"
                        title="Ligar (Telefone)"
                    >
                        <Smartphone size={14} />
                    </a>
                    <button
                        onClick={() => onViewHistory(medico)}
                        className="bg-brand-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 h-7 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                        Histórico
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
