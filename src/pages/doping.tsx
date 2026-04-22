import { Layout } from "@/components/ui/Layout";
import { Check, Crown, Download, Flame, Rocket, Star, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { PLAY_STORE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const packages = [
  {
    id: "baslangic",
    name: "Başlangıç",
    subtitle: "Ücretsiz",
    price: "0 TL",
    color: "from-gray-600 to-gray-700",
    border: "border-white/10",
    icon: Star,
    features: ["Temel profil", "Yarışmalara katılım", "Standart görünürlük"],
  },
  {
    id: "bronz",
    name: "Bronz Doping",
    subtitle: "Daha fazla görünürlük",
    price: "49 TL",
    color: "from-amber-700 to-orange-600",
    border: "border-amber-600/40",
    icon: Zap,
    features: ["Bonus oy hakkı", "Aramada öncelik", "Profil rozeti"],
  },
  {
    id: "altin",
    name: "Altın Doping",
    subtitle: "En çok tercih edilen",
    price: "149 TL",
    color: "from-yellow-500 to-amber-400",
    border: "border-yellow-400/50",
    icon: Crown,
    features: ["Daha güçlü oy", "Öne çıkarma", "Marka görünürlüğü"],
  },
  {
    id: "platin",
    name: "Platin Doping",
    subtitle: "Tam güç",
    price: "299 TL",
    color: "from-violet-500 via-purple-500 to-fuchsia-500",
    border: "border-violet-400/60",
    icon: Rocket,
    features: ["Sınırsız oy hakkı", "Vitrin alanı", "Öne çıkan performer"],
  },
];

export default function Doping() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 pb-24 pt-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4" />
            Doping Paketleri
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black mb-4">
            Doping satın alma{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              mobil uygulamada
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Webde paketleri inceleyebilirsin. Gerçek satın alma, coin kullanımı ve performans öne çıkarma işlemleri uygulamada aktif.
          </p>
          <div className="flex justify-center mt-6">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold hover:scale-105 transition-all shadow-lg shadow-primary/30"
            >
              <Download className="w-4 h-4" /> Uygulamayı İndir
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={cn("relative rounded-3xl border bg-card flex flex-col overflow-hidden", pkg.border)}
            >
              <div className={cn("h-28 bg-gradient-to-br flex items-center justify-center", pkg.color)}>
                <pkg.icon className="w-12 h-12 text-white drop-shadow-lg" />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg mb-0.5">{pkg.name}</h3>
                <p className="text-muted-foreground text-xs mb-3">{pkg.subtitle}</p>
                <div className="mb-4">
                  <span className="text-3xl font-black">{pkg.price}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Detaylı satın alma uygulamada tamamlanır</p>
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-white/80">
                      <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r hover:opacity-90 transition-all hover:scale-[1.02] active:scale-100 text-sm shadow-lg text-center",
                    pkg.color,
                  )}
                >
                  Uygulamada Satın Al
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            {
              icon: <TrendingUp className="w-6 h-6 text-primary" />,
              title: "Daha fazla görünürlük",
              desc: "Öne çıkarma ve bonus oy gücü uygulamada aktif olarak kullanılır.",
            },
            {
              icon: <Star className="w-6 h-6 text-yellow-400" />,
              title: "Rozet ve vitrin",
              desc: "Paket avantajları profil ve içerik görünümüne anında yansır.",
            },
            {
              icon: <Flame className="w-6 h-6 text-orange-400" />,
              title: "Canlı performans etkisi",
              desc: "Doping etkileri performanslar ve yarışma vitrini üzerinde kullanılır.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-white/10 rounded-2xl p-5">
              {item.icon}
              <h3 className="font-bold mt-3 mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-white/10 rounded-3xl p-6 md:p-8 text-center">
          <h2 className="text-2xl font-display font-black mb-3">Doping satın alma webde tanıtım olarak kalıyor</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Kredi kartı, coin bakiyesi, performans öne çıkarma ve satın alma doğrulaması mobil uygulama ile uyumlu çalışacak şekilde sadece uygulamada yönetiliyor.
          </p>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold hover:scale-105 transition-all shadow-lg shadow-primary/30"
          >
            <Download className="w-4 h-4" /> Uygulamayı İndir
          </a>
        </div>
      </div>
    </Layout>
  );
}
