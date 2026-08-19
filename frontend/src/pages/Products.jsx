import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard.jsx";
import { api } from "../api.js";

const categories = ["All", "Whole Chicken", "Cuts", "Eggs", "Live Birds"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getProducts(active === "All" ? undefined : active)
      .then((d) => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [active]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <div className="text-center mb-12">
        <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">The full shop</p>
        <h1 className="font-display text-4xl font-semibold text-forest">Fresh from Sun Rise Farm</h1>
        <p className="text-ink/60 font-body mt-3 max-w-lg mx-auto">
          Whole birds, cuts, eggs, and live poultry pick what you need, pay with MoMo or Orange Money,
          and we'll bring it to your door.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-5 py-2 rounded-full font-body text-sm font-semibold border transition-colors ${
              active === c
                ? "bg-forest text-cream border-forest"
                : "bg-white text-ink/70 border-forest/15 hover:border-forest/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center font-body text-ink/50 py-20">Loading fresh stock…</p>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
