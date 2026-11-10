import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Coins, Banknote, Search } from "lucide-react";
import EstimationTab from "@/components/collection/EstimationTab";
import NumistaSearch from "@/components/collection/NumistaSearch";

export default function Estimation() {
  const [activeType, setActiveType] = useState("coin");
  const [activeMode, setActiveMode] = useState("numista"); // "numista" | "ai"
  const [prefillData, setPrefillData] = useState(null);

  const handleSelectFromNumista = (details, pricesData) => {
    // Map Numista type data to our form fields
    const mapped = {
      name: details.title || "",
      country: details.issuer?.name || "",
      year: details.min_year || "",
      denomination: details.value?.text || details.title || "",
      metal: details.composition?.text?.toLowerCase().includes("or") ? "or"
        : details.composition?.text?.toLowerCase().includes("argent") ? "argent"
        : details.composition?.text?.toLowerCase().includes("bronze") ? "bronze"
        : details.composition?.text?.toLowerCase().includes("cuivre") ? "cuivre"
        : details.composition?.text?.toLowerCase().includes("nickel") ? "nickel"
        : details.composition?.text?.toLowerCase().includes("aluminium") ? "aluminium"
        : undefined,
      // Pre-fill estimated value from first price if available
      estimated_value: pricesData?.prices?.prices?.[0]?.price_eur || undefined,
      notes: details.description || "",
    };
    setPrefillData(mapped);
    setActiveMode("ai");
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-foreground">Estimation</h1>
        <p className="text-muted-foreground font-body mt-1">Recherchez sur Numista ou estimez par IA la valeur de vos pièces et billets</p>
      </motion.div>

      {/* Type selector */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
        <button
          onClick={() => { setActiveType("coin"); setPrefillData(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${activeType === "coin" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Coins className="w-4 h-4" /> Pièce
        </button>
        <button
          onClick={() => { setActiveType("banknote"); setPrefillData(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${activeType === "banknote" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Banknote className="w-4 h-4" /> Billet
        </button>
      </div>

      {/* Mode selector */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveMode("numista")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${activeMode === "numista" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Search className="w-4 h-4" /> Recherche Numista
        </button>
        <button
          onClick={() => setActiveMode("ai")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${activeMode === "ai" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Sparkles className="w-4 h-4" /> Estimation IA
        </button>
      </div>

      {activeMode === "numista" ? (
        <NumistaSearch category={activeType} onSelectType={handleSelectFromNumista} />
      ) : (
        <EstimationTab type={activeType} prefill={prefillData} />
      )}
    </div>
  );
}