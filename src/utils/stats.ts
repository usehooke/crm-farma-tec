import { startOfMonth, isWithinInterval, endOfMonth } from 'date-fns';
import type { Medico } from '../hooks/useMedicos';

export interface CRMStats {
    alcanceCientifico: number; // Protocolos enviados no mês
    frequenciaVisitacao: number; // Visitas presenciais no mês
    totalBase: number;
    protocoloMaisEnviado: string;
    taxaEngajamento: number;
}

export const calcularStatsMensais = (medicos: Medico[]): CRMStats => {
    const agora = new Date();
    const inicioMes = startOfMonth(agora);
    const fimMes = endOfMonth(agora);

    let envios = 0;
    let visitas = 0;
    const contagemProtocolos: Record<string, number> = {};

    medicos.forEach(m => {
        (m.logVisitas || []).forEach(log => {
            const dataLog = new Date(log.data);
            if (isWithinInterval(dataLog, { start: inicioMes, end: fimMes })) {
                if (log.nota.includes('📄')) {
                    envios++;
                    const nomeProtocolo = log.nota.split(': ')[1]?.split(' via')[0] || 'Desconhecido';
                    contagemProtocolos[nomeProtocolo] = (contagemProtocolos[nomeProtocolo] || 0) + 1;
                } else {
                    visitas++;
                }
            }
        });
    });

    const protocoloMaisEnviado = Object.entries(contagemProtocolos)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum';

    const medicosEngajados = medicos.filter(m =>
        (m.logVisitas || []).some(log => log.nota.includes('📄'))
    ).length;

    const taxaEngajamento = medicos.length > 0 ? (medicosEngajados / medicos.length) * 100 : 0;

    return {
        alcanceCientifico: envios,
        frequenciaVisitacao: visitas,
        totalBase: medicos.length,
        protocoloMaisEnviado,
        taxaEngajamento
    };
};
