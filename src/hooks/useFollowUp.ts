import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import type { Medico } from './useMedicos';

export interface AlertaFollowUp extends Medico {
    diasInativo: number;
}

export function useFollowUp(medicos: Medico[]) {
    const hoje = new Date();

    const alertas = useMemo(() => {
        const medicosAtrasados = medicos.map((medico) => {
            // Pega a visita mais recente ou a data de contat se array vazio
            let ultimaVisitaStr = medico.ultimoContato;
            if (medico.logVisitas.length > 0) {
                // Log items generally have data as ISO string, but sorting might be needed to be completely robust
                // Let's assume logVisitas is ordered, or we can find the most recent one
                const logsOrdenados = [...medico.logVisitas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
                ultimaVisitaStr = logsOrdenados[0].data;
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

    return { alertas, total: alertas.length };
}
