import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/ui/Layout";
import { useRoute, Link } from "wouter";
import { useWebRTCSimulation } from "@/hooks/use-webrtc-simulation";
import {
  Heart, Send, Users, X, MicOff, Coins,
  Trophy, Crown, Flame, Zap, Star, Gift,
  Volume2, Share2, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ─── Hediye Tipleri ─── */
const GIFTS = [
  { id: "rose",    icon: "🌹", name: "Gül",      price: 1,  coin: "FC", color: "text-rose-400",   effect: "love"   },
  { id: "heart",   icon: "❤️", name: "Kalp",     price: 2,  coin: "FC", color: "text-pink-400",   effect: "love"   },
  { id: "star",    icon: "⭐", name: "Yıldız",   price: 5,  coin: "FC", color: "text-yellow-400", effect: "star"   },
  { id: "mic",     icon: "🎤", name: "Mikrofon", price: 10, coin: "FC", color: "text-purple-400", effect: "mic"    },
  { id: "diamond", icon: "💎", name: "Elmas",    price: 2,  coin: "SC", color: "text-cyan-400",   effect: "diamond"},
  { id: "crown",   icon: "👑", name: "Taç",      price: 5,  coin: "SC", color: "text-amber-400",  effect: "crown"  },
  { id: "trophy",  icon: "🏆", name: "Kupa",     price: 10, coin: "SC", color: "text-yellow-500", effect: "trophy" },
  { id: "rocket",  icon: "🚀", name: "Roket",    price: 20, coin: "SC", color: "text-primary",    effect: "rocket" },
];

/* Demo bot mesajları */
const BOT_MSGS = [
  { user: "ayse_nur",     text: "Harika performans! 🔥" },
  { user: "burak99",      text: "Kazanmayı hak ediyor 👏" },
  { user: "melisa_ses",   text: "Bu şarkı çok güzel!" },
  { user: "emre_star",    text: "Top 1 kesin 💪" },
  { user: "zeynep_fan",   text: "Seni destekliyorum! ❤️" },
  { user: "ali_müzik",    text: "Mikrofon çok iyi duyuluyor" },
  { user: "cansu_dans",   text: "İnanılmaz! Tüylerim diken diken 😭" },
  { user: "berk_pro",     text: "Sponsorlar nerde? Bu yetenek kaçmaz!" },
];

type FloatingGift = { id: number; icon: string; x: number; user: string; giftName: string };

export default function LiveRoom() {
  const [, params] = useRoute("/live/:roomId");
  const roomId = params?.roomId || "1";
  const { isConnected, participants, liveVotes, sendVote } = useWebRTCSimulation(roomId);
  const { toast } = useToast();

  const [chatMsg, setChatMsg]           = useState("");
  const [messages, setMessages]         = useState(BOT_MSGS.slice(0, 3).map((m, i) => ({ id: i, ...m })));
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);
  const [floatingGifts, setFloatingGifts]   = useState<FloatingGift[]>([]);
  const [showGiftPanel, setShowGiftPanel]   = useState(false);
  const [fenomenCoins]  = useState(245);
  const [starCoins]     = useState(18);
  const [giftCombo, setGiftCombo]       = useState(0);
  const [viewerCount]   = useState(1243);
  const [isMuted, setIsMuted]           = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  /* Bot mesajlarını simüle et */
  useEffect(() => {
    if (!isConnected) return;
    const t = setInterval(() => {
      const msg = BOT_MSGS[Math.floor(Math.random() * BOT_MSGS.length)];
      setMessages(prev => [...prev.slice(-30), { id: Date.now(), ...msg }]);
    }, 3500);
    return () => clearInterval(t);
  }, [isConnected]);

  /* Chat otoscroll */
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  /* Zaman zaman bot hediye animasyonu */
  useEffect(() => {
    if (!isConnected) return;
    const t = setInterval(() => {
      const gift = GIFTS[Math.floor(Math.random() * 4)];
      const botUser = BOT_MSGS[Math.floor(Math.random() * BOT_MSGS.length)].user;
      spawnGiftAnimation({ ...gift, user: botUser });
      setMessages(prev => [...prev.slice(-30), {
        id: Date.now(),
        user: botUser,
        text: `${gift.icon} ${gift.name} hediye gönderdi!`,
      }]);
    }, 8000);
    return () => clearInterval(t);
  }, [isConnected]);

  /* Oy kalbi */
  const handleVote = () => {
    sendVote();
    const id = Date.now();
    setFloatingHearts(prev => [...prev, { id, x: Math.random() * 60 - 30 }]);
    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 2000);
  };

  /* Hediye spawn */
  const spawnGiftAnimation = (gift: typeof GIFTS[0] & { user: string }) => {
    const id = Date.now() + Math.random();
    setFloatingGifts(prev => [...prev, { id, icon: gift.icon, x: Math.random() * 80 - 40, user: gift.user, giftName: gift.name }]);
    setGiftCombo(c => c + 1);
    setTimeout(() => {
      setFloatingGifts(prev => prev.filter(g => g.id !== id));
      setGiftCombo(c => Math.max(0, c - 1));
    }, 3000);
  };

  /* Kullanıcı hediye gönder */
  const handleSendGift = (gift: typeof GIFTS[0]) => {
    const balance = gift.coin === "FC" ? fenomenCoins : starCoins;
    if (balance < gift.price) {
      toast({ title: "❌ Yetersiz coin", description: `${gift.coin} bakiyen yetersiz. Cüzdanından satın al.`, className: "bg-card border border-red-500/30" });
      return;
    }
    spawnGiftAnimation({ ...gift, user: "sen" });
    setMessages(prev => [...prev, { id: Date.now(), user: "sen", text: `${gift.icon} ${gift.name} hediye gönderildi!` }]);
    toast({ title: `${gift.icon} Hediye gönderildi!`, description: `${gift.price} ${gift.coin} harcandı.`, className: "bg-card border border-primary/30" });
    setShowGiftPanel(false);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text: chatMsg, user: "sen" }]);
    setChatMsg("");
  };

  return (
    <Layout hideBottomNav>
      <div className="h-[100dvh] w-full bg-black flex flex-col md:flex-row relative overflow-hidden">

        {/* ── Video Alanı ── */}
        <div className="flex-1 relative flex items-center justify-center bg-[#060010] overflow-hidden">

          {!isConnected ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white animate-pulse">Bağlanıyor...</p>
            </div>
          ) : (
            <>
              {/* Video arkaplanı */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a0030] to-[#000520]">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(192,132,252,0.3) 0%, transparent 70%)" }} />
              </div>

              {/* Host Avatar (simüle) */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-4 border-primary/40 flex items-center justify-center shadow-[0_0_60px_rgba(255,0,255,0.3)]">
                  <img src="https://picsum.photos/seed/livehost/400" className="w-full h-full rounded-full object-cover" alt="host" />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-display font-black text-2xl text-white">Zeynep Kaya</p>
                  <p className="text-primary text-sm">🎤 Canlı Performans · THY Yarışması</p>
                </div>
              </div>

              {/* Üst Bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center gap-3 z-20">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-3 py-2 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-white text-sm font-bold">CANLI</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-3 py-2 border border-white/10 text-sm">
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-white font-bold">{viewerCount.toLocaleString("tr")}</span>
                </div>
                <div className="flex-1" />
                <button onClick={() => setIsMuted(m => !m)}
                  className="p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                  {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>
                <button className="p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                  <Share2 className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Oy sayacı */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-primary to-accent px-6 py-2.5 rounded-full shadow-[0_0_25px_rgba(255,0,255,0.4)] border border-white/20">
                  <p className="font-black text-xl text-white text-center">{liveVotes} OY</p>
                </div>
              </div>

              {/* Gift Combo göstergesi */}
              <AnimatePresence>
                {giftCombo > 1 && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-28 left-1/2 -translate-x-1/2 z-20 text-center">
                    <p className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
                      x{giftCombo} COMBO! 🔥
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Katılımcılar (PiP) */}
              <div className="absolute bottom-28 md:bottom-8 left-4 flex gap-3 z-10">
                {participants.slice(1, 3).map(p => (
                  <div key={p.id} className="w-20 h-28 bg-gray-900 rounded-xl overflow-hidden border-2 border-white/20 relative">
                    <img src={`https://picsum.photos/seed/part${p.id}/150`} className="w-full h-full object-cover" alt={p.name} />
                    <div className="absolute bottom-1 left-0 right-0 px-1">
                      <p className="text-[9px] text-white font-bold bg-black/60 rounded px-1 text-center truncate">{p.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Uçan kalpler */}
              <div className="absolute bottom-32 right-16 w-20 h-64 pointer-events-none z-20">
                <AnimatePresence>
                  {floatingHearts.map(h => (
                    <motion.div key={h.id} initial={{ opacity: 1, y: 0, x: h.x, scale: 0.5 }} animate={{ opacity: 0, y: -200, scale: 1.5 }}
                      exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute bottom-0 text-primary drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">
                      <Heart className="w-10 h-10 fill-primary" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Uçan hediyeler */}
              <div className="absolute inset-0 pointer-events-none z-20">
                <AnimatePresence>
                  {floatingGifts.map(g => (
                    <motion.div key={g.id}
                      initial={{ opacity: 0, y: "80%", x: `${50 + g.x}%`, scale: 0.3 }}
                      animate={{ opacity: [0, 1, 1, 0], y: ["80%", "30%", "15%", "5%"], scale: [0.3, 1.5, 1.2, 0.8] }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                      className="absolute bottom-0 left-0 flex flex-col items-center">
                      <span className="text-5xl drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{g.icon}</span>
                      <div className="bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 text-[10px] text-white font-bold mt-1">
                        {g.user}: {g.giftName}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Oy + Hediye Butonları */}
              <div className="absolute right-4 bottom-8 md:bottom-12 md:right-[calc(24rem+16px)] flex flex-col gap-3 z-30">
                <button onClick={() => setShowGiftPanel(p => !p)}
                  className={cn("w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 transition-all hover:scale-110 active:scale-95",
                    showGiftPanel ? "bg-yellow-500 border-yellow-400 shadow-yellow-500/50" : "bg-black/60 backdrop-blur-md border-white/20 hover:border-white/40")}>
                  <Gift className={cn("w-6 h-6", showGiftPanel ? "text-black" : "text-white")} />
                </button>
                <button onClick={handleVote}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.6)] border-2 border-white/20 hover:scale-110 active:scale-95 transition-all">
                  <Heart className="w-7 h-7 text-white fill-white" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Sağ Panel: Chat + Hediye ── */}
        <div className="w-full md:w-96 h-[42vh] md:h-full bg-card border-l border-white/10 flex flex-col z-20">

          {/* Başlık */}
          <div className="p-4 border-b border-white/10 bg-black/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" /> Sohbet
                <span className="text-xs text-muted-foreground font-normal">({viewerCount.toLocaleString("tr")} izleyici)</span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <Zap className="w-2.5 h-2.5" /> 245 FC
                </span>
                <span className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <Star className="w-2.5 h-2.5" /> 18 SC
                </span>
              </div>
            </div>

            {/* Liderlik kısa (top 3) */}
            <div className="flex gap-2">
              {[
                { icon: "🥇", name: "zeynep_ses",  votes: 3240, color: "text-yellow-400" },
                { icon: "🥈", name: "ali_star",    votes: 2180, color: "text-gray-300"   },
                { icon: "🥉", name: "ayse_müzik",  votes: 1560, color: "text-amber-600"  },
              ].map((l, i) => (
                <div key={i} className="flex-1 bg-white/3 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-sm">{l.icon}</p>
                  <p className={cn("text-[9px] font-bold truncate", l.color)}>{l.name}</p>
                  <p className="text-[9px] text-muted-foreground">{(l.votes / 1000).toFixed(1)}K</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hediye Paneli */}
          <AnimatePresence>
            {showGiftPanel && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                className="overflow-hidden border-b border-white/10 bg-black/40">
                <div className="p-4">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">🎁 Hediye Gönder</p>
                  <div className="grid grid-cols-4 gap-2">
                    {GIFTS.map(gift => (
                      <button key={gift.id} onClick={() => handleSendGift(gift)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                        <span className="text-2xl group-hover:scale-125 transition-transform duration-200">{gift.icon}</span>
                        <span className="text-[9px] text-muted-foreground font-medium">{gift.name}</span>
                        <span className={cn("text-[9px] font-bold", gift.color)}>
                          {gift.price} {gift.coin}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-center">
                    <Link href="/wallet" className="text-xs text-primary hover:text-primary/80 transition-colors">
                      Coin satın al →
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mesajlar */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="text-sm">
                  <span className={cn("font-bold mr-1.5",
                    msg.user === "sen" ? "text-primary" :
                    msg.text.includes("hediye") ? "text-yellow-400" : "text-accent")}>
                    {msg.user}:
                  </span>
                  <span className={cn("text-white/90", msg.text.includes("hediye") && "font-medium")}>{msg.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-white/10 bg-black/30">
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                placeholder="Bir şeyler yaz..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary text-white transition-colors" />
              <button type="submit"
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0 hover:scale-105 transition-transform shadow-[0_0_10px_rgba(255,0,255,0.3)]">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
