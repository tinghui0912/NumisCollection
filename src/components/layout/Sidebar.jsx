import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Coins, Banknote, LogOut, User, Sparkles, Bell, FolderOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { path: "/coins", label: "Pièces", icon: Coins },
  { path: "/banknotes", label: "Billets", icon: Banknote },
  { path: "/collections", label: "Collections", icon: FolderOpen },
  { path: "/estimation", label: "Estimation IA", icon: Sparkles },
  { path: "/alerts", label: "Alertes de prix", icon: Bell },
  { path: "/profile", label: "Mon profil", icon: User },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-card border-r border-border/50 p-6">
      <div className="mb-10">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          <span className="text-primary">Numis</span>Collection
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Gestion de collection</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="block relative">
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-colors ${active ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => base44.auth.logout()}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Déconnexion
      </button>
    </aside>
  );
}