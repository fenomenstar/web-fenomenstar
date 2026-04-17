import { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { useGetCompetitions } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Clock, Users, Trophy, Flame, Crown, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active:   { label: "AKTİF",   cls: "bg-emerald-500 text-white" },
  upcoming: { label: "YAKINDA", cls: "bg-yellow-400 text-black"  },
  ended:    { label: "BİTTİ",   cls: "bg-gray-600 text-gray-300" },
};

const CATEGORY_ICONS: Record<string, string> = {
  "ses":        "🎤",
  "müzik":      "🎵",
  "dans":       "💃",
  "karaoke":    "🎤",
  "komedi":     "😂",
  "enstrüman":  "🎸",
  "default":    "⭐",
};

function getCatIcon(cat?: string) {
  if (!cat) return CATEGORY_ICONS.default;
  const lower = cat.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(k)) return v;
  }
  return CATEGORY_ICONS.default;
}

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function Competitions() {
  const [filter, setFilter] = useState("all");
  const { data, isLoading } = useGetCompetitions({
    status: filter === "all" ? undefined : filter,
  });

  const competitions = data?.competitions ?? [];
  const featured = competitions.find(c => c.status === "active");

  return (
    <Layout>
      <div className="pb-16">

        {/* ── Sayfa Başlığı ── */}
        <div className="px-4 md:px-8 pt-6 md:pt-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs text-primary font-black tracking-widest uppercase mb-2">FenomenStar</p>
              <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight">
                Yarışmalar
              </h1>
              <p className="text-muted-foreground mt-2 text-base">
                Yeteneğini göster, markaların dikkatini çek, ödülü kap!
              </p>
            </div>

            {/* Filtre pill'leri */}
            <div className="flex gap-2 bg-card p-1 rounded-xl border border-white/10 w-fit self-start md:self-auto">
              {[
                { id: "all",      label: "Tümü"    },
                { id: "active",   label: "Aktif"   },
                { id: "upcoming", label: "Yaklaşan"},
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                    filter === f.id
                      ? "bg-primary text-white shadow-[0_0_15px_rgba(255,0,255,0.3)]"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Öne Çıkan Banner (sadece aktif filter veya tümü) ── */}
        {filter !== "ended" && featured && (
          <div className="px-4 md:px-8 mb-10">
            <Link href={`/competitions/${featured.id}`} className="group block">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative h-52 md:h-72 rounded-3xl overflow-hidden border border-white/10"
              >
                <img
                  src={featured.thumbnailUrl || `https://picsum.photos/seed/feat${featured.id}/1200/500`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={featured.title}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-7 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> ÖZEL YARIŞMA
                    </span>
                    {featured.brandName && (
                      <span className="text-xs bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-bold px-3 py-1 rounded-full">
                        ⭐ {featured.brandName}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-display font-black text-white leading-tight mb-2">
                    {featured.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {featured.participantCount ?? 0} katılımcı</span>
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

        {/* ── Yarışma Kartları Grid ── */}
        <div className="px-4 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-80 bg-white/5 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : competitions.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Bu filtrede yarışma bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((comp, i) => {
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
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -5 }}
                  >
                    <Link href={`/competitions/${comp.id}`} className="group block h-full">
                      <div className="bg-card rounded-3xl overflow-hidden border border-white/5 hover:border-primary/40 transition-colors h-full flex flex-col">

                        {/* Görsel */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={comp.thumbnailUrl || `https://picsum.photos/seed/comp${comp.id}/600/300`}
                            alt={comp.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                          {/* Durum rozeti */}
                          <span className={cn("absolute top-3 right-3 text-[10px] font-black px-3 py-1 rounded-full tracking-widest", status.cls)}>
                            {status.label}
                          </span>

                          {/* Kategori icon */}
                          <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-black/60 backdrop-blur flex items-center justify-center text-lg border border-white/10">
                            {icon}
                          </div>

                          {/* Kategori metin */}
                          <div className="absolute bottom-3 left-4">
                            <p className="text-xs font-black text-primary uppercase tracking-wider">{comp.category}</p>
                            <h3 className="text-lg font-bold text-white leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                              {comp.title}
                            </h3>
                          </div>
                        </div>

                        {/* İçerik */}
                        <div className="p-5 flex-1 flex flex-col gap-4">
                          <p className="text-muted-foreground text-sm line-clamp-2 flex-1">
                            {comp.description}
                          </p>

                          <div className="space-y-2">
                            {comp.prizeDescription && (
                              <div className="flex items-center gap-2 text-sm">
                                <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
                                <span className="font-semibold text-yellow-300 line-clamp-1">{comp.prizeDescription}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
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

                          <div className={cn(
                            "w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all border flex items-center justify-center gap-2",
                            comp.status === "active"
                              ? "bg-primary/10 border-primary/30 text-primary group-hover:bg-primary group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_0_15px_rgba(255,0,255,0.3)]"
                              : "bg-white/5 border-white/10 text-muted-foreground"
                          )}>
                            {comp.status === "active" ? <><Zap className="w-4 h-4" /> Detayları İncele</> : "İncele"}
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
