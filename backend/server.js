const express = require("express");
const cors = require("cors");
const path = require("path");
const { nanoid } = require("nanoid");

const { PRODUCTS, DELIVERY_OPTIONS } = require("./products");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_KEY = process.env.ADMIN_KEY || "sunrise2026";

app.use(cors());
app.use(express.json());

// Serve the frontend (index.html, admin.html, styles, scripts) from the same
// server as the API, so the whole site runs from a single `npm start`.
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

// ---------- helpers ----------

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function findDelivery(id) {
  return DELIVERY_OPTIONS.find((d) => d.id === id);
}

function requireAdmin(req, res, next) {
  const key = req.header("x-admin-key");
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Invalid or missing admin key." });
  }
  next();
}

// ---------- public: catalog ----------

app.get("/api/products", (req, res) => {
  res.json({ products: PRODUCTS });
});

app.get("/api/delivery-options", (req, res) => {
  res.json({ deliveryOptions: DELIVERY_OPTIONS });
});

// ---------- public: orders ----------

app.post("/api/orders", (req, res) => {
  const { customer, items, deliveryOptionId, preferredDate, notes } = req.body || {};

  // --- validate customer ---
  if (!customer || !customer.name || !customer.phone) {
    return res.status(400).json({ error: "Customer name and phone number are required." });
  }

  // --- validate items ---
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "At least one item is required." });
  }

  const lineItems = [];
  for (const raw of items) {
    const product = findProduct(raw.productId);
    if (!product) {
      return res.status(400).json({ error: `Unknown product: ${raw.productId}` });
    }
    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < product.minQty) {
      return res.status(400).json({
        error: `${product.name} requires a minimum quantity of ${product.minQty}.`,
      });
    }
    lineItems.push({
      productId: product.id,
      name: product.name,
      unitPrice: product.unitPrice, // price always taken from server catalog, never trusted from client
      qty,
      lineTotal: product.unitPrice * qty,
    });
  }

  // --- validate delivery ---
  const delivery = findDelivery(deliveryOptionId);
  if (!delivery) {
    return res.status(400).json({ error: "Please choose a valid delivery option." });
  }

  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
  const deliveryFee = delivery.fee;
  const total = subtotal + deliveryFee;

  const order = {
    id: `SRP-${nanoid(8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "pending_confirmation",
    customer: {
      name: String(customer.name).trim(),
      phone: String(customer.phone).trim(),
      email: customer.email ? String(customer.email).trim() : null,
      address: customer.address ? String(customer.address).trim() : null,
      customerType: customer.customerType || "household",
    },
    items: lineItems,
    delivery: {
      optionId: delivery.id,
      label: delivery.label,
      fee: deliveryFee,
    },
    preferredDate: preferredDate || null,
    notes: notes ? String(notes).trim() : null,
    subtotal,
    total,
  };

  db.addOrder(order);

  res.status(201).json({ order });
});

app.get("/api/orders/:id", (req, res) => {
  const order = db.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  res.json({ order });
});

// ---------- admin ----------

app.get("/api/admin/orders", requireAdmin, (req, res) => {
  res.json({ orders: db.readOrders() });
});

app.patch("/api/admin/orders/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body || {};
  const allowed = ["pending_confirmation", "confirmed", "out_for_delivery", "completed", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(", ")}` });
  }
  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: "Order not found." });
  res.json({ order: updated });
});

app.get("/api/health", (req, res) => res.json({ ok: true, service: "sunrise-poultry-backend" }));

app.get("/admin", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "admin.html"));
});

app.listen(PORT, () => {
  console.log(`Sun Rise Poultry backend running on http://localhost:${PORT}`);
  console.log(`Admin key (set ADMIN_KEY env var to change): ${ADMIN_KEY}`);
});
