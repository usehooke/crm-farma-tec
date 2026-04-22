import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from 'recharts';
import { ChevronDown, BarChart3, TrendingUp } from 'lucide-react';
import { NeoCard } from './ui/NeoCard';
import type { Medico } from '../hooks/useMedicos';

interface MetricChartProps {
    medicos: Medico[];
}

export function MetricChart({ medicos }: MetricChartProps) {
    const [isOpen, setIsOpen] = useState(true); // Começa aberto para impacto inicial

    const data = useMemo(() => {
        const counts = {
            'Prospecção': 0,
            'Apresentada': 0,
            'Parceiro Ativo': 0,
            'Monitoramento': 0
        };

        if (Array.isArray(medicos)) {
            medicos.forEach(m => {
                if (m && counts.hasOwnProperty(m.status)) {
                    counts[m.status as keyof typeof counts]++;
                }
            });
        }

        return [
            { name: 'Prospe.', total: counts['Prospecção'], color: '#94a3b8' },
            { name: 'Apres.', total: counts['Apresentada'], color: '#2dd4bf' },
            { name: 'Monitor.', total: counts['Monitoramento'], color: '#0f172a' },
            { name: 'Parceiro', total: counts['Parceiro Ativo'], color: '#0d9488' },
        ];
    }, [medicos]);

    const totalMedicos = Array.isArray(medicos) ? medicos.length : 0;

    return (
        <div className="px-5 mb-8">
            <NeoCard noPadding className="overflow-hidden">
                {/* Header do Gráfico */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-6 focus:outline-none"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal shadow-inner">
                            <TrendingUp size={20} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-black text-brand-dark dark:text-white uppercase tracking-tight">Desempenho da Carteira</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total: {totalMedicos} Médicos Estratégicos</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        className="text-slate-300"
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </button>

                {/* Área do Gráfico Retrátil */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden px-4 pb-8"
                        >
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={false}
                                            width={30}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(45, 212, 191, 0.03)' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-brand-dark text-white p-3 rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{payload[0].payload.name}</p>
                                                            <p className="text-lg font-black">{payload[0].value} <span className="text-[10px] opacity-40">MÉDICOS</span></p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="total" radius={[8, 8, 8, 8]} barSize={32}>
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </NeoCard>
        </div>
    );
}
