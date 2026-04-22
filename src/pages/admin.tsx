import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  Ban,
  Bell,
  Building2,
  Check,
  ChevronRight,
  Flag,
  LayoutDashboard,
  LogOut,
  Search,
  Shield,
  Trophy,
  Users,
  Video,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useDeactivateUser,
  useGetAdminDashboard,
  useGetAdminModerationQueue,
  useGetAdminReports,
  useGetAdminUsers,
  useGetBrands,
  useGetCompetitions,
  useGetMe,
  useModerateVideo,
  useUpdateReportStatus,
} from "@workspace/api-client-react";

type Tab = "dashboard" | "videos" | "competitions" | "users" | "brands" | "reports";

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [searchQ, setSearchQ] = useState("");

  const { data: me, isLoading: meLoading } = useGetMe({ query: { retry: false } });
  const { data: dashboard } = useGetAdminDashboard();
  const { data: moderationData } = useGetAdminModerationQueue({ limit: 50 });
  const { data: usersData } = useGetAdminUsers({ limit: 100 });
  const { data: reportsData } = useGetAdminReports({ limit: 100 });
  const { data: brandsData } = useGetBrands({});
  const { data: competitionsData } = useGetCompetitions({ limit: 50 });

  const moderateVideo = useModerateVideo();
  const deactivateUser = useDeactivateUser();
  const updateReportStatus = useUpdateReportStatus();

  const moderationVideos = moderationData?.videos ?? [];
  const adminUsers = usersData?.users ?? [];
  const reports = reportsData?.reports ?? [];
  const brands = brandsData?.brands ?? [];
  const competitions = competitionsData?.competitions ?? [];

  const searchLower = searchQ.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!searchLower) return adminUsers;
    return adminUsers.filter((user: any) =>
      [user.displayName, user.username, user.email, user.city, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchLower)),
    );
  }, [adminUsers, searchLower]);

  const filteredVideos = useMemo(() => {
    if (!searchLower) return moderationVideos;
    return moderationVideos.filter((video: any) =>
      [video.title, video.description, video.userName, video.userEmail]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchLower)),
    );
  }, [moderationVideos, searchLower]);

  const filteredCompetitions = useMemo(() => {
    if (!searchLower) return competitions;
    return competitions.filter((competition: any) =>
      [competition.title, competition.description, competition.brandName, competition.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchLower)),
    );
  }, [competitions, searchLower]);

  const filteredBrands = useMemo(() => {
    if (!searchLower) return brands;
    return brands.filter((brand: any) =>
      [brand.name, brand.description, brand.website]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchLower)),
    );
  }, [brands, searchLower]);

  const filteredReports = useMemo(() => {
    if (!searchLower) return reports;
    return reports.filter((report: any) =>
      [report.reason, report.status, report.targetType, report.targetId, report.reporterName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchLower)),
    );
  }, [reports, searchLower]);

  const stats = [
    {
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      label: "Toplam Kullanıcı",
      val: dashboard?.users?.total ?? adminUsers.length,
      delta: `${dashboard?.users?.talents ?? 0} yetenek`,
      color: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      icon: <Video className="w-5 h-5 text-primary" />,
      label: "Bekleyen Video",
      val: filteredVideos.length,
      delta: `${dashboard?.videos?.ready ?? 0} hazır`,
      color: "bg-primary/10 border-primary/20",
    },
    {
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      label: "Aktif Yarışma",
      val:
        dashboard?.competitions?.active ??
        competitions.filter((competition: any) => competition.status === "active").length,
      delta: `${competitions.length} toplam`,
      color: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      icon: <Building2 className="w-5 h-5 text-green-400" />,
      label: "Sponsor Marka",
      val: brands.length,
      delta: `${brands.filter((brand: any) => brand.isVerified).length} doğrulanmış`,
      color: "bg-green-500/10 border-green-500/20",
    },
    {
      icon: <Flag className="w-5 h-5 text-red-400" />,
      label: "Açık Şikayet",
      val: reports.filter((report: any) => report.status === "open").length,
      delta: `${reports.filter((report: any) => report.status === "reviewing").length} incelemede`,
      color: "bg-red-500/10 border-red-500/20",
    },
  ];

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "videos", label: "İçerik Moderasyonu", icon: Video, badge: filteredVideos.length },
    {
      id: "competitions",
      label: "Yarışmalar",
      icon: Trophy,
      badge: competitions.filter((competition: any) => competition.status === "active").length,
    },
    { id: "users", label: "Kullanıcılar", icon: Users },
    { id: "brands", label: "Markalar", icon: Building2 },
    {
      id: "reports",
      label: "Şikayetler",
      icon: Flag,
      badge: reports.filter((report: any) => report.status === "open").length,
    },
  ];

  if (meLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Admin paneli yükleniyor...
      </div>
    );
  }

  if (me?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-white/10 rounded-3xl p-8 text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-display font-black mb-2">Admin Erişimi Gerekli</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Bu alan sadece admin rolündeki kullanıcılar için açıktır.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold hover:opacity-90 transition-opacity"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 bg-card border-r border-white/5 flex flex-col fixed h-full z-40">
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-black text-lg">Admin Panel</span>
          </div>
          <p className="text-xs text-muted-foreground">FenomenStar yönetim alanı</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-left",
                tab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                    item.id === "reports" ? "bg-red-500 text-white" : "bg-primary text-white",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all text-sm font-medium"
          >
            <ChevronRight className="w-4 h-4" /> Uygulamaya dön
          </Link>
          <Link
            href="/login"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Çıkış
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-background/80 backdrop-blur-sm z-30">
          <div>
            <h1 className="font-display font-black text-xl capitalize">
              {tabs.find((item) => item.id === tab)?.label}
            </h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={searchQ}
                onChange={(event) => setSearchQ(event.target.value)}
                placeholder="Ara..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors pr-9 w-56"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {tab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn("rounded-2xl border p-4", stat.color)}
                    >
                      <div className="flex items-center gap-2 mb-2">{stat.icon}</div>
                      <p className="text-2xl font-black">{stat.val}</p>
                      <p className="text-xs text-white/70 font-medium mt-0.5">{stat.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{stat.delta}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-card border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Bekleyen İçerikler</h3>
                      <button
                        onClick={() => setTab("videos")}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Tümünü gör →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {filteredVideos.slice(0, 3).map((video: any) => (
                        <div key={video.id} className="flex items-center gap-3">
                          <img
                            src={video.thumbnailUrl || `https://picsum.photos/seed/mod-${video.id}/120/80`}
                            className="w-12 h-8 rounded-lg object-cover"
                            alt={video.title}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{video.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {video.userName} · {new Date(video.createdAt).toLocaleString("tr-TR")}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                moderateVideo.mutate({ videoId: video.id, action: "approve" })
                              }
                              className="p-1.5 bg-green-500/10 hover:bg-green-500/20 rounded-lg border border-green-500/20 transition-colors"
                            >
                              <Check className="w-3 h-3 text-green-400" />
                            </button>
                            <button
                              onClick={() =>
                                moderateVideo.mutate({ videoId: video.id, action: "reject" })
                              }
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
                            >
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {filteredVideos.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Bekleyen içerik yok.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-card border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Açık Şikayetler</h3>
                      <button
                        onClick={() => setTab("reports")}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Tümünü gör →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {filteredReports.slice(0, 3).map((report: any) => (
                        <div
                          key={report.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5"
                        >
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full mt-1.5 shrink-0",
                              report.status === "open" ? "bg-red-400" : "bg-yellow-400",
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">{report.reason || "Şikayet"}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {report.reporterName || "Kullanıcı"} · {report.targetType} ·{" "}
                              {new Date(report.createdAt).toLocaleString("tr-TR")}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              updateReportStatus.mutate({ reportId: report.id, status: "resolved" })
                            }
                            className="text-[11px] text-green-400 hover:text-green-300 font-medium transition-colors shrink-0"
                          >
                            Çöz
                          </button>
                        </div>
                      ))}
                      {filteredReports.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Açık şikayet yok.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "videos" && (
              <motion.div
                key="videos"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-16">
                    <Check className="w-12 h-12 mx-auto mb-4 text-green-400 opacity-60" />
                    <p className="text-muted-foreground">Bekleyen içerik yok.</p>
                  </div>
                ) : (
                  filteredVideos.map((video: any) => (
                    <motion.div
                      key={video.id}
                      layout
                      className="flex items-center gap-4 bg-card border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={video.thumbnailUrl || `https://picsum.photos/seed/mod-grid-${video.id}/120/80`}
                          className="w-20 h-14 rounded-xl object-cover"
                          alt={video.title}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{video.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span>{video.userName}</span>
                          <span className="bg-white/10 px-2 py-0.5 rounded-full">
                            {video.status}
                          </span>
                          <span>{new Date(video.createdAt).toLocaleString("tr-TR")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {video.videoUrl && (
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-semibold transition-colors"
                          >
                            İzle
                          </a>
                        )}
                        <button
                          onClick={() => moderateVideo.mutate({ videoId: video.id, action: "approve" })}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl border border-green-500/20 text-sm font-semibold transition-colors"
                        >
                          <Check className="w-4 h-4" /> Onayla
                        </button>
                        <button
                          onClick={() => moderateVideo.mutate({ videoId: video.id, action: "reject" })}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 text-sm font-semibold transition-colors"
                        >
                          <X className="w-4 h-4" /> Reddet
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {tab === "competitions" && (
              <motion.div
                key="competitions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredCompetitions.length === 0 ? (
                  <div className="text-center py-16">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400 opacity-60" />
                    <p className="text-muted-foreground">Yarışma bulunamadı.</p>
                  </div>
                ) : (
                  filteredCompetitions.map((competition: any) => (
                    <div
                      key={competition.id}
                      className="flex items-center gap-4 bg-card border border-white/5 rounded-2xl p-4 transition-all"
                    >
                      <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0 border border-yellow-500/20">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{competition.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          {competition.brandName && (
                            <span className="text-yellow-400 font-medium">{competition.brandName}</span>
                          )}
                          <span className="bg-white/10 px-2 py-0.5 rounded-full">
                            {competition.category}
                          </span>
                          <span>{competition.status}</span>
                          {competition.endDate && (
                            <span>{new Date(competition.endDate).toLocaleDateString("tr-TR")}</span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/competitions/${competition.id}`}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm font-semibold transition-colors"
                      >
                        İncele
                      </Link>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {tab === "users" && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {["Kullanıcı", "Rol", "Şehir", "Oy", "Görüntülenme", "Katılım", "İşlem"].map(
                          (header) => (
                            <th
                              key={header}
                              className="text-left text-xs font-semibold text-muted-foreground px-4 py-3"
                            >
                              {header}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user: any) => (
                        <tr key={user.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatarUrl || `https://picsum.photos/seed/admin-user-${user.id}/60`}
                                className="w-8 h-8 rounded-full object-cover"
                                alt={user.displayName}
                              />
                              <div>
                                <p className="text-sm font-semibold">{user.displayName}</p>
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "text-[11px] font-bold px-2 py-1 rounded-full",
                                user.role === "brand"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : user.role === "talent"
                                    ? "bg-primary/20 text-primary"
                                    : user.role === "admin"
                                      ? "bg-cyan-500/20 text-cyan-400"
                                      : "bg-white/10 text-muted-foreground",
                              )}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{user.city || "-"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{user.totalVotes || 0}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{user.totalViews || 0}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Link
                                href={`/profile/${user.id}`}
                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-xs"
                              >
                                Gör
                              </Link>
                              {user.role !== "admin" && (
                                <button
                                  onClick={() => deactivateUser.mutate({ userId: user.id })}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
                                >
                                  <Ban className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {tab === "brands" && (
              <motion.div
                key="brands"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredBrands.length === 0 ? (
                  <div className="text-center py-16">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-60" />
                    <p className="text-muted-foreground">Marka bulunamadı.</p>
                  </div>
                ) : (
                  filteredBrands.map((brand: any) => (
                    <div
                      key={brand.id}
                      className="flex items-center gap-4 bg-card border border-white/5 rounded-2xl p-4"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/20 shrink-0">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} className="w-full h-full object-cover" alt={brand.name} />
                        ) : (
                          <span className="font-black text-lg text-yellow-400">{brand.name?.[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{brand.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          {brand.website && <span>{brand.website}</span>}
                          <span>{brand.activeCompetitions} aktif yarışma</span>
                          <span>{brand.totalParticipants} katılımcı</span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-bold px-2 py-1 rounded-full",
                          brand.isVerified
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400",
                        )}
                      >
                        {brand.isVerified ? "Doğrulanmış" : "Beklemede"}
                      </span>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {tab === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredReports.length === 0 ? (
                  <div className="text-center py-16">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-green-400 opacity-60" />
                    <p className="text-muted-foreground">Açık şikayet yok.</p>
                  </div>
                ) : (
                  filteredReports.map((report: any) => (
                    <motion.div
                      key={report.id}
                      layout
                      className="flex items-start gap-4 bg-card border border-white/5 rounded-2xl p-4"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          report.status === "open"
                            ? "bg-red-500/10 border border-red-500/20"
                            : "bg-yellow-500/10 border border-yellow-500/20",
                        )}
                      >
                        <AlertTriangle
                          className={cn(
                            "w-5 h-5",
                            report.status === "open" ? "text-red-400" : "text-yellow-400",
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{report.reason || "Şikayet"}</p>
                          <span
                            className={cn(
                              "text-[10px] font-black px-2 py-0.5 rounded-full",
                              report.status === "open"
                                ? "bg-red-500/20 text-red-400"
                                : report.status === "reviewing"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-green-500/20 text-green-400",
                            )}
                          >
                            {report.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {report.reporterName || "Kullanıcı"} → {report.targetType} / {report.targetId} ·{" "}
                          {new Date(report.createdAt).toLocaleString("tr-TR")}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() =>
                            updateReportStatus.mutate({ reportId: report.id, status: "reviewing" })
                          }
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium border border-white/10 transition-colors"
                        >
                          İncele
                        </button>
                        <button
                          onClick={() =>
                            updateReportStatus.mutate({ reportId: report.id, status: "resolved" })
                          }
                          className="px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-xs font-semibold border border-green-500/20 transition-colors"
                        >
                          Çözüldü
                        </button>
                        <button
                          onClick={() =>
                            updateReportStatus.mutate({ reportId: report.id, status: "dismissed" })
                          }
                          className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold border border-red-500/20 transition-colors"
                        >
                          Kapat
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
