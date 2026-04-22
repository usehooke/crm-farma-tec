import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, MapPin, ChevronRight, Star, CheckCircle2 } from 'lucide-react';
import type { Medico } from '../../hooks/useMedicos';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DoctorCardProps {
  medico: Medico;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Card do Médico Elite v3.0 (@Agent-UIArchitect)
 * Otimizado com padrão de arredondamento 32px e sombras neomórficas suaves.
 */
const DoctorCardComponent: React.FC<DoctorCardProps> = ({
  medico,
  isSelected,
  onClick
}) => {
  // Formatação segura de data
  const safeDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return isValid(d) ? format(d, 'dd MMM', { locale: ptBR }) : '---';
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-6 transition-all relative overflow-hidden mb-4 border-2 ${
        isSelected 
          ? 'bg-brand-dark border-brand-dark text-white rounded-[var(--radius-pill)] shadow-2xl z-10' 
          : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 rounded-[var(--radius-pill)] shadow-soft-out'
      }`}
    >
      <div className="flex items-center gap-6">
        {/* Avatar Area Elite - 44px+ Touch Area Optimization */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
            isSelected ? 'bg-brand-teal-400/20 text-brand-teal-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
        }`}>
            <User size={28} />
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <h3 className={`font-black text-base truncate pr-2 tracking-tight ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                    {medico.nome}
                </h3>
                <div className="flex items-center gap-2">
                    {medico.isFavorite && (
                        <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />
                    )}
                    {medico.isClient && (
                        <CheckCircle2 size={14} className="text-brand-teal-400 fill-brand-teal-400/10 shrink-0" />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                        isSelected ? 'bg-brand-teal-400 text-white shadow-lg shadow-brand-teal-400/20' : 'bg-brand-teal-50 text-brand-teal-600 border border-brand-teal-100'
                    }`}>
                        {medico.crm || 'CRM'}
                    </span>
                </div>
            </div>
            
            <p className={`text-xs font-bold mb-4 flex items-center gap-2 ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                <MapPin size={12} className={isSelected ? 'text-brand-teal-300' : 'text-brand-teal-400'} />
                {medico.localizacao}
            </p>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className={isSelected ? 'text-brand-teal-300' : 'text-brand-teal-500'} />
                    <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {safeDate(medico.ultimoContato)}
                    </span>
                </div>
                
                {/* Status Indicator Elite - High Contrast */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isSelected ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800 shadow-inner border border-slate-100/50 dark:border-white/5'}`}>
                    <div className={`w-2 h-2 rounded-full ${medico.status === 'Parceiro Ativo' ? 'bg-brand-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.5)]' : 'bg-amber-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                        {medico.status?.split(' ')[0] || 'Status'}
                    </span>
                </div>
            </div>
        </div>

        {!isSelected && (
            <div className="flex items-center text-slate-300 ml-1">
                <ChevronRight size={24} />
            </div>
        )}
      </div>

      {isSelected && (
        <motion.div 
            layoutId="cardActiveHighlight"
            className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-teal-400" 
        />
      )}
    </motion.button>
  );
};

export const DoctorCard = memo(DoctorCardComponent);
