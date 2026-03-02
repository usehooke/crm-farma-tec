import React, { createContext, useContext, useState, useEffect } from 'react';

import type { User } from 'firebase/auth';

export interface VipTag {
    id: string;
    name: string;
    color: string;
}

export const DEFAULT_TAGS: VipTag[] = [
    { id: '1', name: 'Prescritor Alto', color: 'bg-green-500' },
    { id: '2', name: 'Potencial', color: 'bg-blue-500' },
    { id: '3', name: 'KOL', color: 'bg-purple-500' }
];

export interface EventoAgenda {
    id: string;
    titulo: string;
    tipo: 'Congresso' | 'Feira' | 'Workshop' | 'Outros';
    data: string;
    hora: string;
    observacoes: string;
}

export interface NotaLivre {
    id: string;
    titulo: string;
    conteudo: string;
    data: string;
    fixada?: boolean;
    cor?: string; // e.g., 'bg-yellow-100'
    checklist?: { id: string; texto: string; concluido: boolean }[];
}


interface ConfigContextData {
    nomeUsuario: string;
    setNomeUsuario: (nome: string) => void;
    telefoneUsuario: string;
    setTelefoneUsuario: (telefone: string) => void;
    vipTags: VipTag[];
    salvarVipTags: (tags: VipTag[]) => void;
    googleConectado: boolean;
    setGoogleConectado: (conectado: boolean) => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    medicos: any[];
    setMedicos: (lista: any[]) => void;
    eventos: EventoAgenda[];
    setEventos: (lista: EventoAgenda[]) => void;
    notas: NotaLivre[];
    setNotas: (lista: NotaLivre[]) => void;
    user: User | null;
    setUser: (user: User | null) => void;
    loadingConfig: boolean;
    cloudSyncError: string | null;
    setCloudSyncError: (error: string | null) => void;
    syncInProgress: boolean;
    setSyncInProgress: (syncing: boolean) => void;
}

const ConfigContext = createContext<ConfigContextData>({} as ConfigContextData);

