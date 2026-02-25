// ============================================================
// SILE — Mock Data Layer v4
// Expanded dataset: 25 figures, 6 categories, rich marketplace
// ============================================================

export interface Figure {
  id: string;
  name: string;
  character: string;
  description: string;
  brand: string;
  line: string;
  subline?: string;
  year: number;
  scale: string;
  material: string;
  articulation: string;
  accessories: string;
  upc?: string;
  purchasePrice: number;
  currentValue: number;
  category: string;
  condition: "mint_sealed" | "mint_open" | "complete" | "loose" | "incomplete";
  packaging: "carded" | "boxed" | "loose" | "window_box";
  forSale: boolean;
  suggestedPrice?: number;
  image: string;
  images: string[];
  addedAt: string;
  priceHistory: { month: string; price: number }[];
  notes?: string;
  location?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  count: number;
  totalValue: number;
}

export interface ReviewItem {
  id: string;
  figureId: string;
  name: string;
  image: string;
  issue: string;
  issueType: "variant" | "missing_location" | "duplicate" | "incomplete_data";
  severity: "critical" | "improvement";
  impact: string;
}

export interface MarketListing {
  id: string;
  figureId: string;
  figureName: string;
  character: string;
  image: string;
  price: number;
  seller: string;
  sellerRating: number;
  condition: string;
  postedAt: string;
  brand: string;
  line: string;
  year: number;
  scale: string;
  location: string;
  shipping: boolean;
  views: number;
  figureStatus?: string;
  boxStatus?: string;
  defects?: string;
  includes?: { figure: boolean; box: boolean; accessories: boolean; base: boolean; manual: boolean };
  priceRange?: { min: number; max: number };
  shippingPolicy?: string;
}

export interface Offer {
  id: string;
  amount: number;
  note: string;
  expiry: string;
  shippingMethod: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  type: "text" | "offer" | "system";
  offer?: Offer;
}

export interface Conversation {
  id: string;
  listingId: string;
  participantName: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  listingName: string;
  listingImage: string;
  listingPrice: number;
  messages: ChatMessage[];
}

export interface WishlistItem {
  id: string;
  name: string;
  character: string;
  brand: string;
  line: string;
  image: string;
  avgPrice: number;
  priceRange: { min: number; max: number };
  bestPrice: number;
  bestSource: string;
  trend: "up" | "down" | "stable";
  trendPercent: number;
  trackingActive: boolean;
  alertThreshold?: number;
  addedAt: string;
}

export interface FollowedUser {
  id: string;
  name: string;
  avatar: string;
  joinedAt: string;
  totalListings: number;
  recentListings: { id: string; name: string; image: string; price: number; postedAt: string }[];
  hasNewListings: boolean;
  hasNewSales: boolean;
  followedAt: string;
}

export interface AppNotification {
  id: string;
  type: "new_product" | "price_drop" | "offer_received" | "offer_accepted" | "offer_rejected" | "duplicate_detected" | "sale_published";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  image?: string;
}

export interface MySale {
  id: string;
  figureName: string;
  image: string;
  price: number;
  status: "active" | "sold" | "draft";
  views: number;
  inquiries: number;
  postedAt: string;
  soldAt?: string;
  buyer?: string;
  condition: string;
  brand: string;
  line: string;
}

// --- Price history generator ---
function generatePriceHistory(base: number): { month: string; price: number }[] {
  const labels = ["Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb"];
  let price = base * 0.85;
  return labels.map((m) => {
    price = price * (0.96 + Math.random() * 0.12);
    return { month: m, price: Math.round(price) };
  });
}

// --- Images ---
const IMG = {
  dragonball1: "https://images.unsplash.com/photo-1758179761956-615d761447dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFnb24lMjBiYWxsJTIwYW5pbWUlMjBmaWd1cmUlMjBzdGF0dWV8ZW58MXx8fHwxNzcxODg4NDIyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  tmnt: "https://images.unsplash.com/photo-1685132159283-c733c474b476?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaW5qYSUyMHdhcnJpb3IlMjBhY3Rpb24lMjBmaWd1cmV8ZW58MXx8fHwxNzcxODg4NDIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
  motu: "https://images.unsplash.com/photo-1771295763144-4c3402ae3b2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBmaWd1cmUlMjBjb2xsZWN0aWJsZSUyMHRveSUyMGRpc3BsYXl8ZW58MXx8fHwxNzcxODg4NDIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  gijoe: "https://images.unsplash.com/photo-1666206136577-47752bf6f40b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBlcmhlcm8lMjBmaWd1cmUlMjBzdGF0dWUlMjBjb2xsZWN0aWJsZXxlbnwxfHx8fDE3NzE4ODg0MjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  seiya: "https://images.unsplash.com/photo-1763194976473-a6145a368de2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdCUyMHRyYW5zZm9ybWVyJTIwdG95JTIwZmlndXJlfGVufDF8fHx8MTc3MTg4ODQyM3ww&ixlib=rb-4.1.0&q=80&w=1080",
  vintage: "https://images.unsplash.com/photo-1763833294577-1f7c2b6ce328?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwdG95JTIwY29sbGVjdGlvbiUyMHNoZWxmfGVufDF8fHx8MTc3MTg4ODQyMnww&ixlib=rb-4.1.0&q=80&w=1080",
};

