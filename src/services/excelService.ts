import * as XLSX from 'xlsx';

export const importarPlanilhaMedicos = async (
    ficheiro: File,
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

            // Converte a folha para um array de objetos JSON
            const linhasRaw: any[] = XLSX.utils.sheet_to_json(worksheet);

            if (linhasRaw.length === 0) {
                throw new Error("A folha de cálculo está vazia.");
            }

            // Mapeamento e Sanitização dos Dados
            const novosMedicos = linhasRaw.map((linha) => ({
                id: crypto.randomUUID(),
                nome: linha.Nome || linha.NOME || linha.nome || 'Sem Nome',
                especialidade: linha.Especialidade || linha.ESPECIALIDADE || 'Geral',
                telefone: linha.Telefone || linha.TELEFONE || '',
                status: 'Prospecção',
                localizacao: 'N/A', // Campos obrigatórios pela interface Medico
                tags: linha.Tags ? linha.Tags.split(',').map((t: string) => t.trim()) : ['Novo'],
                ultimoContato: new Date().toISOString(),
                logVisitas: [] // Inicializa o histórico vazio para o cálculo de Follow-up
            }));

            // Fundir com os dados existentes no LocalStorage da V2
            const medicosExistentesRaw = localStorage.getItem('@FarmaTec:medicos');
            const medicosExistentes = medicosExistentesRaw ? JSON.parse(medicosExistentesRaw) : [];

            const baseAtualizada = [...medicosExistentes, ...novosMedicos];

            localStorage.setItem('@FarmaTec:medicos', JSON.stringify(baseAtualizada));

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
