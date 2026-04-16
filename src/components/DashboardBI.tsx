import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { TrendingUp, Users } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMedicos } from '../hooks/useMedicos';
import { FunilChart } from './FunilChart';

/**
 * Dashboard de BI e Estatísticas Elite (@Agent-UIArchitect v3.0)
 * Focado em visualização de alto impacto e clareza de dados.
 */
export function DashboardBI() {
    const { medicos } = useMedicos();

    const visitsData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                dateObj: date,
                name: format(date, 'EEEE', { locale: ptBR }).substring(0, 3), 
                visitas: 0
            };
        });

        (medicos || []).forEach(medico => {
            if (medico.logVisitas) {
                (medico.logVisitas || []).forEach((log: any) => {
                    const logDate = parseISO(log.data);
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
            className="flex-1 min-h-screen bg-brand-white dark:bg-slate-950 px-5 pt-8 pb-40 overflow-x-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
        >
            <header className="mb-10 max-w-[600px] mx-auto">
                <h1 className="text-3xl font-black text-brand-dark dark:text-white tracking-tighter italic">Estatísticas Elite</h1>
                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-2">Visão Estratégica FarmaClinIQ</p>
            </header>

            <div className="space-y-8 max-w-[600px] mx-auto">

                {/* Scorecards de Elite */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="bg-surface dark:bg-slate-900/50 rounded-[32px] p-6 shadow-soft-out border border-white/40 dark:border-slate-800 flex flex-col items-center text-center group active:scale-95 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-4xl font-black text-brand-dark dark:text-white tracking-tighter">{statsData.totalLogs}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Interações</span>
                    </div>
                    
                    <div className="bg-surface dark:bg-slate-900/50 rounded-[32px] p-6 shadow-soft-out border border-white/40 dark:border-slate-800 flex flex-col items-center text-center group active:scale-95 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-brand-dark/5 dark:bg-white/5 flex items-center justify-center text-brand-dark dark:text-white mb-4 group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <span className="text-4xl font-black text-brand-dark dark:text-white tracking-tighter">{statsData.activeDoctors}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Ativos</span>
                    </div>
                </div>

                {/* Gráfico de Atividade Semanal */}
                <div className="bg-surface dark:bg-slate-900/50 rounded-[32px] p-8 shadow-soft-out border border-white/40 dark:border-slate-800 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-black text-brand-dark dark:text-slate-400 uppercase tracking-[0.2em]">Fluxo de Visitas 7D</h3>
                        <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                    </div>
                    
                    <div className="h-48 min-h-[192px] w-full -ml-4">
                        <ResponsiveContainer width="100%" height={192}>
                            <BarChart data={visitsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(45, 212, 191, 0.05)' }}
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(5px)'
                                    }}
                                    labelStyle={{ fontWeight: '900', color: '#1e293b', fontSize: '11px', textTransform: 'uppercase' }}
                                />
                                <Bar dataKey="visitas" fill="#2dd4bf" radius={[6, 6, 0, 0]} maxBarSize={32}>
                                    <LabelList dataKey="visitas" position="top" fill="#2dd4bf" fontSize={10} fontWeight="900" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Seção do Funil Integrado */}
                <FunilChart />

            </div>
        </motion.div>
    );
}
