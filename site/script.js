// Mobile-Navigation
var toggle = document.getElementById('nav-toggle');
var nav = document.getElementById('main-nav');

toggle.addEventListener('click', function () {
  var open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.lastChild.textContent = open ? 'Schließen' : 'Menü';
});

nav.addEventListener('click', function (e) {
  if (e.target.tagName === 'A' && nav.classList.contains('is-open')) {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.lastChild.textContent = 'Menü';
  }
});

// Ortszeit Gelsenkirchen im Footer
var clock = document.getElementById('clock');

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin'
  }).format(new Date()) + ' Uhr';
}

updateClock();
setInterval(updateClock, 30000);

// Live-Öffnungsstatus der Standorte (Ampel grün/gelb/rot)
// Öffnungszeiten in Minuten seit Mitternacht, Index = Wochentag (0 = So … 6 = Sa)
var OPENING_HOURS = {
  0: null,          // Sonntag geschlossen
  1: [480, 1050],   // Mo  8:00 bis 17:30
  2: [480, 1050],
  3: [480, 1050],
  4: [480, 1050],
  5: [480, 1050],
  6: [540, 780]     // Sa  9:00 bis 13:00
};
var WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

function fmtTime(mins) {
  var h = Math.floor(mins / 60);
  var m = mins % 60;
  return h + ':' + (m < 10 ? '0' + m : m);
}

function nextOpening(day, mins) {
  // Nächste Öffnung ab jetzt suchen (bis zu 7 Tage voraus)
  for (var i = 0; i < 8; i++) {
    var d = (day + i) % 7;
    var range = OPENING_HOURS[d];
    if (!range) continue;
    if (i === 0 && mins >= range[0]) continue; // heute schon nach Öffnung
    var label = i === 0 ? 'heute' : (i === 1 ? 'morgen' : WEEKDAYS[d]);
    return label + ' ' + fmtTime(range[0]) + ' Uhr';
  }
  return null;
}

function openingStatus() {
  // Aktuelle Zeit in Europe/Berlin (DST-sicher über toLocaleString)
  var berlin = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
  var day = berlin.getDay();
  var mins = berlin.getHours() * 60 + berlin.getMinutes();
  var range = OPENING_HOURS[day];

  if (range && mins >= range[0] && mins < range[1]) {
    var remaining = range[1] - mins;
    if (remaining <= 30) {
      return { state: 'is-soon', text: 'Schließt in ' + remaining + ' Min' };
    }
    return { state: 'is-open', text: 'Jetzt geöffnet · bis ' + fmtTime(range[1]) + ' Uhr' };
  }

  // Geschlossen, öffnet es heute noch?
  if (range && mins < range[0]) {
    var until = range[0] - mins;
    if (until <= 60) {
      return { state: 'is-soon', text: 'Öffnet in ' + until + ' Min' };
    }
  }

  var next = nextOpening(day, mins);
  return { state: 'is-closed', text: next ? 'Geschlossen · öffnet ' + next : 'Geschlossen' };
}

function updateLocationStatus() {
  var badges = document.querySelectorAll('.loc-status');
  if (!badges.length) return;
  var s = openingStatus();
  badges.forEach(function (badge) {
    badge.classList.remove('is-open', 'is-soon', 'is-closed');
    badge.classList.add(s.state);
    var text = badge.querySelector('.loc-status-text');
    if (text) text.textContent = s.text;
  });
}

updateLocationStatus();
setInterval(updateLocationStatus, 60000);

// Scroll-Reveal (respektiert prefers-reduced-motion via CSS)
var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(function (el) {
  observer.observe(el);
});

// Hero: Kategorien nacheinander rot hervorheben
var rotWords = document.querySelectorAll('#hero-title .rot-word');
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (rotWords.length && !reduceMotion) {
  var rotIndex = 0;
  rotWords[0].classList.add('is-active');
  setInterval(function () {
    rotWords[rotIndex].classList.remove('is-active');
    rotIndex = (rotIndex + 1) % rotWords.length;
    rotWords[rotIndex].classList.add('is-active');
  }, 1300);
} else if (rotWords.length) {
  // Ohne Bewegung: alle Kategorien dezent hervorheben
  rotWords.forEach(function (w) { w.classList.add('is-active'); });
}

// Kontaktformular
var form = document.getElementById('contact-form');

if (form) {
  var statusEl = document.getElementById('form-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.style.color = '';

    // Pflichtfelder prüfen
    var invalid = null;
    ['cf-name', 'cf-email', 'cf-message'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el.value.trim() && !invalid) invalid = el;
    });
    var email = document.getElementById('cf-email');
    if (!invalid && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      invalid = email;
    }
    if (invalid) {
      statusEl.textContent = 'Bitte Name, eine gültige E-Mail-Adresse und eine Nachricht angeben.';
      invalid.focus();
      return;
    }

    var data = {
      Name: form.name.value.trim(),
      Betrieb: form.betrieb.value.trim(),
      'E-Mail': form.email.value.trim(),
      Telefon: form.telefon.value.trim(),
      Anliegen: form.anliegen.value,
      Nachricht: form.nachricht.value.trim()
    };

    var endpoint = form.getAttribute('data-endpoint');

    function done() {
      form.reset();
      statusEl.style.color = '#3b6331';
      statusEl.textContent = 'Danke! Ihre Anfrage ist unterwegs, wir melden uns zeitnah zurück.';
    }

    // Serverseitiger Versand, falls ein Endpoint hinterlegt ist
    if (endpoint) {
      statusEl.textContent = 'Wird gesendet …';
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok) { done(); }
        else { throw new Error('bad status'); }
      }).catch(function () {
        statusEl.style.color = '';
        statusEl.textContent = 'Senden fehlgeschlagen. Bitte rufen Sie uns an: 0209 8 00 05-0.';
      });
      return;
    }

    // Fallback ohne Backend: vorausgefüllte E-Mail öffnen
    var lines = Object.keys(data).filter(function (k) { return data[k]; })
      .map(function (k) { return k + ': ' + data[k]; });
    var mail = form.getAttribute('data-mailto');
    var subject = 'Anfrage über die Website: ' + data.Anliegen;
    var href = 'mailto:' + mail +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    window.location.href = href;
    done();
  });
}
