// ==========================================================================
// Sun Rise Poultry — main.js
// ==========================================================================
(function () {
  "use strict";

  const API = ""; // same-origin API

  /* ---------------- Nav scroll state ---------------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector(".nav-links");
  navToggle?.addEventListener("click", () => {
    const open = navLinks.style.display === "flex";
    navLinks.style.display = open ? "none" : "flex";
    navLinks.style.cssText += open
      ? ""
      : "position:absolute;top:100%;left:0;right:0;flex-direction:column;background:var(--paper);padding:1.2rem 6vw;gap:1rem;box-shadow:0 12px 24px -12px rgba(0,0,0,0.2);";
  });

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Products: load + render ---------------- */
  const productGrid = document.getElementById("productGrid");
  const productSelect = document.getElementById("productId");
  let PRODUCTS = [];

  const featuredIcon = { "standard-45": "🐓", "premium-hold": "✨", "bulk-event": "📦" };

  function renderProducts(products) {
    productGrid.innerHTML = products
      .map(
        (p, i) => `
      <div class="product-card ${p.id === "premium-hold" ? "featured" : ""} reveal is-visible" style="transition-delay:${i * 90}ms">
        ${p.id === "premium-hold" ? '<span class="product-tag">Most Requested</span>' : ""}
        <h3>${featuredIcon[p.id] || "🐔"} ${p.name}</h3>
        <div class="subtitle">${p.subtitle}</div>
        <div class="product-price">
          <span class="amount">${p.price.toLocaleString()}</span>
          <span class="unit">FCFA ${p.unit}</span>
        </div>
        <p class="desc">${p.description}</p>
        <a href="#order" class="btn btn-outline choose-btn" data-id="${p.id}" style="border-color:rgba(240,166,40,0.5); color:#fff;">Choose &amp; Order</a>
      </div>`
      )
      .join("");

    productGrid.querySelectorAll(".choose-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (productSelect) productSelect.value = btn.dataset.id;
        updateTotal();
      });
    });
  }

  function populateSelect(products) {
    if (!productSelect) return;
    productSelect.innerHTML = products
      .map((p) => `<option value="${p.id}">${p.name} — ${p.price.toLocaleString()} FCFA ${p.unit}</option>`)
      .join("");
  }

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      PRODUCTS = data.products || [];
    } catch (e) {
      // fallback static data if backend not reachable
      PRODUCTS = [
        { id: "standard-45", name: "Standard Live Broiler", subtitle: "45-day market-weight bird", price: 3500, unit: "per bird", description: "Our classic farm-fresh broiler, raised over a full 45-day cycle.", minQty: 1 },
        { id: "premium-hold", name: "Premium Extended-Hold Bird", subtitle: "50-55 day, larger size", price: 5000, unit: "per bird", description: "Held a little longer for extra size and weight.", minQty: 1 },
        { id: "bulk-event", name: "Bulk / Event Order", subtitle: "20+ birds, restaurants, caterers", price: 3400, unit: "per bird (20+)", description: "Wholesale pricing for restaurants, hotels and caterers.", minQty: 20 }
      ];
    }
    renderProducts(PRODUCTS);
    populateSelect(PRODUCTS);
    updateTotal();
  }
  loadProducts();

  /* ---------------- Order form ---------------- */
  const orderForm = document.getElementById("orderForm");
  const quantityInput = document.getElementById("quantity");
  const orderTotalEl = document.getElementById("orderTotal");
  const submitBtn = document.getElementById("submitBtn");
  const formMsg = document.getElementById("formMsg");

  const deliveryRadios = document.querySelectorAll('input[name="deliveryMethod"]');
  const addressField = document.getElementById("addressField");
  const zoneField = document.getElementById("zoneField");
  const addressInput = document.getElementById("address");

  function toggleDeliveryFields() {
    const method = document.querySelector('input[name="deliveryMethod"]:checked')?.value;
    const isDelivery = method === "delivery";
    addressField.style.display = isDelivery ? "block" : "none";
    zoneField.style.display = isDelivery ? "block" : "none";
    addressInput.required = isDelivery;
  }
  deliveryRadios.forEach((r) => r.addEventListener("change", toggleDeliveryFields));
  toggleDeliveryFields();

  function updateTotal() {
    if (!productSelect || !PRODUCTS.length) return;
    const product = PRODUCTS.find((p) => p.id === productSelect.value) || PRODUCTS[0];
    const qty = Math.max(1, Number(quantityInput.value) || 1);
    const total = product ? product.price * qty : 0;
    orderTotalEl.textContent = `${total.toLocaleString()} FCFA`;

    // gentle nudge toward minimum bulk quantity
    if (product && qty < product.minQty) {
      orderTotalEl.title = `Minimum quantity for this option is ${product.minQty} birds`;
    } else {
      orderTotalEl.title = "";
    }
  }
  productSelect?.addEventListener("change", updateTotal);
  quantityInput?.addEventListener("input", updateTotal);

  function showMsg(type, message, details) {
    formMsg.className = `form-msg show ${type}`;
    formMsg.innerHTML = `<strong>${message}</strong>` + (details && details.length ? `<ul>${details.map((d) => `<li>${d}</li>`).join("")}</ul>` : "");
    formMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function showToast(text) {
    const toast = document.getElementById("toast");
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4200);
  }

  orderForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Placing order…";

    const payload = {
      productId: productSelect.value,
      quantity: Number(quantityInput.value),
      customerName: document.getElementById("customerName").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      deliveryMethod: document.querySelector('input[name="deliveryMethod"]:checked')?.value,
      address: document.getElementById("address").value,
      deliveryZone: document.getElementById("deliveryZone").value,
      preferredDate: document.getElementById("preferredDate").value,
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value,
      notes: document.getElementById("notes").value
    };

    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        showMsg("error", data.error || "Something went wrong.", data.details);
      } else {
        showMsg(
          "success",
          `Order placed! Reference: ${data.order.orderNumber}`,
          [`We'll confirm by phone/WhatsApp shortly.`, `Total: ${data.order.total.toLocaleString()} FCFA`]
        );
        showToast(`🎉 Order ${data.order.orderNumber} received — thank you!`);
        orderForm.reset();
        toggleDeliveryFields();
        updateTotal();
      }
    } catch (err) {
      showMsg("error", "Could not reach the server.", ["Check your connection and try again, or order via WhatsApp."]);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Place Order";
    }
  });

  /* ---------------- Order tracking ---------------- */
  const trackForm = document.getElementById("trackForm");
  const trackResult = document.getElementById("trackResult");

  const STATUS_LABEL = {
    pending: "Pending Confirmation",
    confirmed: "Confirmed",
    "out-for-delivery": "Out for Delivery",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  trackForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const orderNumber = document.getElementById("trackOrderNumber").value.trim();
    const phone = document.getElementById("trackPhone").value.trim();

    trackResult.className = "track-result show";
    trackResult.innerHTML = "Checking…";

    try {
      const res = await fetch(`${API}/api/orders/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone })
      });
      const data = await res.json();

      if (!res.ok) {
        trackResult.innerHTML = `<p style="color:var(--maroon-700);margin:0;">${data.error}</p>`;
        return;
      }

      const o = data.order;
      trackResult.innerHTML = `
        <span class="status-pill status-${o.status}">${STATUS_LABEL[o.status] || o.status}</span>
        <div style="margin-top:1rem;display:grid;gap:0.5rem;font-size:0.92rem;">
          <div><strong>${o.productName}</strong> × ${o.quantity}</div>
          <div>Total: <strong>${o.total.toLocaleString()} FCFA</strong></div>
          <div>Method: ${o.deliveryMethod === "delivery" ? "Delivery" : "Farm pickup"}</div>
          ${o.preferredDate ? `<div>Preferred date: ${o.preferredDate}</div>` : ""}
          <div style="color:var(--ink-400);font-size:0.82rem;">Placed ${new Date(o.createdAt).toLocaleString()}</div>
        </div>`;
    } catch (err) {
      trackResult.innerHTML = `<p style="color:var(--maroon-700);margin:0;">Could not reach the server. Please try again.</p>`;
    }
  });

  /* ---------------- WhatsApp deep link keeps chosen product in message ---------------- */
  const whatsappLink = document.getElementById("whatsappLink");
  function updateWhatsapp() {
    const product = PRODUCTS.find((p) => p.id === productSelect?.value);
    const text = encodeURIComponent(
      `Hello Sun Rise Poultry! I'd like to order ${quantityInput?.value || 1} x ${product ? product.name : "birds"}.`
    );
    whatsappLink.href = `https://wa.me/237000000000?text=${text}`;
  }
  productSelect?.addEventListener("change", updateWhatsapp);
  quantityInput?.addEventListener("input", updateWhatsapp);
  setTimeout(updateWhatsapp, 600);
})();
