/* ============================================================
   GlowPals — Magic Glow Plush
   Gallery · variants · quantity · cart · checkout · videos
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = (n) => "$" + (n % 1 === 0 ? n : n.toFixed(2));

  /* ---------- Order pipeline (demand test) ---------- */
  const DISCORD_WEBHOOK =
    "https://discord.com/api/webhooks/1532418391397240885/O5rNcZ3Img6JbJI2cr2zZh6OoHR2mQMxbtSBcGX3VySPeLIqRk0htSK4QRE0k9tzqUXA";

  // Google Analytics event helper (gtag loaded in <head>)
  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  // Meta Pixel event helper (base code lives in each page's <head>)
  function fbTrack(name, params) {
    if (typeof window.fbq === "function") window.fbq("track", name, params || {});
  }

  // Lebanese mobiles: 03 XXX XXX, 7X XXX XXX (70/71/76/78/79…), 81 XXX XXX — with or without +961
  function isLebaneseMobile(raw) {
    let p = String(raw || "").replace(/\D/g, "");
    if (p.startsWith("00961")) p = p.slice(5);
    else if (p.startsWith("961")) p = p.slice(3);
    if (p.startsWith("0")) p = p.slice(1);
    return /^(3\d{6}|7\d{7}|81\d{6})$/.test(p);
  }

  async function sendOrderToDiscord(data, cart, total) {
    const items = cart
      .map((c) => `• ${c.variant} × ${c.qty} (${money(c.price)})`)
      .join("\n");
    const payload = {
      content: `${PRODUCT.emoji} **NEW ORDER** — ${PRODUCT.name} (COD 🇱🇧)`,
      embeds: [
        {
          title: "Order details",
          color: 0x7c5cfc,
          fields: [
            { name: "👤 Name", value: data.name || "—", inline: true },
            { name: "📱 Mobile", value: data.phone || "—", inline: true },
            { name: "📧 Email", value: data.email || "—", inline: true },
            { name: "📍 Address", value: `${data.address || "—"}, ${data.city || ""}`, inline: false },
            { name: "🛒 Items", value: items || "—", inline: false },
            { name: "💵 Total (cash on delivery)", value: money(total), inline: true },
          ],
        },
      ],
    };
    const res = await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Discord webhook failed: " + res.status);
  }

  /* ---------- Product config ----------
     Each product page defines window.PRODUCT inline before loading this
     script: { name, title, emoji, giftLine, variants, gallery, videos }   */
  const PRODUCT = window.PRODUCT || {};
  const VARIANTS = PRODUCT.variants || [];
  const GALLERY = PRODUCT.gallery || [];
  const VIDEOS = PRODUCT.videos || [];

  const UNIT_PRICE = PRODUCT.price || 22;

  /* ---------- State ---------- */
  const state = {
    variant: VARIANTS[0],
    qty: 1,
    galIndex: 0,
    cart: [],
  };

  /* ============================================================
     Gallery
     ============================================================ */
  const galMain = $("#galMain");
  const thumbsEl = $("#thumbs");

  function renderThumbs() {
    thumbsEl.innerHTML = "";
    GALLERY.forEach((src, i) => {
      const b = document.createElement("button");
      b.className = "thumb" + (i === state.galIndex ? " active" : "");
      b.innerHTML = `<img src="${src}" alt="View ${i + 1}" loading="lazy">`;
      b.addEventListener("click", () => setMain(i));
      thumbsEl.appendChild(b);
    });
  }
  function setMain(i) {
    state.galIndex = (i + GALLERY.length) % GALLERY.length;
    galMain.src = GALLERY[state.galIndex];
    $$(".thumb", thumbsEl).forEach((t, idx) =>
      t.classList.toggle("active", idx === state.galIndex)
    );
  }
  $("#galPrev").addEventListener("click", () => setMain(state.galIndex - 1));
  $("#galNext").addEventListener("click", () => setMain(state.galIndex + 1));

  /* ============================================================
     Variant swatches
     ============================================================ */
  const swatchesEl = $("#swatches");
  function renderSwatches() {
    swatchesEl.innerHTML = "";
    VARIANTS.forEach((v) => {
      const b = document.createElement("button");
      b.className = "swatch" + (v.id === state.variant.id ? " active" : "");
      b.type = "button";
      b.innerHTML = `<img src="${v.split}" alt="${v.name}" loading="lazy"><span>${v.name}</span>`;
      b.addEventListener("click", () => selectVariant(v, true));
      swatchesEl.appendChild(b);
    });
  }
  function selectVariant(v, showInGallery) {
    state.variant = v;
    $("#variantName").textContent = v.name;
    $$(".swatch", swatchesEl).forEach((s, i) =>
      s.classList.toggle("active", VARIANTS[i].id === v.id)
    );
    if (showInGallery) setMain(v.galIndex);
  }

  /* ============================================================
     Quantity stepper
     ============================================================ */
  const qtyValueEl = $("#qtyValue");
  $("#qtyMinus").addEventListener("click", () => setQty(state.qty - 1));
  $("#qtyPlus").addEventListener("click", () => setQty(state.qty + 1));
  function setQty(q) {
    state.qty = Math.min(10, Math.max(1, q));
    qtyValueEl.textContent = state.qty;
    updatePrices();
  }
  function updatePrices() {
    $("#ctaPrice").textContent = money(UNIT_PRICE * state.qty);
    $("#stickyPrice").textContent = money(UNIT_PRICE * state.qty);
  }

  /* ---------- Live viewers (social proof) ---------- */
  const viewersEl = $("#viewersNow");
  if (viewersEl) {
    let viewers = 140 + Math.floor(Math.random() * 160);
    viewersEl.textContent = viewers;
    setInterval(() => {
      viewers = Math.max(90, viewers + Math.floor(Math.random() * 11) - 5);
      viewersEl.textContent = viewers;
    }, 7000);
  }

  /* ============================================================
     Variants showcase grid
     ============================================================ */
  const vGrid = $("#variantsGrid");
  VARIANTS.forEach((v) => {
    const c = document.createElement("div");
    c.className = "vcard";
    c.innerHTML = `<img src="${v.split}" alt="${v.name} smart track car" loading="lazy"><div class="vcard-name">${v.name}</div>`;
    c.addEventListener("click", () => {
      selectVariant(v, true);
      $("#buy").scrollIntoView({ behavior: "smooth" });
      toast(`${v.name} selected! 💜`);
    });
    vGrid.appendChild(c);
  });

  /* ============================================================
     Videos
     ============================================================ */
  const vidGrid = $("#videoGrid");
  VIDEOS.forEach((v) => {
    const card = document.createElement("div");
    card.className = "vid";
    card.innerHTML = `
      <span class="vid-tag">${v.tag}</span>
      <video src="${v.src}" poster="${v.poster}" preload="none" playsinline loop></video>
      <button class="vid-play" aria-label="Play video"><span>▶</span></button>`;
    const video = $("video", card);
    const play = $(".vid-play", card);
    play.addEventListener("click", () => {
      // pause any other playing video
      $$("video", vidGrid).forEach((o) => { if (o !== video) { o.pause(); } });
      video.controls = true;
      video.play();
      play.style.display = "none";
    });
    video.addEventListener("pause", () => { if (!video.ended) play.style.display = "grid"; });
    video.addEventListener("play", () => { play.style.display = "none"; });
    vidGrid.appendChild(card);
  });

  /* ============================================================
     Cart
     ============================================================ */
  const drawer = $("#cartDrawer");
  const overlay = $("#drawerOverlay");

  function openDrawer() {
    drawer.classList.add("open");
    overlay.classList.add("show");
    drawer.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.classList.remove("show");
    drawer.setAttribute("aria-hidden", "true");
  }
  $("#cartOpen").addEventListener("click", openDrawer);
  $("#cartClose").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);

  function addToCart(showDrawer = true, source = "unknown") {
    const total = UNIT_PRICE * state.qty;
    state.cart.push({
      id: Date.now() + "-" + Math.round(total * 100),
      variant: state.variant.name,
      img: state.variant.split,
      qty: state.qty,
      price: total,
    });
    renderCart();
    if (showDrawer) {
      openDrawer();
      toast("Added to cart! 🎉");
    }
    track("add_to_cart", {
      currency: "USD",
      value: total,
      cta: source, // which button was clicked
      items: [{ item_name: PRODUCT.name, item_variant: state.variant.name, quantity: state.qty, price: UNIT_PRICE }],
    });
    fbTrack("AddToCart", {
      content_name: PRODUCT.name,
      content_type: "product",
      currency: "USD",
      value: total,
    });
  }

  function renderCart() {
    const itemsEl = $("#cartItems");
    const count = state.cart.reduce((a, c) => a + c.qty, 0);
    const total = state.cart.reduce((a, c) => a + c.price, 0);

    $("#cartCount").textContent = count;
    $("#cartCount").style.display = count ? "grid" : "none";

    const empty = state.cart.length === 0;
    $("#cartEmpty").style.display = empty ? "block" : "none";
    $("#drawerFoot").hidden = empty;

    itemsEl.innerHTML = state.cart
      .map(
        (c) => `
      <div class="cart-item" data-id="${c.id}">
        <img src="${c.img}" alt="${c.variant}">
        <div class="cart-item-info">
          <strong>${PRODUCT.title}</strong>
          <div class="ci-variant">${c.variant} · Qty: ${c.qty}</div>
          <div class="ci-gift">${PRODUCT.giftLine}</div>
          <div class="ci-bottom">
            <span class="ci-price">${money(c.price)}</span>
            <button class="ci-remove" data-id="${c.id}">Remove</button>
          </div>
        </div>
      </div>`
      )
      .join("");

    $("#cartTotal").textContent = money(total);
    $("#coTotal").textContent = money(total);

    $$(".ci-remove", itemsEl).forEach((btn) =>
      btn.addEventListener("click", () => {
        state.cart = state.cart.filter((c) => c.id !== btn.dataset.id);
        renderCart();
      })
    );
  }

  // BUY NOW → straight to checkout; "add to cart" links open the drawer.
  // Each button fires its own named GA event so counts are separable.
  $("#buyNow").addEventListener("click", () => {
    track("click_buy_now", {
      item_name: PRODUCT.name,
      item_variant: state.variant.name,
      quantity: state.qty,
      value: UNIT_PRICE * state.qty,
      currency: "USD",
    });
    addToCart(false, "buy_now");
    openCheckout();
  });
  $("#stickyBtn").addEventListener("click", () => {
    track("click_add_to_cart", { item_name: PRODUCT.name, cta: "sticky_bar" });
    addToCart(true, "sticky_bar");
  });
  $("#buyInstant").addEventListener("click", () => {
    track("click_add_to_cart", { item_name: PRODUCT.name, cta: "under_buy_now" });
    addToCart(true, "under_buy_now");
  });

  /* ============================================================
     Checkout
     ============================================================ */
  const coOverlay = $("#checkoutOverlay");
  function openCheckout() {
    if (state.cart.length === 0) { toast("Add something first 💜"); return; }
    closeDrawer();
    const total = state.cart.reduce((a, c) => a + c.price, 0);
    $("#coSummary").innerHTML =
      state.cart
        .map(
          (c) =>
            `<div class="co-line"><span>${c.variant} × ${c.qty}</span><span>${money(c.price)}</span></div>`
        )
        .join("") +
      `<div class="co-line"><span>Delivery (within 2 days 🚚)</span><span>FREE</span></div>` +
      `<div class="co-line"><span>Payment</span><span>💵 Cash on delivery</span></div>` +
      `<div class="co-line tot"><span>Total</span><span>${money(total)}</span></div>`;
    $("#coTotal").textContent = money(total);
    $("#checkoutView").hidden = false;
    $("#thanksView").hidden = true;
    coOverlay.classList.add("show");
    track("begin_checkout", {
      currency: "USD",
      value: total,
      items: state.cart.map((c) => ({
        item_name: PRODUCT.name,
        item_variant: c.variant,
        quantity: c.qty,
        price: UNIT_PRICE,
      })),
    });
    fbTrack("InitiateCheckout", {
      currency: "USD",
      value: total,
      num_items: state.cart.reduce((a, c) => a + c.qty, 0),
    });
  }
  function closeCheckout() { coOverlay.classList.remove("show"); }

  $("#checkoutBtn").addEventListener("click", openCheckout);
  $("#checkoutClose").addEventListener("click", closeCheckout);
  $("#thanksClose").addEventListener("click", closeCheckout);
  coOverlay.addEventListener("click", (e) => { if (e.target === coOverlay) closeCheckout(); });

  const coPhone = $("#coPhone");
  coPhone.addEventListener("input", () => coPhone.setCustomValidity(""));

  $("#checkoutForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    coPhone.setCustomValidity("");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!isLebaneseMobile(coPhone.value)) {
      coPhone.setCustomValidity("Please enter a valid Lebanese mobile number (e.g. 03 123 456 or 71 123 456).");
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const total = state.cart.reduce((a, c) => a + c.price, 0);
    const btn = $("#coSubmit");
    const btnHtml = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Placing your order…";

    // Local backup of every order attempt
    try {
      const orders = JSON.parse(localStorage.getItem("magicaltoys_orders") || "[]");
      orders.push({ customer: data, cart: state.cart, total, ts: new Date().toISOString() });
      localStorage.setItem("magicaltoys_orders", JSON.stringify(orders));
    } catch (_) {}

    // Notify Discord (order details) — still show the popup if it fails
    try {
      await sendOrderToDiscord(data, state.cart, total);
    } catch (err) {
      console.error(err);
    }

    // GA4 standard "purchase" → shows in Monetization reports with revenue
    track("purchase", {
      transaction_id: "MT-" + Date.now(),
      currency: "USD",
      value: total,
      items: state.cart.map((c) => ({
        item_name: PRODUCT.name,
        item_variant: c.variant,
        quantity: c.qty,
        price: UNIT_PRICE,
      })),
    });
    // Meta "Purchase" — the conversion event to optimize ad campaigns on
    fbTrack("Purchase", {
      content_name: PRODUCT.name,
      content_type: "product",
      currency: "USD",
      value: total,
    });

    btn.disabled = false;
    btn.innerHTML = btnHtml;
    $("#thanksName").textContent = (data.name || "friend").split(" ")[0];
    $("#checkoutView").hidden = true;
    $("#thanksView").hidden = false;
    state.cart = [];
    renderCart();
  });

  /* ============================================================
     Sticky buy bar (mobile) — show after scrolling past buy box
     ============================================================ */
  const sticky = $("#stickyBuy");
  const buySection = $("#buy");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (window.innerWidth <= 640) {
          sticky.classList.toggle("show", !en.isIntersecting && en.boundingClientRect.top < 0);
        }
      });
    },
    { threshold: 0 }
  );
  io.observe(buySection);

  /* ============================================================
     Toast
     ============================================================ */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  // Close drawers/modals on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeDrawer(); closeCheckout(); }
  });

  /* ---------- Init ---------- */
  renderThumbs();
  renderSwatches();
  updatePrices();
  renderCart();
  setMain(0);

  // Funnel start: product page viewed (GA4 + Meta)
  track("view_item", {
    currency: "USD",
    value: UNIT_PRICE,
    items: [{ item_name: PRODUCT.name, price: UNIT_PRICE }],
  });
  fbTrack("ViewContent", {
    content_name: PRODUCT.name,
    content_type: "product",
    currency: "USD",
    value: UNIT_PRICE,
  });
})();
