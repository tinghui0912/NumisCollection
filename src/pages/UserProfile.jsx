import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Coins, Banknote, TrendingUp, Loader2, Save } from "lucide-react";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);


  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: coins = [] } = useQuery({
    queryKey: ["coins"],
    queryFn: () => base44.entities.Coin.list(),
  });

  const { data: banknotes = [] } = useQuery({
    queryKey: ["banknotes"],
    queryFn: () => base44.entities.Banknote.list(),
  });

  const totalCoins = coins.length;
  const totalBanknotes = banknotes.length;
  const totalItems = totalCoins + totalBanknotes;

  const totalValue = [
    ...coins.map(c => c.estimated_value || 0),
    ...banknotes.map(b => b.estimated_value || 0),
  ].reduce((a, b) => a + b, 0);

  const totalInvested = [
    ...coins.map(c => c.purchase_price || 0),
    ...banknotes.map(b => b.purchase_price || 0),
  ].reduce((a, b) => a + b, 0);

  const gain = totalValue - totalInvested;

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ full_name: user.full_name });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-foreground">Mon profil</h1>
        <p className="text-muted-foreground font-body mt-1">Informations personnelles et statistiques</p>
      </motion.div>

      {/* Infos utilisateur */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border/50 p-6 space-y-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">{user.full_name}</p>
            <p className="text-sm text-muted-foreground font-body">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="font-body text-sm">Nom complet</Label>
            <Input
              value={user.full_name || ""}
              onChange={e => setUser({ ...user, full_name: e.target.value })}
              className="font-body"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-body text-sm">Email</Label>
            <Input value={user.email || ""} disabled className="font-body opacity-60" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? "Enregistré !" : "Enregistrer"}
          </Button>
        </div>
      </motion.div>

      {/* Statistiques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Pièces", value: totalCoins, icon: Coins },
          { label: "Billets", value: totalBanknotes, icon: Banknote },
          { label: "Total items", value: totalItems, icon: User },
          { label: "Plus-value", value: `${gain >= 0 ? '+' : ''}${gain.toLocaleString('fr-FR')} €`, icon: TrendingUp, color: gain >= 0 ? "text-emerald-600" : "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border/50 p-5 text-center">
            <div className="flex justify-center mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color || 'text-primary'}`} />
            </div>
            <p className={`font-heading text-2xl font-bold ${stat.color || 'text-foreground'}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Valeur collection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border/50 p-6"
      >
        <h2 className="font-heading text-lg font-semibold mb-4">Valeur de la collection</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground font-body mb-1">Investissement total</p>
            <p className="font-heading text-2xl font-bold text-foreground">{totalInvested.toLocaleString('fr-FR')} €</p>
          </div>
          <div className="bg-primary/5 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground font-body mb-1">Valeur estimée</p>
            <p className="font-heading text-2xl font-bold text-primary">{totalValue.toLocaleString('fr-FR')} €</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}