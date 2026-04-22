import { useMemo, useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { useGetCompetitions } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Clock, Users, Trophy, Flame, Crown, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active: { label: "AKTİF", cls: "bg-emerald-500 text-white" },
  upcoming: { label: "YAKINDA", cls: "bg-yellow-400 text-black" },
  ended: { label: "BİTTİ", cls: "bg-zinc-700 text-zinc-200" },
};

const CATEGORY_ICONS: Record<string, string> = {
  ses: "🎤",
  müzik: "🎵",
  dans: "💃",
  karaoke: "🎙️",
  komedi: "😂",
  enstrüman: "🎸",
  default: "⭐",
};

const SAMPLE_COMPETITIONS = [
  {
    id: "sample-thy-genclik",
    title: "THY Genç Yetenek Yarışması",
    description: "Sesini ve sahne enerjini göster, büyük ödüle uzan. Genç yetenekler için tanıtım amaçlı örnek yarışma vitrini.",
    category: "Ses",
    status: "active",
    thumbnailUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80",
    participantCount: 4821,
    prizeDescription: "150.000 TL büyük ödül",
    brandName: "THY",
    endDate: new Date(Date.now() + 12 * 86400000).toISOString(),
  },
  {
    id: "sample-pepsi-karaoke",
    title: "PepsiStar Karaoke Gecesi",
    description: "Karaoke performansını yükle, jüriyi etkile, sosyal akışta öne çık. Tanıtım amaçlı örnek içerik.",
    category: "Karaoke",
    status: "active",
    thumbnailUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
    participantCount: 2140,
    prizeDescription: "VIP sahne deneyimi",
    brandName: "Pepsi",
    endDate: new Date(Date.now() + 5 * 86400000).toISOString(),
  },
  {
    id: "sample-dans-ligi",
    title: "Sokak Dansı Bahar Ligi",
    description: "Dans performansını paylaş, oy topla, finale kal. Web vitrinini canlı göstermek için örnek yarışma içeriği.",
    category: "Dans",
    status: "upcoming",
    thumbnailUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80",
    participantCount: 980,
    prizeDescription: "Marka iş birliği paketi",
    brandName: "FenomenStar",
    endDate: new Date(Date.now() + 20 * 86400000).toISOString(),
  },
];

function getCatIcon(cat?: string) {
  if (!cat) return CATEGORY_ICONS.default;
  const lower = cat.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return value;
  }
  return CATEGORY_ICONS.default;
}

