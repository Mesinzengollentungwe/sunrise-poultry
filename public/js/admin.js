(function () {
  "use strict";
  const API = "";
  const TOKEN_KEY = "srp_admin_token";

  const loginView = document.getElementById("loginView");
  const dashView = document.getElementById("dashView");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");
  const statCards = document.getElementById("statCards");
  const ordersBody = document.getElementById("ordersBody");
  const emptyState = document.getElementById("emptyState");
  const filterTabs = document.getElementById("filterTabs");

  let currentFilter = "all";
  let ALL_ORDERS = [];

  function getToken() { return localStorage_fallback_get(); }
  // NOTE: localStorage is fine here — this is a standalone deployable app, not a Claude.ai artifact.
  function localStorage_fallback_get() {
    try { return window.localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }
  function setToken(t) {
    try { window.localStorage.setItem(TOKEN_KEY, t); } catch (e) {}
  }
  function clearToken() {
    try { window.localStorage.removeItem(TOKEN_KEY); } catch (e) {}
  }

  function showToast(text) {
    const toast = document.getElementById("toast");
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3800);
  }

  async function authFetch(path, options = {}) {
    const token = getToken();
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` }
    });
    if (res.status === 401) {
      clearToken();
      showDashboard(false);
      throw new Error("Session expired");
    }
    return res;
  }

  function showDashboard(show) {
    loginView.style.display = show ? "none" : "flex";
    dashView.style.display = show ? "block" : "none";
    if (show) { loadStats(); loadOrders(); }
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    const password = document.getElementById("password").value;
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) {
        loginError.textContent = data.error || "Login failed.";
        return;
      }
      setToken(data.token);
      showDashboard(true);
    } catch (err) {
      loginError.textContent = "Could not reach the server.";
    }
  });

  logoutBtn.addEventListener("click", () => {
    clearToken();
    showDashboard(false);
  });

  async function loadStats() {
    try {
      const res = await authFetch("/api/admin/stats");
      const data = await res.json();
      statCards.innerHTML = `
        <div class="stat-card"><div class="label">Total Orders</div><div class="value">${data.totalOrders}</div></div>
        <div class="stat-card"><div class="label">Total Birds Ordered</div><div class="value">${data.totalBirds}</div></div>
        <div class="stat-card"><div class="label">Revenue (est.)</div><div class="value">${data.totalRevenue.toLocaleString()} F</div></div>
        <div class="stat-card"><div class="label">Pending</div><div class="value">${data.byStatus.pending || 0}</div></div>
      `;
    } catch (e) { /* handled by authFetch */ }
  }

  const STATUS_OPTIONS = ["pending", "confirmed", "out-for-delivery", "completed", "cancelled"];

  function renderOrders() {
    const filtered = currentFilter === "all" ? ALL_ORDERS : ALL_ORDERS.filter((o) => o.status === currentFilter);
    emptyState.style.display = filtered.length ? "none" : "block";

    ordersBody.innerHTML = filtered
      .map(
        (o) => `
      <tr data-id="${o.id}">
        <td><strong>${o.orderNumber}</strong></td>
        <td>${o.customerName}<br /><span style="color:var(--ink-400);font-size:0.78rem;">${o.phone}</span></td>
        <td>${o.productName}</td>
        <td>${o.quantity}</td>
        <td>${o.total.toLocaleString()} F</td>
        <td>${o.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}</td>
        <td>${new Date(o.createdAt).toLocaleDateString()} <br/><span style="color:var(--ink-400);font-size:0.78rem;">${new Date(o.createdAt).toLocaleTimeString()}</span></td>
        <td>
          <select class="status-select" data-id="${o.id}">
            ${STATUS_OPTIONS.map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s.replace(/-/g, " ")}</option>`).join("")}
          </select>
        </td>
      </tr>`
      )
      .join("");

    ordersBody.querySelectorAll(".status-select").forEach((sel) => {
      sel.addEventListener("change", async (e) => {
        const id = e.target.dataset.id;
        const status = e.target.value;
        try {
          const res = await authFetch(`/api/admin/orders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
          });
          if (res.ok) {
            showToast("Order status updated.");
            const idx = ALL_ORDERS.findIndex((o) => o.id === id);
            if (idx > -1) ALL_ORDERS[idx].status = status;
            loadStats();
          }
        } catch (err) {}
      });
    });
  }

  async function loadOrders() {
    try {
      const res = await authFetch("/api/admin/orders");
      const data = await res.json();
      ALL_ORDERS = data.orders || [];
      renderOrders();
    } catch (e) { /* handled */ }
  }

  filterTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-tab");
    if (!btn) return;
    filterTabs.querySelectorAll(".filter-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.status;
    renderOrders();
  });

  // Init
  if (getToken()) showDashboard(true);
  else showDashboard(false);

  // Light polling to keep dashboard fresh while open
  setInterval(() => { if (getToken()) loadOrders(); }, 20000);
})();
