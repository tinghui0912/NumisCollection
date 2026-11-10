import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Check } from "lucide-react";

export default function NumistaImagePicker({ name, year, category, onSelectImage }) {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);

  const handleSearch = async () => {
    setSearching(true);
    setResults(null);
    const res = await base44.functions.invoke("numistaSearch", {
      action: "search",
      query: name || "",
      year: year ? String(year) : undefined,
      category,
      lang: "fr",
    });
    setResults(res.data?.types || []);
    setSearching(false);
  };

  const pickImage = (url, typeId) => {
    setSelected(typeId);
    onSelectImage(url);
  };



  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <span className="text-xs text-muted-foreground font-body">Rechercher sur Numista :</span>
        <Button type="button" size="sm" variant="outline" onClick={handleSearch} disabled={searching} className="gap-2 h-8 text-xs">
          {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          {searching ? "Recherche..." : "Trouver l'image"}
        </Button>
      </div>

      {results && results.length === 0 && (
        <p className="text-xs text-muted-foreground font-body">Aucun résultat Numista.</p>
      )}

      {results && results.length > 0 && (
        <div className="flex flex-wrap gap-3 max-h-52 overflow-y-auto pr-1">
          {results.slice(0, 10).map(type => (
            <div key={type.id} className="space-y-1">
              <p className="text-xs text-muted-foreground font-body truncate max-w-[110px]">{type.min_year}{type.max_year !== type.min_year ? `–${type.max_year}` : ""}</p>
              <div className="flex gap-1">
                {type.obverse_thumbnail && (
                  <button
                    type="button"
                    onClick={() => pickImage(type.obverse_thumbnail, type.id + "_o")}
                    className={`relative rounded-lg overflow-hidden border-2 transition-colors ${selected === type.id + "_o" ? "border-primary" : "border-border hover:border-primary/50"}`}
                  >
                    <img src={type.obverse_thumbnail} alt="Avers" className="w-14 h-14 object-cover" />
                    {selected === type.id + "_o" && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <span className="absolute bottom-0 left-0 right-0 text-[9px] bg-black/50 text-white text-center py-0.5">Avers</span>
                  </button>
                )}
                {type.reverse_thumbnail && (
                  <button
                    type="button"
                    onClick={() => pickImage(type.reverse_thumbnail, type.id + "_r")}
                    className={`relative rounded-lg overflow-hidden border-2 transition-colors ${selected === type.id + "_r" ? "border-primary" : "border-border hover:border-primary/50"}`}
                  >
                    <img src={type.reverse_thumbnail} alt="Revers" className="w-14 h-14 object-cover" />
                    {selected === type.id + "_r" && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <span className="absolute bottom-0 left-0 right-0 text-[9px] bg-black/50 text-white text-center py-0.5">Revers</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-body truncate max-w-[110px]">{type.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}