import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useLogin,
  setStoredAuth,
  setAuthTokenGetter,
  ACCESS_TOKEN_KEY,
} from "@workspace/api-client-react";
import { Eye, EyeOff, Mic2, Sparkles, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const features = [
  {
    icon: Trophy,
    title: "Ödüllü yarışmalara katıl",
    text: "Markalı sahnelerde performansını göster, jüri ve topluluk oylarıyla öne çık.",
  },
  {
    icon: Star,
    title: "Oy topla, sıralamada yüksel",
    text: "Trend videolarınla görünürlük kazan, haftanın yıldızları arasına gir.",
  },
  {
    icon: Mic2,
    title: "Karaoke ve performanslarını yönet",
    text: "Mobilde çek, webde profilini ve içerik istatistiklerini takip et.",
  },
  {
    icon: Sparkles,
    title: "Markalar tarafından keşfedil",
    text: "Yetenek profilin ve içeriklerinle sponsorluk fırsatlarına daha hızlı ulaş.",
  },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const logoSrc = "/images/web-logo.png";

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setStoredAuth(data?.accessToken, data?.refreshToken);
        setAuthTokenGetter(() => localStorage.getItem(ACCESS_TOKEN_KEY));
        toast({
          title: "Hoş geldin",
          description: "Başarıyla giriş yaptın.",
          className: "bg-primary text-white border-none",
        });
        setLocation("/");
      },
      onError: (error) => {
        toast({
          title: "Giriş başarısız",
          description: error.message || "E-posta veya şifre hatalı.",
          variant: "destructive",
        });
      },
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="hidden lg:flex w-[46%] relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,0,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,204,255,0.18),transparent_30%),linear-gradient(180deg,#0b0b11_0%,#07070c_100%)]" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Link href="/" className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="FenomenStar"
              className="w-11 h-11 rounded-xl object-cover shadow-[0_0_20px_rgba(255,0,255,0.35)]"
            />
            <span className="font-display font-black text-3xl text-white">FenomenStar</span>
          </Link>

          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-black mb-4">
              Yıldızın burada başlıyor
            </p>
            <h1 className="text-5xl leading-tight font-display font-black mb-5">
              Türkiye'nin yetenek platformuna giriş yap ve sahneye çık.
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              Yarışmalar, karaoke, trend videolar ve marka iş birlikleri tek hesapla seninle.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {features.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-4"
                >
                  <item.icon className="w-5 h-5 text-primary mb-3" />
                  <p className="font-bold text-sm mb-1.5">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Giriş yaparak Kullanım Şartları ve Gizlilik Politikasını kabul etmiş olursun.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="lg:hidden flex items-center gap-3 mb-10">
            <img
              src={logoSrc}
              alt="FenomenStar"
              className="w-11 h-11 rounded-xl object-cover shadow-[0_0_20px_rgba(255,0,255,0.35)]"
            />
            <span className="font-display font-black text-3xl text-white">FenomenStar</span>
          </Link>

          <div className="mb-8">
            <p className="text-sm text-primary font-bold mb-2">Hoş geldin</p>
            <h2 className="text-4xl font-display font-black mb-3">Giriş Yap</h2>
            <p className="text-muted-foreground">
              Hesabın yok mu?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Kayıt ol
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ornek@fenomenstar.com"
                className="w-full bg-card border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Şifreni gir"
                  className="w-full bg-card border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent shadow-[0_0_25px_rgba(255,0,255,0.35)] hover:shadow-[0_0_35px_rgba(255,0,255,0.5)] hover:scale-[1.01] transition-all text-white font-bold disabled:opacity-60"
            >
              {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
