import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useCollection } from "../lib/collection-store";
import { MOCK_MARKET_LISTINGS } from "../lib/mock-data";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  Flame,
  Plus,
  Heart,
  UserPlus,
  Package,
  Store,
  AlertTriangle,
  Copy,
  MapPin,
  Barcode,
  ChevronRight,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

/**
 * Dashboard v2 (MVP) + recuperación de secciones clave:
 * - HERO Discover con tabs: Para ti / Top ventas / Novedades
 * - Seguimiento guardado en localStorage (sin tocar store)
 * - Requieren acción (lista + progreso)
 * - Categorías (lista + navegación) + soporte scrollToCategories desde menú
 */

type DiscoverTab = "forYou" | "top" | "new";

type FollowTopic = {
  id: string;
  label: string;
  hint: string;
  match: string[];
};

const FOLLOW_TOPICS: FollowTopic[] = [
  { id: "shf", label: "S.H.Figuarts", hint: "Figuras y novedades SHF", match: ["figuarts", "s.h", "shf"] },
  { id: "db", label: "Dragon Ball", hint: "Goku, Vegeta, saga DB", match: ["goku", "vegeta", "dragon ball", "db"] },
  { id: "onepiece", label: "One Piece", hint: "Luffy, Zoro, etc.", match: ["luffy", "zoro", "one piece"] },
  { id: "marvel", label: "Marvel", hint: "Spider-Man, Iron Man…", match: ["spider", "marvel", "iron", "venom"] },
  { id: "neca", label: "NECA", hint: "NECA + cine/coleccionismo", match: ["neca"] },
  { id: "mafex", label: "MAFEX", hint: "MAFEX / premium", match: ["mafex"] },
];

const LS_KEY = "sile_followed_topics_v1";

/** Helpers: métricas fake estables por id */
function stableScoreFromId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}
function isNewListing(id: string) {
  return stableScoreFromId(id) % 10 < 4;
}
function weeklySales(id: string) {
  return 20 + (stableScoreFromId(id) % 201);
}
function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Colores fijos para las categorías (puntos de color) */
const CAT_COLORS = ["#F59E0B", "#34D399", "#A78BFA", "#60A5FA", "#F472B6", "#EF4444", "#22C55E", "#EAB308", "#38BDF8"];

type ActionItem = {
  id: string;
  name: string;
  image?: string;
  level: "critical" | "improve";
  title: string;
  subtitle: string;
  icon: "barcode" | "location" | "duplicate" | "missing";
};

