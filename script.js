// ─── MOBILE NAV ───
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

// ─── NAVBAR SCROLL ───
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// ─── SCROLL FADE-UP ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in'), i * 70);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ─── LIGHTBOX ───
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
const lbCounter = document.getElementById('lbCounter');

let allImages = [];
let currentIdx = 0;

function buildImageList() {
  allImages = [];
  document.querySelectorAll('.gallery-item img, .consult-gallery img, .hero-mosaic-item img').forEach(img => {
    allImages.push({ src: img.src.replace('/upload/', '/upload/q_auto,f_auto/'), alt: img.alt });
  });
}

function openLightbox(src, idx) {
  buildImageList();
  currentIdx = allImages.findIndex(i => i.src === src || i.src.includes(src.split('/upload/')[1]));
  if (currentIdx < 0) currentIdx = idx || 0;
  showLightboxImg(currentIdx);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function showLightboxImg(idx) {
  if (idx < 0) idx = allImages.length - 1;
  if (idx >= allImages.length) idx = 0;
  currentIdx = idx;
  lbImg.src = '';
  lbImg.src = allImages[idx].src;
  lbImg.alt = allImages[idx].alt;
  lbCounter.textContent = (idx + 1) + ' / ' + allImages.length;
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  lbImg.src = '';
}

// Click on gallery items
document.querySelectorAll('.gallery-item, .hero-mosaic-item').forEach((item, idx) => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    openLightbox(img.src, idx);
  });
});

// Click on consultancy images
document.querySelectorAll('.consult-gallery img').forEach((img, idx) => {
  img.addEventListener('click', () => openLightbox(img.src, idx));
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => showLightboxImg(currentIdx - 1));
lbNext.addEventListener('click', () => showLightboxImg(currentIdx + 1));

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showLightboxImg(currentIdx - 1);
  if (e.key === 'ArrowRight') showLightboxImg(currentIdx + 1);
});

// ─── CONTACT FORM ───
document.querySelector('.btn-form').addEventListener('click', function() {
  const inputs = this.closest('.contact-form-card').querySelectorAll('input, textarea');
  let valid = true;
  inputs.forEach(inp => {
    if (!inp.value.trim()) { inp.style.borderColor = '#f5813f'; valid = false; }
    else inp.style.borderColor = '';
  });
  if (valid) {
    this.textContent = '✓ Message Sent!';
    this.style.background = '#3da668';
    setTimeout(() => { this.textContent = 'Send Message →'; this.style.background = ''; }, 3000);
  }
});