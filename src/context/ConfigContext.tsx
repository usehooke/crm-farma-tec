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

interface ConfigContextData {
    nomeUsuario: string;
    setNomeUsuario: (nome: string) => void;
    vipTags: VipTag[];
    salvarVipTags: (tags: VipTag[]) => void;
    googleConectado: boolean;
    setGoogleConectado: (conectado: boolean) => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    medicos: any[];
    setMedicos: (lista: any[]) => void;
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
export const STORAGE_KEY_GOOGLE = '@farmaTec:google_api_key';
const LEGACY_KEY_MEDICOS = '@FarmaTec:medicos';

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [nomeUsuario, setNomeUsuarioState] = useState('');
    const [vipTags, setVipTagsState] = useState<VipTag[]>([]);
    const [googleConectado, setGoogleConectadoState] = useState(false);
    const [isDarkMode, setIsDarkModeState] = useState(false);
    const [medicos, setMedicosState] = useState<any[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
    const [syncInProgress, setSyncInProgress] = useState(false);

    const getStorageKey = (uid: string | undefined) => uid ? `@FarmaClinIQ:${uid}:medicos` : null;

    useEffect(() => {
        // 1. Script de Migração Automática (Segurança de Dados)
        const dadosLegados = localStorage.getItem(LEGACY_KEY_MEDICOS);
        if (dadosLegados && !localStorage.getItem(STORAGE_KEY_MEDICOS)) {
            localStorage.setItem(STORAGE_KEY_MEDICOS, dadosLegados);
            localStorage.removeItem(LEGACY_KEY_MEDICOS);
            console.log('✅ Migração de dados legados concluída para nova chave FarmaClinIQ.');
        }

        // 2. Carga Inicial de Dados de Configuração
        const user = localStorage.getItem(STORAGE_KEY_USER);
        const tagsSalvas = localStorage.getItem(STORAGE_KEY_TAGS);
        const googleToken = localStorage.getItem(STORAGE_KEY_GOOGLE);

        if (user) setNomeUsuarioState(user);
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

    // 3. Carga de Médicos reativa ao Usuário
    useEffect(() => {
        if (user) {
            const key = getStorageKey(user.uid);
            if (key) {
                const medicosSalvos = localStorage.getItem(key);
                if (medicosSalvos) {
                    setMedicosState(JSON.parse(medicosSalvos));
                } else {
                    setMedicosState([]); // Limpa se for um novo usuário sem dados locais
                }
            }
        } else {
            setMedicosState([]); // Bloqueia acesso se deslogado
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

    const setNomeUsuario = (novoNome: string) => {
        setNomeUsuarioState(novoNome);
        localStorage.setItem(STORAGE_KEY_USER, novoNome);
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
            vipTags,
            salvarVipTags,
            googleConectado,
            setGoogleConectado,
            isDarkMode,
            setIsDarkMode,
            medicos,
            setMedicos: setMedicosState,
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
