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
 * Card do Médico para a lista central (@Agent-ComponentSniper)
 * Otimizado para Mobile Android (Contraste e Thumb Zone)
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
          ? 'bg-brand-dark border-brand-dark text-white rounded-[24px] shadow-2xl z-10' 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-[24px] shadow-sm'
      }`}
    >
      <div className="flex items-center gap-5">
        {/* Avatar Area - Maior para toque fácil */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
            isSelected ? 'bg-brand-teal/20 text-brand-teal' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
        }`}>
            <User size={28} />
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <h3 className={`font-black text-sm truncate pr-2 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                    {medico.nome}
                </h3>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    isSelected ? 'bg-brand-teal text-white' : 'bg-brand-teal/10 text-brand-teal'
                }`}>
                    {medico.crm || 'CRM'}
                </span>
            </div>
            
            <p className={`text-[12px] font-bold mb-3 flex items-center gap-1.5 ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                <MapPin size={12} className="text-brand-teal" />
                {medico.localizacao}
            </p>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-brand-teal" />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {safeDate(medico.ultimoContato)}
                    </span>
                </div>
                
                {/* Status Badge - Impacto Visual */}
                <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${isSelected ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800'}`}>
                    <div className={`w-2 h-2 rounded-full ${medico.status === 'Parceiro Ativo' ? 'bg-brand-teal shadow-[0_0_8px_rgba(45,212,191,0.5)]' : 'bg-amber-500'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {medico.status?.split(' ')[0] || 'Status'}
                    </span>
                </div>
            </div>
        </div>

        {/* Indicador de Ação (Android Style) */}
        {!isSelected && (
            <div className="flex items-center text-slate-300 ml-1">
                <ChevronRight size={20} />
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
