import { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { useGetMe, useGetUserVideos } from "@workspace/api-client-react";
import {
  Settings, Play, Star, Award, Grid, MapPin, Heart, Eye,
  LogIn, Mic2, BarChart3, FileText, Download, Briefcase,
  GraduationCap, Trophy, TrendingUp, Users, Calendar,
  Music, Zap, Check, Phone, Mail, Globe, Camera, ExternalLink,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const BADGE_LIST = [
  { icon: "🏆", label: "Şampiyon",       color: "from-yellow-500 to-amber-600",  earned: true  },
  { icon: "🎤", label: "Ses Yıldızı",    color: "from-pink-500 to-rose-600",     earned: true  },
  { icon: "🔥", label: "Trend",          color: "from-orange-500 to-red-600",    earned: true  },
  { icon: "⭐", label: "Haftanın Yıldızı", color: "from-yellow-400 to-yellow-600", earned: false },
  { icon: "👑", label: "Jüri Ustası",    color: "from-purple-500 to-violet-600", earned: false },
  { icon: "💎", label: "Elmas Üye",      color: "from-cyan-500 to-blue-600",     earned: false },
];

type ProfileTab = "videos" | "karaoke" | "stats" | "badges" | "cv";

const DEMO_USER = {
  id: 0, username: "zeynep_ses", displayName: "Zeynep Kaya",
  avatarUrl: "https://picsum.photos/seed/demouser/300",
  city: "İstanbul", category: "Ses", role: "talent",
  bio: "Müzik benim hayatım! İstanbul'dan sesimi dünyaya duyuruyorum. Yarışmalarda destek ver! 🎤🚀",
  isVerified: true, totalVotes: 12500, totalViews: 84000, badgeCount: 3,
  phone: "+90 555 123 45 67", email: "zeynep@example.com", website: "",
  education: "İstanbul Üniversitesi — Müzik Bölümü",
  birthYear: 1999, followers: 4820, following: 312,
  socialLinks: {
    tiktok:    { handle: "@zeynep_ses",       url: "https://tiktok.com/@zeynep_ses",       followers: "48.2K" },
    instagram: { handle: "@zeynep_ses",       url: "https://instagram.com/zeynep_ses",     followers: "31.5K" },
    youtube:   { handle: "Zeynep Kaya Müzik", url: "https://youtube.com/@zeynepkayamuzik", followers: "12.1K" },
    facebook:  { handle: "Zeynep Kaya",       url: "https://facebook.com/zeynepkayases",   followers: "8.9K"  },
    bigopigo:  { handle: "@zeynep_ses",       url: "https://bigo.tv/zeynep_ses",           followers: "5.3K"  },
  },
};

const SOCIAL_PLATFORMS = [
  {
    key: "tiktok",
    label: "TikTok",
    icon: "🎵",
    color: "from-[#010101] to-[#69C9D0]",
    border: "border-[#69C9D0]/30",
    text: "text-[#69C9D0]",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: "📸",
    color: "from-[#833AB4] to-[#F56040]",
    border: "border-pink-500/30",
    text: "text-pink-400",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: "▶️",
    color: "from-[#FF0000] to-[#CC0000]",
    border: "border-red-500/30",
    text: "text-red-400",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: "👥",
    color: "from-[#1877F2] to-[#0c5fcd]",
    border: "border-blue-500/30",
    text: "text-blue-400",
  },
  {
    key: "bigopigo",
    label: "BIGO Live",
    icon: "🎙️",
    color: "from-[#00C471] to-[#009955]",
    border: "border-green-500/30",
    text: "text-green-400",
  },
];

const DEMO_VIDEOS = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1, title: `Performans ${i + 1}`,
  thumbnailUrl: `https://picsum.photos/seed/demovid${i + 1}/300/400`,
  voteCount: Math.floor(Math.random() * 5000) + 500,
  views: Math.floor(Math.random() * 20000) + 1000,
  category: i % 2 === 0 ? "Ses" : "Karaoke",
}));

