#!/usr/bin/env python3
"""Build a fully offline, self-contained portable HTML file for QR label printing."""

import base64, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Read logo SVG and convert to data URI
with open('logo.svg', 'r') as f:
    logo_svg = f.read().strip()
logo_b64 = base64.b64encode(logo_svg.encode('utf-8')).decode('utf-8')
logo_data_uri = 'data:image/svg+xml;base64,' + logo_b64

# Read QR code library for inline embedding
with open('qrcode.min.js', 'r') as f:
    qr_lib_js = f.read().strip()

# Read CSV data
with open('qr-codes-all.csv', 'r') as f:
    csv_text = f.read().strip()

# Escape for embedding in JS template literal (backticks and ${})
csv_escaped = csv_text.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

html = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NHH QR Labels - 62mm Continuous - All Items (Portable)</title>
  <meta name="robots" content="noindex, nofollow"/>
  <script>%%QR_LIB%%</script>
  <style>
    :root {
      --red: #fe0000;
      --black: #0D0D0D;
      --font-head: 'Arial Narrow', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-body);
      background: #f5f4f2;
      padding: 24px;
    }

    .screen-header {
      text-align: center;
      margin-bottom: 24px;
      padding: 24px;
      background: var(--black);
      color: #fff;
      border-radius: 8px;
    }
    .screen-header h1 {
      font-family: var(--font-head);
      font-size: 1.6rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .screen-header p { opacity: 0.6; font-size: 0.9rem; }
    .screen-header .count {
      display: inline-block;
      background: var(--red);
      color: #fff;
      font-family: var(--font-head);
      font-weight: 700;
      font-size: 0.85rem;
      padding: 4px 14px;
      border-radius: 4px;
      margin-top: 8px;
    }
    .print-btn {
      display: inline-block;
      background: var(--red);
      color: #fff;
      font-family: var(--font-head);
      font-weight: 700;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border: none;
      padding: 12px 40px;
      border-radius: 4px;
      cursor: pointer;
      margin: 12px 6px 0;
    }
    .print-btn:hover { background: #cc0000; }
    .print-btn.secondary { background: #444; }
    .print-btn.secondary:hover { background: #333; }
    .progress {
      margin-top: 12px;
      font-size: 0.85rem;
      opacity: 0.7;
    }

    /* Search bar */
    .search-bar {
      display: flex;
      gap: 8px;
      max-width: 500px;
      margin: 16px auto 0;
    }
    .search-bar input {
      flex: 1;
      font-family: var(--font-body);
      font-size: 1rem;
      padding: 10px 16px;
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 4px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      outline: none;
    }
    .search-bar input::placeholder { color: rgba(255,255,255,0.4); }
    .search-bar input:focus { border-color: var(--red); }
    .search-bar .search-count {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.5);
      align-self: center;
      white-space: nowrap;
    }

    /* Print modal overlay */
    .print-modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .print-modal-overlay.active { display: flex; }
    .print-modal {
      background: #fff;
      border-radius: 12px;
      padding: 32px;
      max-width: 320px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .print-modal .modal-label {
      width: 62mm;
      margin: 0 auto 20px;
      border: 1px dashed #ccc;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 4mm 3mm;
      gap: 1.5mm;
    }
    .print-modal .modal-id {
      font-family: var(--font-head);
      font-weight: 700;
      font-size: 14pt;
      color: var(--black);
      margin-bottom: 12px;
    }
    .print-modal .modal-btns {
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    .print-modal .modal-btns button {
      font-family: var(--font-head);
      font-weight: 700;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border: none;
      padding: 10px 24px;
      border-radius: 4px;
      cursor: pointer;
    }
    .print-modal .btn-print { background: var(--red); color: #fff; }
    .print-modal .btn-print:hover { background: #cc0000; }
    .print-modal .btn-close { background: #e0e0e0; color: #333; }
    .print-modal .btn-close:hover { background: #ccc; }

    .label-grid {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4mm;
    }

    .label {
      width: 62mm;
      border: 1px dashed #ccc;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 4mm 3mm;
      gap: 1.5mm;
      page-break-inside: avoid;
      break-inside: avoid;
      cursor: pointer;
      transition: box-shadow 0.15s, transform 0.15s;
    }
    .label:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      transform: translateY(-1px);
    }
    .label.hidden { display: none !important; }
    .label.no-docs {
      border-color: #f0c040;
      background: #fffdf5;
    }

    .label-brand {
      height: 10mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .label-brand img {
      height: 100%;
      width: auto;
      display: block;
    }

    .label-qr {
      width: 38mm;
      height: 38mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .label-qr img {
      width: 38mm !important;
      height: 38mm !important;
      image-rendering: pixelated;
    }

    .label-fleet {
      font-family: var(--font-head);
      font-weight: 700;
      font-size: 12pt;
      color: var(--black);
      background: #f0f0f0;
      display: inline-block;
      padding: 1mm 3mm;
      border-radius: 1.5mm;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .label-cta {
      font-family: var(--font-head);
      font-weight: 800;
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--black);
      line-height: 1.1;
    }

    @media print {
      @page {
        size: 62mm auto;
        margin: 0;
      }
      body {
        background: #fff;
        padding: 0;
        margin: 0;
      }
      .screen-header { display: none !important; }
      .print-modal-overlay { display: none !important; }
      .label-grid { gap: 0; }
      .label {
        border: none;
        width: 62mm;
        padding: 3mm 2mm;
        page-break-after: always;
        cursor: default;
        box-shadow: none;
        transform: none;
      }
      .label:hover { box-shadow: none; transform: none; }
      .label.hidden { display: none !important; }
      .label.no-docs { background: #fff; }
    }
  </style>
</head>
<body>

  <div class="screen-header">
    <h1>NHH QR Labels - All Items</h1>
    <p>62mm continuous labels for Zebra printer (fully offline)</p>
    <div class="count" id="labelCount">Loading...</div>
    <br>
    <div class="search-bar">
      <input type="text" id="searchInput" placeholder="Search by stock number..." autocomplete="off">
      <span class="search-count" id="searchCount"></span>
    </div>
    <br>
    <button class="print-btn" onclick="printVisible()">Print All Labels</button>
    <button class="print-btn secondary" id="btnPrintFiltered" onclick="printVisible()" style="display:none">Print Filtered</button>
    <div class="progress" id="progress"></div>
  </div>

  <div class="print-modal-overlay" id="printModal">
    <div class="print-modal">
      <div class="modal-id" id="modalId"></div>
      <div id="modalLabelSlot"></div>
      <div class="modal-btns">
        <button class="btn-print" onclick="printSingle()">Print This Label</button>
        <button class="btn-close" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  </div>

  <div class="label-grid" id="labelGrid"></div>

  <script>
    var LOGO_SRC = "''' + logo_data_uri + r'''";

    var CSV_DATA = `''' + csv_escaped + r'''`;

    (function() {
      var lines = CSV_DATA.trim().split('\n');
      var grid = document.getElementById('labelGrid');
      var progress = document.getElementById('progress');
      var total = lines.length - 1;

      document.getElementById('labelCount').textContent = total + ' labels';

      var machines = [];
      for (var i = 1; i < lines.length; i++) {
        var cols = lines[i].split(',');
        if (cols.length >= 2) {
          machines.push({
            id: cols[0].replace(/"/g, ''),
            url: cols[1].replace(/"/g, ''),
            hasGA1: cols[2] ? cols[2].replace(/"/g, '') === 'Yes' : false,
            hasManual: cols[3] ? cols[3].replace(/"/g, '') === 'Yes' : false
          });
        }
      }

      var batchSize = 50;
      var idx = 0;

      function renderBatch() {
        var end = Math.min(idx + batchSize, machines.length);
        for (var j = idx; j < end; j++) {
          var m = machines[j];

          var qr = qrcode(0, 'M');
          qr.addData(m.url);
          qr.make();

          var hasDocs = m.hasGA1 || m.hasManual;

          var label = document.createElement('div');
          label.className = 'label' + (hasDocs ? '' : ' no-docs');

          label.setAttribute('data-id', m.id.toLowerCase());
          label.innerHTML =
            '<div class="label-brand"><img src="' + LOGO_SRC + '" alt="NHH"></div>' +
            '<div class="label-qr">' + qr.createImgTag(4, 0) + '</div>' +
            '<div class="label-fleet">' + escHtml(m.id) + '</div>' +
            '<div class="label-cta">SCAN FOR DOCS</div>';

          label.addEventListener('click', (function(machine, el) {
            return function() { openModal(machine, el); };
          })(m, label));

          grid.appendChild(label);
        }
        idx = end;
        progress.textContent = 'Rendered ' + idx + ' / ' + machines.length;

        if (idx < machines.length) {
          requestAnimationFrame(renderBatch);
        } else {
          progress.textContent = 'All ' + machines.length + ' labels ready';
        }
      }

      function escHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
      }

      renderBatch();

      // ── Search ──
      var searchInput = document.getElementById('searchInput');
      var searchCount = document.getElementById('searchCount');
      var btnFiltered = document.getElementById('btnPrintFiltered');

      searchInput.addEventListener('input', function() {
        var q = this.value.trim().toLowerCase();
        var labels = grid.querySelectorAll('.label');
        var shown = 0;
        for (var k = 0; k < labels.length; k++) {
          var id = labels[k].getAttribute('data-id') || '';
          if (!q || id.indexOf(q) !== -1) {
            labels[k].classList.remove('hidden');
            shown++;
          } else {
            labels[k].classList.add('hidden');
          }
        }
        if (q) {
          searchCount.textContent = shown + ' of ' + labels.length;
          btnFiltered.style.display = '';
        } else {
          searchCount.textContent = '';
          btnFiltered.style.display = 'none';
        }
      });

      // ── Print modal ──
      var currentPrintLabel = null;

      window.openModal = function(machine, labelEl) {
        currentPrintLabel = labelEl;
        document.getElementById('modalId').textContent = machine.id;
        var slot = document.getElementById('modalLabelSlot');
        slot.innerHTML = '';
        var clone = labelEl.cloneNode(true);
        clone.classList.remove('hidden');
        clone.style.cursor = 'default';
        clone.className = 'modal-label' + (labelEl.classList.contains('no-docs') ? ' no-docs' : '');
        // Re-apply label styles inline for the modal preview
        clone.style.width = '62mm';
        clone.style.display = 'flex';
        clone.style.flexDirection = 'column';
        clone.style.alignItems = 'center';
        clone.style.textAlign = 'center';
        clone.style.padding = '4mm 3mm';
        clone.style.gap = '1.5mm';
        clone.style.border = '1px dashed #ccc';
        slot.appendChild(clone);
        document.getElementById('printModal').classList.add('active');
      };

      window.closeModal = function() {
        document.getElementById('printModal').classList.remove('active');
        currentPrintLabel = null;
      };

      window.printSingle = function() {
        if (!currentPrintLabel) return;
        // Hide all labels, show only the one to print
        var allLabels = grid.querySelectorAll('.label');
        var prevStates = [];
        for (var k = 0; k < allLabels.length; k++) {
          prevStates.push(allLabels[k].classList.contains('hidden'));
          allLabels[k].classList.add('hidden');
        }
        currentPrintLabel.classList.remove('hidden');
        closeModal();
        setTimeout(function() {
          window.print();
          // Restore after print dialog
          setTimeout(function() {
            for (var k = 0; k < allLabels.length; k++) {
              if (!prevStates[k]) allLabels[k].classList.remove('hidden');
            }
          }, 500);
        }, 100);
      };

      window.printVisible = function() {
        window.print();
      };

      // Close modal on overlay click
      document.getElementById('printModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
      });

      // Close modal on Escape
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
      });
    })();
  </script>
</body>
</html>'''

# Inject QR library inline
html = html.replace('%%QR_LIB%%', qr_lib_js)

with open('qr-print-portable.html', 'w') as f:
    f.write(html)

size_kb = os.path.getsize('qr-print-portable.html') / 1024
print(f'Done! Created qr-print-portable.html ({size_kb:.0f} KB) — fully offline, no network needed')
