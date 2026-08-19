# Sun Rise Poultry Enterprise Website & Online Ordering System

A full-stack website for **Sun Rise Poultry Ltd** (Nomayos, Yaoundé): a modern marketing site with a live online ordering system, order tracking, and a staff dashboard to manage incoming orders.

Built with **Node.js + Express** on the backend (REST API, JSON file database, JWT-protected admin routes) and **vanilla HTML/CSS/JavaScript** on the frontend (no build step required), styled around the brand's green/gold sunrise identity with scroll-reveal and hero animations.

---

## ✨ What's included

- **Public website** (`public/index.html`)
  - Animated sunrise hero, brand story, 5-stage rearing process, tiered pricing pulled live from the API, testimonials, contact/footer.
  - **Online order form** customers choose a bird type, quantity, pickup/delivery, payment method, and submit. Orders are validated and saved to the database, and the customer gets an order number back instantly.
  - **Order tracking** customers can check their order status using their order number + phone number.
  - A WhatsApp quick-order button for customers who prefer to chat directly.
- **Staff dashboard** (`public/admin.html`)
  - Password-protected login (JWT session).
  - Live stats: total orders, birds ordered, estimated revenue, pending count.
  - Orders table with filters by status, and a dropdown to move each order through `pending → confirmed → out-for-delivery → completed` (or `cancelled`).
- **Backend API** (`server.js`)
  - `GET /api/products` pricing catalog (standard, premium extended-hold, bulk/event matching the business plan's tiered pricing).
  - `POST /api/orders` place an order (validated, rate-limited).
  - `POST /api/orders/track` look up an order by order number + phone.
  - `POST /api/admin/login` staff login, returns a JWT.
  - `GET /api/admin/orders`, `PATCH /api/admin/orders/:id`, `GET /api/admin/stats` protected staff endpoints.

Orders are stored in `data/db.json` (a lightweight JSON database via `lowdb`), so nothing extra needs to be installed or configured to get a working database it just works out of the box. For a larger operation you can later swap this for Postgres/MySQL without changing the frontend.

---

## 🚀 Running it locally

**Requirements:** Node.js 18+ installed on your computer.

```bash
# 1. Install dependencies
npm install

# 2. Copy the example environment file and edit it
cp .env.example .env
# Open .env and set:
#   ADMIN_PASSWORD=  → the password staff will use to log into the dashboard
#   JWT_SECRET=      → any long random string (used to sign admin sessions)

# 3. Start the server
npm start
```

Then open:
- **Website:** http://localhost:3000
- **Staff dashboard:** http://localhost:3000/admin.html (log in with the password you set in `.env`)

That's it one server serves both the website and the API, so there's nothing else to run.

---

## 🌐 Putting it online (free/low-cost options)

Because this is a single Node.js app, it deploys easily to any Node-friendly host:

1. **Render.com** (free tier available) create a new "Web Service," connect this project (as a git repo or zip), set the build command to `npm install` and the start command to `npm start`, and add the `ADMIN_PASSWORD` / `JWT_SECRET` environment variables in the dashboard.
2. **Railway.app** similar flow: new project → deploy from repo/folder → set environment variables → deploy.
3. **A VPS (e.g. DigitalOcean, cheap Cameroonian/African hosting)** install Node.js, copy the project, run `npm install && npm start` (ideally behind `pm2` so it restarts automatically, and behind Nginx for a custom domain + HTTPS).

Once deployed, buy a domain (e.g. `sunrisepoultry.cm` or `.com`) and point it at your host no other code changes are required.

**Important before going live:**
- Change `ADMIN_PASSWORD` and `JWT_SECRET` in your production environment do not use the example values.
- Update the placeholder phone numbers (`+237 000 000 000`) in `public/index.html` and `public/js/main.js` (the WhatsApp link) with the real farm contact number.
- Update the email address and physical location text in the footer if needed.
- Replace testimonial names/quotes with real customer feedback once you have it.

---

## 🎨 Customizing

- **Colors, fonts, spacing:** all defined as CSS variables at the top of `public/css/style.css` (`:root { ... }`) change one value and it updates everywhere.
- **Pricing / products:** edit the `PRODUCTS` array near the top of `server.js`. The frontend pulls this list automatically, so pricing only needs to be changed in one place.
- **Logo:** replace `public/images/logo.jpeg` with a new file of the same name (or update the `src` references in the HTML).
- **Admin password:** set via the `ADMIN_PASSWORD` environment variable (never hard-coded in the frontend).

---

## 📁 Project structure

```
sunrise-poultry/
├── server.js              # Express server + REST API + JSON database
├── package.json
├── .env.example            # copy to .env and fill in your own values
├── data/
│   └── db.json              # auto-created order database
└── public/
    ├── index.html            # main website
    ├── admin.html            # staff dashboard
    ├── css/
    │   ├── style.css          # main site styling + animations
    │   └── admin.css          # dashboard styling
    ├── js/
    │   ├── main.js             # site interactivity, order form, tracking
    │   └── admin.js             # dashboard login, orders table, status updates
    └── images/
        └── logo.jpeg
```

---

## 🔒 Notes on security

- Admin routes are protected with JWT sessions (12-hour expiry) and the password is stored as a bcrypt hash, never in plain text.
- The order-placement endpoint is rate-limited to reduce spam/abuse.
- Order tracking requires both the order number *and* the phone number used at checkout, so customers can't browse each other's orders.
- For production, always serve the site over HTTPS (most hosts above provide this automatically) so order data and admin logins aren't sent in plain text.
