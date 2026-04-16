import { useState } from 'react';
import type { Medico } from '../hooks/useMedicos';
import { useConfig } from '../context/ConfigContext';
import { useModal } from '../context/ModalContext';
import { X, AlertCircle, User, Briefcase, MapPin, Phone, Hash, Calendar, Star } from 'lucide-react';

interface FormMedicoProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (medico: Omit<Medico, 'id' | 'logVisitas'>) => void;
    medicoEditando?: Medico | null;
}

const STATUS_OPCIONAL = ['Prospecção', 'Apresentada', 'Parceiro Ativo', 'Monitoramento'] as const;

export function FormMedico({ isOpen, onClose, onSave, medicoEditando }: FormMedicoProps) {
    const [formData, setFormData] = useState<Omit<Medico, 'id' | 'logVisitas'>>({
        nome: medicoEditando?.nome || '',
        crm: medicoEditando?.crm || '',
        especialidade: medicoEditando?.especialidade || '',
        localizacao: medicoEditando?.localizacao || '',
        telefone: medicoEditando?.telefone || '',
        status: medicoEditando?.status || 'Prospecção',
        ultimoContato: medicoEditando?.ultimoContato || new Date().toISOString(),
        dataRetorno: medicoEditando?.dataRetorno || '',
        tags: medicoEditando?.tags || []
    });
    const { vipTags, medicos } = useConfig();
    const { openModal } = useModal();
    const [duplicataDetectada, setDuplicataDetectada] = useState<Medico | null>(null);

    const toggleTag = (tagId: string) => {
        setFormData(prev => {
            const tags = prev.tags || [];
            if (tags.includes(tagId)) {
                return { ...prev, tags: tags.filter(t => t !== tagId) };
            }
            return { ...prev, tags: [...tags, tagId] };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!medicoEditando) {
            const tempName = formData.nome.trim().toUpperCase();
            const jaExiste = medicos.find(m => m.nome.trim().toUpperCase() === tempName);
            if (jaExiste) {
                setDuplicataDetectada(jaExiste);
                return;
            }
        }
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center z-[100] p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-brand-white dark:bg-slate-900 sm:rounded-[40px] rounded-t-[40px] shadow-2xl w-full max-w-lg max-h-[94vh] overflow-y-auto pb-10 sm:pb-0 animate-in slide-in-from-bottom duration-500 border-t-8 border-brand-teal sm:border-t-0">
                
                {/* Visual Handle para fechamento (Swipe UI) */}
                <div className="w-full flex justify-center pt-4 sm:hidden">
                    <div className="w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>

                <header className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-inherit z-10">
                    <div>
                        <h2 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight leading-none">
                            {medicoEditando ? 'Edição IQ' : 'Ficha Novo Médico'}
                        </h2>
                        <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                           <Activity size={10} className="text-brand-teal" /> Inteligência de Relacionamento
                        </p>
                    </div>
                    <button onClick={onClose} className="p-4 text-slate-300 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded-full transition-all active:rotate-90">
                        <X size={26} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Campo Principal - Nome (Impacto Visual) */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-brand-dark dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                           <User size={14} className="text-brand-teal" /> NOME COMPLETO
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800/50 shadow-inner rounded-2xl px-5 py-4 text-base font-bold text-brand-dark dark:text-white border-2 border-slate-50 dark:border-slate-800 focus:border-brand-teal outline-none transition-all placeholder:text-slate-300"
                            placeholder="Dr. Nome Sobrenome"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={12} className="text-brand-teal" /> CRM
                            </label>
                            <input
                                type="text"
                                value={formData.crm || ''}
                                onChange={e => setFormData({ ...formData, crm: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800/30 rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark dark:text-white border-2 border-transparent focus:border-brand-teal transition-all"
                                placeholder="12345/SP"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={12} className="text-brand-teal" /> ÁREA
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.especialidade}
                                onChange={e => setFormData({ ...formData, especialidade: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800/30 rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark dark:text-white border-2 border-transparent focus:border-brand-teal transition-all"
                                placeholder="Dermatologia"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={12} className="text-brand-teal" /> CLINICA / BAIRRO
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.localizacao}
                                onChange={e => setFormData({ ...formData, localizacao: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800/30 rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark dark:text-white border-2 border-transparent focus:border-brand-teal transition-all"
                                placeholder="Unidade Sul"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={12} className="text-brand-teal" /> CONTATO
                            </label>
                            <input
                                required
                                type="tel"
                                value={formData.telefone}
                                onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800/30 rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark dark:text-white border-2 border-transparent focus:border-brand-teal transition-all"
                                placeholder="(11) 9..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">RELACIONAMENTO</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm font-black text-brand-dark dark:text-white appearance-none"
                            >
                                {STATUS_OPCIONAL.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-brand-teal uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} /> RETORNO 📅
                            </label>
                            <input
                                type="date"
                                value={formData.dataRetorno || ''}
                                onChange={e => setFormData({ ...formData, dataRetorno: e.target.value })}
                                className="w-full bg-brand-teal/5 dark:bg-brand-teal/10 border-2 border-brand-teal/20 rounded-2xl px-4 py-4 text-sm font-black text-brand-teal shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Star size={12} className="text-brand-teal" /> TAGS ESTRATÉGICAS
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {vipTags.map(tag => {
                                const isSelected = formData.tags?.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                                            isSelected 
                                            ? 'bg-brand-teal text-white border-brand-teal shadow-xl shadow-brand-teal/20' 
                                            : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <footer className="pt-10 flex gap-4 pb-2">
                        <button type="button" onClick={onClose} className="flex-1 py-5 text-[11px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-[28px] uppercase tracking-widest">CANCELAR</button>
                        <button type="submit" className="flex-[2] py-5 text-[11px] font-black text-white bg-brand-teal rounded-[28px] shadow-2xl shadow-brand-teal/30 hover:bg-brand-teal/90 active:scale-95 transition-all uppercase tracking-widest">
                           {medicoEditando ? 'SALVAR ALTERAÇÕES' : 'EFETIVAR CADASTRO'}
                        </button>
                    </footer>
                </form>

                {duplicataDetectada && (
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-[110] flex flex-col justify-center items-center p-10 text-center animate-in fade-in zoom-in-95">
                        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-8">
                            <AlertCircle size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3">Já cadastrado!</h3>
                        <p className="text-base text-slate-300 mb-10 leading-relaxed font-bold">
                            Encontramos <span className="text-white">{duplicataDetectada.nome}</span> em nossa base de inteligência.
                        </p>
                        <div className="flex gap-4 w-full">
                            <button onClick={() => setDuplicataDetectada(null)} className="flex-1 py-5 bg-white/10 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest">VOLTAR</button>
                            <button onClick={() => { onClose(); openModal('historico', duplicataDetectada); }} className="flex-[2] py-5 bg-brand-teal text-white rounded-3xl font-black text-[11px] shadow-2xl tracking-widest">ABRIR PERFIL</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper icon para o header
const Activity = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);
