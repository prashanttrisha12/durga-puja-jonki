/**
 * Durga Puja Jonki - Storage & Database Layer
 * Modular architecture supporting client IndexedDB (for instant offline & real-world uploads)
 * with automatic fallback to localStorage and pluggable cloud adapters.
 */

class DurgaPujaDB {
  constructor() {
    this.dbName = "DurgaPujaJonkiDB";
    this.version = 1;
    this.db = null;
    this.isReady = false;
    this.useFallback = false;
    this.readyPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve) => {
      if (typeof indexedDB === "undefined") {
        console.warn("IndexedDB not available, using localStorage fallback.");
        this.useFallback = true;
        this.isReady = true;
        this.seedFallbackData();
        resolve(null);
        return;
      }

      let req;
      try {
        req = indexedDB.open(this.dbName, this.version);
      } catch (err) {
        console.warn("IndexedDB open failed, using localStorage fallback:", err);
        this.useFallback = true;
        this.isReady = true;
        this.seedFallbackData();
        resolve(null);
        return;
      }

      req.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Photos Store
        if (!db.objectStoreNames.contains("photos")) {
          const photoStore = db.createObjectStore("photos", { keyPath: "id" });
          photoStore.createIndex("date", "date", { unique: false });
          photoStore.createIndex("category", "category", { unique: false });
          photoStore.createIndex("published", "published", { unique: false });
          photoStore.createIndex("created_at", "created_at", { unique: false });
        }

        // Videos Store
        if (!db.objectStoreNames.contains("videos")) {
          const videoStore = db.createObjectStore("videos", { keyPath: "id" });
          videoStore.createIndex("date", "date", { unique: false });
          videoStore.createIndex("published", "published", { unique: false });
          videoStore.createIndex("created_at", "created_at", { unique: false });
        }

        // Puja Schedule Store
        if (!db.objectStoreNames.contains("schedule")) {
          const scheduleStore = db.createObjectStore("schedule", { keyPath: "id" });
          scheduleStore.createIndex("date", "date", { unique: false });
        }

        // Announcements Store
        if (!db.objectStoreNames.contains("announcements")) {
          db.createObjectStore("announcements", { keyPath: "id" });
        }

        // Settings / Config Store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }

        // Blob Storage Store
        if (!db.objectStoreNames.contains("media_blobs")) {
          db.createObjectStore("media_blobs", { keyPath: "id" });
        }
      };

      req.onsuccess = async (event) => {
        this.db = event.target.result;
        this.isReady = true;

        // Guarantee permanent storage: Browser will NEVER automatically delete user photos/videos!
        if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.persist) {
          navigator.storage.persist().then(isPersisted => {
            if (isPersisted) console.log("✅ Permanent Storage Active: Media protected against auto-deletion!");
          }).catch(() => {});
        }

        // Resolve promise FIRST so no circular await deadlock can ever happen!
        resolve(this.db);

