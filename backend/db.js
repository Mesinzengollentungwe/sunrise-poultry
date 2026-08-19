// Lightweight JSON-file datastore.
//
// Sun Rise Poultry is a small, single-location farm business — this avoids
// requiring a separately hosted database server. Orders are stored in
// orders.json on disk. If you later need concurrent multi-user writes at
// scale, swap this module for a real database (Postgres, MySQL, SQLite via
// better-sqlite3) — every other file only talks to the functions exported
// here, so that swap does not touch your routes.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
}

function readOrders() {
  ensureStore();
  const raw = fs.readFileSync(ORDERS_FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeOrders(orders) {
  ensureStore();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

function addOrder(order) {
  const orders = readOrders();
  orders.unshift(order);
  writeOrders(orders);
  return order;
}

function getOrder(id) {
  return readOrders().find((o) => o.id === id) || null;
}

function updateOrderStatus(id, status) {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  writeOrders(orders);
  return orders[idx];
}

module.exports = { readOrders, addOrder, getOrder, updateOrderStatus };
