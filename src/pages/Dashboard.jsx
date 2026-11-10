import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/collection/StatCard";
import { Coins, Banknote, TrendingUp, Package, ArrowRight, FileDown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const COLORS = ["hsl(36,70%,45%)", "hsl(160,45%,40%)", "hsl(210,40%,45%)", "hsl(280,40%,50%)", "hsl(0,55%,50%)"];

export default function Dashboard() {
  const { data: coins = [] } = useQuery({
    queryKey: ["coins"],
    queryFn: () => base44.entities.Coin.list(),
  });
  const { data: banknotes = [] } = useQuery({
    queryKey: ["banknotes"],
    queryFn: () => base44.entities.Banknote.list(),
  });

  const totalItems = coins.length + banknotes.length;
  const totalValue = [...coins, ...banknotes].reduce((sum, i) => sum + (i.estimated_value || 0), 0);
  const totalInvested = [...coins, ...banknotes].reduce((sum, i) => sum + (i.purchase_price || 0), 0);
  const totalGain = totalValue - totalInvested;

  const [chartMode, setChartMode] = useState("country"); // "country" | "type" | "category"
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportPDF = async () => {
    setExportingPDF(true);
    const response = await base44.functions.invoke("generateCollectionPDF", {});
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "numiscollection-rapport.pdf";
    a.click();
    URL.revokeObjectURL(url);
    setExportingPDF(false);
  };

  // Country distribution
  const countryMap = {};
  [...coins, ...banknotes].forEach(item => {
    const c = item.country || "Inconnu";
    countryMap[c] = (countryMap[c] || 0) + 1;
  });
  const countryData = Object.entries(countryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Type distribution
  const typeData = [
    { name: "Pièces", value: coins.length },
    { name: "Billets", value: banknotes.length },
  ].filter(d => d.value > 0);

  // Category distribution
  const categoryLabels = {
    antique: "Antique", medievale: "Médiévale", moderne: "Moderne",
    contemporaine: "Contemp.", commemorative: "Commém.",
    anciens_francs: "Anc. Francs", nouveaux_francs: "Nouv. Francs",
    euros: "Euros", devises_etrangeres: "Devises", historique: "Historique",
  };
  const categoryMap = {};
  [...coins, ...banknotes].forEach(item => {
    if (item.category) {
      const label = categoryLabels[item.category] || item.category;
      categoryMap[label] = (categoryMap[label] || 0) + 1;
    }
  });
  const categoryData = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));

  const chartData = chartMode === "country" ? countryData : chartMode === "type" ? typeData : categoryData;

  // Top valued items
  const topItems = [...coins.map(c => ({ ...c, _type: "coin" })), ...banknotes.map(b => ({ ...b, _type: "banknote" }))]
    .filter(i => i.estimated_value)
    .sort((a, b) => b.estimated_value - a.estimated_value)
    .slice(0, 5);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground font-body mt-1">Vue d'ensemble de votre collection numismatique</p>
          </div>
          <Button onClick={handleExportPDF} disabled={exportingPDF} variant="outline" className="gap-2 shrink-0">
            {exportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Exporter en PDF
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pièces" value={coins.length} icon={Coins} delay={0.1} />
        <StatCard title="Billets" value={banknotes.length} icon={Banknote} delay={0.15} />
        <StatCard title="Valeur totale" value={`${totalValue.toLocaleString('fr-FR')} €`} icon={Package} delay={0.2} />
        <StatCard
          title="Plus-value"
          value={`${totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString('fr-FR')} €`}
          subtitle={totalInvested ? `${((totalGain / totalInvested) * 100).toFixed(1)}% de rendement` : null}
          icon={TrendingUp}
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-heading text-lg font-semibold">Répartition</h2>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {[
                { key: "country", label: "Pays" },
                { key: "type", label: "Type" },
                { key: "category", label: "Catégorie" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setChartMode(key)}
                  className={`px-3 py-1 rounded-md text-xs font-body font-medium transition-colors ${chartMode === key ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {chartData.length > 0 ? (
            chartMode === "category" ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="font-body" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(val) => [`${val} items`, "Quantité"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `${val} items`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {chartData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm font-body text-foreground truncate">{item.name}</span>
                      <span className="text-sm text-muted-foreground font-body ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <p className="text-muted-foreground font-body text-sm text-center py-10">Ajoutez des éléments pour voir la répartition</p>
          )}
        </motion.div>

        {/* Top items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-2xl border border-border/50 p-6"
        >
          <h2 className="font-heading text-lg font-semibold mb-4">Pièces les plus précieuses</h2>
          {topItems.length > 0 ? (
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-heading font-bold text-primary/60 w-6">{i + 1}</span>
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                    {item._type === "coin" ? <Coins className="w-5 h-5 text-primary/50" /> : <Banknote className="w-5 h-5 text-primary/50" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{item.country} · {item.year}</p>
                  </div>
                  <p className="font-heading font-bold text-primary">{item.estimated_value?.toLocaleString('fr-FR')} €</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground font-body text-sm text-center py-10">Aucune estimation renseignée</p>
          )}
        </motion.div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/coins" className="group">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/10 flex items-center justify-between hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <Coins className="w-8 h-8 text-primary" />
              <div>
                <p className="font-heading font-semibold text-foreground">Voir les pièces</p>
                <p className="text-sm text-muted-foreground font-body">{coins.length} pièce{coins.length > 1 ? 's' : ''} dans la collection</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </Link>
        <Link to="/banknotes" className="group">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/10 flex items-center justify-between hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <Banknote className="w-8 h-8 text-primary" />
              <div>
                <p className="font-heading font-semibold text-foreground">Voir les billets</p>
                <p className="text-sm text-muted-foreground font-body">{banknotes.length} billet{banknotes.length > 1 ? 's' : ''} dans la collection</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </Link>
      </div>
    </div>
  );
}