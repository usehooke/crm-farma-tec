import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMedicos } from '../hooks/useMedicos';
import { FunilChart } from './FunilChart';

export function DashboardBI() {
    const { medicos } = useMedicos();

    const visitsData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                dateObj: date,
                name: format(date, 'EEEE', { locale: ptBR }).substring(0, 3), // e.g., "seg", "ter"
                visitas: 0
            };
        });

        (medicos || []).forEach(medico => {
            if (medico.logVisitas) {
                (medico.logVisitas || []).forEach((log: any) => {
                    const logDate = parseISO(log.data);
                    // Match the Date
                    const daySlot = last7Days.find(d =>
                        d.dateObj.getDate() === logDate.getDate() &&
                        d.dateObj.getMonth() === logDate.getMonth() &&
                        d.dateObj.getFullYear() === logDate.getFullYear()
                    );
                    if (daySlot) {
                        daySlot.visitas += 1;
                    }
                });
            }
        });

        return last7Days.map(d => ({ name: d.name.toUpperCase(), visitas: d.visitas }));
    }, [medicos]);

    const statsData = useMemo(() => {
        let totalLogs = 0;
        let activeDoctors = 0;
        (medicos || []).forEach(m => {
            if (m.logVisitas && (m.logVisitas || []).length > 0) {
                totalLogs += m.logVisitas.length;
                activeDoctors += 1;
            }
        });
        return { totalLogs, activeDoctors };
    }, [medicos]);

    return (
        <motion.div
            className="flex-1 min-h-screen bg-brand-white px-5 pt-8 pb-32 overflow-x-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
        >
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Estatísticas</h1>
                <p className="text-sm text-slate-500 mt-1">Inteligência de Vendas e BI.</p>
            </header>

            <div className="space-y-6">

                {/* Scorecard Neumórfico (Subsituindo parte da Home) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface rounded-2xl p-4 shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800 flex flex-col justify-center items-center text-center">
                        <TrendingUp className="text-primary mb-2" size={24} />
                        <span className="text-3xl font-black text-brand-dark">{statsData.totalLogs}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Interações</span>
                    </div>
                    <div className="bg-surface rounded-2xl p-4 shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800 flex flex-col justify-center items-center text-center">
                        <div className="w-6 h-6 rounded-full bg-brand-teal mb-2 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-3xl font-black text-brand-dark">{statsData.activeDoctors}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Médicos Ativos</span>
                    </div>
                </div>

                {/* Gráfico de Barras - Recharts */}
                <div className="bg-surface rounded-3xl p-5 shadow-lg shadow-slate-200/40 border border-slate-100 dark:shadow-none dark:border-slate-800 overflow-hidden relative">
                    <h3 className="text-sm font-bold text-brand-dark mb-6">Visitas nos Últimos 7 Dias</h3>
                    {/* Fixed Height to avoid Recharts negative height Error */}
                    <div className="h-48 min-h-[192px] w-full -ml-4">
                        <ResponsiveContainer width="100%" height={192}>
                            <BarChart data={visitsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                                />
                                <Bar dataKey="visitas" fill="#2dd4bf" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                    <LabelList dataKey="visitas" position="top" fill="#64748b" fontSize={10} fontWeight="bold" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <FunilChart />

            </div>
        </motion.div>
    );
}
