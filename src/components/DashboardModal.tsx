import { X, Download, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Medico } from '../hooks/useMedicos';
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
                            <div className="flex gap-2">
                                <button onClick={exportarPNG} className="bg-elmeco-navy text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center shadow-md active:scale-95 transition-all">
                                    <Download size={14} className="mr-1.5" /> Exportar (PNG)
                                </button>
                                <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors">
                                    <X size={20} />
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
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                                            <Users size={16} className="text-blue-500" />
                                            <span className="text-xs font-bold uppercase tracking-wide">Base Total</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-800">{totalMedicos}</p>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                                            <TrendingUp size={16} className="text-green-500" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Conversão</span>
                                        </div>
                                        <p className="text-3xl font-black text-green-600">{taxaConversao}%</p>
                                    </div>
                                </div>

                                {/* Funil Chart */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center justify-between">
                                        <span>Distribuição no Funil</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">&gt; {ativos} Parceiros Ativos</span>
                                    </h3>
                                    <div className="h-40 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                <YAxis hide />
                                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                                <Bar dataKey="quantidade" radius={[4, 4, 4, 4]} barSize={32}>
                                                    {chartData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

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
