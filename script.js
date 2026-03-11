// ============================================
// THE TAILOR'S DAUGHTER — SCRIPT
// ============================================

// Preloader
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.classList.add('fade-out');
    document.body.classList.add('loaded');
    setTimeout(() => preloader.style.display = 'none', 800);
  }, 600);
});

// ============================================
// HERO SLIDESHOW
// ============================================
const heroSlides = document.querySelectorAll('.hero-slide');
let currentSlide = 0;

function nextSlide() {
  heroSlides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % heroSlides.length;
  heroSlides[currentSlide].classList.add('active');
}

if (heroSlides.length > 1) {
  setInterval(nextSlide, 5000);
}

// ============================================
// NAVBAR
// ============================================
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  nav.classList.toggle('scrolled', currentScroll > 80);
  nav.classList.toggle('hidden', currentScroll > lastScroll && currentScroll > 400);
  lastScroll = currentScroll;
}, { passive: true });

// Mobile nav
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.classList.toggle('nav-open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.classList.remove('nav-open');
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ============================================
// SCROLL ANIMATIONS (staggered reveals)
// ============================================
const animateElements = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

animateElements.forEach(el => observer.observe(el));

// ============================================
// PARALLAX (GPU-friendly, no blur)
// ============================================
let ticking = false;

function updateParallax() {
  const scroll = window.scrollY;
  const hero = document.querySelector('.hero');

  if (hero && scroll < window.innerHeight) {
    const heroContent = document.querySelector('.hero-content');
    const heroOverlay = document.querySelector('.hero-overlay');
    const progress = scroll / window.innerHeight;

    // Content moves up and fades
    heroContent.style.transform = `translateY(${scroll * 0.25}px)`;
    heroContent.style.opacity = 1 - progress * 1.2;

    // Overlay darkens as you scroll
    heroOverlay.style.background = `linear-gradient(
      to bottom,
      rgba(12,11,9,${0.4 + progress * 0.3}) 0%,
      rgba(12,11,9,${0.55 + progress * 0.3}) 50%,
      rgba(12,11,9,${0.7 + progress * 0.2}) 100%
    )`;
  }

  // Parallax for experience section
  const exp = document.querySelector('.experience');
  if (exp) {
    const rect = exp.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const expBg = exp.querySelector('.experience-bg img');
      const offset = (rect.top / window.innerHeight) * 40;
      expBg.style.transform = `translateY(${offset}px) scale(1.05)`;
    }
  }

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
}, { passive: true });

// ============================================
// PRODUCT CARD TILT EFFECT
// ============================================
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `
      perspective(800px)
      rotateY(${x * 8}deg)
      rotateX(${-y * 8}deg)
      translateY(-8px)
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => card.style.transition = '', 500);
  });
});

// ============================================
// ANIMATED COUNTERS
// ============================================
function animateCounter(el) {
  const text = el.textContent;
  const match = text.match(/^(\d+)(.*)$/);
  if (!match) return;

  const target = parseInt(match[1]);
  const suffix = match[2];
  const duration = 2000;
  const start = performance.now();

  el.textContent = '0' + suffix;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.experience-stats');
if (statsSection) counterObserver.observe(statsSection);

// ============================================
// MAGNETIC BUTTONS
// ============================================
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => btn.style.transition = '', 400);
  });
});

// ============================================
// SPLIT TEXT REVEAL (hero title)
// ============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero-title-line').forEach((line, i) => {
      line.style.transitionDelay = `${0.3 + i * 0.15}s`;
      line.classList.add('revealed');
    });
    document.querySelector('.hero-eyebrow')?.classList.add('revealed');
    setTimeout(() => {
      document.querySelector('.hero-subtitle')?.classList.add('revealed');
    }, 600);
    setTimeout(() => {
      document.querySelector('.hero-cta')?.classList.add('revealed');
    }, 800);
    setTimeout(() => {
      document.querySelector('.hero-scroll')?.classList.add('revealed');
    }, 1200);
  }, 800);
});

// ============================================
// GALLERY IMAGE LIGHTBOX (click to expand)
// ============================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.gallery-item img').forEach(img => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}
if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox?.classList.contains('active')) closeLightbox();
});

// ============================================
// CONTACT FORM
// ============================================
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Message Sent!';
  btn.style.background = '#2d5016';
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});

// ============================================
// ACTIVE NAV ON SCROLL
// ============================================
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 200;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    }
  });
}, { passive: true });

// ============================================
// CURSOR GLOW (desktop only)
// ============================================
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let glowX = 0, glowY = 0, currentX = 0, currentY = 0;

  document.addEventListener('mousemove', e => {
    glowX = e.clientX;
    glowY = e.clientY;
  });

  function animateGlow() {
    currentX += (glowX - currentX) * 0.08;
    currentY += (glowY - currentY) * 0.08;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(animateGlow);
  }

  animateGlow();
}

// ============================================
// SOCIAL ICON MAGNETIC HOVER
// ============================================
document.querySelectorAll('.contact-social a, .footer-social a').forEach(icon => {
  icon.addEventListener('mousemove', e => {
    const rect = icon.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    icon.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) translateY(-3px)`;
  });
  icon.addEventListener('mouseleave', () => {
    icon.style.transform = '';
  });
});
