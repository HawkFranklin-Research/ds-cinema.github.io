export type Product = {
  slug: string;
  name: string;
  tagline: string;
  priceCents: number;
  badge: string;
  accent: "cyan" | "violet";
  specs: { label: string; value: string }[];
  includes: string[];
};

export const products: Product[] = [
  {
    slug: "creator-air",
    name: "Creator Air",
    tagline: "The essential autonomous indoor camera.",
    priceCents: 49900,
    badge: "Creator edition",
    accent: "cyan",
    specs: [
      { label: "Camera", value: "4K / 60 fps · 1/1.7″ sensor" },
      { label: "Flight time", value: "Up to 14 minutes" },
      { label: "Weight", value: "Under 249 g target" },
      { label: "Safety", value: "Fully enclosed propellers" },
      { label: "Positioning", value: "Optical flow + depth sensing" },
      { label: "Storage", value: "64 GB encrypted local" },
    ],
    includes: ["Creator Air aircraft", "One intelligent battery", "USB-C charging hub", "Protective travel case"],
  },
  {
    slug: "creator-air-pro",
    name: "Creator Air Pro",
    tagline: "More light, more range, more control.",
    priceCents: 79900,
    badge: "Studio favourite",
    accent: "violet",
    specs: [
      { label: "Camera", value: "4K / 120 fps · 1″ sensor target" },
      { label: "Flight time", value: "Up to 18 minutes" },
      { label: "Low light", value: "Dual-native ISO pipeline" },
      { label: "Safety", value: "Omnidirectional depth sensing" },
      { label: "Audio", value: "Wireless mic timecode sync" },
      { label: "Storage", value: "256 GB encrypted local" },
    ],
    includes: ["Creator Air Pro aircraft", "Two intelligent batteries", "Rapid charging dock", "Wireless mic sync module", "Hard-shell studio case"],
  },
];

export const configurationOptions = {
  flightKit: {
    standard: { label: "Standard flight kit", priceCents: 0 },
    studio: { label: "Studio endurance kit", priceCents: 18900 },
  },
  storage: {
    included: { label: "Included storage", priceCents: 0 },
    expanded: { label: "Expanded encrypted storage", priceCents: 7900 },
  },
  warranty: {
    standard: { label: "2-year EU guarantee", priceCents: 0 },
    care: { label: "DS Care accidental cover", priceCents: 9900 },
  },
};

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function formatEuro(cents: number) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

