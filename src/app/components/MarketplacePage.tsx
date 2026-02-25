import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  MOCK_MARKET_LISTINGS, ALL_SCALES,
  type MarketListing,
} from "../lib/mock-data";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  Search, SlidersHorizontal, MessageCircle, ArrowLeft, X,
  HandCoins, Truck, MapPin, Filter, Check, AlertCircle, Info,
  Heart, Tag, Store, Lock,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { toast } from "sonner";

type ViewMode = "browse" | "listing";

export function MarketplacePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("browse");
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["m3", "m7"]));

  // Search & filters
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterLine, setFilterLine] = useState("all");
  const [filterScale, setFilterScale] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_MARKET_LISTINGS.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !search || l.figureName.toLowerCase().includes(q) || l.brand.toLowerCase().includes(q) || l.character.toLowerCase().includes(q) || l.line.toLowerCase().includes(q);
      const matchBrand = filterBrand === "all" || l.brand === filterBrand;
      const matchLine = filterLine === "all" || l.line === filterLine;
      const matchScale = filterScale === "all" || l.scale === filterScale;
      const matchCond = filterCondition === "all" || l.condition.toLowerCase().includes(filterCondition.toLowerCase());
      const matchMin = !priceMin || l.price >= parseFloat(priceMin);
      const matchMax = !priceMax || l.price <= parseFloat(priceMax);
      return matchSearch && matchBrand && matchLine && matchScale && matchCond && matchMin && matchMax;
    });
  }, [search, filterBrand, filterLine, filterScale, filterCondition, priceMin, priceMax]);

  const favoriteListings = MOCK_MARKET_LISTINGS.filter((l) => favorites.has(l.id));

  const activeFilterCount = [filterBrand, filterLine, filterScale, filterCondition].filter((f) => f !== "all").length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0);

  const brands = [...new Set(MOCK_MARKET_LISTINGS.map((l) => l.brand))];
  const lines = [...new Set(MOCK_MARKET_LISTINGS.map((l) => l.line))];

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Eliminado de favoritos");
      } else {
        next.add(id);
        toast.success("Anadido a favoritos");
      }
      return next;
    });
  };

  const conditionColor = (cond: string) => {
    if (cond.toLowerCase().includes("sellado")) return "bg-[#9CFF49]/15 text-[#9CFF49] border-[#9CFF49]/20";
    if (cond.toLowerCase().includes("completo")) return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  };

  const ListingCard = ({ listing }: { listing: MarketListing }) => (
    <Card
      className="bg-card border-border overflow-hidden group hover:border-[#9CFF49]/20 transition-colors cursor-pointer"
      onClick={() => { setSelectedListing(listing); setView("listing"); }}
    >
      <div className="aspect-[4/3] overflow-hidden bg-secondary/30 relative">
        <ImageWithFallback src={listing.image} alt={listing.figureName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-2 left-2">
          <Badge className={`text-[0.55rem] border ${conditionColor(listing.condition)}`}>
            {listing.condition}
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {listing.shipping && (
            <Badge variant="secondary" className="text-[0.5rem] backdrop-blur-sm bg-black/40 text-white border-0 gap-0.5">
              <Truck className="w-2.5 h-2.5" /> Envio
            </Badge>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(listing.id); }}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <Heart className={`w-3.5 h-3.5 ${favorites.has(listing.id) ? "text-red-400 fill-red-400" : "text-white"}`} />
        </button>
      </div>
      <CardContent className="p-3 space-y-2">
        <div>
          <p className="text-foreground truncate" style={{ fontSize: "0.85rem" }}>{listing.figureName}</p>
          <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>{listing.brand} &middot; {listing.line}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground" style={{ fontSize: "1.1rem" }}>{listing.price}&euro;</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#9CFF49]/15 flex items-center justify-center">
              <span style={{ fontSize: "0.5rem" }} className="text-[#9CFF49]">{listing.seller.slice(0, 2).toUpperCase()}</span>
            </div>
            <span className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>{listing.seller}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "0.65rem" }}>
            <MapPin className="w-3 h-3" /> {listing.location}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // --- Listing detail view ---
  if (view === "listing" && selectedListing) {
    const inc = selectedListing.includes;
    const includeItems = [
      { label: "Figura", ok: inc?.figure },
      { label: "Caja", ok: inc?.box },
      { label: "Accesorios", ok: inc?.accessories },
      { label: "Base", ok: inc?.base },
      { label: "Manual", ok: inc?.manual },
    ];

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5">
        <Button variant="ghost" size="sm" onClick={() => setView("browse")} className="text-muted-foreground gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30">
              <ImageWithFallback src={selectedListing.image} alt={selectedListing.figureName} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-[0.65rem] border ${conditionColor(selectedListing.condition)}`}>
                  {selectedListing.condition}
                </Badge>
                {selectedListing.shipping && (
                  <Badge variant="secondary" className="text-[0.6rem] gap-1">
                    <Truck className="w-3 h-3" /> Envio disponible
                  </Badge>
                )}
              </div>
              <h1 className="text-foreground">{selectedListing.figureName}</h1>
              <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
                {selectedListing.brand} &middot; {selectedListing.line} &middot; {selectedListing.year}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-foreground" style={{ fontSize: "1.75rem" }}>{selectedListing.price}&euro;</p>
              <button onClick={() => toggleFavorite(selectedListing.id)}>
                <Heart className={`w-5 h-5 ${favorites.has(selectedListing.id) ? "text-red-400 fill-red-400" : "text-muted-foreground"}`} />
              </button>
            </div>

            {/* Estado section */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <p className="text-foreground" style={{ fontSize: "0.85rem" }}>Estado</p>
                <div className="space-y-2" style={{ fontSize: "0.8rem" }}>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado figura</span>
                    <span className="text-foreground">{selectedListing.figureStatus || "No especificado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado caja</span>
                    <span className="text-foreground">{selectedListing.boxStatus || "No especificado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Defectos</span>
                    <span className="text-foreground">{selectedListing.defects || "Ninguno"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incluye section */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <p className="text-foreground" style={{ fontSize: "0.85rem" }}>Incluye</p>
                <div className="grid grid-cols-2 gap-2">
                  {includeItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-2" style={{ fontSize: "0.8rem" }}>
                      {item.ok ? (
                        <Check className="w-4 h-4 text-[#9CFF49]" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40" />
                      )}
                      <span className={item.ok ? "text-foreground" : "text-muted-foreground/50"}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price context */}
            {selectedListing.priceRange && (
              <Card className="bg-card border-border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <p className="text-foreground" style={{ fontSize: "0.85rem" }}>Contexto de precio</p>
                  </div>
                  <p className="text-foreground" style={{ fontSize: "0.9rem" }}>
                    Rango estimado: <span className="text-[#9CFF49]">{selectedListing.priceRange.min}&euro; — {selectedListing.priceRange.max}&euro;</span>
                  </p>
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                      Basado en ventas recientes. No es una tasacion oficial.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seller info */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <p className="text-foreground" style={{ fontSize: "0.85rem" }}>Vendedor</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#9CFF49]/15 flex items-center justify-center">
                    <span className="text-[#9CFF49]" style={{ fontSize: "0.7rem" }}>{selectedListing.seller.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-foreground" style={{ fontSize: "0.85rem" }}>{selectedListing.seller}</p>
                    <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                      <MapPin className="w-3 h-3" /> {selectedListing.location}
                    </div>
                  </div>
                </div>
                {selectedListing.shippingPolicy && (
                  <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                    <Truck className="w-3.5 h-3.5" /> {selectedListing.shippingPolicy}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2.5">
              <Button className="flex-1 gap-2 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]" onClick={() => navigate("/messages")}>
                <MessageCircle className="w-4 h-4" /> Contactar
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate("/messages")}>
                <HandCoins className="w-4 h-4" /> Hacer oferta
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Browse view with tabs ---
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-foreground">Marketplace</h1>
        <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
          {MOCK_MARKET_LISTINGS.length} figuras disponibles de {brands.length} marcas
        </p>
      </div>

      <Tabs defaultValue="explore">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="explore" className="gap-1.5">
            <Store className="w-3.5 h-3.5" /> Explorar
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5" onClick={() => navigate("/my-sales")}>
            <Tag className="w-3.5 h-3.5" /> Mis ventas
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1.5">
            <Heart className="w-3.5 h-3.5" /> Favoritos
            {favorites.size > 0 && (
              <Badge variant="secondary" className="text-[0.55rem] px-1 py-0 ml-1">{favorites.size}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="mt-4 space-y-4">
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, personaje, marca o linea..."
                className="pl-9 bg-secondary/50" />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filtros
              {activeFilterCount > 0 && <Badge className="ml-1 w-5 h-5 flex items-center justify-center p-0 text-[0.55rem] bg-[#9CFF49] text-[#0a0a0a]">{activeFilterCount}</Badge>}
            </Button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <TooltipProvider delayDuration={200}>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-foreground" style={{ fontSize: "0.85rem" }}>Filtros</p>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        setFilterBrand("all"); setFilterLine("all"); setFilterScale("all");
                        setFilterCondition("all"); setPriceMin(""); setPriceMax("");
                      }} className="text-muted-foreground gap-1" style={{ fontSize: "0.7rem" }}>
                        <X className="w-3 h-3" /> Limpiar filtros
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    <Select value={filterBrand} onValueChange={setFilterBrand}>
                      <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Marca" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las marcas</SelectItem>
                        {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Precio min €" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="bg-secondary/50" />
                    <Input type="number" placeholder="Precio max €" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="bg-secondary/50" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="h-9 w-full rounded-md border border-border bg-secondary/50 px-3 opacity-50 cursor-not-allowed flex items-center gap-1.5 text-muted-foreground"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <Lock className="w-3 h-3" /> Mas filtros
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p style={{ fontSize: "0.75rem" }}>Proximamente: linea, escala, estado y mas</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </TooltipProvider>
          )}

          {/* Listings Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Filter className="w-10 h-10 mb-3 opacity-30" />
              <p>No se encontraron resultados</p>
              <p style={{ fontSize: "0.8rem" }}>Ajusta los filtros o prueba otra busqueda</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-4">
          {favoriteListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {favoriteListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Heart className="w-10 h-10 mb-3 opacity-30" />
              <p>No tienes favoritos</p>
              <p style={{ fontSize: "0.8rem" }}>Marca figuras como favoritas para verlas aqui</p>
              <Button variant="outline" className="mt-4 gap-1.5" onClick={() => {
                const el = document.querySelector('[data-value="explore"]') as HTMLElement;
                el?.click();
              }}>
                <Search className="w-4 h-4" /> Explorar figuras
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}