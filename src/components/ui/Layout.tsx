import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Compass,
  PlusSquare,
  Mic2,
  User,
  Search,
  Trophy,
  Zap,
  Users,
  Building2,
  BarChart3,
  Wallet,
  Scale,
  Flame,
  Download,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationPanel } from "./NotificationPanel";
import { useGetMe } from "@workspace/api-client-react";
import { PLAY_STORE_URL } from "@/lib/constants";

interface LayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

export function Layout({ children, hideBottomNav = false }: LayoutProps) {
  const [location] = useLocation();
  const { data: me } = useGetMe({ query: { retry: false } });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const mainNav = [
    { icon: Home, label: "Ana Sayfa", path: "/" },
    { icon: Compass, label: "Keşfet", path: "/feed" },
    { icon: Trophy, label: "Yarışmalar", path: "/competitions" },
    { icon: Users, label: "Yetenekler", path: "/talents" },
    { icon: Mic2, label: "Karaoke", path: "/karaoke" },
    { icon: Flame, label: "Günlük Görev", path: "/challenges" },
    { icon: User, label: "Profil", path: "/profile" },
  ];

  const secondaryNav = [
    { icon: Search, label: "Arama", path: "/search" },
    { icon: BarChart3, label: "Sıralama", path: "/leaderboard" },
    { icon: Building2, label: "Markalar", path: "/brands" },
    { icon: Wallet, label: "Cüzdanım", path: "/wallet" },
    { icon: Scale, label: "Hukuki", path: "/legal" },
  ];

  const mobileQuickNav = [
    { icon: Home, label: "Ana Sayfa", path: "/" },
    { icon: Compass, label: "Keşfet", path: "/feed" },
    { icon: Trophy, label: "Yarışma", path: "/competitions" },
    { icon: Users, label: "Yetenekler", path: "/talents" },
    { icon: User, label: "Profil", path: "/profile" },
  ];

  const isActive = (path: string) => (path === "/" ? location === "/" : location.startsWith(path));
  const profileLetter = (me?.displayName || me?.username || "F").charAt(0).toUpperCase();
  const logoSrc = "/images/web-logo.png";

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  const renderSidebarContent = (isMobile = false) => (
    <>
      <Link href="/" className="flex items-center gap-3 mb-5 px-2 group cursor-pointer">
        <img
          src={logoSrc}
          alt="FenomenStar"
          className="w-11 h-11 rounded-xl object-cover shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300"
        />
        <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          FenomenStar
        </span>
      </Link>

      <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto pr-1">
        {mainNav.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium",
              isActive(item.path)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5",
                isActive(item.path) ? "drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]" : "",
              )}
            />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="h-px bg-white/5 my-2" />

        {secondaryNav.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium",
              isActive(item.path)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}

        <Link
          href="/doping"
          className={cn(
            "flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 font-bold mt-1",
            isActive("/doping")
              ? "bg-gradient-to-r from-primary/30 to-accent/20 text-primary"
              : "text-yellow-400 hover:bg-yellow-400/10",
          )}
        >
          <Zap className="w-5 h-5" />
          <span>Doping Paketi</span>
          {!isActive("/doping") && (
            <span className="ml-auto text-[10px] bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded-full">
              YENI
            </span>
          )}
        </Link>
      </nav>

      <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2 shrink-0">
        <Link
          href="/upload"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 text-sm"
        >
          <PlusSquare className="w-4 h-4" />
          Video Yükle
        </Link>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-muted-foreground py-3 rounded-xl font-semibold hover:bg-white/10 hover:text-white transition-all text-sm"
        >
          <Download className="w-4 h-4" />
          Uygulamayı İndir
        </a>
      </div>

      {isMobile ? (
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Sidebar kapat"
        >
          <X className="w-5 h-5 mx-auto" />
        </button>
      ) : null}
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-3 fixed h-full z-40">
        {renderSidebarContent()}
      </aside>

      {mobileSidebarOpen ? (
        <>
          <button
            type="button"
            className="md:hidden fixed inset-0 bg-black/65 z-50"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Sidebar arkaplani"
          />
          <aside className="md:hidden fixed inset-y-0 left-0 z-[60] w-[84vw] max-w-[320px] bg-card border-r border-border p-3 shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
            {renderSidebarContent(true)}
          </aside>
        </>
      ) : null}

      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen relative">
        <header className="md:hidden flex items-center justify-between px-4 py-3 glass-panel sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors shrink-0"
              aria-label="Sidebar aç"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-3 min-w-0">
              <img src={logoSrc} alt="FenomenStar" className="w-9 h-9 rounded-xl object-cover shrink-0" />
              <span className="font-display font-bold text-xl text-glow truncate">FenomenStar</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/search"
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
            <NotificationPanel />
          </div>
        </header>

        <header className="hidden md:flex items-center justify-end px-6 py-3 border-b border-white/5 sticky top-0 z-30 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <NotificationPanel />
            <Link
              href={me ? "/profile" : "/login"}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/30 flex items-center justify-center text-white font-bold text-sm hover:border-primary/60 transition-colors"
            >
              {profileLetter}
            </Link>
          </div>
        </header>

        {children}
      </main>

      {!hideBottomNav && (
        <nav className="md:hidden fixed bottom-0 w-full glass-panel border-t border-white/10 flex justify-around items-center px-2 py-2 pb-safe z-50">
          {mobileQuickNav.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all min-w-0",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon
                  className={cn("w-5 h-5", active && "drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]")}
                />
                <span className="text-[10px] font-medium truncate max-w-[56px] text-center">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/upload"
            className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl text-muted-foreground hover:text-white transition-all min-w-0"
          >
            <PlusSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate max-w-[56px] text-center">Yükle</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
