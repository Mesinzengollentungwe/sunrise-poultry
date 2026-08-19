const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export const api = {
  getProducts: (category) => request(`/products${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  getProduct: (id) => request(`/products/${id}`),
  createOrder: (payload) => request(`/orders`, { method: "POST", body: JSON.stringify(payload) }),
  getOrder: (id) => request(`/orders/${id}`),
  initiateMomo: (payload) => request(`/payments/momo/initiate`, { method: "POST", body: JSON.stringify(payload) }),
  initiateOrange: (payload) => request(`/payments/orange/initiate`, { method: "POST", body: JSON.stringify(payload) }),
  getPaymentStatus: (orderId) => request(`/payments/status/${orderId}`)
};
