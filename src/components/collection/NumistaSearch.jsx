import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ExternalLink, ChevronDown, ChevronUp, Coins, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const rarityLabels = {
  commune: "Commune", peu_commune: "Peu commune", rare: "Rare",
  tres_rare: "Très rare", exceptionnelle: "Exceptionnelle",
};

function TypeCard({ type, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDetails = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (details) return;
    setLoading(true);
    const [detRes, priceRes] = await Promise.all([
      base44.functions.invoke("numistaSearch", { action: "getType", type_id: type.id, lang: "fr" }),
      base44.functions.invoke("numistaSearch", { action: "getPrices", type_id: type.id, lang: "fr" }),
    ]);
    setDetails(detRes.data);
    setPrices(priceRes.data);
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      <button className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left" onClick={loadDetails}>
        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {type.obverse_thumbnail ? (
            <img src={type.obverse_thumbnail} alt={type.title} className="w-full h-full object-cover" />
          ) : (
            type.category === "banknote" ? <Banknote className="w-6 h-6 text-muted-foreground" /> : <Coins className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-foreground truncate">{type.title}</p>
          <p className="text-sm text-muted-foreground font-body">{type.issuer?.name} · {type.min_year}{type.max_year && type.max_year !== type.min_year ? `–${type.max_year}` : ""}</p>
          <Badge variant="outline" className="mt-1 text-xs font-body capitalize">{type.category}</Badge>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/50"
          >
            <div className="p-4 space-y-4">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
                </div>
              ) : details ? (
                <>
                  {/* Images */}
                  {(details.obverse_picture || details.reverse_picture) && (
                    <div className="flex gap-3">
                      {details.obverse_picture && <img src={details.obverse_picture} alt="Avers" className="h-24 rounded-lg object-contain bg-muted" />}
                      {details.reverse_picture && <img src={details.reverse_picture} alt="Revers" className="h-24 rounded-lg object-contain bg-muted" />}
                    </div>
                  )}

                  {/* Description */}
                  {details.description && (
                    <p className="text-sm font-body text-muted-foreground leading-relaxed">{details.description}</p>
                  )}

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 text-sm font-body">
                    {details.composition?.text && <div><span className="text-muted-foreground">Métal :</span> <span className="font-medium">{details.composition.text}</span></div>}
                    {details.size && <div><span className="text-muted-foreground">Diamètre :</span> <span className="font-medium">{details.size} mm</span></div>}
                    {details.weight && <div><span className="text-muted-foreground">Poids :</span> <span className="font-medium">{details.weight} g</span></div>}
                    {details.demonetization?.demonetized !== undefined && (
                      <div><span className="text-muted-foreground">Démonétisé :</span> <span className="font-medium">{details.demonetization.demonetized ? "Oui" : "Non"}</span></div>
                    )}
                  </div>

                  {/* Prices */}
                  {prices?.prices?.prices && prices.prices.prices.length > 0 && (
                    <div className="bg-primary/5 rounded-xl p-3 space-y-2">
                      <p className="text-sm font-body font-semibold text-foreground">Valeurs de référence</p>
                      <div className="grid grid-cols-2 gap-2">
                        {prices.prices.prices.map((p, i) => (
                          <div key={i} className="flex justify-between text-sm font-body">
                            <span className="text-muted-foreground">{p.grade || "—"}</span>
                            <span className="font-semibold text-primary">{p.price_eur ? `${p.price_eur} €` : p.price ? `${p.price} ${p.currency || ""}` : "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onSelect(details, prices)} className="gap-2">
                      Utiliser pour l'estimation
                    </Button>
                    <a href={details.url || `https://en.numista.com/catalogue/pieces${details.id}.html`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-2">
                        <ExternalLink className="w-3 h-3" /> Voir sur Numista
                      </Button>
                    </a>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NumistaSearch({ onSelectType, category = "coin" }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    if (!query && !year) return;
    setSearching(true);
    setResults(null);
    const res = await base44.functions.invoke("numistaSearch", {
      action: "search",
      query,
      year: year || undefined,
      category,
      lang: "fr",
    });
    setResults(res.data);
    setSearching(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
        <p className="text-sm font-body text-muted-foreground">Recherchez dans la base Numista pour trouver votre pièce ou billet et récupérer ses données automatiquement.</p>
        <div className="flex gap-3">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={category === "coin" ? "Ex: Napoléon III 20 francs" : "Ex: 100 francs Delacroix"}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Input
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="Année"
            className="w-28"
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching || (!query && !year)} className="gap-2 shrink-0">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Chercher
          </Button>
        </div>
      </div>

      {results && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-body">{results.count} résultat{results.count > 1 ? "s" : ""} trouvé{results.count > 1 ? "s" : ""}</p>
          {results.types?.length === 0 && (
            <p className="text-sm text-muted-foreground font-body text-center py-6">Aucun résultat. Essayez avec d'autres termes.</p>
          )}
          {results.types?.map(type => (
            <TypeCard key={type.id} type={type} onSelect={onSelectType} />
          ))}
        </div>
      )}
    </div>
  );
}