/**
 * Durga Puja Jonki - AI Chatbot ("माँ दुर्गा सहायक")
 * Answers questions about Durga Puja Jonki strictly from website & database information.
 * Does NOT invent fake information or external trivia.
 */

class DurgaPujaChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.init();
  }

  init() {
    this.bindDOM();
    this.addBotMessage(
      "🙏 जय माँ दुर्गा! मैं 'माँ दुर्गा सहायक' हूँ। आप दुर्गा पूजा जोंकी, मंदिर के स्थान, फोटो, वीडियो, पूजा कार्यक्रम या डाउनलोड से संबंधित कोई भी प्रश्न पूछ सकते हैं।"
    );
  }

  bindDOM() {
    const launcher = document.getElementById("chatbot-launcher");
    const windowEl = document.getElementById("chatbot-window");
    const closeBtn = document.getElementById("chatbot-close-btn");
    const form = document.getElementById("chatbot-form");
    const input = document.getElementById("chatbot-input");
    const chips = document.querySelectorAll(".chip-btn");

    if (launcher && windowEl) {
      launcher.addEventListener("click", () => this.toggleChat());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeChat());
    }

    if (form && input) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
          this.handleUserMessage(text);
          input.value = "";
        }
      });
    }

    if (chips) {
      chips.forEach(chip => {
        chip.addEventListener("click", () => {
          const query = chip.dataset.query || chip.textContent.trim();
          this.handleUserMessage(query);
        });
      });
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const windowEl = document.getElementById("chatbot-window");
    if (windowEl) {
      if (this.isOpen) {
        windowEl.classList.add("open");
        const input = document.getElementById("chatbot-input");
        if (input) setTimeout(() => input.focus(), 200);
      } else {
        windowEl.classList.remove("open");
      }
    }
  }

  closeChat() {
    this.isOpen = false;
    const windowEl = document.getElementById("chatbot-window");
    if (windowEl) windowEl.classList.remove("open");
  }

  async handleUserMessage(query) {
    this.addUserMessage(query);

    // Show bot thinking / response
    const answer = await this.generateAnswer(query);
    this.addBotMessage(answer);
  }

  addUserMessage(text) {
    const container = document.getElementById("chatbot-messages");
    if (!container) return;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble user";
    bubble.textContent = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  addBotMessage(html) {
    const container = document.getElementById("chatbot-messages");
    if (!container) return;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble bot";
    bubble.innerHTML = html;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  /* ==========================================================================
     INTELLIGENT KNOWLEDGE RETRIEVAL (STRICTLY FROM DATABASE/CONFIG)
     ========================================================================== */
  async generateAnswer(rawQuery) {
    const q = rawQuery.toLowerCase().trim();

    // 1. Photos inquiry ("आज की फोटो दिखाओ", "फोटो", "तस्वीरें", "photos")
    if (q.includes("फोटो") || q.includes("photo") || q.includes("तस्वीर") || q.includes("इमेज")) {
      const photos = await window.durgaDB.getPublishedPhotos();
      if (!photos || photos.length === 0) {
        return "वेबसाइट पर अभी कोई तस्वीर अपलोड नहीं है। जल्द ही नई तस्वीरें यहाँ उपलब्ध होंगी।";
      }
      const latest = photos.slice(0, 3);
      let res = `📸 <strong>दुर्गा पूजा जोंकी की नवीनतम तस्वीरें:</strong><br><ul style="padding-left:18px; margin: 6px 0;">`;
      latest.forEach(p => {
        res += `<li>${p.title} (${p.date})</li>`;
      });
      res += `</ul><a href="photos.html" style="color:var(--color-gold-light); font-weight:600; text-decoration:underline;">👉 सभी तस्वीरें देखने के लिए यहाँ क्लिक करें</a>`;
      return res;
    }

    // 2. Videos inquiry ("आज का वीडियो कौन सा है?", "वीडियो", "video")
    if (q.includes("वीडियो") || q.includes("video") || q.includes("गाने") || q.includes("आरती")) {
      const videos = await window.durgaDB.getPublishedVideos();
      if (!videos || videos.length === 0) {
        return "वेबसाइट पर अभी कोई वीडियो उपलब्ध नहीं है।";
      }
      const latest = videos[0];
      return `🎥 <strong>नवीनतम वीडियो:</strong><br>"${latest.title}" (${latest.date})<br>${latest.description || ''}<br><br><a href="videos.html" style="color:var(--color-gold-light); font-weight:600; text-decoration:underline;">👉 वीडियो गैलरी में देखने के लिए यहाँ क्लिक करें</a>`;
    }

    // 3. Countdown / Puja Start Date ("पूजा कब शुरू होगी?", "कब है पूजा", "तारीख", "date")
    if (q.includes("कब") || q.includes("तारीख") || q.includes("शुरू") || q.includes("start") || q.includes("date")) {
      const targetDate = await window.durgaDB.getSetting("pujaStartDate", window.SITE_CONFIG.pujaStartDate);
      const diff = new Date(targetDate).getTime() - new Date().getTime();
      if (diff <= 0) {
        return "🌺 <strong>माँ दुर्गा पूजा आरंभ हो चुकी है!</strong> आप सभी का माँ दुर्गा मंदिर जोंकी में हार्दिक स्वागत है।";
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `🌺 <strong>दुर्गा पूजा जोंकी 2026:</strong><br>पूजा प्रारंभ तिथि: <strong>11 अक्टूबर 2026</strong><br>पूजा शुरू होने में लगभग <strong>${days} दिन</strong> शेष हैं।`;
    }

    // 4. Temple Location ("मंदिर कहाँ है?", "स्थान", "location", "address", "पता", "कहाँ")
    if (q.includes("कहाँ") || q.includes("स्थान") || q.includes("पता") || q.includes("मंदिर") || q.includes("location") || q.includes("address") || q.includes("map")) {
      const info = window.SITE_CONFIG.templeInfo;
      return `📍 <strong>माँ दुर्गा मंदिर का पावन स्थान:</strong><br>
        • ग्राम व पोस्ट: <strong>${info.village}</strong><br>
        • प्रखंड (ब्लॉक): <strong>${info.block}</strong><br>
        • जिला: <strong>${info.district}</strong><br>
        • राज्य: <strong>${info.state} - ${info.pinCode}</strong><br><br>
        <a href="${info.googleMapsDirectionsUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--color-gold-light); font-weight:600; text-decoration:underline;">🗺️ Google Maps में सीधा रास्ता देखें</a>`;
    }

    // 5. Puja Schedule ("आज का कार्यक्रम क्या है?", "कार्यक्रम", "schedule", "timing", "समय")
    if (q.includes("कार्यक्रम") || q.includes("शेड्यूल") || q.includes("schedule") || q.includes("समय") || q.includes("timing")) {
      const schedule = await window.durgaDB.getSchedule();
      if (!schedule || schedule.length === 0) {
        return "पूजा कार्यक्रम जल्द अपडेट किया जाएगा।";
      }
      let res = `📅 <strong>दुर्गा पूजा कार्यक्रम:</strong><br><ul style="padding-left:18px; margin: 6px 0;">`;
      schedule.forEach(s => {
        res += `<li><strong>${s.date} (${s.time}):</strong> ${s.eventName}</li>`;
      });
      res += `</ul><a href="schedule.html" style="color:var(--color-gold-light); font-weight:600; text-decoration:underline;">👉 पूरा कार्यक्रम देखने के लिए यहाँ क्लिक करें</a>`;
      return res;
    }

    // 6. Photo Download ("फोटो कैसे डाउनलोड करें?", "download photo")
    if ((q.includes("डाउनलोड") || q.includes("download")) && (q.includes("फोटो") || q.includes("photo") || q.includes("तस्वीर"))) {
      return `📥 <strong>तस्वीर डाउनलोड करने का तरीका:</strong><br>
        1. किसी भी तस्वीर पर क्लिक करके उसे फुल-स्क्रीन (HD) में खोलें।<br>
        2. नीचे या ऊपर दिए गए <strong>"Download HD"</strong> (📥) बटन पर क्लिक करें।<br>
        3. उच्च गुणवत्ता वाली मूल तस्वीर आपके फ़ोन या कंप्यूटर में डाउनलोड हो जाएगी।`;
    }

    // 7. Video Download ("वीडियो कैसे डाउनलोड करें?", "download video")
    if ((q.includes("डाउनलोड") || q.includes("download")) && (q.includes("वीडियो") || q.includes("video"))) {
      return `📥 <strong>वीडियो डाउनलोड करने का तरीका:</strong><br>
        1. वीडियो कार्ड के नीचे <strong>"Download Video"</strong> बटन या वीडियो प्लेयर के 📥 आइकन पर क्लिक करें।<br>
        2. वीडियो सुरक्षित रूप से आपके डिवाइस में सेव हो जाएगा।`;
    }

    // 8. Committee / Samiti info
    if (q.includes("समिति") || q.includes("कमेटी") || q.includes("सदस्य") || q.includes("committee")) {
      return `🙏 <strong>दुर्गा पूजा समिति जोंकी:</strong><br>यह पावन आयोजन दुर्गा पूजा समिति जोंकी द्वारा श्रद्धा एवं उल्लास के साथ आयोजित किया जाता है। समिति की तस्वीरें आप फोटो गैलरी में 'समिति' वर्ग में देख सकते हैं।`;
    }

    // Requirement: If information is unavailable, say: "यह जानकारी अभी वेबसाइट पर उपलब्ध नहीं है।"
    return "यह जानकारी अभी वेबसाइट पर उपलब्ध नहीं है।";
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.durgaChatbot = new DurgaPujaChatbot();
});
