import { doc, getDocs, writeBatch, collection, deleteDoc } from 'firebase/firestore';
import { generateUUID } from '../utils/utils';
import { db } from './firebaseConfig';
import medicosData from '../data/carteira_medicos_top50.json';

export const fazerPushParaNuvem = async (uid: string, medicos: any[], eventos: any[] = [], notas: any[] = []) => {
    if (!uid) throw new Error("Usuário não autenticado");
    if (!medicos || medicos.length === 0) return;

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const batch = writeBatch(db);
            const userRef = doc(db, 'usuarios', uid);

            // Atualiza timestamp de sincronização no perfil do usuário
            batch.set(userRef, {
                lastSync: new Date().toISOString(),
                uid // Garante que o documento do usuário exista
            }, { merge: true });

            // Filtra médicos válidos (devem ter um ID)
            const medicosValidos = medicos.filter(m => m && m.id);
            const eventosValidos = eventos.filter(e => e && e.id);
            const notasValidas = notas.filter(n => n && n.id);

            medicosValidos.forEach(medico => {
                const medicoRef = doc(collection(userRef, 'medicos'), medico.id);
                // Normalização: trim() e toUpperCase()
                const medicoNormalizado = {
                    ...medico,
                    nome: medico.nome.trim().toUpperCase(),
                    localizacao: medico.localizacao.trim().toUpperCase(),
                    crm: medico.crm ? medico.crm.trim().toUpperCase() : '',
                    ownerId: uid
                };
                const cleanMedico = JSON.parse(JSON.stringify(medicoNormalizado));
                batch.set(medicoRef, cleanMedico, { merge: true });
            });

            eventosValidos.forEach(evento => {
                const eventoRef = doc(collection(userRef, 'eventos'), evento.id);
                const cleanEvento = JSON.parse(JSON.stringify({ ...evento, ownerId: uid }));
                batch.set(eventoRef, cleanEvento, { merge: true });
            });

            notasValidas.forEach(nota => {
                const notaRef = doc(collection(userRef, 'notas'), nota.id);
                const cleanNota = JSON.parse(JSON.stringify({ ...nota, ownerId: uid }));
                batch.set(notaRef, cleanNota, { merge: true });
            });

            await batch.commit();
            return; // Succeeded, exit loop
        } catch (error: unknown) {
            console.error(`Firebase Sync Error (Tentativa ${attempt}/${MAX_RETRIES}):`, error);

            if (attempt === MAX_RETRIES) {
                if (error instanceof Error) {
                    throw new Error(`Falha no Firestore após ${MAX_RETRIES} tentativas: ${error.message}`);
                }
                throw new Error(`Falha no Firestore após ${MAX_RETRIES} tentativas: Erro desconhecido`);
            }

            // Exponential Backoff (500ms, 1000ms, etc)
            await new Promise(resolve => setTimeout(resolve, attempt * 500));
        }
    }
};

export const fazerPullDaNuvem = async (uid: string) => {
    if (!uid) throw new Error("Usuário não autenticado");

    const medicosRef = collection(db, 'usuarios', uid, 'medicos');
    const eventosRef = collection(db, 'usuarios', uid, 'eventos');
    const notasRef = collection(db, 'usuarios', uid, 'notas');

    const [queryMedicos, queryEventos, queryNotas] = await Promise.all([
        getDocs(medicosRef),
        getDocs(eventosRef),
        getDocs(notasRef)
    ]);

    const medicos: any[] = [];
    queryMedicos.forEach((doc) => medicos.push(doc.data()));

    const eventos: any[] = [];
    queryEventos.forEach((doc) => eventos.push(doc.data()));

    const notas: any[] = [];
    queryNotas.forEach((doc) => notas.push(doc.data()));

    return { medicos, eventos, notas };
};

export const importarCarteiraTop50 = async (uid: string) => {
    if (!uid) return { success: false, error: 'Usuário não autenticado' };

    const batch = writeBatch(db);
    const userMedicosRef = collection(db, 'usuarios', uid, 'medicos');

    medicosData.forEach((medico: any) => {
        const novoMedicoRef = doc(userMedicosRef);

        batch.set(novoMedicoRef, {
            ...medico,
            id: generateUUID(), // Sempre gera novo UUID para evitar colisões na carga
            ownerId: uid,
            consultor: 'Ariani',
            createdAt: new Date().toISOString(),
            ultimaAtualizacao: new Date().toISOString()
        });
    });

    try {
        await batch.commit();
        return { success: true, count: medicosData.length };
    } catch (error) {
        console.error("Erro na carga de dados:", error);
        return { success: false, error };
    }
};

export const apagarMedicoNuvem = async (uid: string, medicoId: string) => {
    if (!uid || !medicoId) return;
    try {
        const medicoRef = doc(db, 'usuarios', uid, 'medicos', medicoId);
        await deleteDoc(medicoRef);
    } catch (error) {
        console.error("Erro ao deletar médico na nuvem:", error);
    }
};

