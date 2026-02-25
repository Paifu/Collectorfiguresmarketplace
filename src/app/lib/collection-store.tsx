import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { MOCK_FIGURES, MOCK_CATEGORIES, type Figure, type Category } from "./mock-data";

// ─── AI Recognition Database ───
// Maps image "fingerprints" (simulated by filename keywords) to figure data
export interface AIRecognitionResult {
  recognized: boolean;
  confidence: number;
  data?: Partial<Figure>;
}

const AI_RECOGNITION_DB: { keywords: string[]; data: Partial<Figure> }[] = [
  {
    keywords: ["goku", "dragon", "ball", "instinct", "ultra", "dbz", "saiyan", "kamehameha"],
    data: {
      name: "Goku Ultra Instinct",
      character: "Son Goku",
      brand: "Bandai",
      line: "S.H.Figuarts",
      year: 2022,
      scale: '6"',
      material: "PVC / ABS",
      category: "Dragon Ball",
      condition: "mint_sealed",
    },
  },
  {
    keywords: ["leonardo", "turtle", "ninja", "tmnt", "tortuga"],
    data: {
      name: "Leonardo NECA 1990 Movie",
      character: "Leonardo",
      brand: "NECA",
      line: "TMNT 1990 Movie",
      year: 2019,
      scale: '7"',
      material: "PVC",
      category: "Tortugas Ninja",
      condition: "complete",
    },
  },
  {
    keywords: ["he-man", "heman", "masters", "motu", "eternia"],
    data: {
      name: "He-Man Origins Deluxe",
      character: "He-Man",
      brand: "Mattel",
      line: "MOTU Origins",
      year: 2021,
      scale: '5.5"',
      material: "PVC",
      category: "Masters of the Universe",
      condition: "mint_open",
    },
  },
  {
    keywords: ["snake", "eyes", "joe", "gi", "cobra"],
    data: {
      name: "Snake Eyes Classified #02",
      character: "Snake Eyes",
      brand: "Hasbro",
      line: "Classified Series",
      year: 2020,
      scale: '6"',
      material: "PVC / ABS",
      category: "GI Joe",
      condition: "mint_sealed",
    },
  },
  {
    keywords: ["seiya", "pegasus", "saint", "cloth", "caballero", "zodiaco"],
    data: {
      name: "Pegasus Seiya V3 EX",
      character: "Seiya",
      brand: "Bandai",
      line: "Saint Cloth Myth EX",
      year: 2023,
      scale: '6.5"',
      material: "Die-cast / PVC / Cloth",
      category: "Saint Seiya",
      condition: "mint_sealed",
    },
  },
  {
    keywords: ["spider", "spiderman", "marvel", "web"],
    data: {
      name: "Spider-Man Retro Wave",
      character: "Spider-Man",
      brand: "Hasbro",
      line: "Marvel Legends",
      year: 2024,
      scale: '6"',
      material: "PVC",
      category: "Marvel / DC",
      condition: "complete",
    },
  },
  {
    keywords: ["batman", "dark", "knight", "gotham"],
    data: {
      name: "Batman Hush MAFEX",
      character: "Batman",
      brand: "Medicom",
      line: "MAFEX",
      year: 2022,
      scale: '6"',
      material: "PVC / ABS",
      category: "Marvel / DC",
      condition: "mint_sealed",
    },
  },
  {
    keywords: ["vegeta", "saiyan", "final", "flash"],
    data: {
      name: "Vegeta Super Saiyan Final Flash",
      character: "Vegeta",
      brand: "Bandai",
      line: "S.H.Figuarts",
      year: 2021,
      scale: '6"',
      material: "PVC / ABS",
      category: "Dragon Ball",
      condition: "mint_open",
    },
  },
  {
    keywords: ["optimus", "prime", "transformer", "autobot"],
    data: {
      name: "Optimus Prime MP-44",
      character: "Optimus Prime",
      brand: "Takara Tomy",
      line: "Masterpiece",
      year: 2022,
      scale: '12"',
      material: "ABS / Die-cast",
      category: "Marvel / DC",
      condition: "mint_sealed",
    },
  },
  {
    keywords: ["vader", "darth", "star", "wars", "sith"],
    data: {
      name: "Darth Vader Black Series",
      character: "Darth Vader",
      brand: "Hasbro",
      line: "Black Series",
      year: 2023,
      scale: '6"',
      material: "PVC",
      category: "Marvel / DC",
      condition: "mint_open",
    },
  },
];

