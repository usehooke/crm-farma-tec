import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, MapPin, ChevronRight } from 'lucide-react';
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
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`w-full text-left p-6 transition-all relative overflow-hidden mb-4 border-2 ${
        isSelected 
          ? 'bg-brand-dark border-brand-dark text-white rounded-[32px] shadow-2xl z-10' 
          : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 rounded-[32px] shadow-soft-out'
      }`}
    >
      <div className="flex items-center gap-6">
        {/* Avatar Area Elite - 32px standard */}
        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-inner ${
            isSelected ? 'bg-brand-teal/20 text-brand-teal' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
        }`}>
            <User size={30} />
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
                <h3 className={`font-black text-[15px] truncate pr-2 tracking-tight ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                    {medico.nome}
                </h3>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-xl ${
                    isSelected ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' : 'bg-brand-teal/10 text-brand-teal'
                }`}>
                    {medico.crm || 'CRM'}
                </span>
            </div>
            
            <p className={`text-[12px] font-bold mb-4 flex items-center gap-2 ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                <MapPin size={12} className={isSelected ? 'text-brand-teal' : 'text-slate-300'} />
                {medico.localizacao}
            </p>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2.5">
                    <Calendar size={14} className="text-brand-teal" />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {safeDate(medico.ultimoContato)}
                    </span>
                </div>
                
                {/* Status Indicator Elite */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isSelected ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800 shadow-inner'}`}>
                    <div className={`w-2 h-2 rounded-full ${medico.status === 'Parceiro Ativo' ? 'bg-brand-teal animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.5)]' : 'bg-amber-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                        {medico.status?.split(' ')[0] || 'Status'}
                    </span>
                </div>
            </div>
        </div>

        {!isSelected && (
            <div className="flex items-center text-slate-200 ml-1">
                <ChevronRight size={24} />
            </div>
        )}
      </div>

      {isSelected && (
        <motion.div 
            layoutId="cardActiveHighlight"
            className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-teal" 
        />
      )}
    </motion.button>
  );
};

export const DoctorCard = memo(DoctorCardComponent);
