import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, MapPin, 
  MessageSquare, Plus, X, Tag,
  Stethoscope, ShieldCheck, ChevronRight,
  ClipboardList, CheckCircle2, RotateCcw
} from 'lucide-react';
import type { Medico } from '../../hooks/useMedicos';
import { format } from 'date-fns';
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
 * Focado em densidade de informações, Neumorfismo Premium e ações rápidas.
 * Inclui agora o Bloco de Notas Estratégicas com Auto-save.
 */
export const CockpitDetalhes: React.FC<CockpitDetalhesProps> = ({
  medico,
  onAtualizarMedico,
  onAdicionarLog,
  onFechar
}) => {
  const [novaNota, setNovaNota] = useState('');
  const [isRegistrando, setIsRegistrando] = useState(false);
  
  // Estado local para o Bloco de Notas Estratégicas
  const [notaCrm, setNotaCrm] = useState(medico?.notasCrm || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const debouncedNotaCrm = useDebounce(notaCrm, 400); // Debounce reduzido para agilizar no campo

  // Sincroniza o estado local quando o médico troca
  useEffect(() => {
    if (medico) {
      setNotaCrm(medico.notasCrm || '');
      setIsSyncing(false);
    }
  }, [medico?.id]);

  // Função de persistência forçada (usada no Blur ou Troca de Médico)
  const persistirNota = (valor: string) => {
    if (medico && valor !== (medico.notasCrm || '')) {
      onAtualizarMedico(medico.id, { notasCrm: valor });
    }
  };

  // Efeito de Auto-save (Debounce)
  useEffect(() => {
    if (medico && debouncedNotaCrm !== (medico.notasCrm || '')) {
      setIsSyncing(true);
      persistirNota(debouncedNotaCrm);
      
      const timer = setTimeout(() => setIsSyncing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [debouncedNotaCrm, medico?.id]);

  if (!medico) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-surface h-full select-none">
        <div className="w-24 h-24 rounded-full bg-slate-200/50 flex items-center justify-center mb-6">
          <User size={48} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Selecione um Profissional</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Escolha um médico na lista ao lado para visualizar o cockpit detalhado e registrar visitas.
        </p>
      </div>
    );
  }

  const [tipoVisita, setTipoVisita] = useState<'presencial' | 'tecnico'>('presencial');
  const [amostras, setAmostras] = useState<string[]>([]);
  const [brindes, setBrindes] = useState<string[]>([]);

  const handleSalvarVisita = () => {
    if (!novaNota.trim()) return;
    onAdicionarLog(medico!.id, novaNota, {
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
    <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden relative border-l border-slate-200 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
      {/* Header com Foto e Info Básica */}
      <header className="p-8 pb-0">
        <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-[var(--radius-corp)] bg-white shadow-soft-out p-1 overflow-hidden">
                        <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <User size={40} className="text-slate-400" />
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center text-white border-4 border-white shadow-lg shadow-brand-teal/30">
                        <ShieldCheck size={16} />
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-black text-brand-dark tracking-tight leading-none">{medico.nome}</h2>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-wider">
                            CRM: {medico.crm || '---'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1.5 font-bold">
                            <Stethoscope size={14} className="text-brand-teal" />
                            {medico.especialidade}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                            <MapPin size={14} />
                            {medico.localizacao}
                        </span>
                    </div>
                </div>
            </div>

            <button 
                onClick={onFechar}
                className="p-2 rounded-full text-slate-300 hover:text-danger hover:bg-danger/10 transition-all active:scale-90"
            >
                <X size={24} />
            </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="neo-card-pressed !shadow-soft-in p-4 border border-white/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-center">Última Visita</p>
                <p className="text-xs font-black text-brand-dark text-center">
                    {medico.ultimoContato ? format(new Date(medico.ultimoContato), 'dd MMM yyyy', { locale: ptBR }) : 'N/A'}
                </p>
            </div>
            <div className="neo-card-pressed !shadow-soft-in p-4 border border-white/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-center">Próxima Visita</p>
                <p className="text-xs font-black text-brand-teal text-center">
                    {medico.proximaVisita ? format(new Date(medico.proximaVisita), 'dd/MM/yyyy', { locale: ptBR }) : 'Pendente'}
                </p>
            </div>
            <div className="neo-card-pressed !shadow-soft-in p-4 border border-white/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-center">Status Vendas</p>
                <div className="flex items-center justify-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${medico.status === 'Parceiro Ativo' ? 'bg-success' : 'bg-warning'}`} />
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{medico.status}</p>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-8 pb-32 no-scrollbar">
        <div className="flex flex-col gap-8">
            
            {/* NOVO: Bloco de Notas Estratégicas (Sticky Note Style) */}
            <section className="relative group">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em] flex items-center gap-2">
                        <ClipboardList size={12} className="text-brand-teal" />
                        Notas Estratégicas
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <AnimatePresence>
                        {isSyncing ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-1.5"
                          >
                            <RotateCcw size={10} className="text-brand-teal animate-spin" />
                            <span className="text-[8px] font-black text-brand-teal uppercase tracking-tighter">Sincronizando</span>
                          </motion.div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            className="flex items-center gap-1.5"
                          >
                            <CheckCircle2 size={10} className="text-slate-400" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Salvo na Nuvem</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                </div>

                <div className="relative">
                    <textarea 
                        value={notaCrm}
                        onChange={(e) => {
                          setNotaCrm(e.target.value);
                          setIsSyncing(true);
                        }}
                        onBlur={() => persistirNota(notaCrm)} // Salva IMEDIATAMENTE ao sair do campo
                        placeholder="Anote aqui informações fixas relevantes: hobbies do médico, preferências de produtos, dias que ele costuma operar..."
                        className="w-full neo-input min-h-[160px] p-6 text-sm font-semibold text-slate-600 bg-brand-white/50 border border-white/40 leading-relaxed placeholder:text-slate-300 placeholder:italic transition-all focus:bg-white"
                    />
                    <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-10 group-focus-within:opacity-30 transition-opacity">
                         <div className="w-full h-full bg-gradient-to-bl from-brand-teal to-transparent rounded-tr-3xl" />
                    </div>
                </div>
            </section>

            {/* Contact Details Section */}
            <section className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm">
                <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Tag size={12} className="text-brand-teal" />
                    Detalhes de Contato
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer active:scale-[0.99]" onClick={() => window.open(`tel:${medico.telefone}`, '_self')}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp Profissional</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{medico.telefone}</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-teal transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </section>

            {/* Visit Timeline Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em] flex items-center gap-2">
                        <MessageSquare size={12} className="text-brand-teal" />
                        Histórico de Visitas
                    </h3>
                    <button className="text-[10px] font-black text-brand-teal hover:underline tracking-tight">Ver Tudo</button>
                </div>

                <div className="space-y-6">
                    {medico.logVisitas.length === 0 ? (
                        <div className="p-12 neo-card-pressed !shadow-soft-in text-center border-2 border-dashed border-white bg-white/20">
                            <p className="text-xs text-slate-400 italic font-medium">Nenhuma visita registrada recentemente.</p>
                        </div>
                    ) : (
                        medico.logVisitas.map((log) => (
                            <div key={log.id} className="relative pl-8 pb-8 border-l-2 border-slate-100 last:pb-0">
                                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-brand-teal shadow-xl" />
                                <div className="neo-card bg-white p-6 border border-white">
                                    <div className="flex justify-between items-start mb-3">
                                        <p className="text-[10px] font-black text-brand-dark uppercase tracking-widest">
                                            {format(new Date(log.data), "eeee, dd 'de' MMMM", { locale: ptBR })}
                                        </p>
                                        <span className={`text-[8px] px-2 py-0.5 font-black rounded-lg uppercase ${log.tipo === 'tecnico' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {log.tipo === 'tecnico' ? 'Inquérito Científico' : (log.tipo || 'Presencial')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed font-semibold italic">"{log.nota}"</p>
                                    
                                    {(log.amostras?.length || log.brindes?.length) && (
                                        <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-50">
                                            {log.amostras?.map(a => (
                                                <span key={a} className="text-[8px] font-black text-brand-teal uppercase px-1.5 py-0.5 bg-brand-teal/5 rounded">Amostra: {a}</span>
                                            ))}
                                            {log.brindes?.map(b => (
                                                <span key={b} className="text-[8px] font-black text-slate-400 uppercase px-1.5 py-0.5 bg-slate-50 rounded">Brinde: {b}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
      </div>

      {/* Floating Action Bar / Registrar Visita */}
      <footer className="absolute bottom-6 left-8 right-8 z-10">
        <AnimatePresence mode="wait">
            {!isRegistrando ? (
                <motion.button
                    layoutId="action-btn"
                    onClick={() => setIsRegistrando(true)}
                    className="w-full h-16 neo-button-primary !rounded-[var(--radius-corp)] !text-[10px] !uppercase !tracking-[0.3em] shadow-xl shadow-brand-teal/30 hover:scale-[1.02]"
                >
                    <Plus size={20} strokeWidth={3} />
                    Registrar Visita
                </motion.button>
            ) : (
                <motion.div
                    layoutId="action-btn"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="neo-card p-6 w-full border border-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em]">Relatório de Campo</h4>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setTipoVisita('presencial')}
                                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${tipoVisita === 'presencial' ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-400'}`}
                             >Comercial</button>
                             <button 
                                onClick={() => setTipoVisita('tecnico')}
                                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${tipoVisita === 'tecnico' ? 'bg-purple-500 text-white shadow-lg shadow-purple-200' : 'bg-slate-100 text-slate-400'}`}
                             >Científico</button>
                        </div>
                    </div>

                    <textarea 
                        autoFocus
                        value={novaNota}
                        onChange={(e) => setNovaNota(e.target.value)}
                        placeholder="Relate como foi a recepção, pontos discutidos e interesse..."
                        className="neo-input min-h-[100px] mb-4 resize-none !rounded-2xl !text-xs"
                    />

                    {/* Amostras e Brindes */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Amostras</p>
                            <div className="flex flex-wrap gap-1">
                                {['Amostra A', 'Amostra B', 'Amostra C'].map(item => (
                                    <button 
                                        key={item}
                                        onClick={() => toggleItem(item, amostras, setAmostras)}
                                        className={`px-2 py-1 rounded-lg text-[8px] font-bold border transition-all ${amostras.includes(item) ? 'bg-brand-teal/10 border-brand-teal text-brand-teal' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >+ {item}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Brindes</p>
                            <div className="flex flex-wrap gap-1">
                                {['Caneta', 'Bloco', 'Copo'].map(item => (
                                    <button 
                                        key={item}
                                        onClick={() => toggleItem(item, brindes, setBrindes)}
                                        className={`px-2 py-1 rounded-lg text-[8px] font-bold border transition-all ${brindes.includes(item) ? 'bg-brand-teal/10 border-brand-teal text-brand-teal' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >+ {item}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsRegistrando(false)}
                            className="flex-1 px-4 py-4 rounded-2xl bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSalvarVisita}
                            disabled={!novaNota.trim()}
                            className={`flex-[2] !rounded-2xl !text-[10px] !uppercase !tracking-[0.2em] shadow-lg disabled:opacity-50 hover:brightness-110 active:scale-[0.98] transition-all py-4 font-black flex items-center justify-center gap-2 ${tipoVisita === 'tecnico' ? 'bg-purple-600 text-white shadow-purple-200' : 'bg-brand-teal text-white shadow-brand-teal/20'}`}
                        >
                            {tipoVisita === 'tecnico' ? 'Salvar Inquérito Científico' : 'Salvar Visita Comercial'}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </footer>
    </div>
  );
};
