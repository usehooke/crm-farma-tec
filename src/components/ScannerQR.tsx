import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScannerQRProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

/**
 * ScannerQR Elite v1.0 (@Agent-UX)
 * Interface simplificada para leitura de códigos em campo.
 */
export const ScannerQR = ({ onScan, onClose }: ScannerQRProps) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Inicializa o scanner
        scannerRef.current = new Html5QrcodeScanner(
            "qr-reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        scannerRef.current.render(
            (decodedText) => {
                // Sucesso na leitura
                if (scannerRef.current) {
                    scannerRef.current.clear();
                }
                onScan(decodedText);
            },
            () => {
                // Erros de leitura (ignorar para não poluir o console)
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Erro ao limpar scanner", err));
            }
        };
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
        >
            <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-full active:scale-90 transition-all"
            >
                <X size={28} />
            </button>

            <div className="w-full max-w-sm text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal/20 text-brand-teal rounded-full mb-4">
                    <Zap size={16} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Scanner Inteligente</span>
                </div>
                <h2 className="text-2xl font-black text-white italic tracking-tight">Aponte para o Código</h2>
                <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">
                    Localize médicos ou protocolos instantaneamente.
                </p>
            </div>

            {/* Container do Scanner */}
            <div className="w-full max-w-[320px] aspect-square rounded-[40px] overflow-hidden border-4 border-brand-teal/30 shadow-2xl relative bg-black">
                <div id="qr-reader" className="w-full h-full border-none" />
                
                {/* Overlay Visual Sênior */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-brand-teal rounded-[32px] animate-pulse" />
                </div>
            </div>

            <div className="mt-12 flex items-center gap-3 text-slate-500">
                <Zap size={20} className="animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Ativando Câmera...</span>
            </div>
        </motion.div>
    );
};
