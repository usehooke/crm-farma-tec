import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    setDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { generateUUID } from '../utils/utils';

export interface Protocolo {
    id: string;
    titulo: string;
    categoria: string;
    descricao: string;
    pdfUrl: string;
    capaUrl: string;
    createdAt?: string;
}

/**
 * Escuta os protocolos de um usuário específico em tempo real
 */
export const escutarProtocolos = (uid: string, callback: (protocolos: Protocolo[]) => void) => {
    if (!uid) return () => { };

    const q = query(
        collection(db, 'usuarios', uid, 'protocolos'),
        orderBy('titulo', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const protocolos: Protocolo[] = [];
        snapshot.forEach((doc) => {
            protocolos.push({ id: doc.id, ...doc.data() } as Protocolo);
        });
        callback(protocolos);
    }, (error) => {
        console.error("Erro ao escutar protocolos:", error);
    });
};

/**
 * Adiciona um novo protocolo à biblioteca do usuário
 */
export const adicionarProtocolo = async (uid: string, protocolo: Omit<Protocolo, 'id'>) => {
    if (!uid) throw new Error("Usuário não autenticado");

    const id = generateUUID();
    const docRef = doc(db, 'usuarios', uid, 'protocolos', id);

    const novoProtocolo = {
        ...protocolo,
        id,
        createdAt: new Date().toISOString()
    };

    await setDoc(docRef, novoProtocolo);
    return id;
};

/**
 * Remove um protocolo da biblioteca do usuário
 */
export const removerProtocolo = async (uid: string, protocoloId: string) => {
    if (!uid) throw new Error("Usuário não autenticado");

    const docRef = doc(db, 'usuarios', uid, 'protocolos', protocoloId);
    await deleteDoc(docRef);
};

/**
 * Semente inicial: Se a biblioteca estiver vazia, podemos carregar os protocolos padrão
 */
export const seedProtocolosIniciais = async (uid: string, protocolosIniciais: Protocolo[]) => {
    if (!uid) return;

    for (const p of protocolosIniciais) {
        await adicionarProtocolo(uid, {
            titulo: p.titulo,
            categoria: p.categoria,
            descricao: p.descricao,
            pdfUrl: p.pdfUrl,
            capaUrl: p.capaUrl
        });
    }
};
