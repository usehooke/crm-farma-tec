export interface Protocolo {
    id: string;
    titulo: string;
    categoria: string;
    descricao: string;
    pdfUrl: string;
    capaUrl: string;
}

export const LISTA_PROTOCOLOS: Protocolo[] = [
    {
        id: '1',
        titulo: 'Modulação Hormonal Menopausa',
        categoria: 'Hormonal',
        descricao: 'Protocolo avançado para equilíbrio estrogênico e bem-estar.',
        pdfUrl: 'https://elmeco.com.br/protocolos/menopausa.pdf',
        capaUrl: 'https://images.unsplash.com/photo-1576091160550-217359f4b0d4?auto=format&fit=crop&w=300'
    },
    {
        id: '2',
        titulo: 'Implantes Biodegradáveis vs Siliconados',
        categoria: 'Longevidade',
        descricao: 'Guia comparativo de absorção e liberação controlada.',
        pdfUrl: 'https://elmeco.com.br/protocolos/guia-implantes.pdf',
        capaUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=300'
    },
    {
        id: '3',
        titulo: 'Estratégias para Emagrecimento Saudável',
        categoria: 'Emagrecimento',
        descricao: 'Abordagem multidisciplinar e metabólica.',
        pdfUrl: 'https://elmeco.com.br/protocolos/emagrecimento.pdf',
        capaUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300'
    }
];