export default function Competitions() {
  const [filter, setFilter] = useState("all");
  const { data, isLoading } = useGetCompetitions({
    status: filter === "all" ? undefined : filter,
  });

  const competitions = data?.competitions ?? [];
  const sourceCompetitions = competitions.length > 0 ? competitions : SAMPLE_COMPETITIONS;

  const visibleCompetitions = useMemo(() => {
    if (filter === "all") return sourceCompetitions;
    return sourceCompetitions.filter((item: any) => item.status === filter);
  }, [filter, sourceCompetitions]);

  const featured = visibleCompetitions.find((item: any) => item.status === "active") ?? sourceCompetitions[0];

  return (
    <Layout>
      <div className="pb-16">
        <div className="px-4 md:px-8 pt-6 md:pt-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs text-primary font-black tracking-widest uppercase mb-2">FenomenStar</p>
              <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight">
                Yarışmalar
              </h1>
              <p className="text-muted-foreground mt-2 text-base">
                Yeteneğini göster, markaların dikkatini çek, ödülü kap.
              </p>
            </div>

            <div className="flex gap-2 bg-card p-1 rounded-xl border border-white/10 w-fit self-start md:self-auto">
              {[
                { id: "all", label: "Tümü" },
                { id: "active", label: "Aktif" },
                { id: "upcoming", label: "Yakında" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                    filter === item.id
                      ? "bg-primary text-white shadow-[0_0_15px_rgba(255,0,255,0.3)]"
                      : "text-muted-foreground hover:text-white hover:bg-white/5",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {featured && (
          <div className="px-4 md:px-8 mb-10">
            <Link href={`/competitions/${featured.id}`} className="group block">
              <motion.div whileHover={{ scale: 1.01 }} className="relative h-56 md:h-72 rounded-3xl overflow-hidden border border-white/10">
                <img
                  src={featured.thumbnailUrl || `https://picsum.photos/seed/feat${featured.id}/1200/500`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={featured.title}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-7 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> ÖNE ÇIKAN YARIŞMA
                    </span>
                    {featured.brandName && (
                      <span className="text-xs bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-bold px-3 py-1 rounded-full">
                        ⭐ {featured.brandName}
                      </span>
                    )}
                    {competitions.length === 0 && (
                      <span className="text-xs bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 font-bold px-3 py-1 rounded-full">
                        <Sparkles className="inline w-3.5 h-3.5 mr-1" />
                        Tanıtım İçeriği
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-display font-black text-white leading-tight mb-2">
                    {featured.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-300 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {featured.participantCount ?? 0} katılımcı
                    </span>
                    {featured.prizeDescription && (
                      <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                        <Trophy className="w-4 h-4" /> {featured.prizeDescription}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute top-5 right-5 px-4 py-2 rounded-full bg-primary font-bold text-sm text-white flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,0,255,0.4)] group-hover:shadow-[0_0_30px_rgba(255,0,255,0.6)] transition-all">
                  <Crown className="w-4 h-4" /> Katıl
                </div>
              </motion.div>
            </Link>
          </div>
        )}

        <div className="px-4 md:px-8 mb-5">
          {competitions.length === 0 ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              Bu bölümdeki kartların bir kısmı, web arayüzünü canlı göstermek için eklenmiş tanıtım amaçlı örnek içeriklerdir.
            </div>
          ) : null}
        </div>

        <div className="px-4 md:px-8">
          {isLoading && competitions.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-80 bg-white/5 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : visibleCompetitions.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Bu filtrede yarışma bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCompetitions.map((comp: any, index: number) => {
                const status = STATUS_MAP[comp.status] ?? STATUS_MAP.upcoming;
                const daysLeft = comp.endDate
                  ? Math.max(0, Math.floor((new Date(comp.endDate).getTime() - Date.now()) / 86400000))
                  : 0;
                const icon = getCatIcon(comp.category);

                return (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    whileHover={{ y: -5 }}
                  >
                    <Link href={`/competitions/${comp.id}`} className="group block h-full">
                      <div className="bg-card rounded-3xl overflow-hidden border border-white/5 hover:border-primary/40 transition-colors h-full flex flex-col">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={comp.thumbnailUrl || `https://picsum.photos/seed/comp${comp.id}/600/300`}
                            alt={comp.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                          <span className={cn("absolute top-3 right-3 text-[10px] font-black px-3 py-1 rounded-full tracking-widest", status.cls)}>
                            {status.label}
                          </span>

                          <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-black/60 backdrop-blur flex items-center justify-center text-lg border border-white/10">
                            {icon}
                          </div>

                          <div className="absolute bottom-3 left-4">
                            <p className="text-xs font-black text-primary uppercase tracking-wider">{comp.category}</p>
                            <h3 className="text-lg font-bold text-white leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                              {comp.title}
                            </h3>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col gap-4">
                          <p className="text-muted-foreground text-sm line-clamp-3 flex-1">{comp.description}</p>

                          <div className="space-y-2">
                            {comp.prizeDescription && (
                              <div className="flex items-center gap-2 text-sm">
                                <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
                                <span className="font-semibold text-yellow-300 line-clamp-1">{comp.prizeDescription}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm text-muted-foreground gap-3">
                              <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" /> {comp.participantCount ?? 0} katılımcı
                              </span>
                              {daysLeft > 0 && comp.status === "active" ? (
                                <span className="flex items-center gap-1 text-orange-400 font-bold">
                                  <Flame className="w-3.5 h-3.5" /> {daysLeft} gün
                                </span>
                              ) : comp.endDate ? (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {new Date(comp.endDate).toLocaleDateString("tr-TR")}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div
                            className={cn(
                              "w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all border flex items-center justify-center gap-2",
                              comp.status === "active"
                                ? "bg-primary/10 border-primary/30 text-primary group-hover:bg-primary group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_0_15px_rgba(255,0,255,0.3)]"
                                : "bg-white/5 border-white/10 text-muted-foreground",
                            )}
                          >
                            {comp.status === "active" ? (
                              <>
                                <Zap className="w-4 h-4" /> Detayları İncele
                              </>
                            ) : (
                              "İncele"
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
