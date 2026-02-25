import { useState } from "react";
import { MOCK_FOLLOWED_USERS, type FollowedUser } from "../lib/mock-data";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { UserMinus, ShoppingBag, Package, ExternalLink, Store } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function FollowedUsersPage() {
  const [users, setUsers] = useState<FollowedUser[]>(MOCK_FOLLOWED_USERS);
  const navigate = useNavigate();

  const unfollow = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.info("Usuario dejado de seguir");
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-foreground">Usuarios seguidos</h1>
        <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
          Mantente al dia con los vendedores que te interesan
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-3.5">
            <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Siguiendo</p>
            <p className="text-foreground" style={{ fontSize: "1.4rem" }}>{users.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3.5">
            <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Con novedades</p>
            <p className="text-[#9CFF49]" style={{ fontSize: "1.4rem" }}>
              {users.filter((u) => u.hasNewListings || u.hasNewSales).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3.5">
            <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Productos totales</p>
            <p className="text-foreground" style={{ fontSize: "1.4rem" }}>
              {users.reduce((s, u) => s + u.totalListings, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users list */}
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="bg-card border-border">
            <CardContent className="p-4 space-y-4">
              {/* User header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#9CFF49]/15 flex items-center justify-center shrink-0">
                    <span className="text-[#9CFF49]" style={{ fontSize: "0.75rem" }}>{user.avatar}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-foreground" style={{ fontSize: "0.9rem" }}>{user.name}</p>
                      {user.hasNewListings && (
                        <Badge className="bg-[#9CFF49] text-[#0a0a0a] text-[0.55rem] px-1.5 py-0">Nuevo</Badge>
                      )}
                      {user.hasNewSales && (
                        <Badge variant="secondary" className="text-[0.55rem] px-1.5 py-0 gap-0.5">
                          <ShoppingBag className="w-2.5 h-2.5" /> Venta
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                      {user.totalListings} productos &middot; Siguiendo desde {new Date(user.followedAt).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-red-400 gap-1.5"
                  onClick={() => unfollow(user.id)}
                  style={{ fontSize: "0.75rem" }}
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dejar de seguir</span>
                </Button>
              </div>

              {/* Recent listings */}
              {user.recentListings.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2" style={{ fontSize: "0.7rem" }}>
                    Ultimos productos publicados
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {user.recentListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-secondary shrink-0">
                          <ImageWithFallback src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground truncate" style={{ fontSize: "0.8rem" }}>{listing.name}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                            {listing.price}&euro; &middot; {new Date(listing.postedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="w-10 h-10 mb-3 opacity-30" />
            <p>No sigues a ningun usuario</p>
            <p style={{ fontSize: "0.8rem" }} className="mt-1">Sigue vendedores desde el Marketplace para recibir novedades</p>
            <Button variant="outline" className="mt-4 gap-1.5" onClick={() => navigate("/marketplace")}>
              <Store className="w-4 h-4" /> Ir al Marketplace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}