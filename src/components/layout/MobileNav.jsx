import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Coins, Banknote, User, FolderOpen } from "lucide-react";

const navItems = [
  { path: "/", label: "Accueil", icon: LayoutDashboard },
  { path: "/coins", label: "Pièces", icon: Coins },
  { path: "/banknotes", label: "Billets", icon: Banknote },
  { path: "/collections", label: "Collections", icon: FolderOpen },
  { path: "/profile", label: "Profil", icon: User },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 z-50">
      <div className="flex justify-around py-2 px-4">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-body font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}