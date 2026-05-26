// ===== EduSpace Main JS =====

// ── Header scroll effect ──
window.addEventListener('scroll', () => {
  const h = document.getElementById('siteHeader');
  if (h) h.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Hamburger ──
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('hamburger');
  const nav = document.querySelector('.main-nav');
  if (btn && nav) {
    btn.addEventListener('click', () => nav.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!btn.contains(e.target) && !nav.contains(e.target)) nav.classList.remove('open');
    });
  }
});

// ── Home: Latest Podcasts (3) ──
function renderHomeCards() {
  const podcasts = DB.getPodcasts().slice(0, 3);
  const articles = DB.getArticles().slice(0, 3);

  const pg = document.getElementById('homePodcastGrid');
  if (pg) {
    if (!podcasts.length) {
      pg.innerHTML = '<div class="card-placeholder">პოდკასტები ჯერ არ დამატებულა</div>';
    } else {
      pg.innerHTML = podcasts.map(p => podcastCardHTML(p)).join('');
      pg.querySelectorAll('.podcast-card').forEach((card, i) => {
        card.addEventListener('click', () => openVideoModal(podcasts[i]));
      });
    }
  }

  const ag = document.getElementById('homeArticleGrid');
  if (ag) {
    if (!articles.length) {
      ag.innerHTML = '<div class="card-placeholder">სტატიები ჯერ არ დამატებულა</div>';
    } else {
      ag.innerHTML = articles.map(a => homeArticleCardHTML(a)).join('');
      ag.querySelectorAll('.home-article-card').forEach((card, i) => {
        card.addEventListener('click', () => openArticleModal(articles[i]));
      });
    }
  }
}

// ── Podcasts Page ──
function renderPodcastPage() {
  const podcasts = DB.getPodcasts();
  const grid = document.getElementById('podcastGrid');
  if (!grid) return;
  if (!podcasts.length) {
    grid.innerHTML = '<div class="card-placeholder">პოდკასტები ჯერ არ დამატებულა</div>';
    return;
  }
  grid.innerHTML = podcasts.map(p => podcastCardHTML(p)).join('');
  grid.querySelectorAll('.podcast-card').forEach((card, i) => {
    card.addEventListener('click', () => openVideoModal(podcasts[i]));
  });

  // Modal close
  document.getElementById('modalClose')?.addEventListener('click', closeVideoModal);
  document.getElementById('videoModal')?.addEventListener('click', e => {
    if (e.target.id === 'videoModal') closeVideoModal();
  });
}

// ── Articles Page ──
function renderArticlesPage() {
  const articles = DB.getArticles();
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;
  if (!articles.length) {
    grid.innerHTML = '<div class="card-placeholder">სტატიები ჯერ არ დამატებულა</div>';
    return;
  }
  grid.innerHTML = articles.map(a => articleCardHTML(a)).join('');
  grid.querySelectorAll('.article-card').forEach((card, i) => {
    card.addEventListener('click', () => openArticleModal(articles[i]));
  });

  document.getElementById('articleModalClose')?.addEventListener('click', closeArticleModal);
  document.getElementById('articleModal')?.addEventListener('click', e => {
    if (e.target.id === 'articleModal') closeArticleModal();
  });
}

// ── Card HTML Builders ──
function podcastCardHTML(p) {
  const ytId = getYouTubeId(p.url || '');
  const thumb = ytId ? getYouTubeThumbnail(ytId) : '';
  return `
    <div class="podcast-card">
      <div class="podcast-thumb">
        ${thumb ? `<img src="${thumb}" alt="${escHtml(p.title)}" loading="lazy"/>` : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#0e1a3a,#1a0e3a)"></div>'}
        <div class="play-btn"><div class="play-icon">▶</div></div>
      </div>
      <div class="podcast-info">
        <div class="podcast-title">${escHtml(p.title)}</div>
        ${p.description ? `<div class="podcast-desc">${escHtml(p.description)}</div>` : ''}
        <div class="podcast-date">${formatDate(p.date)}</div>
      </div>
    </div>`;
}

function homeArticleCardHTML(a) {
  return `
    <div class="home-article-card">
      ${a.imageUrl
        ? `<img class="home-article-cover" src="${a.imageUrl}" alt="${escHtml(a.title)}" loading="lazy"/>`
        : `<div class="home-article-cover-placeholder">📄</div>`}
      <div class="home-article-info">
        <div class="article-title">${escHtml(a.title)}</div>
        <div class="article-excerpt">${escHtml(a.excerpt || a.content?.substring(0,120) || '')}</div>
        <div class="article-meta"><span>${formatDate(a.date)}</span>${a.tag ? `<span class="article-tag">${escHtml(a.tag)}</span>` : ''}</div>
      </div>
    </div>`;
}

function articleCardHTML(a) {
  return `
    <div class="article-card">
      ${a.imageUrl
        ? `<img class="article-cover" src="${a.imageUrl}" alt="${escHtml(a.title)}" loading="lazy"/>`
        : `<div class="article-cover-placeholder">📄</div>`}
      <div class="article-body">
        <div class="article-title">${escHtml(a.title)}</div>
        <div class="article-excerpt">${escHtml(a.excerpt || a.content?.substring(0,200) || '')}</div>
        <div class="article-meta"><span>${formatDate(a.date)}</span>${a.tag ? `<span class="article-tag">${escHtml(a.tag)}</span>` : ''}</div>
      </div>
    </div>`;
}

// ── Video Modal ──
function openVideoModal(podcast) {
  const modal = document.getElementById('videoModal');
  const wrapper = document.getElementById('videoWrapper');
  const info = document.getElementById('modalInfo');
  if (!modal) return;
  const ytId = getYouTubeId(podcast.url || '');
  if (ytId) {
    wrapper.innerHTML = `<iframe src="${getYouTubeEmbed(ytId)}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  } else {
    wrapper.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#546080;padding:40px">YouTube ლინკი ვერ მოიძებნა</div>`;
  }
  info.innerHTML = `<h3>${escHtml(podcast.title)}</h3>${podcast.description ? `<p>${escHtml(podcast.description)}</p>` : ''}`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const wrapper = document.getElementById('videoWrapper');
  modal?.classList.remove('open');
  if (wrapper) wrapper.innerHTML = '';
  document.body.style.overflow = '';
}

// ── Article Modal ──
function openArticleModal(article) {
  const modal = document.getElementById('articleModal');
  const content = document.getElementById('articleModalContent');
  if (!modal) return;
  content.innerHTML = `
    ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${escHtml(article.title)}"/>` : ''}
    <h2>${escHtml(article.title)}</h2>
    <div class="article-modal-meta">${formatDate(article.date)}${article.tag ? ` · ${escHtml(article.tag)}` : ''}</div>
    <div>${(article.content || '').split('\n').map(l => l.trim() ? `<p>${escHtml(l)}</p>` : '').join('')}</div>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeArticleModal() {
  document.getElementById('articleModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Escape HTML ──
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Close modals on escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeVideoModal(); closeArticleModal(); }
});
