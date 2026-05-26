// ===== EduSpace Data Layer =====
// All data stored in localStorage for GitHub Pages (no server needed)

const DB = {
  // ── Helpers ──
  get(key) {
    try { return JSON.parse(localStorage.getItem('eduspace_' + key)) || []; }
    catch { return []; }
  },
  set(key, val) {
    localStorage.setItem('eduspace_' + key, JSON.stringify(val));
  },
  getOne(key) {
    try { return JSON.parse(localStorage.getItem('eduspace_' + key)) || null; }
    catch { return null; }
  },
  setOne(key, val) {
    localStorage.setItem('eduspace_' + key, JSON.stringify(val));
  },

  // ── Podcasts ──
  getPodcasts() { return this.get('podcasts'); },
  savePodcasts(data) { this.set('podcasts', data); },
  addPodcast(pod) {
    const list = this.getPodcasts();
    pod.id = Date.now().toString();
    pod.date = new Date().toISOString();
    list.unshift(pod);
    this.savePodcasts(list);
    return pod;
  },
  deletePodcast(id) {
    this.savePodcasts(this.getPodcasts().filter(p => p.id !== id));
  },
  updatePodcast(id, data) {
    const list = this.getPodcasts().map(p => p.id === id ? { ...p, ...data } : p);
    this.savePodcasts(list);
  },

  // ── Articles ──
  getArticles() { return this.get('articles'); },
  saveArticles(data) { this.set('articles', data); },
  addArticle(art) {
    const list = this.getArticles();
    art.id = Date.now().toString();
    art.date = new Date().toISOString();
    list.unshift(art);
    this.saveArticles(list);
    return art;
  },
  deleteArticle(id) {
    this.saveArticles(this.getArticles().filter(a => a.id !== id));
  },
  updateArticle(id, data) {
    const list = this.getArticles().map(a => a.id === id ? { ...a, ...data } : a);
    this.saveArticles(list);
  },

  // ── Site Settings ──
  getSettings() {
    return this.getOne('settings') || {
      siteName: 'EduSpace',
      tagline: 'Learn • Explore • Grow',
      logoUrl: '',
      coverUrl: '',
      aboutText: 'EduSpace არის საგანმანათლებლო პლატფორმა...',
      socialLinks: {}
    };
  },
  saveSettings(data) { this.setOne('settings', data); }
};

// ── YouTube Utilities ──
function getYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function getYouTubeEmbed(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

// ── Date Formatter ──
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ka-GE', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Image to Base64 ──
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Apply Site Settings ──
function applySiteSettings() {
  const s = DB.getSettings();
  // Logo images
  document.querySelectorAll('#headerLogo, #footerLogo, #aboutLogo, #favicon').forEach(el => {
    if (s.logoUrl && el) {
      if (el.tagName === 'LINK') el.href = s.logoUrl;
      else el.src = s.logoUrl;
    }
  });
  // Cover image
  const heroCover = document.getElementById('heroCover');
  if (heroCover && s.coverUrl) {
    heroCover.style.backgroundImage = `url('${s.coverUrl}')`;
  }
  // About text
  const aboutEl = document.getElementById('aboutText');
  if (aboutEl && s.aboutText) {
    aboutEl.innerHTML = `<p>${s.aboutText.replace(/\n/g, '</p><p>')}</p>`;
  }
  // Site name
  if (s.siteName) {
    const logoText = document.querySelector('.logo-text');
    if (logoText) {
      const parts = s.siteName.match(/^(.{3})(.+)$/);
      if (parts) logoText.innerHTML = `${parts[1]}<span>${parts[2]}</span>`;
    }
  }
}

window.addEventListener('DOMContentLoaded', applySiteSettings);
