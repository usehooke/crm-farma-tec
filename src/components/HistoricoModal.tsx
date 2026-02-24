import { X, Calendar, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { LogVisita, Medico } from '../hooks/useMedicos';

interface HistoricoModalProps {
    isOpen: boolean;
    onClose: () => void;
    medico: Medico | null;
    onAddLog: (idMedico: string, nota: string) => void;
}

export function HistoricoModal({ isOpen, onClose, medico, onAddLog }: HistoricoModalProps) {
    const [novaNota, setNovaNota] = useState('');

    if (!isOpen || !medico) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!novaNota.trim()) return;
        onAddLog(medico.id, novaNota);
        setNovaNota('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-end sm:items-center">
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="w-full max-w-[600px] bg-slate-50 min-h-[70vh] max-h-[90vh] sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl relative"
                    >
                        {/* Header */}
                        <div className="bg-white p-4 border-b border-slate-200 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 line-clamp-1">Histórico: {medico.nome}</h2>
                                <p className="text-xs text-slate-500">{medico.especialidade} • {medico.logVisitas.length} registros</p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                            <div className="space-y-4">
                                {medico.logVisitas.length === 0 ? (
                                    <div className="text-center text-slate-400 py-10">
                                        <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Nenhum histórico registrado ainda.</p>
                                    </div>
                                ) : (
                                    medico.logVisitas.map((log: LogVisita) => (
                                        <div key={log.id} className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-[-20px] before:w-[2px] before:bg-slate-200 last:before:hidden">
                                            <div className="absolute left-0 top-1.5 w-5 h-5 bg-elmeco-navy rounded-full border-4 border-slate-50 shadow-sm" />
                                            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                                                <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                                    {new Date(log.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{log.nota}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Input Footer */}
                        <div className="bg-white p-4 border-t border-slate-200">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={novaNota}
                                    onChange={(e) => setNovaNota(e.target.value)}
                                    placeholder="Adicionar nova anotação técnica..."
                                    className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-elmeco-blue focus:border-elmeco-blue outline-none transition-all shadow-sm bg-slate-50 focus:bg-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!novaNota.trim()}
                                    className="bg-elmeco-navy text-white p-3 rounded-xl disabled:opacity-50 hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center shrink-0"
                                >
                                    <PlusCircle size={20} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
