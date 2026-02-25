import { doc, getDocs, writeBatch, collection } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const fazerPushParaNuvem = async (uid: string, medicos: any[]) => {
    if (!uid) throw new Error("Usuário não autenticado");

    const batch = writeBatch(db);
    const userRef = doc(db, 'usuarios', uid);

    // Opcional: Garante que o documento do usuário exista
    batch.set(userRef, { lastSync: new Date().toISOString() }, { merge: true });

    medicos.forEach(medico => {
        // Referencia o sub-documento médico
        const medicoRef = doc(collection(userRef, 'medicos'), medico.id);
        batch.set(medicoRef, medico);
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

    // Limpa e atualiza LocalStorage
    localStorage.setItem('@FarmaTec:medicos', JSON.stringify(medicos));
    localStorage.setItem('@FarmaClinIQ:medicos', JSON.stringify(medicos)); // Garantindo a retrocompatibilidade de chaves

    return medicos;
};
