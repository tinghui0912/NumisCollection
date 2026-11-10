import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const coinConditions = ["FDC", "SUP", "TTB", "TB", "B", "AB"];
const banknoteConditions = ["NEUF", "SPL", "TTB", "TB", "B", "AB"];
const rarities = [
  { value: "commune", label: "Commune" },
  { value: "peu_commune", label: "Peu commune" },
  { value: "rare", label: "Rare" },
  { value: "tres_rare", label: "Très rare" },
  { value: "exceptionnelle", label: "Exceptionnelle" },
];
const metals = ["or", "argent", "bronze", "cuivre", "nickel", "aluminium", "bimetalique", "autre"];
const coinCategories = [
  { value: "antique", label: "Antique" },
  { value: "medievale", label: "Médiévale" },
  { value: "moderne", label: "Moderne" },
  { value: "contemporaine", label: "Contemporaine" },
  { value: "commemorative", label: "Commémorative" },
];
const banknoteCategories = [
  { value: "anciens_francs", label: "Anciens Francs" },
  { value: "nouveaux_francs", label: "Nouveaux Francs" },
  { value: "euros", label: "Euros" },
  { value: "devises_etrangeres", label: "Devises étrangères" },
  { value: "historique", label: "Historique" },
];

export default function EstimationTab({ type = "coin", prefill = null }) {
  const isCoin = type === "coin";
  const conditions = isCoin ? coinConditions : banknoteConditions;
  const categories = isCoin ? coinCategories : banknoteCategories;

  const [form, setForm] = useState(prefill || {});
  const [estimating, setEstimating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (prefill) { setForm(prefill); setResult(null); }
  }, [prefill]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setResult(null);
  };

  const handleEstimate = async () => {
    setEstimating(true);
    setResult(null);
    const itemDesc = `${form.name || ''} ${form.denomination || ''} ${form.year || ''} ${form.country || ''}`.trim();
    const prompt = `Tu es un expert en numismatique. Estime la valeur marchande actuelle en euros de ${isCoin ? 'cette pièce de monnaie' : 'ce billet de banque'} avec ces caractéristiques:
- Nom: ${form.name || 'N/A'}
- Pays: ${form.country || 'N/A'}
- Année: ${form.year || 'N/A'}
- Dénomination: ${form.denomination || 'N/A'}
- État: ${form.condition || 'N/A'} (${isCoin ? "FDC=parfait,SUP=superbe,TTB=très très beau,TB=très beau,B=beau,AB=assez beau" : "NEUF=parfait,SPL=splendide,TTB=très très beau,TB=très beau,B=beau,AB=assez beau"})
- Rareté: ${form.rarity || 'N/A'}
${isCoin ? `- Métal: ${form.metal || 'N/A'}` : `- Numéro de série: ${form.serial_number || 'N/A'}`}
- Catégorie: ${form.category || 'N/A'}

Consulte les données de marché récentes disponibles sur internet, notamment:
- Le site Gadoury (gadoury.com) spécialisé dans la numismatique française
- Le site CGB (cgb.fr) qui est la référence française pour les pièces et billets
- Le site Achat Or et Argent (achat-or-et-argent.fr) pour les cours des métaux précieux et la valeur des pièces en or/argent
- Numista (numista.com) pour les cotations
- Les ventes aux enchères récentes

Donne une estimation réaliste du prix de marché actuel basée sur ces sources. Indique aussi les fourchettes de prix selon l'état si pertinent.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          estimated_value: { type: "number", description: "Valeur estimée en euros (valeur centrale)" },
          price_range_min: { type: "number", description: "Fourchette basse en euros" },
          price_range_max: { type: "number", description: "Fourchette haute en euros" },
          explanation: { type: "string", description: "Explication détaillée avec sources de marché mentionnées (gadoury, cgb, numista, enchères)" },
          cgb_search_url: { type: "string", description: "URL de recherche CGB pour cet item: https://www.cgb.fr/recherche/?search_txt=TERMES" },
          gadoury_search_url: { type: "string", description: "URL de recherche Gadoury pour cet item: https://www.gadoury.com/fr/recherche?q=TERMES" },
          achat_or_argent_url: { type: "string", description: "URL de recherche sur achat-or-et-argent.fr pour cet item: https://www.achat-or-et-argent.fr/recherche?q=TERMES (uniquement si la pièce est en or ou argent)" },
        }
      }
    });

    setResult(res);
    setEstimating(false);
  };

  const canEstimate = form.name || form.denomination || form.country;

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-sm text-muted-foreground font-body">
        Renseignez les caractéristiques pour obtenir une estimation de valeur par l'IA.
      </p>

      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="font-body text-sm">Nom</Label>
            <Input value={form.name || ""} onChange={e => handleChange("name", e.target.value)} placeholder={isCoin ? "Ex: Napoléon III 20 Francs" : "Ex: 100 Francs Delacroix"} />
          </div>
          <div className="space-y-1">
            <Label className="font-body text-sm">Pays</Label>
            <Input value={form.country || ""} onChange={e => handleChange("country", e.target.value)} placeholder="Ex: France" />
          </div>
          <div className="space-y-1">
            <Label className="font-body text-sm">Année</Label>
            <Input type="number" value={form.year || ""} onChange={e => handleChange("year", parseInt(e.target.value) || "")} placeholder="Ex: 1870" />
          </div>
          <div className="space-y-1">
            <Label className="font-body text-sm">Dénomination</Label>
            <Input value={form.denomination || ""} onChange={e => handleChange("denomination", e.target.value)} placeholder={isCoin ? "Ex: 20 Francs" : "Ex: 100 Francs"} />
          </div>

          <div className="space-y-1">
            <Label className="font-body text-sm">État</Label>
            <Select value={form.condition || ""} onValueChange={v => handleChange("condition", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.condition && (() => {
              const details = isCoin ? [
                { value: "FDC", desc: "Fleur de Coin — Pièce parfaite, jamais circulée, brillant d'origine intact." },
                { value: "SUP", desc: "Superbe — Légères traces de manipulation, relief très net, éclat présent." },
                { value: "TTB", desc: "Très Très Beau — Peu circulée, détails bien marqués, légère usure sur les reliefs." },
                { value: "TB",  desc: "Très Beau — Circulée, usure modérée mais les détails restent nets." },
                { value: "B",   desc: "Beau — Usure importante, contours encore visibles mais relief aplati." },
                { value: "AB",  desc: "Assez Beau — Très usée, détails partiellement effacés, collectionnable." },
              ] : [
                { value: "NEUF", desc: "Neuf — Billet parfait, jamais circulé, sans aucun défaut." },
                { value: "SPL",  desc: "Splendide — Très légères traces, quasi parfait, coins bien définis." },
                { value: "TTB",  desc: "Très Très Beau — Peu circulé, quelques légères marques mais bel aspect." },
                { value: "TB",   desc: "Très Beau — Circulé, usure visible mais billet encore présentable." },
                { value: "B",    desc: "Beau — Usure nette, plis marqués, mais lisible et complet." },
                { value: "AB",   desc: "Assez Beau — Très usé, plis importants, déchirures possibles." },
              ];
              const found = details.find(d => d.value === form.condition);
              return found ? <p className="text-xs text-muted-foreground mt-1 font-body">{found.desc}</p> : null;
            })()}
          </div>

          <div className="space-y-1">
            <Label className="font-body text-sm">Rareté</Label>
            <Select value={form.rarity || ""} onValueChange={v => handleChange("rarity", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {rarities.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isCoin ? (
            <div className="space-y-1">
              <Label className="font-body text-sm">Métal</Label>
              <Select value={form.metal || ""} onValueChange={v => handleChange("metal", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {metals.map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="font-body text-sm">Numéro de série</Label>
              <Input value={form.serial_number || ""} onChange={e => handleChange("serial_number", e.target.value)} />
            </div>
          )}

          <div className="space-y-1">
            <Label className="font-body text-sm">Catégorie</Label>
            <Select value={form.category || ""} onValueChange={v => handleChange("category", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={handleEstimate} disabled={estimating || !canEstimate} className="gap-2">
            {estimating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Estimer la valeur
          </Button>
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold text-foreground">Estimation IA</h3>
          </div>
          <div>
            <p className="font-heading text-4xl font-bold text-primary">
              {result.estimated_value?.toLocaleString('fr-FR')} €
            </p>
            {result.price_range_min && result.price_range_max && (
              <p className="text-sm text-muted-foreground font-body mt-1">
                Fourchette : {result.price_range_min?.toLocaleString('fr-FR')} € – {result.price_range_max?.toLocaleString('fr-FR')} €
              </p>
            )}
          </div>
          {result.explanation && (
            <p className="text-sm font-body text-muted-foreground leading-relaxed">{result.explanation}</p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {result.cgb_search_url && (
              <a href={result.cgb_search_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-body font-medium hover:border-primary/50 transition-colors">
                <ExternalLink className="w-3 h-3" /> CGB.fr
              </a>
            )}
            {result.gadoury_search_url && (
              <a href={result.gadoury_search_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-body font-medium hover:border-primary/50 transition-colors">
                <ExternalLink className="w-3 h-3" /> Gadoury.com
              </a>
            )}
            {result.achat_or_argent_url && (
              <a href={result.achat_or_argent_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-body font-medium hover:border-primary/50 transition-colors">
                <ExternalLink className="w-3 h-3" /> Achat-Or-et-Argent.fr
              </a>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}