const MONTHLY_VOTES = [
  { m: "Eki", v: 800 }, { m: "Kas", v: 1200 }, { m: "Ara", v: 1800 },
  { m: "Oca", v: 2400 }, { m: "Şub", v: 3100 }, { m: "Mar", v: 3900 },
];

export default function Profile() {
  const { data: user, isLoading: userLoading, isError } = useGetMe({ query: { retry: false } });
  const { data: videosData, isLoading: videosLoading } = useGetUserVideos(user?.id || 0, { query: { enabled: !!user?.id } });

  const [activeTab, setActiveTab] = useState<ProfileTab>("videos");

  if (userLoading) {
    return (
      <Layout>
        <div className="p-8 space-y-6 animate-pulse">
          <div className="h-48 bg-white/5 rounded-3xl" />
          <div className="h-8 w-48 bg-white/5 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}</div>
        </div>
      </Layout>
    );
  }

  const isDemoMode = !user || isError;
  const displayUser = isDemoMode ? DEMO_USER : { ...DEMO_USER, ...user };
  const allVideos = isDemoMode ? DEMO_VIDEOS : (videosData ?? []);
  const videos = allVideos.filter((v: any) => v.category !== "Karaoke");
  const karaokeVideos = allVideos.filter((v: any) => v.category === "Karaoke");

  const TABS: { id: ProfileTab; label: string; icon: any }[] = [
    { id: "videos",  label: "Videolar",     icon: Grid },
    { id: "karaoke", label: "Karaoke",      icon: Mic2 },
    { id: "stats",   label: "İstatistikler", icon: BarChart3 },
    { id: "badges",  label: "Rozetler",     icon: Award },
    { id: "cv",      label: "CV",           icon: FileText },
  ];

  const maxVote = Math.max(...MONTHLY_VOTES.map(x => x.v));

  return (
    <Layout>
      <div className="w-full pb-16">

        {/* Demo modu banner */}
        {isDemoMode && (
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-center sm:text-left">
              <span className="font-bold text-primary">👀 Demo Profili</span>
              <span className="text-muted-foreground ml-2">— Kendi profilin için giriş yap</span>
            </p>
            <div className="flex gap-2 shrink-0">
              <Link href="/login" className="text-xs font-bold px-4 py-1.5 bg-primary text-white rounded-full hover:opacity-90 transition-opacity">Giriş Yap</Link>
              <Link href="/register" className="text-xs font-bold px-4 py-1.5 bg-white/10 border border-white/20 text-white rounded-full hover:bg-white/20 transition-all">Kaydol</Link>
            </div>
          </div>
        )}

        {/* Kapak */}
        <div className="relative h-52 md:h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30" />
          <div className="absolute inset-0" style={{ backgroundImage: `url(https://picsum.photos/seed/cover${displayUser.id}/1200/400)`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.22 }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          {!isDemoMode && (
            <button className="absolute top-4 right-4 p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/70 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative -mt-20">

          {/* Avatar + İsim */}
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-end mb-6">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-b from-primary to-accent shrink-0 shadow-[0_0_30px_rgba(255,0,255,0.25)]">
              <img src={displayUser.avatarUrl || `https://picsum.photos/seed/user${displayUser.id}/300`} className="w-full h-full rounded-full object-cover bg-card" alt={displayUser.username} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl md:text-3xl font-display font-black">{displayUser.displayName || displayUser.username}</h1>
                {displayUser.isVerified && <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">✓ Doğrulanmış</span>}
                <span className="text-xs bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full text-muted-foreground">Yetenek</span>
              </div>
              <p className="text-muted-foreground font-medium mb-3">@{displayUser.username}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs">
                  <MapPin className="w-3 h-3 text-primary" /> {displayUser.city || "İstanbul"}
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs">
                  <Award className="w-3 h-3 text-accent" /> {displayUser.category || "Ses"}
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs">
                  <Calendar className="w-3 h-3 text-muted-foreground" /> {new Date().getFullYear() - (displayUser.birthYear || 1999)} yaşında
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {isDemoMode ? (
                <Link href="/login" className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Giriş Yap
                </Link>
              ) : (
                <button className="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Düzenle
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-300 mb-4 max-w-2xl leading-relaxed text-sm">{displayUser.bio}</p>

          {/* Diğer Platformlar */}
          {displayUser.socialLinks && (
            <div className="mb-6">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Diğer Platformlardaki Hesaplarım
              </p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS.map(platform => {
                  const link = (displayUser.socialLinks as Record<string, { handle: string; url: string; followers: string }>)[platform.key];
                  if (!link) return null;
                  return (
                    <a
                      key={platform.key}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-xl border bg-white/5 hover:bg-white/10 transition-all group",
                        platform.border,
                      )}
                    >
                      <span className="text-base leading-none">{platform.icon}</span>
                      <div className="flex flex-col leading-none">
                        <span className={cn("text-[11px] font-bold", platform.text)}>{platform.label}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{link.handle} · {link.followers}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-white transition-colors ml-0.5" />
                    </a>
                  );
                })}
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/20 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-all">
                  + Platform Ekle
                </button>
              </div>
            </div>
          )}

          {/* Takipçi + Stat bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { icon: <Heart className="w-4 h-4 text-pink-400" />,    val: formatNumber(displayUser.totalVotes || 12500), label: "Toplam Oy" },
              { icon: <Eye className="w-4 h-4 text-cyan-400" />,      val: formatNumber(displayUser.totalViews || 84000), label: "Görüntülenme" },
              { icon: <Users className="w-4 h-4 text-green-400" />,   val: formatNumber(displayUser.followers || 4820),  label: "Takipçi" },
              { icon: <Trophy className="w-4 h-4 text-yellow-400" />, val: displayUser.badgeCount || 3,                 label: "Rozet" },
              { icon: <Play className="w-4 h-4 text-primary" />,      val: allVideos.length,                             label: "Video" },
            ].map((s, i) => (
              <div key={i} className="bg-card border border-white/5 rounded-2xl p-3 text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-xl font-black">{s.val}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Sekmeler */}
          <div className="flex items-center gap-1 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={cn("flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all font-medium text-sm whitespace-nowrap shrink-0",
                  activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white")}>
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── Videolar ── */}
            {(activeTab === "videos" || activeTab === "karaoke") && (
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {videosLoading ? (
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />)}
                  </div>
                ) : (activeTab === "videos" ? allVideos : karaokeVideos).length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Play className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Henüz video yok.</p>
                    <Link href="/upload" className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                      <Zap className="w-4 h-4" /> İlk videoyu yükle
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {(activeTab === "videos" ? allVideos : karaokeVideos).map((video: any) => (
                      <Link key={video.id} href={`/feed?videoId=${video.id}`}
                        className="relative aspect-[3/4] group cursor-pointer overflow-hidden rounded-xl block">
                        <img src={video.thumbnailUrl || `https://picsum.photos/seed/pv${video.id}/300/400`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={video.title} />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-white fill-white drop-shadow-lg" />
                        </div>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-bold drop-shadow-md">
                          <Heart className="w-3 h-3 text-pink-400 fill-pink-400" /> {formatNumber(video.voteCount || 0)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── İstatistikler ── */}
            {activeTab === "stats" && (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

                {/* Trend grafik (bar chart ile) */}
                <div className="bg-card border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Aylık Oy Trendi</h3>
                  <p className="text-xs text-muted-foreground mb-5">Son 6 aylık oy istatistiği</p>
                  <div className="flex items-end gap-2 h-32">
                    {MONTHLY_VOTES.map((m, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted-foreground font-medium">{formatNumber(m.v)}</span>
                        <div className="w-full rounded-t-lg bg-gradient-to-t from-primary/80 to-accent/60 transition-all"
                          style={{ height: `${(m.v / maxVote) * 100}%` }} />
                        <span className="text-[10px] text-muted-foreground">{m.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kategori dağılımı */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-white/5 rounded-2xl p-5">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Music className="w-4 h-4 text-primary" /> Kategori Dağılımı</h3>
                    {[
                      { cat: "Ses & Şarkı", pct: 62, color: "bg-primary" },
                      { cat: "Karaoke",     pct: 28, color: "bg-accent" },
                      { cat: "Diğer",       pct: 10, color: "bg-white/20" },
                    ].map((c, i) => (
                      <div key={i} className="mb-3">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium">{c.cat}</span>
                          <span className="text-muted-foreground">%{c.pct}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                            className={cn("h-full rounded-full", c.color)} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-card border border-white/5 rounded-2xl p-5">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Video Performansı</h3>
                    {[
                      { label: "Ortalama İzlenme",  val: "9.3K", icon: <Eye className="w-3.5 h-3.5 text-cyan-400" /> },
                      { label: "Ortalama Oy",        val: "1.4K", icon: <Heart className="w-3.5 h-3.5 text-pink-400" /> },
                      { label: "Etkileşim Oranı",    val: "%14.8", icon: <TrendingUp className="w-3.5 h-3.5 text-green-400" /> },
                      { label: "Paylaşım Sayısı",    val: "834",  icon: <Zap className="w-3.5 h-3.5 text-yellow-400" /> },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">{s.icon} {s.label}</span>
                        <span className="font-bold text-sm">{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Yarışma geçmişi */}
                <div className="bg-card border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Yarışma Performansı</h3>
                  {[
                    { comp: "THY Ses Yarışması 2026", rank: 3, votes: 3200, status: "Devam ediyor", color: "text-green-400" },
                    { comp: "PepsiStar Dans Yarışması", rank: 7, votes: 1850, status: "Tamamlandı", color: "text-muted-foreground" },
                    { comp: "Coca-Cola Karaoke", rank: 1, votes: 5400, status: "Şampiyon 🏆", color: "text-yellow-400" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0",
                        c.rank === 1 ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-muted-foreground")}>
                        #{c.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{c.comp}</p>
                        <p className={cn("text-[11px]", c.color)}>{c.status}</p>
                      </div>
                      <span className="text-xs font-bold text-pink-400 shrink-0">
                        <Heart className="w-3 h-3 inline fill-pink-400 mr-1" />{formatNumber(c.votes)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Rozetler ── */}
            {activeTab === "badges" && (
              <motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-sm text-muted-foreground mb-6">Kazanılan rozetler profilinde görünür ve yarışmacı sıralamana katkı sağlar.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {BADGE_LIST.map((b, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: b.earned ? 1 : 0.4, scale: 1 }} transition={{ delay: i * 0.07 }}
                      className={cn("relative flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all",
                        b.earned ? `bg-gradient-to-br ${b.color} bg-opacity-10 border-white/20` : "bg-white/3 border-white/5")}>
                      {b.earned && <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>}
                      <span className="text-4xl">{b.icon}</span>
                      <span className="font-bold text-sm text-center">{b.label}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", b.earned ? "bg-green-500/20 text-green-400" : "bg-white/5 text-muted-foreground")}>
                        {b.earned ? "Kazanıldı" : "Henüz kazanılmadı"}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Daha fazla rozet kazanmak için <Link href="/competitions" className="text-primary font-semibold">yarışmalara katıl</Link> ve <Link href="/upload" className="text-primary font-semibold">video yükle!</Link>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── CV ── */}
            {activeTab === "cv" && (
              <motion.div key="cv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* CV Aksiyon */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold">Dijital CV</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Profesyonel yetenek profilinizi markalarla paylaşın</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm shadow-lg shadow-primary/25">
                    <Download className="w-4 h-4" /> PDF İndir
                  </button>
                </div>

                {/* CV Kartı */}
                <div className="bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                  {/* CV Header */}
                  <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-transparent p-6 border-b border-white/5">
                    <div className="flex items-center gap-5">
                      <img src={displayUser.avatarUrl} className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30 shadow-lg" alt={displayUser.displayName} />
                      <div>
                        <h2 className="text-2xl font-display font-black">{displayUser.displayName}</h2>
                        <p className="text-primary font-semibold">{displayUser.category} Sanatçısı · @{displayUser.username}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 text-primary" /> {displayUser.city}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" /> {new Date().getFullYear() - (displayUser.birthYear || 1999)} yaşında
                          </span>
                          {displayUser.isVerified && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                              <Check className="w-2.5 h-2.5" /> Doğrulanmış
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* İletişim */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">İletişim</h4>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { icon: <Mail className="w-3.5 h-3.5" />, val: displayUser.email, color: "text-primary" },
                          { icon: <Phone className="w-3.5 h-3.5" />, val: displayUser.phone, color: "text-green-400" },
                        ].filter(c => c.val).map((c, i) => (
                          <span key={i} className={cn("flex items-center gap-2 text-sm", c.color)}>{c.icon} {c.val}</span>
                        ))}
                      </div>
                    </div>

                    {/* Sosyal Medya */}
                    {displayUser.socialLinks && (
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5" /> Sosyal Medya
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {SOCIAL_PLATFORMS.map(platform => {
                            const link = (displayUser.socialLinks as Record<string, { handle: string; url: string; followers: string }>)[platform.key];
                            if (!link) return null;
                            return (
                              <a key={platform.key} href={link.url} target="_blank" rel="noopener noreferrer"
                                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white/3 hover:bg-white/8 transition-all text-xs", platform.border)}>
                                <span>{platform.icon}</span>
                                <span className={cn("font-bold", platform.text)}>{platform.label}</span>
                                <span className="text-muted-foreground">{link.followers}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Hakkımda */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Hakkımda</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{displayUser.bio}</p>
                    </div>

                    {/* Yetenekler */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-primary" /> Yetenekler
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["Ses Kaydı", "Canlı Performans", "Karaoke", "Sahne Deneyimi", "Duygusal Yorumlama", "Türkçe Pop", "Akustik"].map(s => (
                          <span key={s} className="text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Eğitim */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> Eğitim
                      </h4>
                      <div className="flex items-start gap-3 bg-white/3 rounded-xl p-4 border border-white/5">
                        <GraduationCap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">{displayUser.education}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">2018 – 2022</p>
                        </div>
                      </div>
                    </div>

                    {/* Deneyim */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-yellow-400" /> Deneyim
                      </h4>
                      <div className="space-y-3">
                        {[
                          { role: "Solo Ses Sanatçısı", place: "Bağımsız", period: "2022 – Günümüz", desc: "Festival, düğün ve kurumsal etkinliklerde performans" },
                          { role: "Karaoke Animasyon", place: "Eğlence Merkezi", period: "2020 – 2022", desc: "Karaoke gecelerinde moderatörlük ve performans" },
                        ].map((e, i) => (
                          <div key={i} className="flex gap-3 bg-white/3 rounded-xl p-4 border border-white/5">
                            <Briefcase className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">{e.role} · <span className="text-muted-foreground font-normal">{e.place}</span></p>
                              <p className="text-xs text-muted-foreground mb-1">{e.period}</p>
                              <p className="text-xs text-gray-400">{e.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Platformdaki başarılar */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Platform Başarıları
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { val: formatNumber(displayUser.totalVotes), label: "Toplam Oy", icon: "❤️" },
                          { val: formatNumber(displayUser.totalViews), label: "Görüntülenme", icon: "👁️" },
                          { val: "3 Rozet", label: "Kazanılan", icon: "🏅" },
                          { val: "🥉 3.", label: "THY Yarışması", icon: "🏆" },
                        ].map((a, i) => (
                          <div key={i} className="text-center bg-white/3 border border-white/5 rounded-xl p-3">
                            <p className="text-lg mb-0.5">{a.icon}</p>
                            <p className="font-black text-sm">{a.val}</p>
                            <p className="text-[10px] text-muted-foreground">{a.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
