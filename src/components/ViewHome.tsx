import { useState, useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Search, Filter, Users, TrendingUp, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Medico } from '../hooks/useMedicos';
import { useConfig } from '../context/ConfigContext';
import { useModal } from '../context/ModalContext';
import { CardMedico } from './CardMedico';
import { CardAlerta } from './CardAlerta';
import { MetricChart } from './MetricChart';
import { QRCodeModal } from './QRCodeModal';

interface ViewHomeProps {
    medicos: Medico[];
    atualizarMedico: (id: string, updates: Partial<Medico>) => void;
    openHistory: (medico: Medico) => void;
    tabs: Medico['status'][];
}

export function ViewHome({ medicos, atualizarMedico, openHistory, tabs }: ViewHomeProps) {
    const { nomeUsuario, telefoneUsuario } = useConfig();
    const { openModal } = useModal();
    const [activeTab, setActiveTab] = useState<Medico['status']>('Prospecção');
    const [searchQuery, setSearchQuery] = useState('');
    const [showUrgentOnly, setShowUrgentOnly] = useState(false);
    const [rankingLimit, setRankingLimit] = useState<number | null>(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    // --- Lógica de Filtros e Busca ---
    const medicosFiltrados = useMemo(() => {
        let lista = medicos;

        // 1. Filtro da Aba
        lista = lista.filter(m => m.status === activeTab);

        // 2. Filtro de Ranking (Baseado na ordem da lista)
        if (rankingLimit) {
            lista = lista.slice(0, rankingLimit);
        }

        // 3. Filtro de Urgência (Follow-up)
        if (showUrgentOnly) {
            lista = lista.filter(m => {
                const daysSince = m.ultimoContato ? differenceInDays(new Date(), parseISO(m.ultimoContato)) : 999;
                const isUrgent = daysSince > 30;
                const isWarning = m.status === 'Apresentada' && daysSince > 7 && !isUrgent;
                return isUrgent || isWarning;
            });
        }

        // 4. Busca por Texto
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            lista = lista.filter(m =>
                m.nome.toLowerCase().includes(q) ||
                m.especialidade.toLowerCase().includes(q) ||
                m.localizacao.toLowerCase().includes(q)
            );
        }

        return lista;
    }, [medicos, activeTab, searchQuery, showUrgentOnly, rankingLimit]);

    // Animação de entrada em cascata
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.main
            className="flex-1 flex flex-col pt-2 bg-brand-white pb-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Cabeçalho de Saudação (Substituindo o original simplório do App.tsx) */}
            <motion.header variants={itemVariants} className="px-5 mb-6 mt-4 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark tracking-tight">
                        Bom dia,<br />
                        <span className="text-brand-teal">{nomeUsuario || 'Ariani'}!</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Aqui está o seu painel de hoje focado em performance.</p>
                </div>

                <button
                    onClick={() => setIsQRModalOpen(true)}
                    className="p-4 bg-white rounded-3xl shadow-[6px_6px_15px_#e5e5e5,-6px_-6px_15px_#ffffff] text-primary active:scale-90 transition-all border border-slate-50"
                    title="Seu Cartão de Visitas Digital"
                >
                    <QrCode size={24} />
                </button>
            </motion.header>

            {/* Camada de Analytics Neumórfica */}
            <motion.div variants={itemVariants}>
                <MetricChart medicos={medicos} />
            </motion.div>

            {/* Inteligência de Follow-up */}
            <motion.div variants={itemVariants} className="px-1">
                <CardAlerta medicos={medicos} />
            </motion.div>

            {/* Grid de Acesso Rápido Neumórfico */}
            <motion.div variants={itemVariants} className="px-5 mt-6">
                <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide mb-4">Ranking de Performance</h2>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => setRankingLimit(rankingLimit === 10 ? null : 10)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${rankingLimit === 10 ? 'bg-brand-teal text-white shadow-lg' : 'bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]'}`}
                    >
                        <span className="text-xs font-black uppercase tracking-tighter">Top 10</span>
                        <span className={`text-[10px] ${rankingLimit === 10 ? 'text-white/60' : 'text-slate-400'}`}>Elite</span>
                    </button>

                    <button
                        onClick={() => setRankingLimit(rankingLimit === 20 ? null : 20)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${rankingLimit === 20 ? 'bg-primary text-white shadow-lg' : 'bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]'}`}
                    >
                        <span className="text-xs font-black uppercase tracking-tighter">Top 20</span>
                        <span className={`text-[10px] ${rankingLimit === 20 ? 'text-white/60' : 'text-slate-400'}`}>Foco</span>
                    </button>

                    <button
                        onClick={() => setRankingLimit(rankingLimit === 50 ? null : 50)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${rankingLimit === 50 ? 'bg-slate-800 text-white shadow-lg' : 'bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff]'}`}
                    >
                        <span className="text-xs font-black uppercase tracking-tighter">Top 50</span>
                        <span className={`text-[10px] ${rankingLimit === 50 ? 'text-white/60' : 'text-slate-400'}`}>Carteira</span>
                    </button>
                </div>
            </motion.div>

            {/* Card Largo: Resumo de Performance */}
            <motion.div variants={itemVariants} className="px-5 mt-6 mb-8">
                <div className="p-5 rounded-2xl bg-surface shadow-[6px_6px_12px_#e5e5e5,-6px_-6px_12px_#ffffff] flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-brand-dark">Meta Mensal (Ariani)</h3>
                        <p className="text-xs text-slate-500">Visitas: {medicos.filter(m => m.logVisitas.length > 0).length} / 50</p>
                    </div>
                    <button
                        onClick={() => openModal('dashboard')}
                        className="w-10 h-10 rounded-full bg-brand-white flex items-center justify-center shadow-sm text-primary active:scale-95 transition-transform"
                    >
                        <TrendingUp size={18} />
                    </button>
                </div>
            </motion.div>

            {/* Divisor Visual */}
            <motion.div variants={itemVariants} className="w-full h-px bg-slate-100 mb-6"></motion.div>

            <motion.div variants={itemVariants} id="lista-medicos" className="px-4">
                <h2 className="text-lg font-bold text-brand-dark mb-4 px-1">Seus Contatos</h2>

                {/* Search Bar & Primary Filters */}
                <div className="flex gap-2 relative mb-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar contato..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-brand-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow shadow-sm text-brand-dark"
                        />
                    </div>
                    <button
                        onClick={() => setShowUrgentOnly(!showUrgentOnly)}
                        className={`px-3 py-2 rounded-xl border flex items-center text-xs font-bold transition-all shadow-sm ${showUrgentOnly ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-brand-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Filter size={13} className="mr-1.5" />
                        Atrasados
                    </button>
                </div>

                {/* Menu de Abas */}
                <div className="flex overflow-x-auto hide-scrollbar mb-4 gap-2 pb-2 snap-x">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-4 py-2 flex-shrink-0 rounded-xl font-bold text-[13px] transition-all flex items-center shadow-sm snap-start ${activeTab === tab
                                ? 'bg-primary text-white shadow-[2px_2px_8px_rgba(30,95,175,0.4)]'
                                : 'bg-brand-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {tab}
                            <span className={`ml-1.5 inline-flex items-center justify-center text-[10px] rounded-md h-4 min-w-[16px] px-1 font-black ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                {medicos.filter(m => m.status === tab).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Cards Area */}
                <div className="pb-10">
                    <AnimatePresence mode="popLayout">
                        {medicosFiltrados.map(medico => (
                            <CardMedico
                                key={medico.id}
                                medico={medico}
                                onUpdateStatus={(id, status) => atualizarMedico(id, { status })}
                                onViewHistory={openHistory}
                            />
                        ))}
                    </AnimatePresence>

                    {medicosFiltrados.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-12 mt-4 text-center text-slate-400 bg-surface border border-dashed border-slate-300 rounded-2xl shadow-inner"
                        >
                            <Users size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-semibold text-slate-500">Nenhum contato encontrado.</p>
                            {(searchQuery || showUrgentOnly) && <p className="text-xs mt-1">Tente remover os filtros da busca.</p>}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <QRCodeModal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                whatsappLink={`https://wa.me/${telefoneUsuario.replace(/\D/g, '') || '5511999999999'}?text=${encodeURIComponent('Olá Ariani, salvei seu contato aqui do FarmaClinIQ!')}`}
            />
        </motion.main>
    );
}
