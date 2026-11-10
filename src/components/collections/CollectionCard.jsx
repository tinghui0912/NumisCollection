import { motion } from "framer-motion";
import { Coins, Banknote, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const themeLabels = {
  periode: "Période historique",
  pays: "Pays",
  metal: "Métal",
  denomination: "Dénomination",
  libre: "Libre",
};

const DEFAULT_COLOR = "#b87a28";

export default function CollectionCard({ collection, coins, banknotes, index, onEdit, onDelete, onClick }) {
  const coinCount = (collection.coin_ids || []).filter(id => coins.find(c => c.id === id)).length;
  const noteCount = (collection.banknote_ids || []).filter(id => banknotes.find(b => b.id === id)).length;
  const color = collection.color || DEFAULT_COLOR;

  const totalValue = [
    ...(collection.coin_ids || []).map(id => coins.find(c => c.id === id)).filter(Boolean),
    ...(collection.banknote_ids || []).map(id => banknotes.find(b => b.id === id)).filter(Boolean),
  ].reduce((s, i) => s + (i.estimated_value || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Color band */}
      <div className="h-2 w-full" style={{ backgroundColor: color }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-foreground truncate">{collection.name}</h3>
            {collection.theme && (
              <span className="text-xs font-body px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: color + "20", color }}>
                {themeLabels[collection.theme] || collection.theme}
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={e => { e.stopPropagation(); onEdit(collection); }}>
                <Pencil className="w-4 h-4 mr-2" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={e => { e.stopPropagation(); onDelete(collection.id); }} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {collection.description && (
          <p className="text-xs text-muted-foreground font-body mt-2 line-clamp-2">{collection.description}</p>
        )}

        <div className="flex items-center gap-4 mt-4">
          <span className="flex items-center gap-1.5 text-sm font-body text-muted-foreground">
            <Coins className="w-4 h-4" /> {coinCount} pièce{coinCount > 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-body text-muted-foreground">
            <Banknote className="w-4 h-4" /> {noteCount} billet{noteCount > 1 ? "s" : ""}
          </span>
        </div>

        {totalValue > 0 && (
          <p className="mt-2 font-heading font-bold text-sm" style={{ color }}>
            {totalValue.toLocaleString("fr-FR")} €
          </p>
        )}
      </div>
    </motion.div>
  );
}