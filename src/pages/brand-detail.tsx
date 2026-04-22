import { Layout } from "@/components/ui/Layout";
import { useRoute, Link } from "wouter";
import {
  Trophy,
  Users,
  BarChart3,
  Calendar,
  Check,
  ChevronLeft,
  Globe,
  Mail,
  Star,
  Zap,
  Building2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGetBrands, useGetCompetitions } from "@workspace/api-client-react";

export default function BrandDetailPage() {
  const route = useRoute("/brands/:id");
  const params = route[1] as { id?: string } | null;
  const id = params?.id ?? "";

  const { data: brandsData, isLoading: brandsLoading } = useGetBrands({});
  const { data: competitionsData, isLoading: competitionsLoading } = useGetCompetitions({ limit: 50 });

  const brand = (brandsData?.brands ?? []).find((item: any) => String(item.id) === id);
  const brandCompetitions = (competitionsData?.competitions ?? []).filter(
    (item: any) => String(item.brandId) === String(brand?.id) || item.brandName === brand?.name,
  );
  const activeComps = brandCompetitions.filter((item: any) => item.status === "active");
  const completedComps = brandCompetitions.filter((item: any) => item.status !== "active");

  if (brandsLoading || competitionsLoading) {
    return (
      <Layout>
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Marka bilgileri yükleniyor...
          </div>
        </div>
      </Layout>
    );
  }

  if (!brand) {
    return (
      <Layout>
        <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-card border border-white/5 rounded-3xl p-10">
            <h1 className="text-3xl font-display font-black mb-3">Marka bulunamadı</h1>
            <p className="text-muted-foreground mb-6">
              Bu marka kaydi artik aktif degil veya gecersiz bir baglanti acildi.
            </p>
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
              Markalara Don
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const cover = `https://picsum.photos/seed/brand-${brand.id}/1200/400`;
  const shortName = (brand.name || "F").trim();
  const joinDate = brand.createdAt
    ? new Date(brand.createdAt).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })
    : "FenomenStar";
  const totalParticipants =
    brand.totalParticipants ||
    brandCompetitions.reduce((sum: number, item: any) => sum + (item.participantCount || 0), 0);

  return (
    <Layout>
      <div className="w-full pb-20">
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img src={cover} className="w-full h-full object-cover" alt={brand.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <Link
            href="/brands"
            className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Markalar
          </Link>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="flex items-end gap-5 -mt-10 mb-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center border-4 border-background shadow-xl shrink-0">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} className="w-full h-full rounded-2xl object-cover" alt={brand.name} />
              ) : (
                <span className="font-black text-3xl text-black">{shortName[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-display font-black">{brand.name}</h1>
                {brand.isVerified && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3" /> Doğrulanmış Marka
                  </span>
                )}
                <span
                  className={cn(
                    "text-[11px] font-bold px-2.5 py-1 rounded-full",
                    brand.activeCompetitions > 1
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-slate-400/20 text-slate-300 border border-slate-400/30",
                  )}
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  Partner
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                Marka Profili
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { icon: <Trophy className="w-4 h-4 text-yellow-400" />, val: brandCompetitions.length, label: "Yarışma" },
              { icon: <Users className="w-4 h-4 text-cyan-400" />, val: totalParticipants.toLocaleString("tr-TR"), label: "Katılımcı" },
              { icon: <BarChart3 className="w-4 h-4 text-green-400" />, val: brand.activeCompetitions || activeComps.length, label: "Aktif Kampanya" },
              { icon: <Calendar className="w-4 h-4 text-primary" />, val: joinDate, label: "Uyelik" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className="bg-card border border-white/5 rounded-2xl p-4 text-center"
              >
                <div className="flex justify-center mb-2">{item.icon}</div>
                <p className="font-black text-lg">{item.val}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-card border border-white/5 rounded-2xl p-5 mb-6">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              Marka Hakkında
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {brand.description || `${brand.name}, FenomenStar uzerinde aktif kampanyalar ve yarismalar yurutuyor.`}
            </p>
            <div className="flex gap-3 flex-wrap">
              {brand.website && (
                <a
                  href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-3 py-2 rounded-full font-medium transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> {brand.website}
                </a>
              )}
              <a
                href={`mailto:marka@fenomenstar.com?subject=${encodeURIComponent(`${brand.name} is birligi talebi`)}`}
                className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-full font-medium transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> marka@fenomenstar.com
              </a>
            </div>
          </div>

          {activeComps.length > 0 && (
            <div className="mb-6">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Aktif Yarışmalar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeComps.map((competition: any) => (
                  <Link
                    key={competition.id}
                    href={`/competitions/${competition.id}`}
                    className="group flex gap-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/10 border border-yellow-500/20 hover:border-yellow-500/40 rounded-2xl p-4 transition-all"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={competition.thumbnailUrl || `https://picsum.photos/seed/competition-${competition.id}/300`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={competition.title}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        CANLI
                      </span>
                      <p className="font-bold text-sm mt-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {competition.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(competition.participantCount || 0).toLocaleString("tr-TR")} katilimci
                      </p>
                      {competition.prizeDescription && (
                        <p className="text-xs font-bold text-yellow-400 mt-1">Ödül: {competition.prizeDescription}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {completedComps.length > 0 && (
            <div className="mb-6">
              <h2 className="font-bold mb-4 text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Tamamlanan Yarışmalar
              </h2>
              <div className="space-y-3">
                {completedComps.map((competition: any) => (
                  <Link
                    key={competition.id}
                    href={`/competitions/${competition.id}`}
                    className="group flex items-center gap-4 bg-card border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all"
                  >
                    <div className="w-14 h-10 rounded-xl overflow-hidden shrink-0 opacity-70">
                      <img
                        src={competition.thumbnailUrl || `https://picsum.photos/seed/competition-${competition.id}/200`}
                        className="w-full h-full object-cover"
                        alt={competition.title}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-muted-foreground truncate">{competition.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(competition.participantCount || 0).toLocaleString("tr-TR")} katilimci
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                      Tamamlandi
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/20 border border-yellow-500/20 rounded-2xl p-6 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-bold mb-2">{brand.name} ile Is Birligi</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bu marka ile sponsorluk veya kampanya gorusmesi baslatmak icin markalar sayfasindan teklif olusturabilirsiniz.
            </p>
            <Link
              href="/brands#packages"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-full hover:scale-105 transition-all shadow-lg shadow-yellow-500/20 text-sm"
            >
              Paketleri Gor <ChevronLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