// --- 25 Figures ---
export const MOCK_FIGURES: Figure[] = [
  { id: "1", name: "Goku Ultra Instinct", character: "Son Goku", description: "S.H.Figuarts Dragon Ball Super Goku Ultra Instinct Sign. Incluye 3 pares de manos, 2 expresiones faciales y efecto de aura.", brand: "Bandai", line: "S.H.Figuarts", subline: "Dragon Ball Super", year: 2022, scale: '6"', material: "PVC / ABS", articulation: "Full — 16+ puntos", accessories: "3x manos, 2x caras, base, aura", upc: "4573102630056", purchasePrice: 65, currentValue: 120, category: "Dragon Ball", condition: "mint_sealed", packaging: "window_box", forSale: false, image: IMG.dragonball1, images: [IMG.dragonball1, IMG.dragonball1], addedAt: "2026-02-20", priceHistory: generatePriceHistory(95), location: "Vitrina A" },
  { id: "2", name: "Leonardo NECA 1990 Movie", character: "Leonardo", description: "NECA TMNT 1990 Movie 7\" Leonardo. Escultura hiperrealista basada en la pelicula original.", brand: "NECA", line: "TMNT 1990 Movie", subline: "Ultimate", year: 2019, scale: '7"', material: "PVC", articulation: "Full — 30+ puntos", accessories: "2x katanas, vainas, pizza, base", upc: "634482541524", purchasePrice: 35, currentValue: 85, category: "Tortugas Ninja", condition: "complete", packaging: "carded", forSale: true, suggestedPrice: 78, image: IMG.tmnt, images: [IMG.tmnt, IMG.tmnt], addedAt: "2026-02-18", priceHistory: generatePriceHistory(55) },
  { id: "3", name: "He-Man Origins Deluxe", character: "He-Man", description: "MOTU Origins Deluxe He-Man con Power Sword, escudo y hacha. Estilo vintage con articulacion moderna.", brand: "Mattel", line: "MOTU Origins", subline: "Deluxe", year: 2021, scale: '5.5"', material: "PVC", articulation: "Retro — 7 puntos", accessories: "Power Sword, escudo, hacha, armadura", purchasePrice: 22, currentValue: 45, category: "Masters of the Universe", condition: "mint_open", packaging: "carded", forSale: false, image: IMG.motu, images: [IMG.motu], addedAt: "2026-02-15", priceHistory: generatePriceHistory(30) },
  { id: "4", name: "Snake Eyes Classified #02", character: "Snake Eyes", description: "G.I. Joe Classified Series Snake Eyes 6\". Detalle premium con articulacion butterfly.", brand: "Hasbro", line: "Classified Series", subline: "Wave 1", year: 2020, scale: '6"', material: "PVC / ABS", articulation: "Full — 32 puntos", accessories: "Espada, nunchaku, uzi, mochila, base", upc: "5010993679850", purchasePrice: 20, currentValue: 55, category: "GI Joe", condition: "mint_sealed", packaging: "window_box", forSale: true, suggestedPrice: 50, image: IMG.gijoe, images: [IMG.gijoe, IMG.gijoe], addedAt: "2026-02-10", priceHistory: generatePriceHistory(35), location: "Vitrina B" },
  { id: "5", name: "Pegasus Seiya V3 EX", character: "Seiya", description: "Saint Cloth Myth EX Pegasus Seiya V3. Die-cast metal con capa de tela y armadura completa.", brand: "Bandai", line: "Saint Cloth Myth EX", subline: "Final Bronze Cloth", year: 2023, scale: '6.5"', material: "Die-cast / PVC / Cloth", articulation: "Full — 20+ puntos", accessories: "Armadura completa, 5x manos, cadena, capa", purchasePrice: 95, currentValue: 180, category: "Saint Seiya", condition: "mint_sealed", packaging: "boxed", forSale: false, image: IMG.seiya, images: [IMG.seiya, IMG.seiya], addedAt: "2026-02-08", priceHistory: generatePriceHistory(140), location: "Vitrina A" },
  { id: "6", name: "Vegeta Super Saiyan Final Flash", character: "Vegeta", description: "S.H.Figuarts DBZ Vegeta SS. Pose iconica de Final Flash con efectos de energia.", brand: "Bandai", line: "S.H.Figuarts", subline: "Dragon Ball Z", year: 2021, scale: '6"', material: "PVC / ABS", articulation: "Full — 16+ puntos", accessories: "4x manos, 2x caras, efectos, base", purchasePrice: 55, currentValue: 110, category: "Dragon Ball", condition: "mint_open", packaging: "window_box", forSale: false, image: IMG.vintage, images: [IMG.vintage], addedAt: "2026-01-28", priceHistory: generatePriceHistory(80) },
  { id: "7", name: "Skeletor Origins", character: "Skeletor", description: "MOTU Origins Skeletor con Havoc Staff, espada y escudo. Articulacion retro fiel al diseno de 1982.", brand: "Mattel", line: "MOTU Origins", year: 2020, scale: '5.5"', material: "PVC", articulation: "Retro — 7 puntos", accessories: "Havoc Staff, espada, escudo", purchasePrice: 18, currentValue: 38, category: "Masters of the Universe", condition: "complete", packaging: "carded", forSale: true, suggestedPrice: 35, image: IMG.motu, images: [IMG.motu], addedAt: "2026-01-15", priceHistory: generatePriceHistory(25) },
  { id: "8", name: "Raphael NECA 1990 Movie", character: "Raphael", description: "NECA TMNT 1990 Movie Raphael Ultimate. Movie-accurate con sai y accesorios.", brand: "NECA", line: "TMNT 1990 Movie", subline: "Ultimate", year: 2019, scale: '7"', material: "PVC", articulation: "Full — 30+ puntos", accessories: "2x sai, baby turtle, base", purchasePrice: 35, currentValue: 92, category: "Tortugas Ninja", condition: "mint_sealed", packaging: "carded", forSale: false, image: IMG.tmnt, images: [IMG.tmnt], addedAt: "2026-01-05", priceHistory: generatePriceHistory(60), location: "Vitrina B" },
  { id: "9", name: "Frieza Final Form", character: "Frieza", description: "S.H.Figuarts Dragon Ball Z Frieza Final Form. Incluye Death Ball y manos intercambiables.", brand: "Bandai", line: "S.H.Figuarts", subline: "Dragon Ball Z", year: 2023, scale: '6"', material: "PVC / ABS", articulation: "Full — 16+ puntos", accessories: "Death Ball, 4x manos, base", upc: "4573102640789", purchasePrice: 58, currentValue: 95, category: "Dragon Ball", condition: "mint_sealed", packaging: "window_box", forSale: false, image: IMG.dragonball1, images: [IMG.dragonball1], addedAt: "2026-02-22", priceHistory: generatePriceHistory(75), location: "Vitrina A" },
  { id: "10", name: "Gohan SSJ2 Cell Saga", character: "Gohan", description: "S.H.Figuarts Dragon Ball Z Gohan Super Saiyan 2. Pose de batalla contra Cell.", brand: "Bandai", line: "S.H.Figuarts", subline: "Dragon Ball Z", year: 2022, scale: '6"', material: "PVC / ABS", articulation: "Full — 16+ puntos", accessories: "3x manos, 2x caras, efectos ki", purchasePrice: 62, currentValue: 105, category: "Dragon Ball", condition: "mint_open", packaging: "window_box", forSale: false, image: IMG.dragonball1, images: [IMG.dragonball1], addedAt: "2026-01-22", priceHistory: generatePriceHistory(82) },
  { id: "11", name: "Donatello NECA 1990 Movie", character: "Donatello", description: "NECA TMNT 1990 Movie Donatello. Con bo, bandana y accesorios de laboratorio.", brand: "NECA", line: "TMNT 1990 Movie", subline: "Ultimate", year: 2019, scale: '7"', material: "PVC", articulation: "Full — 30+ puntos", accessories: "Bo, ordenador, base", purchasePrice: 33, currentValue: 78, category: "Tortugas Ninja", condition: "complete", packaging: "carded", forSale: false, image: IMG.tmnt, images: [IMG.tmnt], addedAt: "2026-01-12", priceHistory: generatePriceHistory(52), location: "Vitrina B" },
  { id: "12", name: "Michelangelo NECA 1990 Movie", character: "Michelangelo", description: "NECA TMNT 1990 Movie Michelangelo. Con nunchakus, pizza y accesorios.", brand: "NECA", line: "TMNT 1990 Movie", subline: "Ultimate", year: 2019, scale: '7"', material: "PVC", articulation: "Full — 30+ puntos", accessories: "Nunchakus, pizza, base", purchasePrice: 34, currentValue: 80, category: "Tortugas Ninja", condition: "mint_sealed", packaging: "carded", forSale: false, image: IMG.tmnt, images: [IMG.tmnt], addedAt: "2025-12-28", priceHistory: generatePriceHistory(54) },
  { id: "13", name: "Man-At-Arms Origins", character: "Man-At-Arms", description: "MOTU Origins Man-At-Arms con maza y armadura. Companion de He-Man.", brand: "Mattel", line: "MOTU Origins", year: 2021, scale: '5.5"', material: "PVC", articulation: "Retro — 7 puntos", accessories: "Maza, armadura, escudo", purchasePrice: 19, currentValue: 32, category: "Masters of the Universe", condition: "complete", packaging: "carded", forSale: false, image: IMG.motu, images: [IMG.motu], addedAt: "2025-12-15", priceHistory: generatePriceHistory(24), location: "Vitrina C" },
  { id: "14", name: "Teela Origins", character: "Teela", description: "MOTU Origins Teela con serpiente y escudo. Captain of the Royal Guard.", brand: "Mattel", line: "MOTU Origins", year: 2021, scale: '5.5"', material: "PVC", articulation: "Retro — 7 puntos", accessories: "Serpiente, escudo, espada", purchasePrice: 18, currentValue: 35, category: "Masters of the Universe", condition: "mint_open", packaging: "carded", forSale: false, image: IMG.motu, images: [IMG.motu], addedAt: "2025-12-10", priceHistory: generatePriceHistory(26) },
  { id: "15", name: "Storm Shadow Classified", character: "Storm Shadow", description: "G.I. Joe Classified Series Storm Shadow. Ninja con katana y arco.", brand: "Hasbro", line: "Classified Series", year: 2021, scale: '6"', material: "PVC / ABS", articulation: "Full — 32 puntos", accessories: "Katana, arco, carcaj", purchasePrice: 22, currentValue: 42, category: "GI Joe", condition: "complete", packaging: "window_box", forSale: false, image: IMG.gijoe, images: [IMG.gijoe], addedAt: "2026-02-05", priceHistory: generatePriceHistory(32), location: "Vitrina B" },
  { id: "16", name: "Cobra Commander Classified", character: "Cobra Commander", description: "G.I. Joe Classified Series Cobra Commander. Lider de Cobra con baston y pistola.", brand: "Hasbro", line: "Classified Series", year: 2021, scale: '6"', material: "PVC / ABS", articulation: "Full — 30 puntos", accessories: "Baston, pistola, capa", purchasePrice: 20, currentValue: 38, category: "GI Joe", condition: "mint_open", packaging: "window_box", forSale: false, image: IMG.gijoe, images: [IMG.gijoe], addedAt: "2026-01-18", priceHistory: generatePriceHistory(28) },
  { id: "17", name: "Gemini Saga EX", character: "Saga", description: "Saint Cloth Myth EX Gemini Saga. Armadura dorada con dos caras intercambiables.", brand: "Bandai", line: "Saint Cloth Myth EX", year: 2021, scale: '6.5"', material: "Die-cast / PVC", articulation: "Full — 20+ puntos", accessories: "Armadura, 4x manos, efecto Galaxian Explosion", purchasePrice: 110, currentValue: 210, category: "Saint Seiya", condition: "mint_sealed", packaging: "boxed", forSale: false, image: IMG.seiya, images: [IMG.seiya], addedAt: "2025-11-20", priceHistory: generatePriceHistory(165), location: "Vitrina A" },
  { id: "18", name: "Virgo Shaka EX", character: "Shaka", description: "Saint Cloth Myth EX Virgo Shaka. El hombre mas cercano a Dios con armadura dorada.", brand: "Bandai", line: "Saint Cloth Myth EX", year: 2020, scale: '6.5"', material: "Die-cast / PVC", articulation: "Full — 20+ puntos", accessories: "Armadura, rosario, flor de loto", purchasePrice: 100, currentValue: 195, category: "Saint Seiya", condition: "mint_open", packaging: "boxed", forSale: false, image: IMG.seiya, images: [IMG.seiya], addedAt: "2025-10-05", priceHistory: generatePriceHistory(150), location: "Vitrina A" },
  { id: "19", name: "Spider-Man Retro Wave", character: "Spider-Man", description: "Marvel Legends Retro Spider-Man. Estilo clasico de los 90 con webs.", brand: "Hasbro", line: "Marvel Legends", year: 2024, scale: '6"', material: "PVC", articulation: "Full — 28 puntos", accessories: "Tela de arana, manos, base", purchasePrice: 25, currentValue: 32, category: "Marvel / DC", condition: "complete", packaging: "carded", forSale: false, image: IMG.gijoe, images: [IMG.gijoe], addedAt: "2026-02-12", priceHistory: generatePriceHistory(28) },
  { id: "20", name: "Batman Hush MAFEX", character: "Batman", description: "MAFEX Batman Hush. Traje azul clasico con accesorios premium.", brand: "Medicom", line: "MAFEX", year: 2022, scale: '6"', material: "PVC / ABS", articulation: "Full — 30+ puntos", accessories: "Batarangs, grapnel, capa, base", purchasePrice: 72, currentValue: 95, category: "Marvel / DC", condition: "mint_sealed", packaging: "boxed", forSale: false, image: IMG.gijoe, images: [IMG.gijoe], addedAt: "2026-01-30", priceHistory: generatePriceHistory(82), location: "Vitrina C" },
  { id: "21", name: "Piccolo S.H.Figuarts", character: "Piccolo", description: "S.H.Figuarts Dragon Ball Z Piccolo. Con Makankosappo y capa.", brand: "Bandai", line: "S.H.Figuarts", subline: "Dragon Ball Z", year: 2023, scale: '7"', material: "PVC / ABS", articulation: "Full — 16+ puntos", accessories: "Capa, turbante, 4x manos, Makankosappo", purchasePrice: 68, currentValue: 115, category: "Dragon Ball", condition: "mint_sealed", packaging: "window_box", forSale: false, image: IMG.dragonball1, images: [IMG.dragonball1], addedAt: "2026-02-01", priceHistory: generatePriceHistory(90), location: "Vitrina A" },
  { id: "22", name: "Trunks SSJ S.H.Figuarts", character: "Trunks", description: "S.H.Figuarts DBZ Trunks Super Saiyan. Con espada y chaleco Capsule Corp.", brand: "Bandai", line: "S.H.Figuarts", subline: "Dragon Ball Z", year: 2022, scale: '6"', material: "PVC / ABS", articulation: "Full — 16+ puntos", accessories: "Espada, 3x manos, base", purchasePrice: 58, currentValue: 98, category: "Dragon Ball", condition: "complete", packaging: "window_box", forSale: false, image: IMG.dragonball1, images: [IMG.dragonball1], addedAt: "2025-12-05", priceHistory: generatePriceHistory(75) },
  { id: "23", name: "Optimus Prime MP-44", character: "Optimus Prime", description: "Masterpiece Optimus Prime MP-44. Transformacion completa con trailer.", brand: "Takara Tomy", line: "Masterpiece", year: 2022, scale: '12"', material: "ABS / Die-cast", articulation: "Full — 40+ puntos", accessories: "Trailer, arma, matrix, base", purchasePrice: 280, currentValue: 340, category: "Marvel / DC", condition: "mint_sealed", packaging: "boxed", forSale: false, image: IMG.seiya, images: [IMG.seiya], addedAt: "2025-11-15", priceHistory: generatePriceHistory(310), location: "Vitrina C" },
  { id: "24", name: "Darth Vader Black Series", character: "Darth Vader", description: "Black Series Darth Vader con sable laser iluminable y capa de tela.", brand: "Hasbro", line: "Black Series", year: 2023, scale: '6"', material: "PVC", articulation: "Full — 26 puntos", accessories: "Sable laser, manos, capa", purchasePrice: 30, currentValue: 45, category: "Marvel / DC", condition: "mint_open", packaging: "window_box", forSale: false, image: IMG.vintage, images: [IMG.vintage], addedAt: "2026-02-14", priceHistory: generatePriceHistory(38) },
  { id: "25", name: "Scarlett Classified", character: "Scarlett", description: "G.I. Joe Classified Scarlett. Arquera con ballesta y accesorios tacticos.", brand: "Hasbro", line: "Classified Series", year: 2020, scale: '6"', material: "PVC / ABS", articulation: "Full — 30 puntos", accessories: "Ballesta, pistola, base", purchasePrice: 19, currentValue: 35, category: "GI Joe", condition: "complete", packaging: "window_box", forSale: false, image: IMG.gijoe, images: [IMG.gijoe], addedAt: "2025-11-30", priceHistory: generatePriceHistory(27) },
];

