import React, { createContext, useContext, useState, Suspense, lazy } from 'react';
import { generateUUID } from '../utils/utils';
import { AnimatePresence } from 'framer-motion';
import type { Medico } from '../hooks/useMedicos';
import { FormMedico } from '../components/FormMedico';
import { HistoricoModal } from '../components/HistoricoModal';
import { DashboardModal } from '../components/DashboardModal';
import { useMedicos } from '../hooks/useMedicos';

const GuiaAjuda = lazy(() => import('../components/GuiaAjuda'));

interface ModalContextData {
    openModal: (type: 'form' | 'historico' | 'dashboard' | 'guia', data?: any) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextData>({} as ModalContextData);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeModal, setActiveModal] = useState<'form' | 'historico' | 'dashboard' | 'guia' | null>(null);
    const [modalData, setModalData] = useState<any>(null);

    // Como os modais precisam de acesso às funções de médico para salvar, vamos provê-las aqui
    const { medicos, adicionarMedico, atualizarMedico, adicionarLog } = useMedicos();

    const tabs: Medico['status'][] = ['Prospecção', 'Apresentada', 'Parceiro Ativo', 'Monitoramento'];

    const openModal = (type: 'form' | 'historico' | 'dashboard' | 'guia', data?: any) => {
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
                                logVisitas: [{ id: generateUUID(), nota, data: new Date().toISOString() }, ...prev.logVisitas],
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

                {activeModal === 'guia' && (
                    <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center text-white font-bold">Carregando Guia...</div>}>
                        <GuiaAjuda onClose={closeModal} />
                    </Suspense>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);
