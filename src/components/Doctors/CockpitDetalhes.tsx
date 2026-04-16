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
 * Focado em densidade de informações e ações rápidas.
 */
export const CockpitDetalhes: React.FC<CockpitDetalhesProps> = ({
  medico,
  onAtualizarMedico,
  onAdicionarLog,
  onFechar
}) => {
  // 1. Hooks (Sempre no início)
  const [novaNota, setNovaNota] = useState('');
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [tipoVisita, setTipoVisita] = useState<'presencial' | 'tecnico'>('presencial');
  const [amostras, setAmostras] = useState<string[]>([]);
  const [brindes, setBrindes] = useState<string[]>([]);
  
  const [notaCrm, setNotaCrm] = useState(medico?.notasCrm || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const debouncedNotaCrm = useDebounce(notaCrm, 400);

  // Sincroniza o estado local quando o médico troca
  useEffect(() => {
    if (medico) {
      setNotaCrm(medico.notasCrm || '');
      setIsSyncing(false);
    }
  }, [medico?.id]);

  // Auto-save Debounced
  useEffect(() => {
    if (medico && debouncedNotaCrm !== (medico.notasCrm || '')) {
      setIsSyncing(true);
      onAtualizarMedico(medico.id, { notasCrm: debouncedNotaCrm });
      
      const timer = setTimeout(() => setIsSyncing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [debouncedNotaCrm, medico?.id]);

  // Helper para formatação segura de data (Evita Tela Branca)
  const safeFormat = (date: string | undefined, formatStr: string, fallback: string) => {
    if (!date) return fallback;
    const d = new Date(date);
    if (!isValid(d)) return fallback;
    return format(d, formatStr, { locale: ptBR });
  };

  // 2. Early Return (Após os Hooks)
  if (!medico) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-surface h-full select-none">
        <div className="w-24 h-24 rounded-full bg-slate-200/50 flex items-center justify-center mb-6">
          <User size={48} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 font-black tracking-tight">Selecione um Profissional</h3>
        <p className="text-slate-500 text-sm max-w-xs font-semibold">
          Escolha um médico na lista ao lado para visualizar o cockpit e registrar visitas.
        </p>
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
    <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden relative border-l border-slate-200 lg:border-none">
      {/* Header com Foto e Info Básica */}
      <header className="p-8 pb-0">
        <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border border-white shadow-soft-out">
                    <User size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-brand-dark tracking-tight leading-none mb-1">{medico.nome}</h2>
                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1.5 font-bold">
                            <Stethoscope size={14} className="text-brand-teal" />
                            {medico.especialidade}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                            CRM: {medico.crm || '---'}
                        </span>
                    </div>
                </div>
            </div>

            <button onClick={onFechar} className="p-2 rounded-full text-slate-300 hover:text-danger active:scale-90">
                <X size={24} />
            </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="neo-card-pressed p-4 border border-white/50 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Última Visita</p>
                <p className="text-xs font-black text-brand-dark">
                  {safeFormat(medico.ultimoContato, 'dd MMM yyyy', 'N/A')}
                </p>
            </div>
            <div className="neo-card-pressed p-4 border border-white/50 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Próxima Visita</p>
                <p className="text-xs font-black text-brand-teal">
                   {safeFormat(medico.proximaVisita, 'dd/MM/yyyy', 'Pendente')}
                </p>
            </div>
            <div className="neo-card-pressed p-4 border border-white/50 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                <p className="text-[10px] font-black text-slate-700 uppercase">{medico.status || 'Potencial'}</p>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-8 pb-32 no-scrollbar">
        <div className="flex flex-col gap-8">
            
            <section>
                <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ClipboardList size={12} className="text-brand-teal" />
                    Notas Estratégicas
                </h3>
                <textarea 
                    value={notaCrm}
                    onChange={(e) => {
                      setNotaCrm(e.target.value);
                      setIsSyncing(true);
                    }}
                    onBlur={() => onAtualizarMedico(medico.id, { notasCrm: notaCrm })}
                    placeholder="Anote aqui informações relevantes..."
                    className="w-full neo-input min-h-[140px] p-6 text-sm font-semibold text-slate-600 bg-brand-white/50 transition-all focus:bg-white"
                />
            </section>

            <section>
                <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <MessageSquare size={12} className="text-brand-teal" />
                    Histórico de Visitas
                </h3>
                <div className="space-y-4">
                    {medico.logVisitas.length === 0 ? (
                        <p className="text-xs text-slate-300 italic">Nenhuma visita registrada.</p>
                    ) : (
                        medico.logVisitas.map((log, index) => (
                            <div key={log.id || `log-${index}`} className="p-4 bg-white rounded-2xl border border-slate-50 shadow-sm transition-all hover:shadow-md">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">
                                        {safeFormat(log.data, "eeee, dd 'de' MMMM", "Data Inválida")}
                                    </p>
                                    <span className={`text-[8px] px-2 py-0.5 font-black rounded-lg uppercase ${log.tipo === 'tecnico' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {log.tipo === 'tecnico' ? 'Científico' : 'Comercial'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 font-semibold leading-relaxed">"{log.nota}"</p>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
      </div>

      {/* Floating Action Bar */}
      <footer className="absolute bottom-6 left-8 right-8 z-10">
        <AnimatePresence mode="wait">
            {!isRegistrando ? (
                <motion.button
                    layoutId="action-btn"
                    onClick={() => setIsRegistrando(true)}
                    className="w-full h-16 neo-button-primary !rounded-2xl !text-[10px] !uppercase !tracking-[0.3em] shadow-xl"
                >
                    <Plus size={20} className="mr-2" /> Registrar Visita
                </motion.button>
            ) : (
                <motion.div
                    layoutId="action-btn"
                    className="neo-card p-6 w-full border border-white"
                >
                    <textarea 
                        autoFocus
                        value={novaNota}
                        onChange={(e) => setNovaNota(e.target.value)}
                        placeholder="Relate como foi a recepção..."
                        className="neo-input min-h-[100px] mb-4 !rounded-2xl !text-xs"
                    />
                    <div className="flex gap-4">
                        <button onClick={() => setIsRegistrando(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 bg-slate-50 rounded-2xl">DESCARTAR</button>
                        <button onClick={handleSalvarVisita} className="flex-[2] py-4 text-[10px] font-black text-white bg-brand-teal rounded-2xl shadow-lg shadow-brand-teal/20">SALVAR REGISTRO</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </footer>
    </div>
  );
};
