const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

toggle?.addEventListener('click', () => {
  nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
});

document.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});
