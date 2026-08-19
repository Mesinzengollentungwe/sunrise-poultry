import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Sun, Bird } from "lucide-react";
import Hero from "../components/Hero.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { api } from "../api.js";

const trustPoints = [
  { icon: Sun, title: "Farm Fresh", body: "Harvested and dressed the same morning it's delivered." },
  { icon: ShieldCheck, title: "Trusted Quality", body: "Vaccinated, healthy birds raised with care and no shortcuts." },
  { icon: Truck, title: "Fast Delivery", body: "Same-day delivery across town, MoMo or Orange Money on checkout." }
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.getProducts().then((d) => setFeatured(d.products.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <>
      <Hero />

      <section className="max-w-6xl mx-auto px-5 py-16 grid sm:grid-cols-3 gap-6">
        {trustPoints.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
            className="bg-white rounded-2xl p-6 border border-forest/10 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-sunrise/20 flex items-center justify-center mx-auto mb-4">
              <t.icon className="text-sunrise-deep" size={22} />
            </div>
            <h3 className="font-display font-semibold text-forest">{t.title}</h3>
            <p className="text-sm text-ink/60 font-body mt-2">{t.body}</p>
          </motion.div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">From the farm</p>
            <h2 className="font-display text-3xl font-semibold text-forest">Fresh this week</h2>
          </div>
          <Link to="/products" className="font-body font-semibold text-forest hover:underline hidden sm:block">
            View full shop →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <Link to="/products" className="font-body font-semibold text-forest hover:underline block sm:hidden mt-6 text-center">
          View full shop →
        </Link>
      </section>

      <section id="about" className="bg-forest text-cream mt-20">
        <div className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-sunrise mb-4">
              <Bird size={14} /> Our story
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
              A family farm, growing one sunrise at a time.
            </h2>
            <p className="mt-5 text-cream/75 font-body leading-relaxed">
              Sun Rise Poultry Enterprise started as a small backyard coop and grew into a trusted source
              of fresh chicken for families and restaurants across the city. Every bird is raised with
              care, every egg collected daily, and every order handled with the same values our name
              carries: quality, freshness, and trust.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              ["500+", "Happy families"],
              ["7", "Deliveries a week"],
              ["100%", "Free-range raised"],
              ["24hr", "Egg to doorstep"]
            ].map(([stat, label]) => (
              <div key={label} className="bg-cream/5 border border-cream/15 rounded-2xl p-6 text-center">
                <p className="font-display text-3xl text-sunrise font-semibold">{stat}</p>
                <p className="text-xs font-mono uppercase tracking-widest text-cream/60 mt-2">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
