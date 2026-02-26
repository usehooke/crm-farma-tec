import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FileDown, UploadCloud } from 'lucide-react';
import { importarPlanilhaMedicos } from '../services/excelService';
import { fazerPushParaNuvem } from '../services/syncService';
import { gerarRelatorioPDF } from '../services/pdfService';
import { FunilChart } from './FunilChart';
import { useConfig } from '../context/ConfigContext';
import { toast } from 'sonner';

export const Documentos = () => {
    const { user } = useConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
    const [isSincronizando, setIsSincronizando] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!user) {
            setMensagem({ texto: "Você precisa estar logado para importar dados.", tipo: 'erro' });
            return;
        }

        importarPlanilhaMedicos(
            file,
            user.uid,
            async (qtd: number) => {
                setMensagem({ texto: `${qtd} médicos importados localmente. Iniciando sincronização...`, tipo: 'sucesso' });
                if (fileInputRef.current) fileInputRef.current.value = ''; // Limpa o input

                // Inicia Sincronização com Nuvem
                setIsSincronizando(true);
                try {
                    const STORAGE_KEY = `@FarmaClinIQ:${user.uid}:medicos`;
                    const medicosRaw = localStorage.getItem(STORAGE_KEY) || '[]';
                    const medicosAtualizados = JSON.parse(medicosRaw);

                    await fazerPushParaNuvem(user.uid, medicosAtualizados);

                    setMensagem({ texto: "Importação concluída! Seus dados estão protegidos e sincronizados.", tipo: 'sucesso' });
                    toast.success('Importação concluída e sincronizada!', { icon: '✅' });
                } catch (error) {
                    console.error("Erro na sincronização:", error);
                    setMensagem({ texto: "Importado localmente, mas falhou ao subir para nuvem.", tipo: 'erro' });
                    toast.error('Erro ao sincronizar com a nuvem.');
                } finally {
                    setIsSincronizando(false);
                    setTimeout(() => setMensagem(null), 6000);
                }
            },
            (erro: string) => {
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

                {/* Loader Neumórfico de Sincronização */}
                {isSincronizando && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-brand-white/80 backdrop-blur-sm px-6"
                    >
                        <div className="bg-surface p-8 rounded-3xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] flex flex-col items-center text-center max-w-sm w-full">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-primary animate-spin mb-6" />
                            <h3 className="text-xl font-bold text-brand-dark mb-2">Quase Pronto!</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Sincronizando novos médicos com o cofre seguro da FarmaClinIQ...
                            </p>
                            <div className="mt-6 px-4 py-2 bg-primary/10 rounded-full">
                                <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Enviando Dados</span>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>
        </motion.div>
    );
};
