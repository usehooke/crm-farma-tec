import { useConfig } from '../context/ConfigContext';
import { generateUUID } from '../utils/utils';
import { apagarMedicoNuvem } from '../services/syncService';

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
    crm?: string;
    especialidade: string;
    telefone: string;
    status: 'Prospecção' | 'Apresentada' | 'Parceiro Ativo' | 'Monitoramento';
    ultimoContato: string; // ISO Date string
    localizacao: string;
    tags?: string[];
    proximaVisita?: string;
    dataRetorno?: string; // ISO Date string for scheduled follow-up
    logVisitas: LogVisita[];
    consultor?: string;
    // Legacy prop for migration:
    observacoes?: string;
}

export function useMedicos() {
    const { medicos, setMedicos } = useConfig();

    const adicionarMedico = (novo: Omit<Medico, 'id'>) => {
        const medicoComId = { ...novo, id: generateUUID() };
        setMedicos([...medicos, medicoComId]);
    };

    const atualizarMedico = (id: string, dados: Partial<Medico>) => {
        setMedicos(medicos.map(m => m.id === id ? { ...m, ...dados } : m));
    };

    const adicionarLog = (idMedico: string, nota: string, tipo: LogVisita['tipo'] = 'presencial') => {
        setMedicos(medicos.map(m => {
            if (m.id === idMedico) {
                const novoLog: LogVisita = {
                    id: generateUUID(),
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

    const limparBaseDuplicada = async () => {
        // [PRE-FLIGHT CHECK]: Memory Backup In Case of Failure
        const backupMedicos = [...medicos];

        try {
            const hashMedicos = new Map<string, Medico>();
            const toDelete: string[] = [];
            let deletedCount = 0;
            const uid = Object.values(medicos)?.[0]?.ownerId || null;

            medicos.forEach(m => {
                // Generate unique key. Normalize names to ignore case and spaces
                const keyName = m.nome.trim().toUpperCase();
                const keyCity = m.localizacao.trim().toUpperCase();
                const keyPhone = m.telefone ? m.telefone.replace(/\D/g, '') : '';

                // Primary key is CRM or Phone if exists, fallback to Name + City
                let key = `NOME:${keyName}|CITY:${keyCity}`;
                if (m.crm) {
                    key = `CRM:${m.crm.trim().toUpperCase()}`;
                } else if (keyPhone.length >= 10) {
                    key = `PHONE:${keyPhone}`;
                }

                if (hashMedicos.has(key)) {
                    const existente = hashMedicos.get(key)!;
                    // Merge logs
                    existente.logVisitas = [...existente.logVisitas, ...(m.logVisitas || [])];
                    // Keep the most recent last contact
                    if (new Date(m.ultimoContato) > new Date(existente.ultimoContato)) {
                        existente.ultimoContato = m.ultimoContato;
                    }
                    hashMedicos.set(key, existente);

                    // Track ID to delete from Firebase
                    toDelete.push(m.id);
                    deletedCount++;
                } else {
                    hashMedicos.set(key, { ...m });
                }
            });

            const mergedMedicos = Array.from(hashMedicos.values());

            // Update local state temporarily
            setMedicos(mergedMedicos);

            // Delete from Firebase
            if (uid && toDelete.length > 0) {
                for (const id of toDelete) {
                    await apagarMedicoNuvem(uid, id);
                }
            }

            return {
                totalInicial: medicos.length,
                mergedCount: deletedCount,
                idsToDelete: toDelete,
                totalFinal: mergedMedicos.length
            };

        } catch (error) {
            console.error("Erro crítico na higienização base. Restaurando estado original...", error);
            // Revert changes from backup
            setMedicos(backupMedicos);
            return {
                totalInicial: backupMedicos.length,
                mergedCount: 0,
                idsToDelete: [],
                totalFinal: backupMedicos.length,
                error
            };
        }
    };

    const exportarBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(medicos, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `FarmaClinQI_crm_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return { medicos, adicionarMedico, atualizarMedico, adicionarLog, removerMedico, exportarBackup, limparBaseDuplicada };
}

