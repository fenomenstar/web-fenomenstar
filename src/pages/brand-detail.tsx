import { Layout } from "@/components/ui/Layout";
import { useRoute, Link } from "wouter";
import { Trophy, Users, BarChart3, Calendar, Check, ChevronLeft, Globe, Mail, Star, Play, Zap, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BRANDS: Record<string, any> = {
  "1": {
    id: 1, name: "THY (Turkish Airlines)", shortName: "THY",
    logo: null, cover: "https://picsum.photos/seed/thy_cover/1200/400",
    verified: true, plan: "Gold",
    industry: "Havacılık & Ulaşım",
    description: "Türkiye'nin küresel havayolu şirketi olarak FenomenStar'da genç yetenekleri destekliyoruz. THYSTAR yarışmamıza katılarak müzik, dans ve performans dünyasında adını duyur!",
    website: "thy.com", email: "sponsorluk@thy.com",
    totalCompetitions: 4, totalParticipants: 12400, totalPrize: "200.000 ₺",
    joinDate: "Kasım 2025",
    competitions: [
      { id: 1, title: "THY Ses Yarışması 2026", prize: "50.000 ₺", status: "active", participants: 3200, endDate: "30 Nisan 2026", category: "Ses", thumb: "https://picsum.photos/seed/thyc1/300" },
      { id: 2, title: "THY Dans Festivali", prize: "40.000 ₺", status: "completed", participants: 2800, endDate: "15 Şubat 2026", category: "Dans", thumb: "https://picsum.photos/seed/thyc2/300" },
      { id: 3, title: "THYSTAR Karaoke Gecesi", prize: "30.000 ₺", status: "completed", participants: 1900, endDate: "10 Ocak 2026", category: "Karaoke", thumb: "https://picsum.photos/seed/thyc3/300" },
    ],
  },
  "2": {
    id: 2, name: "PepsiCo Turkey", shortName: "Pepsi",
    logo: null, cover: "https://picsum.photos/seed/pepsi_cover/1200/400",
    verified: true, plan: "Silver",
    industry: "İçecek & Gıda",
    description: "PepsiStar dans yarışmasıyla Türkiye'nin en yetenekli dansçılarını keşfediyoruz. Enerjini sahneye taşı!",
    website: "pepsi.com.tr", email: "marketing@pepsi.com.tr",
    totalCompetitions: 2, totalParticipants: 5600, totalPrize: "60.000 ₺",
    joinDate: "Ocak 2026",
    competitions: [
      { id: 2, title: "PepsiStar Dans Yarışması", prize: "30.000 ₺", status: "active", participants: 3200, endDate: "15 Mayıs 2026", category: "Dans", thumb: "https://picsum.photos/seed/pepsicomp/300" },
    ],
  },
};

export default function BrandDetailPage() {
  const [, params] = useRoute("/brands/:id");
  const id = params?.id ?? "1";
  const brand = BRANDS[id] ?? BRANDS["1"];

  const activeComps = brand.competitions.filter((c: any) => c.status === "active");
  const completedComps = brand.competitions.filter((c: any) => c.status === "completed");

  return (
    <Layout>
      <div className="w-full pb-20">

        {/* ── Cover ── */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img src={brand.cover} className="w-full h-full object-cover" alt={brand.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <Link href="/brands" className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" /> Markalar
          </Link>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6">

          {/* ── Brand Header ── */}
          <div className="flex items-end gap-5 -mt-10 mb-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center border-4 border-background shadow-xl shrink-0">
              <span className="font-black text-3xl text-black">{brand.shortName[0]}</span>
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-display font-black">{brand.name}</h1>
                {brand.verified && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3" /> Doğrulanmış Marka
                  </span>
                )}
                <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full",
                  brand.plan === "Gold" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                  brand.plan === "Silver" ? "bg-slate-400/20 text-slate-300 border border-slate-400/30" :
                  "bg-orange-500/20 text-orange-400 border border-orange-500/30")}>
                  ⭐ {brand.plan} Partner
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" /> {brand.industry}
              </p>
            </div>
          </div>

          {/* ── İstatistikler ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { icon: <Trophy className="w-4 h-4 text-yellow-400" />, val: brand.totalCompetitions, label: "Yarışma" },
              { icon: <Users className="w-4 h-4 text-cyan-400" />, val: brand.totalParticipants.toLocaleString("tr-TR"), label: "Katılımcı" },
              { icon: <BarChart3 className="w-4 h-4 text-green-400" />, val: brand.totalPrize, label: "Toplam Ödül" },
              { icon: <Calendar className="w-4 h-4 text-primary" />, val: brand.joinDate, label: "Üyelik" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-card border border-white/5 rounded-2xl p-4 text-center">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <p className="font-black text-lg">{s.val}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Hakkında ── */}
          <div className="bg-card border border-white/5 rounded-2xl p-5 mb-6">
            <h2 className="font-bold mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> Marka Hakkında</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{brand.description}</p>
            <div className="flex gap-3 flex-wrap">
              <a href={`https://${brand.website}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-3 py-2 rounded-full font-medium transition-colors">
                <Globe className="w-3.5 h-3.5" /> {brand.website}
              </a>
              <a href={`mailto:${brand.email}`}
                className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-full font-medium transition-colors">
                <Mail className="w-3.5 h-3.5" /> {brand.email}
              </a>
            </div>
          </div>

          {/* ── Aktif Yarışmalar ── */}
          {activeComps.length > 0 && (
            <div className="mb-6">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Aktif Yarışmalar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeComps.map((comp: any) => (
                  <Link key={comp.id} href={`/competitions/${comp.id}`}
                    className="group flex gap-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/10 border border-yellow-500/20 hover:border-yellow-500/40 rounded-2xl p-4 transition-all">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <img src={comp.thumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={comp.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">🔴 CANLI</span>
                      <p className="font-bold text-sm mt-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">{comp.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{comp.participants.toLocaleString("tr-TR")} katılımcı</p>
                      <p className="text-xs font-bold text-yellow-400 mt-1">🏆 {comp.prize} · {comp.endDate}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Geçmiş Yarışmalar ── */}
          {completedComps.length > 0 && (
            <div className="mb-6">
              <h2 className="font-bold mb-4 text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Tamamlanan Yarışmalar
              </h2>
              <div className="space-y-3">
                {completedComps.map((comp: any) => (
                  <Link key={comp.id} href={`/competitions/${comp.id}`}
                    className="group flex items-center gap-4 bg-card border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all">
                    <div className="w-14 h-10 rounded-xl overflow-hidden shrink-0 opacity-70">
                      <img src={comp.thumb} className="w-full h-full object-cover" alt={comp.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-muted-foreground truncate">{comp.title}</p>
                      <p className="text-xs text-muted-foreground">{comp.participants.toLocaleString("tr-TR")} katılımcı · {comp.endDate}</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shrink-0">Tamamlandı</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/20 border border-yellow-500/20 rounded-2xl p-6 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-bold mb-2">{brand.name} ile İş Birliği</h3>
            <p className="text-sm text-muted-foreground mb-4">Bu markaya sponsorluk başvurusu yapmak için Markalar sayfasını ziyaret edin.</p>
            <Link href="/brands#packages"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-full hover:scale-105 transition-all shadow-lg shadow-yellow-500/20 text-sm">
              Paketleri Gör <ChevronLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}
