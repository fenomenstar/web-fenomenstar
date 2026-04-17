import { useState, useEffect } from "react";
import { Layout } from "@/components/ui/Layout";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Flame, Trophy, Star, Zap, Check, Lock, Gift, Clock,
  Mic2, Play, Heart, Share2, Target, Award, TrendingUp,
  Calendar, ChevronRight, Crown, Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─── Sabitler ─── */
const STREAK_DAYS = [1, 2, 3, 4, 5, 6, 7];
const STREAK_REWARDS: Record<number, { icon: string; label: string; reward: string }> = {
  1: { icon: "⚡", label: "1. Gün",  reward: "5 FC"   },
  2: { icon: "🔥", label: "2. Gün",  reward: "10 FC"  },
  3: { icon: "⭐", label: "3. Gün",  reward: "2 SC"   },
  4: { icon: "💎", label: "4. Gün",  reward: "20 FC"  },
  5: { icon: "🎤", label: "5. Gün",  reward: "5 SC"   },
  6: { icon: "👑", label: "6. Gün",  reward: "30 FC"  },
  7: { icon: "🏆", label: "7. Gün",  reward: "10 SC + Rozet" },
};

const DAILY_MISSIONS = [
  { id: "m1", icon: "🎥", title: "Bugün 1 Video Yükle",          reward: "15 FC",  xp: 50,  progress: 0, total: 1,  cat: "content",    done: false  },
  { id: "m2", icon: "🎤", title: "Karaoke Kaydı Yap",            reward: "10 FC",  xp: 35,  progress: 1, total: 1,  cat: "karaoke",    done: true   },
  { id: "m3", icon: "❤️", title: "5 Videoya Oy Ver",             reward: "5 FC",   xp: 20,  progress: 3, total: 5,  cat: "social",     done: false  },
  { id: "m4", icon: "💬", title: "3 Yorum Yap",                  reward: "8 FC",   xp: 25,  progress: 1, total: 3,  cat: "social",     done: false  },
  { id: "m5", icon: "👀", title: "Liderlik Tablosunu Ziyaret Et", reward: "3 FC",  xp: 10,  progress: 1, total: 1,  cat: "explore",    done: true   },
  { id: "m6", icon: "📤", title: "Profilini Paylaş",              reward: "5 FC",  xp: 15,  progress: 0, total: 1,  cat: "social",     done: false  },
];

const WEEKLY_CHALLENGES = [
  { id: "w1", icon: "🚀", title: "Haftalık Yıldız Yarışı",   desc: "7 günde en az 3 video yükle",    reward: "50 FC + Roket Rozeti",  ends: "5 gün",   progress: 1, total: 3,  tier: "gold"   },
  { id: "w2", icon: "🎵", title: "Karaoke Maratonu",          desc: "Bu hafta 5 karaoke kaydı yap",   reward: "3 SC + Kristal Rozet",  ends: "5 gün",   progress: 1, total: 5,  tier: "silver" },
  { id: "w3", icon: "🏆", title: "Top 10 Listeri Gir",        desc: "Liderlik tablosunda ilk 10'a gir", reward: "10 SC + Taç",          ends: "5 gün",   progress: null, total: null, tier: "gold" },
  { id: "w4", icon: "👥", title: "Topluluk Elçisi",           desc: "10 farklı kullanıcıyı oyla",     reward: "25 FC + Elçi Rozeti",   ends: "5 gün",   progress: 4, total: 10, tier: "bronze" },
];

const SPECIAL_EVENTS = [
  { id: "e1", title: "🌟 FenomenStar Bahar Festivali",    desc: "Özel şarkıları söyle, 2× FenomenCoin kazan!",  ends: "3 gün",  color: "from-pink-600 to-rose-500",     hot: true  },
  { id: "e2", title: "🎤 THY Ses Yarışması Sprint",       desc: "Bu haftaki oylamalarda %50 bonus oy gücü",     ends: "2 gün",  color: "from-blue-600 to-cyan-500",     hot: false },
  { id: "e3", title: "🔥 Karaoke Turnuvası Başladı",      desc: "İlk 100 katılımcıya 20 FC hediye",             ends: "7 gün",  color: "from-orange-600 to-amber-500",  hot: true  },
];

