/* Lógica Principal da Rádio & TV Web Sertaneja */

// Estado Inicial e Canais Padrão
const defaultStations = [
    {
        id: 'sertanejo-1',
        title: 'Clássicos Sertanejos & Modão 24h',
        category: 'Modão de Viola',
        videoId: 'jfKfPfyJRdk', // Substitua pelo ID da sua live ou vídeo do YouTube
        listeners: '1.4k ouvindo'
    },
    {
        id: 'rodeio-1',
        title: 'Esquenta Rodeio - As Melhores da Arena',
        category: 'Esquenta Rodeio',
        videoId: '5qap5aO4i9A',
        listeners: '980 ouvindo'
    },
    {
        id: 'lancamentos-1',
        title: 'Top Sertanejo Universitário Ao Vivo',
        category: 'Lançamentos',
        videoId: 'DWcJFNfaw9c',
        listeners: '2.1k ouvindo'
    }
];

let appData = {
    stations: JSON.parse(localStorage.getItem('radio_stations')) || defaultStations,
    currentStationIndex: 0,
    isPlaying: false,
    creatorMode: false
};

// Salvar dados localmente no navegador
function saveAppData() {
    localStorage.setItem('radio_stations', JSON.stringify(appData.stations));
}

// Extrair o ID do vídeo de qualquer link do YouTube (Normal, Shorts ou Partilha)
function extractYouTubeId(urlOrId) {
    if (!urlOrId) return '';
    const text = urlOrId.trim();
    if (text.length === 11 && !text.includes('/') && !text.includes('.')) {
        return text;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = text.match(regExp);
    return (match && match[2].length === 11) ? match[2] : text;
}

// Carregar Canal no Player de Vídeo/Áudio sem piscar a tela
function loadStation(index, autoPlay = true) {
    if (index < 0 || index >= appData.stations.length) return;
    appData.currentStationIndex = index;
    const station = appData.stations[index];

    const iframe = document.getElementById('yt-player');
    const titleEl = document.getElementById('current-title');
    const categoryEl = document.getElementById('current-category');

    if (iframe) {
        const autoplayParam = autoPlay ? 1 : 0;
        iframe.src = `https://www.youtube.com/embed/${station.videoId}?autoplay=${autoplayParam}&controls=1&rel=0&modestbranding=1&playsinline=1`;
    }

    if (titleEl) titleEl.textContent = station.title;
    if (categoryEl) categoryEl.textContent = station.category;

    appData.isPlaying = autoPlay;
    updateEqualizerUI();
}

// Atualizar animação das barras de som
function updateEqualizerUI() {
    const bars = document.querySelectorAll('.eq-bar');
    bars.forEach(bar => {
        if (appData.isPlaying) {
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    });
}

// Alternar Modo Criador (Painel de Administração protegido por senha)
function toggleCreatorMode() {
    if (!appData.creatorMode) {
        const pass = prompt('Digite a senha do Modo Criador:');
        if (pass === '1234' || pass === 'admin') {
            appData.creatorMode = true;
            document.body.classList.add('creator-mode');
            alert('Modo Criador ativado! Agora pode gerir canais, shows e anúncios.');
        } else if (pass !== null) {
            alert('Senha incorreta.');
        }
    } else {
        appData.creatorMode = false;
        document.body.classList.remove('creator-mode');
    }
}

// Adicionar novo canal ou música pelo Modo Criador
function addNewStation(title, category, youtubeUrl) {
    const videoId = extractYouTubeId(youtubeUrl);
    if (!title || !videoId) {
        alert('Preencha o título e um link válido do YouTube.');
        return;
    }

    appData.stations.push({
        id: 'canal-' + Date.now(),
        title: title,
        category: category || 'Ao Vivo',
        videoId: videoId,
        listeners: 'Novo'
    });

    saveAppData();
    loadStation(appData.stations.length - 1, true);
}

// Partilhar a Rádio no WhatsApp ou Redes Sociais
function shareRadio() {
    const shareData = {
        title: document.title || 'Rádio & TV Web Sertaneja',
        text: 'Ouça a melhor programação sertaneja ao vivo e veja a agenda de shows e ofertas!',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link da rádio copiado! Agora é só colar no WhatsApp ou Facebook.');
    }
}

// Inicializar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const creatorBtn = document.getElementById('creator-toggle-btn');
    if (creatorBtn) {
        creatorBtn.addEventListener('click', toggleCreatorMode);
    }

    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareRadio);
    }
});
