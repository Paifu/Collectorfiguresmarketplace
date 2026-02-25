import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { OnboardingModal } from "./OnboardingModal";
import {
  LayoutDashboard, Store, Sun, Moon, Layers, Menu, X, LogOut, Settings,
  ChevronDown, Plus, MessageCircle, FolderOpen, Search,
  Heart, Users, Tag, Bell, User, Package,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useState, useEffect, useRef } from "react";
import { MOCK_CONVERSATIONS, MOCK_NOTIFICATIONS, searchAutocomplete } from "../lib/mock-data";

type SearchScope = "collection" | "marketplace" | "wishlist";

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<SearchScope>("collection");
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadMessages = MOCK_CONVERSATIONS.reduce((s, c) => s + c.unread, 0);
  const unreadNotifications = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowScopeDropdown(false);
        setShowSearchResults(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const handleLogout = () => { logout(); navigate("/"); };
  const userInitial = user.avatar || user.name.charAt(0).toUpperCase();

  const scopeLabels: Record<SearchScope, string> = {
    collection: "Mi coleccion",
    marketplace: "Marketplace",
    wishlist: "Wishlist",
  };

  const searchResults = searchQuery.length >= 2 ? searchAutocomplete(searchQuery) : [];

  // Sidebar nav items — flat list, no theme toggle, no user block
  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", section: "COLLECTION" },
    { to: "/my-figures", icon: Package, label: "Mis figuras", section: "COLLECTION" },
    { to: "/dashboard", icon: FolderOpen, label: "Categorias", section: "COLLECTION", isCategories: true },
    { to: "/marketplace", icon: Store, label: "Marketplace", section: "MARKET" },
    { to: "/my-sales", icon: Tag, label: "Mis ventas", section: "MARKET" },
    { to: "/wishlist", icon: Heart, label: "Wishlist", section: "MARKET" },
    { to: "/followed-users", icon: Users, label: "Usuarios seguidos", section: "SOCIAL" },
    { to: "/messages", icon: MessageCircle, label: "Mensajes", section: "SOCIAL", badge: unreadMessages },
  ];

  const sections = ["COLLECTION", "MARKET", "SOCIAL"] as const;

  const renderNavItem = (item: typeof navItems[0], closeMobile?: () => void) => (
    <NavLink
      key={item.label}
      to={item.to}
      className={({ isActive }) => {
        const active = item.isCategories
          ? location.pathname.startsWith("/category")
          : isActive && !item.isCategories && location.pathname === item.to;
        return `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50 ${
          active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        }`;
      }}
      onClick={(e) => {
        if (item.isCategories) {
          e.preventDefault();
          navigate("/dashboard", { state: { scrollToCategories: true } });
        }
        closeMobile?.();
      }}
    >
      <item.icon className="w-[18px] h-[18px]" />
      <span style={{ fontSize: "0.85rem" }}>{item.label}</span>
      {item.badge && item.badge > 0 && (
        <Badge className="ml-auto w-5 h-5 flex items-center justify-center p-0 text-[0.55rem] bg-[#9CFF49] text-[#0a0a0a]">
          {item.badge}
        </Badge>
      )}
    </NavLink>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <OnboardingModal />

      {/* ─── Sidebar Desktop ─── */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card px-3 py-5 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#9CFF49] flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#0a0a0a]" />
          </div>
          <span className="tracking-[0.2em] text-foreground" style={{ fontSize: "1rem" }}>SILE</span>
          {user.isDemo && (
            <Badge variant="secondary" className="text-[0.55rem] px-1.5 py-0 ml-auto">DEMO</Badge>
          )}
        </div>

        {/* Navigation sections */}
        {sections.map((section) => (
          <div key={section} className="mb-4">
            <div className="mb-1 px-3">
              <span className="text-muted-foreground tracking-wider" style={{ fontSize: "0.6rem" }}>{section}</span>
            </div>
            <nav className="space-y-0.5">
              {navItems.filter((i) => i.section === section).map((item) => renderNavItem(item))}
            </nav>
          </div>
        ))}
      </aside>

      {/* ─── Mobile Header ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#9CFF49] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-[#0a0a0a]" />
          </div>
          <span className="tracking-[0.2em] text-foreground" style={{ fontSize: "0.9rem" }}>SILE</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/add")} className="w-7 h-7 rounded-lg bg-[#9CFF49] flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-[#0a0a0a]" />
          </button>
          <button onClick={() => navigate("/notifications")} className="relative text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#9CFF49] text-[#0a0a0a] flex items-center justify-center" style={{ fontSize: "0.5rem" }}>{unreadNotifications}</span>
            )}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-card pt-16 px-4 overflow-y-auto">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              <p className="text-muted-foreground tracking-wider px-3 mb-1" style={{ fontSize: "0.6rem" }}>{section}</p>
              <nav className="space-y-0.5">
                {navItems.filter((i) => i.section === section).map((item) => renderNavItem(item, () => setMobileOpen(false)))}
              </nav>
            </div>
          ))}
          <div className="mt-4 space-y-1 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => { navigate("/profile"); setMobileOpen(false); }} className="w-full justify-start gap-3 text-muted-foreground">
              <User className="w-4 h-4" /> Perfil
            </Button>
            <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-3 text-muted-foreground">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-muted-foreground">
              <LogOut className="w-4 h-4" /> Cerrar sesion
            </Button>
          </div>
        </div>
      )}

      {/* ─── Main content with top bar ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (desktop) */}
        <header className="hidden md:flex items-center gap-3 px-6 py-3 border-b border-border bg-card shrink-0">
          {/* Search */}
          <div ref={searchRef} className="flex-1 max-w-xl relative">
            <div className="flex items-center bg-secondary/50 rounded-lg border border-transparent focus-within:border-[#9CFF49]/30 transition-colors">
              <Search className="w-4 h-4 text-muted-foreground ml-3 shrink-0" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(e.target.value.length >= 2); }}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                placeholder="Buscar figuras..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-9"
              />
              <button
                onClick={() => setShowScopeDropdown(!showScopeDropdown)}
                className="flex items-center gap-1 px-3 py-1 mr-1 rounded-md bg-accent/50 hover:bg-accent text-muted-foreground shrink-0 transition-colors"
                style={{ fontSize: "0.7rem" }}
              >
                {scopeLabels[searchScope]}
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            {showScopeDropdown && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-30 overflow-hidden">
                {(Object.keys(scopeLabels) as SearchScope[]).map((scope) => (
                  <button key={scope}
                    onClick={() => { setSearchScope(scope); setShowScopeDropdown(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors ${searchScope === scope ? "text-[#9CFF49]" : "text-foreground"}`}
                    style={{ fontSize: "0.8rem" }}>
                    {scopeLabels[scope]}
                  </button>
                ))}
              </div>
            )}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-30 overflow-hidden">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => { setShowSearchResults(false); setSearchQuery(""); }}
                    className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border last:border-0">
                    <p className="text-foreground" style={{ fontSize: "0.8rem" }}>{r.name}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>{r.brand} &middot; {r.line} &middot; {r.category}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button onClick={() => navigate("/notifications")} className="relative text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50 rounded-md p-1">
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#9CFF49] text-[#0a0a0a] flex items-center justify-center" style={{ fontSize: "0.55rem" }}>{unreadNotifications}</span>
            )}
          </button>

          {/* Messages */}
          <button onClick={() => navigate("/messages")} className="relative text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50 rounded-md p-1">
            <MessageCircle className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#9CFF49] text-[#0a0a0a] flex items-center justify-center" style={{ fontSize: "0.55rem" }}>{unreadMessages}</span>
            )}
          </button>

          {/* Avatar dropdown (profile, theme, logout) */}
          <div ref={avatarRef} className="relative">
            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              className="w-8 h-8 rounded-full bg-[#9CFF49]/15 flex items-center justify-center hover:bg-[#9CFF49]/25 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50"
            >
              <span className="text-[#9CFF49]" style={{ fontSize: "0.7rem" }}>{userInitial}</span>
            </button>
            {avatarOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-card border border-border rounded-lg shadow-xl z-40 overflow-hidden">
                <div className="px-3 py-2.5 border-b border-border">
                  <p className="text-foreground truncate" style={{ fontSize: "0.8rem" }}>{user.name}</p>
                  <p className="text-muted-foreground truncate" style={{ fontSize: "0.65rem" }}>{user.email}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { navigate("/profile"); setAvatarOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    <User className="w-4 h-4" />
                    <span style={{ fontSize: "0.8rem" }}>Perfil</span>
                  </button>
                  <button onClick={() => { navigate("/profile"); setAvatarOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    <Settings className="w-4 h-4" />
                    <span style={{ fontSize: "0.8rem" }}>Configuracion</span>
                  </button>
                  <button onClick={() => { toggleTheme(); setAvatarOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span style={{ fontSize: "0.8rem" }}>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
                  </button>
                </div>
                <div className="border-t border-border py-1">
                  <button onClick={() => { handleLogout(); setAvatarOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-red-400 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span style={{ fontSize: "0.8rem" }}>Cerrar sesion</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Figure CTA — always visible, far right */}
          <button
            onClick={() => navigate("/add")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e] active:bg-[#7dd635] transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#9CFF49]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Plus className="w-4 h-4" />
            <span style={{ fontSize: "0.8rem" }}>Anadir figura</span>
          </button>
        </header>

        <main className="flex-1 overflow-auto md:pt-0 pt-14">
          <Outlet />
        </main>
      </div>
    </div>
  );
}