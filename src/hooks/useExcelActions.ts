import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import type { Medico, LogVisita } from './useMedicos';
import { toast } from 'sonner';

export function useExcelActions(
    medicos: Medico[],
    adicionarMedico: (novo: Omit<Medico, 'id'>) => void,
    atualizarMedico: (id: string, dados: Partial<Medico>) => void
) {

    const handleImport = useCallback((file: File) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Converte a primeira aba em um Array de Objetos JSON
                const rawJson = XLSX.utils.sheet_to_json(sheet) as any[];

                let createdCount = 0;
                let updatedCount = 0;
                let errorCount = 0;

                rawJson.forEach((row) => {
                    // Normaliza os campos baseados nas colunas predefinidas
                    const nomeCru = row['Nome'] || row['nome'] || row['Nome Completo'] || row['Medico'];
                    const specCru = row['Especialidade'] || row['especialidade'] || row['Espec'] || 'Não Informado';
                    const telCru = row['Telefone'] || row['telefone'] || row['Celular'] || row['WhatsApp'] || '';
                    const locCru = row['Localizacao'] || row['localizacao'] || row['Localização'] || row['Clinica'] || row['Endereço'] || 'Não Informado';

                    if (!nomeCru) {
                        errorCount++;
                        return;
                    }

                    // Higienização do WhatsApp (Apenas Números)
                    const telSanitizado = String(telCru).replace(/\D/g, '');

                    // LÓGICA DE MERGE (Busca por telefone sanitizado OU Nome exato)
                    const medicoExistente = medicos.find(m =>
                        (telSanitizado && m.telefone.replace(/\D/g, '') === telSanitizado) ||
                        m.nome.toLowerCase().trim() === String(nomeCru).toLowerCase().trim()
                    );

                    if (medicoExistente) {
                        // Atualiza apenas os dados faltantes/novos, mantendo o histórico intacto
                        atualizarMedico(medicoExistente.id, {
                            telefone: telSanitizado || medicoExistente.telefone, // Prevalece o novo ou mantém o antigo
                            especialidade: specCru !== 'Não Informado' ? String(specCru) : medicoExistente.especialidade,
                            localizacao: locCru !== 'Não Informado' ? String(locCru) : medicoExistente.localizacao
                        });
                        updatedCount++;
                    } else {
                        // Cria um contato 100% fresco do Excel
                        adicionarMedico({
                            nome: String(nomeCru),
                            telefone: telSanitizado,
                            especialidade: String(specCru),
                            localizacao: String(locCru),
                            status: 'Prospecção',
                            logVisitas: [],
                            tags: [],
                            ultimoContato: new Date().toISOString()
                        });
                        createdCount++;
                    }
                });

                toast.success('Excel Processado com Sucesso!', {
                    description: `${createdCount} novos médicos. ${updatedCount} fichas mescladas/atualizadas.`,
                    duration: 5000,
                });

            } catch (error) {
                toast.error('Ocorreu um erro ao ler a sua planilha.');
                console.error(error);
            }
        };

        reader.readAsBinaryString(file);
    }, [medicos, adicionarMedico, atualizarMedico]);


    // Relatório 1: Exportar Base do Hooke
    const exportBase = useCallback(() => {
        const wsData = medicos.map(m => ({
            "Status no Funil": m.status,
            "Nome": m.nome,
            "WhatsApp Tratado": m.telefone,
            "Especialidade": m.especialidade,
            "Clínica/Local": m.localizacao,
            "Última Interação": m.ultimoContato ? new Date(m.ultimoContato).toLocaleDateString() : 'N/A',
            "Engajamentos": m.logVisitas.length,
            "Tags Vip": m.tags ? m.tags.join(', ') : ''
        }));

        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Base CRM Farma Tec");

        XLSX.writeFile(wb, `Base_Medicos_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Download da sua Base de Médicos concluído!');
    }, [medicos]);


    // Relatório 2: Diário de Bordo (Feed Tático para Diretoria)
    const exportDiario = useCallback(() => {
        // Achatamento de Dados: Extrai o histórico inteiro do CRM para uma array flat cruzando com o médico pai.
        const diarioFlat: any[] = [];

        medicos.forEach(m => {
            m.logVisitas.forEach((log: LogVisita) => {
                diarioFlat.push({
                    "Data do Registro": new Date(log.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    "Timestamp": new Date(log.data).getTime(),
                    "Médico Visitado": m.nome,
                    "Especialidade": m.especialidade,
                    "Local/Clínica": m.localizacao,
                    "Relato Técnico/Dúvida": log.nota
                });
            });
        });

        // Ordena do Relato mais recente para o mais antigo
        diarioFlat.sort((a, b) => b["Timestamp"] - a["Timestamp"]);

        // Limpa a coluna Timestamp virtual antes de imprimir no excel
        diarioFlat.forEach(entry => delete entry["Timestamp"]);

        const ws = XLSX.utils.json_to_sheet(diarioFlat);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Diário de Visitas");

        XLSX.writeFile(wb, `Diario_Bordo_FarmaTec_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('O Diário de Bordo Corporativo foi baixado perfeitamente.', { icon: '📊' });
    }, [medicos]);


    return { handleImport, exportBase, exportDiario };
}
