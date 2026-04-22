import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Lightbulb, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
    startOfWeek, 
    endOfWeek, 
    isWithinInterval, 
    subWeeks, 
    parseISO 
} from 'date-fns';
import type { Medico } from '../hooks/useMedicos';
import { NeoCard } from './ui/NeoCard';

interface PerformanceIntelligenceProps {
    medicos: Medico[];
}

export function PerformanceIntelligence({ medicos }: PerformanceIntelligenceProps) {
    const intelligence = useMemo(() => {
        const now = new Date();
        const thisWeek = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        const lastWeek = { start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) };

        let visitsThisWeek = 0;
        let visitsLastWeek = 0;

        medicos.forEach(m => {
            (m.logVisitas || []).forEach(log => {
                const logDate = parseISO(log.data);
                if (isWithinInterval(logDate, thisWeek)) visitsThisWeek++;
                if (isWithinInterval(logDate, lastWeek)) visitsLastWeek++;
            });
        });

        const diff = visitsThisWeek - visitsLastWeek;
        const percentChange = visitsLastWeek > 0 ? (diff / visitsLastWeek) * 100 : (visitsThisWeek > 0 ? 100 : 0);
        
        // Insight Generation
        let insight = "Continue mantendo o ritmo de visitas para consolidar sua base.";
        if (percentChange > 10) insight = `Excelente! Você está ${percentChange.toFixed(0)}% acima do ritmo da semana passada.`;
        if (percentChange < -10) insight = "Atenção: sua frequência de visitas caiu. Que tal focar nos seus favoritos hoje?";
        if (visitsThisWeek === 0) insight = "Semana começando! Hora de ativar seus principais parceiros.";

        return {
            visitsThisWeek,
            visitsLastWeek,
            percentChange,
            status: diff >= 0 ? 'up' : 'down',
            insight
        };
    }, [medicos]);

    return (
        <NeoCard variant="dark" className="relative group overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl group-hover:bg-brand-teal/20 transition-all duration-700" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal flex items-center gap-2">
                        <TrendingUp size={12} /> Inteligência de Performance
                    </span>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1 ${intelligence.status === 'up' ? 'bg-brand-teal/20 text-brand-teal' : 'bg-red-400/20 text-red-400'}`}>
                        {intelligence.status === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {Math.abs(intelligence.percentChange).toFixed(1)}% VAR
                    </div>
                </div>
                
                <div className="flex items-end gap-1 mb-2">
                     <motion.span 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-black tracking-tighter"
                     >
                        {intelligence.visitsThisWeek}
                     </motion.span>
                     <span className="text-sm font-bold text-white/50 pb-2">Visitas / Semana</span>
                </div>
                
                <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal">
                        <Lightbulb size={16} />
                    </div>
                    <p className="text-xs text-white/80 font-medium leading-relaxed">
                        {intelligence.insight}
                    </p>
                </div>
            </div>
        </NeoCard>
    );
}
