import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Trash2, Loader2, BellOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function PriceAlerts() {
  const [user, setUser] = useState(null);
  const [newThreshold, setNewThreshold] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setNewEmail(u?.email || "");
    });
  }, []);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["priceAlerts"],
    queryFn: () => base44.entities.PriceAlert.list("-created_date"),
  });

  const handleAdd = async () => {
    if (!newThreshold || !newEmail) return;
    setAdding(true);
    await base44.entities.PriceAlert.create({
      threshold: parseFloat(newThreshold),
      email: newEmail,
      active: true,
    });
    queryClient.invalidateQueries({ queryKey: ["priceAlerts"] });
    setNewThreshold("");
    setAdding(false);
    toast({ title: "Alerte créée", description: `Vous serez notifié quand une pièce dépasse ${parseFloat(newThreshold).toLocaleString('fr-FR')} €.` });
  };

  const handleToggle = async (alert) => {
    await base44.entities.PriceAlert.update(alert.id, { active: !alert.active });
    queryClient.invalidateQueries({ queryKey: ["priceAlerts"] });
  };

  const handleDelete = async (id) => {
    await base44.entities.PriceAlert.delete(id);
    queryClient.invalidateQueries({ queryKey: ["priceAlerts"] });
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-foreground">Alertes de prix</h1>
        <p className="text-muted-foreground font-body mt-1">
          Recevez un e-mail automatique quand la valeur estimée d'une pièce dépasse un seuil.
        </p>
      </motion.div>

      {/* Add new alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border/50 p-6 space-y-4"
      >
        <h2 className="font-heading text-lg font-semibold">Nouvelle alerte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="font-body text-sm">Seuil de valeur (€)</Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={newThreshold}
              onChange={e => setNewThreshold(e.target.value)}
              placeholder="Ex: 500"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-body text-sm">E-mail de notification</Label>
            <Input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="votre@email.com"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAdd} disabled={adding || !newThreshold || !newEmail} className="gap-2">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Créer l'alerte
          </Button>
        </div>
      </motion.div>

      {/* Alerts list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="font-heading text-lg font-semibold">Mes alertes</h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 p-10 text-center">
            <BellOff className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-body text-sm">Aucune alerte configurée.</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-xl border p-4 flex items-center gap-4 ${alert.active ? "border-border/50" : "border-border/30 opacity-60"}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${alert.active ? "bg-primary/10" : "bg-muted"}`}>
                <Bell className={`w-5 h-5 ${alert.active ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-foreground">
                  Seuil : {alert.threshold?.toLocaleString('fr-FR')} €
                </p>
                <p className="text-xs text-muted-foreground font-body truncate">{alert.email}</p>
                {alert.last_triggered && (
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Dernier déclenchement : {new Date(alert.last_triggered).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <Switch checked={!!alert.active} onCheckedChange={() => handleToggle(alert)} />
              <Button variant="ghost" size="icon" onClick={() => handleDelete(alert.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}