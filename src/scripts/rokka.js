import './vendor/toolkit.js';

// The Liip styleguide bundle attaches itself to window.Toolkit.
const Toolkit = window.Toolkit;

window.addEventListener('DOMContentLoaded', function () {
  var navbar = document.querySelector('.navbar');
  new Toolkit.Navbar(navbar, { mode: 'default' });
});

// The navbar is sticky and ~70px tall, so an anchor jump lands underneath it.
// Nudge the viewport back up on load-with-hash and on every hash change.
window.addEventListener(
  'load',
  function () {
    if (window.location.hash) {
      window.scrollBy(0, -70);
    }
  },
  false
);

window.addEventListener(
  'hashchange',
  function () {
    window.scrollBy(0, -70);
  },
  false
);
