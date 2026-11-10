import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Banknote, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";

const rarityLabels = {
  commune: "Commune", peu_commune: "Peu commune", rare: "Rare",
  tres_rare: "Très rare", exceptionnelle: "Exceptionnelle",
};

export default function ItemDetailDialog({ open, onOpenChange, item, type = "coin", onEdit, onDelete }) {
  if (!item) return null;
  const isCoin = type === "coin";
  const gain = (item.estimated_value || 0) - (item.purchase_price || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{item.name}</DialogTitle>
        </DialogHeader>

        {item.image_url && (
          <div className="rounded-xl overflow-hidden aspect-video bg-muted">
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          </div>
        )}

        {!item.image_url && (
          <div className="rounded-xl aspect-video bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
            {isCoin ? <Coins className="w-16 h-16 text-primary/30" /> : <Banknote className="w-16 h-16 text-primary/30" />}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-2">
          <Detail label="Pays" value={item.country} />
          <Detail label="Année" value={item.year} />
          <Detail label="Dénomination" value={item.denomination} />
          <Detail label="État" value={item.condition} />
          <Detail label="Rareté" value={rarityLabels[item.rarity] || item.rarity} />
          {isCoin && <Detail label="Métal" value={item.metal} />}
          {!isCoin && <Detail label="N° de série" value={item.serial_number} />}
          <Detail label="Catégorie" value={item.category?.replace(/_/g, ' ')} />
        </div>

        <div className="bg-muted/50 rounded-xl p-4 mt-2 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground font-body">Achat</p>
            <p className="font-heading font-bold text-lg">
              {item.purchase_price ? `${item.purchase_price.toLocaleString('fr-FR')} €` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body">Estimée</p>
            <p className="font-heading font-bold text-lg text-primary">
              {item.estimated_value ? `${item.estimated_value.toLocaleString('fr-FR')} €` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body">+/- Value</p>
            <p className={`font-heading font-bold text-lg flex items-center justify-center gap-1 ${gain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {gain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {gain >= 0 ? '+' : ''}{gain.toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>

        {item.notes && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground font-body mb-1">Notes</p>
            <p className="text-sm font-body text-foreground">{item.notes}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => { onDelete(item); onOpenChange(false); }}>
            <Trash2 className="w-4 h-4 mr-1" /> Supprimer
          </Button>
          <Button size="sm" onClick={() => { onEdit(item); onOpenChange(false); }}>
            <Pencil className="w-4 h-4 mr-1" /> Modifier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground font-body">{label}</p>
      <p className="text-sm font-body font-medium capitalize">{value}</p>
    </div>
  );
}