export function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 Importante: aquí recuperamos también categories del store (como en AddFigurePage)
  const { figures, categories } = useCollection() as any;

  // HERO tabs
  const [tab, setTab] = useState<DiscoverTab>("forYou");

  // Followed topics (localStorage)
  const [followed, setFollowed] = useState<string[]>([]);

  // Scroll targets
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setFollowed(JSON.parse(raw));
      else setFollowed([]);
    } catch {
      setFollowed([]);
    }
  }, []);

  const saveFollowed = (next: string[]) => {
    setFollowed(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}
  };

  const toggleFollow = (topicId: string) => {
    const next = followed.includes(topicId)
      ? followed.filter((x) => x !== topicId)
      : [...followed, topicId];
    saveFollowed(next);
  };

  // Stats (Mi colección)
  const totalFigures = figures.length;

  const totalValue = useMemo(() => {
    return figures.reduce((sum: number, f: any) => sum + (Number(f.currentValue) || 0), 0);
  }, [figures]);

  // Validación simple: completitud
  const completeness = useMemo(() => {
    if (figures.length === 0) return 0;
    const score = figures.reduce((acc: number, f: any) => {
      let s = 0;
      if (f.name) s += 1;
      if (f.category) s += 1;
      if (f.purchasePrice && Number(f.purchasePrice) > 0) s += 1;
      if (f.location) s += 1;
      if (f.upc) s += 1;
      if (f.images && Array.isArray(f.images) && f.images.length > 0) s += 1;
      return acc + s / 6;
    }, 0);
    return Math.round((score / figures.length) * 100);
  }, [figures]);

  // “Requieren acción”: lista (críticas + mejoras)
  const actionItems = useMemo<ActionItem[]>(() => {
    const items: ActionItem[] = [];

    figures.forEach((f: any) => {
      // Críticas: faltan datos que afectan a valoración/búsqueda
      const missingUPC = !f.upc;
      const missingLocation = !f.location;
      const missingPrice = !f.purchasePrice || Number(f.purchasePrice) === 0;
      const missingCategory = !f.category;
      const missingImages = !f.images || (Array.isArray(f.images) && f.images.length === 0);

      // Regla: si faltan varios → crítica
      const criticalHits = [missingUPC, missingLocation, missingPrice, missingCategory, missingImages].filter(Boolean).length;

      if (criticalHits >= 2) {
        let title = "Datos incompletos";
        let subtitle = "Afecta a la valoración y búsqueda";
        let icon: ActionItem["icon"] = "missing";

        if (missingUPC) {
          title = "Datos incompletos — falta UPC";
          subtitle = "Afecta a la valoración estimada y búsqueda";
          icon = "barcode";
        } else if (missingLocation) {
          title = "Sin ubicación asignada";
          subtitle = "No se puede localizar en la colección";
          icon = "location";
        }

        items.push({
          id: f.id,
          name: f.name,
          image: f.image,
          level: "critical",
          title,
          subtitle,
          icon,
        });
        return;
      }

      // Mejoras: casos “soft”
      if (missingUPC || missingLocation) {
        items.push({
          id: f.id,
          name: f.name,
          image: f.image,
          level: "improve",
          title: missingUPC ? "Falta UPC / código de barras" : "Sin ubicación asignada",
          subtitle: missingUPC ? "Mejora la búsqueda y el autocompletado" : "Mejora organización de tu colección",
          icon: missingUPC ? "barcode" : "location",
        });
      }
    });

    // orden: críticas primero
    items.sort((a, b) => (a.level === b.level ? 0 : a.level === "critical" ? -1 : 1));
    return items.slice(0, 8);
  }, [figures]);

  const needActionCount = useMemo(() => actionItems.length, [actionItems]);

  // Categorías (tabla)
  const categoriesStats = useMemo(() => {
    const cats = (categories || []).map((c: any, idx: number) => ({
      ...c,
      _color: CAT_COLORS[idx % CAT_COLORS.length],
    }));

    const byName = new Map<string, { count: number; value: number }>();
    figures.forEach((f: any) => {
      const key = f.category || "Sin categoría";
      const prev = byName.get(key) || { count: 0, value: 0 };
      byName.set(key, { count: prev.count + 1, value: prev.value + (Number(f.currentValue) || 0) });
    });

    // Si el store tiene categorías definidas, las mostramos primero (en orden)
    const rows = cats.map((c: any) => {
      const stat = byName.get(c.name) || { count: 0, value: 0 };
      return { id: c.id, name: c.name, color: c._color, count: stat.count, value: Math.round(stat.value) };
    });

    // Si existen figuras “Sin categoría”, añadimos fila al final
    if (byName.has("Sin categoría")) {
      const stat = byName.get("Sin categoría")!;
      rows.push({ id: "uncat", name: "Sin categoría", color: "#94A3B8", count: stat.count, value: Math.round(stat.value) });
    }

    // ocultamos categorías vacías si no hay figures
    return rows.filter((r) => r.count > 0);
  }, [categories, figures]);

  const recentlyAdded = useMemo(() => {
    const copy = [...figures];
    copy.sort((a: any, b: any) => {
      const da = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const db = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      return db - da;
    });
    return copy.slice(0, 6);
  }, [figures]);

  // Marketplace (para Discover)
  const listings = useMemo(() => {
    return (MOCK_MARKET_LISTINGS as any[]).map((l) => ({
      ...l,
      _isNew: isNewListing(l.id),
      _weeklySales: weeklySales(l.id),
      _title: l.name || l.title || l.listingName || "Figura",
      _price: Number(l.price || l.listingPrice || 0),
      _image: l.image || l.cover || l.listingImage || l.images?.[0] || "",
      _condition: l.condition || "Completo",
    }));
  }, []);

  const top10 = useMemo(() => {
    return [...listings].sort((a, b) => b._weeklySales - a._weeklySales).slice(0, 10);
  }, [listings]);

  const news = useMemo(() => {
    return [...listings]
      .sort((a, b) => {
        const an = a._isNew ? 1 : 0;
        const bn = b._isNew ? 1 : 0;
        if (bn !== an) return bn - an;
        return b._weeklySales - a._weeklySales;
      })
      .slice(0, 12);
  }, [listings]);

  const forYou = useMemo(() => {
    if (followed.length === 0) return [];
    const topics = FOLLOW_TOPICS.filter((t) => followed.includes(t.id));
    const keywords = topics.flatMap((t) => t.match).map(normalize);

    return listings
      .filter((l) => {
        const title = normalize(l._title);
        return keywords.some((k) => title.includes(k));
      })
      .sort((a, b) => (b._isNew ? 1 : 0) - (a._isNew ? 1 : 0) || b._weeklySales - a._weeklySales)
      .slice(0, 12);
  }, [followed, listings]);

  // 👇 Soporte del menú “Categorías” anidado (scroll)
  useEffect(() => {
    const s = (location.state as any) || {};
    if (s?.scrollToCategories) {
      // pequeño delay para que renderice
      setTimeout(() => categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      // limpiamos state para no repetir
      try {
        window.history.replaceState({}, document.title);
      } catch {}
    }
  }, [location.state]);

  const renderListingCard = (l: any) => (
    <button
      key={l.id}
      onClick={() => navigate("/marketplace")}
      className="text-left rounded-xl overflow-hidden border border-border bg-card hover:border-[#9CFF49]/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50"
    >
      <div className="aspect-[4/3] bg-secondary/30">
        <ImageWithFallback src={l._image} alt={l._title} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-foreground line-clamp-2" style={{ fontSize: "0.85rem" }}>
            {l._title}
          </p>
          <span className="text-[#9CFF49]" style={{ fontSize: "0.9rem" }}>
            {l._price ? `${l._price}€` : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {l._isNew && (
            <Badge className="bg-[#9CFF49] text-[#0a0a0a] text-[0.55rem]">Nuevo</Badge>
          )}
          <Badge variant="secondary" className="text-[0.55rem]">{l._condition}</Badge>
          <span className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>
            {l._weeklySales} ventas/sem
          </span>
        </div>
      </div>
    </button>
  );

  const renderDiscover = () => {
    if (tab === "forYou") {
      return (
        <div className="space-y-3">
          {followed.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-foreground" style={{ fontSize: "0.95rem" }}>
                      Para ti (personaliza tu feed)
                    </p>
                    <p className="text-muted-foreground mt-1" style={{ fontSize: "0.75rem" }}>
                      Sigue líneas o universos y verás aquí novedades y top ventas relacionadas.
                    </p>
                  </div>
                  <UserPlus className="w-5 h-5 text-[#9CFF49]" />
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {FOLLOW_TOPICS.map((t) => {
                    const isOn = followed.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleFollow(t.id)}
                        className={`shrink-0 px-3 py-2 rounded-lg border transition-colors ${
                          isOn ? "border-[#9CFF49]/40 bg-[#9CFF49]/10 text-[#9CFF49]" : "border-border bg-secondary/20 text-foreground hover:bg-secondary/30"
                        }`}
                      >
                        <p style={{ fontSize: "0.8rem" }} className="whitespace-nowrap">{t.label}</p>
                        <p style={{ fontSize: "0.65rem" }} className="text-muted-foreground whitespace-nowrap">{t.hint}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Button variant="outline" onClick={() => navigate("/marketplace")} className="gap-2">
                    <Store className="w-4 h-4" />
                    Ir al Marketplace
                  </Button>
                  <Button onClick={() => setTab("new")} className="gap-2 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]">
                    <Sparkles className="w-4 h-4" />
                    Ver Novedades
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground" style={{ fontSize: "0.95rem" }}>Para ti</p>
                  <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                    Novedades y tendencias en lo que sigues
                  </p>
                </div>
                <Button variant="ghost" className="text-[#9CFF49]" onClick={() => setTab("top")}>
                  Ver top <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {FOLLOW_TOPICS.map((t) => {
                  const isOn = followed.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleFollow(t.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-full border transition-colors ${
                        isOn ? "border-[#9CFF49]/40 bg-[#9CFF49]/10 text-[#9CFF49]" : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
                      }`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {isOn ? "Siguiendo · " : ""}{t.label}
                    </button>
                  );
                })}
              </div>

              {forYou.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <p className="text-foreground" style={{ fontSize: "0.85rem" }}>
                      Aún no hay resultados para tus seguidos
                    </p>
                    <p className="text-muted-foreground mt-1" style={{ fontSize: "0.75rem" }}>
                      Prueba a seguir otras líneas o ve a Novedades.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" onClick={() => setTab("new")}>Ver Novedades</Button>
                      <Button className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]" onClick={() => navigate("/marketplace")}>
                        Ir a Marketplace
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {forYou.slice(0, 8).map(renderListingCard)}
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    if (tab === "top") {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground" style={{ fontSize: "0.95rem" }}>Top ventas</p>
              <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                Las más vendidas esta semana (prueba social + FOMO)
              </p>
            </div>
            <Button variant="ghost" className="text-[#9CFF49]" onClick={() => setTab("new")}>
              Ver novedades <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top10.slice(0, 3).map((l, idx) => (
              <button
                key={l.id}
                onClick={() => navigate("/marketplace")}
                className="text-left rounded-xl overflow-hidden border border-border bg-card hover:border-[#9CFF49]/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50"
              >
                <div className="aspect-[16/9] bg-secondary/30 relative">
                  <ImageWithFallback src={l._image} alt={l._title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <Badge className="bg-[#9CFF49] text-[#0a0a0a] text-[0.55rem]">#{idx + 1}</Badge>
                    <Badge variant="secondary" className="text-[0.55rem] flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Trending
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-foreground line-clamp-2" style={{ fontSize: "0.85rem" }}>{l._title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#9CFF49]" style={{ fontSize: "0.95rem" }}>{l._price ? `${l._price}€` : "—"}</span>
                    <span className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "0.7rem" }}>
                      <TrendingUp className="w-4 h-4" /> {l._weeklySales}/sem
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {top10.slice(3, 10).map(renderListingCard)}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => navigate("/marketplace")} className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]">
              Ver todo el Marketplace <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground" style={{ fontSize: "0.95rem" }}>Novedades</p>
            <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
              Últimos lanzamientos y reposiciones (descubrimiento global)
            </p>
          </div>
          <Button variant="ghost" className="text-[#9CFF49]" onClick={() => setTab("forYou")}>
            Volver a Para ti <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {news.map(renderListingCard)}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => navigate("/marketplace")} className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]">
            Ir al Marketplace <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  const iconForAction = (t: ActionItem["icon"]) => {
    if (t === "barcode") return <Barcode className="w-4 h-4 text-amber-400" />;
    if (t === "location") return <MapPin className="w-4 h-4 text-amber-400" />;
    if (t === "duplicate") return <Copy className="w-4 h-4 text-amber-400" />;
    return <AlertTriangle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* ─── Discover ─── */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 md:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-foreground" style={{ fontSize: "1rem" }}>
                Descubre
              </p>
              <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                Recomendaciones, top ventas y novedades para empujarte a seguir o comprar
              </p>
            </div>
            <Button onClick={() => navigate("/marketplace")} variant="outline" className="gap-2 shrink-0">
              <Store className="w-4 h-4" />
              Marketplace
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setTab("forYou")}
              className={`shrink-0 px-3 py-2 rounded-lg border transition-colors ${
                tab === "forYou"
                  ? "border-[#9CFF49]/40 bg-[#9CFF49]/10 text-[#9CFF49]"
                  : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              Para ti
            </button>
            <button
              onClick={() => setTab("top")}
              className={`shrink-0 px-3 py-2 rounded-lg border transition-colors ${
                tab === "top"
                  ? "border-[#9CFF49]/40 bg-[#9CFF49]/10 text-[#9CFF49]"
                  : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              🔥 Top ventas
            </button>
            <button
              onClick={() => setTab("new")}
              className={`shrink-0 px-3 py-2 rounded-lg border transition-colors ${
                tab === "new"
                  ? "border-[#9CFF49]/40 bg-[#9CFF49]/10 text-[#9CFF49]"
                  : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              🆕 Novedades
            </button>
          </div>

          {renderDiscover()}
        </CardContent>
      </Card>

      {/* ─── Mi colección ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground" style={{ fontSize: "1.2rem" }}>Mi Colección</h2>
          <Button onClick={() => navigate("/add")} className="gap-2 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]">
            <Plus className="w-4 h-4" />
            Añadir
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#9CFF49]/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#9CFF49]" />
                </div>
                <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Figuras</p>
              </div>
              <p className="text-foreground" style={{ fontSize: "1.35rem" }}>{totalFigures}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#9CFF49]/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#9CFF49]" />
                </div>
                <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Valor estimado</p>
              </div>
              <p className="text-foreground" style={{ fontSize: "1.35rem" }}>{Math.round(totalValue)}€</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Requieren acción</p>
              </div>
              <p className="text-foreground" style={{ fontSize: "1.35rem" }}>{needActionCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Requieren acción (RECUPERADO) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: "1.1rem" }}>
              ✨ Requieren acción <Badge variant="secondary" className="text-[0.65rem]">{needActionCount}</Badge>
            </h3>
            <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
              Completar estos datos mejora la valoración y búsqueda.
            </p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Completitud de colección</p>
              <p className="text-[#9CFF49]" style={{ fontSize: "0.8rem" }}>{completeness}%</p>
            </div>
            <div className="h-2 rounded-full bg-secondary/40 overflow-hidden">
              <div className="h-2 bg-[#9CFF49]" style={{ width: `${completeness}%` }} />
            </div>
          </CardContent>
        </Card>

        {actionItems.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-5 text-center">
              <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
                ¡Perfecto! No tienes acciones pendientes ahora mismo.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {/* Agrupación visual como tus screenshots */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>Críticas — afectan al valor</p>
            </div>

            {actionItems.filter((i) => i.level === "critical").slice(0, 3).map((it) => (
              <Card key={it.id} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
                    <ImageWithFallback src={it.image} alt={it.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate" style={{ fontSize: "0.9rem" }}>{it.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {iconForAction(it.icon)}
                      <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{it.title}</p>
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>{it.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => toast.info("Ignorado (MVP)")}
                    >
                      Ignorar
                    </Button>
                    <Button
                      className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]"
                      onClick={() => navigate(`/figure/${it.id}`)}
                    >
                      Resolver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>Mejoras — datos opcionales</p>
            </div>

            {actionItems.filter((i) => i.level === "improve").slice(0, 3).map((it) => (
              <Card key={it.id} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
                    <ImageWithFallback src={it.image} alt={it.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate" style={{ fontSize: "0.9rem" }}>{it.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {iconForAction(it.icon)}
                      <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{it.title}</p>
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>{it.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="text-muted-foreground" onClick={() => toast.info("Ignorado (MVP)")}>
                      Ignorar
                    </Button>
                    <Button className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]" onClick={() => navigate(`/figure/${it.id}`)}>
                      Resolver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ─── Categorías (RECUPERADO) ─── */}
      <div ref={categoriesRef} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground" style={{ fontSize: "1.1rem" }}>Categorías</h3>
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => toast.info("Crear categoría (pendiente en MVP)")}
          >
            + Nueva
          </Button>
        </div>

        {categoriesStats.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
                Aún no hay categorías con figuras. Añade figuras y selecciónales una categoría.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {categoriesStats.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  if (c.id === "uncat") {
                    toast.info("Sin categoría (MVP)");
                    return;
                  }
                  navigate(`/category/${c.id}`);
                }}
                className="w-full text-left rounded-2xl overflow-hidden border border-border bg-card hover:border-[#9CFF49]/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50"
              >
                <div className="p-4 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate" style={{ fontSize: "0.95rem" }}>{c.name}</p>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Figuras</p>
                      <p className="text-foreground" style={{ fontSize: "0.95rem" }}>{c.count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Valor</p>
                      <p className="text-foreground" style={{ fontSize: "0.95rem" }}>{c.value}€</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Añadidos recientemente ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground" style={{ fontSize: "1.1rem" }}>Añadidos recientemente</h3>
          <Button variant="ghost" className="text-muted-foreground" onClick={() => navigate("/my-figures")}>
            Ver todas <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {recentlyAdded.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
                Aún no has añadido figuras. Empieza añadiendo tu primera figura.
              </p>
              <Button onClick={() => navigate("/add")} className="mt-4 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]">
                Añadir figura
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {recentlyAdded.slice(0, 4).map((f: any) => (
              <button
                key={f.id}
                onClick={() => navigate(`/figure/${f.id}`)}
                className="text-left rounded-2xl overflow-hidden border border-border bg-card hover:border-[#9CFF49]/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50"
              >
                <div className="aspect-[4/5] bg-secondary/30">
                  <ImageWithFallback src={f.image} alt={f.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-foreground line-clamp-1" style={{ fontSize: "0.85rem" }}>
                    {f.name}
                  </p>
                  <p className="text-muted-foreground line-clamp-1" style={{ fontSize: "0.7rem" }}>
                    {f.brand} · {f.line}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-[0.55rem]">
                      {f.conditionLabel || f.condition || "Estado"}
                    </Badge>
                    <span className="text-[#9CFF49]" style={{ fontSize: "0.85rem" }}>
                      {f.currentValue ?? "—"}€
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── CTA final ─── */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-foreground" style={{ fontSize: "0.9rem" }}>Haz SILE más “tuyo”</p>
            <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
              Sigue líneas para ver novedades arriba y guardar deseos en Wishlist.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTab("forYou")} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Seguir
            </Button>
            <Button onClick={() => navigate("/wishlist")} className="gap-2 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]">
              <Heart className="w-4 h-4" />
              Wishlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
