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
                        <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
                            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-8 pb-8">
                                {medico.logVisitas.length === 0 ? (
                                    <div className="text-center text-slate-400 py-10 -ml-4">
                                        <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Nenhum histórico registrado ainda.</p>
                                    </div>
                                ) : (
                                    medico.logVisitas.map((log: LogVisita) => {
                                        const isProtocolo = log.nota.includes('📄');
                                        const dataLog = new Date(log.data);
                                        const hoje = new Date();
                                        const ontem = new Date();
                                        ontem.setDate(hoje.getDate() - 1);

                                        let dataFormatada = dataLog.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                                        if (dataLog.toDateString() === hoje.toDateString()) dataFormatada = 'Hoje';
                                        else if (dataLog.toDateString() === ontem.toDateString()) dataFormatada = 'Ontem';

                                        const horaFormatada = dataLog.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <div key={log.id} className="relative pl-8">
                                                {/* Ponto na Timeline */}
                                                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-slate-50 dark:border-slate-950 shadow-sm flex items-center justify-center ${isProtocolo ? 'bg-brand-teal' : 'bg-primary'
                                                    }`}>
                                                    <div className="w-1 h-1 bg-white rounded-full" />
                                                </div>

                                                <div className={`p-4 rounded-2xl transition-all ${isProtocolo
                                                        ? 'bg-brand-white dark:bg-slate-900 shadow-[inset_4px_4px_8px_#e5e5e5,inset_-4px_-4px_8px_#ffffff] dark:shadow-none border-l-4 border-brand-teal'
                                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
                                                    }`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                            {dataFormatada} • {horaFormatada}
                                                        </span>
                                                        {isProtocolo && (
                                                            <span className="bg-brand-teal/10 text-brand-teal text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                                Material Técnico
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isProtocolo ? 'text-brand-dark dark:text-slate-200 font-medium' : 'text-slate-700 dark:text-slate-300'
                                                        }`}>
                                                        {isProtocolo ? (
                                                            <>
                                                                {log.nota.split(': ')[0]}: <span className="font-bold">{log.nota.split(': ')[1]}</span>
                                                            </>
                                                        ) : log.nota}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
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
