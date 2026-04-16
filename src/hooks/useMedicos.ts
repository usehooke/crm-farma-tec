import { useCallback, useMemo } from 'react';
import { useConfig } from '../context/ConfigContext';
import { generateUUID } from '../utils/utils';

export interface LogVisita {
    id: string;
    data: string;
    nota: string;
    tipo?: 'presencial' | 'telefonema' | 'envio_material' | 'tecnico';
    amostras?: string[];
    brindes?: string[];
}

export interface Medico {
    id: string;
    nome: string;
    crm?: string;
    especialidade: string;
    telefone: string;
    status: 'Prospecção' | 'Apresentada' | 'Parceiro Ativo' | 'Monitoramento';
    ultimoContato: string;
    localizacao: string;
    tags?: string[];
    proximaVisita?: string;
    logVisitas: LogVisita[];
    notasCrm?: string;
    ownerId?: string; 
    dataRetorno?: string; 
    dataCriacao?: string; 
}

/**
 * Hook de Gerenciamento de Médicos Elite v3.0 (@Agent-ZeroDefect)
 * Performance Blindada: Todas as ações são memoizadas para evitar Render-Hell.
 */
export function useMedicos() {
    const { medicos, setMedicos } = useConfig();

    const adicionarMedico = useCallback((novo: Omit<Medico, 'id'>) => {
        const id = generateUUID();
        const medicoComId: Medico = { 
            ...novo, 
            id,
            logVisitas: (novo as any).logVisitas || []
        };
        setMedicos(prev => [...prev, medicoComId]);
    }, [setMedicos]);

    const atualizarMedico = useCallback((id: string, dados: Partial<Medico>) => {
        setMedicos((prev: Medico[]) => prev.map((m: Medico) => m.id === id ? { ...m, ...dados } : m));
    }, [setMedicos]);

    const adicionarLog = useCallback((idMedico: string, nota: string, extras: Partial<LogVisita> = {}) => {
        setMedicos((prev: Medico[]) => prev.map((m: Medico) => {
            if (m.id === idMedico) {
                const novoLog: LogVisita = {
                    id: generateUUID(),
                    data: new Date().toISOString(),
                    nota,
                    tipo: extras.tipo || 'presencial',
                    ...extras
                };
                return {
                    ...m,
                    logVisitas: [novoLog, ...(m.logVisitas || [])],
                    ultimoContato: new Date().toISOString()
                };
            }
            return m;
        }));
    }, [setMedicos]);

    const limparBaseDuplicada = useCallback(() => {
        if (!medicos || medicos.length === 0) return { totalInicial: 0, totalFinal: 0, mergedCount: 0 };

        const hash = new Map<string, Medico>();
        const totalInicial = medicos.length;
        let alterado = false;

        medicos.forEach(m => {
            const key = `${m.nome.trim().toUpperCase()}-${(m.crm || m.localizacao || '').trim().toUpperCase()}`;
            if (hash.has(key)) {
                alterado = true;
                const existente = hash.get(key)!;
                if ((m.logVisitas?.length || 0) > (existente.logVisitas?.length || 0)) {
                    hash.set(key, m);
                }
            } else {
                hash.set(key, m);
            }
        });

        const totalFinal = hash.size;
        if (alterado) {
            setMedicos(Array.from(hash.values()));
        }

        return {
            totalInicial,
            totalFinal,
            mergedCount: totalInicial - totalFinal
        };
    }, [medicos, setMedicos]);

    const removerMedico = useCallback((id: string) => {
        setMedicos((prev: Medico[]) => prev.filter((m: Medico) => m.id !== id));
    }, [setMedicos]);

    // Retorno memoizado para estabilidade de componentes filhos
    return useMemo(() => ({ 
        medicos, 
        adicionarMedico, 
        atualizarMedico, 
        adicionarLog, 
        limparBaseDuplicada,
        removerMedico 
    }), [medicos, adicionarMedico, atualizarMedico, adicionarLog, limparBaseDuplicada, removerMedico]);
}
