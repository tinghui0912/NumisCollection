import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Banknote, Pencil } from "lucide-react";

const themeLabels = {
  periode: "Période historique",
  pays: "Pays",
  metal: "Métal",
  denomination: "Dénomination",
  libre: "Libre",
};

export default function CollectionDetailDialog({ open, onOpenChange, collection, coins, banknotes, onEdit }) {
  const color = collection?.color || "#b87a28";

  const collectionCoins = (collection?.coin_ids || [])
    .map(id => coins.find(c => c.id === id)).filter(Boolean);
  const collectionNotes = (collection?.banknote_ids || [])
    .map(id => banknotes.find(b => b.id === id)).filter(Boolean);

  const totalValue = [...collectionCoins, ...collectionNotes].reduce((s, i) => s + (i.estimated_value || 0), 0);
  const totalInvested = [...collectionCoins, ...collectionNotes].reduce((s, i) => s + (i.purchase_price || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="h-1.5 rounded-full mb-1" style={{ backgroundColor: color }} />
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="font-heading text-2xl">{collection?.name}</DialogTitle>
              {collection?.theme && (
                <span className="text-xs font-body px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: color + "20", color }}>
                  {themeLabels[collection.theme]}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-2 shrink-0">
              <Pencil className="w-3.5 h-3.5" /> Modifier
            </Button>
          </div>
        </DialogHeader>

        {collection?.description && (
          <p className="text-sm font-body text-muted-foreground">{collection.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: "Éléments", value: collectionCoins.length + collectionNotes.length },
            { label: "Valeur estimée", value: `${totalValue.toLocaleString("fr-FR")} €` },
            { label: "Investi", value: `${totalInvested.toLocaleString("fr-FR")} €` },
          ].map(s => (
            <div key={s.label} className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground font-body">{s.label}</p>
              <p className="font-heading font-bold text-sm mt-1" style={{ color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Coins */}
        {collectionCoins.length > 0 && (
          <div className="mt-4">
            <h3 className="font-heading font-semibold text-sm mb-2 flex items-center gap-2">
              <Coins className="w-4 h-4" style={{ color }} /> Pièces ({collectionCoins.length})
            </h3>
            <div className="space-y-2">
              {collectionCoins.map(coin => (
                <div key={coin.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-body text-sm font-medium">{coin.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{coin.country} · {coin.year} · {coin.condition}</p>
                  </div>
                  {coin.estimated_value && (
                    <p className="font-heading font-bold text-sm" style={{ color }}>{coin.estimated_value.toLocaleString("fr-FR")} €</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banknotes */}
        {collectionNotes.length > 0 && (
          <div className="mt-4">
            <h3 className="font-heading font-semibold text-sm mb-2 flex items-center gap-2">
              <Banknote className="w-4 h-4" style={{ color }} /> Billets ({collectionNotes.length})
            </h3>
            <div className="space-y-2">
              {collectionNotes.map(note => (
                <div key={note.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-body text-sm font-medium">{note.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{note.country} · {note.year} · {note.condition}</p>
                  </div>
                  {note.estimated_value && (
                    <p className="font-heading font-bold text-sm" style={{ color }}>{note.estimated_value.toLocaleString("fr-FR")} €</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {collectionCoins.length === 0 && collectionNotes.length === 0 && (
          <p className="text-center text-muted-foreground font-body text-sm py-6">Aucun élément dans cette collection.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}