const CAT_COLORS: Record<string, string> = {
  content:  "bg-primary/10 text-primary",
  karaoke:  "bg-cyan-400/10 text-cyan-400",
  social:   "bg-pink-400/10 text-pink-400",
  explore:  "bg-yellow-400/10 text-yellow-400",
};

const TIER_COLORS: Record<string, string> = {
  gold:   "border-yellow-500/40 bg-yellow-500/5",
  silver: "border-gray-400/40 bg-gray-400/5",
  bronze: "border-amber-700/40 bg-amber-700/5",
};

/* ─── Streak Takvim ─── */
function StreakCalendar({ streak, claimed }: { streak: number; claimed: number }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {STREAK_DAYS.map(day => {
        const done    = day <= streak;
        const isToday = day === streak + 1 && claimed < day;
        const isClaimed = day <= claimed;
        return (
          <div key={day}
            className={cn("flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
              isClaimed ? "bg-green-500/10 border-green-500/30" :
              isToday   ? "bg-primary/15 border-primary/50 shadow-[0_0_15px_rgba(255,0,255,0.2)]" :
              done      ? "bg-white/5 border-white/10" :
                          "bg-white/3 border-white/5 opacity-50")}>
            <span className="text-lg">{STREAK_REWARDS[day].icon}</span>
            <span className="text-[9px] font-bold text-muted-foreground">{STREAK_REWARDS[day].label}</span>
            <span className={cn("text-[9px] font-black", isClaimed ? "text-green-400" : isToday ? "text-primary" : "text-muted-foreground")}>
              {STREAK_REWARDS[day].reward}
            </span>
            {isClaimed && <Check className="w-3 h-3 text-green-400" />}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════
   ANA SAYFA
══════════════════════ */
export default function Challenges() {
  const { toast } = useToast();
  const [streak]       = useState(2);        // 2 gün üst üste
  const [claimed]      = useState(2);        // 2 gün toplandı
  const [xp]           = useState(185);
  const [xpMax]        = useState(300);
  const [missions, setMissions] = useState(DAILY_MISSIONS);
  const [countdown, setCountdown] = useState("");

  /* Geri sayaç (sıfırlanmaya kadar) */
  useEffect(() => {
    const calc = () => {
      const now  = new Date();
      const next = new Date(); next.setHours(24, 0, 0, 0);
      const diff = next.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  const completedCount = missions.filter(m => m.done).length;

  const claimMission = (id: string) => {
    const m = missions.find(x => x.id === id);
    if (!m || m.done) return;
    setMissions(prev => prev.map(x => x.id === id ? { ...x, done: true, progress: x.total } : x));
    toast({
      title: `🎉 ${m.reward} kazandın!`,
      description: `"${m.title}" görevi tamamlandı. Harika iş!`,
      className: "bg-card border border-primary/30",
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-20">

        {/* ── Başlık ── */}
        <div className="pt-8 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-black flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xl">🔥</span>
              Günlük Görevler
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Her gün tamamla, coin kazan, streak kır!</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-orange-400 font-black text-lg">
              <Flame className="w-5 h-5 fill-orange-400" /> {streak} gün streak
            </div>
            <p className="text-xs text-muted-foreground">Yenileme: <span className="text-white font-mono font-bold">{countdown}</span></p>
          </div>
        </div>

        {/* ── Özel Etkinlikler Banner ── */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 pb-1">
          {SPECIAL_EVENTS.map(ev => (
            <div key={ev.id} className={cn("shrink-0 relative rounded-2xl bg-gradient-to-r p-4 min-w-[260px] cursor-pointer overflow-hidden border border-white/10 hover:scale-[1.02] transition-transform", ev.color)}>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_70%_30%,white_0%,transparent_60%)]" />
              {ev.hot && (
                <span className="absolute top-2 right-2 text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full">🔴 CANLI</span>
              )}
              <p className="font-bold text-sm text-white mb-1">{ev.title}</p>
              <p className="text-xs text-white/80 mb-2">{ev.desc}</p>
              <p className="text-[10px] text-white/60">⏱ {ev.ends} kaldı</p>
            </div>
          ))}
        </div>

        {/* ── XP + Level Bar ── */}
        <div className="bg-card border border-white/5 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-sm">Seviye 7 — Yükselen Yıldız</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{xp}/{xpMax} XP</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(xp / xpMax) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Seviye 8'e {xpMax - xp} XP kaldı → <span className="text-yellow-400 font-bold">20 SC + Altın Rozet</span> ödülü</p>
        </div>

        {/* ── Streak Takvim ── */}
        <div className="bg-card border border-white/5 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> 7 Günlük Streak Ödülleri
            </h3>
            <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full font-bold">
              🔥 {streak}/7
            </span>
          </div>
          <StreakCalendar streak={streak} claimed={claimed} />
          <p className="text-xs text-muted-foreground text-center mt-3">
            Bugün giriş yaptın ✓ Yarın da gel → <span className="text-primary font-bold">2 SC ödülü</span>!
          </p>
        </div>

        {/* ── Günlük Görevler ── */}
        <div className="bg-card border border-white/5 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Bugünün Görevleri
            </h3>
            <span className="text-xs text-muted-foreground">{completedCount}/{missions.length} tamamlandı</span>
          </div>

          {/* Toplam progress */}
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-5">
            <motion.div animate={{ width: `${(completedCount / missions.length) * 100}%` }}
              transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-primary to-accent rounded-full" />
          </div>

          <div className="space-y-2">
            {missions.map(m => (
              <motion.div key={m.id} layout
                className={cn("flex items-center gap-3 p-3.5 rounded-xl border transition-all",
                  m.done ? "bg-green-500/5 border-green-500/20" : "bg-white/3 border-white/5 hover:border-white/10")}>
                <span className="text-2xl shrink-0">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn("font-medium text-sm", m.done && "line-through text-muted-foreground")}>{m.title}</p>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", CAT_COLORS[m.cat])}>
                      {m.cat === "content" ? "İçerik" : m.cat === "karaoke" ? "Karaoke" : m.cat === "social" ? "Sosyal" : "Keşif"}
                    </span>
                  </div>
                  {m.total > 1 && (
                    <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden w-32">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(m.progress / m.total) * 100}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded-lg">
                    +{m.reward}
                  </span>
                  {m.done ? (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  ) : m.progress >= m.total ? (
                    <button onClick={() => claimMission(m.id)}
                      className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/40 transition-all animate-pulse">
                      <Gift className="w-4 h-4 text-primary" />
                    </button>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Haftalık Meydan Okumalar ── */}
        <div className="mb-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> Haftalık Meydan Okumalar
          </h3>
          <div className="space-y-3">
            {WEEKLY_CHALLENGES.map(ch => (
              <div key={ch.id} className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all", TIER_COLORS[ch.tier])}>
                <span className="text-3xl shrink-0">{ch.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{ch.title}</p>
                  <p className="text-xs text-muted-foreground mb-2">{ch.desc}</p>
                  {ch.progress !== null && ch.total !== null && (
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-full max-w-[200px]">
                      <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                        style={{ width: `${(ch.progress / ch.total) * 100}%` }} />
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">⏱ {ch.ends} kaldı</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-yellow-400">{ch.reward}</p>
                  {ch.progress !== null && ch.total !== null && (
                    <p className="text-[10px] text-muted-foreground">{ch.progress}/{ch.total}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hızlı Aksiyon ── */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Göreve Başla!
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { href: "/upload",  icon: <Play className="w-4 h-4" />,   label: "Video Yükle",  color: "bg-primary/20 text-primary border-primary/30" },
              { href: "/karaoke", icon: <Mic2 className="w-4 h-4" />,   label: "Karaoke Yap",  color: "bg-cyan-400/20 text-cyan-400 border-cyan-400/30" },
              { href: "/feed",    icon: <Heart className="w-4 h-4" />,   label: "Oy Ver",       color: "bg-pink-400/20 text-pink-400 border-pink-400/30" },
              { href: "/leaderboard", icon: <TrendingUp className="w-4 h-4" />, label: "Sıralamayı Gör", color: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30" },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className={cn("flex items-center gap-2 justify-center px-3 py-3 rounded-xl border text-sm font-semibold hover:scale-105 transition-all", a.color)}>
                {a.icon} {a.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
