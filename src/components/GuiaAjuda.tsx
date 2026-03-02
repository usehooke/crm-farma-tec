import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lightbulb, X, HelpCircle } from 'lucide-react';
import { guiaUsuario } from '../constants/guiaUsuario';

interface GuiaAjudaProps {
    onClose: () => void;
}

export default function GuiaAjuda({ onClose }: GuiaAjudaProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex flex-col justify-end sm:justify-center items-center z-[60] p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-brand-white sm:rounded-2xl rounded-t-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col sm:w-auto animate-in slide-in-from-bottom-2 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100/50 bg-white sm:rounded-t-2xl rounded-t-3xl shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-light/30 text-brand-teal rounded-xl">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-brand-dark tracking-tight">
                                Central de Ajuda
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">O Guia Definitivo da Ariani</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-brand-white space-y-4 rounded-b-3xl">
                    <p className="text-sm text-slate-500 font-medium mb-6 mt-2 leading-relaxed px-1">
                        Bem-vinda de volta. Este é o seu manual de campo.
                        Esquecemos de alguma coisa? Os acordes abaixo concentram as melhores
                        táticas para dominar seu workflow diário.
                    </p>

                    <div className="space-y-4">
                        {guiaUsuario.map((item, index) => {
                            const isOpen = openIndex === index;

                            return (
                                <motion.div
                                    key={index}
                                    layout
                                    className={`bg-surface border transition-colors duration-300 overflow-hidden shadow-lg shadow-slate-200/40 dark:shadow-none
                                        ${isOpen ? 'border-brand-teal/20 rounded-[24px]' : 'border-white/50 rounded-2xl'}
                                    `}
                                >
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full text-left px-5 py-4 flex items-center justify-between outline-none"
                                    >
                                        <h3 className={`font-bold text-[15px] transition-colors ${isOpen ? 'text-brand-teal' : 'text-brand-dark'}`}>
                                            {item.titulo}
                                        </h3>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="ml-3 shrink-0"
                                        >
                                            <ChevronDown size={18} className={isOpen ? 'text-brand-teal' : 'text-slate-400'} />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            >
                                                <div className="px-5 pb-5 pt-1 border-t border-slate-100/50 mt-2">
                                                    <p className="text-[13px] text-slate-600 font-medium mb-4 leading-relaxed">
                                                        {item.descricao}
                                                    </p>

                                                    <div className="bg-white rounded-xl p-4 shadow-inner shadow-slate-200/60 dark:shadow-none border border-slate-50">
                                                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                                                            Passo a Passo
                                                        </h4>
                                                        <ul className="space-y-3">
                                                            {item.passos.map((passo, i) => (
                                                                <li key={i} className="flex gap-3 text-[13px] text-slate-700 font-medium leading-relaxed items-start">
                                                                    <span className="flex items-center justify-center shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px]">
                                                                        {i + 1}
                                                                    </span>
                                                                    <span className="mt-0.5">{passo}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="mt-4 flex gap-3 items-start bg-amber-50 rounded-xl p-3 border border-amber-100/50">
                                                        <Lightbulb size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                                        <p className="text-[12px] font-bold text-amber-700 leading-snug">
                                                            {item.dicaOuro}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