/**
 * Simulates AI image recognition.
 * In a real app, this would call a vision API.
 * For the prototype, we check the filename for known keywords.
 */
export function simulateImageRecognition(fileName: string): AIRecognitionResult {
  const lower = fileName.toLowerCase();
  for (const entry of AI_RECOGNITION_DB) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return {
        recognized: true,
        confidence: 0.85 + Math.random() * 0.12,
        data: entry.data,
      };
    }
  }
  return { recognized: false, confidence: 0 };
}

// ─── Collection Store Context ───

interface CollectionState {
  figures: Figure[];
  categories: Category[];
  addFigure: (figure: Omit<Figure, "id" | "priceHistory">) => void;
  updateFigure: (id: string, updates: Partial<Figure>) => void;
  removeFigure: (id: string) => void;
  addCategory: (name: string) => void;
  getTotalValue: () => number;
  getTotalFigures: () => number;
  getCategoryStats: () => { id: string; name: string; color: string; icon: string; count: number; totalValue: number }[];
}

const CollectionContext = createContext<CollectionState | null>(null);

function generatePriceHistory(base: number): { month: string; price: number }[] {
  const labels = ["Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb"];
  let price = base * 0.85;
  return labels.map((m) => {
    price = price * (0.96 + Math.random() * 0.12);
    return { month: m, price: Math.round(price) };
  });
}

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [figures, setFigures] = useState<Figure[]>([...MOCK_FIGURES]);
  const [categories, setCategories] = useState<Category[]>([...MOCK_CATEGORIES]);

  const addFigure = useCallback((figureData: Omit<Figure, "id" | "priceHistory">) => {
    const newFigure: Figure = {
      ...figureData,
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      priceHistory: generatePriceHistory(figureData.currentValue || figureData.purchasePrice || 50),
    };
    setFigures((prev) => [newFigure, ...prev]);

    // Auto-create category if doesn't exist
    setCategories((prev) => {
      const exists = prev.some((c) => c.name === figureData.category);
      if (!exists && figureData.category) {
        const colors = ["#F59E0B", "#10B981", "#8B5CF6", "#3B82F6", "#EC4899", "#EF4444", "#06B6D4"];
        return [
          ...prev,
          {
            id: String(Date.now()),
            name: figureData.category,
            color: colors[prev.length % colors.length],
            icon: "box",
            count: 0,
            totalValue: 0,
          },
        ];
      }
      return prev;
    });

    return newFigure;
  }, []);

  const updateFigure = useCallback((id: string, updates: Partial<Figure>) => {
    setFigures((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const removeFigure = useCallback((id: string) => {
    setFigures((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addCategoryFn = useCallback((name: string) => {
    const colors = ["#F59E0B", "#10B981", "#8B5CF6", "#3B82F6", "#EC4899", "#EF4444", "#06B6D4"];
    setCategories((prev) => [
      ...prev,
      { id: String(Date.now()), name, color: colors[prev.length % colors.length], icon: "box", count: 0, totalValue: 0 },
    ]);
  }, []);

  const getTotalValue = useCallback(() => {
    return figures.reduce((sum, f) => sum + f.currentValue, 0);
  }, [figures]);

  const getTotalFigures = useCallback(() => figures.length, [figures]);

  const getCategoryStats = useCallback(() => {
    return categories.map((cat) => {
      const catFigures = figures.filter((f) => f.category === cat.name);
      return {
        ...cat,
        count: catFigures.length,
        totalValue: catFigures.reduce((s, f) => s + f.currentValue, 0),
      };
    });
  }, [categories, figures]);

  return (
    <CollectionContext.Provider
      value={{
        figures,
        categories,
        addFigure,
        updateFigure,
        removeFigure,
        addCategory: addCategoryFn,
        getTotalValue,
        getTotalFigures,
        getCategoryStats,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error("useCollection must be used inside CollectionProvider");
  return ctx;
}
