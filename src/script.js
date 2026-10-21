// Invidiousのパブリックインスタンス（サーバー）を利用
const API_BASE = 'https://invidious.nerdvpn.de/api/v1';

let player;

// プレイヤーの初期化（YouTube IFrame Player APIを使用）
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

// 検索を実行する関数（APIキー不要）
async function searchVideos(query) {
    if (!query) return;

    const endpoint = `${API_BASE}/search?q=${encodeURIComponent(query)}&type=video`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (Array.isArray(data)) {
            displayResults(data);
        } else {
            alert('検索結果の取得に失敗しました。');
        }
    } catch (error) {
        console.error('通信エラー:', error);
        alert('APIとの通信に失敗しました。時間をおいて再試行してください。');
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
        // サムネイル画像
        const thumbnail = item.videoThumbnails ? item.videoThumbnails.find(t => t.quality === 'medium')?.url || item.videoThumbnails[0]?.url : '';

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