// --- 6 Categories ---
export const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Dragon Ball", color: "#F59E0B", icon: "zap", count: 6, totalValue: 643 },
  { id: "2", name: "Tortugas Ninja", color: "#10B981", icon: "shield", count: 4, totalValue: 335 },
  { id: "3", name: "Masters of the Universe", color: "#8B5CF6", icon: "sword", count: 4, totalValue: 150 },
  { id: "4", name: "GI Joe", color: "#3B82F6", icon: "target", count: 4, totalValue: 170 },
  { id: "5", name: "Saint Seiya", color: "#EC4899", icon: "star", count: 3, totalValue: 585 },
  { id: "6", name: "Marvel / DC", color: "#EF4444", icon: "shield", count: 4, totalValue: 512 },
];

// --- Review items ---
export const MOCK_REVIEW_ITEMS: ReviewItem[] = [
  { id: "r1", figureId: "6", name: "Vegeta Super Saiyan Final Flash", image: IMG.vintage, issue: "Datos incompletos — falta UPC y ubicacion", issueType: "incomplete_data", severity: "critical", impact: "Afecta a la valoracion estimada y busqueda" },
  { id: "r2", figureId: "3", name: "He-Man Origins Deluxe", image: IMG.motu, issue: "Sin ubicacion asignada", issueType: "missing_location", severity: "critical", impact: "No se puede localizar en la coleccion" },
  { id: "r3", figureId: "2", name: "Leonardo NECA 1990 Movie", image: IMG.tmnt, issue: "Posible duplicado detectado", issueType: "duplicate", severity: "improvement", impact: "Puede haber confusion con otros registros" },
  { id: "r4", figureId: "1", name: "Goku Ultra Instinct", image: IMG.dragonball1, issue: "Variante sin confirmar — Sign vs Mastered", issueType: "variant", severity: "improvement", impact: "La variante correcta puede cambiar el valor" },
  { id: "r5", figureId: "12", name: "Michelangelo NECA 1990 Movie", image: IMG.tmnt, issue: "Sin ubicacion asignada", issueType: "missing_location", severity: "critical", impact: "No se puede localizar en la coleccion" },
];

