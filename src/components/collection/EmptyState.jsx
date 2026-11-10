import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EmptyState({ icon: Icon, title, description, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="p-6 rounded-full bg-primary/5 mb-6">
        <Icon className="w-12 h-12 text-primary/40" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground font-body mb-6 max-w-md">{description}</p>
      {onAdd && (
        <Button onClick={onAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      )}
    </motion.div>
  );
}