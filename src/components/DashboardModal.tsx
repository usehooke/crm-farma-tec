import { X, Download, TrendingUp, Users, FileText, Star, Smartphone, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import html2canvas from 'html2canvas';

// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Medico } from '../hooks/useMedicos';
import { parseISO } from 'date-fns';
import { toast } from 'sonner';
import { calcularStatsMensais } from '../utils/stats';

interface DashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    medicos: Medico[];
    tabs: Medico['status'][];
}

const COLORS = ['#94A3B8', '#FCD34D', '#10B981', '#F87171'];

export function DashboardModal({ isOpen, onClose, medicos, tabs }: DashboardModalProps) {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const stats = calcularStatsMensais(medicos);
    const totalMedicos = medicos.length;
    const todayStr = new Date().toISOString().split('T')[0];
    const medicosHoje = medicos.filter(m => m.dataRetorno === todayStr);

    const chartData = tabs.map(tab => ({
        name: tab,
        quantidade: medicos.filter(m => m.status === tab).length
    }));

    const exportarPNG = async () => {
        if (!dashboardRef.current) return;
        const toastId = toast.loading('Gerando imagem...');
        try {
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                backgroundColor: '#FAFAF9',
                useCORS: true,
            });
            const image = canvas.toDataURL("image/png", 1.0);
            const a = document.createElement("a");
            a.href = image;
            a.download = `IQ-Insights-${new Date().toISOString().split('T')[0]}.png`;
            a.click();
            toast.success('Dashboard exportado!', { id: toastId });
        } catch (e) {
            toast.error('Erro ao gerar imagem.', { id: toastId });
        }
    };

    const gerarPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(19, 78, 74);
        doc.text('FarmaClinQI Insights', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text('Relatório Mensal de Performance e Engajamento Científico', 14, 30);

        doc.setFontSize(9);
        doc.text(`Emitido: ${new Date().toLocaleDateString('pt-BR')} | Base: ${totalMedicos} Médicos`, 14, 36);

        autoTable(doc, {
            startY: 45,
            head: [['KPI', 'Valor', 'Impacto']],
            body: [
                ['Alcance Científico', stats.alcanceCientifico.toString(), 'Protocolos Enviados'],
                ['Frequência Visitação', stats.frequenciaVisitacao.toString(), 'Visitas Realizadas'],
                ['Top Interesse', stats.protocoloMaisEnviado, 'Material mais buscado'],
                ['Taxa de Engajamento', `${stats.taxaEngajamento.toFixed(1)}%`, 'Conversão de Material']
            ],
            theme: 'striped',
            headStyles: { fillColor: [19, 78, 74] }
        });

        const tableBody: any[] = [];
        const todosLogs = medicos.flatMap(m =>
            m.logVisitas.map(log => ({
                medicoNome: m.nome,
                data: parseISO(log.data),
                dataStr: new Date(log.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                nota: log.nota,
                isProtocolo: log.nota.includes('📄')
            }))
        );

        todosLogs.sort((a, b) => b.data.getTime() - a.data.getTime());

        todosLogs.forEach(log => {
            tableBody.push([
                log.dataStr,
                log.medicoNome,
                log.isProtocolo ? 'ENVIO PROTOCOLO' : 'VISITA',
                log.nota
            ]);
        });

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Data', 'Contato', 'Tipo', 'Descrição']],
            body: tableBody,
            headStyles: { fillColor: [30, 41, 59] },
            didParseCell: (data) => {
                if (data.row.cells[2].text[0] === 'ENVIO PROTOCOLO') {
                    data.cell.styles.textColor = [19, 78, 74];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        doc.save(`IQ_Insights_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Relatório PDF Gerado!');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end sm:items-center">
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="w-full max-w-[600px] bg-slate-50 dark:bg-slate-950 min-h-[75vh] max-h-[95vh] sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl relative"
                    >
                        <div className="bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl flex justify-between items-center sticky top-0 z-10 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight italic">IQ Insights</h2>
                                <p className="text-xs text-slate-500">Inteligência Médica Elmeco</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={gerarPDF} className="p-2.5 bg-brand-teal/10 text-brand-teal rounded-xl hover:bg-brand-teal/20 transition-all">
                                    <FileText size={18} />
                                </button>
                                <button onClick={onClose} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50 dark:bg-slate-950 p-5 space-y-5">
                            <div ref={dashboardRef} className="space-y-5 bg-slate-50 dark:bg-slate-950 p-1">

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                                                <TrendingUp size={16} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Mensal</span>
                                        </div>
                                        <p className="text-3xl font-black text-brand-dark dark:text-white">
                                            {medicos.filter(m => m.logVisitas.length > 0).length}<span className="text-slate-300 text-lg font-normal">/50</span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1">Visitas vs Meta Ariani</p>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Users size={16} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ranking</span>
                                        </div>
                                        <p className="text-3xl font-black text-primary">TOP 50</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Carteira SP Unificada</p>
                                    </div>
                                </div>

                                <div className="bg-brand-dark dark:bg-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden text-left">
                                    <div className="relative z-10">
                                        <span className="text-[10px] font-black text-brand-teal uppercase tracking-[0.2em]">Consultora Responsável</span>
                                        <h3 className="text-xl font-bold mt-1 mb-4 italic line-clamp-1">Ariani - Performance SP</h3>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-2xl font-black text-brand-teal">{stats.frequenciaVisitacao}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Interações</p>
                                            </div>
                                            <div className="w-px h-8 bg-slate-700" />
                                            <div>
                                                <p className="text-2xl font-black text-white">{totalMedicos}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Médicos na Carteira</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <TrendingUp size={120} />
                                    </div>
                                </div>

                                {/* Motor de Retenção - Agenda Diária */}
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-200 dark:border-amber-800 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-sm">
                                                <Star size={16} className="fill-current" />
                                            </div>
                                            <h4 className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Agenda de Hoje</h4>
                                        </div>
                                        <div className="px-3 py-1 bg-amber-200 dark:bg-amber-800 rounded-full text-[9px] font-bold text-amber-800 dark:text-amber-200">
                                            {medicosHoje.length} PENDENTES
                                        </div>
                                    </div>

                                    {medicosHoje.length > 0 ? (
                                        <div className="space-y-2">
                                            {medicosHoje.map(m => (
                                                <div key={m.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-amber-100">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-800 dark:text-white">{m.nome}</span>
                                                        <span className="text-[9px] text-slate-500 uppercase">{m.especialidade}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a href={`tel:${m.telefone.replace(/\D/g, '')}`} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                                            <Smartphone size={14} />
                                                        </a>
                                                        <a href={`https://wa.me/${m.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-all">
                                                            <Phone size={14} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-amber-200">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase italic tracking-widest">Nenhuma visita agendada para hoje</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Evolução do Funil</h4>
                                    <div className="h-40 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <XAxis dataKey="name" hide />
                                                <Tooltip
                                                    cursor={{ fill: 'transparent' }}
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                />
                                                <Bar dataKey="quantidade" radius={[10, 10, 10, 10]} barSize={40}>
                                                    {chartData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        {chartData.map((d, i) => (
                                            <div key={i} className="text-center">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{d.name.split(' ')[0]}</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.quantidade}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button onClick={exportarPNG} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                                <Download size={18} /> Exportar Painel de Visita
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