// --- 10 Market Listings ---
export const MOCK_MARKET_LISTINGS: MarketListing[] = [
  { id: "m1", figureId: "2", figureName: "Leonardo NECA 1990 Movie", character: "Leonardo", image: IMG.tmnt, price: 78, seller: "ColeccionistaMax", sellerRating: 4.8, condition: "Completo", postedAt: "2026-02-19", brand: "NECA", line: "TMNT 1990 Movie", year: 2019, scale: '7"', location: "Madrid", shipping: true, views: 43, figureStatus: "Excelente", boxStatus: "Leve desgaste", defects: "Ninguno", includes: { figure: true, box: true, accessories: true, base: true, manual: false }, priceRange: { min: 65, max: 95 }, shippingPolicy: "Envio 24-48h" },
  { id: "m2", figureId: "4", figureName: "Snake Eyes Classified #02", character: "Snake Eyes", image: IMG.gijoe, price: 50, seller: "ToyHunter_ES", sellerRating: 4.5, condition: "Sellado", postedAt: "2026-02-17", brand: "Hasbro", line: "Classified Series", year: 2020, scale: '6"', location: "Barcelona", shipping: true, views: 31, priceRange: { min: 40, max: 60 } },
  { id: "m3", figureId: "", figureName: "Frieza Final Form SHF", character: "Frieza", image: IMG.dragonball1, price: 95, seller: "DBZ_Vault", sellerRating: 4.9, condition: "Sellado", postedAt: "2026-02-16", brand: "Bandai", line: "S.H.Figuarts", year: 2023, scale: '6"', location: "Valencia", shipping: true, views: 87, priceRange: { min: 80, max: 110 } },
  { id: "m4", figureId: "", figureName: "Optimus Prime MP-44", character: "Optimus Prime", image: IMG.seiya, price: 320, seller: "TransformersCol", sellerRating: 5.0, condition: "Sellado", postedAt: "2026-02-15", brand: "Takara Tomy", line: "Masterpiece", year: 2022, scale: '12"', location: "Sevilla", shipping: true, views: 124, priceRange: { min: 280, max: 380 } },
  { id: "m5", figureId: "", figureName: "Spider-Man Retro Wave", character: "Spider-Man", image: IMG.gijoe, price: 28, seller: "MarvelHead", sellerRating: 4.3, condition: "Completo", postedAt: "2026-02-14", brand: "Hasbro", line: "Marvel Legends", year: 2024, scale: '6"', location: "Bilbao", shipping: true, views: 56, priceRange: { min: 22, max: 35 } },
  { id: "m6", figureId: "", figureName: "Darth Vader Black Series", character: "Darth Vader", image: IMG.vintage, price: 42, seller: "GalacticToys", sellerRating: 4.7, condition: "Caja abierta", postedAt: "2026-02-13", brand: "Hasbro", line: "Black Series", year: 2023, scale: '6"', location: "Zaragoza", shipping: true, views: 68, priceRange: { min: 35, max: 55 } },
  { id: "m7", figureId: "", figureName: "Gemini Saga EX Revival", character: "Saga", image: IMG.seiya, price: 210, seller: "SaintClothFan", sellerRating: 4.6, condition: "Sellado", postedAt: "2026-02-12", brand: "Bandai", line: "Saint Cloth Myth EX", year: 2021, scale: '6.5"', location: "Madrid", shipping: true, views: 93, priceRange: { min: 180, max: 250 } },
  { id: "m8", figureId: "7", figureName: "Skeletor Origins", character: "Skeletor", image: IMG.motu, price: 35, seller: "RetroMasters", sellerRating: 4.4, condition: "Completo", postedAt: "2026-02-11", brand: "Mattel", line: "MOTU Origins", year: 2020, scale: '5.5"', location: "Malaga", shipping: true, views: 22, priceRange: { min: 28, max: 42 } },
  { id: "m9", figureId: "", figureName: "Batman Hush MAFEX", character: "Batman", image: IMG.gijoe, price: 85, seller: "DarkKnightCol", sellerRating: 4.8, condition: "Sellado", postedAt: "2026-02-10", brand: "Medicom", line: "MAFEX", year: 2022, scale: '6"', location: "A Coruna", shipping: true, views: 77, priceRange: { min: 70, max: 100 } },
  { id: "m10", figureId: "", figureName: "Goku SSJ Imagination Works", character: "Son Goku", image: IMG.dragonball1, price: 145, seller: "DBZ_Vault", sellerRating: 4.9, condition: "Sellado", postedAt: "2026-02-08", brand: "Bandai", line: "Imagination Works", year: 2024, scale: '7"', location: "Valencia", shipping: false, views: 105, priceRange: { min: 120, max: 170 } },
];