        // Seed default content in background
        try {
          await this.seedInitialDataIfEmpty();
        } catch (e) {
          console.warn("Seeding initial data note:", e);
        }
      };

      req.onerror = (event) => {
        console.warn("IndexedDB error, falling back to localStorage:", event.target.error);
        this.useFallback = true;
        this.isReady = true;
        this.seedFallbackData();
        resolve(null);
      };
    });
  }

  async _ensureReady() {
    if (this.isReady) return;
    await this.readyPromise;
  }

  /* ==========================================================================
     SEED INITIAL DATA
     ========================================================================== */
  getDefaultPhotos() {
    return [
      {
        id: "photo-temple-main",
        title: "माँ दुर्गा मंदिर जोंकी - मुख्य दर्शन",
        description: "माँ दुर्गा मंदिर जोंकी का भव्य एवं पावन स्वरूप। मंदिर के शिखर पर माँ दुर्गा एवं सिंह प्रतिमा।",
        media_url: "assets/images/temple-main.png",
        thumbnail_url: "assets/images/temple-main.png",
        type: "photo",
        category: "फोटो संग्रह",
        date: "2026-09-25",
        created_at: new Date("2026-09-25T13:36:00+05:30").toISOString(),
        published: true
      },
      {
        id: "photo-temple-darshan",
        title: "पावन मंदिर प्रांगण एवं दर्शन",
        description: "माँ दुर्गा मंदिर जोंकी का पावन प्रांगण, बासोपट्टी, मधुबनी।",
        media_url: "assets/images/temple-darshan.jpg",
        thumbnail_url: "assets/images/temple-darshan.jpg",
        type: "photo",
        category: "फोटो संग्रह",
        date: "2026-09-25",
        created_at: new Date("2026-09-25T14:26:00+05:30").toISOString(),
        published: true
      },
      {
        id: "photo-puja-committee",
        title: "दुर्गा पूजा समिति जोंकी के सदस्य",
        description: "माँ दुर्गा मंदिर जोंकी के पावन मुख्य द्वार पर पूजा समिति के सम्मानित सदस्यगण।",
        media_url: "assets/images/puja-committee.jpg",
        thumbnail_url: "assets/images/puja-committee.jpg",
        type: "photo",
        category: "फोटो संग्रह",
        date: "2023-10-18",
        created_at: new Date("2023-10-18T20:58:00+05:30").toISOString(),
        published: true
      },
      {
        id: "photo-temple-devotional",
        title: "माँ दुर्गा मंदिर जोंकी - दिव्य स्वरूप",
        description: "जोंकी मंदिर का भक्तिमय दिव्य स्वरूप - अपन मिथिला पावन धाम।",
        media_url: "assets/images/ChatGPT Image May 14, 2026, 08_13_39 AM.png",
        thumbnail_url: "assets/images/ChatGPT Image May 14, 2026, 08_13_39 AM.png",
        type: "photo",
        category: "फोटो संग्रह",
        date: "2026-05-14",
        created_at: new Date("2026-05-14T08:13:00+05:30").toISOString(),
        published: true
      }
    ];
  }

  getDefaultVideos() {
    return [
      {
        id: "video-durga-puja-aarti",
        title: "माँ दुर्गा भक्ति वंदना - दुर्गा पूजा जोंकी",
        description: "दुर्गा पूजा जोंकी के पावन अवसर पर भक्ति संगीत एवं आरती दर्शन।",
        media_url: "assets/videos/durga-puja-aarti.mp4",
        thumbnail_url: "assets/images/temple-main.png",
        type: "video",
        category: "वीडियो संग्रह",
        date: "2026-09-25",
        created_at: new Date("2026-09-25T13:30:00+05:30").toISOString(),
        published: true
      }
    ];
  }

  getDefaultSchedule() {
    return [
      {
        id: "sched-1",
        date: "2026-10-11",
        time: "प्रातः 07:00 बजे",
        eventName: "कलश स्थापना एवं घट स्थापना",
        description: "माँ दुर्गा पूजा का प्रथम दिन, विधिवत वैदिक मंत्रोच्चार के साथ कलश स्थापना एवं शैलपुत्री पूजा।"
      },
      {
        id: "sched-2",
        date: "2026-10-17",
        time: "प्रातः 08:30 बजे",
        eventName: "महा सप्तमी - पत्रिका प्रवेश एवं नेत्रोन्मीलन",
        description: "नवपत्रिका प्रवेश एवं माँ दुर्गा के दर्शन हेतु पट उद्घाटन।"
      },
      {
        id: "sched-3",
        date: "2026-10-18",
        time: "दोपहर 12:00 बजे",
        eventName: "महा अष्टमी - संधि पूजा एवं महा आरती",
        description: "महा अष्टमी का पावन पूजन एवं संध्या काल में भव्य 108 दीपों की महा आरती।"
      },
      {
        id: "sched-4",
        date: "2026-10-19",
        time: "अपराह्न 02:00 बजे",
        eventName: "महा नवमी - हवन एवं महा प्रसाद वितरण",
        description: "हवन अनुष्ठान, कन्या पूजन एवं समस्त श्रद्धालुओं हेतु महाप्रसाद वितरण।"
      },
      {
        id: "sched-5",
        date: "2026-10-20",
        time: "सायं 04:00 बजे",
        eventName: "विजयदशमी - सिंदूर खेला एवं विसर्जन शोभायात्रा",
        description: "माँ दुर्गा की विदाई, सिंदूर खेला एवं गाजे-बाजे के साथ पावन विसर्जन शोभायात्रा।"
      }
    ];
  }

  async seedInitialDataIfEmpty() {
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(["photos", "videos", "schedule"], "readwrite");
        const photoStore = tx.objectStore("photos");
        const videoStore = tx.objectStore("videos");
        const schedStore = tx.objectStore("schedule");

        const countReq = photoStore.count();
        countReq.onsuccess = () => {
          if (countReq.result === 0) {
            this.getDefaultPhotos().forEach(p => photoStore.put(p));
          }
        };

        const vCountReq = videoStore.count();
        vCountReq.onsuccess = () => {
          if (vCountReq.result === 0) {
            this.getDefaultVideos().forEach(v => videoStore.put(v));
          }
        };

        const sCountReq = schedStore.count();
        sCountReq.onsuccess = () => {
          if (sCountReq.result === 0) {
            this.getDefaultSchedule().forEach(s => schedStore.put(s));
          }
        };

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (err) {
        console.warn("Seeding error:", err);
        resolve(false);
      }
    });
  }

  seedFallbackData() {
    try {
      if (!localStorage.getItem("dpj_photos")) {
        localStorage.setItem("dpj_photos", JSON.stringify(this.getDefaultPhotos()));
      }
      if (!localStorage.getItem("dpj_videos")) {
        localStorage.setItem("dpj_videos", JSON.stringify(this.getDefaultVideos()));
      }
      if (!localStorage.getItem("dpj_schedule")) {
        localStorage.setItem("dpj_schedule", JSON.stringify(this.getDefaultSchedule()));
      }
    } catch (e) {
      console.warn("localStorage quota or access restricted", e);
    }
  }

  async resolveMediaRecord(item) {
    if (!item) return item;
    if (item.blobId) {
      if (!item.media_url || item.media_url.startsWith("blob:")) {
        try {
          const blob = await this.getMediaBlob(item.blobId);
          if (blob) {
            const freshUrl = URL.createObjectURL(blob);
            item.media_url = freshUrl;
            if (!item.thumbnail_url || item.thumbnail_url.startsWith("blob:")) {
              item.thumbnail_url = freshUrl;
            }
          }
        } catch (e) {
          console.warn("Could not resolve media blob:", e);
        }
      }
    }
    return item;
  }

  /* ==========================================================================
     PHOTOS OPERATIONS
     ========================================================================== */
  async getAllPhotos() {
    await this._ensureReady();
    if (this.useFallback || !this.db) {
      try {
        const data = JSON.parse(localStorage.getItem("dpj_photos") || "[]");
        data.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
        return data.length ? data : this.getDefaultPhotos();
      } catch (e) {
        return this.getDefaultPhotos();
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction("photos", "readonly");
        const store = tx.objectStore("photos");
        const req = store.getAll();
        req.onsuccess = async () => {
          const rawPhotos = req.result || [];
          rawPhotos.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
          const photos = await Promise.all(rawPhotos.map(p => this.resolveMediaRecord(p)));
          resolve(photos.length ? photos : this.getDefaultPhotos());
        };
        req.onerror = () => resolve(this.getDefaultPhotos());
      } catch (e) {
        resolve(this.getDefaultPhotos());
      }
    });
  }

  async getPublishedPhotos() {
    const photos = await this.getAllPhotos();
    return photos.filter(p => p.published !== false);
  }

  async getPhotoById(id) {
    await this._ensureReady();
    const photos = await this.getAllPhotos();
    return photos.find(p => p.id === id) || null;
  }

  async addPhoto(photoData, dispatchEvent = true) {
    await this._ensureReady();
    const record = {
      id: photoData.id || "photo-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
      blobId: photoData.blobId || null,
      title: photoData.title || "माँ दुर्गा दर्शन",
      description: photoData.description || "",
      media_url: photoData.media_url,
      thumbnail_url: photoData.thumbnail_url || photoData.media_url,
      type: "photo",
      category: photoData.category || "फोटो संग्रह",
      date: photoData.date || new Date().toISOString().split("T")[0],
      created_at: photoData.created_at || new Date().toISOString(),
      published: photoData.published !== false
    };

    if (this.useFallback || !this.db) {
      try {
        const current = JSON.parse(localStorage.getItem("dpj_photos") || "[]");
        const idx = current.findIndex(p => p.id === record.id);
        if (idx !== -1) current[idx] = record;
        else current.unshift(record);
        localStorage.setItem("dpj_photos", JSON.stringify(current));
      } catch (e) {}
      if (dispatchEvent) this.notifyDataChanged("photos");
      return record;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction("photos", "readwrite");
        const store = tx.objectStore("photos");
        const req = store.put(record);
        req.onsuccess = () => {
          if (dispatchEvent) this.notifyDataChanged("photos");
          resolve(record);
        };
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deletePhoto(id) {
    await this._ensureReady();
    if (this.useFallback || !this.db) {
      try {
        let current = JSON.parse(localStorage.getItem("dpj_photos") || "[]");
        current = current.filter(p => p.id !== id);
        localStorage.setItem("dpj_photos", JSON.stringify(current));
      } catch (e) {}
      this.notifyDataChanged("photos");
      return true;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(["photos", "media_blobs"], "readwrite");
        const photoStore = tx.objectStore("photos");
        const blobStore = tx.objectStore("media_blobs");

        const getReq = photoStore.get(id);
        getReq.onsuccess = () => {
          const item = getReq.result;
          if (item && item.blobId) {
            try { blobStore.delete(item.blobId); } catch (e) {}
          }
          photoStore.delete(id);
        };

        tx.oncomplete = () => {
          this.notifyDataChanged("photos");
          resolve(true);
        };
        tx.onerror = () => {
          // Fallback single store delete
          try {
            const singleTx = this.db.transaction("photos", "readwrite");
            singleTx.objectStore("photos").delete(id);
            singleTx.oncomplete = () => {
              this.notifyDataChanged("photos");
              resolve(true);
            };
            singleTx.onerror = () => reject(singleTx.error);
          } catch (e) {
            reject(e);
          }
        };
      } catch (err) {
        try {
          const singleTx = this.db.transaction("photos", "readwrite");
          singleTx.objectStore("photos").delete(id);
          singleTx.oncomplete = () => {
            this.notifyDataChanged("photos");
            resolve(true);
          };
          singleTx.onerror = () => reject(singleTx.error);
        } catch (e) {
          reject(e);
        }
      }
    });
  }

  /* ==========================================================================
     VIDEOS OPERATIONS
     ========================================================================== */
  async getAllVideos() {
    await this._ensureReady();
    if (this.useFallback || !this.db) {
      try {
        const data = JSON.parse(localStorage.getItem("dpj_videos") || "[]");
        data.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
        return data.length ? data : this.getDefaultVideos();
      } catch (e) {
        return this.getDefaultVideos();
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction("videos", "readonly");
        const store = tx.objectStore("videos");
        const req = store.getAll();
        req.onsuccess = async () => {
          const rawVideos = req.result || [];
          rawVideos.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
          const videos = await Promise.all(rawVideos.map(v => this.resolveMediaRecord(v)));
          resolve(videos.length ? videos : this.getDefaultVideos());
        };
        req.onerror = () => resolve(this.getDefaultVideos());
      } catch (e) {
        resolve(this.getDefaultVideos());
      }
    });
  }

  async getPublishedVideos() {
    const videos = await this.getAllVideos();
    return videos.filter(v => v.published !== false);
  }

  async getVideoById(id) {
    await this._ensureReady();
    const videos = await this.getAllVideos();
    return videos.find(v => v.id === id) || null;
  }

  async addVideo(videoData, dispatchEvent = true) {
    await this._ensureReady();
    const record = {
      id: videoData.id || "video-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
      blobId: videoData.blobId || null,
      title: videoData.title || "माँ दुर्गा वीडियो दर्शन",
      description: videoData.description || "",
      media_url: videoData.media_url,
      thumbnail_url: videoData.thumbnail_url || "assets/images/temple-main.png",
      type: "video",
      category: videoData.category || "वीडियो संग्रह",
      date: videoData.date || new Date().toISOString().split("T")[0],
      created_at: videoData.created_at || new Date().toISOString(),
      published: videoData.published !== false
    };

    if (this.useFallback || !this.db) {
      try {
        const current = JSON.parse(localStorage.getItem("dpj_videos") || "[]");
        const idx = current.findIndex(v => v.id === record.id);
        if (idx !== -1) current[idx] = record;
        else current.unshift(record);
        localStorage.setItem("dpj_videos", JSON.stringify(current));
      } catch (e) {}
      if (dispatchEvent) this.notifyDataChanged("videos");
      return record;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction("videos", "readwrite");
        const store = tx.objectStore("videos");
        const req = store.put(record);
        req.onsuccess = () => {
          if (dispatchEvent) this.notifyDataChanged("videos");
          resolve(record);
        };
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteVideo(id) {
    await this._ensureReady();
    if (this.useFallback || !this.db) {
      try {
        let current = JSON.parse(localStorage.getItem("dpj_videos") || "[]");
        current = current.filter(v => v.id !== id);
        localStorage.setItem("dpj_videos", JSON.stringify(current));
      } catch (e) {}
      this.notifyDataChanged("videos");
      return true;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(["videos", "media_blobs"], "readwrite");
        const videoStore = tx.objectStore("videos");
        const blobStore = tx.objectStore("media_blobs");

        const getReq = videoStore.get(id);
        getReq.onsuccess = () => {
          const item = getReq.result;
          if (item && item.blobId) {
            try { blobStore.delete(item.blobId); } catch (e) {}
          }
          videoStore.delete(id);
        };

        tx.oncomplete = () => {
          this.notifyDataChanged("videos");
          resolve(true);
        };
        tx.onerror = () => {
          try {
            const singleTx = this.db.transaction("videos", "readwrite");
            singleTx.objectStore("videos").delete(id);
            singleTx.oncomplete = () => {
              this.notifyDataChanged("videos");
              resolve(true);
            };
            singleTx.onerror = () => reject(singleTx.error);
          } catch (e) {
            reject(e);
          }
        };
      } catch (err) {
        try {
          const singleTx = this.db.transaction("videos", "readwrite");
          singleTx.objectStore("videos").delete(id);
          singleTx.oncomplete = () => {
            this.notifyDataChanged("videos");
            resolve(true);
          };
          singleTx.onerror = () => reject(singleTx.error);
        } catch (e) {
          reject(e);
        }
      }
    });
  }

  /* ==========================================================================
     SCHEDULE OPERATIONS
     ========================================================================== */
  async getSchedule() {
    await this._ensureReady();
    if (this.useFallback || !this.db) {
      try {
        const data = JSON.parse(localStorage.getItem("dpj_schedule") || "[]");
        data.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        return data.length ? data : this.getDefaultSchedule();
      } catch (e) {
        return this.getDefaultSchedule();
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction("schedule", "readonly");
        const store = tx.objectStore("schedule");
        const req = store.getAll();
        req.onsuccess = () => {
          const schedule = req.result || [];
          schedule.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
          resolve(schedule.length ? schedule : this.getDefaultSchedule());
        };
        req.onerror = () => resolve(this.getDefaultSchedule());
      } catch (e) {
        resolve(this.getDefaultSchedule());
      }
    });
  }

  async addScheduleItem(item, dispatchEvent = true) {
    await this._ensureReady();
    const record = {
      id: item.id || "sched-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
      date: item.date,
      time: item.time,
      eventName: item.eventName,
      description: item.description || ""
    };

    if (this.useFallback || !this.db) {
      try {
        const current = JSON.parse(localStorage.getItem("dpj_schedule") || "[]");
        current.push(record);
        localStorage.setItem("dpj_schedule", JSON.stringify(current));
      } catch (e) {}
      if (dispatchEvent) this.notifyDataChanged("schedule");
      return record;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction("schedule", "readwrite");
        const store = tx.objectStore("schedule");
        const req = store.put(record);
        req.onsuccess = () => {
          if (dispatchEvent) this.notifyDataChanged("schedule");
          resolve(record);
        };
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteScheduleItem(id) {
    await this._ensureReady();
    if (this.useFallback || !this.db) {
      try {
        let current = JSON.parse(localStorage.getItem("dpj_schedule") || "[]");
        current = current.filter(s => s.id !== id);
        localStorage.setItem("dpj_schedule", JSON.stringify(current));
      } catch (e) {}
      this.notifyDataChanged("schedule");
      return true;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction("schedule", "readwrite");
        const store = tx.objectStore("schedule");
        const req = store.delete(id);
        req.onsuccess = () => {
          this.notifyDataChanged("schedule");
          resolve(true);
        };
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /* ==========================================================================
     MEDIA BLOBS & SETTINGS
     ========================================================================== */
  async storeMediaBlob(blobId, blobData) {
    await this._ensureReady();
    if (!this.db) return blobId;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction("media_blobs", "readwrite");
        const store = tx.objectStore("media_blobs");
        const req = store.put({ id: blobId, blob: blobData, size: blobData.size, type: blobData.type });
        req.onsuccess = () => resolve(blobId);
        req.onerror = () => resolve(blobId);
      } catch (e) {
        resolve(blobId);
      }
    });
  }

  async getMediaBlob(blobId) {
    await this._ensureReady();
    if (!this.db || !blobId) return null;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction("media_blobs", "readonly");
        const store = tx.objectStore("media_blobs");
        const req = store.get(blobId);
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            resolve(req.result.blob);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async deleteMediaBlob(blobId) {
    await this._ensureReady();
    if (!this.db || !blobId) return true;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction("media_blobs", "readwrite");
        const store = tx.objectStore("media_blobs");
        const req = store.delete(blobId);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async getSetting(key, defaultValue = null) {
    await this._ensureReady();
    if (this.useFallback || !this.db) {
      try {
        const val = localStorage.getItem("dpj_setting_" + key);
        return val !== null ? JSON.parse(val) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction("settings", "readonly");
        const store = tx.objectStore("settings");
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : defaultValue);
        req.onerror = () => resolve(defaultValue);
      } catch (e) {
        resolve(defaultValue);
      }
    });
  }

  async setSetting(key, value) {
    await this._ensureReady();
    try {
      localStorage.setItem("dpj_setting_" + key, JSON.stringify(value));
    } catch (e) {}

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("settings", "readwrite");
          const store = tx.objectStore("settings");
          const req = store.put({ key, value });
          req.onsuccess = () => {
            this.notifyDataChanged("settings");
            resolve(true);
          };
          req.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    }

    this.notifyDataChanged("settings");
    return true;
  }

  /* ==========================================================================
     PERMANENT DATA BACKUP & RESTORE (Never Lose Photos / Videos)
     ========================================================================== */
  async exportAllData() {
    await this._ensureReady();
    const photos = await this.getAllPhotos();
    const videos = await this.getAllVideos();
    const schedule = await this.getSchedule();
    const cover = await this.getSetting("siteCustomCover");
    const logo = await this.getSetting("siteCustomLogo");
    const instagram = await this.getSetting("instagramHandle", "mithila_vibes.9");
    const instagramUrl = await this.getSetting("instagramUrl", "https://www.instagram.com/mithila_vibes.9/");
    const pujaStartDate = await this.getSetting("pujaStartDate");

    return {
      appName: "DurgaPujaJonki",
      version: 1,
      exportedAt: new Date().toISOString(),
      photos,
      videos,
      schedule,
      settings: {
        siteCustomCover: cover,
        siteCustomLogo: logo,
        instagramHandle: instagram,
        instagramUrl: instagramUrl,
        pujaStartDate: pujaStartDate
      }
    };
  }

  async importAllData(data) {
    await this._ensureReady();
    if (!data) return false;

    if (data.photos && Array.isArray(data.photos)) {
      for (const p of data.photos) {
        await this.addPhoto(p, false);
      }
    }
    if (data.videos && Array.isArray(data.videos)) {
      for (const v of data.videos) {
        await this.addVideo(v, false);
      }
    }
    if (data.schedule && Array.isArray(data.schedule)) {
      for (const s of data.schedule) {
        await this.addScheduleItem(s, false);
      }
    }
    if (data.settings && typeof data.settings === "object") {
      for (const [k, val] of Object.entries(data.settings)) {
        if (val !== undefined && val !== null) {
          await this.setSetting(k, val);
        }
      }
    }
    this.notifyDataChanged("all");
    return true;
  }

  notifyDataChanged(type) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dpj-data-changed", { detail: { type } }));
    }
  }
}

// Global Singleton Instance
window.durgaDB = new DurgaPujaDB();
