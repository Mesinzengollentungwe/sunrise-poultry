import { Phone, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-cream/90 mt-24">
      <div className="max-w-6xl mx-auto px-5 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Sun Rise Poultry" className="h-12 w-12 object-contain" />
            <p className="font-display text-xl">Sun Rise Poultry</p>
          </div>
          <p className="text-sm text-cream/70 font-body max-w-xs">
            Quality chicken, healthy life. Fresh from our farm to your kitchen every single day.
          </p>
        </div>

        <div className="font-body text-sm space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-sunrise mb-2">Reach the farm</p>
          <p className="flex items-center gap-2"><Phone size={16} /> +237 6XX XXX XXX</p>
          <p className="flex items-center gap-2"><MapPin size={16} /> Yaoundé, Cameroon</p>
          <p className="flex items-center gap-2"><Clock size={16} /> Mon – Sat, 7am – 7pm</p>
        </div>

        <div className="font-body text-sm">
          <p className="font-mono text-xs uppercase tracking-widest text-sunrise mb-2">We accept</p>
          <div className="flex gap-3">
            <span className="px-3 py-2 rounded-lg bg-cream/10 border border-cream/20 text-xs font-semibold">MTN MoMo</span>
            <span className="px-3 py-2 rounded-lg bg-cream/10 border border-cream/20 text-xs font-semibold">Orange Money</span>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/50 font-mono">
        © {new Date().getFullYear()} Sun Rise Poultry Enterprise. Quality · Freshness · Trust.
      </div>
    </footer>
  );
}
