import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { useNavigate } from "react-router";
import { MOCK_FIGURES, MOCK_MY_SALES, MOCK_FOLLOWED_USERS } from "../lib/mock-data";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { ArrowLeft, Package, ShoppingCart, Tag, Star, Users, UserCheck, Sun, Moon, Bell, Globe, LogOut, Shield } from "lucide-react";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => { logout(); navigate("/"); };

  // Stats
  const totalFigures = MOCK_FIGURES.length;
  const totalSales = MOCK_MY_SALES.filter((s) => s.status === "sold").length;
  const totalPurchases = 12; // mock
  const avgRating = 4.7;
  const followers = 34;
  const following = MOCK_FOLLOWED_USERS.length;

  const stats = [
    { label: "Figuras", value: totalFigures, icon: Package },
    { label: "Ventas", value: totalSales, icon: Tag },
    { label: "Compras", value: totalPurchases, icon: ShoppingCart },
    { label: "Valoracion", value: avgRating, icon: Star },
    { label: "Seguidores", value: followers, icon: Users },
    { label: "Siguiendo", value: following, icon: UserCheck },
  ];

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-foreground">Mi Perfil</h1>
      </div>

      {/* User info */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#9CFF49]/15 flex items-center justify-center">
              <span className="text-[#9CFF49]" style={{ fontSize: "1.2rem" }}>
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-foreground">{user.name}</h2>
              <p className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>{user.email}</p>
              {user.isDemo && (
                <Badge variant="secondary" className="mt-2 text-[0.65rem]">Modo Demo</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <s.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-foreground" style={{ fontSize: "1.2rem" }}>{s.value}</p>
              <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preferences */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 space-y-4">
          <p className="text-foreground" style={{ fontSize: "0.9rem" }}>Preferencias</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
              <div>
                <Label style={{ fontSize: "0.85rem" }}>Tema</Label>
                <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                  {theme === "dark" ? "Modo oscuro activo" : "Modo claro activo"}
                </p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label style={{ fontSize: "0.85rem" }}>Notificaciones</Label>
                <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Ofertas y mensajes nuevos</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label style={{ fontSize: "0.85rem" }}>Idioma</Label>
                <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Espanol</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[0.7rem]">ES</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 space-y-3">
          <p className="text-foreground" style={{ fontSize: "0.9rem" }}>Cuenta</p>
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-foreground" style={{ fontSize: "0.85rem" }}>Seguridad</p>
              <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Cambiar contrasena, 2FA</p>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>Gestionar</Button>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={handleLogout} className="w-full gap-2 text-muted-foreground">
        <LogOut className="w-4 h-4" /> Cerrar sesion
      </Button>
    </div>
  );
}
