import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

export const FunilChart = () => {
    const [dadosGrafico, setDadosGrafico] = useState<{ name: string; value: number }[]>([]);

    // Cores exatas da identidade FarmaClinIQ para as fatias do gráfico
    const CORES = ['#1E5FAF', '#00A8A8', '#0D2C5A', '#94A3B8'];

    useEffect(() => {
        // 1. Busca os dados reais do dispositivo
        const medicosRaw = localStorage.getItem('@FarmaTec:medicos'); // Ajustado para chave correta
        if (medicosRaw) {
            const medicos = JSON.parse(medicosRaw);

            // 2. Lógica de Agrupamento (Conta quantos médicos por Tag principal)
            const contagem: Record<string, number> = {};
            medicos.forEach((medico: any) => {
                // Pega a primeira tag como status principal, ou 'Sem Categoria'
                const categoria = medico.tags && medico.tags.length > 0 ? medico.tags[0] : 'Sem Categoria';
                contagem[categoria] = (contagem[categoria] || 0) + 1;
            });

            // 3. Formata para o padrão que o Recharts exige
            const formatoRecharts = Object.keys(contagem).map((chave) => ({
                name: chave,
                value: contagem[chave]
            }));

            // Ordena do maior para o menor
            formatoRecharts.sort((a, b) => b.value - a.value);
            setDadosGrafico(formatoRecharts);
        }
    }, []);

    if (dadosGrafico.length === 0) {
        return (
            <div className="p-5 text-center text-sm text-slate-500 bg-surface rounded-2xl shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]">
                Cadastre médicos para visualizar o funil.
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff] flex flex-col items-center"
        >
            <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide w-full text-left mb-4">
                Visão do Funil (Status)
            </h2>

            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dadosGrafico}
                            cx="50%"
                            cy="50%"
                            innerRadius={60} // Transforma a Pizza em Donut
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none" // Remove a borda branca padrão para um visual mais limpo
                        >
                            {dadosGrafico.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                            ))}
                        </Pie>
                        {/* Tooltip Neumórfico customizado */}
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '4px 4px 10px rgba(0,0,0,0.1)',
                                backgroundColor: '#ffffff'
                            }}
                            itemStyle={{ color: '#0D2C5A', fontWeight: 'bold' }}
                        />
                        {/* Legenda na base do gráfico */}
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};