// --- 4 Conversations ---
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1", listingId: "m1", participantName: "ColeccionistaMax",
    lastMessage: "Sigue disponible?", lastMessageTime: "14:32", unread: 2,
    listingName: "Leonardo NECA 1990 Movie", listingImage: IMG.tmnt, listingPrice: 78,
    messages: [
      { id: "msg1", senderId: "other", senderName: "ColeccionistaMax", text: "Hola! Me interesa el Leonardo NECA.", timestamp: "14:30", isOwn: false, type: "text" },
      { id: "msg2", senderId: "other", senderName: "ColeccionistaMax", text: "Sigue disponible?", timestamp: "14:32", isOwn: false, type: "text" },
    ],
  },
  {
    id: "c2", listingId: "m2", participantName: "ToyHunter_ES",
    lastMessage: "Hecho! Te lo envio manana.", lastMessageTime: "Ayer", unread: 0,
    listingName: "Snake Eyes Classified #02", listingImage: IMG.gijoe, listingPrice: 50,
    messages: [
      { id: "msg3", senderId: "me", senderName: "Tu", text: "Hola, aceptarias 45 por el Snake Eyes?", timestamp: "10:00", isOwn: true, type: "text" },
      { id: "msg4", senderId: "other", senderName: "ToyHunter_ES", text: "Puedo dejarlo en 48, precio final.", timestamp: "10:15", isOwn: false, type: "text" },
      { id: "msg5", senderId: "me", senderName: "Tu", text: "Hecho!", timestamp: "10:20", isOwn: true, type: "text" },
      { id: "msg6", senderId: "system", senderName: "SILE", timestamp: "10:21", isOwn: false, type: "offer", text: "Oferta aceptada", offer: { id: "o1", amount: 48, note: "Precio final acordado", expiry: "2026-02-20", shippingMethod: "Correos Express", status: "accepted", timestamp: "10:21" } },
      { id: "msg7", senderId: "other", senderName: "ToyHunter_ES", text: "Hecho! Te lo envio manana.", timestamp: "10:22", isOwn: false, type: "text" },
    ],
  },
  {
    id: "c3", listingId: "m7", participantName: "SaintClothFan",
    lastMessage: "Puedo hacer 190 si te parece.", lastMessageTime: "Ayer", unread: 1,
    listingName: "Gemini Saga EX Revival", listingImage: IMG.seiya, listingPrice: 210,
    messages: [
      { id: "msg8", senderId: "me", senderName: "Tu", text: "Me interesa el Saga EX. Seria posible 185?", timestamp: "16:00", isOwn: true, type: "text" },
      { id: "msg9", senderId: "other", senderName: "SaintClothFan", text: "Puedo hacer 190 si te parece.", timestamp: "16:30", isOwn: false, type: "text" },
    ],
  },
  {
    id: "c4", listingId: "m5", participantName: "MarvelHead",
    lastMessage: "Genial, lo reservo para ti.", lastMessageTime: "Lun", unread: 0,
    listingName: "Spider-Man Retro Wave", listingImage: IMG.gijoe, listingPrice: 28,
    messages: [
      { id: "msg10", senderId: "me", senderName: "Tu", text: "Me lo quedo! Cuando puedes enviarlo?", timestamp: "12:00", isOwn: true, type: "text" },
      { id: "msg11", senderId: "other", senderName: "MarvelHead", text: "Genial, lo reservo para ti.", timestamp: "12:15", isOwn: false, type: "text" },
    ],
  },
];

