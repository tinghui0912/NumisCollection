import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload, Sparkles, Info } from "lucide-react";
import NumistaImagePicker from "@/components/collection/NumistaImagePicker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const coinConditionDetails = [
  { value: "FDC", label: "FDC", desc: "Fleur de Coin — Pièce parfaite, jamais circulée, brillant d'origine intact." },
  { value: "SUP", label: "SUP", desc: "Superbe — Légères traces de manipulation, relief très net, éclat présent." },
  { value: "TTB", label: "TTB", desc: "Très Très Beau — Peu circulée, détails bien marqués, légère usure sur les reliefs." },
  { value: "TB",  label: "TB",  desc: "Très Beau — Circulée, usure modérée mais les détails restent nets." },
  { value: "B",   label: "B",   desc: "Beau — Usure importante, contours encore visibles mais relief aplati." },
  { value: "AB",  label: "AB",  desc: "Assez Beau — Très usée, détails partiellement effacés, collectionnable." },
];
const coinConditions = coinConditionDetails.map(c => c.value);
const banknoteConditionDetails = [
  { value: "NEUF", label: "NEUF", desc: "Neuf — Billet parfait, jamais circulé, sans aucun défaut." },
  { value: "SPL",  label: "SPL",  desc: "Splendide — Très légères traces, quasi parfait, coins bien définis." },
  { value: "TTB",  label: "TTB",  desc: "Très Très Beau — Peu circulé, quelques légères marques mais bel aspect." },
  { value: "TB",   label: "TB",   desc: "Très Beau — Circulé, usure visible mais billet encore présentable." },
  { value: "B",    label: "B",    desc: "Beau — Usure nette, plis marqués, mais lisible et complet." },
  { value: "AB",   label: "AB",   desc: "Assez Beau — Très usé, plis importants, déchirures possibles." },
];
const banknoteConditions = banknoteConditionDetails.map(c => c.value);
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

