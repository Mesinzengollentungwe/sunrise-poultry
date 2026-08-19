import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBasket } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

function formatXAF(amount) {
  return new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(amount) + " XAF";
}

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6">
          <ShoppingBasket size={32} className="text-forest" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-forest">Your basket is empty</h1>
        <p className="text-ink/60 font-body mt-2">Fresh chicken, cuts and eggs are waiting for you.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 mt-8 bg-forest text-cream px-7 py-3.5 rounded-full font-semibold hover:bg-forest-light transition-colors"
        >
          Browse the shop <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-14">
      <h1 className="font-display text-3xl font-semibold text-forest mb-8">Your Basket</h1>

      <div className="bg-white rounded-2xl border border-forest/10 divide-y divide-forest/10 overflow-hidden">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -40 }}
              className="flex items-center gap-4 p-5"
            >
              <div className="flex-1">
                <p className="font-display font-semibold text-ink">{item.name}</p>
                <p className="text-xs text-ink/50 font-body">{item.unit}</p>
              </div>

              <div className="flex items-center border border-forest/20 rounded-full">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-2 text-forest hover:bg-forest/5 rounded-full"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-mono text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-2 text-forest hover:bg-forest/5 rounded-full"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <p className="font-display font-semibold text-forest w-28 text-right">
                {formatXAF(item.price * item.quantity)}
              </p>

              <button
                onClick={() => removeItem(item.productId)}
                className="p-2 text-ink/40 hover:text-maroon transition-colors"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white rounded-2xl border border-forest/10 p-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Total</p>
          <p className="font-display text-3xl font-semibold text-forest">{formatXAF(total)}</p>
        </div>
        <Link
          to="/checkout"
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 bg-forest text-cream px-8 py-4 rounded-full font-semibold hover:bg-forest-light transition-colors hover:-translate-y-0.5"
        >
          Proceed to checkout <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
