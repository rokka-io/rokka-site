//=include ../liip-styleguide/dist/assets/toolkit/scripts/toolkit.js

console.log("works");

window.addEventListener('DOMContentLoaded', function() {
  var navbar = document.querySelector('.navbar');
  new Toolkit.Navbar(navbar, { mode: 'window' });
});

window.addEventListener('DOMContentLoaded', function() {
  var el = document.querySelector('#section-multiplier');
  new Toolkit.Multiplier(el, '/assets/images/clouds-hero.png');
});

window.addEventListener('DOMContentLoaded', function() {
  var trialbutton = document.querySelector('#trial-button');
  var hero = document.querySelector('.rokka-hero');

  trialbutton.addEventListener('click', function() {
    hero.classList.toggle('rokka-hero--appear');
    window.setTimeout(function() {
      hero.classList.toggle('rokka-hero--animate');
    }, 1200);
  });
});