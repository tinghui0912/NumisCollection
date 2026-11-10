import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Coins, Banknote, TrendingUp, TrendingDown } from "lucide-react";

const conditionColors = {
  FDC: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  NEUF: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  SUP: "bg-blue-500/10 text-blue-700 border-blue-200",
  SPL: "bg-blue-500/10 text-blue-700 border-blue-200",
  TTB: "bg-amber-500/10 text-amber-700 border-amber-200",
  TB: "bg-orange-500/10 text-orange-700 border-orange-200",
  B: "bg-red-500/10 text-red-700 border-red-200",
  AB: "bg-gray-500/10 text-gray-700 border-gray-200",
};

const rarityLabels = {
  commune: "Commune",
  peu_commune: "Peu commune",
  rare: "Rare",
  tres_rare: "Très rare",
  exceptionnelle: "Exceptionnelle",
};

export default function ItemCard({ item, type = "coin", onClick, index = 0 }) {
  const isCoin = type === "coin";
  const gain = (item.estimated_value || 0) - (item.purchase_price || 0);
  const gainPercent = item.purchase_price ? ((gain / item.purchase_price) * 100).toFixed(0) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={onClick}
      className="group bg-card rounded-2xl border border-border/50 overflow-hidden cursor-pointer hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
    >
      <div className={`${isCoin ? 'aspect-square' : 'aspect-[4/3]'} bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center relative overflow-hidden`}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover object-center" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary/40">
            {isCoin ? <Coins className="w-12 h-12" /> : <Banknote className="w-12 h-12" />}
            <span className="text-xs font-body">{item.denomination}</span>
          </div>
        )}
        {item.rarity && item.rarity !== "commune" && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-xs font-body">
              {rarityLabels[item.rarity] || item.rarity}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-heading font-semibold text-foreground truncate text-lg group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground font-body">
            {item.country} · {item.year}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {item.condition && (
            <Badge variant="outline" className={`text-xs font-body ${conditionColors[item.condition] || ""}`}>
              {item.condition}
            </Badge>
          )}
          {isCoin && item.metal && (
            <span className="text-xs text-muted-foreground font-body capitalize">{item.metal}</span>
          )}
        </div>

        <div className="pt-2 border-t border-border/50 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-body">Valeur estimée</p>
            <p className="font-heading font-bold text-primary text-lg">
              {item.estimated_value ? `${item.estimated_value.toLocaleString('fr-FR')} €` : '—'}
            </p>
          </div>
          {gainPercent !== null && gain !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-body ${gain > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {gain > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {gain > 0 ? '+' : ''}{gainPercent}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}