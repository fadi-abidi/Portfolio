// Footer year
var y = document.getElementById('year');
if (y) { y.textContent = new Date().getFullYear(); }

// Project filters
var buttons = document.querySelectorAll('.f');
var cards = document.querySelectorAll('.cards .card');
var count = document.getElementById('count');

function applyFilter(cat) {
  var shown = 0;
  cards.forEach(function (c) {
    var ok = cat === 'all' || (c.getAttribute('data-cat') || '').split(' ').indexOf(cat) !== -1;
    c.hidden = !ok;
    if (ok) { shown++; }
  });
  if (count) { count.textContent = shown + (shown === 1 ? ' project is shown.' : ' projects are shown.'); }
}

buttons.forEach(function (b) {
  b.addEventListener('click', function () {
    buttons.forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    applyFilter(b.getAttribute('data-f'));
  });
});
applyFilter('all');

// Links to a project card: show all projects first if the card is filtered out
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  var id = a.getAttribute('href').slice(1);
  var target = id ? document.getElementById(id) : null;
  if (!target || !target.classList.contains('card')) { return; }
  a.addEventListener('click', function () {
    if (target.hidden) {
      buttons.forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-f') === 'all'); });
      applyFilter('all');
    }
  });
});

// Photo galleries: arrows, dots and swipe (native scrolling)
document.querySelectorAll('.gallery').forEach(function (g) {
  var track = g.querySelector('.slides');
  var slides = track.querySelectorAll('figure');
  if (slides.length < 2) { g.classList.add('single'); return; }

  var prev = document.createElement('button');
  prev.className = 'gbtn prev'; prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous photo'); prev.innerHTML = '&#8249;';
  var next = document.createElement('button');
  next.className = 'gbtn next'; next.type = 'button';
  next.setAttribute('aria-label', 'Next photo'); next.innerHTML = '&#8250;';
  var dots = document.createElement('div');
  dots.className = 'dots';
  slides.forEach(function () { dots.appendChild(document.createElement('span')); });
  g.appendChild(prev); g.appendChild(next); g.appendChild(dots);

  function index() { return Math.round(track.scrollLeft / track.clientWidth); }
  function go(i) {
    var n = (i + slides.length) % slides.length;
    track.scrollTo({ left: n * track.clientWidth, behavior: 'smooth' });
  }
  function mark() {
    var i = index();
    dots.querySelectorAll('span').forEach(function (d, k) { d.classList.toggle('on', k === i); });
  }
  prev.addEventListener('click', function () { go(index() - 1); });
  next.addEventListener('click', function () { go(index() + 1); });
  track.addEventListener('scroll', function () { window.requestAnimationFrame(mark); });
  window.addEventListener('resize', mark);
  mark();
});

// Lightbox
var lb = document.getElementById('lightbox');
var lbImg = document.getElementById('lb-img');
var lbCap = document.getElementById('lb-cap');
var lbClose = document.getElementById('lb-close');
if (lb && typeof lb.showModal === 'function') {
  document.querySelectorAll('.slides img, .early .thumbs img').forEach(function (img) {
    img.parentNode.addEventListener('click', function () {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
      lb.showModal();
    });
  });
  lbClose.addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) { lb.close(); } });
}

// Light and dark appearance
var root = document.documentElement;
var toggle = document.getElementById('theme');
try {
  var saved = localStorage.getItem('theme');
  if (saved) { root.setAttribute('data-theme', saved); }
} catch (e) {}

if (toggle) {
  toggle.addEventListener('click', function () {
    var isDark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

// Robot cell illustration: hold still for people who prefer less motion
var cell = document.querySelector('.cell');
if (cell && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches && cell.pauseAnimations) {
  cell.pauseAnimations();
}
