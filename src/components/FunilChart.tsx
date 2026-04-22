import { useMemo, useState } from 'react';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip
} from 'recharts';
import { useMedicos } from '../hooks/useMedicos';
import { LayoutGrid } from 'lucide-react';
import { NeoCard } from './ui/NeoCard';



export const FunilChart = () => {
    const { medicos } = useMedicos();
    const [activeIndex, setActiveIndex] = useState(0);

    const CORES = [
        '#2dd4bf', // Primary Teal
        '#0f172a', // Deep Slate
        '#0ea5e9', // Sky Blue
        '#64748b', // Light Slate
        '#14b8a6', // Dark Teal
    ];

    const dadosGrafico = useMemo(() => {
        if (!medicos || medicos.length === 0) return [];
        const contagem: Record<string, number> = {};
        medicos.forEach((medico) => {
            const status = medico.status || 'Sem Categoria';
            contagem[status] = (contagem[status] || 0) + 1;
        });
        return Object.keys(contagem)
            .map((name) => ({ name, value: contagem[name] }))
            .sort((a, b) => b.value - a.value);
    }, [medicos]);

    if (dadosGrafico.length === 0) return null;

    return (
        <NeoCard className="relative overflow-hidden">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                        <LayoutGrid size={18} />
                    </div>
                    <h2 className="text-sm font-black text-brand-dark dark:text-white uppercase tracking-tight">Estatura de Carteira</h2>
                </div>
            </header>

            <div className="w-full h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dadosGrafico}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onClick={(_, index) => setActiveIndex(index)}
                            stroke="none"
                        >
                            {dadosGrafico.map((_, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={CORES[index % CORES.length]} 
                                    className="outline-none focus:outline-none"
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-brand-dark text-white p-4 rounded-3xl shadow-2xl border border-white/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{payload[0].name}</p>
                                            <p className="text-xl font-black">{payload[0].value} <span className="text-xs opacity-40">MÉDICOS</span></p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Interactive Legend */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                {dadosGrafico.map((item, index) => (
                    <button
                        key={item.name}
                        onClick={() => setActiveIndex(index)}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 border-2 ${
                            activeIndex === index 
                            ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm' 
                            : 'bg-transparent border-transparent opacity-60'
                        }`}
                    >
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CORES[index % CORES.length] }} />
                        <div className="text-left min-w-0">
                            <p className="text-[10px] font-black text-brand-dark dark:text-white uppercase truncate">{item.name}</p>
                            <p className="text-[9px] font-bold text-slate-400">{item.value} unidades</p>
                        </div>
                    </button>
                ))}
            </div>
        </NeoCard>
    );
};
