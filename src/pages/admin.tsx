import { useState } from "react";
import { Link } from "wouter";
import {
  LayoutDashboard, Trophy, Users, Building2, Video, Flag,
  Check, X, Clock, Eye, MoreVertical, TrendingUp, Star,
  AlertTriangle, Shield, ChevronRight, Search, Filter,
  Play, Trash2, Ban, Award, Bell, Settings, LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Demo data ─── */
const STATS = [
  { icon: <Users className="w-5 h-5 text-cyan-400" />, label: "Toplam Kullanıcı", val: "9.542", delta: "+128 bu hafta", color: "bg-cyan-500/10 border-cyan-500/20" },
  { icon: <Video className="w-5 h-5 text-primary" />, label: "Bekleyen Video", val: "34", delta: "Onay gerekiyor", color: "bg-primary/10 border-primary/20" },
  { icon: <Trophy className="w-5 h-5 text-yellow-400" />, label: "Aktif Yarışma", val: "11", delta: "3 bugün bitiyor", color: "bg-yellow-500/10 border-yellow-500/20" },
  { icon: <Building2 className="w-5 h-5 text-green-400" />, label: "Sponsor Marka", val: "18", delta: "+2 yeni", color: "bg-green-500/10 border-green-500/20" },
  { icon: <Flag className="w-5 h-5 text-red-400" />, label: "Şikayet", val: "7", delta: "Acil inceleme", color: "bg-red-500/10 border-red-500/20" },
];

const PENDING_VIDEOS = [
  { id: 1, user: "Zeynep Kaya", username: "zeynep_ses", title: "Yeliz - Ses Kaydım 2026", category: "Ses", duration: "2:34", submitted: "5 dk önce", thumb: "https://picsum.photos/seed/pv1/120/80" },
  { id: 2, user: "Mehmet Yılmaz", username: "mehmet_dans", title: "Street Dance Challenge", category: "Dans", duration: "1:48", submitted: "12 dk önce", thumb: "https://picsum.photos/seed/pv2/120/80" },
  { id: 3, user: "Ayşe Kara", username: "ayse_muzik", title: "Karaoke — Seni Seviyorum", category: "Karaoke", duration: "3:10", submitted: "28 dk önce", thumb: "https://picsum.photos/seed/pv3/120/80" },
  { id: 4, user: "Ali Öztürk", username: "ali_komedi", title: "Günlük Komedi Skeci #14", category: "Komedi", duration: "0:59", submitted: "1 sa önce", thumb: "https://picsum.photos/seed/pv4/120/80" },
  { id: 5, user: "Fatma Gül", username: "fatma_gitar", title: "Akustik Gitar Performansı", category: "Enstrüman", duration: "4:02", submitted: "2 sa önce", thumb: "https://picsum.photos/seed/pv5/120/80" },
];

const PENDING_COMPETITIONS = [
  { id: 1, brand: "Turkcell", title: "TurkcellStar Ses Yarışması", prize: "50.000 ₺", endDate: "2026-04-15", category: "Ses" },
  { id: 2, brand: "Nike Turkey", title: "Nike Spor Yeteneği 2026", prize: "25.000 ₺", endDate: "2026-05-01", category: "Spor" },
  { id: 3, brand: "Ülker", title: "Ülker Mutluluk Yarışması", prize: "15.000 ₺", endDate: "2026-04-30", category: "Komedi" },
];

const USERS = [
  { id: 1, name: "Zeynep Kaya", username: "zeynep_ses", role: "talent", status: "active", videos: 12, votes: 12500, joined: "Oca 2026", avatar: "https://picsum.photos/seed/u1/60" },
  { id: 2, name: "Mehmet Yılmaz", username: "mehmet_dans", role: "talent", status: "active", videos: 8, votes: 8900, joined: "Şub 2026", avatar: "https://picsum.photos/seed/u2/60" },
  { id: 3, name: "THY Medya", username: "thy_medya", role: "brand", status: "verified", videos: 0, votes: 0, joined: "Kas 2025", avatar: "https://picsum.photos/seed/u3/60" },
  { id: 4, name: "Anonim Kullanıcı", username: "user_anon", role: "viewer", status: "suspended", videos: 0, votes: 234, joined: "Mar 2026", avatar: "https://picsum.photos/seed/u4/60" },
  { id: 5, name: "Selin Arslan", username: "selin_karaoke", role: "talent", status: "active", videos: 19, votes: 21000, joined: "Ara 2025", avatar: "https://picsum.photos/seed/u5/60" },
];

const REPORTS = [
  { id: 1, type: "video", reporter: "ali_spor", target: "spam_video_123", reason: "Spam içerik", severity: "high", time: "10 dk önce" },
  { id: 2, type: "user", reporter: "zeynep_ses", target: "hakaret_user", reason: "Hakaret/küfür", severity: "high", time: "35 dk önce" },
  { id: 3, type: "comment", reporter: "mehmet_dans", target: "uygunsuz_yorum", reason: "Uygunsuz yorum", severity: "medium", time: "1 sa önce" },
];

type Tab = "dashboard" | "videos" | "competitions" | "users" | "brands" | "reports";

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [searchQ, setSearchQ] = useState("");
  const [videos, setVideos] = useState(PENDING_VIDEOS);
  const [comps, setComps] = useState(PENDING_COMPETITIONS);
  const [users, setUsers] = useState(USERS);
  const [reports, setReports] = useState(REPORTS);

  const approveVideo = (id: number) => setVideos(v => v.filter(x => x.id !== id));
  const rejectVideo = (id: number) => setVideos(v => v.filter(x => x.id !== id));
  const approveComp = (id: number) => setComps(v => v.filter(x => x.id !== id));
  const rejectComp = (id: number) => setComps(v => v.filter(x => x.id !== id));
  const resolveReport = (id: number) => setReports(v => v.filter(x => x.id !== id));

  const TABS: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "videos", label: "İçerik Moderasyonu", icon: Video, badge: videos.length },
    { id: "competitions", label: "Yarışma Onayı", icon: Trophy, badge: comps.length },
    { id: "users", label: "Kullanıcılar", icon: Users },
    { id: "brands", label: "Markalar", icon: Building2 },
    { id: "reports", label: "Şikayetler", icon: Flag, badge: reports.filter(r => r.severity === "high").length },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">

      {/* ── Admin Sidebar ── */}
      <aside className="w-64 bg-card border-r border-white/5 flex flex-col fixed h-full z-40">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-black text-lg">Admin Panel</span>
          </div>
          <p className="text-xs text-muted-foreground">FenomenStar Yönetim</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-left",
                tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-white")}>
              <t.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-full",
                  t.id === "reports" ? "bg-red-500 text-white" : "bg-primary text-white")}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all text-sm font-medium">
            <ChevronRight className="w-4 h-4" /> Uygulamaya Dön
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
            <LogOut className="w-4 h-4" /> Çıkış
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 ml-64 min-h-screen">

        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-background/80 backdrop-blur-sm z-30">
          <div>
            <h1 className="font-display font-black text-xl capitalize">{TABS.find(t => t.id === tab)?.label}</h1>
            <p className="text-xs text-muted-foreground">Bugün: {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Ara..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors pr-9 w-52" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ══ Dashboard ══ */}
            {tab === "dashboard" && (
              <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Stat kartları */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {STATS.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={cn("rounded-2xl border p-4", s.color)}>
                      <div className="flex items-center gap-2 mb-2">{s.icon}</div>
                      <p className="text-2xl font-black">{s.val}</p>
                      <p className="text-xs text-white/70 font-medium mt-0.5">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{s.delta}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Son bekleyen videolar */}
                  <div className="bg-card border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Bekleyen İçerikler</h3>
                      <button onClick={() => setTab("videos")} className="text-xs text-primary hover:text-primary/80 transition-colors">Tümünü gör →</button>
                    </div>
                    <div className="space-y-3">
                      {videos.slice(0, 3).map(v => (
                        <div key={v.id} className="flex items-center gap-3">
                          <img src={v.thumb} className="w-12 h-8 rounded-lg object-cover" alt="" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{v.title}</p>
                            <p className="text-[11px] text-muted-foreground">@{v.username} · {v.submitted}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => approveVideo(v.id)} className="p-1.5 bg-green-500/10 hover:bg-green-500/20 rounded-lg border border-green-500/20 transition-colors">
                              <Check className="w-3 h-3 text-green-400" />
                            </button>
                            <button onClick={() => rejectVideo(v.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors">
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Son şikayetler */}
                  <div className="bg-card border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Açık Şikayetler</h3>
                      <button onClick={() => setTab("reports")} className="text-xs text-primary hover:text-primary/80 transition-colors">Tümünü gör →</button>
                    </div>
                    <div className="space-y-3">
                      {reports.map(r => (
                        <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                          <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", r.severity === "high" ? "bg-red-400" : "bg-yellow-400")} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">{r.reason}</p>
                            <p className="text-[11px] text-muted-foreground">{r.reporter} tarafından · {r.time}</p>
                          </div>
                          <button onClick={() => resolveReport(r.id)} className="text-[11px] text-green-400 hover:text-green-300 font-medium transition-colors shrink-0">
                            Çöz
                          </button>
                        </div>
                      ))}
                      {reports.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Açık şikayet yok ✓</p>}
                    </div>
                  </div>
                </div>

                {/* Hızlı eylemler */}
                <div className="bg-card border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Hızlı Eylemler</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: <Trophy className="w-5 h-5 text-yellow-400" />, label: "Yarışma Oluştur", color: "border-yellow-500/20 hover:bg-yellow-500/5" },
                      { icon: <Award className="w-5 h-5 text-purple-400" />, label: "Rozet Tanımla", color: "border-purple-500/20 hover:bg-purple-500/5" },
                      { icon: <Bell className="w-5 h-5 text-cyan-400" />, label: "Duyuru Gönder", color: "border-cyan-500/20 hover:bg-cyan-500/5" },
                      { icon: <Settings className="w-5 h-5 text-muted-foreground" />, label: "Sistem Ayarları", color: "border-white/10 hover:bg-white/5" },
                    ].map((a, i) => (
                      <button key={i} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border bg-white/3 transition-colors text-center", a.color)}>
                        {a.icon}
                        <span className="text-xs font-medium">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ İçerik Moderasyonu ══ */}
            {tab === "videos" && (
              <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {videos.length === 0 ? (
                  <div className="text-center py-16">
                    <Check className="w-12 h-12 mx-auto mb-4 text-green-400 opacity-60" />
                    <p className="text-muted-foreground">Bekleyen içerik yok. Her şey temiz!</p>
                  </div>
                ) : videos.map(v => (
                  <motion.div key={v.id} layout exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-4 bg-card border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all">
                    <div className="relative shrink-0">
                      <img src={v.thumb} className="w-20 h-14 rounded-xl object-cover" alt="" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white/80" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{v.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>@{v.username}</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded-full">{v.category}</span>
                        <span>⏱ {v.duration}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {v.submitted}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => approveVideo(v.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl border border-green-500/20 text-sm font-semibold transition-colors">
                        <Check className="w-4 h-4" /> Onayla
                      </button>
                      <button onClick={() => rejectVideo(v.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 text-sm font-semibold transition-colors">
                        <X className="w-4 h-4" /> Reddet
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ══ Yarışma Onayı ══ */}
            {tab === "competitions" && (
              <motion.div key="comps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {comps.length === 0 ? (
                  <div className="text-center py-16">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400 opacity-60" />
                    <p className="text-muted-foreground">Onay bekleyen yarışma yok.</p>
                  </div>
                ) : comps.map(c => (
                  <motion.div key={c.id} layout exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-4 bg-card border border-white/5 rounded-2xl p-4 transition-all">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0 border border-yellow-500/20">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{c.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="text-yellow-400 font-medium">{c.brand}</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded-full">{c.category}</span>
                        <span className="text-green-400 font-bold">🏆 {c.prize}</span>
                        <span>Bitiş: {c.endDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approveComp(c.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl border border-green-500/20 text-sm font-semibold transition-colors">
                        <Check className="w-4 h-4" /> Onayla
                      </button>
                      <button onClick={() => rejectComp(c.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 text-sm font-semibold transition-colors">
                        <X className="w-4 h-4" /> Reddet
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ══ Kullanıcı Yönetimi ══ */}
            {tab === "users" && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {["Kullanıcı", "Rol", "Durum", "Video", "Oy", "Katılım", "İşlem"].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => !searchQ || u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.username.includes(searchQ)).map(u => (
                        <tr key={u.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt={u.name} />
                              <div>
                                <p className="text-sm font-semibold">{u.name}</p>
                                <p className="text-xs text-muted-foreground">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[11px] font-bold px-2 py-1 rounded-full",
                              u.role === "brand" ? "bg-yellow-500/20 text-yellow-400" :
                              u.role === "talent" ? "bg-primary/20 text-primary" :
                              "bg-white/10 text-muted-foreground")}>
                              {u.role === "brand" ? "Marka" : u.role === "talent" ? "Yetenek" : "Seyirci"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[11px] font-bold px-2 py-1 rounded-full",
                              u.status === "active" ? "bg-green-500/20 text-green-400" :
                              u.status === "verified" ? "bg-cyan-500/20 text-cyan-400" :
                              "bg-red-500/20 text-red-400")}>
                              {u.status === "active" ? "Aktif" : u.status === "verified" ? "Doğrulanmış" : "Askıya Alınmış"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{u.videos}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{u.votes.toLocaleString("tr-TR")}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              {u.status !== "suspended" ? (
                                <button onClick={() => setUsers(us => us.map(x => x.id === u.id ? { ...x, status: "suspended" } : x))}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors">
                                  <Ban className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              ) : (
                                <button onClick={() => setUsers(us => us.map(x => x.id === u.id ? { ...x, status: "active" } : x))}
                                  className="p-1.5 bg-green-500/10 hover:bg-green-500/20 rounded-lg border border-green-500/20 transition-colors">
                                  <Check className="w-3.5 h-3.5 text-green-400" />
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

            {/* ══ Marka Yönetimi ══ */}
            {tab === "brands" && (
              <motion.div key="brands" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {[
                  { name: "THY (Turkish Airlines)", plan: "Gold", exp: "2027-01-15", comps: 4, status: "active" },
                  { name: "PepsiCo Turkey", plan: "Silver", exp: "2026-08-30", comps: 2, status: "active" },
                  { name: "Coca-Cola Türkiye", plan: "Silver", exp: "2026-09-01", comps: 2, status: "active" },
                  { name: "Nike Turkey", plan: "Bronze", exp: "2026-06-15", comps: 1, status: "pending" },
                  { name: "Turkcell", plan: "Gold", exp: "2027-03-01", comps: 4, status: "active" },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-4 bg-card border border-white/5 rounded-2xl p-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-yellow-500/20">
                      <span className="font-black text-lg text-yellow-400">{b.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{b.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className={cn("font-bold px-2 py-0.5 rounded-full text-[10px]",
                          b.plan === "Gold" ? "bg-yellow-500/20 text-yellow-400" : b.plan === "Silver" ? "bg-slate-400/20 text-slate-300" : "bg-orange-500/20 text-orange-400")}>
                          {b.plan}
                        </span>
                        <span>Bitiş: {b.exp}</span>
                        <span>{b.comps} yarışma hakkı</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[11px] font-bold px-2 py-1 rounded-full",
                        b.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400")}>
                        {b.status === "active" ? "Aktif" : "Onay Bekliyor"}
                      </span>
                      <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ══ Şikayetler ══ */}
            {tab === "reports" && (
              <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-16">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-green-400 opacity-60" />
                    <p className="text-muted-foreground">Açık şikayet yok. Platform temiz!</p>
                  </div>
                ) : reports.map(r => (
                  <motion.div key={r.id} layout exit={{ opacity: 0, x: -20 }}
                    className="flex items-start gap-4 bg-card border border-white/5 rounded-2xl p-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      r.severity === "high" ? "bg-red-500/10 border border-red-500/20" : "bg-yellow-500/10 border border-yellow-500/20")}>
                      <AlertTriangle className={cn("w-5 h-5", r.severity === "high" ? "text-red-400" : "text-yellow-400")} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{r.reason}</p>
                        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full",
                          r.severity === "high" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400")}>
                          {r.severity === "high" ? "ACİL" : "ORTA"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="text-white/60">@{r.reporter}</span> → @{r.target} · Tür: {r.type} · {r.time}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium border border-white/10 transition-colors">
                        İncele
                      </button>
                      <button onClick={() => resolveReport(r.id)}
                        className="px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-xs font-semibold border border-green-500/20 transition-colors">
                        Çözüldü
                      </button>
                      <button className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold border border-red-500/20 transition-colors">
                        Kaldır
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
