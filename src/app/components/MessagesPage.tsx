import { useState, useRef, useEffect } from "react";
import {
  MOCK_CONVERSATIONS, MOCK_MARKET_LISTINGS,
  type Conversation, type ChatMessage, type Offer, type MarketListing,
} from "../lib/mock-data";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Send, HandCoins, Clock, Truck, MessageCircle, Store,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>(
    MOCK_CONVERSATIONS.length > 0 ? MOCK_CONVERSATIONS[0].id : null
  );
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Offer modal
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [offerShipping, setOfferShipping] = useState("correos");
  const [offerExpiry, setOfferExpiry] = useState("48h");

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeListing = activeConv
    ? MOCK_MARKET_LISTINGS.find((l) => l.id === activeConv.listingId) || null
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages.length]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeConvId) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      senderName: "Tu",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
      type: "text",
    };
    setConversations((convs) =>
      convs.map((c) =>
        c.id === activeConvId ? { ...c, messages: [...c.messages, msg], lastMessage: newMessage, lastMessageTime: "Ahora" } : c
      )
    );
    setNewMessage("");
  };

  const handleMakeOffer = () => {
    if (!offerAmount || !activeConvId) return;
    const offer: Offer = {
      id: `o-${Date.now()}`,
      amount: parseFloat(offerAmount),
      note: offerNote,
      expiry: offerExpiry,
      shippingMethod: offerShipping === "correos" ? "Correos Express" : offerShipping === "mano" ? "En mano" : "Mensajeria",
      status: "pending",
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };
    const sysMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      senderId: "system",
      senderName: "SILE",
      text: `Oferta enviada: ${offer.amount}\u20AC`,
      timestamp: offer.timestamp,
      isOwn: false,
      type: "system",
    };
    const offerMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      senderName: "Tu",
      text: `Oferta: ${offer.amount}\u20AC`,
      timestamp: offer.timestamp,
      isOwn: true,
      type: "offer",
      offer,
    };
    setConversations((convs) =>
      convs.map((c) =>
        c.id === activeConvId ? { ...c, messages: [...c.messages, sysMsg, offerMsg], lastMessage: `Oferta: ${offer.amount}\u20AC`, lastMessageTime: "Ahora" } : c
      )
    );
    setShowOfferModal(false);
    setOfferAmount("");
    setOfferNote("");
    toast.success("Oferta enviada correctamente");
  };

  const navigate = useNavigate();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
        <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
        <p style={{ fontSize: "0.9rem" }}>No tienes conversaciones</p>
        <p style={{ fontSize: "0.8rem" }} className="mt-1">Contacta con un vendedor en el Marketplace</p>
        <Button variant="outline" className="mt-4 gap-1.5" onClick={() => navigate("/marketplace")}>
          <Store className="w-4 h-4" /> Ir al Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-57px)] flex flex-col md:flex-row">
      {/* Conversation list */}
      <div className="hidden md:flex flex-col w-72 border-r border-border bg-card shrink-0">
        <div className="p-3 border-b border-border">
          <h2 className="text-foreground" style={{ fontSize: "0.9rem" }}>Mensajes</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button key={conv.id} onClick={() => setActiveConvId(conv.id)}
              className={`w-full text-left p-3 border-b border-border hover:bg-accent/50 transition-colors ${activeConvId === conv.id ? "bg-accent/50" : ""}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
                  <ImageWithFallback src={conv.listingImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontSize: "0.8rem" }}>{conv.listingName}</p>
                  <p className="text-muted-foreground truncate" style={{ fontSize: "0.7rem" }}>{conv.participantName}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-muted-foreground" style={{ fontSize: "0.6rem" }}>{conv.lastMessageTime}</span>
                  {conv.unread > 0 && <Badge className="w-5 h-5 flex items-center justify-center p-0 text-[0.55rem] bg-[#9CFF49] text-[#0a0a0a]">{conv.unread}</Badge>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: simple conv list if no active */}
      {!activeConv && (
        <div className="md:hidden flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button key={conv.id} onClick={() => setActiveConvId(conv.id)}
              className="w-full text-left p-3 border-b border-border hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
                  <ImageWithFallback src={conv.listingImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontSize: "0.8rem" }}>{conv.listingName}</p>
                  <p className="text-muted-foreground truncate" style={{ fontSize: "0.7rem" }}>{conv.participantName} · {conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && <Badge className="bg-[#9CFF49] text-[#0a0a0a]">{conv.unread}</Badge>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Chat area */}
      {activeConv && (
        <div className="flex-1 flex flex-col bg-background">
          {/* Header with product info */}
          <div className="border-b border-border bg-card">
            <div className="flex items-center gap-3 p-3">
              <button onClick={() => setActiveConvId(null)} className="md:hidden text-muted-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
                <ImageWithFallback src={activeConv.listingImage} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground truncate" style={{ fontSize: "0.85rem" }}>{activeConv.listingName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[#9CFF49]" style={{ fontSize: "0.85rem" }}>{activeConv.listingPrice}&euro;</span>
                  {activeListing && (
                    <Badge variant="secondary" className="text-[0.55rem]">{activeListing.condition}</Badge>
                  )}
                  <span className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>&middot; {activeConv.participantName}</span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowOfferModal(true)}
                className="gap-1.5 shrink-0 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]"
              >
                <HandCoins className="w-4 h-4" />
                <span className="hidden sm:inline" style={{ fontSize: "0.8rem" }}>Hacer oferta</span>
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {activeConv.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p style={{ fontSize: "0.8rem" }}>Envia un mensaje o haz una oferta para empezar</p>
              </div>
            )}
            {activeConv.messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === "system" ? (
                  <div className="flex justify-center my-2">
                    <span className="px-3 py-1 rounded-full bg-secondary/50 text-muted-foreground" style={{ fontSize: "0.7rem" }}>
                      {msg.text}
                    </span>
                  </div>
                ) : (
                  <div className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                    {msg.type === "offer" && msg.offer ? (
                      <div className={`max-w-[80%] p-3 rounded-xl border ${
                        msg.offer.status === "accepted" ? "border-[#9CFF49]/30 bg-[#9CFF49]/5" :
                        msg.offer.status === "rejected" ? "border-destructive/30 bg-destructive/5" :
                        "border-amber-500/30 bg-amber-500/5"
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <HandCoins className="w-4 h-4 text-amber-500" />
                          <span style={{ fontSize: "0.8rem" }} className="text-foreground">
                            {msg.isOwn ? "Tu oferta" : `Oferta de ${msg.senderName}`}
                          </span>
                        </div>
                        <p style={{ fontSize: "1.2rem" }} className="text-foreground">{msg.offer.amount}&euro;</p>
                        {msg.offer.note && <p className="text-muted-foreground mt-1" style={{ fontSize: "0.7rem" }}>{msg.offer.note}</p>}
                        <div className="flex items-center gap-3 mt-2 text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                          <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{msg.offer.shippingMethod}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{msg.offer.expiry}</span>
                        </div>
                        <Badge
                          className={`mt-2 text-[0.6rem] ${
                            msg.offer.status === "accepted" ? "bg-[#9CFF49] text-[#0a0a0a]" : ""
                          }`}
                          variant={msg.offer.status === "accepted" ? "default" : "secondary"}
                        >
                          {msg.offer.status === "pending" ? "Pendiente" : msg.offer.status === "accepted" ? "Aceptada" : msg.offer.status === "rejected" ? "Rechazada" : "Expirada"}
                        </Badge>
                      </div>
                    ) : (
                      <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl ${
                        msg.isOwn ? "bg-[#9CFF49] text-[#0a0a0a] rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"
                      }`}>
                        <p style={{ fontSize: "0.85rem" }}>{msg.text}</p>
                        <p className={`mt-0.5 ${msg.isOwn ? "text-[#0a0a0a]/50" : "text-muted-foreground"}`} style={{ fontSize: "0.6rem" }}>{msg.timestamp}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setShowOfferModal(true)} className="shrink-0">
                <HandCoins className="w-4 h-4" />
              </Button>
              <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe un mensaje..." className="bg-secondary/50" />
              <Button onClick={handleSend} size="icon" disabled={!newMessage.trim()} className="bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Make Offer Modal ─── */}
      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandCoins className="w-5 h-5" /> Hacer oferta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {activeConv && (
              <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
                  <ImageWithFallback src={activeConv.listingImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-foreground" style={{ fontSize: "0.8rem" }}>{activeConv.listingName}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>Precio: {activeConv.listingPrice}&euro;</p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label style={{ fontSize: "0.8rem" }}>Tu precio propuesto (&euro;) *</Label>
              <Input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="0.00" className="bg-secondary/50" />
            </div>

            <div className="space-y-1.5">
              <Label style={{ fontSize: "0.8rem" }}>Nota (opcional)</Label>
              <Textarea value={offerNote} onChange={(e) => setOfferNote(e.target.value)}
                placeholder="Ej: Recojo en mano si es en Madrid" className="bg-secondary/50 min-h-[60px]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label style={{ fontSize: "0.8rem" }}>Envio / Entrega</Label>
                <Select value={offerShipping} onValueChange={setOfferShipping}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="correos">Correos Express</SelectItem>
                    <SelectItem value="mensajeria">Mensajeria privada</SelectItem>
                    <SelectItem value="mano">En mano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label style={{ fontSize: "0.8rem" }}>Expiracion</Label>
                <Select value={offerExpiry} onValueChange={setOfferExpiry}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="48h">48 horas</SelectItem>
                    <SelectItem value="7d">7 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleMakeOffer} className="w-full bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]" disabled={!offerAmount}>
              Enviar oferta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}