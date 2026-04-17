import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/ui/Layout";
import { Link } from "wouter";
import {
  useGetCompetitions, useGetVideos, useGetLeaderboard,
  useGetBrands, useGetKaraokeTracks,
} from "@workspace/api-client-react";
import {
  Play, TrendingUp, Star, Crown, ChevronRight,
  Users, Heart, Mic2, Trophy, Flame, Zap, Radio,
  Music, Award, ArrowRight, PlusSquare, MessageCircle, Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Küçük yardımcı: sayı biçimleme ─── */
function fmt(n: number | undefined | null) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

/* ─── Animasyonlu sayaç ─── */
function AnimCount({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return <>{fmt(val)}</>;
}

/* ─── Kategori listesi ─── */
const CATS = [
  { name: "Ses & Şarkı", icon: "🎤", color: "from-pink-600 to-rose-500",   slug: "ses"       },
  { name: "Dans",         icon: "💃", color: "from-violet-600 to-purple-500", slug: "dans"      },
  { name: "Karaoke",      icon: "🎵", color: "from-cyan-600 to-blue-500",   slug: "karaoke"   },
  { name: "Komedi",       icon: "😂", color: "from-orange-500 to-amber-500", slug: "komedi"    },
  { name: "Enstrüman",    icon: "🎸", color: "from-emerald-600 to-teal-500", slug: "enstrüman" },
  { name: "Futbol",       icon: "⚽", color: "from-lime-600 to-green-500",  slug: "futbol"    },
  { name: "Tasarım",      icon: "🎨", color: "from-fuchsia-600 to-pink-500", slug: "tasarim"   },
  { name: "Akrobasi",     icon: "🤸", color: "from-yellow-500 to-orange-500",slug: "akrobasi"  },
];

const STATUS_COLOR: Record<string, string> = {
  active:   "bg-emerald-500 text-white",
  upcoming: "bg-yellow-500 text-black",
  ended:    "bg-gray-500 text-white",
};
const STATUS_LABEL: Record<string, string> = {
  active: "AKTİF", upcoming: "YAKINDA", ended: "BİTTİ",
};

/* ─── Yarışma kartı ─── */
function CompCard({ comp }: { comp: any }) {
  const daysLeft = comp.endDate
    ? Math.max(0, Math.floor((new Date(comp.endDate).getTime() - Date.now()) / 86400000))
    : 0;
  return (
    <Link href={`/competitions/${comp.id}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-card border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full hover:border-primary/40 transition-colors duration-300"
      >
        {/* Thumbnail */}
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900">
          <img
            src={comp.thumbnailUrl || `https://picsum.photos/seed/c${comp.id}/600/300`}
            alt={comp.title}
            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          {/* Status badge */}
          <span className={cn(
            "absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest",
            STATUS_COLOR[comp.status] ?? STATUS_COLOR.upcoming
          )}>
            {STATUS_LABEL[comp.status] ?? "YAKINDA"}
          </span>
          {/* Brand badge */}
          {comp.brandName && (
            <span className="absolute top-3 left-3 text-[10px] font-bold bg-black/60 backdrop-blur text-yellow-400 px-2.5 py-1 rounded-full border border-yellow-400/30">
              {comp.brandName}
            </span>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col gap-3">
          <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {comp.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{comp.description}</p>

          <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{comp.participantCount ?? 0} katılımcı</span>
            </div>
            {daysLeft > 0 ? (
              <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                <Flame className="w-3 h-3" /> {daysLeft} gün
              </span>
            ) : null}
          </div>

          {comp.prizeDescription && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2">
              <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="text-xs font-semibold text-yellow-300 line-clamp-1">{comp.prizeDescription}</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Video kartı (dikey, TikTok tarzı) ─── */
function VideoCard({ video }: { video: any }) {
  return (
    <Link href={`/feed?videoId=${video.id}`} className="group block">
      <motion.div whileHover={{ scale: 1.03 }} className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-900 border border-white/5 group-hover:border-secondary/50 transition-all">
        <img
          src={video.thumbnailUrl || `https://picsum.photos/seed/v${video.id}/300/500`}
          alt={video.title}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
        {video.isKaraoke && (
          <span className="absolute top-2 left-2 text-[9px] font-bold bg-primary/80 backdrop-blur text-white px-2 py-0.5 rounded-full flex items-center gap-1">
            <Mic2 className="w-2.5 h-2.5" /> KAR
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs font-bold line-clamp-1 mb-1">{video.username}</p>
          <p className="text-[10px] text-gray-400 line-clamp-1 mb-2">{video.title}</p>
          <div className="flex items-center gap-3 text-[10px] text-gray-300">
            <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-pink-400 fill-pink-400" /> {fmt(video.voteCount)}</span>
            <span className="flex items-center gap-0.5"><Play className="w-3 h-3" /> {fmt(video.viewCount)}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Ana bileşen ─── */
export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const { data: compsData,  isLoading: compsLoading  } = useGetCompetitions({ limit: 6, status: "active" });
  const { data: videosData, isLoading: videosLoading } = useGetVideos({ limit: 8 });
  const { data: lbData }                               = useGetLeaderboard({ period: "weekly" });
  const { data: brandsData }                           = useGetBrands({});
  const { data: karaokeData }                          = useGetKaraokeTracks({ limit: 4 });

  const competitions = compsData?.competitions ?? [];
  const videos       = videosData?.videos ?? [];
  const topPlayers   = lbData?.entries?.slice(0, 3) ?? [];
  const brands       = brandsData?.brands ?? [];
  const karaokeTracks = karaokeData?.tracks ?? [];

  /* Hero slider (her 4 sn değiş) */
  useEffect(() => {
    if (!competitions.length) return;
    const t = setInterval(() => setActiveSlide(s => (s + 1) % Math.min(competitions.length, 3)), 4000);
    return () => clearInterval(t);
  }, [competitions.length]);

  const heroComp = competitions[activeSlide];

  return (
    <Layout>
      <div className="pb-16">

        {/* ══════════════════════════════════════════
            1. HERO — Tam ekran sinematik slider
        ══════════════════════════════════════════ */}
        <section className="relative w-full h-[520px] md:h-[600px] overflow-hidden">
          <AnimatePresence mode="wait">
            {heroComp ? (
              <motion.div
                key={heroComp.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img
                  src={heroComp.thumbnailUrl || `https://picsum.photos/seed/hero${heroComp.id}/1200/600`}
                  className="w-full h-full object-cover"
                  alt={heroComp.title}
                />
              </motion.div>
            ) : (
              /* Fallback gradient hero */
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a0030] via-[#0d001f] to-black" />
            )}
          </AnimatePresence>

          {/* Katmanlar */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

          {/* İçerik */}
          <div className="relative z-10 h-full flex flex-col justify-end pb-12 px-6 md:px-10 max-w-3xl">
            <motion.div
              key={`hero-text-${activeSlide}`}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {heroComp ? (
                <>
                  {heroComp.brandName && (
                    <span className="inline-flex items-center gap-1.5 mb-3 text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 rounded-full">
                      <Star className="w-3 h-3" /> {heroComp.brandName} Sponsorlu
                    </span>
                  )}
                  <h1 className="text-4xl md:text-6xl font-display font-black leading-tight mb-3">
                    {heroComp.title}
                  </h1>
                  <p className="text-gray-300 text-base md:text-lg mb-6 max-w-lg line-clamp-2">
                    {heroComp.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/competitions/${heroComp.id}`}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-primary to-accent font-bold text-white shadow-[0_0_30px_rgba(255,0,255,0.35)] hover:shadow-[0_0_40px_rgba(255,0,255,0.5)] hover:scale-105 transition-all"
                    >
                      <Trophy className="w-4 h-4" /> Hemen Katıl
                    </Link>
                    <Link
                      href="/competitions"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 backdrop-blur border border-white/20 font-bold text-white hover:bg-white/20 transition-all"
                    >
                      Tüm Yarışmalar <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-5xl md:text-7xl font-display font-black leading-tight mb-4">
                    İçindeki{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-[0_0_15px_rgba(255,0,255,0.4)]">
                      Yıldızı
                    </span>{" "}
                    Keşfet!
                  </h1>
                  <p className="text-gray-300 text-lg mb-6 max-w-lg">
                    Türkiye'nin en büyük yetenek platformuna katıl, markaların dikkatini çek.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/competitions" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-primary to-accent font-bold text-white shadow-[0_0_30px_rgba(255,0,255,0.35)] hover:scale-105 transition-all">
                      <Trophy className="w-4 h-4" /> Yarışmalara Katıl
                    </Link>
                    <Link href="/feed" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 backdrop-blur border border-white/20 font-bold text-white hover:bg-white/20 transition-all">
                      <Play className="w-4 h-4" /> Videoları İzle
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Slider dots */}
          {competitions.length > 1 && (
            <div className="absolute bottom-5 right-6 flex gap-1.5 z-10">
              {competitions.slice(0, 3).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === activeSlide ? "w-6 bg-primary" : "w-1.5 bg-white/30"
                  )}
                />
              ))}
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            2. İSTATİSTİK BARRI
        ══════════════════════════════════════════ */}
        <section className="relative -mt-1 z-20 px-4 md:px-8">
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto bg-card/80 backdrop-blur border border-white/10 rounded-2xl p-5 shadow-xl">
            {[
              { icon: <Users className="w-5 h-5 text-cyan-400" />,    label: "Yetenek",    val: 12847 },
              { icon: <Heart className="w-5 h-5 text-pink-400" />,    label: "Toplam Oy",  val: 3240000 },
              { icon: <Trophy className="w-5 h-5 text-yellow-400" />, label: "Yarışma",    val: 58 },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 text-center">
                {s.icon}
                <span className="text-xl md:text-2xl font-display font-black text-foreground">
                  <AnimCount target={s.val} />
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            3. KATEGORİLER
        ══════════════════════════════════════════ */}
        <section className="mt-10 px-4 md:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Kategoriler
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
            {CATS.map((cat, i) => (
              <Link key={i} href={`/search?q=${cat.slug}`} className="snap-start shrink-0">
                <motion.div
                  whileHover={{ y: -4, scale: 1.03 }}
                  className={cn(
                    "w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br p-3 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-lg",
                    cat.color
                  )}
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-xs font-bold text-white text-center leading-tight">{cat.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            4. AKTİF YARIŞMALAR (2 satır grid)
        ══════════════════════════════════════════ */}
        <section className="mt-12 px-4 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" /> Öne Çıkan Yarışmalar
            </h2>
            <Link href="/competitions" className="text-sm text-primary hover:underline flex items-center gap-1">
              Tümü <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {compsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {competitions.slice(0, 6).map(comp => (
                <CompCard key={comp.id} comp={comp} />
              ))}
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            5. HAFTALIK LİDERLİK TABLOSU (Top 3)
        ══════════════════════════════════════════ */}
        {topPlayers.length > 0 && (
          <section className="mt-14 px-4 md:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" /> Haftanın Yıldızları
              </h2>
              <Link href="/leaderboard" className="text-sm text-primary hover:underline flex items-center gap-1">
                Liderlik Tablosu <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topPlayers.map((player: any, idx: number) => {
                const medals = ["🥇","🥈","🥉"];
                const glows  = [
                  "shadow-[0_0_30px_rgba(250,204,21,0.25)] border-yellow-400/30",
                  "shadow-[0_0_20px_rgba(156,163,175,0.2)] border-gray-400/30",
                  "shadow-[0_0_20px_rgba(180,83,9,0.2)]   border-amber-600/30",
                ];
                return (
                  <motion.div
                    key={player.userId ?? idx}
                    whileHover={{ y: -4 }}
                    className={cn(
                      "bg-card border rounded-2xl p-5 flex items-center gap-4",
                      glows[idx] ?? "border-white/5"
                    )}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={player.avatarUrl || `https://picsum.photos/seed/p${idx}/200`}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
                        alt={player.displayName ?? player.username}
                      />
                      <span className="absolute -top-1 -right-1 text-lg">{medals[idx]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{player.displayName ?? player.username}</p>
                      <p className="text-xs text-muted-foreground truncate">@{player.username}</p>
                      <p className="text-sm font-bold text-yellow-400 mt-1 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" /> {fmt(player.score)} puan
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            6. TREND VİDEOLAR
        ══════════════════════════════════════════ */}
        <section className="mt-14 px-4 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" /> Trend Videolar
            </h2>
            <Link href="/feed" className="text-sm text-primary hover:underline flex items-center gap-1">
              Keşfet <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {videosLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[9/16] bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {videos.map(video => <VideoCard key={video.id} video={video} />)}
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════
            7. KARAOKE CTA
        ══════════════════════════════════════════ */}
        <section className="mt-14 px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a0040] via-[#2d0060] to-[#0d002a] border border-primary/30 p-8 md:p-12"
          >
            {/* Arka plan efekti */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(ellipse at 70% 50%, rgba(192,132,252,0.4) 0%, transparent 65%)" }}
            />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <Mic2 className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-black tracking-widest text-primary uppercase">Yeni Özellik</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-display font-black mb-2">
                  Karaoke Sahnesi
                </h3>
                <p className="text-gray-400 text-base mb-4 max-w-md">
                  Türkçe pop, türkü ve daha fazlası — Sesi kaydet, yarışmaya gönder, izleyicilerden oy topla!
                </p>
                {/* Şarkı önizlemeleri */}
                {karaokeTracks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {karaokeTracks.map((t: any) => (
                      <span key={t.id} className="text-xs bg-white/10 border border-white/10 rounded-full px-3 py-1 text-gray-300 flex items-center gap-1">
                        <Music className="w-3 h-3 text-primary" /> {t.title} — {t.artist}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href="/karaoke"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-accent font-bold text-white shadow-[0_0_25px_rgba(192,132,252,0.4)] hover:scale-105 transition-all"
                >
                  <Mic2 className="w-4 h-4" /> Hemen Söyle
                </Link>
              </div>
              <div className="hidden md:block text-[120px] leading-none select-none opacity-90">🎤</div>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════
            8. SPONSOR MARKALAR
        ══════════════════════════════════════════ */}
        {brands.length > 0 && (
          <section className="mt-14 px-4 md:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" /> Sponsorlarımız
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {brands.map((brand: any) => (
                <motion.div
                  key={brand.id}
                  whileHover={{ y: -3, scale: 1.03 }}
                  className="shrink-0 bg-card border border-white/10 rounded-2xl px-6 py-5 flex flex-col items-center gap-3 min-w-[140px] cursor-pointer hover:border-primary/40 transition-colors"
                >
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} className="w-12 h-12 rounded-full object-cover" alt={brand.name} />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="font-bold text-white text-lg">{brand.name?.[0]}</span>
                    </div>
                  )}
                  <span className="text-xs font-bold text-center text-foreground">{brand.name}</span>
                  {brand.isVerified && (
                    <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                      ✓ Doğrulandı
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            9. CANLI YAYIN CTA
        ══════════════════════════════════════════ */}
        <section className="mt-12 px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-red-500/30 p-7 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ background: "linear-gradient(135deg, #1a0008 0%, #2a0010 50%, #0d0005 100%)" }}
          >
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(239,68,68,0.4) 0%, transparent 65%)" }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> CANLI
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-black mb-2">
                Canlı Yayın Sahnesi
              </h3>
              <p className="text-gray-400 text-sm max-w-sm">
                WebRTC teknolojisi ile gerçek zamanlı yayın yap, izleyicilerden anlık oy topla!
              </p>
            </div>
            <Link
              href="/live-room"
              className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-red-500 hover:bg-red-400 font-bold text-white shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:scale-105 transition-all"
            >
              <Radio className="w-4 h-4" /> Yayın Başlat
            </Link>
          </motion.div>
        </section>


        {/* ══════════════════════════════════════════
            10. SOCIAL FEED — Son Paylaşımlar
        ══════════════════════════════════════════ */}
        {videos.length > 0 && (
          <section className="mt-14 px-4 md:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" /> Sosyal Akış
              </h2>
              <Link href="/feed" className="text-sm text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                Tümünü gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4 max-w-2xl">
              {videos.slice(0, 4).map((video: any, i: number) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex gap-4 bg-card rounded-2xl border border-white/5 p-4 hover:border-primary/20 transition-colors group"
                >
                  <Link href={`/feed?videoId=${video.id}`} className="shrink-0 relative w-20 h-28 rounded-xl overflow-hidden bg-gray-900">
                    <img
                      src={video.thumbnailUrl || `https://picsum.photos/seed/sf${video.id}/200/280`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={video.title}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={`https://picsum.photos/seed/av${video.id}/100`}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                        alt={video.username}
                      />
                      <div>
                        <p className="text-sm font-bold">@{video.username}</p>
                        <p className="text-[10px] text-muted-foreground">{video.category || "Müzik"}</p>
                      </div>
                      {video.isKaraoke && (
                        <span className="ml-auto text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Mic2 className="w-2.5 h-2.5" /> Karaoke
                        </span>
                      )}
                    </div>
                    <Link href={`/feed?videoId=${video.id}`} className="block">
                      <p className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{video.title}</p>
                      {video.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{video.description}</p>
                      )}
                    </Link>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                        <Heart className="w-3.5 h-3.5" /> {fmt(video.voteCount)}
                      </button>
                      <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" /> {video.commentCount || 0}
                      </button>
                      <button className="flex items-center gap-1 hover:text-white transition-colors">
                        <Share2 className="w-3.5 h-3.5" /> Paylaş
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ══════════════════════════════════════════
          QuickRecordButton — FAB
      ══════════════════════════════════════════ */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-24 right-6 z-50 md:bottom-8 md:right-8"
      >
        <Link href="/upload">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_0_30px_rgba(255,0,255,0.5)] flex items-center justify-center group relative"
          >
            <PlusSquare className="w-6 h-6 md:w-7 md:h-7 text-white" />
            <span className="absolute -top-10 right-0 bg-card border border-white/10 text-xs font-bold text-white px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
              Video Yükle
            </span>
          </motion.button>
        </Link>
      </motion.div>

    </Layout>
  );
}
