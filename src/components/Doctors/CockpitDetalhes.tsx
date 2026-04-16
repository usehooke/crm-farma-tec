import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, MapPin, 
  MessageSquare, Plus, X, Tag,
  Stethoscope, ShieldCheck, ChevronRight,
  ClipboardList, CheckCircle2, RotateCcw
} from 'lucide-react';
import type { Medico } from '../../hooks/useMedicos';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDebounce } from '../../hooks/useDebounce';

interface CockpitDetalhesProps {
  medico: Medico | null;
  onAtualizarMedico: (id: string, updates: Partial<Medico>) => void;
  onAdicionarLog: (idMedico: string, nota: string, extras?: any) => void;
  onFechar: () => void;
}

/**
 * Cockpit de Detalhes do Médico (@Agent-ActionPanel)
 * Blindado contra erros de dados e estados nulos.
 */
export const CockpitDetalhes: React.FC<CockpitDetalhesProps> = ({
  medico,
  onAtualizarMedico,
  onAdicionarLog,
  onFechar
}) => {
  // 1. Hooks (Sempre no topo, incondicionais)
  const [novaNota, setNovaNota] = useState('');
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [tipoVisita, setTipoVisita] = useState<'presencial' | 'tecnico'>('presencial');
  const [amostras, setAmostras] = useState<string[]>([]);
  const [brindes, setBrindes] = useState<string[]>([]);
  
  const [notaCrm, setNotaCrm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const debouncedNotaCrm = useDebounce(notaCrm, 400);

  // Sincroniza o estado local quando o médico troca
  useEffect(() => {
    if (medico) {
      setNotaCrm(medico.notasCrm || '');
      setIsSyncing(false);
    }
  }, [medico?.id]);

  // Auto-save Debounced (Evitando loops)
  useEffect(() => {
    if (medico && debouncedNotaCrm !== (medico.notasCrm || '')) {
      setIsSyncing(true);
      onAtualizarMedico(medico.id, { notasCrm: debouncedNotaCrm });
      
      const timer = setTimeout(() => setIsSyncing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [debouncedNotaCrm]); // Removido medico?.id para evitar disparos duplos na troca

  // Helper de formatação segura
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

  // 2. Early Return (Obrigatório após Hooks)
  if (!medico) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 h-full select-none">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <User size={40} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-black text-slate-400">Nenhum médico selecionado</h3>
      </div>
    );
  }

  const handleSalvarVisita = () => {
    if (!novaNota.trim()) return;
    onAdicionarLog(medico.id, novaNota, {
        tipo: tipoVisita,
        amostras,
        brindes
    });
    setNovaNota('');
    setAmostras([]);
    setBrindes([]);
    setIsRegistrando(false);
  };

  const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
        setList(list.filter(i => i !== item));
    } else {
        setList([...list, item]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden relative border-l border-slate-200">
      <header className="p-8 pb-4">
        <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-teal/5 flex items-center justify-center text-brand-teal border border-brand-teal/10">
                    <User size={30} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-brand-dark tracking-tight leading-none mb-1">{medico.nome}</h2>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Stethoscope size={12} className="text-brand-teal" />
                      {medico.especialidade} | CRM: {medico.crm || '---'}
                    </p>
                </div>
            </div>
            <button onClick={onFechar} className="p-2 text-slate-300 hover:text-danger active:scale-90"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-white text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Visita</p>
                <p className="text-[10px] font-black">{safeFormat(medico.ultimoContato, 'dd MMM yyyy', 'Pendente')}</p>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-white text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Próxima</p>
                <p className="text-[10px] font-black text-brand-teal">{safeFormat(medico.proximaVisita, 'dd/MM/yyyy', '---')}</p>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-white text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-[9px] font-black text-slate-700">{medico.status || 'Potencial'}</p>
            </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 pb-32 no-scrollbar">
        <div className="flex flex-col gap-8">
            <section>
                <h3 className="text-[9px] font-black text-brand-dark uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ClipboardList size={12} /> BLOCO DE NOTAS ESTRATÉGICAS
                </h3>
                <textarea 
                    value={notaCrm}
                    onChange={(e) => { setNotaCrm(e.target.value); setIsSyncing(true); }}
                    onBlur={() => onAtualizarMedico(medico.id, { notasCrm: notaCrm })}
                    className="w-full neo-input min-h-[140px] !text-sm !font-semibold !rounded-2xl"
                    placeholder="Informações fixas sobre o perfil do médico..."
                />
            </section>

            <section>
                <h3 className="text-[9px] font-black text-brand-dark uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MessageSquare size={12} /> HISTÓRICO DE VISITAS
                </h3>
                <div className="space-y-4">
                    {(medico.logVisitas || []).length === 0 ? (
                        <p className="text-[10px] text-slate-300 italic">Nenhum registro encontrado.</p>
                    ) : (
                        (medico.logVisitas || []).map((log, index) => (
                            <div key={log.id || `log-${index}`} className="p-4 bg-white rounded-2xl border border-slate-50">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">
                                  {safeFormat(log.data, "eeee, dd MMMM", "---")}
                                </p>
                                <p className="text-xs text-slate-600 font-bold leading-relaxed">"{log.nota}"</p>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
      </div>

      <footer className="absolute bottom-6 left-8 right-8 z-10">
        <AnimatePresence mode="wait">
            {!isRegistrando ? (
                <motion.button
                    layoutId="action-btn"
                    onClick={() => setIsRegistrando(true)}
                    className="w-full h-14 bg-brand-teal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-teal/20"
                >
                    Registrar Nova Visita
                </motion.button>
            ) : (
                <motion.div layoutId="action-btn" className="neo-card p-6 w-full">
                    <textarea 
                        autoFocus
                        value={novaNota}
                        onChange={(e) => setNovaNota(e.target.value)}
                        className="neo-input min-h-[100px] mb-4"
                        placeholder="Relatório da visita..."
                    />
                    <div className="flex gap-4">
                        <button onClick={() => setIsRegistrando(false)} className="flex-1 py-3 text-[10px] font-black text-slate-400 bg-slate-50 rounded-xl">CANCELAR</button>
                        <button onClick={handleSalvarVisita} className="flex-[2] py-3 text-[10px] font-black text-white bg-brand-teal rounded-xl shadow-lg">SALVAR</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </footer>
    </div>
  );
};
