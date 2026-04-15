import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, MapPin } from 'lucide-react';
import type { Medico } from '../../hooks/useMedicos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DoctorCardProps {
  medico: Medico;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Card do Médico para a lista central (@Agent-ComponentSniper)
 */
export const DoctorCard: React.FC<DoctorCardProps> = ({
  medico,
  isSelected,
  onClick
}) => {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-5 transition-all relative overflow-hidden mb-4 ${
        isSelected 
          ? 'bg-brand-dark text-white rounded-[var(--radius-corp)] shadow-lg' 
          : 'neo-card border-none'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar Area */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            isSelected ? 'bg-white/10' : 'bg-slate-100'
        }`}>
            <User size={24} className={isSelected ? 'text-brand-teal' : 'text-slate-400'} />
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-black text-sm truncate pr-2">{medico.nome}</h3>
                <span className={`text-[9px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-brand-teal text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                    {medico.crm || 'CRM'}
                </span>
            </div>
            
            <p className={`text-[11px] font-bold mb-2 flex items-center gap-1 opacity-70`}>
                <MapPin size={10} />
                {medico.localizacao}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Calendar size={10} className={isSelected ? 'text-brand-teal' : 'text-brand-teal'} />
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">
                        {medico.ultimoContato ? format(new Date(medico.ultimoContato), 'dd/MM/yy', { locale: ptBR }) : 'S/V'}
                    </span>
                </div>
                
                {/* Status Dot */}
                <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${medico.status === 'Parceiro Ativo' ? 'bg-success' : 'bg-warning'}`} />
                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Status</span>
                </div>
            </div>
        </div>
      </div>

      {isSelected && (
        <motion.div 
            layoutId="cardActiveHighlight"
            className="absolute right-0 top-0 bottom-0 w-1.5 bg-brand-teal" 
        />
      )}
    </motion.button>
  );
};
