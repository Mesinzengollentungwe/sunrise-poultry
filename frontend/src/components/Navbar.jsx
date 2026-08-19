import { Link, NavLink } from "react-router-dom";
import { ShoppingBasket, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/#about", label: "Our Farm" }
];

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-forest/10">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Sun Rise Poultry Enterprise logo"
            className="h-14 w-14 object-contain transition-transform duration-500 group-hover:rotate-6"
          />
          <div className="leading-tight">
            <p className="font-display font-semibold text-forest text-lg tracking-tight">Sun Rise</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-maroon">Poultry Enterprise</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-body text-sm font-medium text-ink/80">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `relative py-2 hover:text-forest transition-colors ${isActive ? "text-forest" : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative flex items-center gap-2 bg-forest text-cream px-4 py-2 rounded-full font-body text-sm font-semibold hover:bg-forest-light transition-colors"
          >
            <ShoppingBasket size={18} />
            <span className="hidden sm:inline">Basket</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-sunrise text-forest-dark text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden p-2 text-forest"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col gap-1 px-5 pb-4 font-body text-sm font-medium">
          {links.map((l) => (
            <NavLink key={l.label} to={l.to} onClick={() => setOpen(false)} className="py-2 text-ink/80">
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
