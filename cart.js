/* =============================================
   NHH CART & E-COMMERCE ENGINE
   Adds pricing, cart, and checkout to the
   Hardware & DIY section.
   ============================================= */

(function () {
  'use strict';

  // ─── Price ranges by subcategory prefix ───
  // Each maps to [minPrice, maxPrice, step] — products get spread across the range
  var SUB_PRICES = {
    // Building Supplies
    building_blocks_and_bricks: [2.20, 6.50, 0.45],
    building_cements_concretes_and_mortars: [7.50, 18.95, 1.20],
    building_aggregates_and_sand: [4.50, 12.95, 1.10],
    building_roof_materials: [8.50, 38.95, 3.20],
    building_slates_and_tiles: [2.80, 14.50, 1.70],
    building_roof_windows: [195.00, 485.00, 41.50],
    building_gutter_downpipe_and_waste: [3.50, 18.95, 1.60],
    building_underground_drainage: [4.95, 32.50, 2.80],
    building_damp_proof_membranes: [12.95, 55.00, 4.70],
    building_caps_and_lintels: [6.50, 42.00, 4.50],
    building_fascias_and_soffits: [8.95, 32.95, 3.00],
    building_pvc_sheeting_and_ventilation: [3.95, 24.50, 2.30],
    // Timber
    timber_construction_and_treated_timber: [4.50, 28.50, 2.70],
    timber_rough_and_sawn_timber: [3.95, 18.50, 2.90],
    timber_pao_and_planed_timber: [4.50, 22.00, 2.90],
    timber_plywood: [18.50, 62.00, 4.80],
    timber_mdf_and_hardboard: [12.95, 42.00, 3.60],
    timber_patio_and_composite_decking: [8.95, 38.50, 3.70],
    timber_skirting_and_architrave: [2.50, 12.95, 1.30],
    timber_mouldings_and_hardwood: [3.50, 22.50, 2.40],
    // Insulation
    insulation_plasterboard: [6.95, 24.50, 1.95],
    insulation_pir_board_insulation: [14.50, 48.00, 3.70],
    insulation_attic_and_loft_insulation: [18.95, 52.00, 3.70],
    insulation_foilback_and_cavity_insulation: [22.50, 65.00, 4.70],
    insulation_plaster_and_accessories: [8.50, 28.50, 2.20],
    insulation_cement_board: [12.50, 38.00, 2.80],
    // Plumbing
    plumbing_boilers: [1250.00, 2850.00, 178.00],
    plumbing_cylinders_and_tanks: [185.00, 680.00, 55.00],
    plumbing_radiators: [42.00, 195.00, 17.00],
    plumbing_underfloor_heating: [65.00, 320.00, 28.00],
    plumbing_copper_tubes_and_fittings: [1.80, 18.50, 1.85],
    plumbing_pex_and_multilayer_pipe: [2.50, 24.50, 2.45],
    plumbing_heat_pumps_and_renewables: [2850.00, 6500.00, 406.00],
    plumbing_heating_controls: [18.50, 85.00, 7.40],
    // Bathroom
    bathroom_sanitaryware: [45.00, 285.00, 26.70],
    bathroom_baths: [185.00, 650.00, 51.70],
    bathroom_showers_and_enclosures: [125.00, 480.00, 39.40],
    bathroom_taps: [38.00, 185.00, 16.30],
    bathroom_bathroom_furniture: [95.00, 420.00, 36.10],
    bathroom_wall_panels_and_tiling: [12.50, 42.00, 3.30],
    // Doors & Floors
    doors_internal_doors: [65.00, 285.00, 24.40],
    doors_external_doors: [195.00, 650.00, 50.60],
    doors_door_frames_and_liners: [22.00, 85.00, 7.00],
    doors_door_furniture: [8.50, 48.00, 4.40],
    doors_laminate_and_vinyl_flooring: [14.50, 42.00, 3.10],
    doors_carpet_and_underlay: [5.50, 22.00, 1.83],
    // Paint
    paint_emulsions_and_interior: [14.95, 52.00, 4.10],
    paint_exterior_and_masonry: [18.50, 58.00, 4.40],
    paint_woodstains_and_varnishes: [12.50, 38.00, 2.80],
    paint_spray_paint_and_specialty: [6.50, 24.50, 2.00],
    paint_brushes_and_rollers: [2.50, 18.50, 1.78],
    paint_wallpaper_and_adhesives: [8.50, 32.00, 2.60],
    // Tools
    tools_hand_tools: [4.50, 38.00, 3.72],
    tools_power_tools: [45.00, 295.00, 27.80],
    tools_measuring_and_levelling: [6.50, 65.00, 6.50],
    tools_screws_and_nails: [3.50, 14.50, 1.22],
    tools_bolts_and_fixings: [2.80, 12.50, 1.08],
    tools_adhesives_and_sealants: [4.50, 16.50, 1.33],
    tools_cable_and_electrical: [3.50, 28.50, 2.78],
    // PPE
    ppe_hi_vis_and_jackets: [8.50, 38.00, 3.28],
    ppe_gloves: [3.50, 14.50, 1.22],
    ppe_helmets_and_head_protection: [6.50, 28.50, 2.44],
    ppe_safety_boots: [32.00, 95.00, 7.00],
    ppe_ear_and_eye_protection: [4.50, 22.50, 2.00],
    ppe_dust_masks_and_respirators: [2.50, 24.50, 2.44],
    // Garden
    garden_lawnmowers_and_strimmers: [85.00, 420.00, 37.22],
    garden_hand_tools_and_barrows: [8.50, 55.00, 5.17],
    garden_fencing_and_screening: [12.50, 65.00, 5.83],
    garden_paving_and_gravel: [4.50, 28.00, 2.61],
    garden_garden_decor_and_pots: [5.50, 38.00, 3.61],
    garden_sheds_and_storage: [195.00, 850.00, 72.78],
    // Fuel
    fuel_coal_and_smokeless_fuels: [8.50, 26.50, 2.00],
    fuel_briquettes_and_logs: [4.50, 18.50, 1.56]
  };

  // ─── Cart State ───
  var CART_KEY = 'nhh_cart';
  var cart = loadCart();

  function loadCart() {
    try {
      var stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    updateCartBadge();
    renderCartDrawer();
  }

  function addToCart(name, price, subId) {
    var existing = cart.find(function (item) { return item.name === name; });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name: name, price: price, qty: 1, sub: subId });
    }
    saveCart();
    showCartToast(name);
    openCartDrawer();
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
  }

  function updateQty(index, delta) {
    if (!cart[index]) return;
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart.splice(index, 1);
    saveCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  function cartTotal() {
    return cart.reduce(function (sum, item) { return sum + (item.price * item.qty); }, 0);
  }

  function cartCount() {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  // ─── Assign prices to product items ───
  function enhanceProducts() {
    var panels = document.querySelectorAll('.hw-product-panel');
    panels.forEach(function (panel) {
      var subId = panel.id.replace('hw-prod-', '');
      var priceRange = SUB_PRICES[subId];
      if (!priceRange) return;

      var items = panel.querySelectorAll('.hw-product-item');
      var min = priceRange[0], max = priceRange[1];
      var count = items.length;

      items.forEach(function (item, idx) {
        var nameEl = item.querySelector('.hw-product-name');
        var ctaEl = item.querySelector('.hw-product-cta');
        if (!nameEl || !ctaEl) return;

        // Calculate price spread across the range
        var price;
        if (count === 1) {
          price = min;
        } else {
          price = min + ((max - min) * idx / (count - 1));
        }
        // Round to .50 or .95 for realism
        price = Math.round(price * 2) / 2;
        if (price > 10) price = Math.floor(price) + 0.95;
        else if (price > 3) price = Math.floor(price) + 0.50;

        var productName = nameEl.textContent.trim();

        // Add price display
        var priceEl = document.createElement('span');
        priceEl.className = 'hw-product-price';
        priceEl.textContent = '€' + price.toFixed(2);
        item.insertBefore(priceEl, ctaEl);

        // Transform CTA to Add to Cart
        ctaEl.href = '#';
        ctaEl.className = 'hw-add-to-cart';
        ctaEl.innerHTML = '<i data-lucide="shopping-cart"></i> Add';
        ctaEl.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          addToCart(productName, price, subId);
          // Visual feedback
          var btn = this;
          btn.classList.add('added');
          btn.innerHTML = '<i data-lucide="check"></i> Added';
          if (typeof lucide !== 'undefined') lucide.createIcons();
          setTimeout(function () {
            btn.classList.remove('added');
            btn.innerHTML = '<i data-lucide="shopping-cart"></i> Add';
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }, 1500);
        };
      });
    });

    // Reinitialize Lucide icons for the new cart icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── Cart Badge ───
  function updateCartBadge() {
    var badges = document.querySelectorAll('.nhh-cart-badge');
    var count = cartCount();
    badges.forEach(function (b) {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // ─── Cart Toast ───
  function showCartToast(name) {
    var existing = document.getElementById('cart-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.className = 'cart-toast show';
    toast.innerHTML = '<i data-lucide="check-circle" style="width:16px;height:16px;stroke:#1a7a3c;flex-shrink:0"></i><span><strong>' + truncate(name, 30) + '</strong> added to cart</span>';
    document.body.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(function () { toast.classList.remove('show'); }, 2800);
    setTimeout(function () { toast.remove(); }, 3200);
  }

  function truncate(str, n) {
    return str.length > n ? str.substring(0, n) + '…' : str;
  }

  // ─── Cart Drawer ───
  function injectCartDrawer() {
    if (document.getElementById('cart-drawer-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'cart-drawer-overlay';
    overlay.className = 'cart-drawer-overlay';
    overlay.onclick = closeCartDrawer;

    var drawer = document.createElement('div');
    drawer.id = 'cart-drawer';
    drawer.className = 'cart-drawer';
    drawer.innerHTML = [
      '<div class="cart-drawer-header">',
      '  <h2><i data-lucide="shopping-cart" style="width:20px;height:20px;vertical-align:-4px;margin-right:8px"></i>Your Cart <span class="cart-drawer-count" id="cart-drawer-count">0 items</span></h2>',
      '  <button class="cart-drawer-close" onclick="window.NHH_CART.close()" aria-label="Close cart"><i data-lucide="x" style="width:20px;height:20px"></i></button>',
      '</div>',
      '<div class="cart-drawer-body" id="cart-drawer-body"></div>',
      '<div class="cart-drawer-footer" id="cart-drawer-footer"></div>'
    ].join('\n');

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
  }

  function injectCheckoutModal() {
    if (document.getElementById('checkout-overlay')) return;

    var html = [
      '<div class="checkout-overlay" id="checkout-overlay">',
      '<div class="checkout-modal" id="checkout-modal">',
      '  <div class="checkout-header">',
      '    <h2><i data-lucide="credit-card" style="width:20px;height:20px;vertical-align:-4px;margin-right:8px"></i>Checkout</h2>',
      '    <button class="cart-drawer-close" onclick="window.NHH_CART.closeCheckout()" aria-label="Close"><i data-lucide="x" style="width:20px;height:20px"></i></button>',
      '  </div>',
      '  <div class="checkout-body" id="checkout-body">',
      '    <!-- Step 1: Delivery method -->',
      '    <div class="checkout-step" id="co-step-1">',
      '      <div class="co-step-label">Step 1 of 3</div>',
      '      <h3>Choose Delivery Method</h3>',
      '      <div class="delivery-options">',
      '        <label class="delivery-option" data-method="collect">',
      '          <input type="radio" name="delivery" value="collect">',
      '          <div class="do-card">',
      '            <div class="do-icon"><i data-lucide="store"></i></div>',
      '            <div class="do-info">',
      '              <strong>Click & Collect</strong>',
      '              <span>FREE &mdash; Ready in 1-2 hours</span>',
      '              <span class="do-detail">Collect from our Navan store, Kells Road</span>',
      '            </div>',
      '            <div class="do-price">FREE</div>',
      '          </div>',
      '        </label>',
      '        <label class="delivery-option" data-method="truck">',
      '          <input type="radio" name="delivery" value="truck">',
      '          <div class="do-card">',
      '            <div class="do-icon"><i data-lucide="truck"></i></div>',
      '            <div class="do-info">',
      '              <strong>Truck Delivery</strong>',
      '              <span>From &euro;35 &mdash; Next working day</span>',
      '              <span class="do-detail">Leinster only &mdash; ideal for bulk / heavy items</span>',
      '            </div>',
      '            <div class="do-price">From &euro;35</div>',
      '          </div>',
      '        </label>',
      '        <label class="delivery-option" data-method="post">',
      '          <input type="radio" name="delivery" value="post">',
      '          <div class="do-card">',
      '            <div class="do-icon"><i data-lucide="package"></i></div>',
      '            <div class="do-info">',
      '              <strong>Postage / Courier</strong>',
      '              <span>From &euro;7.95 &mdash; 2-4 working days</span>',
      '              <span class="do-detail">Nationwide delivery via An Post / DPD</span>',
      '            </div>',
      '            <div class="do-price">From &euro;7.95</div>',
      '          </div>',
      '        </label>',
      '      </div>',
      '      <div class="co-truck-notice" id="co-truck-notice" style="display:none">',
      '        <i data-lucide="info" style="width:16px;height:16px;flex-shrink:0;stroke:var(--amber)"></i>',
      '        <span>Truck delivery is available <strong>within Leinster only</strong> (Dublin, Meath, Louth, Kildare, Wicklow, Wexford, Carlow, Kilkenny, Laois, Offaly, Westmeath, Longford). Delivery charge depends on location and order weight.</span>',
      '      </div>',
      '      <button class="co-next-btn" id="co-next-1" onclick="window.NHH_CART.coStep(2)" disabled>Continue to Details</button>',
      '    </div>',
      '',
      '    <!-- Step 2: Customer details -->',
      '    <div class="checkout-step" id="co-step-2" style="display:none">',
      '      <div class="co-step-label">Step 2 of 3</div>',
      '      <h3 id="co-step2-title">Your Details</h3>',
      '      <div class="co-form">',
      '        <div class="co-row">',
      '          <div class="co-field"><label>Full Name <span>*</span></label><input type="text" id="co-name" placeholder="John Murphy" required></div>',
      '          <div class="co-field"><label>Phone <span>*</span></label><input type="tel" id="co-phone" placeholder="087 123 4567" required></div>',
      '        </div>',
      '        <div class="co-field"><label>Email <span>*</span></label><input type="email" id="co-email" placeholder="john@example.com" required></div>',
      '        <div id="co-address-section">',
      '          <div class="co-field"><label>Address Line 1 <span>*</span></label><input type="text" id="co-addr1" placeholder="Street / site name"></div>',
      '          <div class="co-row">',
      '            <div class="co-field"><label>Town / City <span>*</span></label><input type="text" id="co-town" placeholder="Navan"></div>',
      '            <div class="co-field"><label>County <span>*</span></label><input type="text" id="co-county" placeholder="Co. Meath"></div>',
      '          </div>',
      '          <div class="co-field" style="max-width:200px"><label>Eircode <span>*</span></label><input type="text" id="co-eircode" placeholder="C15 XY12"></div>',
      '        </div>',
      '        <div class="co-field"><label>Order Notes</label><textarea id="co-notes" placeholder="Gate codes, delivery instructions, preferred delivery time..."></textarea></div>',
      '      </div>',
      '      <div class="co-btn-row">',
      '        <button class="co-back-btn" onclick="window.NHH_CART.coStep(1)">Back</button>',
      '        <button class="co-next-btn" id="co-next-2" onclick="window.NHH_CART.coStep(3)">Review Order</button>',
      '      </div>',
      '    </div>',
      '',
      '    <!-- Step 3: Review & confirm -->',
      '    <div class="checkout-step" id="co-step-3" style="display:none">',
      '      <div class="co-step-label">Step 3 of 3</div>',
      '      <h3>Review Your Order</h3>',
      '      <div id="co-review-items"></div>',
      '      <div id="co-review-delivery"></div>',
      '      <div id="co-review-totals"></div>',
      '      <div class="co-review-customer" id="co-review-customer"></div>',
      '      <div class="co-disclaimer">',
      '        <p>By placing this order you agree to our terms. Payment will be collected on delivery / collection. For trade account customers, this will be added to your account.</p>',
      '      </div>',
      '      <div class="co-btn-row">',
      '        <button class="co-back-btn" onclick="window.NHH_CART.coStep(2)">Back</button>',
      '        <button class="co-place-btn" onclick="window.NHH_CART.placeOrder()"><i data-lucide="check-circle" style="width:18px;height:18px;vertical-align:-3px;margin-right:6px"></i>Place Order</button>',
      '      </div>',
      '    </div>',
      '',
      '    <!-- Confirmation -->',
      '    <div class="checkout-step" id="co-step-done" style="display:none">',
      '      <div class="co-confirmation">',
      '        <div class="co-conf-icon">✓</div>',
      '        <h3>Order Placed!</h3>',
      '        <p class="co-conf-ref" id="co-conf-ref"></p>',
      '        <p class="co-conf-msg" id="co-conf-msg"></p>',
      '        <div class="co-conf-detail" id="co-conf-detail"></div>',
      '        <button class="co-next-btn" onclick="window.NHH_CART.closeCheckout()" style="margin-top:20px">Continue Shopping</button>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>',
      '</div>'
    ].join('\n');

    document.body.insertAdjacentHTML('beforeend', html);

    // Wire up delivery radio buttons
    setTimeout(function () {
      var radios = document.querySelectorAll('input[name="delivery"]');
      radios.forEach(function (r) {
        r.addEventListener('change', function () {
          document.getElementById('co-next-1').disabled = false;
          // Highlight selected
          document.querySelectorAll('.delivery-option').forEach(function (opt) {
            opt.classList.remove('selected');
          });
          this.closest('.delivery-option').classList.add('selected');
          // Show truck notice
          document.getElementById('co-truck-notice').style.display = this.value === 'truck' ? 'flex' : 'none';
        });
      });
    }, 100);
  }

  function openCartDrawer() {
    var overlay = document.getElementById('cart-drawer-overlay');
    var drawer = document.getElementById('cart-drawer');
    if (!overlay || !drawer) return;
    renderCartDrawer();
    requestAnimationFrame(function () {
      overlay.classList.add('open');
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeCartDrawer() {
    var overlay = document.getElementById('cart-drawer-overlay');
    var drawer = document.getElementById('cart-drawer');
    if (overlay) overlay.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderCartDrawer() {
    var body = document.getElementById('cart-drawer-body');
    var footer = document.getElementById('cart-drawer-footer');
    var countEl = document.getElementById('cart-drawer-count');
    if (!body || !footer) return;

    var count = cartCount();
    if (countEl) countEl.textContent = count + ' item' + (count !== 1 ? 's' : '');

    if (cart.length === 0) {
      body.innerHTML = '<div class="cart-empty"><i data-lucide="shopping-cart" style="width:48px;height:48px;stroke:#ccc;margin-bottom:14px"></i><p>Your cart is empty</p><span>Browse our Hardware & DIY range to get started</span></div>';
      footer.innerHTML = '';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    var html = '';
    cart.forEach(function (item, i) {
      html += '<div class="cart-item">';
      html += '  <div class="cart-item-info">';
      html += '    <div class="cart-item-name">' + item.name + '</div>';
      html += '    <div class="cart-item-price">€' + item.price.toFixed(2) + ' each</div>';
      html += '  </div>';
      html += '  <div class="cart-item-controls">';
      html += '    <button class="cart-qty-btn" onclick="window.NHH_CART.qty(' + i + ',-1)">−</button>';
      html += '    <span class="cart-qty-val">' + item.qty + '</span>';
      html += '    <button class="cart-qty-btn" onclick="window.NHH_CART.qty(' + i + ',1)">+</button>';
      html += '  </div>';
      html += '  <div class="cart-item-total">€' + (item.price * item.qty).toFixed(2) + '</div>';
      html += '  <button class="cart-item-remove" onclick="window.NHH_CART.remove(' + i + ')" title="Remove"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
      html += '</div>';
    });
    body.innerHTML = html;

    var total = cartTotal();
    footer.innerHTML = [
      '<div class="cart-totals">',
      '  <div class="cart-subtotal"><span>Subtotal (' + count + ' items)</span><strong>€' + total.toFixed(2) + '</strong></div>',
      '  <div class="cart-vat-note">All prices include VAT</div>',
      '</div>',
      '<button class="cart-checkout-btn" onclick="window.NHH_CART.checkout()"><i data-lucide="credit-card" style="width:16px;height:16px;vertical-align:-2px;margin-right:6px"></i>Proceed to Checkout</button>',
      '<button class="cart-clear-btn" onclick="window.NHH_CART.clear()">Clear Cart</button>'
    ].join('\n');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── Checkout ───
  var selectedDelivery = '';
  var DELIVERY_CHARGES = { collect: 0, truck: 35, post: 7.95 };

  function openCheckout() {
    closeCartDrawer();
    if (cart.length === 0) return;
    // Reset to step 1
    selectedDelivery = '';
    [1, 2, 3].forEach(function (n) {
      var s = document.getElementById('co-step-' + n);
      if (s) s.style.display = n === 1 ? 'block' : 'none';
    });
    var done = document.getElementById('co-step-done');
    if (done) done.style.display = 'none';
    // Reset radios
    document.querySelectorAll('input[name="delivery"]').forEach(function (r) { r.checked = false; });
    document.querySelectorAll('.delivery-option').forEach(function (o) { o.classList.remove('selected'); });
    document.getElementById('co-next-1').disabled = true;
    document.getElementById('co-truck-notice').style.display = 'none';

    var overlay = document.getElementById('checkout-overlay');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCheckout() {
    var overlay = document.getElementById('checkout-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function coStep(step) {
    if (step === 2) {
      var checkedRadio = document.querySelector('input[name="delivery"]:checked');
      if (!checkedRadio) return;
      selectedDelivery = checkedRadio.value;
      // Show/hide address fields
      var addrSection = document.getElementById('co-address-section');
      var step2Title = document.getElementById('co-step2-title');
      if (selectedDelivery === 'collect') {
        if (addrSection) addrSection.style.display = 'none';
        if (step2Title) step2Title.textContent = 'Your Details (Click & Collect)';
      } else {
        if (addrSection) addrSection.style.display = 'block';
        if (step2Title) step2Title.textContent = selectedDelivery === 'truck' ? 'Delivery Details (Truck — Leinster)' : 'Delivery Details (Postage / Courier)';
      }
    }
    if (step === 3) {
      // Validate step 2
      var name = document.getElementById('co-name').value.trim();
      var phone = document.getElementById('co-phone').value.trim();
      var email = document.getElementById('co-email').value.trim();
      if (!name || !phone || !email) {
        alert('Please fill in your name, phone, and email.');
        return;
      }
      if (selectedDelivery !== 'collect') {
        var addr = document.getElementById('co-addr1').value.trim();
        var town = document.getElementById('co-town').value.trim();
        if (!addr || !town) {
          alert('Please fill in your delivery address.');
          return;
        }
      }
      renderReview();
    }

    [1, 2, 3].forEach(function (n) {
      var s = document.getElementById('co-step-' + n);
      if (s) s.style.display = n === step ? 'block' : 'none';
    });
    var done = document.getElementById('co-step-done');
    if (done) done.style.display = 'none';

    // Scroll to top of modal
    var modal = document.getElementById('checkout-modal');
    if (modal) modal.scrollTop = 0;
  }

  function renderReview() {
    // Items
    var itemsHtml = '<div class="co-review-section"><h4>Items</h4>';
    cart.forEach(function (item) {
      itemsHtml += '<div class="co-review-row"><span>' + item.name + ' × ' + item.qty + '</span><strong>€' + (item.price * item.qty).toFixed(2) + '</strong></div>';
    });
    itemsHtml += '</div>';
    document.getElementById('co-review-items').innerHTML = itemsHtml;

    // Delivery
    var delCharge = DELIVERY_CHARGES[selectedDelivery] || 0;
    var delLabel = selectedDelivery === 'collect' ? 'Click & Collect (FREE)' : selectedDelivery === 'truck' ? 'Truck Delivery (Leinster)' : 'Postage / Courier';
    document.getElementById('co-review-delivery').innerHTML = '<div class="co-review-section"><h4>Delivery</h4><div class="co-review-row"><span>' + delLabel + '</span><strong>' + (delCharge === 0 ? 'FREE' : '€' + delCharge.toFixed(2)) + '</strong></div></div>';

    // Totals
    var subtotal = cartTotal();
    var total = subtotal + delCharge;
    var totalsHtml = '<div class="co-review-totals-box">';
    totalsHtml += '<div class="co-review-row"><span>Subtotal</span><span>€' + subtotal.toFixed(2) + '</span></div>';
    if (delCharge > 0) totalsHtml += '<div class="co-review-row"><span>Delivery</span><span>€' + delCharge.toFixed(2) + '</span></div>';
    totalsHtml += '<div class="co-review-row co-review-total"><span>Total (incl. VAT)</span><strong>€' + total.toFixed(2) + '</strong></div>';
    totalsHtml += '</div>';
    document.getElementById('co-review-totals').innerHTML = totalsHtml;

    // Customer
    var name = document.getElementById('co-name').value.trim();
    var email = document.getElementById('co-email').value.trim();
    var phone = document.getElementById('co-phone').value.trim();
    var custHtml = '<div class="co-review-section"><h4>Customer</h4>';
    custHtml += '<p>' + name + '<br>' + email + '<br>' + phone + '</p>';
    if (selectedDelivery !== 'collect') {
      var addr = document.getElementById('co-addr1').value.trim();
      var town = document.getElementById('co-town').value.trim();
      var county = document.getElementById('co-county').value.trim();
      var eircode = document.getElementById('co-eircode').value.trim();
      custHtml += '<p style="margin-top:6px;color:#666">' + addr + '<br>' + town + (county ? ', ' + county : '') + (eircode ? ' ' + eircode : '') + '</p>';
    }
    custHtml += '</div>';
    document.getElementById('co-review-customer').innerHTML = custHtml;
  }

  function placeOrder() {
    // Generate order reference
    var ref = 'NHH-' + Date.now().toString(36).toUpperCase().slice(-6);
    var delCharge = DELIVERY_CHARGES[selectedDelivery] || 0;
    var total = cartTotal() + delCharge;

    var confMethods = {
      collect: "Your order will be ready for collection from our Navan store (Kells Road) within 1\u20132 hours. We'll send you a text when it's ready.",
      truck: "Your order will be delivered by truck to your Leinster address on the next working day. We'll call to confirm a delivery window.",
      post: "Your order will be dispatched via An Post / DPD within 1 working day. You'll receive tracking details by email."
    };

    document.getElementById('co-conf-ref').textContent = 'Order Reference: ' + ref;
    document.getElementById('co-conf-msg').textContent = 'Total: €' + total.toFixed(2);
    document.getElementById('co-conf-detail').textContent = confMethods[selectedDelivery] || '';

    // Show done step
    [1, 2, 3].forEach(function (n) {
      var s = document.getElementById('co-step-' + n);
      if (s) s.style.display = 'none';
    });
    document.getElementById('co-step-done').style.display = 'block';

    // Clear cart
    clearCart();

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── Cart Icon in Header ───
  function injectCartIcon() {
    // Find the account button in the header and add cart icon before it
    var accountBtn = document.querySelector('.nhh-account-btn');
    if (!accountBtn || document.querySelector('.nhh-cart-btn')) return;

    var cartBtn = document.createElement('a');
    cartBtn.href = '#';
    cartBtn.className = 'nhh-cart-btn';
    cartBtn.title = 'Shopping Cart';
    cartBtn.setAttribute('aria-label', 'Cart');
    cartBtn.innerHTML = '<i data-lucide="shopping-cart"></i><span class="nhh-cart-badge" style="display:none">0</span>';
    cartBtn.onclick = function (e) {
      e.preventDefault();
      openCartDrawer();
    };

    accountBtn.parentNode.insertBefore(cartBtn, accountBtn);
  }

  // ─── Expose API ───
  window.NHH_CART = {
    open: openCartDrawer,
    close: closeCartDrawer,
    qty: updateQty,
    remove: removeFromCart,
    clear: clearCart,
    checkout: openCheckout,
    closeCheckout: closeCheckout,
    coStep: coStep,
    placeOrder: placeOrder
  };

  // ─── Init ───
  function init() {
    injectCartDrawer();
    injectCheckoutModal();
    enhanceProducts();
    injectCartIcon();
    updateCartBadge();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // Small delay to ensure components.js has injected the header
      setTimeout(init, 50);
    });
  } else {
    setTimeout(init, 50);
  }

})();
