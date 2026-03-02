import { useState } from 'react';
import type { Medico } from '../hooks/useMedicos';
import { useConfig } from '../context/ConfigContext';
import { useModal } from '../context/ModalContext';
import { X, AlertCircle } from 'lucide-react';

interface FormMedicoProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (medico: Omit<Medico, 'id' | 'logVisitas'>) => void;
    medicoEditando?: Medico | null;
}

const STATUS_OPCIONAL = ['Prospecção', 'Apresentada', 'Parceiro Ativo', 'Monitoramento'] as const;

// DEFAULT_TAGS movido para ConfigContext.tsx

export function FormMedico({ isOpen, onClose, onSave, medicoEditando }: FormMedicoProps) {
    const [formData, setFormData] = useState<Omit<Medico, 'id' | 'logVisitas'>>({
        nome: '',
        crm: '',
        especialidade: '',
        localizacao: '',
        telefone: '',
        status: 'Prospecção',
        ultimoContato: new Date().toISOString(),
        dataRetorno: '',
        tags: []
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

        // Anti-Duplicidade Check (Apenas para novos cadastros)
        if (!medicoEditando) {
            const tempName = formData.nome.trim().toUpperCase();
            const tempCity = formData.localizacao.trim().toUpperCase();
            const tempCrm = formData.crm?.trim().toUpperCase();

            const jaExiste = medicos.find(m => {
                const mName = m.nome.trim().toUpperCase();
                const mCity = m.localizacao.trim().toUpperCase();
                const mCrm = m.crm?.trim().toUpperCase();

                if (tempCrm && mCrm && tempCrm === mCrm) return true;
                if (tempName === mName && tempCity === mCity) return true;
                return false;
            });

            if (jaExiste) {
                setDuplicataDetectada(jaExiste);
                return;
            }
        }

        onSave(formData);
        onClose();
    };

    const handleAcessarPerfilDuplicado = () => {
        if (duplicataDetectada) {
            onClose();
            openModal('historico', duplicataDetectada);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex flex-col justify-end sm:justify-center items-center z-[60] p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white sm:rounded-2xl rounded-t-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto w-full sm:w-auto pb-6 sm:pb-0 animate-in slide-in-from-bottom-2 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-brand-dark">
                        {medicoEditando ? 'Editar Cadastro' : 'Novo Médico'}
                    </h2>
                    <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo</label>
                        <input
                            required
                            type="text"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Ex: Dr. João Silva"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">CRM (Opcional)</label>
                        <input
                            type="text"
                            value={formData.crm || ''}
                            onChange={e => setFormData({ ...formData, crm: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Ex: 123456-SP"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Especialidade</label>
                            <input
                                required
                                type="text"
                                value={formData.especialidade}
                                onChange={e => setFormData({ ...formData, especialidade: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="Ex: Dermatologia"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Localização</label>
                            <input
                                required
                                type="text"
                                value={formData.localizacao}
                                onChange={e => setFormData({ ...formData, localizacao: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="Ex: Clínica Sul"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone / WhatsApp</label>
                        <input
                            required
                            type="text"
                            value={formData.telefone}
                            onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Ex: (11) 99999-9999"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status no Funil</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as Medico['status'] })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                            >
                                {STATUS_OPCIONAL.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-primary mb-1.5">Agendar Retorno 📅</label>
                            <input
                                type="date"
                                value={formData.dataRetorno || ''}
                                onChange={e => setFormData({ ...formData, dataRetorno: e.target.value })}
                                className="w-full border border-primary/30 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-primary/5 shadow-inner"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data de Cadastro</label>
                        <input
                            type="date"
                            value={formData.ultimoContato ? new Date(formData.ultimoContato).toISOString().split('T')[0] : ''}
                            readOnly
                            className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl px-4 py-2.5 outline-none cursor-not-allowed"
                            title="A data do cadastro e última alteração é gerida automaticamente"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Classificação VIP</label>
                        <div className="flex flex-wrap gap-2">
                            {vipTags.map(tag => {
                                const isSelected = formData.tags?.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 ${isSelected ? `bg-slate-800 text-white border-slate-800 ring-2 ring-offset-1 ring-slate-300` : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${tag.color}`} />
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff] hover:bg-opacity-90 transition-all active:scale-95"
                        >
                            {medicoEditando ? 'Atualizar Info' : 'Criar Ficha'}
                        </button>
                    </div>
                </form>

                {/* Modal Sobreposto para Duplicidade */}
                {duplicataDetectada && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col justify-center items-center p-6 text-center animate-in fade-in zoom-in-95 duration-200 sm:rounded-2xl rounded-t-2xl">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Médico já Cadastrado!</h3>
                        <p className="text-sm text-slate-600 mb-6">
                            Encontramos um registro existente para <strong className="text-brand-dark">{duplicataDetectada.nome}</strong> na clínica <strong className="text-brand-dark">{duplicataDetectada.localizacao}</strong>. Deseja abrir o perfil?
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setDuplicataDetectada(null)}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleAcessarPerfilDuplicado}
                                className="flex-1 py-3 bg-brand-teal text-white rounded-xl font-bold shadow-md hover:bg-brand-teal/90 transition-all"
                            >
                                Acessar Perfil
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
