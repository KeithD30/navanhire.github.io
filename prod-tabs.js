// ── SHARED PRODUCT TABS ENGINE ──────────────────────────────────────────────
// Injected into telehandlers.html, hire.html, powered-access.html
// Usage: NHH_TABS.render(slug, containerEl, prefix)

window.NHH_TABS = (function() {

  // Built-in machine specs per slug (add more here as needed)
  var SPECS = {
    // ── Telehandlers ──────────────────────────────────────────────────────────
    'manitou-mrt-2150-plus-360-roto':   { 'Max Lift Height': '20.9 m', 'Max Lift Capacity': '3,500 kg', 'Capacity at Max Height': '1,000 kg', 'Engine': 'Deutz 74 kW', 'Drive': '4WD', 'Width': '2.35 m', 'Weight': '14,100 kg' },
    'merlo-roto-30-16':                 { 'Max Lift Height': '15.6 m', 'Max Lift Capacity': '3,000 kg', 'Capacity at Max Height': '1,200 kg', 'Engine': 'Perkins 74 kW', 'Drive': '4WD', 'Width': '2.25 m', 'Weight': '10,800 kg' },
    'manitou-mt-932-straight':          { 'Max Lift Height': '8.6 m', 'Max Lift Capacity': '3,200 kg', 'Capacity at Max Height': '1,800 kg', 'Engine': 'Deutz 55 kW', 'Drive': '4WD', 'Width': '2.25 m', 'Weight': '7,800 kg' },
    'manitou-mt-1440-straight':         { 'Max Lift Height': '13.5 m', 'Max Lift Capacity': '4,000 kg', 'Capacity at Max Height': '2,200 kg', 'Engine': 'Deutz 74 kW', 'Drive': '4WD', 'Width': '2.35 m', 'Weight': '9,400 kg' },
    // ── Access ────────────────────────────────────────────────────────────────
    'genie-z-45-25j-diesel-boom':       { 'Platform Height': '15.72 m', 'Horizontal Reach': '7.72 m', 'Capacity': '227 kg', 'Drive': '4WD', 'Width': '2.29 m', 'Weight': '7,257 kg', 'Fuel': 'Diesel' },
    'genie-z-60-37-diesel-boom':        { 'Platform Height': '18.29 m', 'Horizontal Reach': '11.27 m', 'Capacity': '272 kg', 'Drive': '4WD', 'Width': '2.49 m', 'Weight': '10,024 kg', 'Fuel': 'Diesel' },
    'genie-s-65-diesel-boom':           { 'Platform Height': '20.17 m', 'Horizontal Reach': '16.76 m', 'Capacity': '272 kg', 'Drive': '4WD', 'Width': '2.49 m', 'Weight': '11,340 kg', 'Fuel': 'Diesel' },
    'genie-gs-1932-electric-scissor':   { 'Platform Height': '5.79 m', 'Platform Size': '0.76 × 1.83 m', 'Capacity': '227 kg', 'Drive': '2WD', 'Width': '0.76 m', 'Weight': '1,247 kg', 'Fuel': 'Electric' },
    'genie-gs-2632-electric-scissor':   { 'Platform Height': '7.79 m', 'Platform Size': '0.81 × 1.83 m', 'Capacity': '227 kg', 'Drive': '2WD', 'Width': '0.81 m', 'Weight': '1,497 kg', 'Fuel': 'Electric' },
    'genie-gs-3232-electric-scissor':   { 'Platform Height': '9.75 m', 'Platform Size': '0.81 × 2.26 m', 'Capacity': '350 kg', 'Drive': '2WD', 'Width': '0.81 m', 'Weight': '2,063 kg', 'Fuel': 'Electric' },
  };

  function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function isAdmin() {
    return window.location.search.indexOf('admin=1') !== -1;
  }

  function storageKey(slug, type) {
    return 'nhh:' + type + ':' + slug;
  }

  async function getSpecs(slug) {
    // Merge built-in + stored overrides
    var base = SPECS[slug] || {};
    try {
      var r = await window.storage.get(storageKey(slug, 'specs'));
      if (r && r.value) {
        var stored = JSON.parse(r.value);
        return Object.assign({}, base, stored);
      }
    } catch(e) {}
    return base;
  }

  async function saveSpecs(slug, obj) {
    await window.storage.set(storageKey(slug, 'specs'), JSON.stringify(obj));
  }

  async function getDownloads(slug) {
    try {
      var r = await window.storage.get(storageKey(slug, 'downloads'));
      if (r && r.value) return JSON.parse(r.value);
    } catch(e) {}
    return [];
  }

  async function saveDownloads(slug, arr) {
    await window.storage.set(storageKey(slug, 'downloads'), JSON.stringify(arr));
  }

  function buildSpecsDisplay(slug, specs, container) {
    var rows = Object.keys(specs);
    var html = '<div class="pt-specs">';
    if (rows.length === 0) {
      html += '<p class="pt-empty">No specifications on file yet.</p>';
    } else {
      html += '<table class="pt-spec-table">';
      rows.forEach(function(k) {
        html += '<tr><th>' + k + '</th><td>' + specs[k] + '</td></tr>';
      });
      html += '</table>';
    }
    if (isAdmin()) {
      html += '<div class="pt-admin-block" id="pt-spec-admin-' + slug + '">';
      html += '<div class="pt-admin-label">&#9998; Add / Edit Spec</div>';
      html += '<div class="pt-admin-row"><input class="pt-admin-input" id="pt-sk-' + slug + '" placeholder="e.g. Max Lift Height"/><input class="pt-admin-input" id="pt-sv-' + slug + '" placeholder="e.g. 13.5 m"/><button class="pt-admin-btn" onclick="NHH_TABS.addSpec(\'' + slug + '\')">Add</button></div>';
      html += '<button class="pt-admin-btn pt-admin-btn--clear" onclick="NHH_TABS.clearSpecs(\'' + slug + '\')">Clear All Specs</button>';
      html += '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
  }

  function buildDownloadsDisplay(slug, downloads, container) {
    var html = '<div class="pt-downloads">';
    if (downloads.length === 0) {
      html += '<p class="pt-empty">No documents uploaded yet.</p>';
    } else {
      html += '<ul class="pt-dl-list">';
      downloads.forEach(function(d, i) {
        var icon = d.type === 'pdf' ? '&#128196;' : '&#128190;';
        html += '<li class="pt-dl-item">';
        html += '<span class="pt-dl-icon">' + icon + '</span>';
        html += '<div class="pt-dl-info"><span class="pt-dl-name">' + d.name + '</span><span class="pt-dl-size">' + (d.size || '') + '</span></div>';
        html += '<a href="' + d.url + '" class="pt-dl-btn" download target="_blank">&#11015; Download</a>';
        if (isAdmin()) {
          html += '<button class="pt-dl-remove" onclick="NHH_TABS.removeDownload(\'' + slug + '\',' + i + ')">&#10005;</button>';
        }
        html += '</li>';
      });
      html += '</ul>';
    }
    if (isAdmin()) {
      html += '<div class="pt-admin-block">';
      html += '<div class="pt-admin-label">&#128196; Upload Document (PDF / spec sheet)</div>';
      html += '<input type="file" id="pt-file-' + slug + '" accept=".pdf,.doc,.docx,.xls,.xlsx" class="pt-file-input" onchange="NHH_TABS.handleUpload(\'' + slug + '\',this)"/>';
      html += '<label for="pt-file-' + slug + '" class="pt-admin-btn pt-admin-btn--upload">&#128196; Choose File</label>';
      html += '<span id="pt-file-name-' + slug + '" class="pt-file-label">No file chosen</span>';
      html += '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
  }

  window.NHH_TABS = {

    // Expose internals for accordion use
    _getSpecs: getSpecs,
    _getDownloads: getDownloads,
    _buildSpecsDisplay: buildSpecsDisplay,
    _buildDownloadsDisplay: buildDownloadsDisplay,

    render: function(slug, tabBar, tabContent) {
      // Build the 3 tab buttons
      tabBar.innerHTML =
        '<button class="pt-tab pt-tab--active" data-tab="rates" onclick="NHH_TABS.switchTab(\'' + slug + '\',this,\'rates\')">Hire Rates</button>' +
        '<button class="pt-tab" data-tab="specs" onclick="NHH_TABS.switchTab(\'' + slug + '\',this,\'specs\')">Machine Specs</button>' +
        '<button class="pt-tab" data-tab="downloads" onclick="NHH_TABS.switchTab(\'' + slug + '\',this,\'downloads\')">Downloads</button>';
      tabContent.setAttribute('data-active-tab', 'rates');
      tabContent.setAttribute('data-slug', slug);
    },

    switchTab: async function(slug, btn, tab) {
      var bar = btn.parentNode;
      bar.querySelectorAll('.pt-tab').forEach(function(b) { b.classList.remove('pt-tab--active'); });
      btn.classList.add('pt-tab--active');
      var content = document.querySelector('[data-slug="' + slug + '"]');
      content.setAttribute('data-active-tab', tab);
      if (tab === 'specs') {
        var specs = await getSpecs(slug);
        var sp = content.querySelector('.pt-specs-pane');
        buildSpecsDisplay(slug, specs, sp);
      } else if (tab === 'downloads') {
        var dls = await getDownloads(slug);
        var dp = content.querySelector('.pt-downloads-pane');
        buildDownloadsDisplay(slug, dls, dp);
      }
      content.querySelectorAll('.pt-pane').forEach(function(p) {
        p.style.display = p.classList.contains('pt-' + tab + '-pane') ? 'block' : 'none';
      });
    },

    addSpec: async function(slug) {
      var k = document.getElementById('pt-sk-' + slug).value.trim();
      var v = document.getElementById('pt-sv-' + slug).value.trim();
      if (!k || !v) return;
      var specs = await getSpecs(slug);
      specs[k] = v;
      await saveSpecs(slug, specs);
      document.getElementById('pt-sk-' + slug).value = '';
      document.getElementById('pt-sv-' + slug).value = '';
      var content = document.querySelector('[data-slug="' + slug + '"]');
      var sp = content.querySelector('.pt-specs-pane');
      buildSpecsDisplay(slug, specs, sp);
    },

    clearSpecs: async function(slug) {
      if (!confirm('Clear all stored specs for this machine?')) return;
      await window.storage.set(storageKey(slug, 'specs'), '{}');
      var base = SPECS[slug] || {};
      var content = document.querySelector('[data-slug="' + slug + '"]');
      var sp = content.querySelector('.pt-specs-pane');
      buildSpecsDisplay(slug, base, sp);
    },

    handleUpload: async function(slug, input) {
      var file = input.files[0];
      if (!file) return;
      document.getElementById('pt-file-name-' + slug).textContent = file.name;
      var ext = file.name.split('.').pop().toLowerCase();
      var type = ext === 'pdf' ? 'pdf' : 'doc';
      var sizeMB = (file.size / 1048576).toFixed(2) + ' MB';
      // Read as base64 data URL for storage
      var reader = new FileReader();
      reader.onload = async function(e) {
        var dls = await getDownloads(slug);
        dls.push({ name: file.name, url: e.target.result, type: type, size: sizeMB, uploaded: new Date().toLocaleDateString('en-IE') });
        await saveDownloads(slug, dls);
        var content = document.querySelector('[data-slug="' + slug + '"]');
        var dp = content.querySelector('.pt-downloads-pane');
        buildDownloadsDisplay(slug, dls, dp);
        document.getElementById('pt-file-name-' + slug).textContent = '\u2705 ' + file.name + ' uploaded';
      };
      reader.readAsDataURL(file);
    },

    removeDownload: async function(slug, idx) {
      var dls = await getDownloads(slug);
      dls.splice(idx, 1);
      await saveDownloads(slug, dls);
      var content = document.querySelector('[data-slug="' + slug + '"]');
      var dp = content.querySelector('.pt-downloads-pane');
      buildDownloadsDisplay(slug, dls, dp);
    }
  };

  return window.NHH_TABS;
})();

// ── Accordion helpers (used by both powered-access.html & telehandlers.html) ──
window.hcToggleAccordion = async function(btn) {
  var panel = btn.nextElementSibling;
  var icon = btn.querySelector('.hc-accordion-icon');
  var isOpen = panel.classList.toggle('hc-accordion-panel--open');
  if (icon) icon.textContent = isOpen ? '\u25B4' : '\u25BE';

  // Lazy-load content on first open
  if (isOpen && panel.dataset.loaded !== '1') {
    panel.dataset.loaded = '1';
    var wrapper = btn.closest('[data-slug]');
    var slug = wrapper ? wrapper.dataset.slug : '';
    if (panel.classList.contains('pt-specs-pane')) {
      var specs = await NHH_TABS._getSpecs(slug);
      NHH_TABS._buildSpecsDisplay(slug, specs, panel);
    } else if (panel.classList.contains('pt-downloads-pane')) {
      var dls = await NHH_TABS._getDownloads(slug);
      NHH_TABS._buildDownloadsDisplay(slug, dls, panel);
    }
  }
};

window.hcPrepareAccordions = function(slug, container) {
  // No-op placeholder — accordions load lazily on click
};
