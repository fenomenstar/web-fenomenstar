import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Filter, Heart, MapPin, Play, Search, Trophy, Users, Sparkles } from "lucide-react";
import { Layout } from "@/components/ui/Layout";
import { cn } from "@/lib/utils";
import { useGetLeaderboard, useGetTalents } from "@workspace/api-client-react";

const CATEGORIES = [
  { id: "all", label: "Tümü", icon: "⭐" },
  { id: "ses", label: "Ses & Şarkı", icon: "🎤" },
  { id: "dans", label: "Dans", icon: "💃" },
  { id: "karaoke", label: "Karaoke", icon: "🎵" },
  { id: "komedi", label: "Komedi", icon: "😂" },
  { id: "enstruman", label: "Enstrüman", icon: "🎸" },
  { id: "spor", label: "Spor", icon: "⚽" },
  { id: "akrobasi", label: "Akrobasi", icon: "🤸" },
  { id: "tasarim", label: "Tasarım", icon: "🎨" },
];

const CITIES = ["Tüm Şehirler", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana"];

const SORT_OPTIONS = [
  { id: "votes", label: "En Çok Oy" },
  { id: "views", label: "En Çok İzlenme" },
  { id: "recent", label: "En Yeni" },
  { id: "followers", label: "Takipçi" },
];

const SAMPLE_TALENTS = [
  {
    id: "sample-zeynep",
    displayName: "Zeynep Kaya",
    username: "zeynep_ses",
    category: "Ses & Şarkı",
    city: "İstanbul",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    totalVotes: 18400,
    totalViews: 96800,
    followers: 12400,
    totalPoints: 18400,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-cem",
    displayName: "Cem Aydın",
    username: "cem_ritim",
    category: "Enstrüman",
    city: "Ankara",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    totalVotes: 15200,
    totalViews: 74200,
    followers: 9100,
    totalPoints: 15200,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-melis",
    displayName: "Melis Demir",
    username: "melis_karaoke",
    category: "Karaoke",
    city: "İzmir",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    totalVotes: 14100,
    totalViews: 68100,
    followers: 7800,
    totalPoints: 14100,
    isVerified: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-arda",
    displayName: "Arda Eren",
    username: "arda_move",
    category: "Dans",
    city: "Bursa",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    totalVotes: 9800,
    totalViews: 52400,
    followers: 5600,
    totalPoints: 9800,
    isVerified: false,
    createdAt: new Date().toISOString(),
  },
];

function fmt(value: number | undefined | null) {
  if (!value) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function normalizeCategory(value?: string) {
  if (!value) return "all";
  const lowered = value.toLowerCase();
  const match = CATEGORIES.find((category) => lowered.includes(category.id));
  return match?.id || "all";
}

export default function TalentsPage() {
  const [searchQ, setSearchQ] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("Tüm Şehirler");
  const [sort, setSort] = useState("votes");
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: talentsData, isLoading } = useGetTalents();
  const { data: leaderboardData } = useGetLeaderboard({ period: "weekly" });

  const talents = talentsData?.talents ?? [];
  const sourceTalents = talents.length > 0 ? talents : SAMPLE_TALENTS;
  const topPlayers = (leaderboardData?.entries?.slice(0, 3) ?? []).length > 0
    ? leaderboardData?.entries?.slice(0, 3) ?? []
    : SAMPLE_TALENTS.slice(0, 3);

  const filtered = useMemo(() => {
    const lowered = searchQ.trim().toLowerCase();
    const result = sourceTalents.filter((talent: any) => {
      if (
        lowered &&
        ![talent.displayName, talent.username, talent.category, talent.city]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(lowered))
      ) {
        return false;
      }

      if (category !== "all" && normalizeCategory(talent.category) !== category) {
        return false;
      }

      if (city !== "Tüm Şehirler" && talent.city !== city) {
        return false;
      }

      return true;
    });

    result.sort((left: any, right: any) => {
      if (sort === "views") return (right.totalViews || 0) - (left.totalViews || 0);
      if (sort === "recent") return new Date(right.createdAt || right.created_at || 0).getTime() - new Date(left.createdAt || left.created_at || 0).getTime();
      if (sort === "followers") return (right.followers || 0) - (left.followers || 0);
      return (right.totalVotes || 0) - (left.totalVotes || 0);
    });

    return result;
  }, [sourceTalents, searchQ, category, city, sort]);

  return (
    <Layout>
      <div className="w-full pb-20">
        <section className="px-6 md:px-10 py-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full mb-5">
              <Users className="w-3.5 h-3.5" /> Yetenek Havuzu
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-black mb-3">
              Türkiye'nin Yetenekleri
            </h1>
            <p className="text-muted-foreground mb-6">
              Gerçek FenomenStar kullanıcılarını keşfet, profillerini incele, performanslarını takip et.
            </p>

            <div className="relative max-w-md mx-auto">
              <input
                value={searchQ}
                onChange={(event) => setSearchQ(event.target.value)}
                placeholder="Yetenek adı veya kullanıcı ara..."
                className="w-full bg-card border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors shadow-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </section>

        {talents.length === 0 && (
          <div className="px-4 md:px-10 mb-8">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              <Sparkles className="inline w-4 h-4 mr-2" />
              Bu bölümdeki bazı kartlar, web arayüzünü canlı göstermek için tanıtım amaçlı örnek yetenek verileriyle dolduruldu.
            </div>
          </div>
        )}

        {topPlayers.length > 0 && (
          <section className="px-4 md:px-10 mb-8">
            <h2 className="text-lg font-display font-black mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" /> Haftanın En İyileri
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {topPlayers.map((player: any, index: number) => (
                <motion.div
                  key={player.userId ?? player.id}
                  whileHover={{ y: -3 }}
                  className={cn(
                    "relative rounded-2xl p-4 text-center border",
                    index === 0
                      ? "border-yellow-500/40 bg-yellow-500/5"
                      : index === 1
                        ? "border-slate-400/30 bg-slate-400/5"
                        : "border-orange-400/30 bg-orange-400/5",
                  )}
                >
                  <span
                    className={cn(
                      "absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black px-2.5 py-0.5 rounded-full",
                      index === 0
                        ? "bg-yellow-500 text-black"
                        : index === 1
                          ? "bg-slate-300 text-black"
                          : "bg-orange-400 text-black",
                    )}
                  >
                    #{index + 1}
                  </span>
                  <img
                    src={player.avatarUrl || `https://picsum.photos/seed/top-${player.userId ?? player.id}/200`}
                    className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-white/10"
                    alt={player.displayName}
                  />
                  <p className="font-bold text-xs line-clamp-1">{player.displayName || player.username}</p>
                  <p className="text-[10px] text-muted-foreground">@{player.username}</p>
                  <p className="text-sm font-black mt-1 text-yellow-400">{fmt(player.totalPoints || player.totalVotes)} puan</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section className="px-4 md:px-10 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all",
                    category === item.id
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white",
                  )}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFilterOpen((value) => !value)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all",
                filterOpen
                  ? "bg-primary/10 border-primary text-primary"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:text-white",
              )}
            >
              <Filter className="w-3.5 h-3.5" /> Filtre
            </button>
          </div>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-3 pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Şehir</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {CITIES.map((item) => (
                        <button
                          key={item}
                          onClick={() => setCity(item)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                            city === item
                              ? "bg-primary/20 border border-primary text-primary"
                              : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white",
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Sırala</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {SORT_OPTIONS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSort(item.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                            sort === item.id
                              ? "bg-primary/20 border border-primary text-primary"
                              : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white",
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <div className="px-4 md:px-10 mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-white font-bold">{filtered.length}</span> yetenek bulundu
          </p>
        </div>

        <section className="px-4 md:px-10">
          {isLoading && talents.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-72 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">Arama kriterlerine uygun yetenek bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((talent: any, index: number) => (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 8) * 0.04 }}
                >
                  <Link
                    href={`/profile/${talent.id}`}
                    className="block bg-card border border-white/5 hover:border-primary/30 rounded-2xl overflow-hidden transition-all group"
                  >
                    <div className="relative h-28 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden">
                      <img
                        src={talent.avatarUrl || `https://picsum.photos/seed/talent-${talent.id}/200`}
                        className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                        alt={talent.displayName}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      {talent.isVerified && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold text-cyan-400 bg-cyan-400/20 border border-cyan-400/30 px-1.5 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                      <div className="absolute bottom-2 left-2">
                        <span className="text-[10px] bg-black/60 text-white/80 px-2 py-0.5 rounded-full">
                          {CATEGORIES.find((item) => item.id === normalizeCategory(talent.category))?.icon}{" "}
                          {talent.category || "FenomenStar"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {talent.displayName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">@{talent.username}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {talent.city || "Türkiye"}
                      </div>
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/5">
                        <span className="flex items-center gap-1 text-[11px] text-pink-400">
                          <Heart className="w-3 h-3 fill-pink-400" /> {fmt(talent.totalVotes)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Trophy className="w-3 h-3" /> {fmt(talent.followers)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Play className="w-3 h-3" /> {fmt(talent.totalViews)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
