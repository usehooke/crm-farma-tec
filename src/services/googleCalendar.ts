export interface VisitaEvent {
    medicoNome: string;
    data: string; // Formato YYYY-MM-DD
    hora: string; // Formato HH:MM
    tipo: string;
    pauta: string;
    localizacao?: string;
    statusAtual?: string;
    especialidade?: string;
}

export const syncVisitaGoogleCalendar = async (visita: VisitaEvent) => {
    // 1. Resgata o token de acesso salvo no LocalStorage (Configurações do Usuário)
    const accessToken = localStorage.getItem('@farmaTec:google_api_key');

    if (!accessToken) {
        throw new Error('Usuário não autenticado no Google. Configure sua API KEY em Ajustes.');
    }

    // 2. Formata Data e Hora para o padrão ISO 8601 com Fuso Horário de Brasília (-03:00)
    const dataHoraInicio = new Date(`${visita.data}T${visita.hora}:00-03:00`);

    // Estima 1 hora de duração para a visita
    const dataHoraFim = new Date(dataHoraInicio.getTime() + 60 * 60 * 1000);

    // 3. Monta o Payload do Evento
    const eventPayload = {
        summary: `🩺 Visita FarmaClinIQ: Dr(a). ${visita.medicoNome}`,
        description: `**Tipo:** ${visita.tipo}\n\n**Pauta:**\n${visita.pauta || 'Nenhuma pauta definida.'}\n\n**Contexto:**\nEspecialidade: ${visita.especialidade}\nStatus: ${visita.statusAtual}\n\nAgendado via FarmaClinIQ.`,
        location: visita.localizacao,
        start: {
            dateTime: dataHoraInicio.toISOString(),
            timeZone: 'America/Sao_Paulo',
        },
        end: {
            dateTime: dataHoraFim.toISOString(),
            timeZone: 'America/Sao_Paulo',
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'popup', minutes: 30 }, // Alerta no celular 30 min antes
            ],
        },
    };

    // 4. Dispara para a API do Google
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao sincronizar com o Google: ${errorData?.error?.message || 'Erro Desconhecido'}`);
    }

    return await response.json();
};
