// Sun Rise Poultry Enterprise — frontend logic
// Talks to the Express API served from the same origin (see backend/server.js).
// If you deploy the frontend separately from the backend, set window.SUNRISE_API_BASE
// to the backend's full URL before this script runs.

const API_BASE = window.SUNRISE_API_BASE || "";
const CART_KEY = "sunrise_cart_v1";

const state = {
  products: [],
  deliveryOptions: [],
  cart: loadCart(),
  selectedDelivery: null,
};

// ---------------------------------------------------------------- utilities

function money(n) {
  return new Intl.NumberFormat("en-US").format(n) + " FCFA";
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------------------------------------------------------------- icons per product

const PRODUCT_ICONS = {
  standard: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="140" fill="#ece2c6"/><ellipse cx="90" cy="95" rx="46" ry="30" fill="#fffdf8" stroke="#16241b" stroke-width="2"/><circle cx="128" cy="58" r="20" fill="#fffdf8" stroke="#16241b" stroke-width="2"/><polygon points="146,50 160,52 146,58" fill="#e7a94c"/><polygon points="144,40 134,26 154,30" fill="#b5551f"/><circle cx="134" cy="54" r="2.4" fill="#16241b"/></svg>`,
  premium: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="140" fill="#ece2c6"/><ellipse cx="95" cy="98" rx="58" ry="36" fill="#fffdf8" stroke="#16241b" stroke-width="2"/><circle cx="140" cy="54" r="23" fill="#fffdf8" stroke="#16241b" stroke-width="2"/><polygon points="160,46 176,48 160,55" fill="#e7a94c"/><polygon points="158,34 146,18 168,22" fill="#b5551f"/><circle cx="146" cy="50" r="2.6" fill="#16241b"/><path d="M40 100 q-14 -4 -18 8" stroke="#e7a94c" stroke-width="3" fill="none"/></svg>`,
  bulk: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="140" fill="#ece2c6"/><rect x="30" y="40" width="60" height="60" rx="4" fill="none" stroke="#6b4a32" stroke-width="4"/><rect x="90" y="55" width="50" height="45" rx="4" fill="none" stroke="#6b4a32" stroke-width="4"/><line x1="30" y1="60" x2="90" y2="60" stroke="#6b4a32" stroke-width="3"/><line x1="60" y1="40" x2="60" y2="100" stroke="#6b4a32" stroke-width="3"/><circle cx="150" cy="40" r="14" fill="#fffdf8" stroke="#16241b" stroke-width="2"/><ellipse cx="150" cy="66" rx="22" ry="16" fill="#fffdf8" stroke="#16241b" stroke-width="2"/></svg>`,
  standing: `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="140" fill="#ece2c6"/><rect x="55" y="35" width="90" height="80" rx="6" fill="#fffdf8" stroke="#16241b" stroke-width="2"/><rect x="55" y="35" width="90" height="20" fill="#234b32"/><line x1="75" y1="28" x2="75" y2="45" stroke="#6b4a32" stroke-width="4"/><line x1="125" y1="28" x2="125" y2="45" stroke="#6b4a32" stroke-width="4"/><circle cx="80" cy="80" r="4" fill="#e7a94c"/><circle cx="100" cy="80" r="4" fill="#e7a94c"/><circle cx="120" cy="80" r="4" fill="#e7a94c"/><circle cx="80" cy="98" r="4" fill="#b5551f"/><circle cx="100" cy="98" r="4" fill="#e7a94c"/></svg>`,
};

// ---------------------------------------------------------------- rendering

function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = state.products
    .map((p) => {
      const qty = state.cart[p.id]?.qty || p.minQty;
      return `
      <div class="product-card reveal in-view" data-id="${p.id}">
        <div class="product-visual">${PRODUCT_ICONS[p.image] || ""}</div>
        <span class="product-badge">${p.badge}</span>
        <h3>${p.name}</h3>
        <div class="product-sub">${p.subtitle}</div>
        <p class="desc">${p.description}</p>
        <div class="product-meta">
          <div class="product-price">${money(p.unitPrice)}<br><small>per ${p.unit}</small></div>
          <div class="product-weight">${p.weightRange}<br><small>min. ${p.minQty} ${p.minQty > 1 ? "birds" : "bird"}</small></div>
        </div>
        <div class="qty-row">
          <div class="qty-control">
            <button type="button" class="qty-dec" aria-label="Decrease quantity">–</button>
            <input type="number" class="qty-input" value="${qty}" min="${p.minQty}" inputmode="numeric" aria-label="Quantity">
            <button type="button" class="qty-inc" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="add-btn">Add to order</button>
        </div>
      </div>`;
    })
    .join("");

  grid.querySelectorAll(".product-card").forEach((card) => {
    const id = card.dataset.id;
    const product = state.products.find((p) => p.id === id);
    const input = card.querySelector(".qty-input");

    card.querySelector(".qty-dec").addEventListener("click", () => {
      input.value = Math.max(product.minQty, Number(input.value) - 1);
    });
    card.querySelector(".qty-inc").addEventListener("click", () => {
      input.value = Number(input.value) + 1;
    });
    input.addEventListener("change", () => {
      if (Number(input.value) < product.minQty) input.value = product.minQty;
    });

    const addBtn = card.querySelector(".add-btn");
    addBtn.addEventListener("click", () => {
      const qty = Math.max(product.minQty, Number(input.value) || product.minQty);
      state.cart[id] = { qty };
      saveCart();
      renderCart();
      addBtn.textContent = "Added ✓";
      addBtn.classList.add("added");
      showToast(`${product.name} added to your order`);
      setTimeout(() => {
        addBtn.textContent = "Add to order";
        addBtn.classList.remove("added");
      }, 1200);
    });
  });
}

function renderDeliveryOptions() {
  const wrap = document.getElementById("deliveryOptions");
  wrap.innerHTML = state.deliveryOptions
    .map(
      (d, i) => `
      <label class="delivery-option" data-id="${d.id}">
        <input type="radio" name="delivery" value="${d.id}" ${i === 0 ? "checked" : ""}>
        <div class="delivery-option-copy">
          <b>${d.label}</b>
          <span>${d.description}</span>
        </div>
        <span class="delivery-fee">${d.fee > 0 ? "+" + money(d.fee) : "Free"}</span>
      </label>`
    )
    .join("");

  const labels = wrap.querySelectorAll(".delivery-option");
  labels.forEach((label) => {
    const radio = label.querySelector("input");
    if (radio.checked) {
      label.classList.add("selected");
      state.selectedDelivery = label.dataset.id;
    }
    radio.addEventListener("change", () => {
      labels.forEach((l) => l.classList.remove("selected"));
      label.classList.add("selected");
      state.selectedDelivery = label.dataset.id;
      renderCart();
    });
  });
}

function renderCart() {
  const lines = document.getElementById("cartLines");
  const empty = document.getElementById("cartEmpty");
  const totalsBox = document.getElementById("cartTotals");
  const entries = Object.entries(state.cart).filter(([, v]) => v.qty > 0);

  const count = entries.reduce((sum, [, v]) => sum + v.qty, 0);
  document.getElementById("cartCount").textContent = count;

  if (entries.length === 0) {
    lines.innerHTML = "";
    lines.appendChild(empty);
    totalsBox.style.display = "none";
    document.getElementById("submitOrderBtn").disabled = true;
    return;
  }

  document.getElementById("submitOrderBtn").disabled = false;

  let subtotal = 0;
  lines.innerHTML = entries
    .map(([id, v]) => {
      const p = state.products.find((pp) => pp.id === id);
      if (!p) return "";
      const lineTotal = p.unitPrice * v.qty;
      subtotal += lineTotal;
      return `
      <div class="cart-line" data-id="${id}">
        <div>
          <div class="cart-line-name">${p.name}</div>
          <div class="cart-line-meta">${v.qty} × ${money(p.unitPrice)} &nbsp;·&nbsp; <button class="cart-remove" data-id="${id}">remove</button></div>
        </div>
        <div class="cart-line-total">${money(lineTotal)}</div>
      </div>`;
    })
    .join("");

  lines.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      delete state.cart[btn.dataset.id];
      saveCart();
      renderCart();
      renderProducts();
    });
  });

  const delivery = state.deliveryOptions.find((d) => d.id === state.selectedDelivery);
  const fee = delivery ? delivery.fee : 0;

  document.getElementById("cartSubtotal").textContent = money(subtotal);
  document.getElementById("cartDeliveryFee").textContent = fee > 0 ? money(fee) : "Free";
  document.getElementById("cartGrandTotal").textContent = money(subtotal + fee);
  totalsBox.style.display = "grid";
}

// ---------------------------------------------------------------- data loading

async function loadCatalog() {
  try {
    const [pRes, dRes] = await Promise.all([
      fetch(`${API_BASE}/api/products`),
      fetch(`${API_BASE}/api/delivery-options`),
    ]);
    const pData = await pRes.json();
    const dData = await dRes.json();
    state.products = pData.products;
    state.deliveryOptions = dData.deliveryOptions;
    renderProducts();
    renderDeliveryOptions();
    renderCart();
  } catch (err) {
    document.getElementById("productGrid").innerHTML =
      `<p style="grid-column:1/-1;">We couldn't reach the ordering system. Please make sure the backend server is running, or call/WhatsApp us directly to place your order.</p>`;
    console.error(err);
  }
}

