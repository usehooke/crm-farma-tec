import { useConfig } from '../context/ConfigContext';

export interface LogVisita {
    id: string;
    data: string; // ISO date string
    nota: string;
    tipo?: 'presencial' | 'telefonema' | 'envio_material';
}

// Definição da estrutura do Médico para a V2.0
export interface Medico {
    id: string;
    nome: string;
    especialidade: string;
    telefone: string;
    status: 'Prospecção' | 'Apresentada' | 'Parceiro Ativo' | 'Monitoramento';
    ultimoContato: string; // ISO Date string
    localizacao: string;
    tags?: string[];
    proximaVisita?: string;
    logVisitas: LogVisita[];
    consultor?: string;
    // Legacy prop for migration:
    observacoes?: string;
}

export function useMedicos() {
    const { medicos, setMedicos } = useConfig();

    const adicionarMedico = (novo: Omit<Medico, 'id'>) => {
        const medicoComId = { ...novo, id: crypto.randomUUID() };
        setMedicos([...medicos, medicoComId]);
    };

    const atualizarMedico = (id: string, dados: Partial<Medico>) => {
        setMedicos(medicos.map(m => m.id === id ? { ...m, ...dados } : m));
    };

    const adicionarLog = (idMedico: string, nota: string, tipo: LogVisita['tipo'] = 'presencial') => {
        setMedicos(medicos.map(m => {
            if (m.id === idMedico) {
                const novoLog: LogVisita = {
                    id: crypto.randomUUID(),
                    data: new Date().toISOString(),
                    nota,
                    tipo
                };
                return {
                    ...m,
                    logVisitas: [novoLog, ...m.logVisitas],
                    ultimoContato: new Date().toISOString() // Atualiza automaticamente o follow-up point
                };
            }
            return m;
        }));
    };

    const removerMedico = (id: string) => {
        setMedicos(medicos.filter(m => m.id !== id));
    };

    const exportarBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(medicos, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `farmatec_crm_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return { medicos, adicionarMedico, atualizarMedico, adicionarLog, removerMedico, exportarBackup };
}
