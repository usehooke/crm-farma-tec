import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const gerarRelatorioPDF = () => {
    // 1. Busca os dados consolidados do LocalStorage
    const medicosRaw = localStorage.getItem('@FarmaClinQI:medicos'); // Mantendo a chave raiz do array principal
    const nomeUsuario = localStorage.getItem('@FarmaClinIQ:user_nome') || 'Representante';

    if (!medicosRaw) {
        alert('Não há dados suficientes para gerar o relatório.');
        return;
    }

    const medicos = JSON.parse(medicosRaw);

    // 2. Inicializa o documento A4 (retrato)
    const doc = new jsPDF('p', 'pt', 'a4');
    const dataHoje = format(new Date(), 'dd/MM/yyyy');

    // 3. Cabeçalho Corporativo FarmaClinIQ
    doc.setFontSize(22);
    doc.setTextColor(13, 44, 90); // Cor: brand-dark (#0D2C5A)
    doc.text('FarmaClinIQ', 40, 50);

    doc.setFontSize(10);
    doc.setTextColor(0, 168, 168); // Cor: brand-teal (#00A8A8)
    doc.text('Relatório Analítico de Visitação', 40, 65);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado por: ${nomeUsuario}`, 40, 85);
    doc.text(`Data da Emissão: ${dataHoje}`, 40, 98);

    // 4. Preparação dos Dados para a Tabela
    // Mapeamos os médicos para extrair apenas o que importa para a gerência
    const dadosTabela = medicos.map((medico: any) => {
        const ultimaVisita = medico.logVisitas && medico.logVisitas.length > 0
            ? format(new Date(medico.logVisitas[0].data), 'dd/MM/yyyy')
            : 'Sem registro';

        const tagsStr = Array.isArray(medico.tags) ? medico.tags.join(', ') : '-';

        return [
            medico.nome,
            medico.especialidade || 'Geral',
            tagsStr,
            ultimaVisita
        ];
    });

    // 5. Renderização da Tabela (autoTable) com estilo minimalista
    autoTable(doc, {
        startY: 120,
        head: [['Nome do Prescritor', 'Especialidade', 'Classificação', 'Última Visita']],
        body: dadosTabela,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 6,
            textColor: [50, 50, 50],
            lineColor: [242, 242, 242], // brand-surface (#F2F2F2)
            lineWidth: 1,
        },
        headStyles: {
            fillColor: [30, 95, 175], // primary (#1E5FAF)
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left'
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250] // Zebrado super suave para leitura fácil
        }
    });

    // 6. Download do Arquivo Offline
    doc.save(`FarmaClinIQ_Relatorio_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
};

