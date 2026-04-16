import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Medico } from '../hooks/useMedicos';
import { SidebarFiltros } from './Navigation/SidebarFiltros';
import { DoctorCard } from './Doctors/DoctorCard';
import { CockpitDetalhes } from './Doctors/CockpitDetalhes';
import { KanbanBoard } from './Kanban/KanbanBoard';
import { LayoutGrid, List } from 'lucide-react';

interface ViewHomeProps {
    medicos: Medico[];
    atualizarMedico: (id: string, updates: Partial<Medico>) => void;
    adicionarLog: (idMedico: string, nota: string) => void;
}

/**
 * ViewHome: Triple Pane Layout (@Agent-GridMaster & @Agent-StateSync)
 * Implementa a visão 3-colunas: Filtros | Lista | Detalhes (Cockpit)
 */
export function ViewHome({ medicos, atualizarMedico, adicionarLog }: ViewHomeProps) {
    const [selectedSpecialty, setSelectedSpecialty] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedicoId, setSelectedMedicoId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'nome' | 'visita'>('nome');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    // 1. Filtragem e Ordenação de Alta Performance (@Agent-DataModeller)
    const medicosFiltrados = useMemo(() => {
        if (!Array.isArray(medicos)) return [];
        let result = medicos.filter(m => {
            const matchesSpec = selectedSpecialty === 'Todos' || m.especialidade === selectedSpecialty;
            const matchesSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 m.crm?.includes(searchTerm) ||
                                 m.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSpec && matchesSearch;
        });

        // Ordenação
        if (sortBy === 'nome') {
            result.sort((a, b) => a.nome.localeCompare(b.nome));
        } else if (sortBy === 'visita') {
            result.sort((a, b) => {
                const dateA = a.ultimoContato ? new Date(a.ultimoContato).getTime() : 0;
                const dateB = b.ultimoContato ? new Date(b.ultimoContato).getTime() : 0;
                return dateA - dateB; // Mais longe/nunca visitados primeiro (para incentivar visita)
            });
        }
        
        return result;
    }, [medicos, selectedSpecialty, searchTerm, sortBy]);

    // 2. Médico Selecionado (Ponte de Estado - @Agent-StateSync)
    const selectedMedico = useMemo(() => 
        medicos.find(m => m.id === selectedMedicoId) || null,
        [medicos, selectedMedicoId]
    );

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white">
            
            {/* PAINEL 1: Sidebar de Filtros (Desktop/Tablet) */}
            <aside className="hidden lg:flex w-64 xl:w-72 h-full shrink-0">
                <SidebarFiltros 
                    selectedSpecialty={selectedSpecialty}
                    onSelectSpecialty={setSelectedSpecialty}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </aside>

            {/* PAINEL 2: Lista Central ou Quadro Kanban */}
            <section className={`flex-1 ${viewMode === 'list' ? 'lg:max-w-md xl:max-w-xl' : ''} h-full flex flex-col bg-brand-white border-r border-slate-100 transition-all duration-300`}>
                <header className="p-6 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-brand-dark tracking-tight">Médicos</h2>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {medicosFiltrados.length} Registros
                            </span>
                        </div>
                        
                        {/* Alternador de Visualização (@Agent-UIArchitect) */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Visualização em Lista"
                            >
                                <List size={18} />
                            </button>
                            <button 
                                onClick={() => setViewMode('kanban')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-brand-teal' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Visualização em Quadro (Kanban)"
                            >
                                <LayoutGrid size={18} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Controles de Busca e Ordenação (@Agent-UIArchitect) */}
                    <div className="flex flex-col gap-3 mt-4">
                        <div className="relative lg:hidden">
                            <input 
                                type="text"
                                placeholder="Buscar por nome, CRM ou cidade..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-100/50 border-none rounded-2xl px-4 py-3 text-xs font-semibold focus:ring-2 focus:ring-brand-teal/20 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setSortBy('nome')}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${sortBy === 'nome' ? 'bg-brand-teal text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
                            >
                                Nome (A-Z)
                            </button>
                            <button 
                                onClick={() => setSortBy('visita')}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${sortBy === 'visita' ? 'bg-brand-teal text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
                            >
                                Relevância (Visita)
                            </button>
                        </div>
                    </div>
                </header>

                {viewMode === 'list' ? (
                    <div className="flex-1 overflow-y-auto p-4 no-scrollbar bg-slate-50/30">
                        <AnimatePresence mode="popLayout">
                            {medicosFiltrados.map((medico) => (
                                <DoctorCard 
                                    key={medico.id}
                                    medico={medico}
                                    isSelected={selectedMedicoId === medico.id}
                                    onClick={() => setSelectedMedicoId(medico.id)}
                                />
                            ))}
                        </AnimatePresence>

                        {medicosFiltrados.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-sm text-slate-400 italic">Nenhum médico encontrado com estes filtros.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        <KanbanBoard 
                            key={`${searchTerm}-${selectedSpecialty}`}
                            medicos={medicosFiltrados}
                            onAtualizarMedico={atualizarMedico}
                        />
                    </div>
                )}
            </section>

            {/* PAINEL 3: Cockpit de Detalhes (Oculto se Kanban estiver ativo para dar espaço) */}
            <main className={`${viewMode === 'list' ? 'hidden lg:flex' : 'hidden'} flex-1 h-full`}>
                <CockpitDetalhes 
                    medico={selectedMedico}
                    onAtualizarMedico={atualizarMedico}
                    onAdicionarLog={adicionarLog}
                    onFechar={() => setSelectedMedicoId(null)}
                />
            </main>

            {/* Mobile View: Cockpit flutuante ou Modal (Melhoria futura do @Agent-UIArchitect) */}
            <AnimatePresence>
                {selectedMedicoId && (
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
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

        </div>
    );
}
