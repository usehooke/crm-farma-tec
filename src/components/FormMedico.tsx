import { useState } from 'react';
import type { Medico } from '../hooks/useMedicos';
import { useConfig } from '../context/ConfigContext';
import { useModal } from '../context/ModalContext';
import { X, AlertCircle, User, Briefcase, MapPin, Phone, Hash } from 'lucide-react';

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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center z-[70] p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-brand-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto pb-8 sm:pb-0 animate-in slide-in-from-bottom-2 duration-300 border border-white/20">
                <header className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-inherit z-10">
                    <div>
                        <h2 className="text-xl font-black text-brand-dark dark:text-white leading-none">
                            {medicoEditando ? 'Editar Ficha' : 'Novo Médico IQ'}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cadastro de Relacionamento</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Campo de Nome com Ícone (Visibilidade Máxima) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-dark dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <User size={12} className="text-brand-teal" /> Nome Completo
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            className="neo-input !bg-white dark:!bg-slate-800/50 !shadow-sm border-2 border-slate-100 dark:border-slate-700/50 focus:border-brand-teal text-brand-dark dark:text-white"
                            placeholder="Ex: Dr. Alessandro S. P."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={12} className="text-brand-teal" /> CRM
                            </label>
                            <input
                                type="text"
                                value={formData.crm || ''}
                                onChange={e => setFormData({ ...formData, crm: e.target.value })}
                                className="neo-input !bg-white dark:!bg-slate-800/50"
                                placeholder="12345/SP"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={12} className="text-brand-teal" /> Especialidade
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.especialidade}
                                onChange={e => setFormData({ ...formData, especialidade: e.target.value })}
                                className="neo-input !bg-white dark:!bg-slate-800/50"
                                placeholder="Ex: Ginecologia"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={12} className="text-brand-teal" /> Clínica/Cidade
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.localizacao}
                                onChange={e => setFormData({ ...formData, localizacao: e.target.value })}
                                className="neo-input !bg-white dark:!bg-slate-800/50"
                                placeholder="Itaim Bibi, SP"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={12} className="text-brand-teal" /> WhatsApp
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.telefone}
                                onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                className="neo-input !bg-white dark:!bg-slate-800/50"
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status do Funil</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark dark:text-white"
                            >
                                {STATUS_OPCIONAL.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Próxima Visita</label>
                            <input
                                type="date"
                                value={formData.dataRetorno || ''}
                                onChange={e => setFormData({ ...formData, dataRetorno: e.target.value })}
                                className="w-full bg-brand-teal/5 dark:bg-brand-teal/10 border-2 border-brand-teal/20 rounded-xl px-4 py-3 text-sm font-bold text-brand-teal"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classificação Estratégica</label>
                        <div className="flex flex-wrap gap-2">
                            {vipTags.map(tag => {
                                const isSelected = formData.tags?.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${
                                            isSelected 
                                            ? 'bg-brand-teal text-white border-brand-teal shadow-lg shadow-brand-teal/20' 
                                            : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <footer className="pt-8 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl">CANCELAR</button>
                        <button type="submit" className="flex-[2] py-4 text-[10px] font-black text-white bg-brand-teal rounded-2xl shadow-xl shadow-brand-teal/20 active:scale-95 transition-all">
                           {medicoEditando ? 'ATUALIZAR FICHA' : 'CRIAR FICHA IQ'}
                        </button>
                    </footer>
                </form>

                {duplicataDetectada && (
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-20 flex flex-col justify-center items-center p-8 text-center animate-in fade-in zoom-in-95">
                        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <AlertCircle size={40} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Médico já cadastrado!</h3>
                        <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                            Identificamos que <span className="text-white font-bold">{duplicataDetectada.nome}</span> já possui uma ficha ativa no sistema.
                        </p>
                        <div className="flex gap-4 w-full">
                            <button onClick={() => setDuplicataDetectada(null)} className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px]">VOLTAR</button>
                            <button onClick={() => { onClose(); openModal('historico', duplicataDetectada); }} className="flex-2 py-4 bg-brand-teal text-white rounded-2xl font-black text-[10px] shadow-lg shadow-brand-teal/30">ABRIR PERFIL</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
