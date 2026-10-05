/**
 * Durga Puja Jonki - Central Configuration
 * All key settings can be updated from here or through the Admin Panel.
 */
const SITE_CONFIG = {
  // Website Identity
  siteName: "दुर्गा पूजा जोंकी",
  siteNameEn: "Durga Puja Jonki",
  samitiName: "दुर्गा पूजा समिति जोंकी",
  tagline: "माँ दुर्गा की कृपा आप सभी पर बनी रहे।",
  
  // Durga Puja Target Date (India Standard Time - IST)
  // Target: 11 October 2026, 00:00:00 IST
  pujaStartDate: "2026-10-11T00:00:00+05:30",
  countdownZeroMessage: "🌺 दुर्गा पूजा आरंभ हो गई है 🌺",
  
  // Temple Information
  templeInfo: {
    name: "माँ दुर्गा मंदिर, जोंकी",
    village: "जोंकी (Jonki)",
    postOffice: "जोंकी (Jonki)",
    block: "बासोपट्टी (Basopatti)",
    district: "मधुबनी (Madhubani)",
    state: "बिहार (Bihar)",
    pinCode: "847225",
    fullAddress: "माँ दुर्गा मंदिर, ग्राम व पोस्ट - जोंकी, प्रखंड - बासोपट्टी, जिला - मधुबनी, बिहार - 847225",
    nearestLandmark: "जोंकी पावन प्रांगण, बासोपट्टी मार्ग",
    googleMapsSearchQuery: "Maa Durga Mandir Jonki Basopatti Madhubani Bihar 847225",
    // Direct Google Maps Directions link
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Maa+Durga+Mandir+Jonki+Basopatti+Madhubani+Bihar+847225",
    // Embed map URL
    googleMapsEmbedUrl: "https://maps.google.com/maps?q=Jonki,+Basopatti,+Madhubani,+Bihar+847225&t=&z=15&ie=UTF8&iwloc=&output=embed"
  },
  
  // Contact & Social Media
  contact: {
    location: "ग्राम - जोंकी, बासोपट्टी, मधुबनी (बिहार)",
    email: "contact@durgapujajonki.in"
  },
  social: {
    instagram: "mithila_vibes.9",
    instagramUrl: "https://www.instagram.com/mithila_vibes.9/"
  },
  
  // Admin Configuration
  admin: {
    defaultUsername: "admin",
    // Default passcode (can be changed from Admin Settings)
    defaultPasscode: "jonki2026"
  }
};

// Export to window
if (typeof window !== 'undefined') {
  window.SITE_CONFIG = SITE_CONFIG;
}
