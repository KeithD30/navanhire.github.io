// ===================================
// NHH WEBSITE — MAIN JAVASCRIPT
// ===================================

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    hamburger.innerHTML = mobileNav.classList.contains('open') ? '✕' : '&#9776;';
  });
}

// Close mobile nav when a link is clicked
if (mobileNav) {
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.innerHTML = '&#9776;';
    });
  });
}

// Contact form handler (demo — shows success message)
function handleSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form && success) {
    form.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
    form.querySelector('button[type=submit]').style.display = 'none';
    success.style.display = 'block';
  }
}

// Scroll reveal animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .product-card, .access-card, .stat, .hire-item, .category-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  observer.observe(el);
});

// Sticky header shadow on scroll
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (header) {
    header.style.boxShadow = window.scrollY > 10
      ? '0 4px 24px rgba(0,0,0,0.14)'
      : '0 2px 12px rgba(0,0,0,0.08)';
  }
});
