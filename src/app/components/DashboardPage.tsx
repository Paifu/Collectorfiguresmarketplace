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
  CheckCircle2,
  Search,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

/**
 * Dashboard v2 (MVP) + recuperación de secciones clave:
 * - TU RADAR (SILE-first): Te falta / Siguiendo / Novedades / Mercado
 * - Seguimiento guardado en localStorage (sin tocar store)
 * - Requieren acción (lista + progreso)
 * - Categorías (lista + navegación) + soporte scrollToCategories desde menú
 */

type RadarTab = "missing" | "following" | "news" | "market";

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
function isRestockListing(id: string) {
  return stableScoreFromId(id) % 20 < 7;
}
function sileCollectorsMetric(id: string) {
  return 18 + (stableScoreFromId(id) % 363); // 18..380
}
function sileTrendingScore(id: string) {
  return 10 + (stableScoreFromId(id) % 90); // 10..99
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

type ListingLike = {
  id: string;
  _title: string;
  _line: string;
  _price: number;
  _image: string;
  _condition: string;
  _isNew: boolean;
  _isRestock: boolean;
  _collectors: number;
  _trending: number;
};

export function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 Importante: recuperamos también categories del store
  const { figures, categories } = useCollection() as any;

  // Radar tabs (DEFAULT: Te falta)
  const [tab, setTab] = useState<RadarTab>("missing");

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
      const missingUPC = !f.upc;
      const missingLocation = !f.location;
      const missingPrice = !f.purchasePrice || Number(f.purchasePrice) === 0;
      const missingCategory = !f.category;
      const missingImages = !f.images || (Array.isArray(f.images) && f.images.length === 0);

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

    const rows = cats.map((c: any) => {
      const stat = byName.get(c.name) || { count: 0, value: 0 };
      return { id: c.id, name: c.name, color: c._color, count: stat.count, value: Math.round(stat.value) };
    });

    if (byName.has("Sin categoría")) {
      const stat = byName.get("Sin categoría")!;
      rows.push({ id: "uncat", name: "Sin categoría", color: "#94A3B8", count: stat.count, value: Math.round(stat.value) });
    }

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

  // Marketplace pool (para Radar)
  const listings = useMemo<ListingLike[]>(() => {
    return (MOCK_MARKET_LISTINGS as any[]).map((l) => ({
      id: l.id,
      _isNew: isNewListing(l.id),
      _isRestock: isRestockListing(l.id),
      _collectors: sileCollectorsMetric(l.id),
      _trending: sileTrendingScore(l.id),
      _title: l.name || l.title || l.listingName || "Figura",
      _line: l.line || l.series || l.brand || "Línea",
      _price: Number(l.price || l.listingPrice || 0),
      _image: l.image || l.cover || l.listingImage || l.images?.[0] || "",
      _condition: l.condition || "Completo",
    }));
  }, []);

  // Owned names index
  const ownedNames = useMemo(() => {
    const set = new Set<string>();
    (figures || []).forEach((f: any) => set.add(normalize(f?.name || "")));
    return set;
  }, [figures]);

  // TAB: Te falta (heurística simple)
  const missing = useMemo(() => {
    if (!figures || figures.length === 0) return [];

    const kws = new Set<string>();
    (figures as any[]).slice(0, 20).forEach((f) => {
      const a = normalize(f?.name || "");
      const b = normalize(f?.line || "");
      a.split(" ").slice(0, 4).forEach((w) => w.length > 3 && kws.add(w));
      b.split(" ").slice(0, 4).forEach((w) => w.length > 3 && kws.add(w));
    });
    const kwArr = Array.from(kws);

    const candidates = listings
      .filter((p) => {
        const t = normalize(p._title);
        if (ownedNames.has(t)) return false;
        return kwArr.some((k) => t.includes(k));
      })
      .slice(0, 12);

    if (candidates.length < 4) {
      return [...listings]
        .filter((p) => !ownedNames.has(normalize(p._title)))
        .sort((a, b) => b._trending - a._trending)
        .slice(0, 8);
    }

    return candidates.slice(0, 8);
  }, [figures, listings, ownedNames]);

  const missingCount = useMemo(() => missing.length, [missing]);

  // TAB: Siguiendo
  const followingResults = useMemo(() => {
    if (!followed || followed.length === 0) return [];
    const topics = FOLLOW_TOPICS.filter((t) => followed.includes(t.id));
    const keywords = topics.flatMap((t) => t.match).map(normalize);

    return listings
      .filter((l) => {
        const title = normalize(l._title);
        return keywords.some((k) => title.includes(k));
      })
      .sort((a, b) => (b._isNew ? 1 : 0) - (a._isNew ? 1 : 0) || b._trending - a._trending)
      .slice(0, 12);
  }, [followed, listings]);

  // TAB: Novedades (métricas SILE)
  const news = useMemo(() => {
    return [...listings]
      .sort((a, b) => {
        const an = a._isNew ? 1 : 0;
        const bn = b._isNew ? 1 : 0;
        if (bn !== an) return bn - an;
        return b._collectors - a._collectors;
      })
      .slice(0, 12);
  }, [listings]);

  // TAB: Mercado (discreto)
  const market = useMemo(() => {
    return [...listings].sort((a, b) => b._price - a._price).slice(0, 10);
  }, [listings]);

  // 👇 Soporte del menú “Categorías” anidado (scroll)
  useEffect(() => {
    const s = (location.state as any) || {};
    if (s?.scrollToCategories) {
      setTimeout(() => categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      try {
        window.history.replaceState({}, document.title);
      } catch {}
    }
  }, [location.state]);

  const iconForAction = (t: ActionItem["icon"]) => {
    if (t === "barcode") return <Barcode className="w-4 h-4 text-amber-400" />;
    if (t === "location") return <MapPin className="w-4 h-4 text-amber-400" />;
    if (t === "duplicate") return <Copy className="w-4 h-4 text-amber-400" />;
    return <AlertTriangle className="w-4 h-4 text-red-400" />;
  };

  const addToWishlist = (it: ListingLike) => {
    toast.success("Añadido a Wishlist", { description: it._title });
  };

  const markOwned = (it: ListingLike) => {
    toast.message("Marcar como Owned (demo)", { description: "Te llevo a “Añadir figura” para guardarla." });
    navigate("/add");
  };

  const viewDetails = (it: ListingLike) => {
    toast.message("Detalle (demo)", { description: "Te llevo al Marketplace." });
    navigate("/marketplace");
  };

  const EmptyState = ({
    title,
    desc,
    primaryLabel,
    primaryAction,
    secondaryLabel,
    secondaryAction,
  }: {
    title: string;
    desc: string;
    primaryLabel: string;
    primaryAction: () => void;
    secondaryLabel?: string;
    secondaryAction?: () => void;
  }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-foreground" style={{ fontSize: "0.95rem" }}>{title}</p>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "0.75rem" }}>{desc}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#9CFF49]/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#9CFF49]" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={primaryAction} className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] gap-2">
            <Plus className="w-4 h-4" />
            {primaryLabel}
          </Button>
          {secondaryLabel && secondaryAction && (
            <Button variant="outline" onClick={secondaryAction} className="gap-2">
              <Search className="w-4 h-4" />
              {secondaryLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const RadarCard = ({
    it,
    badgeLabel,
    badgeGlow,
    metaLeft,
    metaRight,
    primaryCta,
    secondaryCta,
    onPrimary,
    onSecondary,
    onTertiary,
  }: {
    it: ListingLike;
    badgeLabel: string;
    badgeGlow?: boolean;
    metaLeft?: string;
    metaRight?: string;
    primaryCta: string;
    secondaryCta?: string;
    onPrimary: () => void;
    onSecondary?: () => void;
    onTertiary?: () => void;
  }) => (
    <div className="rounded-2xl overflow-hidden border border-border bg-card hover:border-[#9CFF49]/30 transition-all duration-200 group">
      <div className="aspect-[4/3] bg-secondary/30 relative overflow-hidden">
        <ImageWithFallback src={it._image} alt={it._title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`text-[0.55rem] ${badgeGlow ? "bg-[#9CFF49] text-[#0a0a0a] shadow-[0_0_24px_rgba(156,255,73,0.25)]" : ""}`}
          >
            {badgeLabel}
          </Badge>
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute -inset-10 bg-[#9CFF49]/10 blur-2xl" />
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-foreground line-clamp-1" style={{ fontSize: "0.85rem" }}>{it._title}</p>
            <p className="text-muted-foreground line-clamp-1" style={{ fontSize: "0.7rem" }}>{it._line}</p>
          </div>
          {it._price > 0 && (
            <span className="text-[#9CFF49]" style={{ fontSize: "0.9rem" }}>
              {it._price}€
            </span>
          )}
        </div>

        {(metaLeft || metaRight) && (
          <div className="flex items-center justify-between text-muted-foreground" style={{ fontSize: "0.65rem" }}>
            <span>{metaLeft}</span>
            <span>{metaRight}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onPrimary}
            className="flex-1 h-9 rounded-lg bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] transition-colors flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50"
            style={{ fontSize: "0.75rem" }}
          >
            <Heart className="w-4 h-4" />
            {primaryCta}
          </button>

          {secondaryCta && onSecondary && (
            <button
              onClick={onSecondary}
              className="h-9 px-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50"
              style={{ fontSize: "0.75rem" }}
            >
              <CheckCircle2 className="w-4 h-4 text-[#9CFF49]" />
              {secondaryCta}
            </button>
          )}

          <button
            onClick={onTertiary}
            className="h-9 w-10 rounded-lg border border-border bg-secondary/10 hover:bg-secondary/30 transition-colors flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50"
            title="Ver detalles"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderRadar = () => {
    if (tab === "missing") {
      return (
        <div className="space-y-3">
          {/* Mini resumen */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-[#9CFF49] text-[#0a0a0a] text-[0.6rem] shadow-[0_0_22px_rgba(156,255,73,0.18)]">
                Compleción: {completeness}%
              </Badge>
              <Badge variant="secondary" className="text-[0.6rem]">
                Te faltan {missingCount}
              </Badge>
            </div>

            <button
              onClick={() => toast.message("Missing (demo)", { description: "Aquí abriríamos una vista completa de Missing." })}
              className="text-[#9CFF49] hover:text-[#b7ff7a] transition-colors flex items-center gap-1 self-start sm:self-auto"
              style={{ fontSize: "0.8rem" }}
            >
              Ver Missing <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {(!figures || figures.length === 0) ? (
            <EmptyState
              title="Aún no podemos sugerirte “Te falta”"
              desc="Añade tu primera figura para que SILE detecte huecos y oportunidades en tu colección."
              primaryLabel="Añadir primera figura"
              primaryAction={() => navigate("/add")}
              secondaryLabel="Seguir una línea"
              secondaryAction={() => setTab("following")}
            />
          ) : missing.length === 0 ? (
            <EmptyState
              title="No detecto huecos claros (por ahora)"
              desc="Tu colección está bastante completa o no tenemos suficiente señal. Prueba a seguir una línea para afinar."
              primaryLabel="Seguir una línea"
              primaryAction={() => setTab("following")}
              secondaryLabel="Ir al Marketplace"
              secondaryAction={() => navigate("/marketplace")}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {missing.slice(0, 8).map((it) => (
                <RadarCard
                  key={it.id}
                  it={it}
                  badgeLabel="Missing"
                  badgeGlow
                  metaLeft="Sugerencia SILE"
                  metaRight={`Trending ${it._trending}`}
                  primaryCta="Añadir a wishlist"
                  secondaryCta="Marcar Owned"
                  onPrimary={() => addToWishlist(it)}
                  onSecondary={() => markOwned(it)}
                  onTertiary={() => viewDetails(it)}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (tab === "following") {
      return (
        <div className="space-y-3">
          {/* Chips scroll horizontal */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FOLLOW_TOPICS.map((t) => {
              const on = followed.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleFollow(t.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full border transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50 ${
                    on
                      ? "border-[#9CFF49]/40 bg-[#9CFF49]/10 text-[#9CFF49]"
                      : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontSize: "0.75rem" }}
                >
                  {on ? "Siguiendo · " : ""}{t.label}
                </button>
              );
            })}
          </div>

          {followed.length === 0 ? (
            <EmptyState
              title="Haz tu Radar más personal"
              desc="Sigue líneas y universos para que SILE te muestre novedades y reposiciones alineadas con tus gustos."
              primaryLabel="Seguir una línea"
              primaryAction={() => toggleFollow("shf")}
              secondaryLabel="Ver novedades"
              secondaryAction={() => setTab("news")}
            />
          ) : followingResults.length === 0 ? (
            <EmptyState
              title="No hay resultados para tus seguidos (aún)"
              desc="Prueba a seguir otra línea o cambia a Novedades para explorar lo que está entrando."
              primaryLabel="Ver Novedades"
              primaryAction={() => setTab("news")}
              secondaryLabel="Ir al Marketplace"
              secondaryAction={() => navigate("/marketplace")}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {followingResults.slice(0, 8).map((it) => (
                <RadarCard
                  key={it.id}
                  it={it}
                  badgeLabel={it._isNew ? "Nuevo" : it._isRestock ? "Reposición" : "Update"}
                  badgeGlow={it._isNew}
                  metaLeft={it._isNew ? "Novedad en tu feed" : "Señal en tu feed"}
                  metaRight={`SILE ${it._trending}`}
                  primaryCta="Añadir a wishlist"
                  secondaryCta="Ver detalles"
                  onPrimary={() => addToWishlist(it)}
                  onSecondary={() => viewDetails(it)}
                  onTertiary={() => viewDetails(it)}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (tab === "news") {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground" style={{ fontSize: "0.95rem" }}>Novedades en SILE</p>
              <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                Tendencias y altas señales de coleccionismo
              </p>
            </div>
            <Button variant="ghost" className="text-[#9CFF49]" onClick={() => setTab("missing")}>
              Volver a Te falta <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {news.slice(0, 8).map((it) => (
              <RadarCard
                key={it.id}
                it={it}
                badgeLabel={it._isNew ? "Nuevo" : "Trending"}
                badgeGlow={it._isNew}
                metaLeft={`Añadida por ${it._collectors} coleccionistas`}
                metaRight={`Trending ${it._trending}`}
                primaryCta="Añadir a wishlist"
                secondaryCta="Ver detalles"
                onPrimary={() => addToWishlist(it)}
                onSecondary={() => viewDetails(it)}
                onTertiary={() => viewDetails(it)}
              />
            ))}
          </div>
        </div>
      );
    }

    // market
    return (
      <div className="space-y-3 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground" style={{ fontSize: "0.95rem" }}>Mercado (discreto)</p>
            <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
              Precios y ofertas, sin dominar tu progreso
            </p>
          </div>
          <Badge variant="secondary" className="text-[0.6rem] flex items-center gap-1">
            <Flame className="w-3 h-3" /> Señales de precio
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {market.slice(0, 8).map((it) => (
            <RadarCard
              key={it.id}
              it={it}
              badgeLabel="Oferta"
              metaLeft={`Condición: ${it._condition}`}
              metaRight={it._price ? `${it._price}€` : "—"}
              primaryCta="Ver ofertas"
              secondaryCta="Añadir a wishlist"
              onPrimary={() => navigate("/marketplace")}
              onSecondary={() => addToWishlist(it)}
              onTertiary={() => viewDetails(it)}
            />
          ))}
        </div>

        {/* Sticky CTA bottom-right: sólo en Mercado */}
        <div className="pointer-events-none">
          <div className="fixed md:sticky bottom-5 right-5 md:bottom-0 md:right-0 md:mt-2 md:flex md:justify-end pointer-events-auto">
            <Button
              onClick={() => navigate("/marketplace")}
              className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] gap-2 shadow-[0_0_30px_rgba(156,255,73,0.25)]"
            >
              Ver todo el Marketplace <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* ─── TU RADAR (REEMPLAZA A "DESCUBRE") ─── */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 md:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-foreground" style={{ fontSize: "1rem" }}>Tu Radar</p>
              <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                Progreso, novedades y oportunidades en tu colección
              </p>
            </div>
            <Button onClick={() => navigate("/marketplace")} variant="outline" className="gap-2 shrink-0">
              <Store className="w-4 h-4" />
              Marketplace
            </Button>
          </div>

          {/* Tabs (4): Te falta / Siguiendo / Novedades / Mercado */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setTab("missing")}
              className={`shrink-0 px-3 py-2 rounded-lg border transition-colors ${
                tab === "missing"
                  ? "border-[#9CFF49]/40 bg-[#9CFF49]/10 text-[#9CFF49]"
                  : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              Te falta
            </button>

            <button
              onClick={() => setTab("following")}
              className={`shrink-0 px-3 py-2 rounded-lg border transition-colors ${
                tab === "following"
                  ? "border-[#9CFF49]/40 bg-[#9CFF49]/10 text-[#9CFF49]"
                  : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              Siguiendo
            </button>

            <button
              onClick={() => setTab("news")}
              className={`shrink-0 px-3 py-2 rounded-lg border transition-colors ${
                tab === "news"
                  ? "border-[#9CFF49]/40 bg-[#9CFF49]/10 text-[#9CFF49]"
                  : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              Novedades
            </button>

            <button
              onClick={() => setTab("market")}
              className={`shrink-0 px-3 py-2 rounded-lg border transition-colors ${
                tab === "market"
                  ? "border-[#9CFF49]/40 bg-[#9CFF49]/10 text-[#9CFF49]"
                  : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              Mercado
            </button>
          </div>

          {renderRadar()}
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
          <Button variant="ghost" className="text-muted-foreground" onClick={() => toast.info("Crear categoría (pendiente en MVP)")}>
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
                  <p className="text-foreground line-clamp-1" style={{ fontSize: "0.85rem" }}>{f.name}</p>
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
            <Button variant="outline" onClick={() => setTab("following")} className="gap-2">
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
