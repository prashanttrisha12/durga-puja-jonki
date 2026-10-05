/**
 * Durga Puja Jonki - Photo & Video Gallery Manager
 * Features:
 * - Separate Photo and Video Galleries
 * - Category & Date-wise filtering (auto-hides empty categories)
 * - Full HD Lightbox viewer with Zoom (In/Out/Reset)
 * - HTML5 Video Player modal (No autoplay with sound)
 * - Share (Web Share API + Clipboard fallback)
 * - Direct HD Media Download
 */

class GalleryManager {
  constructor() {
    this.photos = [];
    this.videos = [];
    this.currentPhotosList = [];
    this.currentPhotoIndex = 0;
    this.zoomLevel = 1;
    this.activeCategory = "all";

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    if (!window.durgaDB) return;
    try {
      await window.durgaDB._ensureReady();
    } catch (e) {}

    this.photos = await window.durgaDB.getPublishedPhotos();
    this.videos = await window.durgaDB.getPublishedVideos();

    // Check if on Photos page
    const photosContainer = document.getElementById("gallery-photos-grid");
    if (photosContainer) {
      this.renderPhotos();
    }

    // Check if on Videos page
    const videosContainer = document.getElementById("gallery-videos-grid");
    if (videosContainer) {
      this.renderVideos();
    }

    this.setupLightboxEvents();
    this.setupSidebarEvents();
    this.checkUrlParams();

    // Reactive update on DB changes
    window.addEventListener("dpj-data-changed", async () => {
      this.photos = await window.durgaDB.getPublishedPhotos();
      this.videos = await window.durgaDB.getPublishedVideos();
      this.updateSidebarBadges();
      if (photosContainer) {
        this.renderPhotos();
      }
      if (videosContainer) {
        this.renderVideos();
      }
    });
  }

