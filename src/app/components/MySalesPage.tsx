import { useState } from "react";
import { MOCK_MY_SALES, type MySale } from "../lib/mock-data";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  Eye, MessageCircle, MoreHorizontal, Pencil, Trash2, Send, CheckCircle2,
  FileText, Package, Plus,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function MySalesPage() {
  const [sales] = useState<MySale[]>(MOCK_MY_SALES);
  const navigate = useNavigate();

  const active = sales.filter((s) => s.status === "active");
  const sold = sales.filter((s) => s.status === "sold");
  const drafts = sales.filter((s) => s.status === "draft");

  const statusBadge = (status: string) => {
    if (status === "active") return "bg-[#9CFF49]/15 text-[#9CFF49] border-[#9CFF49]/20";
    if (status === "sold") return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  };

  const statusLabel = (status: string) => {
    if (status === "active") return "Activa";
    if (status === "sold") return "Vendida";
    return "Borrador";
  };

  const SaleCard = ({ sale }: { sale: MySale }) => (
    <Card className="bg-card border-border hover:border-[#9CFF49]/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
            <ImageWithFallback src={sale.image} alt={sale.figureName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-foreground" style={{ fontSize: "0.9rem" }}>{sale.figureName}</p>
                <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                  {sale.brand} &middot; {sale.line} &middot; {sale.condition}
                </p>
              </div>
              <Badge className={`text-[0.6rem] border shrink-0 ${statusBadge(sale.status)}`}>
                {statusLabel(sale.status)}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <p className="text-foreground" style={{ fontSize: "1.1rem" }}>{sale.price}&euro;</p>
              <div className="flex items-center gap-3 text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {sale.views}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {sale.inquiries}</span>
              </div>
            </div>

            {sale.status === "sold" && sale.buyer && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#9CFF49]" />
                <span className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                  Vendido a {sale.buyer} el {new Date(sale.soldAt || "").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
              </div>
            )}

            {sale.status !== "sold" && (
              <div className="flex items-center gap-2 mt-2.5">
                {sale.status === "draft" ? (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]"
                    onClick={() => toast.info("Publicando venta...")}
                    style={{ fontSize: "0.75rem" }}
                  >
                    <Send className="w-3.5 h-3.5" /> Publicar
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => toast.info("Editando...")}
                  style={{ fontSize: "0.75rem" }}
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground hover:text-red-400"
                  onClick={() => toast.info("Eliminando...")}
                  style={{ fontSize: "0.75rem" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-foreground">Mis ventas</h1>
        <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
          Gestiona tus productos en venta
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-3.5">
            <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Activas</p>
            <p className="text-[#9CFF49]" style={{ fontSize: "1.4rem" }}>{active.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3.5">
            <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Vendidas</p>
            <p className="text-foreground" style={{ fontSize: "1.4rem" }}>{sold.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3.5">
            <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Borradores</p>
            <p className="text-foreground" style={{ fontSize: "1.4rem" }}>{drafts.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="active" className="gap-1.5">
            <Package className="w-3.5 h-3.5" /> Activas
            <Badge variant="secondary" className="text-[0.55rem] px-1 py-0 ml-1">{active.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sold" className="gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Vendidas
            <Badge variant="secondary" className="text-[0.55rem] px-1 py-0 ml-1">{sold.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Borradores
            <Badge variant="secondary" className="text-[0.55rem] px-1 py-0 ml-1">{drafts.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length > 0 ? (
            active.map((s) => <SaleCard key={s.id} sale={s} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="w-10 h-10 mb-3 opacity-30" />
              <p>No tienes ventas activas</p>
              <p style={{ fontSize: "0.8rem" }} className="mt-1">Publica una figura desde su ficha de detalle</p>
              <Button variant="outline" className="mt-4 gap-1.5" onClick={() => navigate("/dashboard")}>
                <Plus className="w-4 h-4" /> Ir al Dashboard
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sold" className="space-y-3 mt-4">
          {sold.length > 0 ? (
            sold.map((s) => <SaleCard key={s.id} sale={s} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mb-3 opacity-30" />
              <p>Aun no has vendido nada</p>
              <p style={{ fontSize: "0.8rem" }} className="mt-1">Publica figuras para empezar a vender</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-3 mt-4">
          {drafts.length > 0 ? (
            drafts.map((s) => <SaleCard key={s.id} sale={s} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p>No tienes borradores</p>
              <p style={{ fontSize: "0.8rem" }} className="mt-1">Los borradores se crean al preparar un anuncio sin publicar</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}