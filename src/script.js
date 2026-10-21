// 利用可能な Invidious パブリックインスタンスのリスト（予備を複数保持）
const INSTANCES = [
    'https://invidious.nerdvpn.de',
    'https://invidious.tiekoetter.com',
    'https://yt.chocolatemoo53.com',
    'https://invidious.f5.si'
];

let player;

// YouTube IFrame Player API の準備完了
function onYouTubeIframeAPIReady() {
    // 準備完了
}

// 動画を再生する関数
function playVideo(videoId) {
    if (!player) {
        player = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            events: {
                'onReady': (event) => event.target.playVideo()
            }
        });
    } else {
        player.loadVideoById(videoId);
    }
}

// 稼働しているサーバーを順番に試しながら検索を実行する関数
async function searchVideos(query) {
    if (!query) return;

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p class="placeholder-text">検索中...</p>';

    let success = false;

    for (const baseUrl of INSTANCES) {
        const endpoint = `${baseUrl}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;

        try {
            // 5秒でタイムアウトするように設定
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(endpoint, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    displayResults(data);
                    success = true;
                    break; // 成功したらループを抜ける
                }
            }
        } catch (error) {
            console.warn(`サーバー ${baseUrl} での検索に失敗しました。次のサーバーを試します...`);
        }
    }

    if (!success) {
        resultsContainer.innerHTML = '';
        alert('現在利用できるサーバーがありません。時間をおいて再試行するか、Piped APIへの切り替えをご検討ください。');
    }
}

// 検索結果を表示する関数
function displayResults(items) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    items.forEach(item => {
        const videoId = item.videoId;
        const title = item.title;
        const channelTitle = item.author;
        
        // サムネイル画像の取得（中画質があればそれを優先）
        let thumbnail = '';
        if (item.videoThumbnails && item.videoThumbnails.length > 0) {
            const mediumThumb = item.videoThumbnails.find(t => t.quality === 'medium');
            thumbnail = mediumThumb ? mediumThumb.url : item.videoThumbnails[0].url;
        }

        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <img src="${thumbnail}" alt="${title}">
            <div class="video-info">
                <h4>${title}</h4>
                <p>${channelTitle}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            playVideo(videoId);
        });

        resultsContainer.appendChild(card);
    });
}

// イベント設定
document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-input').value;
    searchVideos(query);
});

document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = document.getElementById('search-input').value;
        searchVideos(query);
    }
});