  /* ==========================================================================
     DEVOTIONAL SIDEBAR & RETURN CONTROLLER
     ========================================================================== */
  setupSidebarEvents() {
    const toggleBtn = document.getElementById("mobile-sidebar-toggle");
    const sidebar = document.getElementById("gallery-sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const closeBtn = document.getElementById("sidebar-close-btn");

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.add("mobile-open");
        if (overlay) overlay.classList.add("active");
      });
    }

    const closeSidebar = () => {
      if (sidebar) sidebar.classList.remove("mobile-open");
      if (overlay) overlay.classList.remove("active");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
    if (overlay) overlay.addEventListener("click", closeSidebar);

    this.updateSidebarBadges();
  }

  updateSidebarBadges() {
    const photoBadge = document.getElementById("sidebar-photos-badge");
    const videoBadge = document.getElementById("sidebar-videos-badge");
    if (photoBadge && this.photos) {
      photoBadge.textContent = `${this.photos.length} फोटो`;
    }
    if (videoBadge && this.videos) {
      videoBadge.textContent = `${this.videos.length} वीडियो`;
    }
  }

  /* ==========================================================================
     PHOTO GALLERY FILTERING & RENDERING (Requirement 6)
     ========================================================================== */
  initPhotoFilters() {
    // Single unified folder structure - no sub-folders or category filter pills needed
  }

  renderPhotos() {
    const container = document.getElementById("gallery-photos-grid");
    if (!container) return;

    const photos = this.photos || [];
    this.currentPhotosList = photos;

    if (photos.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--color-cream-muted);">
          <p style="font-size: 1.2rem;">अभी कोई तस्वीर उपलब्ध नहीं है।</p>
        </div>
      `;
      return;
    }

    container.innerHTML = photos.map((photo, index) => {
      const displayTitle = photo.title || "माँ दुर्गा दर्शन";
      const displayDate = formatDevanagariDate(photo.date);
      const safeTitleAttr = displayTitle.replace(/"/g, '&quot;');
      const safeTitleJs = displayTitle.replace(/'/g, "\\'");
      return `
      <div class="gallery-item" data-id="${photo.id}">
        <div class="gallery-thumb-wrap" onclick="galleryManager.openPhotoLightboxByIndex(${index})">
          <img src="${photo.thumbnail_url || photo.media_url}" alt="${safeTitleAttr}" class="gallery-thumb" loading="lazy" />
          <div class="gallery-zoom-badge">🔍</div>
        </div>
        <div class="gallery-caption">
          <div class="gallery-date">📅 ${displayDate}</div>
          <h3 class="gallery-title">${displayTitle}</h3>
          ${photo.description ? `<p class="gallery-desc">${photo.description}</p>` : ''}
          <div class="gallery-meta-row">
            <button class="btn btn-primary btn-sm" onclick="galleryManager.openPhotoLightboxByIndex(${index})">
              🔍 HD दर्शन
            </button>
            <div class="gallery-actions">
              <button class="btn-icon" title="Share" onclick="galleryManager.shareMedia('${safeTitleJs}', '${photo.media_url}')">
                📤
              </button>
              <button class="btn-icon" title="Download HD" onclick="downloadMedia('${photo.media_url}', '${safeTitleJs}.jpg')">
                📥
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    }).join("");
  }

  /* ==========================================================================
     VIDEO GALLERY RENDERING (Requirement 7)
     ========================================================================== */
  renderVideos() {
    const container = document.getElementById("gallery-videos-grid");
    if (!container) return;

    if (this.videos.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--color-cream-muted);">
          <p style="font-size: 1.2rem;">वीडियो जल्द अपलोड किए जाएंगे।</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.videos.map(video => {
      const displayTitle = video.title || "माँ दुर्गा वीडियो दर्शन";
      const displayDate = formatDevanagariDate(video.date);
      const safeTitleAttr = displayTitle.replace(/"/g, '&quot;');
      const safeTitleJs = displayTitle.replace(/'/g, "\\'");
      return `
      <div class="gallery-item" data-id="${video.id}">
        <div class="gallery-thumb-wrap" onclick="galleryManager.openVideoPlayer('${video.id}')">
          <img src="${video.thumbnail_url || 'assets/images/temple-main.png'}" alt="${safeTitleAttr}" class="gallery-thumb" loading="lazy" />
          <div class="play-btn-overlay">
            <div class="play-icon-circle">▶</div>
          </div>
        </div>
        <div class="gallery-caption">
          <div class="gallery-date">📅 ${displayDate}</div>
          <h3 class="gallery-title">${displayTitle}</h3>
          ${video.description ? `<p class="gallery-desc">${video.description}</p>` : ''}
          <div class="gallery-meta-row">
            <button class="btn btn-primary btn-sm" onclick="galleryManager.openVideoPlayer('${video.id}')">
              ▶ वीडियो देखें
            </button>
            <div class="gallery-actions">
              <button class="btn-icon" title="Share" onclick="galleryManager.shareMedia('${safeTitleJs}', '${video.media_url}')">
                📤
              </button>
              <button class="btn-icon" title="Download Video" onclick="downloadMedia('${video.media_url}', '${safeTitleJs}.mp4')">
                📥
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    }).join("");
  }

  /* ==========================================================================
     FULLSCREEN LIGHTBOX MODAL WITH ZOOM & SHARE (Requirement 6)
     ========================================================================== */
  setupLightboxEvents() {
    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      const photoModal = document.getElementById("photo-lightbox-modal");
      if (photoModal && photoModal.classList.contains("active")) {
        if (e.key === "Escape") this.closePhotoLightbox();
        if (e.key === "ArrowLeft") this.prevPhoto();
        if (e.key === "ArrowRight") this.nextPhoto();
        if (e.key === "+" || e.key === "=") this.zoomIn();
        if (e.key === "-") this.zoomOut();
      }

      const videoModal = document.getElementById("video-player-modal");
      if (videoModal && videoModal.classList.contains("active")) {
        if (e.key === "Escape") this.closeVideoPlayer();
      }
    });
  }

  openPhotoLightbox(photoId) {
    let index = this.currentPhotosList.findIndex(p => p.id === photoId);
    if (index === -1) {
      this.currentPhotosList = this.photos;
      index = this.photos.findIndex(p => p.id === photoId);
    }
    this.openPhotoLightboxByIndex(index !== -1 ? index : 0);
  }

  openPhotoLightboxByIndex(index) {
    if (!this.currentPhotosList || this.currentPhotosList.length === 0) {
      this.currentPhotosList = this.photos;
    }
    this.currentPhotoIndex = index;
    const photo = this.currentPhotosList[index];
    if (!photo) return;

    const modal = document.getElementById("photo-lightbox-modal");
    const img = document.getElementById("lightbox-target-img");
    const titleEl = document.getElementById("lightbox-photo-title");
    const dateEl = document.getElementById("lightbox-photo-date");
    const downloadBtn = document.getElementById("lightbox-download-btn");
    const shareBtn = document.getElementById("lightbox-share-btn");

    if (img) img.src = photo.media_url;
    if (titleEl) titleEl.textContent = photo.title || "माँ दुर्गा दर्शन";
    if (dateEl) dateEl.textContent = `📅 ${formatDevanagariDate(photo.date)}`;
    if (downloadBtn) {
      downloadBtn.onclick = () => downloadMedia(photo.media_url, `${photo.title || "durga-puja-jonki"}.jpg`);
    }
    if (shareBtn) {
      shareBtn.onclick = () => this.shareMedia(photo.title || "माँ दुर्गा दर्शन", photo.media_url);
    }

    this.zoomLevel = 1;
    this.applyZoom();

    if (modal) modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closePhotoLightbox() {
    const modal = document.getElementById("photo-lightbox-modal");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";
    this.zoomLevel = 1;
  }

  nextPhoto() {
    if (this.currentPhotosList.length === 0) return;
    this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.currentPhotosList.length;
    this.openPhotoLightboxByIndex(this.currentPhotoIndex);
  }

  prevPhoto() {
    if (this.currentPhotosList.length === 0) return;
    this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.currentPhotosList.length) % this.currentPhotosList.length;
    this.openPhotoLightboxByIndex(this.currentPhotoIndex);
  }

  zoomIn() {
    this.zoomLevel = Math.min(3.0, this.zoomLevel + 0.25);
    this.applyZoom();
  }

  zoomOut() {
    this.zoomLevel = Math.max(0.75, this.zoomLevel - 0.25);
    this.applyZoom();
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.applyZoom();
  }

  applyZoom() {
    const wrap = document.getElementById("lightbox-img-wrap");
    if (wrap) {
      wrap.style.transform = `scale(${this.zoomLevel})`;
    }
  }

  /* ==========================================================================
     HTML5 VIDEO PLAYER MODAL (Requirement 7)
     ========================================================================== */
  async openVideoPlayer(videoId) {
    const video = await window.durgaDB.getVideoById(videoId) || this.videos.find(v => v.id === videoId);
    if (!video) return;

    const modal = document.getElementById("video-player-modal");
    const videoPlayer = document.getElementById("html5-video-player");
    const titleEl = document.getElementById("video-modal-title");
    const downloadBtn = document.getElementById("video-modal-download-btn");
    const shareBtn = document.getElementById("video-modal-share-btn");

    if (videoPlayer) {
      videoPlayer.src = video.media_url;
      videoPlayer.load();
      videoPlayer.play().catch(e => console.log("Autoplay blocked, user interaction required:", e));
    }
    if (titleEl) titleEl.textContent = video.title;
    if (downloadBtn) {
      downloadBtn.onclick = () => downloadMedia(video.media_url, `${video.title}.mp4`);
    }
    if (shareBtn) {
      shareBtn.onclick = () => this.shareMedia(video.title, video.media_url);
    }

    if (modal) modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeVideoPlayer() {
    const modal = document.getElementById("video-player-modal");
    const videoPlayer = document.getElementById("html5-video-player");
    if (videoPlayer) {
      videoPlayer.pause();
      videoPlayer.currentTime = 0;
      videoPlayer.src = "";
    }
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  /* ==========================================================================
     SHARE SYSTEM (Web Share API + Clipboard Fallback)
     ========================================================================== */
  async shareMedia(title, url) {
    const fullUrl = window.location.origin + window.location.pathname + "?media=" + encodeURIComponent(url);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `दुर्गा पूजा जोंकी - ${title}`,
          text: `माँ दुर्गा मंदिर जोंकी दर्शन: ${title}`,
          url: fullUrl
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          this.copyToClipboard(fullUrl);
        }
      }
    } else {
      this.copyToClipboard(fullUrl);
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert("लिंक कॉपी कर लिया गया है! जय माँ दुर्गा!");
    }).catch(() => {
      prompt("इस लिंक को कॉपी करें:", text);
    });
  }

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const photoId = urlParams.get("id");
    if (photoId) {
      this.openPhotoLightbox(photoId);
    }
  }
}

// Global Singleton
window.galleryManager = new GalleryManager();
