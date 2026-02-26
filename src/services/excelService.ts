import * as XLSX from 'xlsx';

export const importarPlanilhaMedicos = async (
    ficheiro: File,
    uid: string,
    onSuccess: (quantidade: number) => void,
    onError: (erro: string) => void
) => {
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });

            // Assume que os dados estão na primeira folha (Sheet)
            const primeiraFolha = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[primeiraFolha];

            // Converte a folha para um array de objetos JSON, pulando a primeira linha de título
            const linhasRaw: any[] = XLSX.utils.sheet_to_json(worksheet, { range: 1 });

            if (linhasRaw.length === 0) {
                throw new Error("A folha de cálculo está vazia.");
            }

            // Mapeamento e Sanitização dos Dados
            const novosMedicos = linhasRaw.map((linha) => {
                const nome = linha.CLIENTE || linha.Cliente || linha.Nome || linha.NOME || linha.nome || 'Sem Nome';

                // Lógica de Telefone Inteligente (55 + DDD + NÚMERO)
                let telFinal = '';
                const ddd = String(linha.DDD || '').replace(/\D/g, '');
                const num = String(linha['NÚMERO'] || linha.Numero || linha.numero || '').replace(/\D/g, '');
                const telSimples = String(linha.Telefone || linha.TELEFONE || '').replace(/\D/g, '');

                if (ddd && num) {
                    telFinal = `55${ddd}${num}`;
                } else if (telSimples) {
                    // Se já tiver Telefone, mas não começar com 55, adicionamos
                    telFinal = telSimples.startsWith('55') ? telSimples : `55${telSimples}`;
                }

                // Localização consolidada
                const cidade = linha.CIDADE || linha.Cidade || '';
                const bairro = linha.BAIRRO || linha.Bairro || '';
                const localizacao = [cidade, bairro].filter(Boolean).join(' - ') || 'N/A';

                return {
                    id: crypto.randomUUID(),
                    nome: nome,
                    especialidade: linha.Especialidade || linha.ESPECIALIDADE || 'Geral',
                    telefone: telFinal,
                    status: 'Prospecção',
                    localizacao: localizacao,
                    tags: linha.Tags ? linha.Tags.split(',').map((t: string) => t.trim()) : ['Novo'],
                    ultimoContato: new Date().toISOString(),
                    logVisitas: [],
                    consultor: 'Ariani', // Unificação de Carteira
                    ownerId: uid
                };
            });

            // Chave dinâmica baseada no UID para isolamento
            const STORAGE_KEY = `@FarmaClinIQ:${uid}:medicos`;

            // Fundir com os dados existentes no LocalStorage isolado
            const medicosExistentesRaw = localStorage.getItem(STORAGE_KEY);
            const medicosExistentes = medicosExistentesRaw ? JSON.parse(medicosExistentesRaw) : [];

            const baseAtualizada = [...medicosExistentes, ...novosMedicos];

            localStorage.setItem(STORAGE_KEY, JSON.stringify(baseAtualizada));

            onSuccess(novosMedicos.length);
        } catch (error: any) {
            onError(error.message || "Erro ao processar o ficheiro. Verifique o formato.");
        }
    };

    reader.onerror = () => {
        onError("Falha na leitura do ficheiro pelo navegador.");
    };

    reader.readAsArrayBuffer(ficheiro);
};
