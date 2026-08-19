require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { nanoid } = require('nanoid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Make sure the data folder exists before lowdb tries to write into it
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const adapter = new FileSync(DB_PATH);
const db = low(adapter);

db.defaults({
  orders: [],
  settings: {
    adminPasswordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'sunrise2026', 10)
  }
}).write();

const JWT_SECRET = process.env.JWT_SECRET || 'sunrise-dev-secret-change-me';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Product / pricing catalog (matches business plan pricing) ----------
const PRODUCTS = [
  {
    id: 'standard-45',
    name: 'Standard Live Broiler',
    subtitle: '45-day market-weight bird',
    price: 3500,
    unit: 'per bird',
    description: 'Our classic farm-fresh broiler, raised over a full 45-day cycle on quality starter, grower and finisher feed. Perfect for households and everyday cooking.',
    minQty: 1
  },
  {
    id: 'premium-hold',
    name: 'Premium Extended-Hold Bird',
    subtitle: '50-55 day, larger size',
    price: 5000,
    unit: 'per bird',
    description: 'Held a little longer for extra size and weight. Ideal for large family meals, ceremonies and guests who want a heartier bird.',
    minQty: 1
  },
  {
    id: 'bulk-event',
    name: 'Bulk / Event Order',
    subtitle: '20+ birds, restaurants, caterers, agents',
    price: 3400,
    unit: 'per bird (20+)',
    description: 'Wholesale pricing for restaurants, hotels, caterers, market agents and event catering. Includes priority scheduling and delivery coordination.',
    minQty: 20
  }
];

// ---------- Helpers ----------
function generateOrderNumber() {
  const year = new Date().getFullYear();
  return `SRP-${year}-${nanoid(6).toUpperCase()}`;
}

function computeTotal(productId, quantity) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return null;
  return product.price * quantity;
}

function authAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing admin token.' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { error: 'Too many order attempts from this connection. Please try again in a few minutes.' }
});

// ---------- Public API ----------

app.get('/api/products', (req, res) => {
  res.json({ products: PRODUCTS });
});

app.post('/api/orders', orderLimiter, (req, res) => {
  const {
    productId, quantity, customerName, phone, email,
    deliveryMethod, address, deliveryZone, preferredDate,
    paymentMethod, notes
  } = req.body || {};

  const errors = [];
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) errors.push('Please choose a valid bird type.');
  const qty = Number(quantity);
  if (!qty || qty < 1) errors.push('Quantity must be at least 1.');
  if (product && qty && qty < product.minQty) {
    errors.push(`${product.name} requires a minimum of ${product.minQty} birds.`);
  }
  if (!customerName || customerName.trim().length < 2) errors.push('Please enter your full name.');
  if (!phone || phone.trim().length < 8) errors.push('Please enter a valid phone number.');
  if (!deliveryMethod || !['pickup', 'delivery'].includes(deliveryMethod)) errors.push('Please choose pickup or delivery.');
  if (deliveryMethod === 'delivery' && (!address || address.trim().length < 5)) errors.push('Please enter a delivery address.');
  if (!paymentMethod) errors.push('Please choose a payment method.');

  if (errors.length) {
    return res.status(400).json({ error: 'Please fix the following before we can place your order.', details: errors });
  }

  const order = {
    id: nanoid(12),
    orderNumber: generateOrderNumber(),
    productId,
    productName: product.name,
    unitPrice: product.price,
    quantity: qty,
    total: product.price * qty,
    customerName: customerName.trim(),
    phone: phone.trim(),
    email: (email || '').trim(),
    deliveryMethod,
    address: (address || '').trim(),
    deliveryZone: (deliveryZone || '').trim(),
    preferredDate: preferredDate || null,
    paymentMethod,
    notes: (notes || '').trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.get('orders').push(order).write();

  res.status(201).json({
    message: 'Order received. We will confirm by phone or WhatsApp shortly.',
    order: {
      orderNumber: order.orderNumber,
      productName: order.productName,
      quantity: order.quantity,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    }
  });
});

// Public order lookup - requires order number + phone for privacy
app.post('/api/orders/track', (req, res) => {
  const { orderNumber, phone } = req.body || {};
  if (!orderNumber || !phone) {
    return res.status(400).json({ error: 'Please provide both your order number and phone number.' });
  }
  const order = db.get('orders')
    .find(o => o.orderNumber.toLowerCase() === String(orderNumber).toLowerCase()
      && o.phone.replace(/\s+/g, '') === String(phone).replace(/\s+/g, ''))
    .value();

  if (!order) {
    return res.status(404).json({ error: 'No matching order found. Double-check your order number and phone.' });
  }

  res.json({
    order: {
      orderNumber: order.orderNumber,
      productName: order.productName,
      quantity: order.quantity,
      total: order.total,
      status: order.status,
      deliveryMethod: order.deliveryMethod,
      preferredDate: order.preferredDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }
  });
});

// ---------- Admin API ----------

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  const hash = db.get('settings.adminPasswordHash').value();
  if (!password || !bcrypt.compareSync(password, hash)) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

app.get('/api/admin/orders', authAdmin, (req, res) => {
  const orders = db.get('orders').orderBy(['createdAt'], ['desc']).value();
  res.json({ orders });
});

app.patch('/api/admin/orders/:id', authAdmin, (req, res) => {
  const { status } = req.body || {};
  const allowed = ['pending', 'confirmed', 'out-for-delivery', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }
  const order = db.get('orders').find({ id: req.params.id });
  if (!order.value()) return res.status(404).json({ error: 'Order not found.' });
  order.assign({ status, updatedAt: new Date().toISOString() }).write();
  res.json({ order: order.value() });
});

app.get('/api/admin/stats', authAdmin, (req, res) => {
  const orders = db.get('orders').value();
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const totalBirds = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.quantity, 0);
  const byStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  res.json({
    totalOrders: orders.length,
    totalRevenue,
    totalBirds,
    byStatus
  });
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sun Rise Poultry server running on http://localhost:${PORT}`);
});
