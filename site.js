async function getItems(kind) {
  const response = await fetch(`content/${encodeURIComponent(kind)}.json`);
  if (!response.ok) throw new Error('Nie udało się pobrać treści');
  return response.json();
}
function attachmentMarkup(attachments = []) {
  if (!attachments.length) return '';
  const images = attachments.filter(file => (file.type || '').startsWith('image/'));
  const documents = attachments.filter(file => !(file.type || '').startsWith('image/'));
  const gallery = images.length ? `<div class="article-gallery">${images.map(file => `<a href="${safePath(file.path)}" target="_blank" rel="noopener"><img src="${safePath(file.path)}" alt="${escapeHtml(file.name)}"><span>${escapeHtml(file.name)}</span></a>`).join('')}</div>` : '';
  const docs = documents.length ? `<div class="documents"><h3>Dokumenty i załączniki</h3>${documents.map(file => `<a class="document" href="${safePath(file.path)}" target="_blank" rel="noopener"><span class="document-icon">PDF</span><span><strong>${escapeHtml(file.name)}</strong><small>Otwórz lub pobierz dokument ↗</small></span></a>`).join('')}</div>` : '';
  return `<section class="attachments">${gallery}${docs}</section>`;
}
function itemMarkup(item, kind, full = false) {
  const link = `wpis.html?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(item.id)}`;
  const extra = item.source ? `<small class="source">Źródło: ${escapeHtml(item.source)}</small>` : '';
  const title = `<a class="entry-title-link" href="${link}">${escapeHtml(item.title)}</a>`;
  if (full) return `<article class="full-article"><p class="eyebrow">${escapeHtml(kind === 'kronika' ? 'Kronika' : kind === 'ogloszenia' ? 'Ogłoszenie' : 'Aktualność')}</p><h1>${escapeHtml(item.title)}</h1><time class="article-date">${escapeHtml(item.date || item.year || '')}</time><div class="article-body">${escapeHtml(item.text).replace(/\n/g, '<br>')}</div>${extra}${item.link ? `<p><a class="source-link" href="${safePath(item.link)}" target="_blank" rel="noopener">Przejdź do źródła zewnętrznego ↗</a></p>` : ''}${attachmentMarkup(item.attachments)}</article>`;
  return `<article class="feed-item"><time>${escapeHtml(item.date || item.year || '')}</time><div><h3>${title}</h3><p>${escapeHtml(item.text)}</p>${extra}</div><a class="read-link" href="${link}">Czytaj całość →</a></article>`;
}
async function loadContent(kind, targetId) {
  const target = document.getElementById(targetId); if (!target) return;
  try { const items = await getItems(kind); target.innerHTML = items.length ? items.map(item => itemMarkup(item, kind)).join('') : '<div class="empty-state">Brak opublikowanych wpisów. Nowe materiały pojawią się tutaj po publikacji.</div>'; }
  catch (error) { target.innerHTML = '<div class="empty-state">Treści będą dostępne po opublikowaniu pierwszego wpisu.</div>'; }
}
async function loadDetail() {
  const target = document.getElementById('article-view'); if (!target) return;
  const params = new URLSearchParams(location.search); const kind = params.get('kind'); const id = params.get('id');
  if (!kind || !id) { target.innerHTML = '<div class="empty-state">Nie znaleziono wpisu.</div>'; return; }
  try { const items = await getItems(kind); const item = items.find(entry => entry.id === id); target.innerHTML = item ? itemMarkup(item, kind, true) : '<div class="empty-state">Nie znaleziono wpisu.</div>'; document.title = item ? `${item.title} — Białogrądy` : 'Wpis — Białogrądy'; }
  catch (error) { target.innerHTML = '<div class="empty-state">Nie udało się wczytać wpisu.</div>'; }
}
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function safePath(value) { return String(value || '').replace(/[^a-zA-Z0-9_:\/.?=&%#-]/g, ''); }
document.addEventListener('DOMContentLoaded', () => { loadContent('aktualnosci', 'aktualnosci-list'); loadContent('ogloszenia', 'ogloszenia-list'); loadContent('kronika', 'kronika-list'); loadDetail(); });
