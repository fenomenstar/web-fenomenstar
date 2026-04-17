import { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Wallet, Coins, Star, Zap, Gift, ArrowUpRight, ArrowDownLeft,
  ShoppingCart, Clock, Check, CreditCard, TrendingUp, Info,
  Trophy, Heart, Crown, Sparkles, Plus, ChevronRight, Flame,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─── Tipler ─── */
type WalletTab = "overview" | "buy" | "gifts" | "history";
type CoinType  = "fenomen" | "star";

/* ─── Sabitler ─── */
const COIN_PACKAGES = [
  { coins: 20,   tl: 15,  type: "fenomen" as CoinType, popular: false, bonus: 0   },
  { coins: 50,   tl: 35,  type: "fenomen" as CoinType, popular: false, bonus: 0   },
  { coins: 100,  tl: 65,  type: "fenomen" as CoinType, popular: true,  bonus: 10  },
  { coins: 200,  tl: 120, type: "fenomen" as CoinType, popular: false, bonus: 25  },
  { coins: 500,  tl: 280, type: "fenomen" as CoinType, popular: false, bonus: 75  },
  { coins: 10,   tl: 25,  type: "star"    as CoinType, popular: false, bonus: 0   },
  { coins: 25,   tl: 55,  type: "star"    as CoinType, popular: false, bonus: 2   },
  { coins: 50,   tl: 99,  type: "star"    as CoinType, popular: true,  bonus: 7   },
  { coins: 120,  tl: 220, type: "star"    as CoinType, popular: false, bonus: 20  },
];

const DOPING_PACKAGES = [
  { id: "1", name: "Ses Kristali",     desc: "Karaoke ses kalitesi %50 artar",        price: 5,  coin: "fenomen" as CoinType, duration: "24 saat",  boost: "+50%",    icon: "🎙", color: "from-violet-600 to-purple-500" },
  { id: "2", name: "Video Boost",      desc: "Premium görsel efektler + filtreler",   price: 10, coin: "fenomen" as CoinType, duration: "1 hafta",  boost: "Premium", icon: "🎬", color: "from-cyan-600 to-blue-500"   },
  { id: "3", name: "Profil Shine",     desc: "Aramada 3× görünürlük",                 price: 3,  coin: "star"    as CoinType, duration: "3 gün",   boost: "3×",      icon: "⭐", color: "from-amber-600 to-yellow-500" },
  { id: "4", name: "Performans Turbo", desc: "Tüm yeteneklerde %75 artış",            price: 5,  coin: "star"    as CoinType, duration: "1 gün",   boost: "+75%",    icon: "⚡", color: "from-red-600 to-rose-500"     },
  { id: "5", name: "Mega Doping Pack", desc: "Tüm dopingleri 1 hafta aktif et",       price: 15, coin: "star"    as CoinType, duration: "1 hafta",  boost: "Tümü",    icon: "🚀", color: "from-primary to-accent"       },
  { id: "6", name: "Yıldız Yağmuru",  desc: "Performanslarında 2× yıldız kazan",     price: 8,  coin: "fenomen" as CoinType, duration: "3 gün",   boost: "2×",      icon: "🌟", color: "from-emerald-600 to-green-500" },
  { id: "7", name: "Popülerlik Bombası", desc: "Ana sayfada öne çık",                price: 12, coin: "star"    as CoinType, duration: "24 saat",  boost: "Ana Sayfa", icon: "🔥", color: "from-orange-600 to-amber-500" },
];

const GIFTS = [
  { id: "rose",   name: "Gül",     price: 1,  coin: "fenomen" as CoinType, icon: "🌹", color: "text-rose-400"   },
  { id: "heart",  name: "Kalp",    price: 2,  coin: "fenomen" as CoinType, icon: "❤️", color: "text-pink-400"   },
  { id: "star",   name: "Yıldız",  price: 5,  coin: "fenomen" as CoinType, icon: "⭐", color: "text-yellow-400" },
  { id: "mic",    name: "Mikrofon",price: 10, coin: "fenomen" as CoinType, icon: "🎤", color: "text-purple-400" },
  { id: "diamond",name: "Elmas",   price: 2,  coin: "star"    as CoinType, icon: "💎", color: "text-cyan-400"   },
  { id: "crown",  name: "Taç",     price: 5,  coin: "star"    as CoinType, icon: "👑", color: "text-amber-400"  },
  { id: "trophy", name: "Kupa",    price: 10, coin: "star"    as CoinType, icon: "🏆", color: "text-yellow-400" },
  { id: "rocket", name: "Roket",   price: 20, coin: "star"    as CoinType, icon: "🚀", color: "text-primary"    },
];

const TRANSACTIONS = [
  { id: "t1", type: "earn",     desc: "Yarışma oyu geliri",            date: "30 Mar 2026", amount: "+28 FC",  icon: "❤️",   color: "text-green-400"  },
  { id: "t2", type: "purchase", desc: "100 FenomenCoin satın aldı",    date: "28 Mar 2026", amount: "+100 FC", icon: "🛍️",  color: "text-green-400"  },
  { id: "t3", type: "spend",    desc: "Ses Kristali doping kullandı",  date: "27 Mar 2026", amount: "-5 FC",   icon: "🎙",   color: "text-red-400"    },
  { id: "t4", type: "gift",     desc: "Kalp hediyesi gönderdi",        date: "26 Mar 2026", amount: "-2 FC",   icon: "❤️",   color: "text-red-400"    },
  { id: "t5", type: "purchase", desc: "25 StarCoin satın aldı",        date: "25 Mar 2026", amount: "+25 SC",  icon: "⭐",   color: "text-yellow-400" },
  { id: "t6", type: "spend",    desc: "Mega Doping Pack",              date: "24 Mar 2026", amount: "-15 SC",  icon: "🚀",   color: "text-red-400"    },
  { id: "t7", type: "earn",     desc: "Takipçi bonusu",               date: "23 Mar 2026", amount: "+10 FC",  icon: "👥",   color: "text-green-400"  },
  { id: "t8", type: "earn",     desc: "Yarışma ödülü #1",             date: "22 Mar 2026", amount: "+5 SC",   icon: "🏆",   color: "text-yellow-400" },
];

/* ─── Bileşenler ─── */
function CoinBadge({ type }: { type: CoinType }) {
  return type === "fenomen"
    ? <span className="text-[10px] font-black bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">FC</span>
    : <span className="text-[10px] font-black bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded-full">SC</span>;
}

/* ══════════════════════
   ANA SAYFA
══════════════════════ */
export default function WalletPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<WalletTab>("overview");
  const [coinFilter, setCoinFilter] = useState<"all" | CoinType>("all");
  const [fenomenCoins] = useState(245);
  const [starCoins]    = useState(18);

  const handleBuy = (pkg: typeof COIN_PACKAGES[0]) => {
    toast({
      title: "🛍️ Satın alma başlatıldı",
      description: `${pkg.coins}${pkg.bonus > 0 ? ` + ${pkg.bonus} bonus` : ""} ${pkg.type === "fenomen" ? "FenomenCoin" : "StarCoin"} — ₺${pkg.tl}`,
      className: "bg-card border border-primary/30",
    });
  };

  const handleDoping = (item: typeof DOPING_PACKAGES[0]) => {
    const bal = item.coin === "fenomen" ? fenomenCoins : starCoins;
    if (bal < item.price) {
      toast({ title: "❌ Yetersiz coin", description: "Coin satın almak için Satın Al sekmesine git.", className: "bg-card border border-red-500/30" });
    } else {
      toast({ title: `🚀 ${item.name} aktif!`, description: `${item.duration} boyunca ${item.boost} etkisi aktif.`, className: "bg-card border border-primary/30" });
    }
  };

  const handleGift = (gift: typeof GIFTS[0]) => {
    toast({ title: `${gift.icon} Hediye gönderildi!`, description: `${gift.name} hediyesi başarıyla gönderildi.`, className: "bg-card border border-primary/30" });
  };

  const TABS: { id: WalletTab; label: string; icon: any }[] = [
    { id: "overview", label: "Genel Bakış", icon: Wallet },
    { id: "buy",      label: "Satın Al",   icon: ShoppingCart },
    { id: "gifts",    label: "Hediyeler",  icon: Gift },
    { id: "history",  label: "Geçmiş",    icon: Clock },
  ];

  const packages = COIN_PACKAGES.filter(p => coinFilter === "all" || p.type === coinFilter);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-20">

        {/* ── Başlık ── */}
        <div className="pt-8 pb-6">
          <h1 className="text-3xl font-display font-black flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </span>
            Cüzdanım
          </h1>
          <p className="text-muted-foreground mt-1">FenomenCoin ve StarCoin'lerini yönet, hediye gönder, doping al.</p>
        </div>

        {/* ── Bakiye Kartları ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* FenomenCoin */}
          <div className="relative overflow-hidden rounded-3xl p-6 border border-primary/20"
            style={{ background: "linear-gradient(135deg, #1a0040 0%, #2d006a 100%)" }}>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-primary/80">FenomenCoin</span>
                <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold">≈ 0.75 TL/coin</span>
              </div>
              <p className="text-5xl font-display font-black text-white mb-1">{fenomenCoins.toLocaleString("tr")}</p>
              <p className="text-sm text-primary/70">≈ ₺{(fenomenCoins * 0.75).toFixed(2)} değerinde</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setActiveTab("buy"); setCoinFilter("fenomen"); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                  <Plus className="w-3.5 h-3.5" /> Satın Al
                </button>
                <Link href="/doping" className="flex items-center gap-1.5 px-4 py-2 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl hover:bg-white/20 transition-all">
                  <Zap className="w-3.5 h-3.5" /> Doping
                </Link>
              </div>
            </div>
          </div>

          {/* StarCoin */}
          <div className="relative overflow-hidden rounded-3xl p-6 border border-yellow-500/20"
            style={{ background: "linear-gradient(135deg, #1a1000 0%, #2d2000 100%)" }}>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-yellow-400/80">StarCoin</span>
                <span className="text-[10px] bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded-full font-bold">≈ 2.5 TL/coin</span>
              </div>
              <p className="text-5xl font-display font-black text-white mb-1">{starCoins.toLocaleString("tr")}</p>
              <p className="text-sm text-yellow-400/70">≈ ₺{(starCoins * 2.5).toFixed(2)} değerinde</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setActiveTab("buy"); setCoinFilter("star"); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-black text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">
                  <Plus className="w-3.5 h-3.5" /> Satın Al
                </button>
                <button onClick={() => setActiveTab("gifts")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl hover:bg-white/20 transition-all">
                  <Gift className="w-3.5 h-3.5" /> Hediye
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Kısa istatistikler ── */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: <TrendingUp className="w-4 h-4 text-green-400" />, val: "+138 FC", label: "Bu ay kazanıldı" },
            { icon: <ShoppingCart className="w-4 h-4 text-primary" />, val: "₺120",    label: "Bu ay harcandı" },
            { icon: <Gift className="w-4 h-4 text-pink-400" />,        val: "12",      label: "Hediye gönderildi" },
            { icon: <Zap className="w-4 h-4 text-yellow-400" />,       val: "5",       label: "Aktif doping" },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-black text-base">{s.val}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Sekmeler ── */}
        <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn("flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all font-medium text-sm whitespace-nowrap shrink-0",
                activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white")}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ══ GENEL BAKIŞ ══ */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h3 className="font-bold text-sm text-white/70 uppercase tracking-widest">Aktif Dopingler</h3>
              <div className="bg-card border border-white/5 rounded-2xl divide-y divide-white/5">
                {[
                  { icon: "🎙", name: "Ses Kristali",     ends: "Yarın 18:00", boost: "+50%", color: "text-purple-400" },
                  { icon: "🌟", name: "Yıldız Yağmuru",   ends: "2 gün kaldı", boost: "2×",   color: "text-green-400"  },
                ].map((d, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                    <span className="text-2xl">{d.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.ends}</p>
                    </div>
                    <span className={cn("text-xs font-black bg-white/5 px-2.5 py-1 rounded-full", d.color)}>{d.boost}</span>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-sm text-white/70 uppercase tracking-widest mt-6">Son İşlemler</h3>
              <div className="bg-card border border-white/5 rounded-2xl divide-y divide-white/5">
                {TRANSACTIONS.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                    <span className="text-xl w-8 text-center">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.desc}</p>
                      <p className="text-xs text-muted-foreground">{t.date}</p>
                    </div>
                    <span className={cn("font-bold text-sm", t.color)}>{t.amount}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab("history")} className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                Tüm Geçmişi Gör →
              </button>
            </motion.div>
          )}

          {/* ══ SATIN AL ══ */}
          {activeTab === "buy" && (
            <motion.div key="buy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

              {/* Coin filtresi */}
              <div className="flex gap-2">
                {(["all", "fenomen", "star"] as const).map(f => (
                  <button key={f} onClick={() => setCoinFilter(f)}
                    className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-all",
                      coinFilter === f ? "bg-primary text-white" : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white")}>
                    {f === "all" ? "Tümü" : f === "fenomen" ? "⚡ FenomenCoin" : "⭐ StarCoin"}
                  </button>
                ))}
              </div>

              {/* Paket ızgarası */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {packages.map((pkg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={cn("relative bg-card border rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-all",
                      pkg.popular ? "border-primary/40 shadow-[0_0_20px_rgba(255,0,255,0.08)]" : "border-white/5")}>
                    {pkg.popular && (
                      <div className="absolute -top-2.5 left-4 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-black px-3 py-0.5 rounded-full">
                        EN POPÜLER
                      </div>
                    )}
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
                      pkg.type === "fenomen" ? "bg-primary/10" : "bg-yellow-500/10")}>
                      {pkg.type === "fenomen" ? "⚡" : "⭐"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">
                        {pkg.coins} {pkg.type === "fenomen" ? "FenomenCoin" : "StarCoin"}
                        {pkg.bonus > 0 && <span className="ml-2 text-xs text-green-400 font-semibold">+{pkg.bonus} bonus</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ≈ {pkg.type === "fenomen" ? `₺${(pkg.coins * 0.75).toFixed(0)}` : `₺${(pkg.coins * 2.5).toFixed(0)}`} değerinde
                      </p>
                    </div>
                    <button onClick={() => handleBuy(pkg)}
                      className={cn("shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                        pkg.type === "fenomen"
                          ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-white"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black")}>
                      ₺{pkg.tl}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Doping Paketleri */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Doping Paketleri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DOPING_PACKAGES.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-3 bg-card border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-all">
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br shrink-0", item.color, "bg-opacity-20")}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{item.name} <span className="text-[10px] text-muted-foreground font-normal">{item.duration}</span></p>
                        <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                      </div>
                      <button onClick={() => handleDoping(item)}
                        className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:border-primary/30 transition-all">
                        {item.price} <CoinBadge type={item.coin} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ödeme bilgisi */}
              <div className="flex items-start gap-3 bg-white/3 border border-white/10 rounded-2xl p-4 text-sm text-muted-foreground">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  Ödemeler <strong className="text-white">Stripe</strong> altyapısıyla güvenle işlenir.
                  Satın alımlar iade edilemez. Detaylar için <Link href="/legal?tab=refund" className="text-primary underline underline-offset-2">iade politikamıza</Link> bakın.
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ HEDİYELER ══ */}
          {activeTab === "gifts" && (
            <motion.div key="gifts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <p className="text-sm text-muted-foreground">Favori yarışmacılara canlı yayında veya profil üzerinden hediye gönder. Hediyeler yarışmacının oy puanını artırır.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GIFTS.map((gift, i) => (
                  <motion.div key={gift.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-2 bg-card border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => handleGift(gift)}>
                    <span className="text-5xl group-hover:scale-125 transition-transform duration-200">{gift.icon}</span>
                    <p className="font-bold text-sm">{gift.name}</p>
                    <div className="flex items-center gap-1 text-xs font-bold">
                      {gift.price} <CoinBadge type={gift.coin} />
                    </div>
                    <button className="w-full py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary hover:text-white transition-all">
                      Gönder
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Son gönderilen hediyeler */}
              <div>
                <h3 className="font-bold text-sm text-white/70 uppercase tracking-widest mb-3">Yakın Zamanda Gönderildi</h3>
                <div className="bg-card border border-white/5 rounded-2xl divide-y divide-white/5">
                  {[
                    { to: "Zeynep Kaya",  gift: "💎 Elmas",   when: "2 saat önce",  cost: "2 SC" },
                    { to: "Cem Karaca",   gift: "👑 Taç",     when: "Dün 18:30",    cost: "5 SC" },
                    { to: "Ayşe Nur",     gift: "❤️ Kalp",    when: "3 gün önce",   cost: "2 FC" },
                  ].map((h, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium">{h.gift} → <span className="text-primary">{h.to}</span></p>
                        <p className="text-xs text-muted-foreground">{h.when}</p>
                      </div>
                      <span className="text-xs text-red-400 font-bold">-{h.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ GEÇMİŞ ══ */}
          {activeTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {TRANSACTIONS.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 bg-card border border-white/5 rounded-2xl px-4 py-4 hover:border-white/10 transition-all">
                  <span className="text-xl w-8 text-center">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{t.desc}</p>
                    <p className="text-xs text-muted-foreground">{t.date}</p>
                  </div>
                  <span className={cn("font-bold text-sm shrink-0", t.color)}>{t.amount}</span>
                </motion.div>
              ))}
              <p className="text-center text-xs text-muted-foreground pt-4">Son 30 günlük işlem geçmişi gösteriliyor</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </Layout>
  );
}