// --- 5 Wishlist Items ---
export const MOCK_WISHLIST: WishlistItem[] = [
  { id: "w1", name: "Broly Full Power S.H.Figuarts", character: "Broly", brand: "Bandai", line: "S.H.Figuarts", image: IMG.dragonball1, avgPrice: 89, priceRange: { min: 72, max: 115 }, bestPrice: 72, bestSource: "Wallapop", trend: "down", trendPercent: 8, trackingActive: true, alertThreshold: 70, addedAt: "2026-02-10" },
  { id: "w2", name: "Donatello NECA Ultimate", character: "Donatello", brand: "NECA", line: "TMNT 1990 Movie", image: IMG.tmnt, avgPrice: 78, priceRange: { min: 60, max: 95 }, bestPrice: 60, bestSource: "eBay", trend: "up", trendPercent: 12, trackingActive: true, alertThreshold: 55, addedAt: "2026-02-05" },
  { id: "w3", name: "Battle Cat Origins", character: "Battle Cat", brand: "Mattel", line: "MOTU Origins", image: IMG.motu, avgPrice: 42, priceRange: { min: 35, max: 55 }, bestPrice: 35, bestSource: "Vinted", trend: "stable", trendPercent: 1, trackingActive: false, addedAt: "2026-01-28" },
  { id: "w4", name: "Phoenix Ikki EX", character: "Ikki", brand: "Bandai", line: "Saint Cloth Myth EX", image: IMG.seiya, avgPrice: 195, priceRange: { min: 170, max: 230 }, bestPrice: 170, bestSource: "Amazon", trend: "down", trendPercent: 5, trackingActive: true, alertThreshold: 160, addedAt: "2026-01-20" },
  { id: "w5", name: "Cobra Commander Regal", character: "Cobra Commander", brand: "Hasbro", line: "Classified Series", image: IMG.gijoe, avgPrice: 32, priceRange: { min: 25, max: 40 }, bestPrice: 25, bestSource: "Wallapop", trend: "down", trendPercent: 15, trackingActive: true, alertThreshold: 22, addedAt: "2026-02-15" },
];

