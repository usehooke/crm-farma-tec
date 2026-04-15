import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Medico } from '../hooks/useMedicos';
import { SidebarFiltros } from './Navigation/SidebarFiltros';
import { DoctorCard } from './Doctors/DoctorCard';
import { CockpitDetalhes } from './Doctors/CockpitDetalhes';

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

    // 1. Filtragem de Alta Performance (@Agent-DataModeller)
    const medicosFiltrados = useMemo(() => {
        if (!Array.isArray(medicos)) return [];
        return medicos.filter(m => {
            const matchesSpec = selectedSpecialty === 'Todos' || m.especialidade === selectedSpecialty;
            const matchesSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 m.crm?.includes(searchTerm) ||
                                 m.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSpec && matchesSearch;
        });
    }, [medicos, selectedSpecialty, searchTerm]);

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

            {/* PAINEL 2: Lista Central de Médicos */}
            <section className="flex-1 lg:max-w-md xl:max-w-xl h-full flex flex-col bg-brand-white border-r border-slate-100">
                <header className="p-6 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-black text-brand-dark tracking-tight">Médicos</h2>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-wider">
                            {medicosFiltrados.length} Registros
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Selecione um profissional para ver o cockpit</p>
                </header>

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
            </section>

            {/* PAINEL 3: Cockpit de Detalhes (Visível em lg+) */}
            <main className="hidden lg:flex flex-1 h-full">
                <CockpitDetalhes 
                    medico={selectedMedico}
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
                            onAdicionarLog={adicionarLog}
                            onFechar={() => setSelectedMedicoId(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
