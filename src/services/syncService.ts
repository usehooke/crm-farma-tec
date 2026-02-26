import { doc, getDocs, writeBatch, collection } from 'firebase/firestore';
import { db } from './firebaseConfig';
import medicosData from '../data/carteira_medicos_top50.json';

export const fazerPushParaNuvem = async (uid: string, medicos: any[]) => {
    if (!uid) throw new Error("Usuário não autenticado");

    const batch = writeBatch(db);
    const userRef = doc(db, 'usuarios', uid);

    batch.set(userRef, { lastSync: new Date().toISOString() }, { merge: true });

    medicos.forEach(medico => {
        const medicoRef = doc(collection(userRef, 'medicos'), medico.id);
        batch.set(medicoRef, { ...medico, ownerId: uid });
    });

    await batch.commit();
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
            id: crypto.randomUUID(), // Sempre gera novo UUID para evitar colisões na carga
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
