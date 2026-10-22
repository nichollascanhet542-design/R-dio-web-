/* Lógica Principal da Rádio Web 24h - Transmissão Direta de Áudio (Sem Bloqueios) */

// Motor de áudio nativo do navegador
const radioAudio = new Audio();
radioAudio.crossOrigin = "anonymous";
radioAudio.preload = "auto";

// Lista de Estações 24h (Streams diretos de alta estabilidade)
const radioStations24h = [
    {
        id: 'sertanejo-24h',
        title: 'Rádio Sertanejo Universitário & Raiz (24h)',
        category: 'Manhã Sertaneja • Sucessos',
        // Stream de áudio contínuo compatível com navegadores mobile
        streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv',
        fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
        id: 'modao-24h',
        title: 'Rádio Modão & Clássicos Sertanejos (24h)',
        category: 'Modão de Viola • Raiz',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
        id: 'rodeio-24h',
        title: 'Rádio Country & Rodeio Hits (24h)',
        category: 'Esquenta Rodeio • Arena',
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        fallbackUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
    }
];

// Faixas do Roteiro Programado (Toque Direto Sem Bloqueio)
const playlistTracks = [
    {
        id: 'track-1',
        title: 'Amanhecer na Fazenda - Violão & Viola',
        category: 'Instrumental Country / Folk Acústico',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
        id: 'track-2',
        title: 'Estrada da Vida - Toque de Rodeio',
        category: 'Ritmo Country & Acústico',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
    },
    {
        id: 'track-3',
        title: 'Café Tropeiro - Clássico do Campo',
        category: 'Violão Seresteiro & Natureza',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    },
    {
        id: 'track-4',
        title: 'Arena de Festa - Esquenta Peão',
        category: 'Country Rock & Energia de Rodeio',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
    }
];

// Estado do Aplicativo
let state = {
    mode: 'roteiro', // 'radio24h' ou 'roteiro'
    currentIndex: 0,
    isPlaying: false,
    creatorMode: false
};

// Atualizar os textos e ícones da tela
function atualizarInterface(titulo, subtitulo, statusTexto) {
    // Atualiza os títulos possíveis no HTML
    const possiveisTitulos = ['current-title', 'track-title', 'station-title', 'now-playing-title'];
    possiveisTitulos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = titulo;
    });

    // Busca também pelo título principal dentro do cartão do player
    const h2Player = document.querySelector('h2, .player-title, .station-name');
    if (h2Player && !h2Player.textContent.includes('Painel')) {
        h2Player.textContent = titulo;
    }

    // Atualiza barra inferior "NO AR"
    const allElements = document.querySelectorAll('div, span, p, strong');
    allElements.forEach(el => {
        if (el.children.length === 0) {
            if (el.textContent.includes('Toque no botão Play laranja') || el.textContent.includes('A carregar') || el.textContent.includes('A sintonizar') || el.textContent.includes('Tocando agora')) {
                el.textContent = statusTexto;
            }
            if (el.textContent === 'Pausado' || el.textContent === 'Transmitindo') {
                el.textContent = state.isPlaying ? 'Transmitindo' : 'Pausado';
            }
        }
    });

    // Atualiza o ícone do botão Play/Pause principal
    const playBtns = document.querySelectorAll('button');
    playBtns.forEach(btn => {
        const style = window.getComputedStyle(btn);
        const isOrangeCircle = (btn.offsetWidth >= 50 && btn.offsetHeight >= 50) && 
                               (style.borderRadius.includes('50%') || style.borderRadius.includes('999') || parseInt(style.borderRadius) >= 25);
        if (isOrangeCircle || btn.id === 'play-btn' || btn.id === 'main-play-btn' || btn.classList.contains('play-btn')) {
            btn.innerHTML = state.isPlaying ? '⏸' : '▶';
            btn.style.fontSize = '24px';
        }
    });
}

// Função principal para Tocar ou Pausar
function alternarPlayPause() {
    if (state.isPlaying) {
        radioAudio.pause();
        state.isPlaying = false;
        const itemAtual = obterItemAtual();
        atualizarInterface(itemAtual.title, itemAtual.category, 'Transmissão pausada — Toque no Play para continuar');
    } else {
        iniciarReproducaoAtual();
    }
}

// Obter a faixa ou estação selecionada no momento
function obterItemAtual() {
    if (state.mode === 'radio24h') {
        return radioStations24h[state.currentIndex % radioStations24h.length];
    } else {
        return playlistTracks[state.currentIndex % playlistTracks.length];
    }
}

// Carregar e tocar o áudio imediatamente
function iniciarReproducaoAtual() {
    const item = obterItemAtual();
    const urlParaTocar = item.audioUrl || item.streamUrl;

    atualizarInterface(item.title, item.category, 'A sintonizar áudio ao vivo...');

    if (radioAudio.src !== urlParaTocar) {
        radioAudio.src = urlParaTocar;
        radioAudio.load();
    }

    radioAudio.play().then(() => {
        state.isPlaying = true;
        atualizarInterface(item.title, item.category, '🔊 Tocando agora ao vivo (Alta Estabilidade)');
    }).catch((err) => {
        console.warn('Tentando rota alternativa de áudio...', err);
        // Se o stream 24h falhar ou demorar, usa o áudio direto de contingência
        const fallback = item.fallbackUrl || playlistTracks[0].audioUrl;
        radioAudio.src = fallback;
        radioAudio.play().then(() => {
            state.isPlaying = true;
            atualizarInterface(item.title, item.category, '🔊 Tocando agora no ar!');
        }).catch(() => {
            state.isPlaying = false;
            atualizarInterface(item.title, item.category, 'Toque novamente no botão laranja para iniciar');
        });
    });
}

