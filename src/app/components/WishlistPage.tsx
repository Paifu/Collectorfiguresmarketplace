import { useState } from "react";
import { MOCK_WISHLIST, type WishlistItem } from "../lib/mock-data";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import {
  TrendingUp, TrendingDown, Minus, Bell, BellOff, Search, Eye, AlertCircle, Heart, Plus,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(MOCK_WISHLIST);
  const [search, setSearch] = useState("");
  const [alertModal, setAlertModal] = useState<WishlistItem | null>(null);
  const [alertValue, setAlertValue] = useState("");
  const navigate = useNavigate();

  const filtered = items.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || i.character.toLowerCase().includes(q);
  });

  const toggleTracking = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, trackingActive: !i.trackingActive } : i))
    );
    const item = items.find((i) => i.id === id);
    if (item?.trackingActive) {
      toast.info("Seguimiento desactivado");
    } else {
      toast.success("Seguimiento de precio activado");
    }
  };

  const saveAlert = () => {
    if (!alertModal || !alertValue) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === alertModal.id
          ? { ...i, alertThreshold: parseFloat(alertValue), trackingActive: true }
          : i
      )
    );
    toast.success(`Alerta configurada: notificar cuando baje de ${alertValue}\u20AC`);
    setAlertModal(null);
    setAlertValue("");
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-red-400" />;
    if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-[#9CFF49]" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const trendColor = (trend: string) => {
    if (trend === "up") return "text-red-400";
    if (trend === "down") return "text-[#9CFF49]";
    return "text-muted-foreground";
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-foreground">Wishlist</h1>
        <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
          Seguimiento inteligente de figuras que buscas
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en wishlist..."
          className="pl-9 bg-secondary/50"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-3.5">
            <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>En seguimiento</p>
            <p className="text-foreground" style={{ fontSize: "1.4rem" }}>{items.filter((i) => i.trackingActive).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3.5">
            <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Bajadas activas</p>
            <p className="text-[#9CFF49]" style={{ fontSize: "1.4rem" }}>{items.filter((i) => i.trend === "down").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3.5">
            <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Mejor oportunidad</p>
            <p className="text-foreground" style={{ fontSize: "1.4rem" }}>
              {items.reduce((best, i) => (i.trendPercent > best.trendPercent && i.trend === "down" ? i : best), items[0])?.name.split(" ")[0] || "-"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3.5">
            <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Total items</p>
            <p className="text-foreground" style={{ fontSize: "1.4rem" }}>{items.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <Card key={item.id} className="bg-card border-border hover:border-[#9CFF49]/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
                  <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-foreground" style={{ fontSize: "0.9rem" }}>{item.name}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                        {item.brand} &middot; {item.line}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <TrendIcon trend={item.trend} />
                      <span className={trendColor(item.trend)} style={{ fontSize: "0.8rem" }}>
                        {item.trend === "up" ? "+" : item.trend === "down" ? "-" : ""}{item.trendPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Price info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mt-2">
                    <div>
                      <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Precio medio</p>
                      <p className="text-foreground" style={{ fontSize: "0.85rem" }}>{item.avgPrice}&euro;</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Rango</p>
                      <p className="text-foreground" style={{ fontSize: "0.85rem" }}>{item.priceRange.min}&euro; — {item.priceRange.max}&euro;</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Mejor precio</p>
                      <p className="text-[#9CFF49]" style={{ fontSize: "0.85rem" }}>{item.bestPrice}&euro;</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Fuente</p>
                      <p className="text-foreground" style={{ fontSize: "0.85rem" }}>{item.bestSource}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      variant={item.trackingActive ? "default" : "outline"}
                      className={`gap-1.5 ${item.trackingActive ? "bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]" : ""}`}
                      onClick={() => toggleTracking(item.id)}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {item.trackingActive ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                      {item.trackingActive ? "Siguiendo" : "Seguir precio"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => { setAlertModal(item); setAlertValue(String(item.alertThreshold || Math.round(item.avgPrice * 0.85))); }}
                      style={{ fontSize: "0.75rem" }}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Alerta
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                      <Eye className="w-3.5 h-3.5" />
                      Ver ofertas
                    </Button>
                    {item.alertThreshold && (
                      <Badge variant="secondary" className="text-[0.6rem] ml-auto">
                        Alerta: &lt;{item.alertThreshold}&euro;
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Heart className="w-10 h-10 mb-3 opacity-30" />
            <p>No se encontraron resultados</p>
            <p style={{ fontSize: "0.8rem" }} className="mt-1">
              {search ? "Ajusta tu busqueda" : "Anade figuras a tu wishlist desde el Marketplace"}
            </p>
            {!search && (
              <Button variant="outline" className="mt-4 gap-1.5" onClick={() => navigate("/marketplace")}>
                <Plus className="w-4 h-4" /> Explorar Marketplace
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Alert Config Modal */}
      <Dialog open={!!alertModal} onOpenChange={() => setAlertModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Configurar alerta de precio
            </DialogTitle>
          </DialogHeader>
          {alertModal && (
            <div className="space-y-4">
              <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
                  <ImageWithFallback src={alertModal.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-foreground" style={{ fontSize: "0.85rem" }}>{alertModal.name}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                    Precio actual: {alertModal.avgPrice}&euro; | Mejor: {alertModal.bestPrice}&euro;
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label style={{ fontSize: "0.8rem" }}>Notificar cuando baje de (&euro;)</Label>
                <Input
                  type="number"
                  value={alertValue}
                  onChange={(e) => setAlertValue(e.target.value)}
                  placeholder="0.00"
                  className="bg-secondary/50"
                />
                <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                  Recibiras una notificacion cuando el precio baje de este umbral en cualquier plataforma.
                </p>
              </div>

              <Button onClick={saveAlert} className="w-full bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]" disabled={!alertValue}>
                Guardar alerta
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}