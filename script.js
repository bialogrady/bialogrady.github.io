const toggle = document.querySelector('.menu-toggle');
const header = document.querySelector('.header');

toggle?.addEventListener('click', () => {
  header.classList.toggle('nav-open');
  toggle.setAttribute('aria-expanded', header.classList.contains('nav-open'));
});

document.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => header.classList.remove('nav-open'));
});
