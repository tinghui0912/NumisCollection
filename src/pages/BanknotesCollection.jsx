import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Banknote } from "lucide-react";
import { motion } from "framer-motion";
import ItemCard from "@/components/collection/ItemCard";
import ItemFormDialog from "@/components/collection/ItemFormDialog";
import ItemDetailDialog from "@/components/collection/ItemDetailDialog";
import CollectionFilters from "@/components/collection/CollectionFilters";
import EmptyState from "@/components/collection/EmptyState";

const conditions = ["NEUF", "SPL", "TTB", "TB", "B", "AB"];

export default function BanknotesCollection() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("all");
  const [rarity, setRarity] = useState("all");

  const { data: banknotes = [], isLoading } = useQuery({
    queryKey: ["banknotes"],
    queryFn: () => base44.entities.Banknote.list("-created_date"),
  });

  const filtered = banknotes.filter(b => {
    const matchSearch = !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.country?.toLowerCase().includes(search.toLowerCase()) || b.denomination?.toLowerCase().includes(search.toLowerCase());
    const matchCondition = condition === "all" || b.condition === condition;
    const matchRarity = rarity === "all" || b.rarity === rarity;
    return matchSearch && matchCondition && matchRarity;
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["banknotes"] });

  const handleDelete = async (item) => {
    await base44.entities.Banknote.delete(item.id);
    refresh();
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Billets de banque</h1>
          <p className="text-muted-foreground font-body mt-1">{banknotes.length} billet{banknotes.length > 1 ? 's' : ''} dans votre collection</p>
        </div>
        <Button onClick={() => { setEditItem(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter un billet
        </Button>
      </motion.div>

      <CollectionFilters
        search={search} onSearchChange={setSearch}
        condition={condition} onConditionChange={setCondition}
        rarity={rarity} onRarityChange={setRarity}
        conditions={conditions}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/50 animate-pulse">
              <div className="aspect-[4/3] bg-muted rounded-t-2xl" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title={search || condition !== "all" || rarity !== "all" ? "Aucun résultat" : "Aucun billet"}
          description={search || condition !== "all" || rarity !== "all" ? "Essayez de modifier vos filtres" : "Commencez à ajouter des billets à votre collection"}
          onAdd={!(search || condition !== "all" || rarity !== "all") ? () => setShowForm(true) : null}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((note, i) => (
            <ItemCard
              key={note.id}
              item={note}
              type="banknote"
              index={i}
              onClick={() => { setSelectedItem(note); setShowDetail(true); }}
            />
          ))}
        </div>
      )}

      <ItemFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        type="banknote"
        item={editItem}
        onSaved={refresh}
      />
      <ItemDetailDialog
        open={showDetail}
        onOpenChange={setShowDetail}
        item={selectedItem}
        type="banknote"
        onEdit={(item) => { setEditItem(item); setShowForm(true); }}
        onDelete={handleDelete}
      />
    </div>
  );
}