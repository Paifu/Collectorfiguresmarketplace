import { useState } from "react";
import { MOCK_NOTIFICATIONS, type AppNotification } from "../lib/mock-data";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  TrendingDown, Package, HandCoins, CheckCircle2, XCircle, Copy,
  Bell, CheckCheck, Tag,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "price_drop": return <TrendingDown className="w-4 h-4 text-[#9CFF49]" />;
      case "new_product": return <Package className="w-4 h-4 text-blue-400" />;
      case "offer_received": return <HandCoins className="w-4 h-4 text-amber-400" />;
      case "offer_accepted": return <CheckCircle2 className="w-4 h-4 text-[#9CFF49]" />;
      case "offer_rejected": return <XCircle className="w-4 h-4 text-red-400" />;
      case "duplicate_detected": return <Copy className="w-4 h-4 text-purple-400" />;
      case "sale_published": return <Tag className="w-4 h-4 text-[#9CFF49]" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date("2026-02-25T12:00:00");
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return "Hace un momento";
    if (diffH < 24) return `Hace ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return "Ayer";
    if (diffD < 7) return `Hace ${diffD} dias`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al dia"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-muted-foreground gap-1.5" style={{ fontSize: "0.8rem" }}>
            <CheckCheck className="w-4 h-4" /> Marcar todo como leido
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`bg-card border-border transition-colors cursor-pointer ${!notif.read ? "border-l-2 border-l-[#9CFF49]" : ""}`}
            onClick={() => markRead(notif.id)}
          >
            <CardContent className="p-3.5">
              <div className="flex items-start gap-3">
                {notif.image ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
                    <ImageWithFallback src={notif.image} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0">
                    {typeIcon(notif.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {typeIcon(notif.type)}
                    <p className={`${!notif.read ? "text-foreground" : "text-muted-foreground"}`} style={{ fontSize: "0.85rem" }}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-[#9CFF49] shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "0.75rem" }}>
                    {notif.message}
                  </p>
                  <p className="text-muted-foreground/60 mt-1" style={{ fontSize: "0.65rem" }}>
                    {formatTime(notif.timestamp)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p>No hay notificaciones</p>
            <p style={{ fontSize: "0.8rem" }} className="mt-1">Las notificaciones de precios, ofertas y ventas apareceran aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}