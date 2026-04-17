import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Eye, EyeOff, Mic2, Star, Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        const token = (data as any)?.token;
        if (token) {
          localStorage.setItem("fenomenstar_token", token);
          setAuthTokenGetter(() => localStorage.getItem("fenomenstar_token"));
        }
        toast({ title: "Hoş geldin! 🎉", description: "Başarıyla giriş yaptın.", className: "bg-primary text-white border-none" });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Giriş başarısız", description: "E-posta veya şifre hatalı.", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ data: { email, password } });
  };

  const handleDemo = () => {
    setEmail("zeynep@example.com");
    setPassword("hashedpw");
    loginMutation.mutate({ data: { email: "zeynep@example.com", password: "hashedpw" } });
  };

  const FEATURES = [
    { icon: <Trophy className="w-5 h-5 text-yellow-400" />, text: "Ödüllü yarışmalara katıl" },
    { icon: <Star   className="w-5 h-5 text-primary"      />, text: "Oy topla, sırala yüksel"  },
    { icon: <Mic2   className="w-5 h-5 text-purple-400"   />, text: "Karaoke kayıtları yap"    },
    { icon: <Sparkles className="w-5 h-5 text-cyan-400"  />, text: "Markalar seni keşfetsin"   },
  ];

  return (
    <div className="min-h-screen bg-background flex">

      {/* Sol panel — görsel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{ background: "linear-gradient(135deg, #1a0040 0%, #2d0060 60%, #0d001a 100%)" }}
      >
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse at 60% 30%, rgba(255,0,200,0.5) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(0,200,255,0.3) 0%, transparent 50%)" }}
        />
        <div className="relative z-10 max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.4)]">
              <span className="text-white font-bold text-2xl font-display">F</span>
            </div>
            <span className="font-display font-bold text-3xl text-white">FenomenStar</span>
          </Link>

          <h2 className="text-5xl font-display font-black text-white leading-tight mb-6">
            Yıldızın<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              seni bekliyor.
            </span>
          </h2>
          <p className="text-gray-300 text-lg mb-10">
            Türkiye'nin en büyük yetenek platformuna giriş yap ve sahneye çık!
          </p>

          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-gray-200"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <span className="font-medium">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Sağ panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobil logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-xl font-display">F</span>
            </div>
            <span className="font-display font-bold text-2xl text-white">FenomenStar</span>
          </Link>

          <h1 className="text-3xl font-display font-black text-white mb-2">Giriş Yap</h1>
          <p className="text-muted-foreground mb-8">
            Hesabın yok mu?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">Kayıt ol</Link>
          </p>

          {/* Demo hesap */}
          <button
            onClick={handleDemo}
            disabled={loginMutation.isPending}
            className="w-full mb-6 py-3.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 transition-all text-sm font-semibold text-gray-300 flex items-center justify-center gap-2 hover:border-primary/40"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Demo hesabıyla dene — zeynep@example.com
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="px-4 bg-background text-xs text-muted-foreground">veya e-posta ile</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="zeynep@example.com"
                className="w-full bg-card border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-card border border-white/10 rounded-xl py-3.5 px-4 pr-12 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base shadow-[0_0_25px_rgba(255,0,255,0.35)] hover:shadow-[0_0_35px_rgba(255,0,255,0.5)] hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2 mt-2"
            >
              {loginMutation.isPending ? (
                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Giriş yapılıyor...</>
              ) : "Giriş Yap"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Giriş yaparak{" "}
            <span className="text-primary cursor-pointer hover:underline">Kullanım Şartları</span>
            {" "}ve{" "}
            <span className="text-primary cursor-pointer hover:underline">Gizlilik Politikası</span>
            'nı kabul etmiş olursun.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
