import { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { useGetBrands, useGetCompetitions } from "@workspace/api-client-react";
import {
  Building2, Check, ChevronRight, Star, Trophy, Users,
  Zap, Shield, Crown, BarChart3, Mail, Globe, Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PACKAGES = [
  {
    name: "Bronze", icon: <Shield className="w-6 h-6 text-orange-400" />, color: "from-orange-900/50 to-amber-900/30",
    border: "border-orange-500/30", badge: "text-orange-400", price: "$2.500", period: "3 aylık",
    features: ["1 Marka Yarışması", "Sosyal Medya Duyurusu", "Temel Analitikler", "Marka Rozeti"],
  },
  {
    name: "Silver", icon: <Star className="w-6 h-6 text-slate-300" />, color: "from-slate-800/80 to-slate-700/50",
    border: "border-slate-400/40", badge: "text-slate-300", price: "$5.000", period: "6 aylık",
    features: ["2 Marka Yarışması", "Ana Sayfa Sponsorluğu", "Gelişmiş Analitikler", "Öncelikli Destek", "İçerik Elçisi Eşleştirme"],
    popular: true,
  },
  {
    name: "Gold", icon: <Crown className="w-6 h-6 text-yellow-400" />, color: "from-yellow-900/50 to-amber-900/30",
    border: "border-yellow-500/40", badge: "text-yellow-400", price: "$9.000", period: "12 aylık",
    features: ["4 Marka Yarışması", "Özel İçerik Alanı", "Tam Reklam Paneli", "Mikro Influencer Havuzu", "Canlı Etkinlik Desteği", "Özel Raporlama"],
  },
];

const STATS = [
  { icon: <Users className="w-5 h-5 text-cyan-400" />, val: "9.5K+", label: "Aktif Yetenek" },
  { icon: <BarChart3 className="w-5 h-5 text-green-400" />, val: "%87", label: "Etkileşim Oranı" },
  { icon: <Trophy className="w-5 h-5 text-yellow-400" />, val: "44", label: "Tamamlanan Yarışma" },
  { icon: <Zap className="w-5 h-5 text-primary" />, val: "15-30", label: "Yaş Aralığı" },
];

const WHY_US = [
  { icon: "🎯", title: "Z Kuşağına Doğrudan Erişim", desc: "15-30 yaş arası aktif sosyal medya kullanıcıları platformun çekirdeği." },
  { icon: "🤝", title: "Mikro Influencer Havuzu", desc: "Uygulama içi yetenekler markanın doğal içerik elçilerine dönüşür." },
  { icon: "🎮", title: "Oyunlaştırılmış Pazarlama", desc: "Klasik reklamlar yerine etkileşimli kampanyalar ile yüksek geri dönüş." },
  { icon: "💡", title: "KSS ve Yetenek Keşfi", desc: "Sosyal sorumluluk kapsamında genç yetenekleri destekleme fırsatı." },
  { icon: "📊", title: "Detaylı Kullanıcı Datasası", desc: "Kampanya bazlı analitikler ve raporlama desteği sunulur." },
  { icon: "🌐", title: "Çoklu Platform Entegrasyonu", desc: "TikTok, Reels ve Shorts ile kolay senkronizasyon." },
];

export default function BrandsPage() {
  const { data: brandsData, isLoading } = useGetBrands({});
  const { data: compsData } = useGetCompetitions({ limit: 4, status: "active" });

  const brands = brandsData?.brands ?? [];
  const competitions = compsData?.competitions ?? [];

  const [contactOpen, setContactOpen] = useState(false);

  return (
    <Layout>
      <div className="w-full pb-20">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-6 md:px-10 py-20 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/8 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.4) 0%, transparent 65%)" }} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-4 py-1.5 rounded-full mb-6">
              <Building2 className="w-3.5 h-3.5" /> Markalar İçin
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-black leading-tight mb-5">
              Markanızı{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                FenomenStar'da
              </span>{" "}
              Büyütün
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              9.500'den fazla genç yeteneğe ulaşın. Marka adınıza özel yarışmalar açın. Türkiye'nin en dinamik yetenek platformunda yerinizi alın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setContactOpen(true)}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold hover:scale-105 transition-all shadow-lg shadow-yellow-500/30">
                İş Birliği Başlat
              </button>
              <a href="#packages" className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all">
                Paketleri Gör
              </a>
            </div>
          </motion.div>
        </section>

        {/* ── İstatistikler ── */}
        <section className="px-4 md:px-10 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-white/10 rounded-2xl p-5 text-center">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <p className="text-3xl font-display font-black text-white">{s.val}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Neden FenomenStar? ── */}
        <section className="px-4 md:px-10 mb-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-display font-black text-center mb-2">Neden FenomenStar?</h2>
            <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">Markanızın dijital dünyada fark yaratması için ihtiyacınız olan her şey burada</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WHY_US.map((w, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="bg-card border border-white/5 rounded-2xl p-5 hover:border-yellow-500/20 transition-colors">
                  <span className="text-3xl mb-3 block">{w.icon}</span>
                  <h3 className="font-bold mb-1.5">{w.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Paketler ── */}
        <section id="packages" className="px-4 md:px-10 mb-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-display font-black text-center mb-2">İş Birliği Paketleri</h2>
            <p className="text-muted-foreground text-center mb-10">Markanızın hedeflerine uygun paketi seçin</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PACKAGES.map((pkg, i) => (
                <motion.div key={pkg.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={cn("relative rounded-3xl border-2 p-6 bg-gradient-to-b", pkg.border, pkg.color, pkg.popular && "ring-2 ring-slate-400/30")}>
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black bg-slate-300 text-black px-4 py-1 rounded-full">
                      EN POPÜLER
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">{pkg.icon}</div>
                    <div>
                      <span className={cn("text-xs font-bold uppercase tracking-widest", pkg.badge)}>{pkg.name}</span>
                      <p className="text-xs text-muted-foreground">{pkg.period}</p>
                    </div>
                  </div>
                  <p className="text-3xl font-display font-black mb-1">{pkg.price}</p>
                  <p className="text-xs text-muted-foreground mb-5">{pkg.period} · Tüm özellikler dahil</p>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className={cn("w-4 h-4 shrink-0", pkg.badge)} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setContactOpen(true)}
                    className={cn("w-full py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]",
                      pkg.popular ? "bg-slate-300 text-black hover:bg-white" : "bg-white/10 border border-white/20 text-white hover:bg-white/20")}>
                    Bu Paketi Seç
                  </button>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              Tüm paketlerde yarışma kazananına markanız adına ödül verilebilir (opsiyonel). Özel fiyatlandırma için iletişime geçin.
            </p>
          </div>
        </section>

        {/* ── Sponsor Markalar ── */}
        {brands.length > 0 && (
          <section className="px-4 md:px-10 mb-16">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-display font-black text-center mb-2">Platformumuzdaki Markalar</h2>
              <p className="text-muted-foreground text-center mb-8">Bu markalar zaten FenomenStar ile büyüyor</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading ? [...Array(8)].map((_, i) => (
                  <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
                )) : brands.map((brand: any, i: number) => (
                  <motion.div key={brand.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/brands/${brand.id}`} className="flex flex-col items-center gap-3 bg-card border border-white/5 hover:border-yellow-500/30 rounded-2xl p-5 text-center transition-all group">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} className="w-14 h-14 rounded-full object-cover" alt={brand.name} />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                          <span className="font-black text-black text-xl">{brand.name?.[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm group-hover:text-yellow-400 transition-colors">{brand.name}</p>
                        {brand.isVerified && <p className="text-[10px] text-cyan-400 font-bold mt-0.5">✓ Doğrulanmış</p>}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Aktif Marka Yarışmaları ── */}
        {competitions.length > 0 && (
          <section className="px-4 md:px-10 mb-16">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-black flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" /> Sponsorlu Yarışmalar
                </h2>
                <Link href="/competitions" className="text-sm text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                  Tümünü gör <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competitions.filter((c: any) => c.brandName).slice(0, 4).map((comp: any, i: number) => (
                  <Link key={comp.id} href={`/competitions/${comp.id}`} className="flex gap-4 bg-card border border-white/5 hover:border-yellow-500/20 rounded-2xl p-4 transition-all group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-yellow-900 to-orange-900">
                      <img src={comp.thumbnailUrl || `https://picsum.photos/seed/br${comp.id}/200`} className="w-full h-full object-cover" alt={comp.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {comp.brandName && <p className="text-xs font-bold text-yellow-400 mb-1">{comp.brandName}</p>}
                      <p className="font-bold text-sm line-clamp-2 group-hover:text-yellow-400 transition-colors">{comp.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{comp.participantCount ?? 0} katılımcı · {comp.category}</p>
                      {comp.prizeDescription && <p className="text-xs font-bold text-green-400 mt-1">🏆 {comp.prizeDescription}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── İletişim CTA ── */}
        <section className="px-4 md:px-10">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-yellow-900/40 via-orange-900/20 to-yellow-900/40 border border-yellow-500/20 rounded-3xl p-10">
            <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-display font-black mb-3">Markanızı FenomenStar'a Taşıyın</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Ekibimiz size özel sunum ve demo hazırlamak için sabırsızlanıyor. Hemen iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setContactOpen(true)}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold hover:scale-105 transition-all shadow-lg shadow-yellow-500/30">
                <Mail className="w-4 h-4" /> Teklif Al
              </button>
              <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all">
                <Globe className="w-4 h-4" /> Demo Talep Et
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* ── İletişim Modalı ── */}
      {contactOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setContactOpen(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-display font-black mb-2">İş Birliği Talebi</h3>
            <p className="text-muted-foreground text-sm mb-6">Bilgilerinizi bırakın, ekibimiz 24 saat içinde dönüş yapar.</p>
            <div className="space-y-3">
              {[
                { label: "Marka Adı", placeholder: "THY, Pepsi, Nike..." },
                { label: "İsim Soyisim", placeholder: "Ad Soyad" },
                { label: "E-posta", placeholder: "marka@sirket.com" },
                { label: "Telefon", placeholder: "+90 555 000 00 00" },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-white/70 mb-1 block">{f.label}</label>
                  <input placeholder={f.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">İlgilendiğiniz Paket</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors">
                  <option value="">Seçin...</option>
                  <option>Bronze — $2.500 / 3 ay</option>
                  <option>Silver — $5.000 / 6 ay</option>
                  <option>Gold — $9.000 / 12 ay</option>
                  <option>Özel Teklif</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setContactOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/15 transition-colors text-sm">
                İptal
              </button>
              <button onClick={() => { setContactOpen(false); }}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold hover:opacity-90 transition-opacity">
                Gönder
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