// ---------------------------------------------------------------- order submission

async function submitOrder(e) {
  e.preventDefault();
  const msg = document.getElementById("formMsg");
  msg.textContent = "";
  msg.classList.remove("error");

  const entries = Object.entries(state.cart).filter(([, v]) => v.qty > 0);
  if (entries.length === 0) {
    msg.textContent = "Add at least one bird to your order first.";
    msg.classList.add("error");
    return;
  }

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  if (!name || !phone) {
    msg.textContent = "Please enter your name and phone number.";
    msg.classList.add("error");
    return;
  }

  const payload = {
    customer: {
      name,
      phone,
      address: document.getElementById("custAddress").value.trim() || null,
      customerType: document.getElementById("custType").value,
    },
    items: entries.map(([productId, v]) => ({ productId, qty: v.qty })),
    deliveryOptionId: state.selectedDelivery,
    preferredDate: document.getElementById("custDate").value || null,
    notes: document.getElementById("custNotes").value.trim() || null,
  };

  const btn = document.getElementById("submitOrderBtn");
  btn.disabled = true;
  btn.textContent = "Sending order…";

  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong placing your order.");
    }

    showConfirmation(data.order);
    state.cart = {};
    saveCart();
    renderCart();
    renderProducts();
    document.getElementById("orderForm").reset();
  } catch (err) {
    msg.textContent = err.message;
    msg.classList.add("error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Confirm order";
  }
}

