// Sun Rise Poultry Enterprise — product / pricing catalog
// Pricing reflects the tiered live-bird strategy set out in the business plan:
// standard 45-day price, an oversupply floor, and an extended-hold premium.

const PRODUCTS = [
  {
    id: "standard-broiler",
    name: "Standard Live Broiler",
    subtitle: "45-day market weight",
    description:
      "Our classic bird — raised on a strict starter, grower and finisher feed schedule and sold live at full 45-day market weight. This is what most households and restaurants order.",
    unitPrice: 3500,
    unit: "bird",
    minQty: 1,
    weightRange: "≈ 1.8 – 2.2 kg live weight",
    badge: "Most popular",
    image: "standard",
  },
  {
    id: "premium-broiler",
    name: "Premium Extended-Hold Broiler",
    subtitle: "50–55 day, larger bird",
    description:
      "For customers who want a noticeably bigger bird for large family meals or events. Held a little longer on finisher feed — never past day 60 — for extra size and weight.",
    unitPrice: 5000,
    unit: "bird",
    minQty: 1,
    weightRange: "≈ 2.4 – 2.8 kg live weight",
    badge: "Biggest bird",
    image: "premium",
  },
  {
    id: "bulk-event",
    name: "Bulk / Event Order",
    subtitle: "10+ birds, standard weight",
    description:
      "Planning a wedding, baptism, end-of-year party, or restocking your restaurant? Order 10 or more standard birds and we'll schedule a bulk delivery on the date you need.",
    unitPrice: 3400,
    unit: "bird",
    minQty: 10,
    weightRange: "≈ 1.8 – 2.2 kg live weight, per bird",
    badge: "Best value",
    image: "bulk",
  },
  {
    id: "standing-order",
    name: "Standing Weekly Order",
    subtitle: "For restaurants, hotels & caterers",
    description:
      "A recurring weekly or bi-weekly supply agreement at a fixed volume and fixed price, so your kitchen never runs short. Priority allocation during periods of tight supply.",
    unitPrice: 3450,
    unit: "bird / week",
    minQty: 5,
    weightRange: "≈ 1.8 – 2.2 kg live weight, per bird",
    badge: "For businesses",
    image: "standing",
  },
];

const DELIVERY_OPTIONS = [
  {
    id: "farm-gate",
    label: "Farm-gate pickup — Nomayos",
    fee: 0,
    description: "Collect your birds directly at the farm. No delivery fee.",
  },
  {
    id: "moto-delivery",
    label: "Motorbike delivery — within Yaoundé",
    fee: 1500,
    description: "Same-day or scheduled delivery to your home, restaurant or shop.",
  },
  {
    id: "bulk-dropoff",
    label: "Scheduled bulk drop-off",
    fee: 0,
    description: "For orders of 10+ birds — delivery fee confirmed with you by phone/WhatsApp.",
  },
];

module.exports = { PRODUCTS, DELIVERY_OPTIONS };
