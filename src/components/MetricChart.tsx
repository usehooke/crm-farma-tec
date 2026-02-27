import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { ChevronDown, BarChart3 } from 'lucide-react';
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

        medicos.forEach(m => {
            if (counts.hasOwnProperty(m.status)) {
                counts[m.status as keyof typeof counts]++;
            }
        });

        return [
            { name: 'Prospe.', total: counts['Prospecção'], color: '#94a3b8' },
            { name: 'Apres.', total: counts['Apresentada'], color: '#2dd4bf' },
            { name: 'Monitor.', total: counts['Monitoramento'], color: '#0f172a' },
            { name: 'Parceiro', total: counts['Parceiro Ativo'], color: '#0d9488' },
        ];
    }, [medicos]);

    const totalMedicos = medicos.length;

    return (
        <div className="px-5 mb-8">
            <div className="bg-surface rounded-[32px] p-1 shadow-[10px_10px_20px_#e5e5e5,-10px_-10px_20px_#ffffff] border border-white/50">
                {/* Header do Gráfico */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-5 focus:outline-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal shadow-inner">
                            <BarChart3 size={20} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Desempenho da Carteira</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Total: {totalMedicos} Médicos Estratégicos</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        className="text-slate-400"
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </button>

                {/* Área do Gráfico Retrátil */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 260, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="overflow-hidden px-4 pb-6"
                        >
                            <div className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            width={30}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(45, 212, 191, 0.05)' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-50 text-[10px] font-black text-slate-600">
                                                            <span className="text-primary mr-1">{payload[0].value}</span> MÉDICOS
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="total" radius={[10, 10, 10, 10]} barSize={36}>
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
            </div>
        </div>
    );
}
