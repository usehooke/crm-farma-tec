import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, hasValidConfig } from '../services/firebaseConfig';
import { useConfig } from '../context/ConfigContext';
import { fazerPullDaNuvem, importarCarteiraTop50 } from '../services/syncService';

/**
 * Hook Especializado na Orquestração de Sincronização e Autenticação.
 * [Componente da Operação Blindagem - @Agent-LegacyRescue]
 */
export function useSyncManager() {
  const {
    setUser,
    setCloudSyncError,
    setSyncInProgress,
    setMedicos,
    setEventos,
    setNotas
  } = useConfig();

  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (!hasValidConfig) {
      setIsAuthLoading(false);
      return;
    }

    const constSubscribe = onAuthStateChanged(auth, async (user) => {
      // 1. Atualiza o estado global IMEDIATAMENTE antes de qualquer ação
      setUser(user);
      setUsuarioLogado(user);
      setCloudSyncError(null);

      if (user) {
        // Enforce Sync In Progress state
        setSyncInProgress(true);
        
        try {
          // 2. Handshake com a nuvem (Pull Inicial)
          let dadosNuvem = await fazerPullDaNuvem(user.uid);

          // 3. Fallback: Se a nuvem estiver vazia, tenta importar carteira padrão (Top 50)
          if (dadosNuvem.medicos.length === 0) {
            const result = await importarCarteiraTop50(user.uid);
            if (result.success) {
              dadosNuvem = await fazerPullDaNuvem(user.uid);
            }
          }

          // 4. Commita os dados sincronizados para o estado global React (ConfigContext)
          // Isso garante que a UI reflita a verdade da nuvem após o login
          if (dadosNuvem.medicos.length > 0) {
            setMedicos(dadosNuvem.medicos);
          }
          if (dadosNuvem.eventos && dadosNuvem.eventos.length > 0) {
            setEventos(dadosNuvem.eventos);
          }
          if (dadosNuvem.notas && dadosNuvem.notas.length > 0) {
            setNotas(dadosNuvem.notas);
          }
        } catch (e: unknown) {
          console.error("[@Agent-LegacyRescue] Erro crítico no handshake de sincronização:", e);
          if (e instanceof Error) {
            setCloudSyncError(e.message);
          } else {
            setCloudSyncError('Erro desconhecido na sincronização em nuvem');
          }
        } finally {
          setSyncInProgress(false);
        }
      }

      setIsAuthLoading(false);
    });

    return () => constSubscribe();
  }, []); // Solução da Operação Blindagem: Subscrição apenas na montagem.

  return { usuarioLogado, isAuthLoading };
}
