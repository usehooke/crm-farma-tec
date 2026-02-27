import { doc, getDocs, writeBatch, collection } from 'firebase/firestore';
import { generateUUID } from '../utils/utils';
import { db } from './firebaseConfig';
import medicosData from '../data/carteira_medicos_top50.json';

export const fazerPushParaNuvem = async (uid: string, medicos: any[]) => {
    if (!uid) throw new Error("Usuário não autenticado");
    if (!medicos || medicos.length === 0) return;

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

        // Firestore Batch tem limite de 500 operações. 
        // Se houver mais de 500, precisamos dividir, mas para 50-100 está ok.
        medicosValidos.forEach(medico => {
            const medicoRef = doc(collection(userRef, 'medicos'), medico.id);
            // Remove campos undefined para evitar erro no Firestore
            const cleanMedico = JSON.parse(JSON.stringify({ ...medico, ownerId: uid }));
            batch.set(medicoRef, cleanMedico, { merge: true });
        });

        await batch.commit();

    } catch (error: any) {
        console.error("Firebase Sync Error Details:", error);
        throw new Error(`Erro no Firestore: ${error.message || 'Erro desconhecido'}`);
    }
};

export const fazerPullDaNuvem = async (uid: string) => {
    if (!uid) throw new Error("Usuário não autenticado");

    const medicosRef = collection(db, 'usuarios', uid, 'medicos');
    const querySnapshot = await getDocs(medicosRef);

    const medicos: any[] = [];
    querySnapshot.forEach((doc) => {
        medicos.push(doc.data());
    });

    return medicos;
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

