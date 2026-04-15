import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Activity, Stethoscope, Search } from 'lucide-react';

interface SidebarFiltrosProps {
  selectedSpecialty: string;
  onSelectSpecialty: (specialty: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const SidebarFiltros: React.FC<SidebarFiltrosProps> = ({
  selectedSpecialty,
  onSelectSpecialty,
  searchTerm,
  onSearchChange,
}) => {
  const specialties = [
    { id: 'Todos', label: 'Todos', icon: Users },
    { id: 'Ginecologia', label: 'Ginecologistas', icon: Heart },
    { id: 'Endocrinologia', label: 'Endocrinologistas', icon: Activity },
    { id: 'Urologia', label: 'Urologistas', icon: Stethoscope },
  ];

  return (
    <div className="flex flex-col h-full bg-brand-dark text-white w-full lg:w-64 xl:w-72 transition-all overflow-hidden border-r border-slate-800">
      {/* Search Header */}
      <div className="p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 font-black">Filtros</h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-teal transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar médico..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="neo-input !bg-slate-900/50 !shadow-none border-slate-700/50 focus:border-brand-teal text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Specialties List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {specialties.map((spec) => {
          const Icon = spec.icon;
          const isActive = selectedSpecialty === spec.id;

          return (
            <button
              key={spec.id}
              onClick={() => onSelectSpecialty(spec.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                isActive 
                  ? 'bg-brand-teal text-white shadow-[0_4px_12px_rgba(45,212,191,0.3)]' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="text-sm font-medium">{spec.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Brand Mini */}
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <span className="text-xs font-bold tracking-tighter uppercase underline decoration-brand-teal decoration-2 italic">FarmaClinQI</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">v2.1</span>
        </div>
      </div>
    </div>
  );
};
