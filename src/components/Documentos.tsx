import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FileDown, UploadCloud } from 'lucide-react';
import { importarPlanilhaMedicos } from '../services/excelService';
import { gerarRelatorioPDF } from '../services/pdfService';
import { FunilChart } from './FunilChart';

export const Documentos = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        importarPlanilhaMedicos(
            file,
            (qtd) => {
                setMensagem({ texto: `${qtd} médicos importados com sucesso!`, tipo: 'sucesso' });
                if (fileInputRef.current) fileInputRef.current.value = ''; // Limpa o input
                setTimeout(() => setMensagem(null), 4000); // Remove o aviso após 4 segundos
            },
            (erro) => {
                setMensagem({ texto: erro, tipo: 'erro' });
                setTimeout(() => setMensagem(null), 4000);
            }
        );
    };

    return (
        <motion.div
            className="min-h-screen bg-brand-white px-5 pt-8 pb-32"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
        >
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Documentos</h1>
                <p className="text-sm text-slate-500 mt-1">Importação de dados e relatórios corporativos.</p>
            </header>

            {/* Alerta de Feedback (Toast In-line) */}
            {mensagem && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm ${mensagem.tipo === 'sucesso' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-red-100 text-red-600'
                        }`}
                >
                    {mensagem.tipo === 'sucesso' && <CheckCircle size={18} />}
                    {mensagem.texto}
                </motion.div>
            )}

            <div className="space-y-6">

                {/* O novo Dashboard Visual */}
                <FunilChart />

                {/* Bloco 1: Importação de Planilha (Excel) */}
                <div className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff] flex flex-col items-center text-center relative overflow-hidden">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <UploadCloud size={28} className="text-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-brand-dark">Importar Base (Excel)</h2>
                    <p className="text-xs text-slate-500 mt-2 px-2 mb-5">
                        Carregue um ficheiro .xlsx ou .csv com as colunas Nome, Especialidade e Telefone.
                    </p>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/30 active:scale-95 transition-transform"
                    >
                        Selecionar Ficheiro
                    </button>

                    {/* Input oculto acionado pelo botão Neumórfico */}
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Bloco 2: Geração de Relatório (PDF) */}
                <div className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff] flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
                        <FileDown size={28} className="text-brand-teal" />
                    </div>
                    <h2 className="text-lg font-bold text-brand-dark">Relatório Executivo</h2>
                    <p className="text-xs text-slate-500 mt-2 px-2 mb-5">
                        Gere um PDF corporativo com o histórico de visitas e o funil atualizado.
                    </p>

                    <button
                        onClick={gerarRelatorioPDF}
                        className="w-full py-3 rounded-xl bg-brand-white text-primary border-2 border-primary font-bold text-sm shadow-sm active:scale-95 transition-transform"
                    >
                        Extrair em PDF
                    </button>
                </div>

            </div>
        </motion.div>
    );
};
