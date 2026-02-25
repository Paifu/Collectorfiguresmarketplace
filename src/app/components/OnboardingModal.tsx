import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Plus, BarChart3, Tag, Store } from "lucide-react";

const STEPS = [
  {
    icon: Plus,
    color: "text-[#9CFF49] bg-[#9CFF49]/10",
    title: "Anade tu primera figura",
    desc: "Sube una foto o escanea el codigo de barras. SILE autocompletara los datos de tu figura automaticamente.",
  },
  {
    icon: BarChart3,
    color: "text-blue-500 bg-blue-500/10",
    title: "Organiza tu coleccion",
    desc: "Clasifica por categorias, detecta duplicados, revisa pendientes y controla cada detalle de tus figuras.",
  },
  {
    icon: Tag,
    color: "text-amber-500 bg-amber-500/10",
    title: "Consulta precios del mercado",
    desc: "Compara precios de eBay, Wallapop, Vinted y mas. Recibe rangos estimados y contexto de valor.",
  },
  {
    icon: Store,
    color: "text-purple-500 bg-purple-500/10",
    title: "Marketplace integrado",
    desc: "Cuando quieras vender, publica en el marketplace. Negocia por chat y gestiona ofertas directas.",
  },
];

export function OnboardingModal() {
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);

  if (!user || user.hasSeenOnboarding) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open onOpenChange={() => completeOnboarding()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">Onboarding</DialogTitle>
        <DialogDescription className="sr-only">Pasos de bienvenida a SILE</DialogDescription>
        <div className="p-8 flex flex-col items-center text-center">
          {/* Step indicator */}
          <div className="flex gap-1.5 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${current.color}`}>
            <Icon className="w-8 h-8" />
          </div>

          {/* Content */}
          <h2 className="text-foreground mb-2">{current.title}</h2>
          <p className="text-muted-foreground mb-8" style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
            {current.desc}
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              variant="ghost"
              className="flex-1 text-muted-foreground"
              onClick={() => completeOnboarding()}
            >
              Saltar
            </Button>
            <Button
              className="flex-1 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]"
              onClick={() => (isLast ? completeOnboarding() : setStep(step + 1))}
            >
              {isLast ? "Empezar" : "Siguiente"}
            </Button>
          </div>

          {user.isDemo && step === 0 && (
            <p className="text-amber-500/80 mt-4" style={{ fontSize: "0.7rem" }}>
              Estas en modo demo — los datos son de ejemplo y no se guardaran.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}