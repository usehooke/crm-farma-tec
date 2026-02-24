import { useState, useEffect } from 'react';

export interface LogVisita {
    id: string;
    data: string; // ISO date string
    nota: string;
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
    // Legacy prop for migration:
    observacoes?: string;
}

export function useMedicos() {
    const [medicos, setMedicos] = useState<Medico[]>(() => {
        const saved = localStorage.getItem('@FarmaTec:medicos');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration script from V1 to V2
            return parsed.map((m: any) => {
                const migrado: Medico = {
                    ...m,
                    logVisitas: m.logVisitas || [],
                };
                // Move old observacoes to new logVisitas format if needed
                if (m.observacoes && typeof m.observacoes === 'string' && migrado.logVisitas.length === 0) {
                    migrado.logVisitas.push({
                        id: crypto.randomUUID(),
                        data: m.ultimoContato || new Date().toISOString(),
                        nota: m.observacoes
                    });
                    delete migrado.observacoes;
                }
                return migrado;
            });
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('@FarmaTec:medicos', JSON.stringify(medicos));
    }, [medicos]);

    const adicionarMedico = (novo: Omit<Medico, 'id'>) => {
        const medicoComId = { ...novo, id: crypto.randomUUID() };
        setMedicos(prev => [...prev, medicoComId]);
    };

    const atualizarMedico = (id: string, dados: Partial<Medico>) => {
        setMedicos(prev => prev.map(m => m.id === id ? { ...m, ...dados } : m));
    };

    const adicionarLog = (idMedico: string, nota: string) => {
        setMedicos(prev => prev.map(m => {
            if (m.id === idMedico) {
                const novoLog: LogVisita = {
                    id: crypto.randomUUID(),
                    data: new Date().toISOString(),
                    nota
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
        setMedicos(prev => prev.filter(m => m.id !== id));
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
