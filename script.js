// ── MOBILE NAV ──
const toggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
toggle.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  toggle.classList.toggle('open');
});
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    toggle.classList.remove('open');
  });
});

// ── NAVBAR SCROLL ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 55);
}, { passive: true });

// ── SCROLL REVEAL ──
const revObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('in'), delay);
      revObs.unobserve(el);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.rv').forEach(el => revObs.observe(el));

// ── HERO CAROUSEL ──
(function initHeroCarousel() {
  const track = document.getElementById('heroTrack');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const dotsContainer = document.getElementById('heroDots');
  if (!track) return;

  const slides = track.querySelectorAll('.hero-carousel-slide');
  let current = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsContainer.appendChild(dot);
  });

  function updateDots() {
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? goTo(current + 1) : goTo(current - 1); resetAuto(); }
  });

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 3000); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  startAuto();
  const carousel = track.closest('.hero-carousel');
  carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carousel.addEventListener('mouseleave', startAuto);
})();

// ── LIGHTBOX ──
const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lbImg');
const lbClose    = document.getElementById('lbClose');
const lbPrev     = document.getElementById('lbPrev');
const lbNext     = document.getElementById('lbNext');
const lbCounter  = document.getElementById('lbCounter');
let lbImages = [];
let lbIndex  = 0;

function openLightbox(src, imageList) {
  lbImages = imageList || [{ src, alt: '' }];
  lbIndex = lbImages.findIndex(img => img.src === src);
  if (lbIndex < 0) lbIndex = 0;
  showLbImage(lbIndex);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function showLbImage(idx) {
  if (idx < 0) idx = lbImages.length - 1;
  if (idx >= lbImages.length) idx = 0;
  lbIndex = idx;
  lbImg.style.cssText = 'opacity:0;transform:scale(.94);transition:none';
  setTimeout(() => {
    lbImg.src = lbImages[idx].src;
    lbImg.alt = lbImages[idx].alt || '';
    lbImg.onload = () => {
      lbImg.style.cssText = 'opacity:1;transform:scale(1);transition:opacity .35s,transform .35s';
    };
  }, 60);
  lbCounter.textContent = (idx + 1) + ' / ' + lbImages.length;
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; }, 300);
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => showLbImage(lbIndex - 1));
lbNext.addEventListener('click', () => showLbImage(lbIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showLbImage(lbIndex - 1);
  if (e.key === 'ArrowRight') showLbImage(lbIndex + 1);
});

// ── CARD SLIDER FACTORY ──
function createCardSlider({ trackId, prevId, nextId, dotsId, barId, interval }) {
  const track     = document.getElementById(trackId);
  const prevBtn   = document.getElementById(prevId);
  const nextBtn   = document.getElementById(nextId);
  const dotsCont  = document.getElementById(dotsId);
  const bar       = document.getElementById(barId);
  if (!track) return;

  const slides   = Array.from(track.querySelectorAll('.card-slide'));
  const total    = slides.length;
  let current    = 0;   // index of leftmost visible card
  let autoTimer  = null;
  const GAP      = 20;  // must match CSS gap

  /* ── how many cards fit right now ── */
  function perView() {
    const w = window.innerWidth;
    if (w <= 600) return 1;
    if (w <= 960) return 2;
    return 3;
  }

  /* max starting index so last page is full */
  function maxIndex() { return Math.max(0, total - perView()); }

  /* ── build dots (one per "page") ── */
  function buildDots() {
    dotsCont.innerHTML = '';
    const pv    = perView();
    const pages = Math.ceil(total / pv);
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Page ' + (i + 1));
      d.addEventListener('click', () => { goTo(i * pv); resetAuto(); });
      dotsCont.appendChild(d);
    }
  }

  function syncDots() {
    const pv   = perView();
    const page = Math.floor(current / pv);
    dotsCont.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === page);
    });
  }

  /* ── translate track so `current` card is at left edge ── */
  function render() {
    // each card width = (viewport – gaps) / perView
    const viewport = track.parentElement.clientWidth;
    const pv       = perView();
    const cardW    = (viewport - GAP * (pv - 1)) / pv;
    const offset   = current * (cardW + GAP);
    track.style.transform = `translateX(-${offset}px)`;
    syncDots();
    // show/hide buttons
    prevBtn.style.opacity = current === 0 ? '0.35' : '1';
    nextBtn.style.opacity = current >= maxIndex() ? '0.35' : '1';
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    render();
  }

  function next() { goTo(current >= maxIndex() ? 0 : current + 1); }
  function prev() { goTo(current === 0 ? maxIndex() : current - 1); }

  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  /* ── touch / swipe ── */
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 44) { diff > 0 ? next() : prev(); resetAuto(); }
  });

  /* ── keyboard ── */
  track.closest('.card-slider').setAttribute('tabindex', '0');
  track.closest('.card-slider').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });

  /* ── click card → lightbox ── */
  const lbList = slides.map(s => ({
    src: s.dataset.src || s.querySelector('img')?.src || '',
    alt: s.querySelector('img')?.alt || ''
  }));
  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      const src = slide.dataset.src || slide.querySelector('img')?.src;
      if (src) openLightbox(src, lbList);
    });
  });

  /* ── progress bar ── */
  function startBar() {
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.transition = `width ${interval}ms linear`;
        bar.style.width = '100%';
      });
    });
  }

  function startAuto() {
    startBar();
    autoTimer = setInterval(() => { next(); startBar(); }, interval);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; }
    startAuto();
  }

  /* ── pause on hover ── */
  const container = track.closest('.card-slider');
  container.addEventListener('mouseenter', () => {
    clearInterval(autoTimer);
    if (bar) bar.style.animationPlayState = 'paused';
  });
  container.addEventListener('mouseleave', resetAuto);

  /* ── resize: recalc without jumping ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      current = Math.min(current, maxIndex());
      buildDots();
      render();
    }, 120);
  });

  buildDots();
  render();
  startAuto();
}

// ── INIT SLIDERS ──
createCardSlider({ trackId:'booksTrack',  prevId:'booksPrev',  nextId:'booksNext',  dotsId:'booksDots',  barId:'booksBar',  interval:3000 });
createCardSlider({ trackId:'toysTrack',   prevId:'toysPrev',   nextId:'toysNext',   dotsId:'toysDots',   barId:'toysBar',   interval:3000 });
createCardSlider({ trackId:'chartsTrack', prevId:'chartsPrev', nextId:'chartsNext', dotsId:'chartsDots', barId:'chartsBar', interval:3000 });

// ── CONSULTANCY GALLERY LIGHTBOX ──
const consultImgs = document.querySelectorAll('.consult-gallery img');
const consultList = Array.from(consultImgs).map(img => ({ src: img.src, alt: img.alt }));
consultImgs.forEach(img => {
  img.addEventListener('click', () => openLightbox(img.src, consultList));
});

// ── CONTACT FORM ──
document.querySelector('.btn-form').addEventListener('click', function () {
  const inputs = this.closest('.contact-form-card').querySelectorAll('input, textarea');
  let valid = true;
  inputs.forEach(inp => {
    if (!inp.value.trim()) {
      inp.style.borderColor = '#f5813f';
      inp.style.background  = 'rgba(245,129,63,.08)';
      valid = false;
    } else {
      inp.style.borderColor = '';
      inp.style.background  = '';
    }
  });
  if (valid) {
    this.textContent = '✓ Message Sent!';
    this.style.background = '#3da668';
    inputs.forEach(inp => inp.value = '');
    setTimeout(() => {
      this.textContent = 'Send Message →';
      this.style.background = '';
    }, 3000);
  }
});