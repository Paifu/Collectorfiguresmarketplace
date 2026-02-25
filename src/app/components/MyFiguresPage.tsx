import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useCollection } from "../lib/collection-store";
import { ALL_BRANDS, CONDITION_LABELS } from "../lib/mock-data";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  ArrowLeft, Search, SlidersHorizontal, X, Package, ArrowUpDown,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type SortKey = "addedAt" | "purchasePrice" | "currentValue" | "name";

export function MyFiguresPage() {
  const navigate = useNavigate();
  const { figures, categories } = useCollection();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [filterForSale, setFilterForSale] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("addedAt");
  const [showFilters, setShowFilters] = useState(false);

  const filteredFigures = useMemo(() => {
    let result = figures.filter((f) => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.character.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategory !== "all" && f.category !== filterCategory) return false;
      if (filterBrand !== "all" && f.brand !== filterBrand) return false;
      if (filterCondition !== "all" && f.condition !== filterCondition) return false;
      if (filterForSale === "sale" && !f.forSale) return false;
      if (filterForSale === "not_sale" && f.forSale) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "addedAt": return b.addedAt.localeCompare(a.addedAt);
        case "purchasePrice": return b.purchasePrice - a.purchasePrice;
        case "currentValue": return b.currentValue - a.currentValue;
        case "name": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [figures, search, filterCategory, filterBrand, filterCondition, filterForSale, sortBy]);

  const hasFilters = filterCategory !== "all" || filterBrand !== "all" || filterCondition !== "all" || filterForSale !== "all";
  const clearFilters = () => {
    setFilterCategory("all");
    setFilterBrand("all");
    setFilterCondition("all");
    setFilterForSale("all");
  };

  const totalValue = filteredFigures.reduce((s, f) => s + f.currentValue, 0);

  // Get unique brands from current figures
  const activeBrands = [...new Set(figures.map((f) => f.brand))].sort();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-foreground">Mis Figuras</h1>
            <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>
              {filteredFigures.length} de {figures.length} figuras &middot; Valor {totalValue.toLocaleString("es-ES")}&euro;
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/add")}
          className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] active:bg-[#7dd635] gap-1.5"
          size="sm"
        >
          <Package className="w-4 h-4" /> Anadir figura
        </Button>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o personaje..."
            className="pl-9 bg-secondary/50"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-[180px] bg-secondary/50">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="addedAt">Fecha anadida</SelectItem>
            <SelectItem value="purchasePrice">Precio compra</SelectItem>
            <SelectItem value="currentValue">Valor estimado</SelectItem>
            <SelectItem value="name">Nombre A-Z</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`gap-1.5 ${showFilters ? "border-[#9CFF49]/40 text-[#9CFF49]" : ""}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-[#9CFF49]" />
          )}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Categoria</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="bg-secondary/50 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Marca</label>
                <Select value={filterBrand} onValueChange={setFilterBrand}>
                  <SelectTrigger className="bg-secondary/50 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {activeBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Estado</label>
                <Select value={filterCondition} onValueChange={setFilterCondition}>
                  <SelectTrigger className="bg-secondary/50 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(CONDITION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Venta</label>
                <Select value={filterForSale} onValueChange={setFilterForSale}>
                  <SelectTrigger className="bg-secondary/50 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="sale">En venta</SelectItem>
                    <SelectItem value="not_sale">No en venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasFilters && (
              <div className="flex justify-end mt-3">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground gap-1" style={{ fontSize: "0.75rem" }}>
                  <X className="w-3.5 h-3.5" /> Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      {filteredFigures.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredFigures.map((fig) => (
            <Card
              key={fig.id}
              className="bg-card border-border overflow-hidden cursor-pointer hover:border-[#9CFF49]/15 transition-colors group"
              onClick={() => navigate(`/figure/${fig.id}`)}
            >
              <div className="aspect-square overflow-hidden bg-secondary/30 relative">
                <ImageWithFallback
                  src={fig.image}
                  alt={fig.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {fig.forSale && (
                  <Badge className="absolute top-2 right-2 bg-[#9CFF49] text-[#0a0a0a] text-[0.55rem] px-1.5 py-0">
                    En venta
                  </Badge>
                )}
              </div>
              <CardContent className="p-2.5">
                <p className="text-foreground truncate" style={{ fontSize: "0.8rem" }}>{fig.name}</p>
                <p className="text-muted-foreground truncate" style={{ fontSize: "0.65rem" }}>
                  {fig.brand} &middot; {fig.line}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <Badge variant="secondary" className="text-[0.55rem] px-1.5 py-0">
                    {CONDITION_LABELS[fig.condition] || fig.condition}
                  </Badge>
                  <span className="text-[#9CFF49]" style={{ fontSize: "0.8rem" }}>{fig.currentValue}&euro;</span>
                </div>
                {fig.purchasePrice > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-muted-foreground" style={{ fontSize: "0.6rem" }}>Compra: {fig.purchasePrice}&euro;</span>
                    {fig.currentValue > fig.purchasePrice ? (
                      <span className="text-emerald-400" style={{ fontSize: "0.6rem" }}>
                        +{Math.round(((fig.currentValue - fig.purchasePrice) / fig.purchasePrice) * 100)}%
                      </span>
                    ) : fig.currentValue < fig.purchasePrice ? (
                      <span className="text-red-400" style={{ fontSize: "0.6rem" }}>
                        {Math.round(((fig.currentValue - fig.purchasePrice) / fig.purchasePrice) * 100)}%
                      </span>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-foreground" style={{ fontSize: "0.95rem" }}>
              {search || hasFilters ? "No se encontraron figuras" : "Tu coleccion esta vacia"}
            </p>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "0.8rem" }}>
              {search || hasFilters
                ? "Prueba con otros filtros o terminos de busqueda"
                : "Anade tu primera figura para empezar a gestionar tu coleccion"}
            </p>
            {search || hasFilters ? (
              <Button variant="outline" className="mt-4 gap-1.5" onClick={clearFilters}>
                <X className="w-4 h-4" /> Limpiar filtros
              </Button>
            ) : (
              <Button
                className="mt-4 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] gap-1.5"
                onClick={() => navigate("/add")}
              >
                <Package className="w-4 h-4" /> Anadir primera figura
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
