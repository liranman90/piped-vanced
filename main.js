document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const searchForm = document.getElementById("searchForm");
  const videosContainer = document.getElementById("videosContainer");
  const resultsStatus = document.getElementById("resultsStatus");
  // Player elements:
  const playerModal = document.getElementById("playerModal");
  const playerFrame = document.getElementById("playerFrame");
  const playerTitle = document.getElementById("playerTitle");
  const playerChannel = document.getElementById("playerChannel");
  const closePlayer = document.getElementById("closePlayer");

  function formatViews(n) {
    n = parseInt(n);
    if (n >= 1e9) return (n/1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n/1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n/1e3).toFixed(1) + "K";
    return n;
  }

  function renderVideos(videos) {
    videosContainer.innerHTML = '';
    if (!videos || videos.length === 0) {
      resultsStatus.textContent = "לא נמצאו תוצאות.";
      return;
    }
    resultsStatus.textContent = '';
    videos.forEach(video => {
      if (!video.videoId) return;
      const videoDiv = document.createElement('div');
      videoDiv.className = 'video';
      videoDiv.innerHTML = `
        <div class="thumbnail">
          <img src="${video.videoThumbnails?.[video.videoThumbnails.length - 1]?.url || ''}" alt="${video.title.replace(/"/g, '')}" />
        </div>
        <div class="video-details">
          <div class="creator-img">
            <img src="${video.authorThumbnails?.[0]?.url || 'https://www.youtube.com/s/desktop/1bfa1e55/img/favicon_144x144.png'}" />
          </div>
          <div class="title">
            <a href="#" class="video-title">${video.title}</a>
            <a href="https://yewtu.be/channel/${video.authorId}" class="video-creator" target="_blank">${video.author}</a>
            <div class="video-views">${formatViews(video.viewCount)} צפיות • ${video.publishedText || ""}</div>
          </div>
        </div>
      `;
      // בלחיצה על התמונה או הכותרת - פותח נגן מוטמע
      videoDiv.querySelector('.thumbnail').onclick = videoDiv.querySelector('.video-title').onclick = function(e) {
        e.preventDefault();
        playerTitle.textContent = video.title;
        playerChannel.textContent = video.author;
        playerFrame.src = `https://yewtu.be/embed?v=${video.videoId}`;
        playerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      };
      videosContainer.appendChild(videoDiv);
    });
  }

  function searchYouTube(term) {
    videosContainer.innerHTML = '';
    resultsStatus.textContent = "טוען תוצאות...";
    fetch(`https://yewtu.be/api/v1/search?q=${encodeURIComponent(term)}&type=video`)
      .then(response => response.json())
      .then(results => {
        renderVideos(results);
      }).catch(() => {
        resultsStatus.textContent = "שגיאה בטעינה.";
      });
  }

  searchForm.onsubmit = function(e) {
    e.preventDefault();
    const term = searchInput.value.trim();
    if (term.length > 0) searchYouTube(term);
  };
  searchInput.addEventListener("keyup", function(e) {
    if (e.key === "Enter") {
      const term = searchInput.value.trim();
      if (term.length > 0) searchYouTube(term);
    }
  });

  // Player close
  closePlayer.onclick = function () {
    playerModal.classList.remove('active');
    playerFrame.src = '';
    document.body.style.overflow = '';
  };
  // Escape סגירה מהירה
  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape" && playerModal.classList.contains('active')) closePlayer.onclick();
  });

  // חיפוש ברירת מחדל
  searchYouTube('music');
});
