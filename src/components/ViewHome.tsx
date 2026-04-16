import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Medico } from '../hooks/useMedicos';
import { SidebarFiltros } from './Navigation/SidebarFiltros';
import { DoctorCard } from './Doctors/DoctorCard';
import { CockpitDetalhes } from './Doctors/CockpitDetalhes';
import { KanbanBoard } from './Kanban/KanbanBoard';
import { LayoutGrid, List, Search as SearchIcon, Plus, ClipboardList } from 'lucide-react';
import { useModal } from '../context/ModalContext';

interface ViewHomeProps {
    medicos: Medico[];
    atualizarMedico: (id: string, updates: Partial<Medico>) => void;
    adicionarLog: (idMedico: string, nota: string) => void;
    limparBaseDuplicada: () => void;
}

export function ViewHome({ medicos, atualizarMedico, adicionarLog, limparBaseDuplicada }: ViewHomeProps) {
    const { openModal } = useModal();
    const [selectedSpecialty, setSelectedSpecialty] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedicoId, setSelectedMedicoId] = useState<string | null>(null);
    const [sortBy] = useState<'nome' | 'visita'>('nome');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    // Remove duplicatas ao carregar (Segurança máxima para o Kanban)
    useEffect(() => {
        limparBaseDuplicada();
    }, []);

    // 1. Algoritmo de Busca e Filtro de Alta Performance
    const medicosFiltrados = useMemo(() => {
        if (!Array.isArray(medicos)) return [];
        
        const term = searchTerm.trim().toLowerCase();
        
        return medicos.filter(m => {
            const matchesSpec = selectedSpecialty === 'Todos' || m.especialidade === selectedSpecialty;
            if (!matchesSpec) return false;
            
            if (!term) return true;
            
            return (
                m.nome.toLowerCase().includes(term) || 
                (m.crm && m.crm.toLowerCase().includes(term)) ||
                (m.localizacao && m.localizacao.toLowerCase().includes(term))
            );
        }).sort((a, b) => {
            if (sortBy === 'nome') return a.nome.localeCompare(b.nome);
            const dateA = new Date(a.ultimoContato || 0).getTime();
            const dateB = new Date(b.ultimoContato || 0).getTime();
            return dateA - dateB;
        });
    }, [medicos, selectedSpecialty, searchTerm, sortBy]);

    const selectedMedico = useMemo(() => 
        medicos.find(m => m.id === selectedMedicoId) || null,
        [medicos, selectedMedicoId]
    );

    return (
        <div className="flex h-screen w-full overflow-hidden bg-brand-white">
            
            {/* PAINEL 1: Sidebar desktop */}
            <aside className="hidden lg:flex w-64 xl:w-72 h-full shrink-0 border-r border-slate-200">
                <SidebarFiltros 
                    selectedSpecialty={selectedSpecialty}
                    onSelectSpecialty={setSelectedSpecialty}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </aside>

            {/* PAINEL 2: Lista Central (FIXO) */}
            <section className="flex-1 h-full flex flex-col bg-white relative overflow-hidden">
                
                {/* Sticky Header com Lupa para Mobile */}
                <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl p-4 lg:p-6 border-b border-slate-100 shadow-sm w-full">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col flex-1 min-w-0">
                            <h2 className="text-lg lg:text-xl font-black text-brand-dark truncate">
                                {viewMode === 'list' ? 'Médicos' : 'Quadro Estratégico'}
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {medicosFiltrados.length} Profissionais
                            </p>
                        </div>
                        
                        {/* Toggle de Visualização (Sempre Visível) */}
                        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-400'}`}
                            >
                                <List size={18} />
                            </button>
                            <button 
                                onClick={() => setViewMode('kanban')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-400'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Barra de Busca Mobile com Lupa High-Visibility */}
                    <div className="mt-4 relative lg:hidden">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-teal z-10">
                            <SearchIcon size={16} strokeWidth={3} />
                        </div>
                        <input 
                            type="text"
                            placeholder="Buscar nome, CRM ou cidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-teal/20 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold transition-all shadow-inner"
                        />
                    </div>
                </header>

                {/* Conteúdo Renderizado */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {viewMode === 'list' ? (
                        <div 
                            key={`list-${searchTerm}-${selectedSpecialty}`}
                            className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 no-scrollbar bg-slate-50/20"
                        >
                            {medicosFiltrados.map((medico) => (
                                <DoctorCard 
                                    key={medico.id}
                                    medico={medico}
                                    isSelected={selectedMedicoId === medico.id}
                                    onClick={() => setSelectedMedicoId(medico.id)}
                                />
                            ))}
                            {medicosFiltrados.length === 0 && (
                                <div className="py-20 text-center text-slate-300 italic text-sm">Nenhum médico encontrado.</div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden h-full">
                            <KanbanBoard 
                                key={`${searchTerm}-${selectedSpecialty}-${medicosFiltrados.length}`}
                                medicos={medicosFiltrados}
                                onAtualizarMedico={atualizarMedico}
                                onSelectMedico={setSelectedMedicoId}
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* PAINEL 3: Cockpit Detalhes (Desktop) */}
            <aside className="hidden lg:flex w-[400px] xl:w-[480px] h-full shrink-0 border-l border-slate-100">
                <CockpitDetalhes 
                    medico={selectedMedico}
                    onAtualizarMedico={atualizarMedico}
                    onAdicionarLog={adicionarLog}
                    onFechar={() => setSelectedMedicoId(null)}
                />
            </aside>

            {/* Cockpit Mobile (Slide-up) */}
            <AnimatePresence>
                {selectedMedicoId && (
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] lg:hidden bg-white"
                    >
                        <CockpitDetalhes 
                            medico={selectedMedico}
                            onAtualizarMedico={atualizarMedico}
                            onAdicionarLog={adicionarLog}
                            onFechar={() => setSelectedMedicoId(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Contextual FAB - Visível apenas em mobile e centrado para ergonomia Android */}
            <div className="fixed bottom-28 left-0 right-0 flex justify-center pointer-events-none z-[60] lg:hidden">
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        if (selectedMedicoId) {
                            // Se já está selecionado, o Cockpit já está aberto. 
                            // O UX v2 diz que o Cocpkit deve ter o botão de registro em destaque.
                            // Mas podemos também forçar o scroll aqui.
                            toast.info('Use o botão no rodapé do perfil para registrar!');
                        } else {
                            openModal('form');
                        }
                    }}
                    className={`
                        pointer-events-auto h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all border-4 border-white
                        ${selectedMedicoId ? 'bg-brand-dark text-white' : 'bg-brand-teal text-white shadow-brand-teal/20'}
                    `}
                >
                    {selectedMedicoId ? <ClipboardList size={28} /> : <Plus size={32} strokeWidth={3} />}
                </motion.button>
            </div>
        </div>
    );
}