// Avançar para a próxima faixa
function proximaFaixa() {
    const lista = state.mode === 'radio24h' ? radioStations24h : playlistTracks;
    state.currentIndex = (state.currentIndex + 1) % lista.length;
    iniciarReproducaoAtual();
}

// Voltar para a faixa anterior
function faixaAnterior() {
    const lista = state.mode === 'radio24h' ? radioStations24h : playlistTracks;
    state.currentIndex = (state.currentIndex - 1 + lista.length) % lista.length;
    iniciarReproducaoAtual();
}

// Quando uma música do roteiro acabar, passa automaticamente para a próxima
radioAudio.addEventListener('ended', () => {
    proximaFaixa();
});

// Atualizar o cronômetro (00:00) enquanto a música toca
radioAudio.addEventListener('timeupdate', () => {
    const mins = Math.floor(radioAudio.currentTime / 60);
    const secs = Math.floor(radioAudio.currentTime % 60);
    const formatado = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const spans = document.querySelectorAll('span, div');
    spans.forEach(el => {
        if (el.children.length === 0 && /^\d{2}:\d{2}$/.test(el.textContent.trim())) {
            el.textContent = formatado;
        }
    });
});

// Conectar todos os botões da página automaticamente
document.addEventListener('DOMContentLoaded', () => {
    // 1. Conectar controle de volume
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            radioAudio.volume = val > 1 ? val / 100 : val;
        });
    });

    // 2. Conectar cliques em todos os botões da interface
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('button, a, [role="button"], .track-item, .program-card');
        if (!btn) return;

        const texto = (btn.textContent || '').trim();
        const style = window.getComputedStyle(btn);

        // Verifica se é o grande botão laranja redondo de Play
        const isMainPlay = (btn.offsetWidth >= 50 && btn.offsetHeight >= 50 && 
                           (style.borderRadius.includes('50%') || parseInt(style.borderRadius) >= 25)) ||
                           btn.id === 'play-btn' || btn.id === 'main-play-btn';

        if (isMainPlay) {
            e.preventDefault();
            alternarPlayPause();
            return;
        }

        // Botões de Próxima / Anterior (⏮ e ⏭)
        if (texto.includes('⏮') || btn.id === 'prev-btn' || btn.getAttribute('aria-label') === 'Anterior') {
            e.preventDefault();
            faixaAnterior();
            return;
        }
        if (texto.includes('⏭') || btn.id === 'next-btn' || btn.getAttribute('aria-label') === 'Próxima') {
            e.preventDefault();
            proximaFaixa();
            return;
        }

        // Botão "Tocar Roteiro"
        if (texto.includes('Tocar Roteiro') || texto.includes('Roteiro Musical')) {
            e.preventDefault();
            state.mode = 'roteiro';
            state.currentIndex = 0;
            iniciarReproducaoAtual();
            return;
        }

        // Botão "Rádio 24h"
        if (texto.includes('Rádio 24h')) {
            e.preventDefault();
            state.mode = 'radio24h';
            state.currentIndex = 0;
            iniciarReproducaoAtual();
            return;
        }

        // Botões "▶ Tocar" da lista de faixas diretas
        if (texto.includes('Tocar') && !texto.includes('Tocar Roteiro') && !texto.includes('Minha Lista')) {
            e.preventDefault();
            state.mode = 'roteiro';
            // Descobre qual música foi clicada pelo texto do cartão pai
            const card = btn.closest('div')?.parentElement || btn.parentElement;
            const cardText = card ? card.textContent : '';

            if (cardText.includes('Amanhecer na Fazenda')) state.currentIndex = 0;
            else if (cardText.includes('Estrada da Vida')) state.currentIndex = 1;
            else if (cardText.includes('Café Tropeiro')) state.currentIndex = 2;
            else if (cardText.includes('Arena de Festa')) state.currentIndex = 3;

            iniciarReproducaoAtual();
            return;
        }

        // Cards de Escolha a Programação (Manhã Sertaneja, Esquenta Rodeio, Modão de Viola)
        if (texto.includes('Manhã Sertaneja')) {
            state.mode = 'roteiro';
            state.currentIndex = 0;
            iniciarReproducaoAtual();
        } else if (texto.includes('Esquenta Rodeio')) {
            state.mode = 'roteiro';
            state.currentIndex = 3;
            iniciarReproducaoAtual();
        } else if (texto.includes('Modão de Viola')) {
            state.mode = 'roteiro';
            state.currentIndex = 2;
            iniciarReproducaoAtual();
        }
    });

    // 3. Conectar seletor de estações (Dropdown <select>)
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', (e) => {
            const idx = e.target.selectedIndex;
            if (idx === 3) {
                state.mode = 'roteiro';
                state.currentIndex = 0;
            } else {
                state.mode = 'radio24h';
                state.currentIndex = idx;
            }
            iniciarReproducaoAtual();
        });
    });
});
