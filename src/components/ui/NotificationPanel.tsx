import { useState } from "react";
import { Bell, Trophy, Heart, MessageCircle, Zap, User, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const DEMO_NOTIFS = [
  {
    id: 1, type: "vote", icon: <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />,
    text: "Zeynep Kaya videonuzu oyladı", sub: "\"Ses Kaydım — 2024\"", time: "2 dk", read: false,
    bg: "bg-pink-500/10",
  },
  {
    id: 2, type: "competition", icon: <Trophy className="w-4 h-4 text-yellow-400" />,
    text: "THY Ses Yarışması sona eriyor!", sub: "Son 2 gün — Katıldın mı?", time: "1 sa", read: false,
    bg: "bg-yellow-500/10",
  },
  {
    id: 3, type: "comment", icon: <MessageCircle className="w-4 h-4 text-cyan-400" />,
    text: "Mehmet Yılmaz yorum yaptı", sub: "\"Harika bir performans! 👏\"", time: "3 sa", read: false,
    bg: "bg-cyan-500/10",
  },
  {
    id: 4, type: "doping", icon: <Zap className="w-4 h-4 text-primary" />,
    text: "Video Boost paketiniz aktif!", sub: "24 saat boyunca öne çıkacaksınız", time: "5 sa", read: true,
    bg: "bg-primary/10",
  },
  {
    id: 5, type: "follow", icon: <User className="w-4 h-4 text-green-400" />,
    text: "Ayşe Kara sizi takip etti", sub: "@ayse_kara yeni takipçiniz", time: "1 gün", read: true,
    bg: "bg-green-500/10",
  },
  {
    id: 6, type: "badge", icon: <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />,
    text: "Yeni rozet kazandınız! 🏅", sub: "\"Haftanın Yıldızı\" rozetiniz verildi", time: "1 gün", read: true,
    bg: "bg-yellow-500/10",
  },
  {
    id: 7, type: "competition", icon: <Trophy className="w-4 h-4 text-yellow-400" />,
    text: "PepsiStar Dans Yarışması başladı", sub: "Yeni yarışmayı kaçırma!", time: "2 gün", read: true,
    bg: "bg-yellow-500/10",
  },
];

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  const dismiss = (id: number) => setNotifs(ns => ns.filter(n => n.id !== id));

  return (
    <div className="relative">
      {/* Bell button */}
      <button onClick={() => setOpen(o => !o)}
        className={cn("relative w-9 h-9 rounded-full flex items-center justify-center transition-all",
          open ? "bg-primary/20 text-primary" : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white")}>
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-3 w-80 bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <h3 className="font-bold text-sm">Bildirimler</h3>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead}
                      className="text-[11px] text-primary hover:text-primary/80 font-semibold transition-colors">
                      Tümünü okundu say
                    </button>
                  )}
                </div>
              </div>

              {/* Notif listesi */}
              <div className="max-h-96 overflow-y-auto no-scrollbar">
                {notifs.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground text-sm">Bildirim yok</p>
                  </div>
                ) : notifs.map(n => (
                  <motion.div key={n.id} layout
                    className={cn("flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors relative group",
                      !n.read && "bg-white/2")}>
                    {!n.read && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", n.bg)}>
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs leading-snug", !n.read ? "font-semibold text-white" : "text-white/80")}>{n.text}</p>
                      {n.sub && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{n.sub}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time} önce</p>
                    </div>
                    <button onClick={() => dismiss(n.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all shrink-0">
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/10">
                <button className="w-full text-center text-xs text-primary hover:text-primary/80 font-semibold transition-colors">
                  Tüm bildirimleri gör
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
