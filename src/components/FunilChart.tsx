import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useMedicos } from '../hooks/useMedicos';

/**
 * Gráfico de Funil (Pizza/Donut) Otimizado (@Agent-UIArchitect v3.0)
 * Agora consome dados em tempo real via useMedicos hook.
 */
export const FunilChart = () => {
    const { medicos } = useMedicos();

    // Paleta de Cores Dinâmica (Extraída da Identidade Visual v2.1)
    const CORES = ['#2dd4bf', '#1e293b', '#0ea5e9', '#64748b'];

    const dadosGrafico = useMemo(() => {
        if (!medicos || medicos.length === 0) return [];

        const contagem: Record<string, number> = {};
        medicos.forEach((medico) => {
            // Normalização do Status para o gráfico
            const status = medico.status || 'Sem Categoria';
            contagem[status] = (contagem[status] || 0) + 1;
        });

        return Object.keys(contagem)
            .map((name) => ({ name, value: contagem[name] }))
            .sort((a, b) => b.value - a.value);
    }, [medicos]);

    if (dadosGrafico.length === 0) {
        return (
            <div className="p-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-300 bg-surface rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                Aguardando dados para gerar o funil...
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-[32px] bg-surface dark:bg-slate-900/50 shadow-soft-out border border-white/50 dark:border-slate-800 flex flex-col items-center"
        >
            <div className="w-full flex items-center justify-between mb-6">
                <h2 className="text-[11px] font-black text-brand-dark dark:text-slate-400 uppercase tracking-[0.2em]">
                    Distribuição de Carteira
                </h2>
                <div className="px-2 py-0.5 rounded-md bg-brand-teal/10 text-brand-teal text-[9px] font-black uppercase tracking-tighter">
                    Real-time
                </div>
            </div>

            <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dadosGrafico}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {dadosGrafico.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: '20px',
                                border: 'none',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                padding: '12px'
                            }}
                            itemStyle={{ color: '#1e293b', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={40}
                            iconType="circle"
                            formatter={(value) => <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};
