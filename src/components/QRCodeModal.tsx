import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    whatsappLink: string;
}

export function QRCodeModal({ isOpen, onClose, whatsappLink }: QRCodeModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-[20px_20px_40px_rgba(0,0,0,0.1),-10px_-10px_30px_rgba(255,255,255,0.8)] relative overflow-hidden"
                >
                    {/* Header do Modal */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Cartão Digital</h2>
                            <p className="text-xs text-slate-500 font-medium">Compartilhe seu contato</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Área do QR Code Neumórfica */}
                    <div className="bg-slate-50 rounded-[28px] p-8 mb-6 shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <QRCodeSVG
                                value={whatsappLink}
                                size={200}
                                level="H"
                            />
                        </div>
                    </div>

                    {/* Infos e Ação */}
                    <div className="space-y-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-brand-teal bg-brand-teal/5 py-2 px-4 rounded-full border border-brand-teal/10">
                            <MessageSquare size={14} className="fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Acesso Direto ao WhatsApp</span>
                        </div>

                        <p className="text-[11px] text-slate-400 font-medium px-4 leading-relaxed">
                            Aponte a câmera do celular para este código para salvar o contato e iniciar uma conversa com a Ariani.
                        </p>
                    </div>

                    {/* Detalhe Visual de Marca */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-teal/5 rounded-full blur-2xl" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
