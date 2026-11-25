const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navegacion');
const mobileLayout = window.matchMedia('(max-width: 760px)');

function setMenuOpen(isOpen) {
  menuButton.setAttribute('aria-expanded', String(isOpen));
  navigation.hidden = mobileLayout.matches && !isOpen;
}

function syncNavigation() {
  menuButton.hidden = !mobileLayout.matches;
  setMenuOpen(false);
}

menuButton.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});

navigation.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!mobileLayout.matches || !link) return;

  const section = document.querySelector(link.hash);
  if (section) {
    section.tabIndex = -1;
    section.focus({ preventScroll: true });
  }
  setMenuOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuButton.focus();
  }
});

mobileLayout.addEventListener('change', syncNavigation);
syncNavigation();
