import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { ALL_BRANDS, ALL_LINES, ALL_SCALES, CONDITION_LABELS } from "../lib/mock-data";
import { useCollection } from "../lib/collection-store";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { figures: allFigures, categories } = useCollection();
  const category = categories.find((c) => c.id === id);

  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterLine, setFilterLine] = useState("all");
  const [filterScale, setFilterScale] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const figures = useMemo(() => {
    return allFigures.filter((f) => {
      if (category && f.category !== category.name) return false;
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.character.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterBrand !== "all" && f.brand !== filterBrand) return false;
      if (filterLine !== "all" && f.line !== filterLine) return false;
      if (filterScale !== "all" && f.scale !== filterScale) return false;
      if (filterCondition !== "all" && f.condition !== filterCondition) return false;
      if (priceMin && f.currentValue < parseFloat(priceMin)) return false;
      if (priceMax && f.currentValue > parseFloat(priceMax)) return false;
      return true;
    });
  }, [category, search, filterBrand, filterLine, filterScale, filterCondition, priceMin, priceMax, allFigures]);

  const activeFilterCount = [filterBrand, filterLine, filterScale, filterCondition].filter((f) => f !== "all").length
    + (priceMin ? 1 : 0) + (priceMax ? 1 : 0);

  const clearFilters = () => {
    setFilterBrand("all"); setFilterLine("all"); setFilterScale("all");
    setFilterCondition("all"); setPriceMin(""); setPriceMax("");
  };

  if (!category) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Categoria no encontrada</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/dashboard")}>Volver al Dashboard</Button>
      </div>
    );
  }

  const catValue = figures.reduce((s, f) => s + f.currentValue, 0);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
          <h1 className="text-foreground">{category.name}</h1>
        </div>
      </div>

      {/* Category stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Total figuras</p>
            <p className="text-foreground" style={{ fontSize: "1.4rem" }}>{figures.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Valor categoria</p>
            <p className="text-foreground" style={{ fontSize: "1.4rem" }}>{catValue}&euro;</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + filter toggle */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o personaje..." className="pl-9 bg-secondary/50" />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge className="ml-1 w-5 h-5 flex items-center justify-center p-0 text-[0.55rem]">{activeFilterCount}</Badge>
          )}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-foreground" style={{ fontSize: "0.85rem" }}>Filtros avanzados</p>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground gap-1" style={{ fontSize: "0.75rem" }}>
                  <X className="w-3 h-3" /> Limpiar
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Marca" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las marcas</SelectItem>
                  {ALL_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterLine} onValueChange={setFilterLine}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Linea" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las lineas</SelectItem>
                  {ALL_LINES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterScale} onValueChange={setFilterScale}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Escala" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las escalas</SelectItem>
                  {ALL_SCALES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterCondition} onValueChange={setFilterCondition}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(CONDITION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Precio min" value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)} className="bg-secondary/50" />
              <Input type="number" placeholder="Precio max" value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)} className="bg-secondary/50" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Figures grid */}
      {figures.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {figures.map((fig) => (
            <Card key={fig.id}
              className="bg-card border-border overflow-hidden cursor-pointer hover:border-[#9CFF49]/20 transition-colors group"
              onClick={() => navigate(`/figure/${fig.id}`)}>
              <div className="aspect-square overflow-hidden bg-secondary/30">
                <ImageWithFallback src={fig.image} alt={fig.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <CardContent className="p-3">
                <p className="text-foreground truncate" style={{ fontSize: "0.85rem" }}>{fig.name}</p>
                <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                  {fig.character} &middot; {fig.brand} &middot; {fig.scale}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <Badge variant="secondary" className="text-[0.6rem] px-1.5 py-0">
                    {CONDITION_LABELS[fig.condition]}
                  </Badge>
                  <span className="text-green-500" style={{ fontSize: "0.85rem" }}>{fig.currentValue}&euro;</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No hay figuras que coincidan con los filtros</p>
          <p style={{ fontSize: "0.8rem" }} className="mt-1">Prueba a ajustar los criterios de busqueda</p>
        </div>
      )}
    </div>
  );
}