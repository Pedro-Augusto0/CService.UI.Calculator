export const DEFAULT_PRICES = {
    volumePrice: 2.15,
    destinatarioPrice: 0.35,
    servicePrices: {
        texto: 1.2,
        centimetragem: 0.85,
        grifo: 0.45,
        score: 0.65,
        avaliacao: 1.5,
        ia: 2.1,
        screenshot: 0.95,
    },
    broadcast: {
        tv: { sp_rj: 500, nacional: 1800 },
        radio: { sp_rj: 320, nacional: 950 },
        relatorio: { mensal: 1000, semanal: 1850 },
    },
    additionals: {
        midiasSociaisIncludedPosts: 300,
        midiasSociaisExcessPostsStep: 100,
        midiasSociaisExcessPricePerStep: 50,
        alertasWebPricePerExtraEnvio: 50,
        api: 400,
        stories: 280,
        destaques: 220,
    },
};
export const MONITORING_LABELS = {
    texto: 'Texto',
    centimetragem: 'Centimetragem',
    grifo: 'Grifo',
    score: 'Score',
    avaliacao: 'Avaliação',
    ia: 'IA',
    screenshot: 'Screenshot',
};
export const SECTION_LABELS = {
    marcas: 'Marcas',
    concorrentes: 'Concorrentes',
    setor: 'Setor',
};
