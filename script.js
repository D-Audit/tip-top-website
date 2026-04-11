// ── WHATSAPP NUMBERS ──
const WA_RWANDA = '250788252005';
const WA_UGANDA = '256706438476';

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
(function () {
  const track = document.getElementById('heroTrack');
  const dotsContainer = document.getElementById('heroDots');
  if (!track) return;
  const slides = track.querySelectorAll('.hero-carousel-slide');
  let current = 0, autoTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsContainer.appendChild(dot);
  });

  function updateDots() {
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }
  function goTo(i) {
    current = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
  }

  document.getElementById('heroPrev').addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  document.getElementById('heroNext').addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? goTo(current + 1) : goTo(current - 1); resetAuto(); }
  });

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 3000); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }
  startAuto();
  const c = track.closest('.hero-carousel');
  c.addEventListener('mouseenter', () => clearInterval(autoTimer));
  c.addEventListener('mouseleave', startAuto);
})();

// ── LIGHTBOX ──
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCounter = document.getElementById('lbCounter');
let lbImages = [], lbIndex = 0;

function openLightbox(src, imageList) {
  if (!lightbox || !lbImg || !lbCounter) return;
  lbImages = imageList || [{ src, alt: '' }];
  lbIndex = lbImages.findIndex(img => img.src === src);
  if (lbIndex < 0) lbIndex = 0;
  showLbImage(lbIndex);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function showLbImage(idx) {
  if (!lbImg || !lbCounter) return;
  if (idx < 0) idx = lbImages.length - 1;
  if (idx >= lbImages.length) idx = 0;
  lbIndex = idx;
  lbImg.style.cssText = 'opacity:0;transform:scale(.94);transition:none';
  setTimeout(() => {
    lbImg.src = lbImages[idx].src;
    lbImg.onload = () => { lbImg.style.cssText = 'opacity:1;transform:scale(1);transition:opacity .35s,transform .35s'; };
  }, 60);
  lbCounter.textContent = (idx + 1) + ' / ' + lbImages.length;
}
function closeLightbox() {
  if (!lightbox || !lbImg) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; }, 300);
}

const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
if (lbClose) lbClose.addEventListener('click', closeLightbox);
if (lbPrev) lbPrev.addEventListener('click', () => showLbImage(lbIndex - 1));
if (lbNext) lbNext.addEventListener('click', () => showLbImage(lbIndex + 1));
if (lightbox) {
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
}
document.addEventListener('keydown', e => {
  if (!lightbox || !lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showLbImage(lbIndex - 1);
  if (e.key === 'ArrowRight') showLbImage(lbIndex + 1);
});

// ── CARD SLIDER FACTORY ──
function createCardSlider({ trackId, prevId, nextId, dotsId, barId, interval }) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  const dotsCont = document.getElementById(dotsId);
  const bar = document.getElementById(barId);
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.card-slide'));
  const total = slides.length;
  let current = 0, autoTimer;
  const GAP = 20;

  function perView() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 960) return 2;
    return 3;
  }
  function maxIndex() { return Math.max(0, total - perView()); }

  function buildDots() {
    dotsCont.innerHTML = '';
    const pv = perView();
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
    const pv = perView();
    const page = Math.floor(current / pv);
    dotsCont.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === page));
  }

  function render() {
    const viewport = track.parentElement.clientWidth;
    const pv = perView();
    const cardW = (viewport - GAP * (pv - 1)) / pv;
    const offset = current * (cardW + GAP);
    track.style.transform = `translateX(-${offset}px)`;
    syncDots();
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

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 44) { diff > 0 ? next() : prev(); resetAuto(); }
  });

  track.closest('.card-slider').setAttribute('tabindex', '0');
  track.closest('.card-slider').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });

  const lbList = slides.map(s => ({
    src: s.dataset.src || s.querySelector('img')?.src || '',
    alt: s.querySelector('img')?.alt || ''
  }));
  slides.forEach(slide => {
    const imgWrap = slide.querySelector('.card-img-wrap');
    if (imgWrap) {
      imgWrap.addEventListener('click', () => {
        const src = slide.dataset.src || slide.querySelector('img')?.src;
        if (src) openLightbox(src, lbList);
      });
      imgWrap.style.cursor = 'zoom-in';
    }
  });

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

  function startAuto() { startBar(); autoTimer = setInterval(() => { next(); startBar(); }, interval); }
  function resetAuto() {
    clearInterval(autoTimer);
    if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; }
    startAuto();
  }

  const container = track.closest('.card-slider');
  container.addEventListener('mouseenter', () => clearInterval(autoTimer));
  container.addEventListener('mouseleave', resetAuto);

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

createCardSlider({ trackId:'booksTrack',  prevId:'booksPrev',  nextId:'booksNext',  dotsId:'booksDots',  barId:'booksBar',  interval:3500 });
createCardSlider({ trackId:'toysTrack',   prevId:'toysPrev',   nextId:'toysNext',   dotsId:'toysDots',   barId:'toysBar',   interval:3500 });
createCardSlider({ trackId:'chartsTrack', prevId:'chartsPrev', nextId:'chartsNext', dotsId:'chartsDots', barId:'chartsBar', interval:3500 });

// ── CONSULTANCY LIGHTBOX ──
const consultImgs = document.querySelectorAll('.consult-gallery img');
const consultList = Array.from(consultImgs).map(img => ({ src: img.src, alt: img.alt }));
consultImgs.forEach(img => img.addEventListener('click', () => openLightbox(img.src, consultList)));

