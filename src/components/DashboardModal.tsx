import { X, Download, TrendingUp, Users, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

// @ts-ignore - Ignore type errors for jsPDF and autotable if any exist
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Medico } from '../hooks/useMedicos';
import { parseISO } from 'date-fns';
import { toast } from 'sonner';

interface DashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    medicos: Medico[];
    tabs: Medico['status'][];
}

const COLORS = ['#94A3B8', '#FCD34D', '#34D399', '#F87171'];

export function DashboardModal({ isOpen, onClose, medicos, tabs }: DashboardModalProps) {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [showChart, setShowChart] = useState(false);

    const totalMedicos = medicos.length;
    const ativos = medicos.filter(m => m.status === 'Parceiro Ativo').length;
    const taxaConversao = totalMedicos > 0 ? ((ativos / totalMedicos) * 100).toFixed(1) : '0';

    const chartData = tabs.map(tab => ({
        name: tab,
        quantidade: medicos.filter(m => m.status === tab).length
    }));

    const duvidasTotal = medicos.reduce((acc, m) => acc + m.logVisitas.length, 0);

    const exportarPNG = async () => {
        if (!dashboardRef.current) return;

        // Mostra Toast de carregamento temporário
        const toastId = toast.loading('Gerando imagem...');

        try {
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2, // Retira blur no mobile
                backgroundColor: '#FAFAF9', // bg-stone-50
                useCORS: true,
            });

            const image = canvas.toDataURL("image/png", 1.0);

            const a = document.createElement("a");
            a.href = image;
            a.download = `Relatorio-FarmaTec-${new Date().toISOString().split('T')[0]}.png`;
            a.click();
            toast.success('Flyer gerado com sucesso!', { id: toastId });
        } catch (e) {
            toast.error('Erro ao gerar a imagem.', { id: toastId });
            console.error(e);
        }
    };

    const gerarPDF = () => {
        const doc = new jsPDF();

        // Configurações e Cabeçalho
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text('Farma Tec Corporativo', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text('Relatório Oficial de Atividades', 14, 30);

        const dataEmissao = new Date().toLocaleDateString('pt-BR');
        doc.setFontSize(9);
        doc.text(`Emitido em: ${dataEmissao}`, 14, 36);

        // Prepara os logs
        const tableBody: any[] = [];
        const todosLogs = medicos.flatMap(m =>
            m.logVisitas.map(log => ({
                medicoNome: m.nome,
                especialidade: m.especialidade,
                data: parseISO(log.data),
                dataStr: new Date(log.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                nota: log.nota
            }))
        );

        todosLogs.sort((a, b) => b.data.getTime() - a.data.getTime());

        todosLogs.forEach(log => {
            // Limita tamanho da nota para caber bem na tabela
            const notaResumida = log.nota.length > 200 ? log.nota.substring(0, 200) + '...' : log.nota;
            tableBody.push([
                log.dataStr,
                log.medicoNome,
                log.especialidade,
                notaResumida
            ]);
        });

        // Configuração do autoTable (Estilo Hooke)
        autoTable(doc, {
            startY: 45,
            head: [['Data', 'Contato', 'Especialidade', 'Registro']],
            body: tableBody,
            headStyles: {
                fillColor: [30, 41, 59], // bg-slate-800
                textColor: 255,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                textColor: [51, 65, 85], // text-slate-700
                fontSize: 9
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252] // bg-slate-50
            },
            styles: {
                cellPadding: 4,
                lineColor: [226, 232, 240], // border-slate-200
                lineWidth: 0.1
            },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 46 },
                2: { cellWidth: 35 },
                3: { cellWidth: 'auto' }
            },
            didDrawPage: (data: any) => {
                // Numeração de página no rodapé
                const str = `Página ${data.pageNumber}`;
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // slate-400
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        const safeDate = new Date().toISOString().split('T')[0];
        doc.save(`Relatorio_Tecnico_${safeDate}.pdf`);
        toast.success('Relatório PDF Gerado com sucesso!');
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
                        className="w-full max-w-[600px] bg-slate-50 min-h-[75vh] max-h-[95vh] sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl relative"
                    >
                        {/* Header Não-Exportável */}
                        <div className="bg-white p-4 border-b border-slate-200 rounded-t-2xl flex justify-between items-center sticky top-0 z-10 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Analytics Avançado</h2>
                                <p className="text-xs text-slate-500">Visão Geral do Funil V3</p>
                            </div>
                            <div className="flex gap-2 flex-wrap sm:flex-nowrap justify-end items-center mt-2 sm:mt-0">
                                <button onClick={gerarPDF} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl text-[11px] font-bold flex items-center shadow-sm active:scale-95 transition-all w-fit">
                                    <FileText size={14} className="mr-1.5 text-elmeco-navy" /> Gerar PDF
                                </button>
                                <button onClick={exportarPNG} className="bg-slate-800 text-white px-3 py-2 rounded-xl text-[11px] font-bold flex items-center shadow-md active:scale-95 transition-all w-fit">
                                    <Download size={14} className="mr-1.5" /> Exportar Flyer
                                </button>
                                <button onClick={onClose} className="p-2 h-[34px] w-[34px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* View do Canvas Exportável */}
                        <div className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50 relative pb-10">
                            <div ref={dashboardRef} className="p-5 flex flex-col gap-5 relative bg-slate-50">

                                {/* Marca d'água invisível a olho, clara no print */}
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                                    <span className="font-black text-slate-800 text-lg tracking-wider uppercase">Farma Tec.</span>
                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 rounded-md font-bold">Relatório Executivo</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3">
                                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                            <Users size={14} className="text-blue-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">Base Total</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-800">{totalMedicos}</p>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3">
                                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                            <TrendingUp size={14} className="text-green-500" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Conversão</span>
                                        </div>
                                        <p className="text-2xl font-black text-green-600">{taxaConversao}%</p>
                                    </div>
                                </div>

                                {/* Toggle Gráfico */}
                                <button
                                    onClick={() => setShowChart(!showChart)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center shadow-sm text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        Distribuição no Funil <span className="text-[10px] font-normal text-slate-400">(&gt; {ativos} Parceiros Ativos)</span>
                                    </span>
                                    {showChart ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>

                                {/* Funil Chart */}
                                <AnimatePresence>
                                    {showChart && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 pt-5 mt-1">
                                                <div className="h-36 w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                            <YAxis hide />
                                                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                                            <Bar dataKey="quantidade" radius={[4, 4, 4, 4]} barSize={28}>
                                                                {chartData.map((_, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Additional Stats / Highlights Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Histórico Vivo</p>
                                            <p className="text-sm font-bold text-slate-700 mt-0.5">{duvidasTotal} anotações</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Última Refrescada</p>
                                            <p className="text-sm font-bold text-slate-700 mt-0.5 uppercase">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
