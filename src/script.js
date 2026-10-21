let player;

function onYouTubeIframeAPIReady() {
    // プレイヤーの準備完了
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

// Piped API を使って検索を実行する関数（CORS・ブロック対策済み）
async function searchVideos(query) {
    if (!query) return;

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p class="placeholder-text" style="padding: 1rem;">検索中...</p>';

    // ★ Cloudflare Tunnelで発行されたURLに変更
    const tunnelUrl = 'https://buy-actual-useful-anyway.trycloudflare.com';
    const endpoint = `${tunnelUrl}/api/search?q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            displayResults(data.items);
        } else {
            resultsContainer.innerHTML = '<p class="placeholder-text" style="padding: 1rem;">動画が見つかりませんでした。</p>';
        }
    } catch (error) {
        console.error('通信エラー:', error);
        alert('サーバーとの通信に失敗しました。');
    }
}


// 検索結果を画面に描画する関数
function displayResults(items) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    items.forEach(item => {
        // PipedのURL形式 (例: /watch?v=xxxx) から動画IDを抽出
        let videoId = '';
        if (item.url) {
            videoId = item.url.replace('/watch?v=', '');
        }
        const title = item.title;
        const channelTitle = item.uploaderName || '不明なチャンネル';
        const thumbnail = item.thumbnail;

        if (!videoId) return;

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
