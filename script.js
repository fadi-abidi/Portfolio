// Footer year
var y = document.getElementById('year');
if (y) { y.textContent = new Date().getFullYear(); }

// Project filters
var buttons = document.querySelectorAll('.f');
var cards = document.querySelectorAll('.card');
var count = document.getElementById('count');

function applyFilter(cat) {
  var shown = 0;
  cards.forEach(function (c) {
    var ok = cat === 'all' || c.getAttribute('data-cat') === cat;
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
