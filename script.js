const views = [...document.querySelectorAll('.view')];
const navigation = document.querySelector('nav');
const serviceViews = new Set([...document.querySelectorAll('.service')].map(view => view.id));

function showView(moveFocus) {
  const route = window.location.hash.slice(1);
  const legacyRoutes = { proyectos: 'tableros', docencia: 'academy' };
  const viewId = Object.hasOwn(legacyRoutes, route) ? legacyRoutes[route] : route;
  const activeView = views.find(view => view.id === viewId) ?? views[0];
  const activeNav = serviceViews.has(activeView.id) ? 'servicios' : activeView.id;

  for (const view of views) {
    const isActive = view === activeView;
    view.hidden = !isActive;
    view.classList.toggle('active', isActive);
  }
  for (const link of navigation.querySelectorAll('a')) {
    if (link.hash === '#' + activeNav) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  const heading = activeView.querySelector('h1');
  document.title = activeView.id === 'inicio'
    ? 'Vic Data | Economía, datos y programación'
    : heading.textContent + ' | Vic Data';
  if (moveFocus) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

const cards = [...document.querySelectorAll('#catalogo [data-institucion]')];
const filters = document.querySelector('.filters');
const status = document.querySelector('#resultado-filtro');
const institutions = [...new Set(cards.map(card => card.dataset.institucion))];

function filterCatalog(institution) {
  let visibleCount = 0;
  for (const card of cards) {
    card.hidden = Boolean(institution && card.dataset.institucion !== institution);
    if (!card.hidden) visibleCount += 1;
  }
  for (const button of filters.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.institucion === institution));
  }
  status.textContent = visibleCount === 1 ? '1 tablero visible' : visibleCount + ' tableros visibles';
}

for (const institution of ['', ...institutions]) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = institution || 'Todos';
  button.dataset.institucion = institution;
  button.addEventListener('click', () => filterCatalog(institution));
  filters.append(button);
}
filters.hidden = false;
filterCatalog('');
window.addEventListener('hashchange', () => showView(true));
showView(false);

const reportDialog = document.querySelector('#vista-reporte');
const reportTitle = reportDialog.querySelector('h2');
const reportContent = reportDialog.querySelector('.report-content');

if (typeof reportDialog.showModal === 'function') {
  for (const preview of document.querySelectorAll('.report-preview')) {
    const title = preview.closest('article').querySelector('h2, h3').textContent;
    const imageType = preview.classList.contains('thesis-preview') ? 'Portada' : 'Captura';
    preview.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      reportTitle.textContent = title;
      const image = document.createElement('img');
      image.alt = imageType + ' de ' + title;
      image.src = preview.href;
      reportContent.replaceChildren(image);
      reportDialog.showModal();
    });
  }
  reportDialog.addEventListener('close', () => reportContent.replaceChildren());
  window.addEventListener('hashchange', () => {
    if (reportDialog.open) reportDialog.close();
  });
}

const quoteWindow = document.querySelector('.quote-window');
const quoteTrack = quoteWindow.querySelector('.quote-track');
const quoteControls = document.querySelector('.quote-controls');
const quoteButton = quoteControls.querySelector('button');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const quoteCopy = quoteTrack.firstElementChild.cloneNode(true);
quoteCopy.setAttribute('aria-hidden', 'true');
quoteCopy.hidden = true;
quoteTrack.append(quoteCopy);

function syncQuotes() {
  const allowMotion = !motionPreference.matches;
  quoteWindow.classList.toggle('can-scroll', allowMotion);
  quoteCopy.hidden = !allowMotion;
  quoteControls.hidden = !allowMotion;
}

quoteButton.addEventListener('click', () => {
  const paused = quoteWindow.classList.toggle('paused');
  quoteButton.textContent = paused ? 'Reanudar desplazamiento' : 'Pausar desplazamiento';
});

motionPreference.addEventListener('change', syncQuotes);
syncQuotes();
