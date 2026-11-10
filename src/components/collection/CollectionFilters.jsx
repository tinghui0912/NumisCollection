import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function CollectionFilters({ search, onSearchChange, condition, onConditionChange, rarity, onRarityChange, conditions }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Rechercher..."
          className="pl-10 font-body"
        />
      </div>
      <Select value={condition} onValueChange={onConditionChange}>
        <SelectTrigger className="w-36 font-body">
          <SelectValue placeholder="État" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les états</SelectItem>
          {conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={rarity} onValueChange={onRarityChange}>
        <SelectTrigger className="w-40 font-body">
          <SelectValue placeholder="Rareté" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes raretés</SelectItem>
          <SelectItem value="commune">Commune</SelectItem>
          <SelectItem value="peu_commune">Peu commune</SelectItem>
          <SelectItem value="rare">Rare</SelectItem>
          <SelectItem value="tres_rare">Très rare</SelectItem>
          <SelectItem value="exceptionnelle">Exceptionnelle</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}