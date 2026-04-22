import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell
} from 'recharts';
import { 
    Zap,
    Trophy,
    Target,
    Check,
    ArrowUpRight,
    ChevronRight,
    Users
} from 'lucide-react';
import { 
    format, 
    subDays, 
    parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMedicos } from '../hooks/useMedicos';
import { FunilChart } from './FunilChart';
import { PerformanceIntelligence } from './PerformanceIntelligence';
import { NeoCard } from './ui/NeoCard';



/**
 * Counter Animation Component
 */
function Counter({ value }: { value: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) {
            setCount(end);
            return;
        }

        let timer = setInterval(() => {
            start += Math.ceil(end / 20) || 1;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 30);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{count}</span>;
}

/**
 * DashboardBI Elite v4.0 — High-Performance Intelligence
 * Otimizado para decisões rápidas e visualização de impacto.
 * Sem metas fixas, apenas inteligência comparativa real.
 */
export function DashboardBI() {
    const { medicos } = useMedicos();
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);



    // [DATA MANAGEMENT]: Last 7 Days Activity
    const chartData = useMemo(() => {
        const days = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                dateObj: date,
                name: format(date, 'eee', { locale: ptBR }).toUpperCase(),
                visitas: 0
            };
        });

        medicos.forEach(m => {
            (m.logVisitas || []).forEach(log => {
                const logDate = parseISO(log.data);
                const daySlot = days.find(d => 
                    d.dateObj.getDate() === logDate.getDate() && 
                    d.dateObj.getMonth() === logDate.getMonth()
                );
                if (daySlot) daySlot.visitas++;
            });
        });

        return days;
    }, [medicos]);

    const totalStats = useMemo(() => {
        const totalVisits = medicos.reduce((acc, m) => acc + (m.logVisitas?.length || 0), 0);
        const activeDocs = medicos.filter(m => (m.logVisitas?.length || 0) > 0).length;
        const totalDocs = medicos.length;
        const healthScore = totalDocs > 0 ? (activeDocs / totalDocs) * 100 : 0;

        return { totalVisits, activeDocs, totalDocs, healthScore };
    }, [medicos]);

    return (
        <motion.div
            className="flex-1 min-h-screen bg-brand-white dark:bg-slate-950 px-5 pt-8 pb-40 overflow-x-hidden selection:bg-brand-teal-400/30 font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="mb-10 max-w-xl mx-auto flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter italic">Analytics Elite</h1>
                    <div className="flex items-center gap-2 mt-2">
                         <div className="w-1.5 h-1.5 bg-brand-teal-400 rounded-full animate-pulse" />
                         <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Sincronismo em Tempo Real</p>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-soft-out flex items-center justify-center text-brand-teal-400">
                    <Zap size={24} fill="currentColor" className="opacity-20" />
                </div>
            </header>

            <div className="space-y-6 max-w-xl mx-auto">
                
                {/* Performance Hub */}
                <PerformanceIntelligence medicos={medicos} />

                {/* Scorecards Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <NeoCard noPadding className="group active:scale-95 transition-all overflow-hidden border-none shadow-xl">
                        <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 h-full">
                            <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-4 transition-transform group-hover:scale-110">
                                <Users size={20} />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter">
                                    <Counter value={totalStats.totalDocs} />
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">docs</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Base Total</span>
                        </div>
                    </NeoCard>

                    <NeoCard noPadding className="group active:scale-95 transition-all overflow-hidden border-none shadow-xl">
                         <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 h-full">
                            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-500 mb-4 transition-transform group-hover:scale-110">
                                <Trophy size={20} />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter">
                                    <Counter value={Math.round(totalStats.healthScore)} />%
                                </span>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Score de Ativação</span>
                        </div>
                    </NeoCard>
                </div>

                {/* Quick Intelligence Row */}
                <div className="grid grid-cols-2 gap-4">
                     <NeoCard noPadding className="group p-5 bg-slate-50 dark:bg-slate-900/50 border-none">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Target size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Favoritos</p>
                                <p className="text-sm font-bold text-brand-dark dark:text-white">
                                    <Counter value={medicos.filter(m => m.isFavorite).length} /> ativos
                                </p>
                            </div>
                        </div>
                     </NeoCard>

                     <NeoCard noPadding className="group p-5 bg-slate-50 dark:bg-slate-900/50 border-none">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                                <Check size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clientes</p>
                                <p className="text-sm font-bold text-brand-dark dark:text-white">
                                    <Counter value={medicos.filter(m => m.isClient).length} /> fechados
                                </p>
                            </div>
                        </div>
                     </NeoCard>
                </div>

                {/* Main Activity Chart */}
                <NeoCard>
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-sm font-black text-brand-dark dark:text-white uppercase tracking-tight">Fluxo de Itinerário</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Últimos 7 dias móveis</p>
                        </div>
                        <div className="flex gap-1">
                             <div className="w-1 h-1 bg-brand-teal-400 rounded-full" />
                             <div className="w-1 h-3 bg-brand-teal-400/30 rounded-full" />
                        </div>
                    </div>

                    <div className="h-48 w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={chartData} 
                                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                                onMouseMove={(s) => setHoveredBar(typeof s.activeTooltipIndex === 'number' ? s.activeTooltipIndex : null)}
                                onMouseLeave={() => setHoveredBar(null)}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} 
                                    dy={15}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={false} />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-brand-dark text-white p-3 rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{payload[0].payload.name}</p>
                                                    <p className="text-lg font-black">{payload[0].value} <span className="text-[10px] opacity-40">VISITAS</span></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="visitas" 
                                    radius={[12, 12, 12, 12]} 
                                    barSize={20}
                                >
                                    {chartData.map((_, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={hoveredBar === index ? '#2dd4bf' : 'rgba(45, 212, 191, 0.15)'}
                                            className="transition-all duration-300"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </NeoCard>

                {/* Dynamic Funnel */}
                <FunilChart />

                {/* Legend / Action Banner */}
                <div className="bg-brand-teal-400/5 dark:bg-brand-teal-400/5 rounded-3xl p-6 border border-brand-teal-400/20 flex items-center justify-between group cursor-pointer active:scale-95 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-teal-400 flex items-center justify-center text-white shadow-lg shadow-brand-teal-400/20">
                            <ArrowUpRight size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-brand-dark dark:text-white uppercase tracking-tight">Relatório Full HD</p>
                            <p className="text-[10px] font-bold text-brand-teal-600 dark:text-brand-teal-400 uppercase tracking-widest">Exportar Inteligência para PDF</p>
                        </div>
                     </div>
                     <ChevronRight size={20} className="text-brand-teal-400 group-hover:translate-x-1 transition-transform" />
                </div>

            </div>
        </motion.div>
    );
}
