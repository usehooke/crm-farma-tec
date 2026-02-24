import { useState, useEffect } from 'react';
import type { Medico } from '../hooks/useMedicos';
import { X } from 'lucide-react';

interface FormMedicoProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (medico: Omit<Medico, 'id' | 'logVisitas'>) => void;
    medicoEditando?: Medico | null;
}

const STATUS_OPCIONAL = ['Prospecção', 'Apresentada', 'Parceiro Ativo', 'Monitoramento'] as const;

export const AVAILABLE_TAGS = [
    { id: 'alto-potencial', label: 'Alto Potencial', cor: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'fiel', label: 'Prescritor Fiel', cor: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'dificil', label: 'Difícil Acesso', cor: 'bg-slate-200 text-slate-600 border-slate-300' },
    { id: 'concorrencia', label: 'Usa Concorrente', cor: 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'opiniao', label: 'Formador de Opinião', cor: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
];

export function FormMedico({ isOpen, onClose, onSave, medicoEditando }: FormMedicoProps) {
    const [formData, setFormData] = useState<Omit<Medico, 'id' | 'logVisitas'>>({
        nome: '',
        especialidade: '',
        localizacao: '',
        telefone: '',
        status: 'Prospecção',
        ultimoContato: new Date().toISOString(),
        tags: []
    });

    useEffect(() => {
        if (medicoEditando) {
            setFormData({
                nome: medicoEditando.nome,
                especialidade: medicoEditando.especialidade,
                localizacao: medicoEditando.localizacao,
                telefone: medicoEditando.telefone,
                status: medicoEditando.status,
                ultimoContato: medicoEditando.ultimoContato,
                tags: medicoEditando.tags || [],
            });
        } else {
            setFormData({
                nome: '',
                especialidade: '',
                localizacao: '',
                telefone: '',
                status: 'Prospecção',
                ultimoContato: new Date().toISOString(),
                tags: [],
            });
        }
    }, [medicoEditando, isOpen]);

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
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex flex-col justify-end sm:justify-center items-center z-[60] p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white sm:rounded-2xl rounded-t-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto w-full sm:w-auto pb-6 sm:pb-0 animate-in slide-in-from-bottom-2 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-800">
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
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-elmeco-blue focus:border-elmeco-blue outline-none transition-all"
                            placeholder="Ex: Dr. João Silva"
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
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-elmeco-blue focus:border-elmeco-blue outline-none transition-all"
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
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-elmeco-blue focus:border-elmeco-blue outline-none transition-all"
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
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-elmeco-blue focus:border-elmeco-blue outline-none transition-all"
                            placeholder="Ex: (11) 99999-9999"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status no Funil</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as Medico['status'] })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-elmeco-blue focus:border-elmeco-blue outline-none transition-all bg-white"
                            >
                                {STATUS_OPCIONAL.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
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
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Classificação (Tags)</label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_TAGS.map(tag => {
                                const isSelected = formData.tags?.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${isSelected ? `${tag.cor} ring-2 ring-offset-1 ring-slate-300` : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {tag.label}
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
                            className="flex-1 py-3 bg-elmeco-navy text-white rounded-xl font-bold shadow-md hover:bg-blue-800 transition-all active:scale-95"
                        >
                            {medicoEditando ? 'Atualizar Info' : 'Criar Ficha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
