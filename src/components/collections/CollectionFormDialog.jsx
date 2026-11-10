import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Coins, Banknote } from "lucide-react";

const themes = [
  { value: "periode", label: "Période historique" },
  { value: "pays", label: "Pays" },
  { value: "metal", label: "Métal" },
  { value: "denomination", label: "Dénomination" },
  { value: "libre", label: "Libre / Personnalisé" },
];

const PALETTE = ["#b87a28", "#2e7d6e", "#2563eb", "#7c3aed", "#dc2626", "#c2410c", "#0f766e", "#1d4ed8"];

export default function CollectionFormDialog({ open, onOpenChange, collection, coins, banknotes, onSaved }) {
  const [form, setForm] = useState({ name: "", description: "", theme: "", color: PALETTE[0], coin_ids: [], banknote_ids: [] });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (collection) {
      setForm({
        name: collection.name || "",
        description: collection.description || "",
        theme: collection.theme || "",
        color: collection.color || PALETTE[0],
        coin_ids: collection.coin_ids || [],
        banknote_ids: collection.banknote_ids || [],
      });
    } else {
      setForm({ name: "", description: "", theme: "", color: PALETTE[0], coin_ids: [], banknote_ids: [] });
    }
    setSearch("");
  }, [collection, open]);

  const toggleItem = (type, id) => {
    const key = type === "coin" ? "coin_ids" : "banknote_ids";
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter(i => i !== id) : [...prev[key], id],
    }));
  };

  const filteredCoins = coins.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.country?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredNotes = banknotes.filter(b =>
    !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.country?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    if (collection?.id) {
      await base44.entities.Collection.update(collection.id, form);
    } else {
      await base44.entities.Collection.create(form);
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
            {collection ? "Modifier la collection" : "Nouvelle collection"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="font-body text-sm">Nom *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Napoléons en or" />
            </div>
            <div className="space-y-1">
              <Label className="font-body text-sm">Thème</Label>
              <Select value={form.theme} onValueChange={v => setForm(p => ({ ...p, theme: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir un thème" /></SelectTrigger>
                <SelectContent>
                  {themes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="font-body text-sm">Description</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Décrivez votre collection..." />
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label className="font-body text-sm">Couleur</Label>
            <div className="flex gap-2 flex-wrap">
              {PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, color: c }))}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: form.color === c ? "#000" : "transparent" }}
                />
              ))}
            </div>
          </div>

          {/* Item picker */}
          <div className="space-y-2">
            <Label className="font-body text-sm">Sélectionner les éléments</Label>
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une pièce ou un billet..."
              className="mb-2"
            />
            <div className="max-h-52 overflow-y-auto space-y-1 border border-border rounded-xl p-3">
              {filteredCoins.length === 0 && filteredNotes.length === 0 && (
                <p className="text-sm text-muted-foreground font-body text-center py-4">Aucun élément trouvé</p>
              )}
              {filteredCoins.map(coin => (
                <label key={coin.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox checked={form.coin_ids.includes(coin.id)} onCheckedChange={() => toggleItem("coin", coin.id)} />
                  <Coins className="w-4 h-4 text-primary/60 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-body font-medium truncate">{coin.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{coin.country} · {coin.year}</p>
                  </div>
                </label>
              ))}
              {filteredNotes.map(note => (
                <label key={note.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox checked={form.banknote_ids.includes(note.id)} onCheckedChange={() => toggleItem("banknote", note.id)} />
                  <Banknote className="w-4 h-4 text-primary/60 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-body font-medium truncate">{note.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{note.country} · {note.year}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-body">
              {form.coin_ids.length} pièce{form.coin_ids.length > 1 ? "s" : ""} · {form.banknote_ids.length} billet{form.banknote_ids.length > 1 ? "s" : ""} sélectionné{(form.coin_ids.length + form.banknote_ids.length) > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !form.name}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {collection ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}