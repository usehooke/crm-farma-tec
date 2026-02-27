import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import type { Medico } from './useMedicos';

export interface AlertaFollowUp extends Medico {
    diasInativo: number;
}

export function useFollowUp(medicos: Medico[]) {
    const hoje = new Date();

    const medicosAtrasados = medicos
        .filter((m): m is Medico => !!m)
        .map((medico) => {
            // Pega a visita mais recente ou a data de contat se array vazio
            let ultimaVisitaStr = medico.ultimoContato;
            if (medico.logVisitas && medico.logVisitas.length > 0) {
                const logsOrdenados = [...medico.logVisitas].sort((a, b) => {
                    const timeA = a.data ? new Date(a.data).getTime() : 0;
                    const timeB = b.data ? new Date(b.data).getTime() : 0;
                    return timeB - timeA;
                });
                ultimaVisitaStr = logsOrdenados[0]?.data || medico.ultimoContato;
            }

            const ultimaVisita = ultimaVisitaStr
                ? parseISO(ultimaVisitaStr)
                : new Date(2000, 0, 1);

            const diasInativo = differenceInDays(hoje, ultimaVisita);

            return { ...medico, diasInativo };
        });

    // Filtra quem está há mais de 15 dias sem visita
    return medicosAtrasados
        .filter((m) => m.diasInativo >= 15)
        .sort((a, b) => b.diasInativo - a.diasInativo); // Ordena do mais grave para o menor
}, [medicos]);

return { alertas, total: (alertas || []).length };
}
