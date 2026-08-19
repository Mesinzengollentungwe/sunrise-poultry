import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../db.js";
import { products } from "../data/products.js";

const router = Router();

function calculateTotal(items) {
  return items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);
}

// POST /api/orders — create a new order (status: pending_payment)
router.post("/", async (req, res) => {
  const { items, customer } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must include at least one item" });
  }
  if (!customer?.name || !customer?.phone || !customer?.address) {
    return res.status(400).json({ error: "Customer name, phone, and delivery address are required" });
  }

  const total = calculateTotal(items);
  const order = {
    id: uuid(),
    reference: "SR" + Date.now().toString().slice(-8),
    items,
    customer,
    total,
    status: "pending_payment",
    paymentMethod: null,
    paymentReference: null,
    createdAt: new Date().toISOString()
  };

  await db.read();
  db.data.orders.push(order);
  await db.write();

  res.status(201).json({ order });
});

// GET /api/orders/:id — check order/payment status (used for polling after payment)
router.get("/:id", async (req, res) => {
  await db.read();
  const order = db.data.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ order });
});

export default router;
