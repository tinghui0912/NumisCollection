import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";
import CollectionCard from "@/components/collections/CollectionCard";
import CollectionFormDialog from "@/components/collections/CollectionFormDialog";
import CollectionDetailDialog from "@/components/collections/CollectionDetailDialog";

export default function Collections() {
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => base44.entities.Collection.list("-created_date"),
  });

  const { data: coins = [] } = useQuery({
    queryKey: ["coins"],
    queryFn: () => base44.entities.Coin.list(),
  });

  const { data: banknotes = [] } = useQuery({
    queryKey: ["banknotes"],
    queryFn: () => base44.entities.Banknote.list(),
  });

  const handleSaved = () => queryClient.invalidateQueries({ queryKey: ["collections"] });

  const handleEdit = (col) => { setEditItem(col); setFormOpen(true); };
  const handleDelete = async (id) => {
    await base44.entities.Collection.delete(id);
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Collections thématiques</h1>
          <p className="text-muted-foreground font-body mt-1">Organisez vos pièces et billets en collections personnalisées</p>
        </div>
        <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Nouvelle collection
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : collections.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-heading text-lg text-muted-foreground">Aucune collection créée</p>
          <p className="text-sm text-muted-foreground/60 font-body mt-1">Créez votre première collection thématique</p>
          <Button className="mt-4 gap-2" onClick={() => { setEditItem(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4" /> Créer une collection
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col, i) => (
            <CollectionCard
              key={col.id}
              collection={col}
              coins={coins}
              banknotes={banknotes}
              index={i}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={() => setDetailItem(col)}
            />
          ))}
        </div>
      )}

      <CollectionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        collection={editItem}
        coins={coins}
        banknotes={banknotes}
        onSaved={handleSaved}
      />

      {detailItem && (
        <CollectionDetailDialog
          open={!!detailItem}
          onOpenChange={(o) => !o && setDetailItem(null)}
          collection={detailItem}
          coins={coins}
          banknotes={banknotes}
          onEdit={() => { handleEdit(detailItem); setDetailItem(null); }}
        />
      )}
    </div>
  );
}