// --- Followed Users ---
export const MOCK_FOLLOWED_USERS: FollowedUser[] = [
  { id: "fu1", name: "ColeccionistaMax", avatar: "CM", joinedAt: "2024-06-15", totalListings: 23, recentListings: [{ id: "rl1", name: "Leonardo NECA 1990 Movie", image: IMG.tmnt, price: 78, postedAt: "2026-02-19" }, { id: "rl2", name: "Michelangelo NECA 1990", image: IMG.tmnt, price: 72, postedAt: "2026-02-15" }], hasNewListings: true, hasNewSales: false, followedAt: "2026-01-10" },
  { id: "fu2", name: "DBZ_Vault", avatar: "DV", joinedAt: "2023-11-01", totalListings: 47, recentListings: [{ id: "rl3", name: "Goku SSJ Imagination Works", image: IMG.dragonball1, price: 145, postedAt: "2026-02-08" }, { id: "rl4", name: "Frieza Final Form", image: IMG.dragonball1, price: 95, postedAt: "2026-02-16" }], hasNewListings: true, hasNewSales: true, followedAt: "2025-12-20" },
  { id: "fu3", name: "TransformersCol", avatar: "TC", joinedAt: "2024-03-10", totalListings: 15, recentListings: [{ id: "rl6", name: "Optimus Prime MP-44", image: IMG.seiya, price: 320, postedAt: "2026-02-15" }], hasNewListings: false, hasNewSales: false, followedAt: "2026-02-01" },
  { id: "fu4", name: "RetroMasters", avatar: "RM", joinedAt: "2025-01-20", totalListings: 8, recentListings: [{ id: "rl7", name: "Skeletor Origins", image: IMG.motu, price: 35, postedAt: "2026-02-11" }], hasNewListings: false, hasNewSales: true, followedAt: "2026-02-05" },
];

// --- 8 Notifications ---
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "price_drop", title: "Bajada de precio", message: "Broly Full Power SHF ha bajado a 72\u20AC en Wallapop", timestamp: "2026-02-25T10:30:00", read: false, image: IMG.dragonball1 },
  { id: "n2", type: "new_product", title: "Nuevo producto", message: "ColeccionistaMax ha publicado 'Michelangelo NECA 1990' a 72\u20AC", timestamp: "2026-02-25T09:15:00", read: false, image: IMG.tmnt },
  { id: "n3", type: "offer_received", title: "Oferta recibida", message: "Has recibido una oferta de 70\u20AC por tu Leonardo NECA", timestamp: "2026-02-24T18:45:00", read: false, image: IMG.tmnt },
  { id: "n4", type: "offer_accepted", title: "Oferta aceptada", message: "ToyHunter_ES ha aceptado tu oferta de 48\u20AC por Snake Eyes", timestamp: "2026-02-24T10:21:00", read: true, image: IMG.gijoe },
  { id: "n5", type: "duplicate_detected", title: "Posible duplicado", message: "Leonardo NECA 1990 Movie podria estar duplicado en tu coleccion", timestamp: "2026-02-23T14:00:00", read: true },
  { id: "n6", type: "price_drop", title: "Bajada de precio", message: "Cobra Commander Classified ha bajado a 25\u20AC en Wallapop", timestamp: "2026-02-22T16:30:00", read: true, image: IMG.gijoe },
  { id: "n7", type: "new_product", title: "Nuevo producto", message: "DBZ_Vault ha publicado 'Frieza Final Form' a 95\u20AC", timestamp: "2026-02-22T11:00:00", read: true, image: IMG.dragonball1 },
  { id: "n8", type: "price_drop", title: "Bajada de precio", message: "Phoenix Ikki EX ha bajado a 170\u20AC en Amazon", timestamp: "2026-02-21T09:00:00", read: true, image: IMG.seiya },
];

// --- 5 Sales ---
export const MOCK_MY_SALES: MySale[] = [
  { id: "s1", figureName: "Leonardo NECA 1990 Movie", image: IMG.tmnt, price: 78, status: "active", views: 43, inquiries: 3, postedAt: "2026-02-19", condition: "Completo", brand: "NECA", line: "TMNT 1990 Movie" },
  { id: "s2", figureName: "Snake Eyes Classified #02", image: IMG.gijoe, price: 50, status: "active", views: 31, inquiries: 1, postedAt: "2026-02-17", condition: "Sellado", brand: "Hasbro", line: "Classified Series" },
  { id: "s3", figureName: "Skeletor Origins", image: IMG.motu, price: 35, status: "active", views: 22, inquiries: 0, postedAt: "2026-02-11", condition: "Completo", brand: "Mattel", line: "MOTU Origins" },
  { id: "s4", figureName: "Vegeta SSJ Blue S.H.Figuarts", image: IMG.dragonball1, price: 65, status: "sold", views: 89, inquiries: 7, postedAt: "2026-01-20", soldAt: "2026-02-05", buyer: "SaiyanFan99", condition: "Sellado", brand: "Bandai", line: "S.H.Figuarts" },
  { id: "s5", figureName: "Destro Classified", image: IMG.gijoe, price: 28, status: "draft", views: 0, inquiries: 0, postedAt: "2026-02-24", condition: "Completo", brand: "Hasbro", line: "Classified Series" },
];

