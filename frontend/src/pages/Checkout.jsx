import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Smartphone, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../api.js";

function formatXAF(amount) {
  return new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(amount) + " XAF";
}

const methods = [
  { id: "momo", label: "MTN Mobile Money", color: "bg-[#FFCB05]", text: "text-ink" },
  { id: "orange", label: "Orange Money", color: "bg-[#FF6600]", text: "text-white" }
];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [method, setMethod] = useState("momo");
  const [payPhone, setPayPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Your basket is empty.");
      return;
    }
    if (!customer.name || !customer.phone || !customer.address) {
      setError("Please fill in your name, phone, and delivery address.");
      return;
    }
    if (!payPhone) {
      setError("Please enter the phone number linked to your mobile money account.");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customer
      };
      const { order } = await api.createOrder(orderPayload);

      const initiate = method === "momo" ? api.initiateMomo : api.initiateOrange;
      const result = await initiate({ orderId: order.id, phone: payPhone });

      clearCart();
      navigate(`/order-confirmation?orderId=${order.id}`, {
        state: { demo: result.demo, method }
      });
    } catch (err) {
      setError(err.message || "Something went wrong while placing your order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="font-display text-3xl font-semibold text-forest mb-2">Checkout</h1>
      <p className="text-ink/60 font-body mb-10">A few details and we'll get your order moving.</p>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="bg-white rounded-2xl border border-forest/10 p-6">
          <h2 className="font-display font-semibold text-forest mb-5">Delivery details</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-widest text-ink/50">Full name</span>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 font-body focus:border-forest outline-none"
                placeholder="Amina Njoya"
              />
            </label>
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-widest text-ink/50">Phone number</span>
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 font-body focus:border-forest outline-none"
                placeholder="6XX XXX XXX"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-mono uppercase tracking-widest text-ink/50">Delivery address</span>
              <textarea
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 font-body focus:border-forest outline-none resize-none"
                placeholder="Neighbourhood, street, landmark"
              />
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-forest/10 p-6">
          <h2 className="font-display font-semibold text-forest mb-5">Payment method</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {methods.map((m) => (
              <motion.button
                type="button"
                key={m.id}
                onClick={() => setMethod(m.id)}
                whileTap={{ scale: 0.97 }}
                className={`relative rounded-2xl p-5 border-2 text-left transition-all ${
                  method === m.id ? "border-forest shadow-md" : "border-forest/10"
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${m.color} ${m.text} flex items-center justify-center mb-3`}>
                  <Smartphone size={18} />
                </div>
                <p className="font-display font-semibold text-ink">{m.label}</p>
                <p className="text-xs text-ink/50 font-body mt-1">Pay instantly from your phone</p>
                {method === m.id && (
                  <motion.span
                    layoutId="method-check"
                    className="absolute top-4 right-4 w-3 h-3 rounded-full bg-sunrise"
                  />
                )}
              </motion.button>
            ))}
          </div>

          <label className="block mt-5">
            <span className="text-xs font-mono uppercase tracking-widest text-ink/50">
              {method === "momo" ? "MTN MoMo number" : "Orange Money number"}
            </span>
            <input
              type="tel"
              value={payPhone}
              onChange={(e) => setPayPhone(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 font-body focus:border-forest outline-none"
              placeholder="6XX XXX XXX"
            />
          </label>
        </section>

        {error && (
          <p className="bg-maroon/10 text-maroon-dark rounded-xl px-4 py-3 font-body text-sm">{error}</p>
        )}

        <div className="bg-white rounded-2xl border border-forest/10 p-6 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Total to pay</p>
            <p className="font-display text-3xl font-semibold text-forest">{formatXAF(total)}</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-forest text-cream px-8 py-4 rounded-full font-semibold hover:bg-forest-light transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Placing order…" : "Place order & pay"}
          </button>
        </div>
      </form>
    </div>
  );
}
