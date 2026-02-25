import { useState, useCallback, useEffect } from 'react';
import { gapi } from 'gapi-script';
import { toast } from 'sonner';

export interface CalendarEventParams {
    title: string;
    description: string;
    location: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
}

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

export function useGoogleCalendar() {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const configStr = localStorage.getItem('@farmaTec:googleConfig');
        if (!configStr) return;

        const config = JSON.parse(configStr);
        if (!config.clientId || !config.apiKey) return;

        const initClient = async () => {
            try {
                await gapi.client.init({
                    apiKey: config.apiKey,
                    clientId: config.clientId,
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: SCOPES,
                });
                setIsInitialized(true);
                setIsAuthenticated(gapi.auth2.getAuthInstance().isSignedIn.get());

                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn: boolean) => {
                    setIsAuthenticated(isSignedIn);
                });
            } catch (error) {
                console.error("Error initializing GAPI client", error);
            }
        };

        gapi.load('client:auth2', initClient);
    }, []);

    const authenticate = useCallback(async () => {
        if (!isInitialized) {
            toast.error('Configurações do Google (API Key/Client ID) ausentes ou inválidas.');
            return false;
        }
        try {
            await gapi.auth2.getAuthInstance().signIn();
            return true;
        } catch (error) {
            console.error("Authentication failed", error);
            toast.error('Falha na autenticação com o Google.');
            return false;
        }
    }, [isInitialized]);

    const syncVisitToGoogle = useCallback(async (params: CalendarEventParams) => {
        if (!isAuthenticated) {
            const authSuccess = await authenticate();
            if (!authSuccess) return false;
        }

        try {
            const startDateTime = new Date(`${params.date}T${params.time}:00`).toISOString();
            // Assuming visits take 1 hour
            const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

            const event = {
                summary: params.title,
                location: params.location,
                description: params.description,
                start: {
                    dateTime: startDateTime,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                end: {
                    dateTime: endDateTime,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 30 },
                    ],
                },
            };

            const request = gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            await new Promise((resolve, reject) => {
                request.execute((event: any) => {
                    if (event.htmlLink) {
                        toast.success('Evento criado no Google Calendar!', {
                            action: {
                                label: 'Visualizar',
                                onClick: () => window.open(event.htmlLink, '_blank')
                            }
                        });
                        resolve(true);
                    } else {
                        toast.error('Ocorreu um erro ao criar o evento no calendar.');
                        reject(new Error('Failed to create event'));
                    }
                });
            });

            return true;
        } catch (error) {
            console.error("Error creating event", error);
            toast.error('Erro na sincronização com o calendário.');
            return false;
        }
    }, [isAuthenticated, authenticate]);

    return {
        isInitialized,
        isAuthenticated,
        authenticate,
        syncVisitToGoogle
    };
}