// ══════════════════════════════════════
//  ORDER MODAL
// ══════════════════════════════════════
const orderOverlay  = document.getElementById('orderOverlay');
const orderForm     = document.getElementById('orderForm');
const orderSuccess  = document.getElementById('orderSuccess');
const qtyInput      = document.getElementById('of-qty');

function openOrder(btn) {
  const slide = btn.closest('.card-slide');
  const name  = slide?.dataset.name  || '';
  const cat   = slide?.dataset.cat   || '';
  const desc  = slide?.dataset.desc  || '';
  const src   = slide?.dataset.src   || slide?.querySelector('img')?.src || '';

  document.getElementById('modalProductImg').src  = src;
  document.getElementById('modalProductName').textContent = name;
  document.getElementById('modalProductCat').textContent  = cat;
  document.getElementById('modalProductDesc').textContent = desc;
  document.getElementById('of-product').value = name;
  qtyInput.value = 1;

  orderForm.style.display = '';
  orderSuccess.style.display = 'none';
  clearErrors();

  orderOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openCustomOrder() {
  document.getElementById('modalProductImg').src = 'https://res.cloudinary.com/nrob/image/upload/f_auto,q_auto,w_500/v1685521829/tip%20top%20consultancy/zmyn7wtr7yauhd8f1bow.jpg';
  document.getElementById('modalProductName').textContent = 'Custom Order';
  document.getElementById('modalProductCat').textContent  = 'Any Product';
  document.getElementById('modalProductDesc').textContent = 'Describe any product you want in the form — we\'ll source it and deliver it to you!';
  document.getElementById('of-product').value = 'Custom / Not listed';
  qtyInput.value = 1;

  orderForm.style.display = '';
  orderSuccess.style.display = 'none';
  clearErrors();

  orderOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOrder() {
  orderOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

const orderCloseButton = document.getElementById('orderClose');
const successCloseButton = document.getElementById('successClose');
if (orderCloseButton) orderCloseButton.addEventListener('click', closeOrder);
if (successCloseButton) successCloseButton.addEventListener('click', closeOrder);
if (orderOverlay) {
  orderOverlay.addEventListener('click', e => { if (e.target === orderOverlay) closeOrder(); });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && orderOverlay?.classList.contains('active')) closeOrder(); });

const qtyMinusBtn = document.getElementById('qtyMinus');
const qtyPlusBtn  = document.getElementById('qtyPlus');
if (qtyMinusBtn) qtyMinusBtn.addEventListener('click', () => {
  const v = parseInt(qtyInput.value) || 1;
  if (v > 1) qtyInput.value = v - 1;
});
if (qtyPlusBtn) qtyPlusBtn.addEventListener('click', () => {
  const v = parseInt(qtyInput.value) || 1;
  if (v < 99) qtyInput.value = v + 1;
});

function setError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '#e06520';
  el.style.background  = '#fff8f5';
}
function clearError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '';
  el.style.background  = '';
}
function clearErrors() {
  ['of-fname','of-lname','of-phone','of-whatsapp','of-country','of-address','of-product'].forEach(clearError);
}

const orderSubmitBtn = document.getElementById('orderSubmit');
if (orderSubmitBtn) {
  orderSubmitBtn.addEventListener('click', () => {
    const fname    = document.getElementById('of-fname').value.trim();
    const lname    = document.getElementById('of-lname').value.trim();
    const phone    = document.getElementById('of-phone').value.trim();
    const whatsapp = document.getElementById('of-whatsapp').value.trim();
    const country  = document.getElementById('of-country').value;
    const address  = document.getElementById('of-address').value.trim();
    const product  = document.getElementById('of-product').value.trim();
    const qty      = document.getElementById('of-qty').value || '1';
    const extra    = document.getElementById('of-extra').value.trim();

    clearErrors();
    let valid = true;
    if (!fname)    { setError('of-fname');    valid = false; }
    if (!lname)    { setError('of-lname');    valid = false; }
    if (!phone)    { setError('of-phone');    valid = false; }
    if (!whatsapp) { setError('of-whatsapp'); valid = false; }
    if (!country)  { setError('of-country');  valid = false; }
    if (!address)  { setError('of-address');  valid = false; }
    if (!product)  { setError('of-product');  valid = false; }
    if (!valid) return;

    const waNumber = country === 'Uganda' ? WA_UGANDA : WA_RWANDA;
    let msg = `🛒 *NEW ORDER — Tip Top Consultancy*\n\n`;
    msg += `📦 *Product:* ${product}\n`;
    msg += `🔢 *Quantity:* ${qty}\n`;
    msg += `\n👤 *Customer Name:* ${fname} ${lname}\n`;
    msg += `📞 *Phone:* ${phone}\n`;
    msg += `💬 *WhatsApp:* ${whatsapp}\n`;
    msg += `🌍 *Country:* ${country}\n`;
    msg += `📍 *Delivery Address:* ${address}\n`;
    if (extra) {
      msg += `\n📝 *Additional Request:*\n${extra}\n`;
    }
    msg += `\n🚚 *Delivery:* FREE\n`;
    msg += `\n_Sent from tiptop-website.vercel.app_`;

    const encoded = encodeURIComponent(msg);
    const waURL   = `https://wa.me/${waNumber}?text=${encoded}`;

    orderForm.style.display = 'none';
    orderSuccess.style.display = 'flex';
    orderSuccess.style.flexDirection = 'column';

    window.open(waURL, '_blank');
  });
}

// ── CONTACT FORM ──
const contactButton = document.querySelector('.btn-form');
if (contactButton) {
  contactButton.addEventListener('click', function () {
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
      setTimeout(() => { this.textContent = 'Send Message →'; this.style.background = ''; }, 3000);
    }
  });
}