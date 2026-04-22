import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, X, MessageSquare, ClipboardList, ChevronDown, Save, Star, CheckCircle2
} from 'lucide-react';
import type { Medico, LogVisita } from '../../hooks/useMedicos';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDebounce } from '../../hooks/useDebounce';

interface CockpitDetalhesProps {
  medico: Medico | null;
  onAtualizarMedico: (id: string, updates: Partial<Medico>) => void;
  onAdicionarLog: (idMedico: string, nota: string, extras?: Partial<LogVisita>) => void;
  onFechar: () => void;
}

/**
 * Cockpit de Detalhes do Médico (@Agent-ActionPanel)
 * Otimizado para GESTOS Mobile e Thumb Zone
 */
export const CockpitDetalhes: React.FC<CockpitDetalhesProps> = ({
  medico,
  onAtualizarMedico,
  onAdicionarLog,
  onFechar
}) => {
  const [novaNota, setNovaNota] = useState('');
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [tipoVisita] = useState<'presencial' | 'tecnico'>('presencial');
  
  const [notaCrm, setNotaCrm] = useState('');
  const debouncedNotaCrm = useDebounce(notaCrm, 400);

  useEffect(() => {
    if (medico) {
      setNotaCrm(medico.notasCrm || '');
    }
  }, [medico?.id]);

  useEffect(() => {
    if (medico && debouncedNotaCrm !== (medico.notasCrm || '')) {
      onAtualizarMedico(medico.id, { notasCrm: debouncedNotaCrm });
    }
  }, [debouncedNotaCrm]);

  const safeFormat = (date: string | undefined | null, formatStr: string, fallback: string) => {
    if (!date) return fallback;
    try {
      const d = new Date(date);
      if (!isValid(d)) return fallback;
      return format(d, formatStr, { locale: ptBR });
    } catch {
      return fallback;
    }
  };

  if (!medico) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-900/50 h-full select-none">
        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-8 shadow-inner">
          <User size={48} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Nenhuma ficha ativa</h3>
      </div>
    );
  }

  const handleSalvarVisita = () => {
    if (!novaNota.trim()) return;
    onAdicionarLog(medico.id, novaNota, {
        tipo: tipoVisita,
        amostras: [],
        brindes: []
    });
    setNovaNota('');
    setIsRegistrando(false);
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y > 150) onFechar();
      }}
      className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative border-l border-slate-200 dark:border-slate-800 z-[70] shadow-2xl"
    >
      {/* Handle de Arraste Mobile (Visual) */}
      <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>

      <header className="p-8 pb-6">
        <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[28px] bg-brand-teal/5 dark:bg-brand-teal/10 flex items-center justify-center text-brand-teal border-2 border-brand-teal/20 shadow-lg shadow-brand-teal/5">
                    <User size={36} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight leading-none mb-2">{medico.nome}</h2>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-brand-teal/10 text-brand-teal text-[10px] font-black rounded-md uppercase tracking-widest border border-brand-teal/20">
                            {medico.especialidade}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-md uppercase tracking-widest">
                            CRM {medico.crm || '---'}
                        </span>
                        {medico.isFavorite && (
                            <span className="px-2 py-0.5 bg-amber-400/10 text-amber-500 text-[10px] font-black rounded-md uppercase tracking-widest border border-amber-400/20 flex items-center gap-1">
                                <Star size={10} fill="currentColor" /> Favorito
                            </span>
                        )}
                        {medico.isClient && (
                            <span className="px-2 py-0.5 bg-brand-teal/10 text-brand-teal text-[10px] font-black rounded-md uppercase tracking-widest border border-brand-teal/20 flex items-center gap-1">
                                <CheckCircle2 size={10} fill="currentColor" /> Cliente
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <button onClick={onFechar} className="p-3 text-slate-300 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded-full transition-all"><X size={24} /></button>
        </div>

        {/* Dash de Métricas Rápidas (Padrão Android Premium) */}
        </div>

        {/* Quick Status Toggles */}
        <div className="flex gap-3 mb-4">
            <button 
                onClick={() => onAtualizarMedico(medico.id, { isFavorite: !medico.isFavorite })}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${
                    medico.isFavorite 
                    ? 'bg-amber-400 border-amber-400 text-white shadow-lg shadow-amber-400/20' 
                    : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400'
                }`}
            >
                <Star size={12} fill={medico.isFavorite ? 'currentColor' : 'none'} /> Favorito
            </button>
            <button 
                onClick={() => onAtualizarMedico(medico.id, { isClient: !medico.isClient })}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${
                    medico.isClient 
                    ? 'bg-brand-teal border-brand-teal text-white shadow-lg shadow-brand-teal/20' 
                    : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400'
                }`}
            >
                <CheckCircle2 size={12} fill={medico.isClient ? 'currentColor' : 'none'} /> Cliente
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 pb-40 no-scrollbar touch-pan-y">
        <div className="flex flex-col gap-10">
            <section>
                <header className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-black text-brand-dark dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ClipboardList size={14} className="text-brand-teal" /> NOTAS ESTRATÉGICAS IQ
                    </h3>
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800">
                         <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Auto-save ON</span>
                    </div>
                </header>
                <textarea 
                    value={notaCrm}
                    onChange={(e) => { setNotaCrm(e.target.value); }}
                    className="w-full neo-input min-h-[160px] !text-sm !font-bold !leading-relaxed !bg-white dark:!bg-slate-800/50 !rounded-[28px] !shadow-inner border-2 border-slate-50 dark:border-slate-800 focus:border-brand-teal transition-all p-5"
                    placeholder="Informações críticas sobre o perfil deste médico para a próxima visita..."
                />
            </section>

            <section>
                <h3 className="text-[11px] font-black text-brand-dark dark:text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                    <MessageSquare size={14} className="text-brand-teal" /> HISTÓRICO DE INTERAÇÕES
                </h3>
                <div className="space-y-4">
                    {(medico.logVisitas || []).length === 0 ? (
                        <div className="p-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[28px]">
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Nenhuma visita registrada</p>
                        </div>
                    ) : (
                        (medico.logVisitas || []).map((log, index) => (
                            <div key={log.id || `log-${index}`} className="p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[28px] border border-white dark:border-slate-800 relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-teal/20 group-hover:bg-brand-teal transition-all" />
                                <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest mb-3">
                                  {safeFormat(log.data, "eeee, dd MMMM", "---")}
                                </p>
                                <p className="text-[13px] text-slate-700 dark:text-slate-300 font-bold leading-relaxed italic">"{log.nota}"</p>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
      </div>

      {/* Thumb Zone Actions: Ação de fechar e registrar agrupadas na parte inferior */}
      <footer className="absolute bottom-6 left-8 right-8 z-10 flex flex-col gap-4">
        <AnimatePresence mode="wait">
            {!isRegistrando ? (
                <div className="flex gap-3">
                    <button
                        onClick={onFechar}
                        className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-lg"
                    >
                        <ChevronDown size={28} />
                    </button>
                    <motion.button
                        layoutId="action-btn"
                        onClick={() => setIsRegistrando(true)}
                        className="flex-[3] h-16 bg-brand-teal text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-brand-teal/20 border-b-4 border-brand-teal/20"
                    >
                        Registrar Visita
                    </motion.button>
                </div>
            ) : (
                <motion.div layoutId="action-btn" className="bg-white dark:bg-slate-800 p-8 w-full rounded-[36px] shadow-2xl border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
                        <h4 className="text-[10px] font-black text-brand-dark dark:text-white uppercase tracking-widest">Relatório em Tempo Real</h4>
                    </div>
                    <textarea 
                        autoFocus
                        value={novaNota}
                        onChange={(e) => setNovaNota(e.target.value)}
                        className="neo-input min-h-[120px] mb-6 !bg-slate-50 dark:!bg-slate-900 !text-sm !font-bold"
                        placeholder="Quais novidades da visita de hoje?"
                    />
                    <div className="flex gap-4">
                        <button onClick={() => setIsRegistrando(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl uppercase tracking-widest">DESCARTAR</button>
                        <button onClick={handleSalvarVisita} className="flex-[2] py-4 text-[10px] font-black text-white bg-brand-teal rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest">
                            <Save size={16} /> FINALIZAR RELATÓRIO
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </footer>
    </motion.div>
  );
};
