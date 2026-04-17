import { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { Check, Zap, Star, Crown, Rocket, X, CreditCard, ShieldCheck, ChevronRight, Flame, TrendingUp, Eye, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const PACKAGES = [
  {
    id: "baslangic",
    name: "Başlangıç",
    subtitle: "Ücretsiz",
    price: 0,
    period: "",
    color: "from-gray-600 to-gray-700",
    border: "border-white/10",
    glow: "",
    icon: Star,
    badge: null,
    features: [
      "Günlük 5 oy hakkı",
      "Video yükleme (720p)",
      "Temel profil sayfası",
      "Yarışmalara katılım",
      "Yorum yapma",
    ],
    locked: [
      "Öne çıkan listesi",
      "Süper oy (5x güç)",
      "Profil rozeti",
      "Sponsor görünürlüğü",
    ],
  },
  {
    id: "bronz",
    name: "Bronz Doping",
    subtitle: "Başla",
    price: 49,
    period: "/ ay",
    color: "from-amber-700 to-orange-600",
    border: "border-amber-600/40",
    glow: "shadow-amber-700/20",
    icon: Zap,
    badge: "Popüler",
    features: [
      "Günlük 25 oy hakkı (+20 bonus)",
      "Video yükleme (1080p)",
      "Bronz profil rozeti ✦",
      "Yarışma öne çıkarma (haftada 1)",
      "Yorum yapma + kalp tepkisi",
      "Arama sonuçlarında öncelik",
    ],
    locked: [
      "Süper oy (5x güç)",
      "Sponsor paneli görünürlüğü",
    ],
  },
  {
    id: "altin",
    name: "Altın Doping",
    subtitle: "En Çok Tercih",
    price: 149,
    period: "/ ay",
    color: "from-yellow-500 to-amber-400",
    border: "border-yellow-400/50",
    glow: "shadow-yellow-500/30",
    icon: Crown,
    badge: "⭐ En İyi",
    features: [
      "Günlük 100 oy hakkı (+95 bonus)",
      "Video yükleme (4K)",
      "Altın profil rozeti 👑",
      "Yarışma öne çıkarma (haftada 3)",
      "Süper oy hakkı — 5× daha güçlü",
      "Arama sonuçlarında üst sıra",
      "Sponsor markalarına görünürlük",
      "Aylık performans raporu",
    ],
    locked: [],
  },
  {
    id: "platin",
    name: "Platin Doping",
    subtitle: "Tam Güç",
    price: 299,
    period: "/ ay",
    color: "from-violet-500 via-purple-500 to-fuchsia-500",
    border: "border-violet-400/60",
    glow: "shadow-violet-500/40",
    icon: Rocket,
    badge: "🔥 Yıldız",
    features: [
      "Sınırsız oy hakkı 🔥",
      "Video yükleme (8K + öncelikli işleme)",
      "Platin profil rozeti ⬡ + animasyon",
      "Her gün öne çıkarma garantisi",
      "Süper oy (10× güç)",
      "Ana sayfada özel vitrin kartı",
      "Tüm sponsor markalarına görünürlük",
      "Haftalık performans raporu + danışmanlık",
      "Canlı yayın öncelikli sıra",
      "Özel karaoke içerik kütüphanesi",
    ],
    locked: [],
  },
];

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Daha Fazla Oy = Daha Yüksek Sıra",
    desc: "Bonus oy haklarınla yarışmada zirveye çık. Her ek oy, liderboard sıranı yukarı taşır.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Eye,
    title: "Öne Çıkma",
    desc: "Profilin ve videolarının ana sayfada, arama sonuçlarında ve sponsor panellerinde görünmesini sağla.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Gift,
    title: "Sponsor Fırsatları",
    desc: "Markalar Altın ve Platin kullanıcıları öncelikli keşfeder. Sponsorluk teklifleri doğrudan gel!",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Flame,
    title: "Süper Oy Gücü",
    desc: "Normal oyların 5-10 katı ağırlık taşıyan süper oylarla rakiplerinden hızlıca ayrışırsın.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

function PurchaseModal({ pkg, onClose }: { pkg: (typeof PACKAGES)[0]; onClose: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState<"confirm" | "pay" | "done">("confirm");
  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const formatCard = (val: string) => val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (val: string) => val.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 5);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("done");
    setTimeout(() => {
      toast({
        title: `🎉 ${pkg.name} Paketi Aktif!`,
        description: "Paketiniz hesabınıza tanımlandı. İyi şanslar!",
        className: "bg-card border border-primary/30",
      });
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Üst renk bandı */}
        <div className={cn("h-2 w-full bg-gradient-to-r", pkg.color)} />

        <div className="p-6">
          <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>

          {step === "confirm" && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white", pkg.color)}>
                  <pkg.icon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{pkg.name}</h2>
                  <p className="text-muted-foreground text-sm">{pkg.subtitle}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                {pkg.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4">
                <span className="text-muted-foreground">Aylık tutar</span>
                <span className="text-2xl font-black">{pkg.price} TL</span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                İstediğin zaman iptal edebilirsin. İlk aydan sonra otomatik yenilenir.
              </p>

              <button
                onClick={() => setStep("pay")}
                className={cn("w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r flex items-center justify-center gap-2 hover:opacity-90 transition-opacity", pkg.color)}
              >
                <CreditCard className="w-5 h-5" />
                Ödemeye Geç
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === "pay" && (
            <form onSubmit={handlePay} className="space-y-4">
              <h2 className="text-xl font-bold mb-1">Ödeme Bilgileri</h2>
              <p className="text-muted-foreground text-sm mb-4 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                256-bit SSL şifreli güvenli ödeme
              </p>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Kart Üzerindeki İsim</label>
                <input
                  required value={name} onChange={e => setName(e.target.value)}
                  placeholder="AD SOYAD"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Kart Numarası</label>
                <input
                  required value={cardNo} onChange={e => setCardNo(formatCard(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Son Kullanma</label>
                  <input
                    required value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                    placeholder="AA/YY"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">CVV</label>
                  <input
                    required value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="•••"
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 text-sm">
                <span className="text-muted-foreground">{pkg.name}</span>
                <span className="font-bold">{pkg.price} TL / ay</span>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("confirm")} className="flex-1 py-3 rounded-2xl border border-white/10 font-semibold hover:bg-white/5 transition-colors text-sm">
                  Geri
                </button>
                <button type="submit" className={cn("flex-2 flex-1 py-3 rounded-2xl font-bold text-white bg-gradient-to-r hover:opacity-90 transition-opacity", pkg.color)}>
                  {pkg.price} TL Öde
                </button>
              </div>
            </form>
          )}

          {step === "done" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold">Ödeme Alındı!</h2>
              <p className="text-muted-foreground">{pkg.name} paketi hesabınıza tanımlanıyor...</p>
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Doping() {
  const [selectedPkg, setSelectedPkg] = useState<(typeof PACKAGES)[0] | null>(null);
  const [annual, setAnnual] = useState(false);

  const getPrice = (price: number) => {
    if (annual && price > 0) return Math.round(price * 10);
    return price;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 pb-24 pt-6">

        {/* Başlık */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4" />
            Doping Paketleri
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black mb-4">
            Yeteneğini{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Hızlandır
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Daha fazla oy, daha yüksek görünürlük ve sponsor fırsatları ile diğer yarışmacılardan öne geç.
          </p>

          {/* Aylık / Yıllık geçiş */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={cn("text-sm font-medium", !annual ? "text-white" : "text-muted-foreground")}>Aylık</span>
            <button
              onClick={() => setAnnual(a => !a)}
              className={cn("w-12 h-6 rounded-full transition-colors relative", annual ? "bg-primary" : "bg-white/20")}
            >
              <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", annual ? "left-7" : "left-1")} />
            </button>
            <span className={cn("text-sm font-medium", annual ? "text-white" : "text-muted-foreground")}>
              Yıllık{" "}
              <span className="text-green-400 font-bold">%17 İndirim</span>
            </span>
          </div>
        </div>

        {/* Paket kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "relative rounded-3xl border bg-card flex flex-col overflow-hidden",
                pkg.border,
                pkg.id === "altin" ? "ring-2 ring-yellow-400/50 scale-[1.03]" : ""
              )}
            >
              {/* En İyi rozeti */}
              {pkg.badge && (
                <div className={cn(
                  "absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full",
                  pkg.id === "altin" ? "bg-yellow-400 text-black" : "bg-primary/20 text-primary border border-primary/30"
                )}>
                  {pkg.badge}
                </div>
              )}

              {/* Renk bandı + ikon */}
              <div className={cn("h-28 bg-gradient-to-br flex items-center justify-center", pkg.color)}>
                <pkg.icon className="w-12 h-12 text-white drop-shadow-lg" />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg mb-0.5">{pkg.name}</h3>
                <p className="text-muted-foreground text-xs mb-3">{pkg.subtitle}</p>

                {/* Fiyat */}
                <div className="mb-4">
                  {pkg.price === 0 ? (
                    <span className="text-3xl font-black">Ücretsiz</span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black">{getPrice(pkg.price)} TL</span>
                      <span className="text-muted-foreground text-sm mb-1">
                        {annual ? "/ yıl" : pkg.period}
                      </span>
                    </div>
                  )}
                  {annual && pkg.price > 0 && (
                    <p className="text-xs text-green-400 mt-0.5">
                      Aylık {pkg.price} TL yerine {Math.round(getPrice(pkg.price) / 12)} TL
                    </p>
                  )}
                </div>

                {/* Özellikler */}
                <ul className="space-y-2 flex-1 mb-5">
                  {pkg.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-white/80">
                      <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {pkg.locked.map((f, j) => (
                    <li key={`l${j}`} className="flex items-start gap-2 text-xs text-white/30">
                      <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Buton */}
                {pkg.price === 0 ? (
                  <div className="w-full py-3 rounded-2xl border border-white/10 text-center text-sm text-muted-foreground font-medium">
                    Mevcut Plan
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPkg(pkg)}
                    className={cn(
                      "w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r hover:opacity-90 transition-all hover:scale-[1.02] active:scale-100 text-sm shadow-lg",
                      pkg.color,
                      pkg.glow && `shadow-${pkg.glow}`
                    )}
                  >
                    Paketi Seç
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Avantajlar bölümü */}
        <div className="mb-16">
          <h2 className="text-2xl font-display font-bold text-center mb-8">
            Neden Doping Paketi Almalısın?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex gap-4 bg-card border border-white/10 rounded-2xl p-5"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", b.bg)}>
                  <b.icon className={cn("w-6 h-6", b.color)} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{b.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SSS */}
        <div className="bg-card border border-white/10 rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Sık Sorulan Sorular</h2>
          <div className="space-y-5">
            {[
              {
                q: "Paketi istediğim zaman iptal edebilir miyim?",
                a: "Evet. İstediğin zaman iptal edebilirsin ve kalan süre boyunca paket avantajlarından yararlanmaya devam edersin.",
              },
              {
                q: "Doping oyları yarışmada sayılıyor mu?",
                a: "Evet, tüm bonus oylar gerçek oy olarak sayılır ve liderboard sıranı etkiler.",
              },
              {
                q: "Hangi ödeme yöntemlerini kullanabilirim?",
                a: "Visa, Mastercard ve American Express kredi/banka kartlarınla güvenli ödeme yapabilirsin.",
              },
              {
                q: "Yıllık paket aldım, aylığa geçebilir miyim?",
                a: "Evet, mevcut dönemin sonunda istediğin plana geçiş yapabilirsin.",
              },
            ].map((item, i) => (
              <div key={i} className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
                <h4 className="font-semibold mb-2 text-white">{item.q}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Satın alma modalı */}
      <AnimatePresence>
        {selectedPkg && (
          <PurchaseModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
