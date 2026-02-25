import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
import {
  ArrowLeft, Sparkles, ImagePlus, X, Star, Loader2, Camera, AlertCircle, CheckCircle2,
} from "lucide-react";
import {
  ALL_SCALES, CONDITION_LABELS,
  calculateSuggestedPrice, generateAdText, searchAutocomplete,
  type AutocompleteResult,
} from "../lib/mock-data";
import { useCollection } from "../lib/collection-store";
import { toast } from "sonner";
import { simulateImageRecognition } from "../lib/collection-store";

type ConditionKey = "mint_sealed" | "mint_open" | "complete" | "loose" | "incomplete";

export function AddFigurePage() {
  const navigate = useNavigate();
  const { addFigure, categories } = useCollection();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Core fields (visible)
  const [name, setName] = useState("");
  const [character, setCharacter] = useState("");
  const [brand, setBrand] = useState("");
  const [line, setLine] = useState("");
  const [year, setYear] = useState("");
  const [condition, setCondition] = useState<ConditionKey>("mint_sealed");
  const [category, setCategory] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  // Optional fields (collapsed)
  const [description, setDescription] = useState("");
  const [subline, setSubline] = useState("");
  const [scale, setScale] = useState("");
  const [material, setMaterial] = useState("");
  const [articulation, setArticulation] = useState("");
  const [accessories, setAccessories] = useState("");
  const [upc, setUpc] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");

  // Images
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [primaryIdx, setPrimaryIdx] = useState(0);

  // AI Recognition
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<"recognized" | "not_recognized" | null>(null);
  const [aiConfidence, setAiConfidence] = useState(0);

  // Sale
  const [forSale, setForSale] = useState(false);
  const [adText, setAdText] = useState("");

  // Autocomplete
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (val: string) => {
    setName(val);
    if (val) setErrors((e) => ({ ...e, name: "" }));
    const results = searchAutocomplete(val);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  };

  const applyAutocomplete = (r: AutocompleteResult) => {
    setName(r.name);
    setCharacter(r.character);
    setBrand(r.brand);
    setLine(r.line);
    setYear(String(r.year));
    setScale(r.scale);
    setMaterial(r.material);
    setUpc(r.upc);
    setCategory(r.category);
    setShowSuggestions(false);
    setErrors({});
    toast.success("Datos autocompletados");
  };

  const applyAIData = (data: Partial<any>) => {
    if (data.name) setName(data.name);
    if (data.character) setCharacter(data.character);
    if (data.brand) setBrand(data.brand);
    if (data.line) setLine(data.line);
    if (data.year) setYear(String(data.year));
    if (data.scale) setScale(data.scale);
    if (data.material) setMaterial(data.material);
    if (data.category) setCategory(data.category);
    if (data.condition) setCondition(data.condition);
    setErrors({});
  };

  const processImagesForAI = (files: File[]) => {
    // Start AI analysis
    setAnalyzing(true);
    setAiResult(null);

    // Simulate 1.5s delay for AI processing
    setTimeout(() => {
      // Try to recognize based on filename
      let recognized = false;
      for (const file of files) {
        const result = simulateImageRecognition(file.name);
        if (result.recognized && result.data) {
          applyAIData(result.data);
          setAiResult("recognized");
          setAiConfidence(result.confidence);
          recognized = true;
          toast.success(`Figura identificada: ${result.data.name}`, {
            description: `Confianza: ${Math.round(result.confidence * 100)}%`,
          });
          break;
        }
      }

      if (!recognized) {
        setAiResult("not_recognized");
        toast.info("Figura no reconocida automaticamente", {
          description: "Completa los datos manualmente",
        });
      }

      setAnalyzing(false);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newPreviews: string[] = [];
    const newFiles: File[] = [];
    Array.from(files).forEach((file) => {
      newPreviews.push(URL.createObjectURL(file));
      newFiles.push(file);
    });
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImageFiles((prev) => [...prev, ...newFiles]);
    if (errors.images) setErrors((e) => ({ ...e, images: "" }));

    // Trigger AI recognition on first upload
    if (imagePreviews.length === 0) {
      processImagesForAI(newFiles);
    }

    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    if (primaryIdx === idx) setPrimaryIdx(0);
    else if (primaryIdx > idx) setPrimaryIdx(primaryIdx - 1);
  };

  const suggestedPrice = name.length > 2 ? calculateSuggestedPrice(name, condition) : 0;

  const handleGenerateAd = () => {
    setAdText(generateAdText({ name, brand, line, year: parseInt(year), condition, description, scale, material, accessories } as any));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!category) newErrors.category = "Selecciona una categoria";
    if (imagePreviews.length === 0) newErrors.images = "Sube al menos una imagen";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    const price = parseFloat(purchasePrice) || 0;
    const estimatedValue = suggestedPrice > 0 ? suggestedPrice : price > 0 ? Math.round(price * 1.1) : 50;

    addFigure({
      name: name.trim(),
      character: character.trim() || name.trim(),
      description: description.trim(),
      brand: brand.trim() || "Sin marca",
      line: line.trim() || "Sin linea",
      subline: subline.trim() || undefined,
      year: parseInt(year) || new Date().getFullYear(),
      scale: scale || '6"',
      material: material.trim() || "PVC",
      articulation: articulation.trim() || "Estandar",
      accessories: accessories.trim() || "No especificados",
      upc: upc.trim() || undefined,
      purchasePrice: price,
      currentValue: estimatedValue,
      category,
      condition,
      packaging: condition === "mint_sealed" ? "boxed" : condition === "loose" ? "loose" : "window_box",
      forSale,
      suggestedPrice: forSale ? suggestedPrice : undefined,
      image: imagePreviews[primaryIdx] || imagePreviews[0],
      images: imagePreviews,
      addedAt: new Date().toISOString().split("T")[0],
      notes: notes.trim() || undefined,
      location: location.trim() || undefined,
    });

    toast.success("Figura anadida correctamente", {
      description: `"${name}" se ha guardado en tu coleccion`,
    });
    navigate("/my-figures");
  };

  const allCategories = categories;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-5">
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-foreground">Anadir Figura</h1>
          <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>Sube fotos y rellena los datos basicos</p>
        </div>
      </div>

      {/* Images Upload */}
      <Card className={`bg-card ${errors.images ? "border-red-400/60" : "border-border"}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2.5">
            <Label style={{ fontSize: "0.85rem" }}>Fotos * <span className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>(minimo 1, recomendado 3+)</span></Label>
            {analyzing && (
              <div className="flex items-center gap-1.5 text-[#9CFF49]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span style={{ fontSize: "0.75rem" }}>Analizando imagen...</span>
              </div>
            )}
          </div>

          {/* AI Recognition Result Banner */}
          {aiResult === "recognized" && !analyzing && (
            <div className="mb-3 p-3 rounded-lg bg-[#9CFF49]/8 border border-[#9CFF49]/25 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#9CFF49] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#9CFF49]" style={{ fontSize: "0.8rem" }}>Figura reconocida automaticamente</p>
                <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                  Confianza: {Math.round(aiConfidence * 100)}% &mdash; Los campos se han autocompletado. Revisa y ajusta si es necesario.
                </p>
              </div>
            </div>
          )}
          {aiResult === "not_recognized" && !analyzing && (
            <div className="mb-3 p-3 rounded-lg bg-amber-500/8 border border-amber-500/25 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-amber-400" style={{ fontSize: "0.8rem" }}>Figura no reconocida automaticamente</p>
                <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                  Completa los datos manualmente o usa el buscador por nombre para autocompletar.
                </p>
              </div>
            </div>
          )}

          {imagePreviews.length > 0 ? (
            <div className="space-y-3">
              {/* Main preview */}
              <div className="aspect-[16/9] rounded-lg overflow-hidden bg-secondary/30 border border-border relative">
                <img src={imagePreviews[primaryIdx] || imagePreviews[0]} alt="Preview" className="w-full h-full object-cover" />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-[#9CFF49] animate-spin" />
                    <span className="text-white" style={{ fontSize: "0.85rem" }}>Analizando imagen...</span>
                    <span className="text-white/60" style={{ fontSize: "0.7rem" }}>Identificando personaje, marca, linea...</span>
                  </div>
                )}
              </div>

              {/* Thumbnails + add */}
              <div className="flex gap-2 flex-wrap">
                {imagePreviews.map((img, idx) => (
                  <div key={idx} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${primaryIdx === idx ? "border-[#9CFF49]" : "border-border"}`}>
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    {primaryIdx === idx && (
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#9CFF49] flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 text-[#0a0a0a]" />
                      </div>
                    )}
                    <div className="absolute top-0.5 right-0.5 flex gap-0.5">
                      {primaryIdx !== idx && (
                        <button onClick={() => setPrimaryIdx(idx)} className="w-4 h-4 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
                          <Star className="w-2.5 h-2.5 text-white" />
                        </button>
                      )}
                      <button onClick={() => removeImage(idx)} className="w-4 h-4 rounded-full bg-black/50 flex items-center justify-center hover:bg-red-500/70 transition-colors">
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-[#9CFF49]/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <ImagePlus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex-1 aspect-[16/9] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-[#9CFF49]/40 hover:text-foreground transition-colors">
                <ImagePlus className="w-8 h-8" />
                <span style={{ fontSize: "0.8rem" }}>Subir fotos</span>
                <span style={{ fontSize: "0.65rem" }} className="text-muted-foreground/60">JPG, PNG, WebP</span>
              </button>
              <button onClick={() => cameraInputRef.current?.click()}
                className="w-32 aspect-[9/16] md:aspect-auto md:w-40 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-[#9CFF49]/40 hover:text-foreground transition-colors">
                <Camera className="w-6 h-6" />
                <span style={{ fontSize: "0.75rem" }}>Camara</span>
              </button>
            </div>
          )}

          {errors.images && (
            <p className="text-red-400 mt-2 flex items-center gap-1" style={{ fontSize: "0.75rem" }}>
              <AlertCircle className="w-3.5 h-3.5" /> {errors.images}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Core Fields */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-3.5">
          <p className="text-foreground" style={{ fontSize: "0.85rem" }}>Datos basicos</p>

          {/* Name with autocomplete */}
          <div className="space-y-1.5 relative">
            <Label style={{ fontSize: "0.8rem" }}>Nombre *</Label>
            <Input value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Goku Ultra Instinct S.H.Figuarts"
              className={`bg-secondary/50 ${errors.name ? "border-red-400/60" : ""}`} />
            {errors.name && (
              <p className="text-red-400 flex items-center gap-1" style={{ fontSize: "0.7rem" }}>
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => applyAutocomplete(s)}
                    className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border last:border-0">
                    <p className="text-foreground" style={{ fontSize: "0.8rem" }}>{s.name}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>{s.brand} &middot; {s.line} &middot; {s.year}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label style={{ fontSize: "0.8rem" }}>Personaje</Label>
              <Input value={character} onChange={(e) => setCharacter(e.target.value)} placeholder="Ej: Son Goku" className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label style={{ fontSize: "0.8rem" }}>Marca</Label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ej: Bandai" className="bg-secondary/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label style={{ fontSize: "0.8rem" }}>Linea</Label>
              <Input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Ej: S.H.Figuarts" className="bg-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <Label style={{ fontSize: "0.8rem" }}>Ano</Label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} type="number" placeholder="2024" className="bg-secondary/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label style={{ fontSize: "0.8rem" }}>Estado</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as ConditionKey)}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CONDITION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label style={{ fontSize: "0.8rem" }}>Categoria *</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v); if (v) setErrors((e) => ({ ...e, category: "" })); }}>
                <SelectTrigger className={`bg-secondary/50 ${errors.category ? "border-red-400/60" : ""}`}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-400 flex items-center gap-1" style={{ fontSize: "0.7rem" }}>
                  <AlertCircle className="w-3 h-3" /> {errors.category}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label style={{ fontSize: "0.8rem" }}>Precio de compra (&euro;)</Label>
            <Input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} type="number" placeholder="0" className="bg-secondary/50 max-w-[200px]" />
          </div>
        </CardContent>
      </Card>

      {/* Optional Fields (collapsed) */}
      <Accordion type="single" collapsible>
        <AccordionItem value="optional" className="border-0">
          <Card className="bg-card border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>Campos opcionales</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: "0.8rem" }}>Sublinea</Label>
                    <Input value={subline} onChange={(e) => setSubline(e.target.value)} placeholder="Wave / Serie" className="bg-secondary/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: "0.8rem" }}>Escala</Label>
                    <Select value={scale} onValueChange={setScale}>
                      <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Escala" /></SelectTrigger>
                      <SelectContent>{ALL_SCALES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: "0.8rem" }}>UPC / Barcode</Label>
                    <Input value={upc} onChange={(e) => setUpc(e.target.value)} placeholder="4573102..." className="bg-secondary/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: "0.8rem" }}>Material</Label>
                    <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="PVC / ABS" className="bg-secondary/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: "0.8rem" }}>Articulacion</Label>
                    <Input value={articulation} onChange={(e) => setArticulation(e.target.value)} placeholder="Full — 16+ pts" className="bg-secondary/50" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ fontSize: "0.8rem" }}>Accesorios</Label>
                  <Input value={accessories} onChange={(e) => setAccessories(e.target.value)} placeholder="3x manos, espada, base" className="bg-secondary/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: "0.8rem" }}>Ubicacion</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Vitrina A" className="bg-secondary/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label style={{ fontSize: "0.8rem" }}>Notas</Label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Comprado en Japan Weekend" className="bg-secondary/50" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ fontSize: "0.8rem" }}>Descripcion</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles adicionales..." className="bg-secondary/50 min-h-[70px]" />
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      {/* Sale toggle */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <Label style={{ fontSize: "0.85rem" }}>Poner en venta</Label>
              <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Publica en el marketplace de SILE</p>
            </div>
            <Switch checked={forSale} onCheckedChange={setForSale} />
          </div>

          {forSale && (
            <>
              {suggestedPrice > 0 && (
                <div className="p-3 rounded-lg bg-[#9CFF49]/5 border border-[#9CFF49]/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#9CFF49]" />
                    <span className="text-[#9CFF49]" style={{ fontSize: "0.8rem" }}>Precio sugerido</span>
                  </div>
                  <p className="text-[#9CFF49]" style={{ fontSize: "1.3rem" }}>{suggestedPrice}&euro;</p>
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label style={{ fontSize: "0.8rem" }}>Texto del anuncio</Label>
                  <Button variant="ghost" size="sm" onClick={handleGenerateAd} className="text-[#9CFF49] gap-1 h-7" style={{ fontSize: "0.7rem" }}>
                    <Sparkles className="w-3 h-3" /> Generar con IA
                  </Button>
                </div>
                <Textarea value={adText} onChange={(e) => setAdText(e.target.value)}
                  placeholder="Se generara un texto para tu anuncio..."
                  className="bg-secondary/50 min-h-[90px]" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <Button onClick={handleSubmit}
        className="w-full h-10 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] active:bg-[#7dd635] disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={analyzing}>
        {analyzing ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analizando...</>
        ) : (
          "Guardar Figura"
        )}
      </Button>
    </div>
  );
}