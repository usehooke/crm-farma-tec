import { useConfig } from '../context/ConfigContext';
import type { NotaLivre } from '../context/ConfigContext';
import { generateUUID } from '../utils/utils';
import { toast } from 'sonner';

export const PASTEL_COLORS = [
    'bg-yellow-100', // Default
    'bg-blue-100',
    'bg-green-100',
    'bg-pink-100',
    'bg-purple-100',
    'bg-orange-100'
];

export function usePostIts() {
    const { notas, setNotas } = useConfig();

    const addPostIt = (titulo: string, conteudo: string, cor: string = PASTEL_COLORS[0], checklist: NotaLivre['checklist'] = []) => {
        const novo: NotaLivre = {
            id: generateUUID(),
            titulo,
            conteudo,
            data: new Date().toISOString(),
            fixada: false,
            cor,
            checklist
        };
        setNotas([novo, ...notas]);
        toast.success('Post-it criado com sucesso!');
    };

    const updatePostIt = (id: string, dados: Partial<NotaLivre>) => {
        setNotas(notas.map(n => n.id === id ? { ...n, ...dados } : n));
        toast.success('Post-it atualizado!');
    };

    const removePostIt = (id: string) => {
        if (window.confirm('Excluir este Post-it?')) {
            setNotas(notas.filter(n => n.id !== id));
            toast.success('Post-it removido!');
        }
    };

    const togglePin = (id: string, currentlyPinned: boolean) => {
        setNotas(notas.map(n => n.id === id ? { ...n, fixada: !currentlyPinned } : n));
        if (!currentlyPinned) toast.success('Post-it fixado no topo!');
    };

    const toggleChecklistItem = (postItId: string, itemId: string) => {
        setNotas(notas.map(n => {
            if (n.id === postItId && n.checklist) {
                return {
                    ...n,
                    checklist: n.checklist.map(item => item.id === itemId ? { ...item, concluido: !item.concluido } : item)
                };
            }
            return n;
        }));
    };

    return {
        postIts: notas,
        addPostIt,
        updatePostIt,
        removePostIt,
        togglePin,
        toggleChecklistItem
    };
}