export default function ItemFormDialog({ open, onOpenChange, type = "coin", item, onSaved }) {
  const isCoin = type === "coin";
  const conditions = isCoin ? coinConditions : banknoteConditions;
  const conditionDetails = isCoin ? coinConditionDetails : banknoteConditionDetails;
  const categories = isCoin ? coinCategories : banknoteCategories;

  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({ ...item });
    } else {
      setForm({});
    }
  }, [item, open]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange("image_url", file_url);
    setUploading(false);
  };

  const handleEstimate = async () => {
    setEstimating(true);
    const prompt = `Tu es un expert en numismatique. Estime la valeur marchande actuelle en euros de ${isCoin ? 'cette pièce de monnaie' : 'ce billet de banque'} avec ces caractéristiques:
- Nom: ${form.name || 'N/A'}
- Pays: ${form.country || 'N/A'}
- Année: ${form.year || 'N/A'}
- Dénomination: ${form.denomination || 'N/A'}
- État: ${form.condition || 'N/A'}
- Rareté: ${form.rarity || 'N/A'}
${isCoin ? `- Métal: ${form.metal || 'N/A'}` : `- Numéro de série: ${form.serial_number || 'N/A'}`}
- Catégorie: ${form.category || 'N/A'}

Donne une estimation réaliste basée sur le marché actuel de la numismatique. Réponds uniquement avec un objet JSON.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          estimated_value: { type: "number", description: "Valeur estimée en euros" },
          explanation: { type: "string", description: "Brève explication de l'estimation" }
        }
      }
    });

    handleChange("estimated_value", result.estimated_value);
    setEstimating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const Entity = isCoin ? base44.entities.Coin : base44.entities.Banknote;
    if (item?.id) {
      await Entity.update(item.id, form);
    } else {
      await Entity.create(form);
    }
    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {item ? "Modifier" : "Ajouter"} {isCoin ? "une pièce" : "un billet"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label className="font-body text-sm">Nom *</Label>
            <Input value={form.name || ""} onChange={e => handleChange("name", e.target.value)} placeholder="Ex: Napoléon III 20 Francs" />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Pays *</Label>
            <Input value={form.country || ""} onChange={e => handleChange("country", e.target.value)} placeholder="Ex: France" />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Année *</Label>
            <Input type="number" value={form.year || ""} onChange={e => handleChange("year", parseInt(e.target.value) || "")} placeholder="Ex: 1870" />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Dénomination *</Label>
            <Input value={form.denomination || ""} onChange={e => handleChange("denomination", e.target.value)} placeholder="Ex: 20 Francs" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="font-body text-sm">État</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs space-y-1 p-3">
                    {conditionDetails.map(c => (
                      <div key={c.value}>
                        <span className="font-semibold text-foreground">{c.label}</span>
                        <span className="text-muted-foreground"> — {c.desc.split(" — ")[1]}</span>
                      </div>
                    ))}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={form.condition || ""} onValueChange={v => handleChange("condition", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {conditionDetails.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{c.label}</span>
                      <span className="text-xs text-muted-foreground">{c.desc.split(" — ")[1]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Rareté</Label>
            <Select value={form.rarity || ""} onValueChange={v => handleChange("rarity", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {rarities.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isCoin && (
            <div className="space-y-2">
              <Label className="font-body text-sm">Métal</Label>
              <Select value={form.metal || ""} onValueChange={v => handleChange("metal", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {metals.map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {!isCoin && (
            <div className="space-y-2">
              <Label className="font-body text-sm">Numéro de série</Label>
              <Input value={form.serial_number || ""} onChange={e => handleChange("serial_number", e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-body text-sm">Catégorie</Label>
            <Select value={form.category || ""} onValueChange={v => handleChange("category", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isCoin && (
            <div className="space-y-2">
              <Label className="font-body text-sm">Tirage (nombre d'exemplaires)</Label>
              <Input type="number" value={form.mintage || ""} onChange={e => handleChange("mintage", parseInt(e.target.value) || "")} placeholder="Ex: 500000" />
            </div>
          )}
          <div className="space-y-2">
            <Label className="font-body text-sm">Prix d'achat (€)</Label>
            <Input type="number" step="0.01" value={form.purchase_price || ""} onChange={e => handleChange("purchase_price", parseFloat(e.target.value) || "")} />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Valeur estimée (€)</Label>
            <div className="flex gap-2">
              <Input type="number" step="0.01" value={form.estimated_value || ""} onChange={e => handleChange("estimated_value", parseFloat(e.target.value) || "")} className="flex-1" />
              <Button type="button" variant="outline" size="icon" onClick={handleEstimate} disabled={estimating} title="Estimer avec l'IA">
                {estimating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />}
              </Button>
            </div>
          </div>

          <div className="col-span-full space-y-3">
            <Label className="font-body text-sm">Photo</Label>
            <div className="flex items-center gap-3 flex-wrap">
              {form.image_url && (
                <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border" />
              )}
              <Label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="text-sm font-body">{uploading ? "Envoi..." : "Télécharger"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </Label>
            </div>
            <NumistaImagePicker
              name={form.name}
              year={form.year}
              category={isCoin ? "coin" : "banknote"}
              onSelectImage={(url) => handleChange("image_url", url)}
            />
            <Input
              value={form.image_url || ""}
              onChange={e => handleChange("image_url", e.target.value)}
              placeholder="https://... (URL de l'image)"
              className="font-body text-sm"
            />
          </div>

          <div className="col-span-full space-y-2">
            <Label className="font-body text-sm">Notes</Label>
            <Textarea value={form.notes || ""} onChange={e => handleChange("notes", e.target.value)} rows={3} placeholder="Remarques, provenance, historique..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !form.name || !form.country || !form.year || !form.denomination}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {item ? "Mettre à jour" : "Ajouter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}