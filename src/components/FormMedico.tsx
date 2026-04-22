import React, { useState } from 'react';
import type { Medico } from '../hooks/useMedicos';
import { useConfig } from '../context/ConfigContext';
import { useModal } from '../context/ModalContext';
import { X, AlertCircle, User, Briefcase, MapPin, Phone, Hash, Calendar, Star, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface FormMedicoProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (medico: Omit<Medico, 'id' | 'logVisitas'>) => void;
    medicoEditando?: Medico | null;
}

const STATUS_OPCIONAL = [
    { value: 'Prospecção', label: 'Prospecção' },
    { value: 'Apresentada', label: 'Apresentada' },
    { value: 'Parceiro Ativo', label: 'Parceiro Ativo' },
    { value: 'Monitoramento', label: 'Monitoramento' }
];

const Activity = ({ size, className }: { size: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

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
        tags: medicoEditando?.tags || [],
        isFavorite: medicoEditando?.isFavorite || false,
        isClient: medicoEditando?.isClient || false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
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
        const newErrors: Record<string, string> = {};

        if (formData.nome.trim().length < 3) newErrors.nome = 'Nome muito curto.';
        if (!formData.especialidade) newErrors.especialidade = 'Área obrigatória.';
        if (!formData.telefone) newErrors.telefone = 'Telefone obrigatório.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

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
            <div className="bg-white dark:bg-slate-900 sm:rounded-[40px] rounded-t-[40px] shadow-2xl w-full max-w-lg max-h-[94vh] overflow-y-auto pb-10 sm:pb-0 animate-in slide-in-from-bottom duration-500 border-t-8 border-brand-teal sm:border-t-0">
                
                <header className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-inherit z-10">
                    <div>
                        <h2 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight leading-none">
                            {medicoEditando ? 'Edição IQ' : 'Novo Médico'}
                        </h2>
                        <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                           <Activity size={10} className="text-brand-teal" /> Elite Intelligence
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X size={24} />
                    </Button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Seletores Rápidos de Elite */}
                    <div className="flex gap-3 mb-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
                            className={`flex-1 py-4 rounded-[24px] border-2 transition-all flex items-center justify-center gap-3 active:scale-95 ${
                                formData.isFavorite 
                                ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' 
                                : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-800 text-slate-400 opacity-60'
                            }`}
                        >
                            <Star size={18} fill={formData.isFavorite ? "currentColor" : "none"} className={formData.isFavorite ? "animate-bounce-short" : ""} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Favorito</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isClient: !formData.isClient })}
                            className={`flex-1 py-4 rounded-[24px] border-2 transition-all flex items-center justify-center gap-3 active:scale-95 ${
                                formData.isClient 
                                ? 'bg-brand-teal/5 border-brand-teal/20 text-brand-teal shadow-sm' 
                                : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-800 text-slate-400 opacity-60'
                            }`}
                        >
                            <Check size={18} className={formData.isClient ? "stroke-[4px]" : ""} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Já Cliente</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Nome Completo"
                            placeholder="Ex: Dr. Ricardo Souza"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            leftIcon={User}
                            error={errors.nome}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="CRM"
                            placeholder="12345/SP"
                            value={formData.crm || ''}
                            onChange={e => setFormData({ ...formData, crm: e.target.value })}
                            leftIcon={Hash}
                        />
                        <Input
                            label="Área"
                            placeholder="Dermatologia"
                            value={formData.especialidade}
                            onChange={e => setFormData({ ...formData, especialidade: e.target.value })}
                            leftIcon={Briefcase}
                            error={errors.especialidade}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Localização"
                            placeholder="Unidade Sul"
                            value={formData.localizacao}
                            onChange={e => setFormData({ ...formData, localizacao: e.target.value })}
                            leftIcon={MapPin}
                        />
                        <Input
                            label="Contato"
                            type="tel"
                            placeholder="(11) 9..."
                            value={formData.telefone}
                            onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                            leftIcon={Phone}
                            error={errors.telefone}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Relacionamento"
                            value={formData.status}
                            options={STATUS_OPCIONAL}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        />
                        <Input
                            label="Próximo Retorno"
                            type="date"
                            value={formData.dataRetorno || ''}
                            onChange={e => setFormData({ ...formData, dataRetorno: e.target.value })}
                            leftIcon={Calendar}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-2">
                            <Star size={12} className="text-brand-teal-400" /> Tags Estratégicas
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {vipTags.map(tag => {
                                const isSelected = formData.tags?.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 flex items-center gap-2 ${
                                            isSelected 
                                            ? 'bg-brand-teal-400 text-white border-brand-teal-400 shadow-lg shadow-brand-teal-400/20' 
                                            : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-50 dark:border-slate-800'
                                        }`}
                                    >
                                        {isSelected && <Check size={10} />}
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <footer className="pt-6 flex gap-4">
                        <Button variant="secondary" onClick={onClose} className="flex-1 h-14 uppercase tracking-widest text-[10px]">
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-[2] h-14 uppercase tracking-widest text-[10px]">
                            {medicoEditando ? 'Salvar IQ' : 'Efetivar Cadastro'}
                        </Button>
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
