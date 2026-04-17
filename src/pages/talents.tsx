import { useState, useEffect } from "react";
import { Layout } from "@/components/ui/Layout";
import { Users, Star, Heart, Eye, Trophy, Mic2, MapPin, Search, Filter, Play, Crown } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGetLeaderboard } from "@workspace/api-client-react";

const CATEGORIES = [
  { id: "all", label: "Tümü", icon: "⭐" },
  { id: "ses", label: "Ses & Şarkı", icon: "🎤" },
  { id: "dans", label: "Dans", icon: "💃" },
  { id: "karaoke", label: "Karaoke", icon: "🎵" },
  { id: "komedi", label: "Komedi", icon: "😂" },
  { id: "enstrüman", label: "Enstrüman", icon: "🎸" },
  { id: "spor", label: "Spor", icon: "⚽" },
  { id: "akrobasi", label: "Akrobasi", icon: "🤸" },
  { id: "tasarim", label: "Tasarım", icon: "🎨" },
];

const THEMATIC = [
  { id: "children", label: "🌟 Yıldız Çocuklar", color: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/20" },
  { id: "women", label: "🌸 Kadın Sahnesi", color: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/20" },
  { id: "plus35", label: "🎭 +35 Sahne Işığı", color: "from-purple-500/20 to-violet-500/10", border: "border-purple-500/20" },
  { id: "disabled", label: "🦋 Engelsiz Yetenekler", color: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/20" },
  { id: "april23", label: "🇹🇷 23 Nisan Özel", color: "from-red-500/20 to-rose-500/10", border: "border-red-500/20" },
  { id: "ramadan", label: "🌙 Ramazan Sahnesi", color: "from-green-500/20 to-emerald-500/10", border: "border-green-500/20" },
];

const CITIES = ["Tüm Şehirler", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana"];
const SORT_OPTIONS = [
  { id: "votes", label: "En Çok Oy" },
  { id: "views", label: "En Çok İzlenme" },
  { id: "recent", label: "En Yeni" },
  { id: "competitions", label: "En Çok Yarışma" },
];

function fmt(n: number | undefined | null) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

/* Demo yetenek verileri */
const DEMO_TALENTS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  username: ["zeynep_ses", "mehmet_dans", "ayse_muzik", "ahmet_komedi", "fatma_gitar", "ali_spor",
    "selin_karaoke", "emre_akrobasi", "yildiz_tasarim", "baris_ses", "dilan_dans", "serkan_enstruman",
    "ozlem_karaoke", "mustafa_spor", "elif_ses", "onur_dans", "nazli_komedi", "can_gitar",
    "merve_akrobasi", "burak_ses", "irem_dans", "koray_muzik", "pinar_karaoke", "omer_spor"][i],
  displayName: ["Zeynep Kaya", "Mehmet Yılmaz", "Ayşe Müzik", "Ahmet Komedi", "Fatma Gitar", "Ali Spor",
    "Selin Karaoke", "Emre Akrobasi", "Yıldız Tasarım", "Barış Ses", "Dilan Dans", "Serkan Enstrüman",
    "Özlem Karaoke", "Mustafa Spor", "Elif Ses", "Onur Dans", "Nazlı Komedi", "Can Gitar",
    "Merve Akrobasi", "Burak Ses", "İrem Dans", "Koray Müzik", "Pınar Karaoke", "Ömer Spor"][i],
  category: ["ses", "dans", "ses", "komedi", "enstrüman", "spor", "karaoke", "akrobasi", "tasarim",
    "ses", "dans", "enstrüman", "karaoke", "spor", "ses", "dans", "komedi", "enstrüman",
    "akrobasi", "ses", "dans", "ses", "karaoke", "spor"][i],
  city: ["İstanbul", "Ankara", "İzmir", "İstanbul", "Bursa", "Antalya", "İstanbul", "İzmir",
    "Ankara", "İstanbul", "İzmir", "Ankara", "İstanbul", "Bursa", "İstanbul", "İzmir",
    "Ankara", "İstanbul", "Antalya", "İstanbul", "İzmir", "Ankara", "İstanbul", "Bursa"][i],
  totalVotes: Math.floor(Math.random() * 50000) + 1000,
  totalViews: Math.floor(Math.random() * 200000) + 5000,
  badgeCount: Math.floor(Math.random() * 4),
  isVerified: i < 5,
  avatarUrl: `https://picsum.photos/seed/talent${i + 1}/200`,
  videoCount: Math.floor(Math.random() * 20) + 1,
  competitionCount: Math.floor(Math.random() * 8) + 1,
  rank: i + 1,
}));

export default function TalentsPage() {
  const [searchQ, setSearchQ] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("Tüm Şehirler");
  const [sort, setSort] = useState("votes");
  const [thematic, setThematic] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: lbData } = useGetLeaderboard({ period: "weekly" });
  const topPlayers = lbData?.entries?.slice(0, 3) ?? [];

  const filtered = DEMO_TALENTS
    .filter(t => {
      if (searchQ && !t.displayName.toLowerCase().includes(searchQ.toLowerCase()) &&
        !t.username.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (category !== "all" && t.category !== category) return false;
      if (city !== "Tüm Şehirler" && t.city !== city) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "votes") return b.totalVotes - a.totalVotes;
      if (sort === "views") return b.totalViews - a.totalViews;
      if (sort === "competitions") return b.competitionCount - a.competitionCount;
      return a.rank - b.rank;
    });

  return (
    <Layout>
      <div className="w-full pb-20">

        {/* ── Hero ── */}
        <section className="px-6 md:px-10 py-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full mb-5">
              <Users className="w-3.5 h-3.5" /> Yetenek Havuzu
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-black mb-3">Türkiye'nin Yetenekleri</h1>
            <p className="text-muted-foreground mb-6">9.500'den fazla kayıtlı yetenek arasından ilham al, keşfet, oy ver</p>

            {/* Arama */}
            <div className="relative max-w-md mx-auto">
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Yetenek adı veya kullanıcı ara..."
                className="w-full bg-card border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors shadow-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* ── TOP 3 (Sıralama liderboard'dan) ── */}
        {topPlayers.length > 0 && (
          <section className="px-4 md:px-10 mb-8">
            <h2 className="text-lg font-display font-black mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" /> Haftanın En İyileri
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {topPlayers.map((p: any, i: number) => (
                <motion.div key={p.userId} whileHover={{ y: -3 }}
                  className={cn("relative rounded-2xl p-4 text-center border", i === 0 ? "border-yellow-500/40 bg-yellow-500/5" : i === 1 ? "border-slate-400/30 bg-slate-400/5" : "border-orange-400/30 bg-orange-400/5")}>
                  <span className={cn("absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black px-2.5 py-0.5 rounded-full",
                    i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-slate-300 text-black" : "bg-orange-400 text-black")}>
                    #{i + 1}
                  </span>
                  <img src={p.avatarUrl || `https://picsum.photos/seed/top${p.userId}/200`}
                    className={cn("w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2", i === 0 ? "border-yellow-500" : i === 1 ? "border-slate-300" : "border-orange-400")}
                    alt={p.displayName} />
                  <p className="font-bold text-xs line-clamp-1">{p.displayName || p.username}</p>
                  <p className="text-[10px] text-muted-foreground">@{p.username}</p>
                  <p className={cn("text-sm font-black mt-1", i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : "text-orange-400")}>
                    {fmt(p.totalPoints)} puan
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Tematik Kategoriler ── */}
        <section className="px-4 md:px-10 mb-8">
          <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-muted-foreground">
            <Star className="w-4 h-4 text-primary" /> Tematik Kategoriler
          </h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {THEMATIC.map(t => (
              <button key={t.id} onClick={() => setThematic(th => th === t.id ? null : t.id)}
                className={cn("shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all",
                  thematic === t.id ? "bg-primary text-white border-primary" : `bg-gradient-to-r ${t.color} ${t.border} text-white hover:border-white/30`)}>
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Filtreler ── */}
        <section className="px-4 md:px-10 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Kategori */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={cn("shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all",
                    category === cat.id ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white")}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Filtre butonu */}
            <button onClick={() => setFilterOpen(o => !o)}
              className={cn("shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all",
                filterOpen ? "bg-primary/10 border-primary text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:text-white")}>
              <Filter className="w-3.5 h-3.5" /> Filtre
            </button>
          </div>

          {/* Genişletilmiş filtreler */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="flex flex-wrap gap-3 pt-3">
                  {/* Şehir */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Şehir</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {CITIES.map(c => (
                        <button key={c} onClick={() => setCity(c)}
                          className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                            city === c ? "bg-primary/20 border border-primary text-primary" : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white")}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Sıralama */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Sırala</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {SORT_OPTIONS.map(s => (
                        <button key={s.id} onClick={() => setSort(s.id)}
                          className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                            sort === s.id ? "bg-primary/20 border border-primary text-primary" : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white")}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Sonuç sayısı ── */}
        <div className="px-4 md:px-10 mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-white font-bold">{filtered.length}</span> yetenek bulundu
            {thematic && <span className="ml-2 text-primary">{THEMATIC.find(t => t.id === thematic)?.label}</span>}
          </p>
        </div>

        {/* ── Yetenek Kartları ── */}
        <section className="px-4 md:px-10">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">Arama kriterlerinize uygun yetenek bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((talent, i) => (
                <motion.div key={talent.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 8) * 0.04 }}>
                  <Link href={`/profile/${talent.id}`} className="block bg-card border border-white/5 hover:border-primary/30 rounded-2xl overflow-hidden transition-all group">
                    {/* Avatar */}
                    <div className="relative h-28 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden">
                      <img src={talent.avatarUrl} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" alt={talent.displayName} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      {talent.rank <= 3 && (
                        <span className={cn("absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full",
                          talent.rank === 1 ? "bg-yellow-500 text-black" : talent.rank === 2 ? "bg-slate-300 text-black" : "bg-orange-400 text-black")}>
                          #{talent.rank}
                        </span>
                      )}
                      {talent.isVerified && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold text-cyan-400 bg-cyan-400/20 border border-cyan-400/30 px-1.5 py-0.5 rounded-full">✓</span>
                      )}
                      <div className="absolute bottom-2 left-2">
                        <span className="text-[10px] bg-black/60 text-white/80 px-2 py-0.5 rounded-full">
                          {CATEGORIES.find(c => c.id === talent.category)?.icon} {CATEGORIES.find(c => c.id === talent.category)?.label}
                        </span>
                      </div>
                    </div>

                    {/* Bilgiler */}
                    <div className="p-3">
                      <p className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{talent.displayName}</p>
                      <p className="text-[11px] text-muted-foreground">@{talent.username}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {talent.city}
                      </div>
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/5">
                        <span className="flex items-center gap-1 text-[11px] text-pink-400">
                          <Heart className="w-3 h-3 fill-pink-400" /> {fmt(talent.totalVotes)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Trophy className="w-3 h-3" /> {talent.competitionCount}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Play className="w-3 h-3" /> {talent.videoCount}
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
