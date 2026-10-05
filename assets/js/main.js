/**
 * Durga Puja Jonki - Main Script
 * Handles Navigation, 3D Hero Parallax, Floating Particles,
 * Real Countdown Timer, and Homepage Dynamic Sections.
 */

document.addEventListener("DOMContentLoaded", async () => {
  initNavigation();
  initHeroParallax();
  initParticles();
  initCountdown();
  initHomepageContent();

  // Listen for admin changes to update UI in real-time
  window.addEventListener("dpj-data-changed", () => {
    initHomepageContent();
    initCountdown();
  });
});

/* ==========================================================================
   1. NAVIGATION & MOBILE HAMBURGER
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Sticky header scroll elevation (passive for 60fps smoothness)
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, { passive: true });

  // Mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      navMenu.classList.toggle("open");
    });

    // Close on link click
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("open");
      });
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains("open")) {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("open");
      }
    });
  }

  // Active link detection
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/* ==========================================================================
   2. 3D HERO PARALLAX & DEPTH EFFECT
   ========================================================================== */
function initHeroParallax() {
  const heroSection = document.querySelector(".hero-section");
  const heroBg = document.querySelector(".hero-bg-image");
  const heroContent = document.querySelector(".hero-content");

  if (!heroSection || !heroBg) return;

  // Mousemove 3D depth effect on desktop
  heroSection.addEventListener("mousemove", (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Smooth subtle movement
    heroBg.style.transform = `scale(1.08) translate(${x * -20}px, ${y * -20}px)`;
    if (heroContent) {
      heroContent.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${y * -4}deg) translateZ(10px)`;
    }
  });

  heroSection.addEventListener("mouseleave", () => {
    heroBg.style.transform = "scale(1.05) translate(0px, 0px)";
    if (heroContent) {
      heroContent.style.transform = "none";
    }
  });

  // Mobile gyroscope subtle tilt if supported
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', (e) => {
      const gamma = Math.min(Math.max(e.gamma || 0, -25), 25);
      const beta = Math.min(Math.max(e.beta || 0, -25), 25);
      heroBg.style.transform = `scale(1.08) translate(${gamma * 0.4}px, ${beta * 0.4}px)`;
    });
  }
}

/* ==========================================================================
   3. FLOATING LIGHT PARTICLES (DEVOTIONAL GOLDEN DUST)
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let particles = [];
  let animationFrameId = null;
  const isMobile = window.innerWidth < 768;

  function resizeCanvas() {
    if (canvas.parentElement) {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas, { passive: true });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * (canvas.width || window.innerWidth);
      this.y = Math.random() * (canvas.height || 600);
      this.size = Math.random() * 2.2 + 0.6;
      this.speedY = -(Math.random() * 0.4 + 0.12);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.65 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.pulse = Math.random() * Math.PI;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.pulse += this.pulseSpeed;

      // Wrap around screen smoothly
      if (this.y < -10) this.y = (canvas.height || 600) + 10;
      if (this.x < -10) this.x = (canvas.width || window.innerWidth) + 10;
      if (this.x > (canvas.width || window.innerWidth) + 10) this.x = -10;
    }

    draw() {
      const currentAlpha = Math.max(0.1, this.alpha * (Math.sin(this.pulse) * 0.35 + 0.65));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 215, 127, ${currentAlpha})`;
      if (!isMobile) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(212, 175, 55, 0.6)";
      }
      ctx.fill();
    }
  }

  // Efficient particle count (18 on mobile, up to 35 on desktop)
  const particleCount = isMobile ? 18 : Math.min(35, Math.floor(window.innerWidth / 35));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    animationFrameId = requestAnimationFrame(renderFrame);
  }

  function startAnimation() {
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(renderFrame);
    }
  }

  function stopAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // Pause canvas animation when scrolled off-screen for stutter-free 60fps
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(canvas.parentElement || canvas);
  } else {
    startAnimation();
  }

  // Pause when browser tab is inactive to preserve phone battery and speed
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });
}

/* ==========================================================================
   4. REAL JAVASCRIPT COUNTDOWN TIMER (Requirement 4)
   ========================================================================== */
let countdownInterval = null;

