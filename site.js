async function loadContent(kind, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  try {
    const response = await fetch(`content/${kind}.json`);
    const items = await response.json();
    target.innerHTML = '';
    if (!items.length) {
      target.innerHTML = '<div class="empty-state">Brak opublikowanych wpisów. Nowe materiały pojawią się tutaj po publikacji.</div>';
      return;
    }
    items.forEach((item) => {
      const article = document.createElement('article');
      article.className = 'feed-item';
      const extra = item.source ? `<small>Źródło: ${escapeHtml(item.source)}</small>` : '';
      const link = item.link ? `<a href="${escapeAttr(item.link)}" target="_blank" rel="noopener">Źródło ↗</a>` : '';
      article.innerHTML = `<time>${escapeHtml(item.date || item.year || '')}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p>${extra}</div><span>${link}</span>`;
      target.appendChild(article);
    });
  } catch (error) {
    target.innerHTML = '<div class="empty-state">Treści będą dostępne po opublikowaniu pierwszego wpisu.</div>';
  }
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function escapeAttr(value) { return String(value).replace(/[^a-zA-Z0-9_:\/.?=&%-]/g, ''); }

document.addEventListener('DOMContentLoaded', () => {
  loadContent('aktualnosci', 'aktualnosci-list');
  loadContent('ogloszenia', 'ogloszenia-list');
  loadContent('kronika', 'kronika-list');
});
