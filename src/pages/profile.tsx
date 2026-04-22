import { useMemo, useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { useGetMe, useGetUserById, useGetUserVideos } from "@workspace/api-client-react";
import {
  Settings,
  Play,
  Award,
  Grid,
  MapPin,
  Heart,
  Eye,
  LogIn,
  Mic2,
  BarChart3,
  FileText,
  Download,
  Trophy,
  TrendingUp,
  Users,
  Calendar,
  Check,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Link, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type ProfileTab = "videos" | "karaoke" | "stats" | "badges" | "cv";

const BADGES = [
  { icon: "🏆", label: "Şampiyon" },
  { icon: "🎤", label: "Ses Yıldızı" },
  { icon: "🔥", label: "Trend" },
  { icon: "⭐", label: "Haftanın Yıldızı" },
];

export default function Profile() {
  const route = useRoute("/profile/:id");
  const params = route[1] as { id?: string } | null;
  const profileId = params ? params.id : undefined;
  const [activeTab, setActiveTab] = useState<ProfileTab>("videos");

  const meQuery = useGetMe({
    query: {
      enabled: !profileId,
      retry: false,
    },
  });
  const userQuery = useGetUserById(profileId || "", {
    query: {
      enabled: Boolean(profileId),
      retry: false,
    },
  });

  const user = profileId ? userQuery.data : meQuery.data;
  const isLoading = profileId ? userQuery.isLoading : meQuery.isLoading;
  const isOwnProfile = !profileId;
  const { data: videosData, isLoading: videosLoading } = useGetUserVideos(user?.id || "", {
    query: { enabled: Boolean(user?.id) },
  });

  const videos = useMemo(
    () => (videosData ?? []).filter((video: any) => !video.isKaraoke),
    [videosData],
  );
  const karaokeVideos = useMemo(
    () => (videosData ?? []).filter((video: any) => video.isKaraoke),
    [videosData],
  );

  const tabs: { id: ProfileTab; label: string; icon: any }[] = [
    { id: "videos", label: "Videolar", icon: Grid },
    { id: "karaoke", label: "Karaoke", icon: Mic2 },
    { id: "stats", label: "İstatistikler", icon: BarChart3 },
    { id: "badges", label: "Rozetler", icon: Award },
    { id: "cv", label: "CV", icon: FileText },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 md:p-8 space-y-6 animate-pulse">
          <div className="h-48 bg-white/5 rounded-3xl" />
          <div className="h-8 w-48 bg-white/5 rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-20 bg-white/5 rounded-2xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h1 className="text-3xl font-display font-black mb-3">Profil bulunamadı</h1>
          <p className="text-muted-foreground mb-6">
            Bu profili görmek için giriş yapmanız veya geçerli bir kullanıcı seçmeniz gerekiyor.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold"
          >
            <LogIn className="w-4 h-4" />
            Giriş Yap
          </Link>
        </div>
      </Layout>
    );
  }

  const monthlyVotes = [
    { month: "Kas", value: Math.max(0, Math.round((user.totalVotes || 0) * 0.08)) },
    { month: "Ara", value: Math.max(0, Math.round((user.totalVotes || 0) * 0.12)) },
    { month: "Oca", value: Math.max(0, Math.round((user.totalVotes || 0) * 0.15)) },
    { month: "Şub", value: Math.max(0, Math.round((user.totalVotes || 0) * 0.18)) },
    { month: "Mar", value: Math.max(0, Math.round((user.totalVotes || 0) * 0.21)) },
    { month: "Nis", value: Math.max(0, Math.round((user.totalVotes || 0) * 0.26)) },
  ];
  const maxVote = Math.max(...monthlyVotes.map((item) => item.value), 1);

  return (
    <Layout>
      <div className="w-full pb-16">
        <div className="relative h-52 md:h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative -mt-20">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-end mb-6">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-b from-primary to-accent shrink-0 shadow-[0_0_30px_rgba(255,0,255,0.25)]">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  className="w-full h-full rounded-full object-cover bg-card"
                  alt={user.username}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-4xl font-black">
                  {(user.displayName || user.username || "F").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl md:text-3xl font-display font-black break-words">
                  {user.displayName}
                </h1>
                {user.isVerified && (
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">
                    ✓ Doğrulanmış
                  </span>
                )}
                <span className="text-xs bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full text-muted-foreground">
                  {user.role === "admin" ? "Admin" : "Yetenek"}
                </span>
              </div>
              <p className="text-muted-foreground font-medium mb-3 break-all">@{user.username}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {user.city && (
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs">
                    <MapPin className="w-3 h-3 text-primary" />
                    {user.city}
                  </span>
                )}
                {user.category && (
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs">
                    <Award className="w-3 h-3 text-accent" />
                    {user.category}
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  Katılım: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 w-full md:w-auto">
              {isOwnProfile ? (
                <button className="w-full md:w-auto px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  Düzenle
                </button>
              ) : (
                <Link
                  href="/feed"
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Videolarını Göster
                </Link>
              )}
            </div>
          </div>

          <p className="text-gray-300 mb-6 max-w-2xl leading-relaxed text-sm">
            {user.bio || "FenomenStar sahnesinde üretilen içeriklerini burada sergiliyor."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { icon: <Heart className="w-4 h-4 text-pink-400" />, val: formatNumber(user.totalVotes), label: "Toplam Oy" },
              { icon: <Eye className="w-4 h-4 text-cyan-400" />, val: formatNumber(user.totalViews), label: "Görüntülenme" },
              { icon: <Users className="w-4 h-4 text-green-400" />, val: formatNumber(user.followers), label: "Takipçi" },
              { icon: <Trophy className="w-4 h-4 text-yellow-400" />, val: user.badgeCount || 0, label: "Rozet" },
              { icon: <Play className="w-4 h-4 text-primary" />, val: videos.length + karaokeVideos.length, label: "Video" },
            ].map((stat, index) => (
              <div key={index} className="bg-card border border-white/5 rounded-2xl p-3 text-center">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <p className="text-xl font-black">{stat.val}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all font-medium text-sm whitespace-nowrap shrink-0",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-white",
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {(activeTab === "videos" || activeTab === "karaoke") && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {videosLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (activeTab === "videos" ? videos : karaokeVideos).length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Play className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Henüz içerik bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
                    {(activeTab === "videos" ? videos : karaokeVideos).map((video: any) => (
                      <Link
                        key={video.id}
                        href={`/feed?videoId=${video.id}`}
                        className="relative aspect-[3/4] group cursor-pointer overflow-hidden rounded-xl block"
                      >
                        <img
                          src={video.thumbnailUrl}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          alt={video.title}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-white fill-white drop-shadow-lg" />
                        </div>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-bold drop-shadow-md">
                          <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                          {formatNumber(video.voteCount || 0)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="bg-card border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold mb-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Aylık Oy Trendi
                  </h3>
                  <p className="text-xs text-muted-foreground mb-5">Son 6 aylık dağılım</p>
                  <div className="flex items-end gap-2 h-32">
                    {monthlyVotes.map((item) => (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {formatNumber(item.value)}
                        </span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-primary/80 to-accent/60"
                          style={{ height: `${(item.value / maxVote) * 100}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-white/5 rounded-2xl p-5">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Performans Özeti
                    </h3>
                    {[
                      { label: "Toplam görüntülenme", value: formatNumber(user.totalViews) },
                      { label: "Toplam oy", value: formatNumber(user.totalVotes) },
                      { label: "Takipçi", value: formatNumber(user.followers) },
                      { label: "Video sayısı", value: String(videos.length + karaokeVideos.length) },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                      >
                        <span className="text-xs text-muted-foreground">{row.label}</span>
                        <span className="font-bold text-sm">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-card border border-white/5 rounded-2xl p-5">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      Profil Özeti
                    </h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>Şehir: <span className="text-white">{user.city || "Belirtilmedi"}</span></p>
                      <p>Kategori: <span className="text-white">{user.category || "Genel"}</span></p>
                      <p>Rol: <span className="text-white">{user.role}</span></p>
                      <p>Katılım: <span className="text-white">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</span></p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "badges" && (
              <motion.div
                key="badges"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {BADGES.map((badge, index) => (
                    <div
                      key={badge.label}
                      className="relative flex flex-col items-center gap-3 p-6 rounded-2xl border bg-white/3 border-white/10"
                    >
                      {index < Math.max(1, user.badgeCount) && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-4xl">{badge.icon}</span>
                      <span className="font-bold text-sm text-center">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "cv" && (
              <motion.div
                key="cv"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-bold">Dijital CV</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Markalar ve jüri için özet profil
                    </p>
                  </div>
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm shadow-lg shadow-primary/25">
                    <Download className="w-4 h-4" />
                    PDF İndir
                  </button>
                </div>

                <div className="bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-transparent p-6 border-b border-white/5">
                    <h2 className="text-2xl font-display font-black">{user.displayName}</h2>
                    <p className="text-primary font-semibold">
                      {user.category || "FenomenStar Yeteneği"} · @{user.username}
                    </p>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                        Hakkında
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {user.bio || "FenomenStar profilindeki içerikleri ile markalara ve izleyicilere ulaşır."}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                        Başarılar
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { val: formatNumber(user.totalVotes), label: "Toplam Oy" },
                          { val: formatNumber(user.totalViews), label: "Görüntülenme" },
                          { val: String(user.badgeCount || 0), label: "Rozet" },
                          { val: String(videos.length + karaokeVideos.length), label: "Video" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="text-center bg-white/3 border border-white/5 rounded-xl p-3"
                          >
                            <p className="font-black text-sm">{item.val}</p>
                            <p className="text-[10px] text-muted-foreground">{item.label}</p>
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
