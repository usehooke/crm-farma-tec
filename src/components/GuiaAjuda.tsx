import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lightbulb, X, HelpCircle } from 'lucide-react';
import { guiaUsuario } from '../constants/guiaUsuario';

interface GuiaAjudaProps {
    onClose: () => void;
}

/**
 * Central de Ajuda Elite v3.0 (@Agent-UIArchitect)
 * Focado em clareza, ergonomia e estética neomórfica premium.
 */
export default function GuiaAjuda({ onClose }: GuiaAjudaProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center z-[150] p-0 sm:p-4">
            <motion.div 
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                className="bg-brand-white dark:bg-slate-900 sm:rounded-[48px] rounded-t-[48px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden"
            >

                {/* Header Elite */}
                <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-teal/10 text-brand-teal rounded-2xl flex items-center justify-center shadow-inner">
                            <HelpCircle size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-brand-dark dark:text-white tracking-tighter italic">
                                Central Elite
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Guia de Alta Performance</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-3 text-slate-300 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content Area - Elite Scroll */}
                <div className="flex-1 overflow-y-auto p-8 bg-brand-white dark:bg-slate-950 space-y-6 rounded-b-[48px] no-scrollbar">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-8 mt-2 leading-relaxed px-2 border-l-4 border-brand-teal pl-6 py-2 bg-brand-teal/5 rounded-r-2xl italic">
                        "Bem-vinda ao seu manual de campo. Aqui concentramos as melhores táticas para dominar seu fluxo de trabalho diário com a Elmeco."
                    </p>

                    <div className="space-y-6">
                        {guiaUsuario.map((item, index) => {
                            const isOpen = openIndex === index;

                            return (
                                <motion.div
                                    key={index}
                                    layout
                                    className={`transition-all duration-300 overflow-hidden shadow-soft-out dark:shadow-none border
                                        ${isOpen 
                                            ? 'bg-white dark:bg-slate-900 border-brand-teal/20 rounded-[32px] scale-[1.02]' 
                                            : 'bg-surface dark:bg-slate-900/50 border-white dark:border-slate-800 rounded-[24px]'}
                                    `}
                                >
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full text-left px-6 py-5 flex items-center justify-between outline-none"
                                    >
                                        <h3 className={`font-black text-sm uppercase tracking-wide transition-colors ${isOpen ? 'text-brand-teal' : 'text-brand-dark dark:text-slate-300'}`}>
                                            {item.titulo}
                                        </h3>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="ml-3 shrink-0"
                                        >
                                            <ChevronDown size={20} className={isOpen ? 'text-brand-teal' : 'text-slate-400'} />
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
                                                <div className="px-6 pb-8 pt-2 border-t border-slate-50 dark:border-slate-800/50 mt-2">
                                                    <p className="text-[14px] text-slate-600 dark:text-slate-400 font-bold mb-6 leading-relaxed">
                                                        {item.descricao}
                                                    </p>

                                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[28px] p-6 shadow-inner border border-white dark:border-slate-700">
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-teal" /> PASSO A PASSO ESTRATÉGICO
                                                        </h4>
                                                        <ul className="space-y-4">
                                                            {item.passos.map((passo, i) => (
                                                                <li key={i} className="flex gap-4 text-[13px] text-slate-700 dark:text-slate-200 font-bold leading-relaxed items-start group">
                                                                    <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-brand-teal font-black text-[11px] shadow-sm group-hover:bg-brand-teal group-hover:text-white transition-colors duration-300">
                                                                        {i + 1}
                                                                    </span>
                                                                    <span className="mt-0.5">{passo}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="mt-6 flex gap-4 items-start bg-brand-teal/5 dark:bg-brand-teal/10 rounded-[24px] p-5 border border-brand-teal/10">
                                                        <Lightbulb size={24} className="text-brand-teal shrink-0" />
                                                        <p className="text-[12px] font-black text-brand-teal uppercase tracking-tight leading-relaxed">
                                                            <span className="opacity-60 block mb-1">Dica de Ouro IQ:</span>
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
                
                <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 shrink-0 sm:hidden" />
            </motion.div>
        </div>
    );
}
