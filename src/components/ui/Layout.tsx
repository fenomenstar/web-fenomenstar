import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Compass, PlusSquare, Mic2, User, Search, Trophy, Zap, Users, Building2, BarChart3, Wallet, Scale, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationPanel } from "./NotificationPanel";

interface LayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

export function Layout({ children, hideBottomNav = false }: LayoutProps) {
  const [location] = useLocation();

  const mainNav = [
    { icon: Home,     label: "Ana Sayfa",  path: "/" },
    { icon: Compass,  label: "Keşfet",     path: "/feed" },
    { icon: Trophy,   label: "Yarışmalar", path: "/competitions" },
    { icon: Users,    label: "Yetenekler",    path: "/talents"    },
    { icon: Mic2,     label: "Karaoke",       path: "/karaoke"    },
    { icon: Flame,    label: "Günlük Görev",  path: "/challenges" },
    { icon: User,     label: "Profil",        path: "/profile"    },
  ];

  const secondaryNav = [
    { icon: Search,     label: "Arama",     path: "/search" },
    { icon: BarChart3,  label: "Sıralama",  path: "/leaderboard" },
    { icon: Building2,  label: "Markalar",  path: "/brands" },
    { icon: Wallet,     label: "Cüzdanım",  path: "/wallet" },
    { icon: Scale,      label: "Hukuki",    path: "/legal" },
  ];

  const mobileNav = [
    { icon: Home,     label: "Ana Sayfa",  path: "/" },
    { icon: Compass,  label: "Keşfet",     path: "/feed" },
    { icon: Trophy,   label: "Yarışma",    path: "/competitions" },
    { icon: Users,    label: "Yetenekler", path: "/talents" },
    { icon: User,     label: "Profil",     path: "/profile" },
  ];

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-4 fixed h-full z-40">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 px-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
            <span className="text-white font-bold text-xl font-display">F</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            FenomenStar
          </span>
        </Link>

        {/* Ana Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {mainNav.map((item) => (
            <Link key={item.path} href={item.path} className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
              isActive(item.path)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}>
              <item.icon className={cn("w-5 h-5", isActive(item.path) ? "drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]" : "")} />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Ayırıcı */}
          <div className="h-px bg-white/5 my-2" />

          {secondaryNav.map((item) => (
            <Link key={item.path} href={item.path} className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
              isActive(item.path)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Doping — özel vurgulu */}
          <Link href="/doping" className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-bold mt-1",
            isActive("/doping")
              ? "bg-gradient-to-r from-primary/30 to-accent/20 text-primary"
              : "text-yellow-400 hover:bg-yellow-400/10"
          )}>
            <Zap className="w-5 h-5" />
            <span>Doping Paketi</span>
            {!isActive("/doping") && (
              <span className="ml-auto text-[10px] bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded-full">YENİ</span>
            )}
          </Link>
        </nav>

        {/* Video Yükle CTA */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <Link href="/upload" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 text-sm">
            <PlusSquare className="w-4 h-4" />
            Video Yükle
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen relative">

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 glass-panel sticky top-0 z-40">
          <Link href="/" className="font-display font-bold text-xl text-glow">FenomenStar</Link>
          <div className="flex items-center gap-2">
            <Link href="/search" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <NotificationPanel />
          </div>
        </header>

        {/* Desktop Header — bildirim + arama */}
        <header className="hidden md:flex items-center justify-end px-6 py-3 border-b border-white/5 sticky top-0 z-30 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <NotificationPanel />
            <Link href="/profile"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/30 flex items-center justify-center text-white font-bold text-sm hover:border-primary/60 transition-colors">
              Z
            </Link>
          </div>
        </header>

        {children}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      {!hideBottomNav && (
        <nav className="md:hidden fixed bottom-0 w-full glass-panel border-t border-white/10 flex justify-around items-center px-2 py-2 pb-safe z-50">
          {mobileNav.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path} className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                <item.icon className={cn("w-5 h-5", active && "drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          {/* Yükle butonu ortaya */}
          <Link href="/upload"
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-muted-foreground hover:text-white transition-all">
            <PlusSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Yükle</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
