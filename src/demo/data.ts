// src/demo/data.ts — typed, fictional, original content for every coded demo (§5.1).
// The .demo TLD guarantees fictional domains. Also feeds the /playground pages.

export type Video = {
  id: string;
  title: string;
  channel: string;
  views: number;
  age: string;
  duration: string;
  thumbSeed: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  shipping: string;
  thumbSeed: number;
};

export type Metric = { month: string; revenue: number; signups: number; churn: number };

export const sites = {
  streamly: { name: "Streamly", domain: "streamly.demo" },
  shopwise: { name: "Shopwise", domain: "shopwise.demo" },
  pulseboard: { name: "Pulseboard", domain: "pulseboard.demo" },
} as const;

/** Streamly (streamly.demo) — 12 videos */
export const videos: Video[] = [
  { id: "v1", title: "I rebuilt a 1970s synth from a box of parts", channel: "Analog Garage", views: 1_240_000, age: "3 days ago", duration: "18:42", thumbSeed: 3 },
  { id: "v2", title: "How octopuses dream", channel: "Deep Sea Lab", views: 2_310_000, age: "1 week ago", duration: "12:07", thumbSeed: 11 },
  { id: "v3", title: "48 hours in a tiny mountain cabin", channel: "Northwoods", views: 830_000, age: "5 days ago", duration: "22:15", thumbSeed: 7 },
  { id: "v4", title: "The math of origami, folded by hand", channel: "Fold Theory", views: 412_000, age: "2 weeks ago", duration: "9:58", thumbSeed: 20 },
  { id: "v5", title: "Night market street food after midnight", channel: "Night Market", views: 3_080_000, age: "4 days ago", duration: "16:20", thumbSeed: 14 },
  { id: "v6", title: "Why bridges don't fall down", channel: "Structure Club", views: 961_000, age: "3 weeks ago", duration: "14:33", thumbSeed: 5 },
  { id: "v7", title: "Watercolor skies in 20 minutes", channel: "Brush & Water", views: 154_000, age: "6 days ago", duration: "20:01", thumbSeed: 18 },
  { id: "v8", title: "Sourdough from scratch, the honest version", channel: "Crumb Science", views: 640_000, age: "1 month ago", duration: "25:40", thumbSeed: 9 },
  { id: "v9", title: "Inside the quietest room ever built", channel: "Sound Lab", views: 1_820_000, age: "2 days ago", duration: "11:12", thumbSeed: 24 },
  { id: "v10", title: "Coding a game in 48 hours", channel: "Game Jam", views: 287_000, age: "9 days ago", duration: "31:05", thumbSeed: 2 },
  { id: "v11", title: "How stars are born", channel: "Cosmos Daily", views: 2_690_000, age: "3 months ago", duration: "13:48", thumbSeed: 16 },
  { id: "v12", title: "Restoring a rusty pocket knife", channel: "Blade Revival", views: 76_000, age: "1 day ago", duration: "8:26", thumbSeed: 27 },
];

/** Shopwise (shopwise.demo/search?q=headphones) — 8 products */
export const products: Product[] = [
  { id: "p1", name: "Aerial Pro ANC Headphones", price: 129, oldPrice: 149, rating: 4.6, reviews: 2310, shipping: "Free 2-day", thumbSeed: 1 },
  { id: "p2", name: "Lumen Studio Monitor", price: 189, rating: 4.8, reviews: 980, shipping: "Free", thumbSeed: 8 },
  { id: "p3", name: "Driftwood Wireless Over-Ear", price: 99, oldPrice: 120, rating: 4.1, reviews: 4120, shipping: "$4.99", thumbSeed: 13 },
  { id: "p4", name: "Pulse Sport Buds", price: 59, rating: 3.9, reviews: 640, shipping: "Free 2-day", thumbSeed: 22 },
  { id: "p5", name: "Halcyon Noise-Cancelling", price: 159, oldPrice: 179, rating: 4.6, reviews: 1502, shipping: "$6.99", thumbSeed: 4 },
  { id: "p6", name: "Atlas Reference 2", price: 249, rating: 4.7, reviews: 388, shipping: "Free", thumbSeed: 17 },
  { id: "p7", name: "Tern Kids Headphones", price: 35, oldPrice: 45, rating: 4.2, reviews: 5230, shipping: "Free 2-day", thumbSeed: 26 },
  { id: "p8", name: "Ember Retro On-Ear", price: 79, rating: 4.3, reviews: 712, shipping: "$3.99", thumbSeed: 10 },
];

/** More results the "site" loads while live mode runs (infinite scroll). */
export const moreProducts: Product[] = [
  { id: "p9", name: "Cirrus Travel Fold", price: 89, rating: 4.4, reviews: 1188, shipping: "Free", thumbSeed: 6 },
  { id: "p10", name: "Quill Open-Back", price: 219, rating: 4.7, reviews: 264, shipping: "Free 2-day", thumbSeed: 19 },
  { id: "p11", name: "Nimbus Sleep Band", price: 49, rating: 4.0, reviews: 2021, shipping: "$2.99", thumbSeed: 12 },
  { id: "p12", name: "Harbor Bass Max", price: 139, oldPrice: 159, rating: 4.5, reviews: 932, shipping: "Free", thumbSeed: 21 },
  { id: "p13", name: "Fern Wired Classic", price: 29, rating: 4.1, reviews: 3410, shipping: "Free 2-day", thumbSeed: 15 },
  { id: "p14", name: "Orbit Gaming Headset", price: 109, rating: 4.3, reviews: 1755, shipping: "$5.99", thumbSeed: 25 },
];

/** Pulseboard (pulseboard.demo) — 12 months */
export const metrics: Metric[] = [
  { month: "Jan", revenue: 182_000, signups: 1_420, churn: 3.1 },
  { month: "Feb", revenue: 176_500, signups: 1_310, churn: 3.4 },
  { month: "Mar", revenue: 198_200, signups: 1_655, churn: 2.9 },
  { month: "Apr", revenue: 204_900, signups: 1_702, churn: 2.8 },
  { month: "May", revenue: 221_300, signups: 1_890, churn: 2.6 },
  { month: "Jun", revenue: 215_800, signups: 1_744, churn: 3.0 },
  { month: "Jul", revenue: 232_400, signups: 1_960, churn: 3.6 },
  { month: "Aug", revenue: 228_100, signups: 1_812, churn: 4.2 },
  { month: "Sep", revenue: 246_700, signups: 2_105, churn: 3.3 },
  { month: "Oct", revenue: 259_300, signups: 2_240, churn: 2.7 },
  { month: "Nov", revenue: 271_000, signups: 2_388, churn: 2.5 },
  { month: "Dec", revenue: 288_600, signups: 2_514, churn: 2.4 },
];

export function formatViews(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return String(n);
}

export const formatPrice = (n: number) => `$${n % 1 === 0 ? n : n.toFixed(2)}`;
export const formatCount = (n: number) => n.toLocaleString("en-US");