export const STORAGE_KEY_MEDICOS = '@FarmaClinIQ:medicos';
export const STORAGE_KEY_USER = '@FarmaClinIQ:user_nome';
export const STORAGE_KEY_TAGS = '@FarmaClinIQ:vip_tags';
export const STORAGE_KEY_PHONE = '@FarmaClinIQ:user_phone';
export const STORAGE_KEY_GOOGLE = '@FarmaClinQI:google_api_key';
const LEGACY_KEY_MEDICOS = '@FarmaClinQI:medicos';

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [nomeUsuario, setNomeUsuarioState] = useState('');
    const [telefoneUsuario, setTelefoneUsuarioState] = useState('');
    const [vipTags, setVipTagsState] = useState<VipTag[]>([]);
    const [googleConectado, setGoogleConectadoState] = useState(false);
    const [isDarkMode, setIsDarkModeState] = useState(false);
    const [medicos, setMedicosState] = useState<any[]>([]);
    const [eventos, setEventosState] = useState<EventoAgenda[]>([]);
    const [notas, setNotasState] = useState<NotaLivre[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
    const [syncInProgress, setSyncInProgress] = useState(false);

    const getStorageKey = (uid: string | undefined) => uid ? `@FarmaClinIQ:${uid}:medicos` : null;
    const getEventosStorageKey = (uid: string | undefined) => uid ? `@FarmaClinIQ:${uid}:eventos` : null;
    const getNotasStorageKey = (uid: string | undefined) => uid ? `@FarmaClinIQ:${uid}:notas` : null;


    useEffect(() => {
        // 1. Script de Migração Automática (Segurança de Dados)
        const dadosLegados = localStorage.getItem(LEGACY_KEY_MEDICOS);
        if (dadosLegados && !localStorage.getItem(STORAGE_KEY_MEDICOS)) {
            localStorage.setItem(STORAGE_KEY_MEDICOS, dadosLegados);
            localStorage.removeItem(LEGACY_KEY_MEDICOS);

        }

        // 2. Carga Inicial de Dados de Configuração
        const user = localStorage.getItem(STORAGE_KEY_USER);
        const userPhone = localStorage.getItem(STORAGE_KEY_PHONE);
        const tagsSalvas = localStorage.getItem(STORAGE_KEY_TAGS);
        const googleToken = localStorage.getItem(STORAGE_KEY_GOOGLE);

        if (user) setNomeUsuarioState(user);
        if (userPhone) setTelefoneUsuarioState(userPhone);
        if (tagsSalvas) {
            setVipTagsState(JSON.parse(tagsSalvas));
        } else {
            setVipTagsState(DEFAULT_TAGS);
        }

        if (googleToken) setGoogleConectadoState(true);

        const savedDark = localStorage.getItem('@FarmaClinIQ:dark_mode');
        if (savedDark === 'true') {
            setIsDarkModeState(true);
            document.documentElement.classList.add('dark');
        }

        setLoadingConfig(false);
    }, []);

    // 3. Carga de Dados reativa ao Usuário
    useEffect(() => {
        if (user) {
            const keyMedicos = getStorageKey(user.uid);
            const keyEventos = getEventosStorageKey(user.uid);
            const keyNotas = getNotasStorageKey(user.uid);

            if (keyMedicos) {
                const medicosSalvos = localStorage.getItem(keyMedicos);
                setMedicosState(medicosSalvos ? JSON.parse(medicosSalvos) : []);
            }
            if (keyEventos) {
                const eventosSalvos = localStorage.getItem(keyEventos);
                setEventosState(eventosSalvos ? JSON.parse(eventosSalvos) : []);
            }
            if (keyNotas) {
                const notasSalvas = localStorage.getItem(keyNotas);
                setNotasState(notasSalvas ? JSON.parse(notasSalvas) : []);
            }
        } else {
            setMedicosState([]);
            setEventosState([]);
            setNotasState([]);
        }
    }, [user]);

    // Persistência automática de médicos com chave dinâmica
    useEffect(() => {
        if (!loadingConfig && user) {
            const key = getStorageKey(user.uid);
            if (key) {
                localStorage.setItem(key, JSON.stringify(medicos));
            }
        }
    }, [medicos, loadingConfig, user]);

    useEffect(() => {
        if (!loadingConfig && user) {
            const key = getEventosStorageKey(user.uid);
            if (key) {
                localStorage.setItem(key, JSON.stringify(eventos));
            }
        }
    }, [eventos, loadingConfig, user]);

    useEffect(() => {
        if (!loadingConfig && user) {
            const key = getNotasStorageKey(user.uid);
            if (key) {
                localStorage.setItem(key, JSON.stringify(notas));
            }
        }
    }, [notas, loadingConfig, user]);

    const setNomeUsuario = (novoNome: string) => {
        setNomeUsuarioState(novoNome);
        localStorage.setItem(STORAGE_KEY_USER, novoNome);
    };

    const setTelefoneUsuario = (novoTelefone: string) => {
        setTelefoneUsuarioState(novoTelefone);
        localStorage.setItem(STORAGE_KEY_PHONE, novoTelefone);
    };

    const salvarVipTags = (novasTags: VipTag[]) => {
        setVipTagsState(novasTags);
        localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(novasTags));
    };

    const setGoogleConectado = (conectado: boolean) => {
        setGoogleConectadoState(conectado);
        if (!conectado) {
            localStorage.removeItem(STORAGE_KEY_GOOGLE);
        }
    };

    const setIsDarkMode = (isDark: boolean) => {
        setIsDarkModeState(isDark);
        localStorage.setItem('@FarmaClinIQ:dark_mode', String(isDark));
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <ConfigContext.Provider value={{
            nomeUsuario,
            setNomeUsuario,
            telefoneUsuario,
            setTelefoneUsuario,
            vipTags,
            salvarVipTags,
            googleConectado,
            setGoogleConectado,
            isDarkMode,
            setIsDarkMode,
            medicos,
            setMedicos: setMedicosState,
            eventos,
            setEventos: setEventosState,
            notas,
            setNotas: setNotasState,
            user,
            setUser,
            loadingConfig,
            cloudSyncError,
            setCloudSyncError,
            syncInProgress,
            setSyncInProgress
        }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);