function showConfirmation(order) {
  document.getElementById("confirmOrderId").textContent = order.id;
  document.getElementById("confirmSummary").textContent =
    `${order.items.reduce((s, i) => s + i.qty, 0)} bird(s) · Total ${money(order.total)} · We'll reach you at ${order.customer.phone}.`;

  const waMsg = encodeURIComponent(
    `Hello Sun Rise Poultry, I just placed order ${order.id} online (${money(order.total)} total). Please confirm my order.`
  );
  document.getElementById("confirmWhatsapp").href = `https://wa.me/237000000000?text=${waMsg}`;

  document.getElementById("confirmOverlay").classList.add("show");
}

document.getElementById("confirmClose").addEventListener("click", () => {
  document.getElementById("confirmOverlay").classList.remove("show");
});
document.getElementById("confirmOverlay").addEventListener("click", (e) => {
  if (e.target.id === "confirmOverlay") e.currentTarget.classList.remove("show");
});

// ---------------------------------------------------------------- header, nav, scroll fx

function initHeader() {
  const header = document.getElementById("siteHeader");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
  });

  document.getElementById("cartToggle").addEventListener("click", () => {
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
  });

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");
  menuToggle.addEventListener("click", () => {
    const open = navLinks.style.display === "flex";
    navLinks.style.display = open ? "" : "flex";
    navLinks.style.cssText = open
      ? ""
      : "display:flex; position:absolute; top:100%; left:0; right:0; flex-direction:column; background:var(--paper); padding:20px 28px; box-shadow: var(--shadow-soft);";
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
}

function initTimeline() {
  const timeline = document.getElementById("timeline");
  const progress = document.getElementById("timelineProgress");
  const steps = document.querySelectorAll(".timeline-step");
  let done = false;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !done) {
          done = true;
          progress.style.width = "100%";
          steps.forEach((step, i) => {
            setTimeout(() => step.classList.add("active"), i * 260);
          });
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  if (timeline) io.observe(timeline);
}

// ---------------------------------------------------------------- init

document.getElementById("year").textContent = new Date().getFullYear();
initHeader();
initReveal();
initTimeline();
document.getElementById("orderForm").addEventListener("submit", submitOrder);
loadCatalog();
