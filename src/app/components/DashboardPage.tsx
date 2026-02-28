import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useCollection } from "../lib/collection-store";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import {
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Plus,
  EyeOff,
  ArrowRight,
  MapPin,
  Barcode,
  Camera,
  DollarSign,
  Copy,
} from "lucide-react";

/**
 * Objetivo: replicar el UX del mobile que me pasaste:
 * - "Requieren acción" con barra de completitud
 * - Bloques "Críticas" y "Mejoras"
 * - "Categorías" en lista con Figuras y Valor + botón "+ Nueva"
 *
 * NOTA: Como no hay backend, las “acciones” se infieren con reglas simples:
 * - CRÍTICAS: faltan UPC/EAN (upc), ubicación (location), fotos (images), precio (purchasePrice), categoría (category)
 * - MEJORAS: posible duplicado (mismo nombre) + “variante sin confirmar” (heurística simple)
 */

type IssueSeverity = "critical" | "improvement";

type Issue = {
  id: string;
  figureId: string;
  figureName: string;
  figureImage?: string;
  title: string;
  subtitle: string;
  severity: IssueSeverity;
  missingKeys: string[]; // para calcular completitud
};

const DOT_COLORS = [
  "bg-amber-400",
  "bg-emerald-400",
  "bg-violet-400",
  "bg-sky-400",
  "bg-pink-400",
  "bg-red-400",
  "bg-lime-400",
  "bg-orange-400",
];

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { figures, categories } = useCollection();

  // para “Ignorar” sin backend (solo UI)
  const [ignoredIssueIds, setIgnoredIssueIds] = useState<Record<string, boolean>>({});

  // ─────────────────────────────────────────────
  // Construimos "issues" a partir de tus figuras
  // ─────────────────────────────────────────────
  const issues = useMemo<Issue[]>(() => {
    const byName = new Map<string, number>();
    figures.forEach((f: any) => {
      const key = (f?.name || "").trim().toLowerCase();
      if (!key) return;
      byName.set(key, (byName.get(key) || 0) + 1);
    });

    const out: Issue[] = [];

    for (const f of figures as any[]) {
      const figureId = f.id;
      const figureName = f.name || "Figura";
      const figureImage = f.image || f.images?.[0];

      const missingKeys: string[] = [];
      const missing: string[] = [];

      const hasImages = Array.isArray(f.images) ? f.images.length > 0 : !!f.image;
      if (!hasImages) {
        missing.push("fotos");
        missingKeys.push("images");
      }
      if (!f.category) {
        missing.push("categoría");
        missingKeys.push("category");
      }
      if (!f.location || String(f.location).trim() === "") {
        missing.push("ubicación");
        missingKeys.push("location");
      }
      // upc en tu proyecto existe en AddFigurePage como `upc`
      if (!f.upc || String(f.upc).trim() === "") {
        missing.push("UPC/EAN");
        missingKeys.push("upc");
      }
      const price = Number(f.purchasePrice || 0);
      if (!price || price === 0) {
        missing.push("precio");
        missingKeys.push("purchasePrice");
      }

      // CRÍTICAS si faltan “clave”
      if (missing.length > 0) {
        const title =
          missing.includes("UPC/EAN") || missing.includes("ubicación")
            ? "Datos incompletos — falta UPC/EAN y/o ubicación"
            : "Datos incompletos — faltan campos básicos";

        const subtitle =
          missing.length >= 3
            ? `Falta: ${missing.slice(0, 3).join(", ")}…`
            : `Falta: ${missing.join(", ")}`;

        out.push({
          id: `crit-${figureId}`,
          figureId,
          figureName,
          figureImage,
          title,
          subtitle: "Afecta a la valoración estimada y búsqueda",
          severity: "critical",
          missingKeys,
        });
      }

      // MEJORAS: duplicado (mismo nombre)
      const key = (figureName || "").trim().toLowerCase();
      if (key && (byName.get(key) || 0) > 1) {
        out.push({
          id: `imp-dup-${figureId}`,
          figureId,
          figureName,
          figureImage,
          title: "Posible duplicado detectado",
          subtitle: "Puede haber confusión con otros registros",
          severity: "improvement",
          missingKeys: [], // no afecta completitud
        });
      }

      // MEJORAS: “variante sin confirmar” (heurística simple por nombre)
      const nrm = (figureName || "").toLowerCase();
      const looksVariant =
        nrm.includes("ultra") ||
        nrm.includes("variant") ||
        nrm.includes("ver.") ||
        nrm.includes("edition") ||
        nrm.includes("limited");

      if (looksVariant) {
        out.push({
          id: `imp-var-${figureId}`,
          figureId,
          figureName,
          figureImage,
          title: "Variante sin confirmar",
          subtitle: "La variante correcta puede cambiar el valor",
          severity: "improvement",
          missingKeys: [],
        });
      }
    }

    return out;
  }, [figures]);

  const visibleIssues = useMemo(
    () => issues.filter((i) => !ignoredIssueIds[i.id]),
    [issues, ignoredIssueIds]
  );

  const criticalIssues = useMemo(
    () => visibleIssues.filter((i) => i.severity === "critical"),
    [visibleIssues]
  );

  const improvementIssues = useMemo(
    () => visibleIssues.filter((i) => i.severity === "improvement"),
    [visibleIssues]
  );

  // ─────────────────────────────────────────────
  // Completitud (barra) — % basado en campos clave
  // ─────────────────────────────────────────────
  const completeness = useMemo(() => {
    if (!figures.length) return 0;

    // claves “importantes” por figura
    const keys = ["images", "category", "location", "upc", "purchasePrice"] as const;

    let total = 0;
    let ok = 0;

    for (const f of figures as any[]) {
      for (const k of keys) {
        total += 1;
        if (k === "images") {
          const hasImages = Array.isArray(f.images) ? f.images.length > 0 : !!f.image;
          if (hasImages) ok += 1;
        } else if (k === "purchasePrice") {
          const price = Number(f.purchasePrice || 0);
          if (price > 0) ok += 1;
        } else {
          const val = f[k];
          if (val !== undefined && val !== null && String(val).trim() !== "") ok += 1;
        }
      }
    }

    return clamp(Math.round((ok / total) * 100), 0, 100);
  }, [figures]);

  // ─────────────────────────────────────────────
  // Categorías: lista con “Figuras” y “Valor”
  // ─────────────────────────────────────────────
  const categoryRows = useMemo(() => {
    // Map por name
    const map = new Map<string, { name: string; count: number; value: number; id?: string }>();

    // trae categorías del store (si existen)
    (categories || []).forEach((c: any) => {
      map.set(c.name, { name: c.name, count: 0, value: 0, id: c.id });
    });

    for (const f of figures as any[]) {
      const name = f.category || "Sin categoría";
      if (!map.has(name)) map.set(name, { name, count: 0, value: 0, id: `custom-${name}` });
      const row = map.get(name)!;
      row.count += 1;
      row.value += Number(f.currentValue || 0);
    }

    const arr = Array.from(map.values());
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [categories, figures]);

  const handleIgnore = (issueId: string) => {
    setIgnoredIssueIds((prev) => ({ ...prev, [issueId]: true }));
    toast.message("Ignorado", { description: "No volverá a aparecer en esta lista (solo visual)" });
  };

  const handleResolve = (figureId: string) => {
    // tu app ya tiene /figure/:id
    navigate(`/figure/${figureId}`);
  };

  const handleNewCategory = () => {
    toast.message("Nueva categoría (demo)", {
      description: "Aquí abriríamos un modal para crear categoría. En el demo no hay backend.",
    });
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* ───── Requieren acción ───── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#9CFF49]" />
          <h2 className="text-foreground" style={{ fontSize: "1.1rem" }}>Requieren acción</h2>
          <Badge variant="secondary" className="text-[0.65rem]">
            {visibleIssues.length}
          </Badge>
        </div>
        <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>
          Completar estos datos mejora la valoración y búsqueda.
        </p>

        {/* Barra completitud */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>
                Completitud de colección
              </p>
              <p className="text-[#9CFF49]" style={{ fontSize: "0.85rem" }}>
                {completeness}%
              </p>
            </div>
            <div className="h-2 rounded-full bg-secondary/40 overflow-hidden">
              <div
                className="h-full bg-[#9CFF49]"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Críticas */}
        {criticalIssues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <p className="text-foreground" style={{ fontSize: "0.85rem" }}>
                Críticas — afectan al valor
              </p>
            </div>

            <div className="space-y-3">
              {criticalIssues.slice(0, 4).map((i) => (
                <Card key={i.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary/30 shrink-0">
                        <ImageWithFallback
                          src={i.figureImage || ""}
                          alt={i.figureName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate" style={{ fontSize: "0.9rem" }}>
                          {i.figureName}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                            {i.title}
                          </p>
                        </div>

                        <p className="text-muted-foreground mt-1" style={{ fontSize: "0.72rem" }}>
                          {i.subtitle}
                        </p>

                        {/* chips de “qué falta” */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {i.missingKeys.includes("upc") && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40 text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                              <Barcode className="w-3 h-3" /> UPC/EAN
                            </span>
                          )}
                          {i.missingKeys.includes("location") && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40 text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                              <MapPin className="w-3 h-3" /> Ubicación
                            </span>
                          )}
                          {i.missingKeys.includes("images") && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40 text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                              <Camera className="w-3 h-3" /> Fotos
                            </span>
                          )}
                          {i.missingKeys.includes("purchasePrice") && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40 text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                              <DollarSign className="w-3 h-3" /> Precio
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-3">
                          <button
                            onClick={() => handleIgnore(i.id)}
                            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <EyeOff className="w-4 h-4" />
                            Ignorar
                          </button>
                          <Button
                            onClick={() => handleResolve(i.figureId)}
                            className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]"
                          >
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {criticalIssues.length > 4 && (
                <Button variant="outline" className="w-full" onClick={() => toast.message("Demo", { description: "Aquí abriríamos 'Ver todas'." })}>
                  Ver todas <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Mejoras */}
        {improvementIssues.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <p className="text-foreground" style={{ fontSize: "0.85rem" }}>
                Mejoras — datos opcionales
              </p>
            </div>

            <div className="space-y-3">
              {improvementIssues.slice(0, 3).map((i) => (
                <Card key={i.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary/30 shrink-0">
                        <ImageWithFallback
                          src={i.figureImage || ""}
                          alt={i.figureName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate" style={{ fontSize: "0.9rem" }}>
                          {i.figureName}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          {i.title.toLowerCase().includes("duplicado") ? (
                            <Copy className="w-4 h-4 text-sky-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          )}
                          <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                            {i.title}
                          </p>
                        </div>

                        <p className="text-muted-foreground mt-1" style={{ fontSize: "0.72rem" }}>
                          {i.subtitle}
                        </p>

                        <div className="flex items-center justify-end gap-3 mt-3">
                          <button
                            onClick={() => handleIgnore(i.id)}
                            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <EyeOff className="w-4 h-4" />
                            Ignorar
                          </button>
                          <Button
                            variant="outline"
                            onClick={() => handleResolve(i.figureId)}
                          >
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ───── Categorías (lista como tu captura) ───── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground" style={{ fontSize: "1.2rem" }}>
            Categorías
          </h2>
          <button
            onClick={handleNewCategory}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            style={{ fontSize: "0.9rem" }}
          >
            <Plus className="w-4 h-4" />
            Nueva
          </button>
        </div>

        <div className="space-y-3">
          {categoryRows.map((c, idx) => {
            const dot = DOT_COLORS[idx % DOT_COLORS.length];
            const catId =
              (categories || []).find((x: any) => x.name === c.name)?.id || c.id || `custom-${c.name}`;

            return (
              <button
                key={c.name}
                onClick={() => navigate(`/category/${catId}`)}
                className="w-full text-left"
              >
                <Card className="bg-card border-border hover:border-[#9CFF49]/25 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${dot}`} />
                      <p className="text-foreground flex-1" style={{ fontSize: "0.95rem" }}>
                        {c.name}
                      </p>

                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                            Figuras
                          </p>
                          <p className="text-foreground" style={{ fontSize: "0.95rem" }}>
                            {c.count}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                            Valor
                          </p>
                          <p className="text-foreground" style={{ fontSize: "0.95rem" }}>
                            {Math.round(c.value)}€
                          </p>
                        </div>

                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