async function initCountdown() {
  const container = document.getElementById("countdown-container");
  if (!container) return;

  // Read target date from DB settings if set, else from SITE_CONFIG
  let targetDateString = window.SITE_CONFIG ? window.SITE_CONFIG.pujaStartDate : "2026-10-11T00:00:00+05:30";
  if (window.durgaDB) {
    const savedDate = await window.durgaDB.getSetting("pujaStartDate");
    if (savedDate) targetDateString = savedDate;
  }

  const targetTime = new Date(targetDateString).getTime();

  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");
  const messageEl = document.getElementById("countdown-msg");

  if (countdownInterval) clearInterval(countdownInterval);

  function update() {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance <= 0) {
      if (countdownInterval) clearInterval(countdownInterval);
      container.innerHTML = `
        <div class="countdown-finished">
          🌺 दुर्गा पूजा आरंभ हो गई है 🌺
        </div>
      `;
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Format with leading zeroes
    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

/* ==========================================================================
   5. HOMEPAGE CONTENT LOADER (LATEST 6 PHOTOS & 3 VIDEOS, SCHEDULE, MAP)
   ========================================================================== */
async function initHomepageContent() {
  if (!window.durgaDB) return;

  // Apply Custom Site Cover & Logo if set by admin
  try {
    const customCover = await window.durgaDB.getSetting("siteCustomCover");
    if (customCover) {
      const heroBg = document.querySelector(".hero-bg-image");
      if (heroBg) heroBg.src = customCover;
    }

    const customLogo = await window.durgaDB.getSetting("siteCustomLogo");
    if (customLogo) {
      document.querySelectorAll(".brand-icon, .brand-logo, .sidebar-temple-thumb").forEach(icon => {
        icon.src = customLogo;
      });
      const heroEmblem = document.querySelector(".hero-emblem");
      if (heroEmblem) heroEmblem.src = customLogo;
    }

    // Dynamic Instagram updates if customized in Admin
    const instaUrl = await window.durgaDB.getSetting("instagramUrl");
    const instaHandle = await window.durgaDB.getSetting("instagramHandle");
    if (instaUrl) {
      document.querySelectorAll("a[href*='instagram.com']").forEach(a => {
        a.href = instaUrl;
        if (instaHandle && a.classList.contains("instagram-follow-btn")) {
          a.innerHTML = `<span>📸</span><span>Instagram पर फॉलो करें: <strong>@${instaHandle}</strong></span>`;
        }
      });
    }
  } catch (e) {}

  // 1. Quick Access Cards Thumbnails
  const photos = await window.durgaDB.getPublishedPhotos();
  const videos = await window.durgaDB.getPublishedVideos();
  const schedule = await window.durgaDB.getSchedule();

  const quickPhotoThumb = document.getElementById("quick-photo-thumb");
  if (quickPhotoThumb && photos.length > 0) {
    quickPhotoThumb.src = photos[0].thumbnail_url || photos[0].media_url;
  }

  const quickVideoThumb = document.getElementById("quick-video-thumb");
  if (quickVideoThumb) {
    if (videos.length > 0) {
      quickVideoThumb.src = videos[0].thumbnail_url || "assets/images/temple-main.png";
    } else if (photos.length > 0) {
      quickVideoThumb.src = photos[0].thumbnail_url;
    }
  }

  // 2. Latest 6 Photos (Requirement 15)
  const latestPhotosGrid = document.getElementById("latest-photos-grid");
  if (latestPhotosGrid) {
    const latest6 = photos.slice(0, 6);
    if (latest6.length === 0) {
      latestPhotosGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--color-cream-muted);">
          तस्वीरें जल्द अपलोड की जाएंगी।
        </div>
      `;
    } else {
      latestPhotosGrid.innerHTML = latest6.map(photo => `
        <div class="media-card" data-id="${photo.id}">
          <div class="media-thumb-container" onclick="openLightboxFromHome('${photo.id}')">
            <img src="${photo.thumbnail_url || photo.media_url}" alt="${photo.title}" class="media-thumb" loading="lazy" />
            <span class="media-badge">${photo.category || "फोटो"}</span>
          </div>
          <div class="media-info">
            <div class="media-date">📅 ${formatDevanagariDate(photo.date)}</div>
            <h3 class="media-title">${photo.title}</h3>
            ${photo.description ? `<p class="media-description">${photo.description}</p>` : ''}
            <div class="media-actions">
              <button class="btn btn-primary btn-sm" onclick="openLightboxFromHome('${photo.id}')">
                🔍 दर्शन करें
              </button>
              <button class="btn btn-outline btn-sm" onclick="downloadMedia('${photo.media_url}', '${photo.title}.jpg')">
                📥 Download HD
              </button>
            </div>
          </div>
        </div>
      `).join("");
    }
  }

  // 3. Latest 3 Videos (Requirement 15)
  const latestVideosGrid = document.getElementById("latest-videos-grid");
  if (latestVideosGrid) {
    const latest3 = videos.slice(0, 3);
    if (latest3.length === 0) {
      latestVideosGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--color-cream-muted);">
          वीडियो जल्द अपलोड किए जाएंगे।
        </div>
      `;
    } else {
      latestVideosGrid.innerHTML = latest3.map(video => `
        <div class="media-card" data-id="${video.id}">
          <div class="media-thumb-container" onclick="playVideoFromHome('${video.id}')">
            <img src="${video.thumbnail_url || 'assets/images/temple-main.png'}" alt="${video.title}" class="media-thumb" loading="lazy" />
            <div class="play-btn-overlay">
              <div class="play-icon-circle">▶</div>
            </div>
            <span class="media-badge">वीडियो</span>
          </div>
          <div class="media-info">
            <div class="media-date">📅 ${formatDevanagariDate(video.date)}</div>
            <h3 class="media-title">${video.title}</h3>
            ${video.description ? `<p class="media-description">${video.description}</p>` : ''}
            <div class="media-actions">
              <button class="btn btn-primary btn-sm" onclick="playVideoFromHome('${video.id}')">
                ▶ वीडियो देखें
              </button>
              <button class="btn btn-outline btn-sm" onclick="downloadMedia('${video.media_url}', '${video.title}.mp4')">
                📥 Download Video
              </button>
            </div>
          </div>
        </div>
      `).join("");
    }
  }

  // 4. Puja Schedule (Requirement 11)
  const scheduleContainer = document.getElementById("homepage-schedule");
  if (scheduleContainer) {
    if (schedule.length === 0) {
      scheduleContainer.innerHTML = `
        <div class="schedule-empty">
          पूजा कार्यक्रम जल्द अपडेट किया जाएगा।
        </div>
      `;
    } else {
      scheduleContainer.innerHTML = `
        <div class="schedule-list">
          ${schedule.map((item, idx) => `
            <div class="schedule-item">
              <div class="schedule-marker">
                ${idx === 0 ? '🕉️' : (idx === schedule.length - 1 ? '🌺' : '🪔')}
              </div>
              <div class="schedule-card">
                <div class="schedule-time-row">
                  <span class="schedule-date-tag">📅 ${formatScheduleDate(item.date)}</span>
                  <span class="schedule-time-tag">🕐 ${item.time}</span>
                </div>
                <h3 class="schedule-event-name">🙏 ${item.eventName}</h3>
                ${item.description ? `<p class="schedule-description">${item.description}</p>` : ''}
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }
  }

  // 5. Update Map Links & Info
  const mapDirectionsBtn = document.getElementById("map-directions-btn");
  if (mapDirectionsBtn && window.SITE_CONFIG) {
    mapDirectionsBtn.href = window.SITE_CONFIG.templeInfo.googleMapsDirectionsUrl;
  }
}

/* ==========================================================================
   HELPER UTILITIES
   ========================================================================== */
function formatDevanagariDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const months = [
      "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
      "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

function formatScheduleDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

// Download function (Requirement 13)
function downloadMedia(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "durga-puja-jonki-media";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
window.downloadMedia = downloadMedia;

// Global helper for opening lightbox from homepage
window.openLightboxFromHome = async (photoId) => {
  if (window.galleryManager) {
    window.galleryManager.openPhotoLightbox(photoId);
  } else {
    window.location.href = `photos.html?id=${photoId}`;
  }
};

window.playVideoFromHome = async (videoId) => {
  if (window.galleryManager) {
    window.galleryManager.openVideoPlayer(videoId);
  } else {
    window.location.href = `videos.html?id=${videoId}`;
  }
};

// Secret Admin Access: Triple-click on temple logo or Alt+A / Ctrl+Shift+A
(function initSecretAdminAccess() {
  let clickCount = 0;
  let clickTimer = null;

  document.querySelectorAll(".brand-logo, .brand-icon").forEach(el => {
    el.addEventListener("click", (e) => {
      clickCount++;
      if (clickCount >= 3) {
        e.preventDefault();
        window.location.href = "admin.html";
        clickCount = 0;
      }
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clickCount = 0; }, 800);
    });
  });

  document.addEventListener("keydown", (e) => {
    if ((e.altKey && e.key.toLowerCase() === "a") || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a")) {
      window.location.href = "admin.html";
    }
  });
})();

