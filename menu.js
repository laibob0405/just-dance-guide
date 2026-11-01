// Collapses the main menu on phones; without this script the menu simply stays open.
const nav = document.querySelector('nav');
const toggle = nav.querySelector('.menu-toggle');

nav.classList.add('collapsible');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
