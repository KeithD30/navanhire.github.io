/* =============================================
   NHH SHARED COMPONENTS
   Injects header, topbar, footer from one source
   so changes only need to be made once.
   ============================================= */

(function () {
  'use strict';

  // Determine active page from filename
  var path = window.location.pathname;
  var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  function navLink(href, label) {
    var cls = 'nav-link';
    if (page === href) cls += ' active';
    return '<a href="' + href + '" class="' + cls + '">' + label + '</a>';
  }

  // ── TOPBAR ──
  var topbarHTML = [
    '<div class="container topbar-inner">',
    '  <span><i data-lucide="phone" class="topbar-icon"></i> <a href="tel:0469022535">046 902 2535</a></span>',
    '  <span><i data-lucide="clock" class="topbar-icon"></i> Mon&ndash;Fri: 7am&ndash;5pm &nbsp;|&nbsp; Sat: 8:30am&ndash;1pm</span>',
    '  <span><i data-lucide="map-pin" class="topbar-icon"></i> Kells Road, Navan, Co. Meath</span>',
    '</div>'
  ].join('\n');

  // ── HEADER ──
  var headerHTML = [
    '<div class="container header-inner">',
    '  <a href="index.html" class="logo">',
    '    <img src="logo.svg" alt="Navan Hire &amp; Hardware" class="logo-img"/>',
    '  </a>',
    '  <nav class="nav">',
    '    ' + navLink('index.html', 'Home'),
    '    ' + navLink('hardware.html', 'Hardware &amp; DIY'),
    '    ' + navLink('telehandlers.html', 'Telehandlers'),
    '    ' + navLink('hire.html', 'Plant &amp; Tool Hire'),
    '    ' + navLink('powered-access.html', 'Access &amp; Spider Lifts'),
    '  </nav>',
    '  <div class="nhh-search-wrap">',
    '    <input type="search" id="nhhSearch" class="nhh-search-input" placeholder="Search equipment..." autocomplete="off" spellcheck="false"/>',
    '    <span class="nhh-search-icon"><i data-lucide="search"></i></span>',
    '    <div class="nhh-search-results" id="nhhSearchResults"></div>',
    '  </div>',
    '  <a href="contact.html" class="btn btn-white header-cta">Get a Quote</a>',
    '  <a href="account.html" class="nhh-account-btn" title="Trade Login / Apply" aria-label="Account">',
    '    <i data-lucide="user"></i>',
    '  </a>',
    '  <button class="hamburger" id="hamburger" aria-label="Open menu"><i data-lucide="menu"></i></button>',
    '</div>',
    '<div class="mobile-nav" id="mobileNav">',
    '  <a href="index.html">Home</a>',
    '  <a href="hardware.html">Hardware &amp; DIY</a>',
    '  <a href="telehandlers.html">Telehandlers</a>',
    '  <a href="hire.html">Plant &amp; Tool Hire</a>',
    '  <a href="powered-access.html">Access &amp; Spider Lifts</a>',
    '  <a href="contact.html">Get a Quote</a>',
    '  <div class="mobile-search-wrap">',
    '    <input type="search" id="nhhSearchMob" class="nhh-search-input" placeholder="Search all equipment..." autocomplete="off" spellcheck="false"/>',
    '    <div class="nhh-search-results" id="nhhSearchResultsMob"></div>',
    '  </div>',
    '</div>'
  ].join('\n');

  // ── FOOTER ──
  var footerHTML = [
    '<div class="container footer-grid">',
    '  <div class="footer-col">',
    '    <img src="logo-footer.svg" alt="Navan Hire &amp; Hardware" class="footer-logo-img"/>',
    '    <p style="margin-top:14px;color:rgba(255,255,255,0.7)">Whistlemount, Kells Road<br>Navan, Co. Meath, C15 FX6Y</p>',
    '    <p><a href="tel:0469022535" style="color:#fff">046 902 2535</a></p>',
    '    <p><a href="mailto:hiredesk@nhh.ie" style="color:rgba(255,255,255,0.7)">hiredesk@nhh.ie</a></p>',
    '  </div>',
    '  <div class="footer-col">',
    '    <h4>Hire</h4>',
    '    <ul>',
    '      <li><a href="fleet.html">Hire Fleet</a></li>',
    '      <li><a href="hire.html">Plant &amp; Tool Hire</a></li>',
    '      <li><a href="powered-access.html">Access &amp; Spider Lifts</a></li>',
    '      <li><a href="telehandlers.html">Telehandlers</a></li>',
    '    </ul>',
    '  </div>',
    '  <div class="footer-col">',
    '    <h4>Company</h4>',
    '    <ul>',
    '      <li><a href="hardware.html">Hardware &amp; DIY</a></li>',
    '      <li><a href="contact.html">Contact Us</a></li>',
    '      <li><a href="account.html">Trade Account</a></li>',
    '    </ul>',
    '  </div>',
    '  <div class="footer-col">',
    '    <h4>Opening Hours</h4>',
    '    <p style="color:rgba(255,255,255,0.7)">Mon&ndash;Fri: 7:00am &ndash; 5:00pm<br>Saturday: 8:30am &ndash; 1:00pm<br>Sunday: Closed</p>',
    '    <div class="social-links">',
    '      <a href="https://www.facebook.com/NavanHireHardware" target="_blank" rel="noopener" aria-label="Facebook"><i data-lucide="facebook"></i></a>',
    '      <a href="https://www.instagram.com/navanhirehardware" target="_blank" rel="noopener" aria-label="Instagram"><i data-lucide="instagram"></i></a>',
    '      <a href="https://www.linkedin.com/company/navan-hire-hardware" target="_blank" rel="noopener" aria-label="LinkedIn"><i data-lucide="linkedin"></i></a>',
    '    </div>',
    '  </div>',
    '</div>',
    '<div class="footer-bottom">',
    '  <div class="container">',
    '    <p>&copy; 2026 Navan Hire &amp; Hardware. All rights reserved. | 100% Irish Owned</p>',
    '  </div>',
    '</div>'
  ].join('\n');

  // ── INJECT ──
  var topbar = document.querySelector('.topbar[data-component]');
  var header = document.querySelector('.header[data-component]');
  var footer = document.querySelector('.footer[data-component]');

  if (topbar) topbar.innerHTML = topbarHTML;
  if (header) header.innerHTML = headerHTML;
  if (footer) footer.innerHTML = footerHTML;

})();
