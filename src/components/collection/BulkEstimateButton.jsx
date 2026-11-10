import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function BulkEstimateButton({ coinCount, onDone }) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleStart = async () => {
    setRunning(true);
    setResult(null);
    const res = await base44.functions.invoke("bulkEstimateCoins", {});
    setResult(res.data);
    setRunning(false);
    onDone?.();
  };

  const handleOpen = () => {
    setResult(null);
    setOpen(true);
  };

  return (
    <>
      <Button variant="outline" onClick={handleOpen} className="gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Estimer toutes les valeurs
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!running) setOpen(o); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Estimation automatique par IA</DialogTitle>
          </DialogHeader>

          {!running && !result && (
            <div className="space-y-4">
              <p className="text-sm font-body text-muted-foreground">
                L'IA va estimer automatiquement la valeur de vos <strong>{coinCount}</strong> pièce{coinCount > 1 ? "s" : ""} en consultant Gadoury, CGB et Numista.
              </p>
              <p className="text-xs text-amber-600 font-body bg-amber-50 rounded-lg p-3">
                ⚠️ Cette opération peut prendre quelques minutes et utilise des crédits d'intégration.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={handleStart} className="gap-2">
                  <Sparkles className="w-4 h-4" /> Lancer
                </Button>
              </div>
            </div>
          )}

          {running && (
            <div className="flex flex-col items-center py-6 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-body text-muted-foreground text-center">
                Estimation en cours pour {coinCount} pièce{coinCount > 1 ? "s" : ""}…<br />
                <span className="text-xs">Veuillez patienter</span>
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-body font-medium text-sm">{result.updated} pièce{result.updated > 1 ? "s" : ""} mise{result.updated > 1 ? "s" : ""} à jour</p>
                  {result.failed > 0 && (
                    <p className="text-xs text-muted-foreground font-body">{result.failed} pièce{result.failed > 1 ? "s" : ""} sans estimation</p>
                  )}
                </div>
              </div>
              {result.details?.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {result.details.map(d => (
                    <div key={d.id} className="flex justify-between items-center px-3 py-1.5 rounded-lg hover:bg-muted/30 text-sm font-body">
                      <span className="truncate text-foreground">{d.name}</span>
                      <span className="font-heading font-bold text-primary ml-3 flex-shrink-0">{d.value.toLocaleString('fr-FR')} €</span>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full" onClick={() => setOpen(false)}>Fermer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}