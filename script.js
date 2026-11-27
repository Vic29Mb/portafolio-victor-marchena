const views = [...document.querySelectorAll('.view')];
const navigation = document.querySelector('nav');
const serviceViews = new Set([...document.querySelectorAll('.service')].map(view => view.id));

function showView(moveFocus) {
  const route = window.location.hash.slice(1);
  const legacyRoutes = { proyectos: 'tableros', docencia: 'academy' };
  const viewId = Object.hasOwn(legacyRoutes, route) ? legacyRoutes[route] : route;
  const activeView = views.find(view => view.id === viewId) ?? views[0];
  let activeNav = activeView.id;
  if (serviceViews.has(activeNav)) activeNav = 'servicios';
  if (activeNav.startsWith('caso-')) activeNav = 'casos';

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
    const title = preview.closest('article')?.querySelector('h2, h3')?.textContent ?? preview.getAttribute('aria-label').replace('Ampliar captura', 'Captura');
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
const quoteCarousel = quoteWindow.closest('.quote-carousel');
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
  quoteCarousel.classList.toggle('manual', !allowMotion);
  quoteControls.hidden = !allowMotion;
}

quoteButton.addEventListener('click', () => {
  const paused = quoteWindow.classList.toggle('paused');
  quoteButton.textContent = paused ? 'Reanudar desplazamiento' : 'Pausar desplazamiento';
});

motionPreference.addEventListener('change', syncQuotes);
syncQuotes();

function moveQuote(direction) {
  const firstGroup = quoteTrack.firstElementChild;
  const firstCard = firstGroup.firstElementChild;
  const step = firstCard.nextElementSibling.offsetLeft - firstCard.offsetLeft;
  const animation = quoteTrack.getAnimations().find(item => item.animationName === 'quote-scroll');
  if (!animation || !firstGroup.offsetWidth) {
    quoteWindow.scrollBy({ left: direction * step, behavior: 'instant' });
    return;
  }

  const duration = animation.effect.getTiming().duration;
  const position = (animation.currentTime ?? 0) % duration;
  const change = direction * duration * step / firstGroup.offsetWidth;
  animation.currentTime = ((position + change) % duration + duration) % duration;
}

for (const [selector, direction] of [['.quote-prev', -1], ['.quote-next', 1]]) {
  const arrow = quoteCarousel.querySelector(selector);
  arrow.addEventListener('click', () => moveQuote(direction));
  arrow.hidden = false;
}

const menuButton = document.querySelector('.menu-toggle');
const compactHeader = window.matchMedia('(max-width: 900px)');

function closeCompactMenu() {
  menuButton.hidden = !compactHeader.matches;
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.hidden = compactHeader.matches;
}

menuButton.addEventListener('click', () => {
  const expand = menuButton.getAttribute('aria-expanded') === 'false';
  menuButton.setAttribute('aria-expanded', String(expand));
  navigation.hidden = !expand;
});
navigation.addEventListener('click', event => {
  if (compactHeader.matches && event.target.closest('a')) {
    closeCompactMenu();
    menuButton.focus();
  }
});
compactHeader.addEventListener('change', closeCompactMenu);
closeCompactMenu();

const profileMenu = document.querySelector('.about-menu');
const profileSummary = profileMenu.querySelector('summary');
profileMenu.addEventListener('click', event => {
  if (event.target.closest('a')) {
    profileMenu.open = false;
    if (!compactHeader.matches) profileSummary.focus();
  }
});
document.addEventListener('click', event => {
  if (!profileMenu.contains(event.target)) profileMenu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && profileMenu.open) {
    profileMenu.open = false;
    profileSummary.focus();
  }
});

const demoArea = document.querySelector('#demo-area');
const demoSummary = document.querySelector('#demo-summary strong');
const demoRows = [...document.querySelectorAll('.demo-row')];
const demoCounts = {
  todas: [16, 9, 5],
  logistica: [7, 4, 2],
  infraestructura: [5, 3, 2],
  administracion: [4, 2, 1]
};

function renderDemo() {
  const counts = demoCounts[demoArea.value];
  const total = counts.reduce((sum, count) => sum + count, 0);
  demoSummary.textContent = total + ' contrataciones';
  for (const [index, row] of demoRows.entries()) {
    const meter = row.querySelector('meter');
    meter.max = total;
    meter.value = counts[index];
    row.querySelector('output').value = String(counts[index]);
  }
}
demoArea.addEventListener('change', renderDemo);
renderDemo();
