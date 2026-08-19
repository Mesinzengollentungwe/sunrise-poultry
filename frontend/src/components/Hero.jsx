import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Rotating sun-ray badge echoes the seal shape of the logo */}
      <div className="pointer-events-none absolute -right-40 -top-40 w-[560px] h-[560px] opacity-70 md:opacity-100">
        <div className="w-full h-full rounded-full bg-sun-rays animate-spin-slow" />
      </div>
      <div className="pointer-events-none absolute -right-24 top-10 w-72 h-72 rounded-full bg-sunrise/20 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-maroon bg-maroon/10 px-3 py-1.5 rounded-full">
            <Leaf size={14} /> Raised on our own farm
          </span>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-forest mt-6 font-semibold">
            Quality chicken,
            <br />
            <span className="text-sunrise-deep italic">healthy life.</span>
          </h1>
          <p className="mt-6 text-ink/70 font-body text-lg max-w-md">
            From our free-range coops to your doorstep fresh chicken, cuts, eggs and live birds,
            dressed and delivered the same day. Pay easily with MTN MoMo or Orange Money.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 bg-forest text-cream px-7 py-4 rounded-full font-semibold hover:bg-forest-light transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-forest/20"
            >
              Shop the farm
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold border-2 border-forest/20 text-forest hover:border-forest transition-colors"
            >
              Our story
            </a>
          </div>
        </div>

        <motion.div
          className="perspective flex justify-center"
          initial={{ opacity: 0, scale: 0.85, rotateY: -8 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.img
            src="/logo.png"
            alt="Sun Rise Poultry Enterprise badge logo"
            className="w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-2xl animate-float"
            whileHover={{ rotateY: 12, rotateX: -6, scale: 1.04 }}
            transition={{ type: "spring", stiffness: 120, damping: 10 }}
            style={{ transformStyle: "preserve-3d" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
