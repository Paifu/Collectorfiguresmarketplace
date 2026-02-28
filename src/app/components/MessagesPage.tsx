import { useState, useRef, useEffect } from "react";
import {
  MOCK_CONVERSATIONS,
  MOCK_MARKET_LISTINGS,
  type Conversation,
  type ChatMessage,
  type Offer,
} from "../lib/mock-data";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Send, HandCoins, Clock, Truck, MessageCircle, Store } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    if (activeConvId) return;
    if (conversations.length === 0) return;
    setActiveConvId(conversations[0].id);
  }, [isDesktop, conversations, activeConvId]);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [offerShipping, setOfferShipping] = useState("correos");
  const [offerExpiry, setOfferExpiry] = useState("48h");

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;
  const activeListing = activeConv
    ? MOCK_MARKET_LISTINGS.find((l) => l.id === activeConv.listingId) || null
    : null;

  useEffect(() => {
    if (!activeConv) return;
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

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [...c.messages, msg],
              lastMessage: newMessage,
              lastMessageTime: "Ahora",
              unread: 0,
            }
          : c
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
      shippingMethod:
        offerShipping === "correos"
          ? "Correos Express"
          : offerShipping === "mano"
          ? "En mano"
          : "Mensajeria",
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

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [...c.messages, sysMsg, offerMsg],
              lastMessage: `Oferta: ${offer.amount}\u20AC`,
              lastMessageTime: "Ahora",
              unread: 0,
            }
          : c
      )
    );

    setShowOfferModal(false);
    setOfferAmount("");
    setOfferNote("");
    toast.success("Oferta enviada correctamente");
  };

  const navigate = useNavigate();

  return (
    <div className="h-[calc(100dvh-56px)] md:h-[calc(100dvh-57px)] overflow-hidden flex flex-col md:flex-row">
      {/* Desktop list */}
      <div className="hidden md:flex flex-col w-72 border-r border-border bg-card shrink-0">
        <div className="p-3 border-b border-border">
          <h2 className="text-foreground text-sm">Mensajes</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-full text-left p-3 border-b border-border hover:bg-accent/50 ${
                activeConvId === conv.id ? "bg-accent/50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary/30">
                  <ImageWithFallback src={conv.listingImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{conv.listingName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {conv.participantName}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <Badge className="bg-[#9CFF49] text-black">{conv.unread}</Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile list */}
      {!activeConv && (
        <div className="md:hidden flex-1 overflow-y-auto bg-background">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className="w-full text-left p-3 border-b border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary/30">
                  <ImageWithFallback src={conv.listingImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{conv.listingName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {conv.participantName} · {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <Badge className="bg-[#9CFF49] text-black">{conv.unread}</Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Chat */}
      {activeConv && (
        <div className="flex-1 flex flex-col min-h-0 bg-background">

          {/* 🔥 STICKY HEADER */}
          <div className="sticky top-0 z-30 bg-card border-b border-border">
            <div className="flex items-center gap-3 p-3">
              <button onClick={() => setActiveConvId(null)} className="md:hidden">
                ←
              </button>
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-secondary/30">
                <ImageWithFallback src={activeConv.listingImage} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm">{activeConv.listingName}</p>
                <div className="flex gap-2 text-xs">
                  <span className="text-[#9CFF49] font-semibold">
                    {activeConv.listingPrice}€
                  </span>
                  <span className="text-muted-foreground">
                    · {activeConv.participantName}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowOfferModal(true)}
                className="bg-[#9CFF49] text-black"
              >
                <HandCoins className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 🔥 SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConv.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                    msg.isOwn
                      ? "bg-[#9CFF49] text-black"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 🔥 STICKY INPUT */}
          <div className="sticky bottom-0 z-30 bg-card border-t border-border p-3">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setShowOfferModal(true)}>
                <HandCoins className="w-4 h-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe un mensaje..."
              />
              <Button onClick={handleSend} size="icon" className="bg-[#9CFF49] text-black">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hacer oferta</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder="Tu precio"
            />

            <Textarea
              value={offerNote}
              onChange={(e) => setOfferNote(e.target.value)}
              placeholder="Nota opcional"
            />

            <Button onClick={handleMakeOffer} className="w-full bg-[#9CFF49] text-black">
              Enviar oferta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
