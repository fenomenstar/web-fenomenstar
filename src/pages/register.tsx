import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Eye, EyeOff, User, Mail, Lock, MapPin, Music } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Diğer"];
const CATS   = ["Ses / Şarkı", "Dans", "Karaoke", "Komedi", "Enstrüman", "Futbol", "Tasarım", "Akrobasi"];

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [form, setForm] = useState({
    username: "", email: "", password: "", displayName: "", city: "", category: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [step, setStep]     = useState(1);

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        const token = (data as any)?.token;
        if (token) {
          localStorage.setItem("fenomenstar_token", token);
          setAuthTokenGetter(() => localStorage.getItem("fenomenstar_token"));
        }
        toast({ title: "Hoş geldin! 🎉", description: "Hesabın oluşturuldu!", className: "bg-primary text-white border-none" });
        setLocation("/");
      },
      onError: (err: any) => {
        toast({ title: "Kayıt başarısız", description: err?.message || "Bir sorun oluştu.", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    registerMutation.mutate({ data: form });
  };

  const isStep1Valid = form.username.length >= 3 && form.email.includes("@") && form.password.length >= 6;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_15px_rgba(255,0,255,0.3)]">
            <span className="text-white font-bold text-xl font-display">F</span>
          </div>
          <span className="font-display font-bold text-2xl text-white">FenomenStar</span>
        </Link>

        {/* Adım göstergesi */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                step >= s ? "bg-primary text-white shadow-[0_0_15px_rgba(255,0,255,0.3)]" : "bg-white/10 text-muted-foreground"
              )}>
                {s}
              </div>
              {s < 2 && <div className={cn("flex-1 h-0.5 w-12 rounded-full", step > s ? "bg-primary" : "bg-white/10")} />}
            </div>
          ))}
          <span className="ml-1 text-sm text-muted-foreground">
            {step === 1 ? "Hesap bilgileri" : "Profil ayarları"}
          </span>
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-3xl font-display font-black text-white mb-2">
            {step === 1 ? "Hesap Oluştur" : "Profilini Kur"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {step === 1 ? (
              <>Zaten hesabın var mı? <Link href="/login" className="text-primary font-semibold hover:underline">Giriş yap</Link></>
            ) : "Birkaç adım daha — hızlıca tamamla!"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı adı</label>
                  <div className="relative">
                    <input
                      type="text" required minLength={3} value={form.username} onChange={e => upd("username", e.target.value.toLowerCase().replace(/\s/g, "_"))}
                      placeholder="zeynep_ses"
                      className="w-full bg-card border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Minimum 3 karakter, sadece harf/rakam/_</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                  <div className="relative">
                    <input
                      type="email" required value={form.email} onChange={e => upd("email", e.target.value)}
                      placeholder="zeynep@example.com"
                      className="w-full bg-card border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"} required minLength={6} value={form.password} onChange={e => upd("password", e.target.value)}
                      placeholder="Minimum 6 karakter"
                      className="w-full bg-card border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Görünen ad (isteğe bağlı)</label>
                  <input
                    type="text" value={form.displayName} onChange={e => upd("displayName", e.target.value)}
                    placeholder="Zeynep Ses"
                    className="w-full bg-card border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Şehir</label>
                  <div className="relative">
                    <select
                      value={form.city} onChange={e => upd("city", e.target.value)}
                      className="w-full bg-card border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Şehir seçin...</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Yetenek kategorisi</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATS.map(cat => (
                      <button
                        key={cat} type="button"
                        onClick={() => upd("category", cat)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl text-sm font-medium border transition-all text-left",
                          form.category === cat
                            ? "bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(255,0,255,0.2)]"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button
                  type="button" onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl bg-white/5 border border-white/15 text-white font-bold hover:bg-white/10 transition-all"
                >
                  Geri
                </button>
              )}
              <button
                type="submit"
                disabled={step === 1 && !isStep1Valid || registerMutation.isPending}
                className={cn(
                  "py-4 rounded-xl text-white font-bold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                  step === 2 ? "flex-1" : "w-full",
                  "bg-gradient-to-r from-primary to-accent shadow-[0_0_25px_rgba(255,0,255,0.35)] hover:shadow-[0_0_35px_rgba(255,0,255,0.5)] hover:scale-[1.02]"
                )}
              >
                {registerMutation.isPending ? (
                  <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Oluşturuluyor...</>
                ) : step === 1 ? "Devam Et →" : "Hesap Oluştur 🚀"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
