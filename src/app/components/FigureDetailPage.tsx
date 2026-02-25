import { useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { CONDITION_LABELS, getExternalPrices, calculateSuggestedPrice, generateAdText } from "../lib/mock-data";
import { useCollection } from "../lib/collection-store";
import { PriceChart } from "./PriceChart";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import {
  ArrowLeft, TrendingUp, TrendingDown, AlertCircle, Star, Pencil, Trash2,
  GripVertical, ImagePlus, Check, Sparkles, Package,
} from "lucide-react";

export function FigureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { figures, removeFigure } = useCollection();
  const figure = figures.find((f) => f.id === id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [images, setImages] = useState<string[]>(figure?.images || []);
  const [primaryIdx, setPrimaryIdx] = useState(0);

  // Sell toggle
  const [sellEnabled, setSellEnabled] = useState(figure?.forSale || false);
  const [sellCondition, setSellCondition] = useState(figure?.condition || "complete");
  const [sellPrice, setSellPrice] = useState("");
  const [sellDescription, setSellDescription] = useState("");
  const [selectedSellImages, setSelectedSellImages] = useState<number[]>([0]);

  const externalPrices = useMemo(() => {
    if (!figure) return [];
    return getExternalPrices(figure.name);
  }, [figure]);

  const priceDiff = figure ? figure.currentValue - figure.purchasePrice : 0;
  const pricePercent = figure && figure.purchasePrice > 0
    ? ((priceDiff / figure.purchasePrice) * 100).toFixed(1)
    : "0";

  const suggestedPrice = useMemo(() => {
    if (!figure) return 0;
    return calculateSuggestedPrice(figure.name, sellCondition);
  }, [figure, sellCondition]);

  const handleGenerateAd = () => {
    if (!figure) return;
    const text = generateAdText({ ...figure, condition: sellCondition as any });
    setSellDescription(text);
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setImages((prev) => [...prev, url]);
    });
    toast.success(`${files.length} imagen(es) anadida(s)`);
    e.target.value = "";
  };

  const handleRemoveImage = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
    if (primaryIdx === idx) setPrimaryIdx(0);
    else if (primaryIdx > idx) setPrimaryIdx(primaryIdx - 1);
    if (selectedImageIdx >= newImages.length) setSelectedImageIdx(Math.max(0, newImages.length - 1));
  };

  const handleSetPrimary = (idx: number) => {
    setPrimaryIdx(idx);
    toast.success("Imagen principal actualizada");
  };

  const toggleSellImage = (idx: number) => {
    setSelectedSellImages((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handlePublish = () => {
    if (!figure) return;
    toast.success("Anuncio publicado. Visible en Mis ventas > Activas");
    setSellEnabled(false);
  };

  const handleDelete = () => {
    if (!figure) return;
    removeFigure(figure.id);
    toast.success("Figura eliminada de tu coleccion");
    navigate("/my-figures");
  };

  if (!figure) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>Figura no encontrada</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/dashboard")}>Volver al Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

      {/* Header with Edit/Delete */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-foreground truncate">{figure.name}</h1>
          <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>
            {figure.brand} &middot; {figure.line} &middot; {figure.year}
          </p>
        </div>
        <Badge variant="secondary" className="text-[0.65rem] shrink-0">
          {CONDITION_LABELS[figure.condition]}
        </Badge>
        <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground shrink-0" onClick={() => toast.info("Editor de figura (proximamente)")}>
          <Pencil className="w-3.5 h-3.5" /> Editar
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground hover:text-red-400 shrink-0" onClick={handleDelete}>
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </Button>
      </div>

      {/* Image Gallery + Financial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30 border border-border">
            <ImageWithFallback src={images[selectedImageIdx] || figure.image} alt={figure.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedImageIdx(idx)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50 ${
                  selectedImageIdx === idx ? "border-[#9CFF49]" : "border-border hover:border-[#9CFF49]/40"
                }`}>
                <ImageWithFallback src={img} alt={`${figure.name} ${idx + 1}`} className="w-full h-full object-cover" />
                {primaryIdx === idx && (
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#9CFF49] flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-[#0a0a0a]" />
                  </div>
                )}
              </button>
            ))}
            <button onClick={handleAddImage}
              className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-[#9CFF49]/40 flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50">
              <ImagePlus className="w-5 h-5" />
            </button>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((_, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 border border-border">
                  <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
                  <span className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Foto {idx + 1}</span>
                  {primaryIdx !== idx ? (
                    <button onClick={() => handleSetPrimary(idx)} className="text-muted-foreground hover:text-[#9CFF49] transition-colors" title="Marcar como principal">
                      <Star className="w-3 h-3" />
                    </button>
                  ) : (
                    <Star className="w-3 h-3 text-[#9CFF49] fill-[#9CFF49]" />
                  )}
                  {images.length > 1 && (
                    <button onClick={() => handleRemoveImage(idx)} className="text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Financial + Market + Details */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-muted-foreground mb-3" style={{ fontSize: "0.7rem" }}>BLOQUE FINANCIERO</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Precio compra</p>
                  <p className="text-foreground" style={{ fontSize: "1.2rem" }}>{figure.purchasePrice}&euro;</p>
                </div>
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Valor estimado</p>
                  <p className="text-foreground" style={{ fontSize: "1.2rem" }}>{figure.currentValue}&euro;</p>
                </div>
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Diferencia</p>
                  <p className={priceDiff >= 0 ? "text-[#9CFF49]" : "text-red-400"} style={{ fontSize: "1.2rem" }}>
                    {priceDiff >= 0 ? "+" : ""}{priceDiff}&euro;
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>Variacion</p>
                  <div className="flex items-center gap-1">
                    {priceDiff >= 0 ? <TrendingUp className="w-4 h-4 text-[#9CFF49]" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                    <p className={priceDiff >= 0 ? "text-[#9CFF49]" : "text-red-400"} style={{ fontSize: "1.2rem" }}>
                      {priceDiff >= 0 ? "+" : ""}{pricePercent}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-3">
              <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>CONTEXTO DE MERCADO</p>
              <div className="grid grid-cols-2 gap-2">
                {externalPrices.map((ep) => (
                  <div key={ep.source} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
                    <div>
                      <p className="text-foreground" style={{ fontSize: "0.8rem" }}>{ep.source}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "0.6rem" }}>{ep.condition}</p>
                    </div>
                    <p className="text-foreground" style={{ fontSize: "0.9rem" }}>{ep.price}&euro;</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-1.5 pt-1">
                <AlertCircle className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                  Estimacion basada en datos publicos. No es una tasacion oficial.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-muted-foreground mb-3" style={{ fontSize: "0.7rem" }}>DETALLES</p>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-3" style={{ fontSize: "0.8rem" }}>
                <div><span className="text-muted-foreground">Personaje:</span> <span className="text-foreground ml-1">{figure.character}</span></div>
                <div><span className="text-muted-foreground">Marca:</span> <span className="text-foreground ml-1">{figure.brand}</span></div>
                <div><span className="text-muted-foreground">Linea:</span> <span className="text-foreground ml-1">{figure.line}</span></div>
                <div><span className="text-muted-foreground">Ano:</span> <span className="text-foreground ml-1">{figure.year}</span></div>
                <div><span className="text-muted-foreground">Escala:</span> <span className="text-foreground ml-1">{figure.scale}</span></div>
                <div><span className="text-muted-foreground">Material:</span> <span className="text-foreground ml-1">{figure.material}</span></div>
                <div><span className="text-muted-foreground">Ubicacion:</span> <span className="text-foreground ml-1">{figure.location || "Sin asignar"}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Accesorios:</span> <span className="text-foreground ml-1">{figure.accessories}</span></div>
              </div>
              <p className="text-muted-foreground mt-3" style={{ fontSize: "0.8rem" }}>{figure.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Price Chart — collapsible */}
      <Accordion type="single" collapsible>
        <AccordionItem value="chart" className="border-0">
          <Card className="bg-card border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="text-foreground" style={{ fontSize: "0.85rem" }}>Evolucion de Precio (12 meses)</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <PriceChart data={figure.priceHistory} height={200} />
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      {/* Sell Toggle */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground" style={{ fontSize: "0.9rem" }}>Vender esta figura</p>
              <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Activa para crear un anuncio de venta</p>
            </div>
            <Switch
              checked={sellEnabled}
              onCheckedChange={(checked) => {
                setSellEnabled(checked);
                if (checked && !sellPrice) setSellPrice(String(suggestedPrice));
                if (checked && !sellDescription) handleGenerateAd();
              }}
            />
          </div>

          {sellEnabled && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label style={{ fontSize: "0.75rem" }} className="text-muted-foreground mb-1.5 block">Precio venta</Label>
                  <Input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} placeholder={`${suggestedPrice}`} className="bg-secondary/50" />
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "0.6rem" }}>Sugerido: {suggestedPrice}&euro;</p>
                </div>
                <div>
                  <Label style={{ fontSize: "0.75rem" }} className="text-muted-foreground mb-1.5 block">Estado</Label>
                  <Select value={sellCondition} onValueChange={setSellCondition}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONDITION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label style={{ fontSize: "0.75rem" }} className="text-muted-foreground mb-1.5 block">Categoria</Label>
                  <div className="h-9 px-3 flex items-center rounded-md bg-secondary/50 border border-border">
                    <span className="text-foreground" style={{ fontSize: "0.85rem" }}>{figure.category}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label style={{ fontSize: "0.75rem" }} className="text-muted-foreground">Descripcion del anuncio</Label>
                  <Button variant="ghost" size="sm" onClick={handleGenerateAd}
                    className="text-[#9CFF49] hover:text-[#9CFF49] gap-1" style={{ fontSize: "0.7rem" }}>
                    <Sparkles className="w-3 h-3" /> Generar con IA
                  </Button>
                </div>
                <Textarea value={sellDescription} onChange={(e) => setSellDescription(e.target.value)}
                  placeholder="Describe tu figura para los compradores..."
                  className="bg-secondary/50 min-h-[120px]" style={{ fontSize: "0.85rem" }} />
              </div>

              {images.length > 0 && (
                <div>
                  <Label style={{ fontSize: "0.75rem" }} className="text-muted-foreground mb-1.5 block">Fotos del anuncio</Label>
                  <div className="flex gap-2 flex-wrap">
                    {images.map((img, idx) => (
                      <button key={idx} onClick={() => toggleSellImage(idx)}
                        className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50 ${
                          selectedSellImages.includes(idx) ? "border-[#9CFF49]" : "border-border"
                        }`}>
                        <ImageWithFallback src={img} alt={`Sell ${idx + 1}`} className="w-full h-full object-cover" />
                        {selectedSellImages.includes(idx) && (
                          <div className="absolute inset-0 bg-[#9CFF49]/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-[#9CFF49]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handlePublish}
                className="w-full bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] active:bg-[#7dd635] disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!sellPrice}>
                Publicar anuncio
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
