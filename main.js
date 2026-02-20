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

// Contact form is now powered by FormSpree
// To activate: Sign up free at https://formspree.io and add your form ID to contact.html

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

// ===== HIRE PAGE: Highlight active sidebar section on scroll =====
(function() {
  const navLinks = document.querySelectorAll('.hire-nav-link');
  const sections = document.querySelectorAll('.hire-section');
  if (!navLinks.length || !sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.hire-nav-link[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => observer.observe(s));

  // Smooth scroll for sidebar links
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Pre-fill enquiry form item from URL param
  const params = new URLSearchParams(window.location.search);
  const item = params.get('item');
  const duration = params.get('duration');
  if (item) {
    const msgField = document.getElementById('message');
    const subjectField = document.getElementById('subject');
    if (msgField) {
      const itemName = item.replace(/-/g, ' ').toUpperCase();
      if (duration === 'long') {
        msgField.value = `I would like to enquire about hiring: ${itemName}\n\nRequired duration (longer than 1 week): \nDelivery address: \nRequired from date: `;
      } else {
        msgField.value = `I would like to enquire about hiring: ${itemName}\n\nRequired duration: \nDelivery address: \nRequired from date: `;
      }
    }
  }
})();
