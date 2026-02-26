import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Medico } from '../hooks/useMedicos';
import { FormMedico } from '../components/FormMedico';
import { HistoricoModal } from '../components/HistoricoModal';
import { DashboardModal } from '../components/DashboardModal';
import { useMedicos } from '../hooks/useMedicos';

interface ModalContextData {
    openModal: (type: 'form' | 'historico' | 'dashboard', data?: any) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextData>({} as ModalContextData);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeModal, setActiveModal] = useState<'form' | 'historico' | 'dashboard' | null>(null);
    const [modalData, setModalData] = useState<any>(null);

    // Como os modais precisam de acesso às funções de médico para salvar, vamos provê-las aqui
    const { medicos, adicionarMedico, atualizarMedico, adicionarLog } = useMedicos();

    const tabs: Medico['status'][] = ['Prospecção', 'Apresentada', 'Parceiro Ativo', 'Monitoramento'];

    const openModal = (type: 'form' | 'historico' | 'dashboard', data?: any) => {
        setModalData(data);
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalData(null);
    };

    const handleSaveForm = (dados: Omit<Medico, 'id' | 'logVisitas'>) => {
        if (modalData && modalData.id) { // modalData atua como medicoEditando
            atualizarMedico(modalData.id, dados);
        } else {
            adicionarMedico({ ...dados, logVisitas: [] });
        }
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}

            {/* Centraliza a renderização de Popups */}
            <AnimatePresence>
                {activeModal === 'form' && (
                    <FormMedico
                        isOpen={true}
                        onClose={closeModal}
                        onSave={handleSaveForm}
                        medicoEditando={modalData as Medico | null}
                    />
                )}

                {activeModal === 'historico' && (
                    <HistoricoModal
                        isOpen={true}
                        onClose={closeModal}
                        medico={modalData as Medico}
                        onAddLog={(id, nota) => {
                            adicionarLog(id, nota);
                            setModalData((prev: Medico) => ({
                                ...prev,
                                logVisitas: [{ id: crypto.randomUUID(), nota, data: new Date().toISOString() }, ...prev.logVisitas],
                                ultimoContato: new Date().toISOString()
                            }));
                        }}
                    />
                )}

                {activeModal === 'dashboard' && (
                    <DashboardModal
                        isOpen={true}
                        onClose={closeModal}
                        medicos={medicos}
                        tabs={tabs}
                    />
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);
