import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, XCircle, Sun } from "lucide-react";
import { api } from "../api.js";

const STATUS_CONFIG = {
  pending_payment: { icon: Clock, label: "Waiting to start payment", color: "text-ink/50" },
  processing_payment: { icon: Clock, label: "Confirm the prompt on your phone…", color: "text-sunrise-deep" },
  paid: { icon: CheckCircle2, label: "Payment confirmed!", color: "text-forest" },
  payment_failed: { icon: XCircle, label: "Payment failed", color: "text-maroon" }
};

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("processing_payment");

  useEffect(() => {
    if (!orderId) return;
    let active = true;

    async function poll() {
      try {
        const [{ order: freshOrder }, { status: paymentStatus }] = await Promise.all([
          api.getOrder(orderId),
          api.getPaymentStatus(orderId)
        ]);
        if (!active) return;
        setOrder(freshOrder);
        setStatus(paymentStatus);
      } catch {
        /* keep last known state; order may not exist in demo resets */
      }
    }

    poll();
    const interval = setInterval(poll, 2500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="font-display text-2xl text-forest">No order to show</p>
        <Link to="/products" className="text-forest underline font-body mt-4 inline-block">
          Back to shop
        </Link>
      </div>
    );
  }

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.processing_payment;
  const Icon = config.icon;

  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <div className="relative w-40 h-40 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full bg-sun-rays animate-spin-slow" />
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">
              <Icon size={40} className={config.color} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <h1 className="font-display text-3xl font-semibold text-forest">
        {status === "paid" ? "Order confirmed!" : status === "payment_failed" ? "We couldn't confirm payment" : "Almost there…"}
      </h1>
      <p className={`font-body mt-3 ${config.color}`}>{config.label}</p>

      {order && (
        <div className="mt-10 bg-white rounded-2xl border border-forest/10 p-6 text-left">
          <div className="flex justify-between font-mono text-sm mb-4">
            <span className="text-ink/50">Order reference</span>
            <span className="font-semibold text-forest">{order.reference}</span>
          </div>
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm font-body text-ink/70">
                <span>× {item.quantity}</span>
                <span>{item.productId}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-display font-semibold text-forest pt-4 border-t border-forest/10">
            <span>Total</span>
            <span>{new Intl.NumberFormat("fr-CM").format(order.total)} XAF</span>
          </div>
        </div>
      )}

      {status === "payment_failed" && (
        <Link
          to="/checkout"
          className="inline-flex items-center gap-2 mt-8 bg-forest text-cream px-7 py-3.5 rounded-full font-semibold hover:bg-forest-light transition-colors"
        >
          Try again
        </Link>
      )}

      {status === "paid" && (
        <Link
          to="/products"
          className="inline-flex items-center gap-2 mt-8 bg-forest text-cream px-7 py-3.5 rounded-full font-semibold hover:bg-forest-light transition-colors"
        >
          <Sun size={16} /> Continue shopping
        </Link>
      )}
    </div>
  );
}