// --- Autocomplete database ---
export interface AutocompleteResult {
  name: string;
  character: string;
  brand: string;
  line: string;
  year: number;
  scale: string;
  material: string;
  upc: string;
  category: string;
}

export const AUTOCOMPLETE_DB: AutocompleteResult[] = [
  { name: "Goku Ultra Instinct", character: "Son Goku", brand: "Bandai", line: "S.H.Figuarts", year: 2022, scale: '6"', material: "PVC / ABS", upc: "4573102630056", category: "Dragon Ball" },
  { name: "Vegeta Final Flash", character: "Vegeta", brand: "Bandai", line: "S.H.Figuarts", year: 2021, scale: '6"', material: "PVC / ABS", upc: "4573102615633", category: "Dragon Ball" },
  { name: "Leonardo NECA 1990 Movie", character: "Leonardo", brand: "NECA", line: "TMNT 1990 Movie", year: 2019, scale: '7"', material: "PVC", upc: "634482541524", category: "Tortugas Ninja" },
  { name: "He-Man Origins Deluxe", character: "He-Man", brand: "Mattel", line: "MOTU Origins", year: 2021, scale: '5.5"', material: "PVC", upc: "887961929751", category: "Masters of the Universe" },
  { name: "Snake Eyes Classified #02", character: "Snake Eyes", brand: "Hasbro", line: "Classified Series", year: 2020, scale: '6"', material: "PVC / ABS", upc: "5010993679850", category: "GI Joe" },
  { name: "Pegasus Seiya V3 EX", character: "Seiya", brand: "Bandai", line: "Saint Cloth Myth EX", year: 2023, scale: '6.5"', material: "Die-cast / PVC / Cloth", upc: "4573102640123", category: "Saint Seiya" },
  { name: "Spider-Man Retro Wave", character: "Spider-Man", brand: "Hasbro", line: "Marvel Legends", year: 2024, scale: '6"', material: "PVC", upc: "5010993892455", category: "Marvel / DC" },
  { name: "Batman Hush MAFEX", character: "Batman", brand: "Medicom", line: "MAFEX", year: 2022, scale: '6"', material: "PVC / ABS", upc: "4530956471204", category: "Marvel / DC" },
  { name: "Optimus Prime MP-44", character: "Optimus Prime", brand: "Takara Tomy", line: "Masterpiece", year: 2022, scale: '12"', material: "ABS / Die-cast", upc: "4904810177968", category: "Marvel / DC" },
  { name: "Darth Vader Black Series", character: "Darth Vader", brand: "Hasbro", line: "Black Series", year: 2023, scale: '6"', material: "PVC", upc: "5010994148270", category: "Marvel / DC" },
];

export function searchAutocomplete(query: string): AutocompleteResult[] {
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  return AUTOCOMPLETE_DB.filter(
    (r) => r.name.toLowerCase().includes(q) || r.character.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q) || r.upc?.includes(q)
  ).slice(0, 6);
}

// --- External price sources mock ---
export interface ExternalPrice {
  source: string;
  price: number;
  url: string;
  condition: string;
  lastUpdated: string;
}

export function getExternalPrices(figureName: string): ExternalPrice[] {
  const base = figureName.length * 5 + 30;
  return [
    { source: "Wallapop", price: base - Math.round(Math.random() * 10), url: "#", condition: "Usado", lastUpdated: "2026-02-21" },
    { source: "eBay", price: base + Math.round(Math.random() * 20), url: "#", condition: "Nuevo", lastUpdated: "2026-02-22" },
    { source: "Vinted", price: base - Math.round(Math.random() * 15), url: "#", condition: "Usado", lastUpdated: "2026-02-20" },
    { source: "Amazon", price: base + Math.round(Math.random() * 30), url: "#", condition: "Nuevo", lastUpdated: "2026-02-23" },
  ];
}

export function calculateSuggestedPrice(name: string, condition: string): number {
  const prices = getExternalPrices(name);
  const avg = prices.reduce((s, p) => s + p.price, 0) / prices.length;
  const factor = condition.includes("sealed") || condition.includes("mint") ? 1.08 : condition.includes("complete") ? 0.92 : 0.78;
  return Math.round(avg * factor);
}

export function generateAdText(f: Partial<Figure>): string {
  const cond: Record<string, string> = {
    mint_sealed: "SELLADO de fabrica, nunca abierto",
    mint_open: "Abierto con cuidado, como nuevo, con caja",
    complete: "Completo con todos los accesorios",
    loose: "Suelto, sin caja",
    incomplete: "Incompleto — ver descripcion",
  };
  return `${f.name} — ${f.brand} ${f.line} (${f.year})\n\n${cond[f.condition || "complete"] || "Buen estado"}.\n${f.scale || ""} | ${f.material || ""}\n\n${f.description || ""}\n\nAccesorios: ${f.accessories || "Los de la foto"}\n\nEnvios a toda Espana. Mas figuras en mi perfil de SILE.`;
}

export const ALL_BRANDS = ["Bandai", "NECA", "Mattel", "Hasbro", "Takara Tomy", "Medicom", "McFarlane", "Super7", "Mezco", "Hot Toys"];
export const ALL_LINES = ["S.H.Figuarts", "TMNT 1990 Movie", "MOTU Origins", "Classified Series", "Saint Cloth Myth EX", "Marvel Legends", "Black Series", "Masterpiece", "MAFEX", "Imagination Works"];
export const ALL_SCALES = ['3.75"', '5.5"', '6"', '6.5"', '7"', '10"', '12"', "1/6"];
export const CONDITION_LABELS: Record<string, string> = {
  mint_sealed: "Sellado", mint_open: "Abierto como nuevo", complete: "Completo", loose: "Suelto", incomplete: "Incompleto",
};
