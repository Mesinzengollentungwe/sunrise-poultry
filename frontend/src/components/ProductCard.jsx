import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bird, Egg, Ham, Plus, Minus, ShoppingBasket } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

const ICONS = {
  "Whole Chicken": Bird,
  "Live Birds": Bird,
  Eggs: Egg,
  Cuts: Ham
};

function formatXAF(amount) {
  return new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(amount) + " XAF";
}

export default function ProductCard({ product }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const Icon = ICONS[product.category] || Bird;

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -10, ry: px * 12 });
  }

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      style={{ transformStyle: "preserve-3d" }}
      className="perspective bg-white rounded-2xl border border-forest/10 shadow-sm hover:shadow-xl transition-shadow p-5 flex flex-col"
    >
      <div className="relative h-40 rounded-xl bg-gradient-to-br from-forest/10 via-sunrise-pale to-forest/5 flex items-center justify-center mb-4 overflow-hidden">
        <Icon size={56} className="text-forest/70" strokeWidth={1.4} />
        {product.tag && (
          <span className="absolute top-3 left-3 bg-maroon text-cream text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">
            {product.tag}
          </span>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-widest text-forest/60 mb-1">{product.category}</p>
      <h3 className="font-display text-lg font-semibold text-ink leading-snug">{product.name}</h3>
      <p className="text-sm text-ink/60 font-body mt-1.5 flex-1">{product.description}</p>

      <div className="flex items-baseline gap-1.5 mt-4">
        <span className="font-display text-xl text-forest font-semibold">{formatXAF(product.price)}</span>
        <span className="text-xs text-ink/50 font-body">{product.unit}</span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center border border-forest/20 rounded-full">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2 text-forest hover:bg-forest/5 rounded-full"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center font-mono text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="p-2 text-forest hover:bg-forest/5 rounded-full"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          onClick={handleAdd}
          className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 font-semibold text-sm transition-colors ${
            added ? "bg-sunrise text-forest-dark" : "bg-forest text-cream hover:bg-forest-light"
          }`}
        >
          <ShoppingBasket size={16} />
          {added ? "Added!" : "Add to basket"}
        </button>
      </div>
    </motion.article>
  );
}
