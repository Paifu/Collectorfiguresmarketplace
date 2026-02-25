import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { MOCK_REVIEW_ITEMS, CONDITION_LABELS } from "../lib/mock-data";
import { useCollection } from "../lib/collection-store";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Package, AlertTriangle, TrendingUp, ChevronRight, Pencil, X, Plus, EyeOff, Sparkles, MapPin, Copy, FileText, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

type ResolveType = null | "missing_location" | "incomplete_data" | "duplicate" | "variant";

export function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { figures, categories, getCategoryStats, addCategory: addCategoryToStore } = useCollection();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");
  const [ignoredReviews, setIgnoredReviews] = useState<string[]>([]);

  // Resolve flow state
  const [resolveType, setResolveType] = useState<ResolveType>(null);
  const [resolveItemId, setResolveItemId] = useState<string | null>(null);
  const [resolveLocation, setResolveLocation] = useState("");

  const totalFigures = figures.length;
  const totalValue = figures.reduce((sum, f) => sum + f.currentValue, 0);
  const pendingReview = MOCK_REVIEW_ITEMS.filter((r) => !ignoredReviews.includes(r.id)).length;

  const figuresWithFullData = figures.filter((f) => f.location && f.upc && f.description).length;
  const completeness = totalFigures > 0 ? Math.round((figuresWithFullData / totalFigures) * 100) : 0;

  const categoryStats = getCategoryStats();

  useEffect(() => {
    if ((location.state as any)?.scrollToCategories) {
      const el = document.getElementById("categories-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.state]);

  const addCategory = () => {
    if (!newCatInput.trim()) return;
    addCategoryToStore(newCatInput.trim());
    setNewCatInput("");
    setShowNewCat(false);
  };

  const stats = [
    { label: "Figuras", value: totalFigures, icon: Package, color: "bg-[#9CFF49]/10 text-[#9CFF49]" },
    { label: "Valor estimado", value: `${totalValue.toLocaleString("es-ES")}\u20AC`, icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-400" },
    { label: "Requieren accion", value: pendingReview, icon: AlertTriangle, color: "bg-amber-500/10 text-amber-400" },
  ];

  const issueTypeIcon = (type: string) => {
    switch (type) {
      case "variant": return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case "missing_location": return <MapPin className="w-3.5 h-3.5 text-purple-400" />;
      case "duplicate": return <Copy className="w-3.5 h-3.5 text-blue-400" />;
      case "incomplete_data": return <FileText className="w-3.5 h-3.5 text-orange-400" />;
      default: return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const activeReviewItems = MOCK_REVIEW_ITEMS.filter((r) => !ignoredReviews.includes(r.id));
  const criticalItems = activeReviewItems.filter((r) => r.severity === "critical");
  const improvementItems = activeReviewItems.filter((r) => r.severity === "improvement");

  const openResolve = (itemId: string, type: string) => {
    setResolveItemId(itemId);
    setResolveType(type as ResolveType);
    setResolveLocation("");
  };

  const handleResolve = () => {
    setIgnoredReviews((prev) => [...prev, resolveItemId!]);
    setResolveType(null);
    setResolveItemId(null);
    toast.success("Problema resuelto correctamente");
  };

  const resolveItem = MOCK_REVIEW_ITEMS.find((r) => r.id === resolveItemId);

  // Recently added: sorted by date descending
  const recentFigures = [...figures].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 5);

  const renderReviewCard = (item: typeof MOCK_REVIEW_ITEMS[0], isCritical: boolean) => (
    <Card key={item.id} className={`bg-card border-border border-l-2 ${isCritical ? "border-l-red-400/60 hover:border-l-red-400" : "border-l-blue-400/50 hover:border-l-blue-400"} transition-colors`}>
      <CardContent className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
            <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground truncate" style={{ fontSize: "0.85rem" }}>{item.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {issueTypeIcon(item.issueType)}
              <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>{item.issue}</p>
            </div>
            <p className="text-muted-foreground/70 mt-0.5" style={{ fontSize: "0.65rem" }}>{item.impact}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2.5 justify-end">
          <button
            className="px-2 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50"
            style={{ fontSize: "0.7rem" }}
            onClick={() => { setIgnoredReviews((prev) => [...prev, item.id]); toast.info("Alerta ignorada"); }}
          >
            <EyeOff className="w-3 h-3" /> Ignorar
          </button>
          <Button
            size="sm"
            className={isCritical ? "bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] active:bg-[#7dd635]" : "border-[#9CFF49]/30 text-[#9CFF49] hover:bg-[#9CFF49]/10"}
            variant={isCritical ? "default" : "outline"}
            style={{ fontSize: "0.75rem" }}
            onClick={() => openResolve(item.id, item.issueType)}
          >
            Resolver
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-7">
      {/* ─── Mi Colección: KPIs compactos ─── */}
      <div>
        <h2 className="text-foreground mb-3">Mi Colección</h2>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="bg-card border-border hover:border-[#9CFF49]/15 transition-colors">
              <CardContent className="px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>{s.label}</p>
                    <p className="text-foreground" style={{ fontSize: "1.1rem" }}>{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Añadidos Recientemente (protagonista) ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground">Añadidos Recientemente</h2>
          {recentFigures.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/my-figures")}
              className="text-muted-foreground gap-1 hover:text-[#9CFF49]"
              style={{ fontSize: "0.8rem" }}
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        {recentFigures.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recentFigures.map((fig) => (
              <Card key={fig.id}
                className="bg-card border-border overflow-hidden cursor-pointer hover:border-[#9CFF49]/20 transition-all group"
                onClick={() => navigate(`/figure/${fig.id}`)}>
                <div className="aspect-[4/5] overflow-hidden bg-secondary/30">
                  <ImageWithFallback src={fig.image} alt={fig.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="p-3">
                  <p className="text-foreground truncate" style={{ fontSize: "0.85rem" }}>{fig.name}</p>
                  <p className="text-muted-foreground truncate mt-0.5" style={{ fontSize: "0.7rem" }}>{fig.brand} &middot; {fig.line}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <Badge variant="secondary" className="text-[0.6rem] px-1.5 py-0">
                      {CONDITION_LABELS[fig.condition] || fig.condition}
                    </Badge>
                    <span className="text-[#9CFF49]" style={{ fontSize: "0.85rem" }}>{fig.currentValue}&euro;</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <Package className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-foreground" style={{ fontSize: "0.9rem" }}>Aún no tienes figuras</p>
              <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Añade tu primera figura para empezar</p>
              <Button
                className="mt-3 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] gap-1.5"
                size="sm"
                onClick={() => navigate("/add")}
              >
                <Plus className="w-4 h-4" /> Añadir figura
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Requieren Acción ─── */}
      {activeReviewItems.length > 0 && (
        <div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#9CFF49]" />
              <h2 className="text-foreground">Requieren acción</h2>
              <Badge variant="secondary" className="text-[0.6rem]">{activeReviewItems.length}</Badge>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>
              Completar estos datos mejora la valoración y búsqueda.
            </p>
          </div>

          <Card className="bg-card border-border mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Completitud de colección</p>
                <p className="text-[#9CFF49]" style={{ fontSize: "0.8rem" }}>{completeness}%</p>
              </div>
              <Progress value={completeness} className="h-2 bg-secondary/50 [&>[data-slot=progress-indicator]]:bg-[#9CFF49]" />
            </CardContent>
          </Card>

          {criticalItems.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <p className="text-foreground" style={{ fontSize: "0.75rem" }}>Críticas &mdash; afectan al valor</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {criticalItems.map((item) => renderReviewCard(item, true))}
              </div>
            </div>
          )}

          {improvementItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <p className="text-foreground" style={{ fontSize: "0.75rem" }}>Mejoras &mdash; datos opcionales</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {improvementItems.map((item) => renderReviewCard(item, false))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Categorías (simplificadas) ─── */}
      <div id="categories-section">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground">Categorías</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowNewCat(true)} className="text-muted-foreground gap-1">
            <Plus className="w-4 h-4" /> Nueva
          </Button>
        </div>
        {showNewCat && (
          <div className="flex gap-2 mb-3">
            <Input placeholder="Nombre de categoría..." value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()} className="h-9 max-w-xs" />
            <Button size="sm" className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]" onClick={addCategory}>Crear</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNewCat(false)}><X className="w-4 h-4" /></Button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryStats.map((cat) => (
            <Card key={cat.id} className="bg-card border-border hover:border-[#9CFF49]/15 transition-colors cursor-pointer group"
              onClick={() => navigate(`/category/${cat.id}`)}>
              <CardContent className="px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    {editingCategory === cat.id ? (
                      <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingCategory(null)}
                        onBlur={() => setEditingCategory(null)} className="h-7 w-36" autoFocus
                        onClick={(e) => e.stopPropagation()} />
                    ) : (
                      <span className="text-foreground truncate" style={{ fontSize: "0.9rem" }}>{cat.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-muted-foreground" style={{ fontSize: "0.6rem" }}>Figuras</p>
                      <p className="text-foreground" style={{ fontSize: "0.9rem" }}>{cat.count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground" style={{ fontSize: "0.6rem" }}>Valor</p>
                      <p className="text-foreground" style={{ fontSize: "0.9rem" }}>{cat.totalValue}&euro;</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingCategory(cat.id); setNewCatName(cat.name); }}
                        className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Resolve Dialog ─── */}
      <Dialog open={!!resolveType} onOpenChange={() => setResolveType(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resolveType === "missing_location" && <><MapPin className="w-5 h-5 text-purple-400" /> Asignar ubicacion</>}
              {resolveType === "incomplete_data" && <><FileText className="w-5 h-5 text-orange-400" /> Completar datos</>}
              {resolveType === "duplicate" && <><Copy className="w-5 h-5 text-blue-400" /> Verificar duplicado</>}
              {resolveType === "variant" && <><AlertTriangle className="w-5 h-5 text-amber-400" /> Confirmar variante</>}
            </DialogTitle>
          </DialogHeader>

          {resolveItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <ImageWithFallback src={resolveItem.image} alt={resolveItem.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-foreground" style={{ fontSize: "0.85rem" }}>{resolveItem.name}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>{resolveItem.issue}</p>
                </div>
              </div>

              {resolveType === "missing_location" && (
                <div className="space-y-2">
                  <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>Selecciona donde se encuentra esta figura:</p>
                  <Select value={resolveLocation} onValueChange={setResolveLocation}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Seleccionar ubicacion..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vitrina A">Vitrina A</SelectItem>
                      <SelectItem value="Vitrina B">Vitrina B</SelectItem>
                      <SelectItem value="Vitrina C">Vitrina C</SelectItem>
                      <SelectItem value="Almacen">Almacen</SelectItem>
                      <SelectItem value="Estanteria">Estanteria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {resolveType === "incomplete_data" && (
                <div className="space-y-3">
                  <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>Completa los campos que faltan:</p>
                  <div className="space-y-2">
                    <Input placeholder="UPC / Codigo de barras" className="bg-secondary/50" />
                    <Select value={resolveLocation} onValueChange={setResolveLocation}>
                      <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Ubicacion..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vitrina A">Vitrina A</SelectItem>
                        <SelectItem value="Vitrina B">Vitrina B</SelectItem>
                        <SelectItem value="Vitrina C">Vitrina C</SelectItem>
                        <SelectItem value="Almacen">Almacen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {resolveType === "duplicate" && (
                <div className="space-y-3">
                  <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>Hemos detectado que esta figura podria estar duplicada. Revisa y confirma:</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleResolve}>No es duplicado</Button>
                    <Button className="flex-1 bg-red-500/80 hover:bg-red-500 text-white" onClick={handleResolve}>Marcar como duplicado</Button>
                  </div>
                </div>
              )}

              {resolveType === "variant" && (
                <div className="space-y-3">
                  <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>Confirma la variante correcta de esta figura:</p>
                  <div className="space-y-1.5">
                    {["Ultra Instinct Sign (pelo negro)", "Ultra Instinct Mastered (pelo plateado)"].map((v) => (
                      <button key={v} onClick={() => { setResolveLocation(v); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${resolveLocation === v ? "border-[#9CFF49] bg-[#9CFF49]/10 text-foreground" : "border-border text-muted-foreground hover:bg-accent/50"}`}
                        style={{ fontSize: "0.8rem" }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {resolveType !== "duplicate" && (
                <Button
                  className="w-full bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] active:bg-[#7dd635] disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!resolveLocation && resolveType !== "incomplete_data"}
                  onClick={handleResolve}
                >
                  Guardar cambios
                </Button>
              )}

              <p className="text-muted-foreground/60 text-center" style={{ fontSize: "0.65rem" }}>
                Completar estos datos mejora la valoracion y busqueda.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}