import { useState, useRef, useEffect, useCallback } from "react";
import { Layout } from "@/components/ui/Layout";
import {
  Upload, Video, Music, X, Check, ChevronDown, Loader2, ImagePlus,
  Camera, Square, Circle, Mic, Mic2, Zap, Star, Crown, Rocket,
  AlertCircle, Play, StopCircle, RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

/* ─── Sabitler ─── */
const CATEGORIES = ["Ses", "Dans", "Karaoke", "Komedi", "Enstrüman", "Akrobasi", "Spor", "Diğer"];

const COMPETITIONS = [
  { id: 1, title: "THY Ses Yarışması 2026", prize: "50.000 ₺", tag: "🏆 Sponsorlu" },
  { id: 2, title: "PepsiStar Dans Yarışması",  prize: "30.000 ₺", tag: "💃 Dans" },
  { id: 3, title: "Coca-Cola Karaoke Challenge", prize: "20.000 ₺", tag: "🎤 Karaoke" },
  { id: 4, title: "Nike Spor Yeteneği", prize: "25.000 ₺", tag: "⚽ Spor" },
];

const DOPING_PACKAGES = [
  {
    id: "none", icon: null, title: "Doping Yok", desc: "Sadece organik erişim",
    price: "Ücretsiz", priceNum: 0, color: "border-white/10 bg-white/3", badge: null,
  },
  {
    id: "basic", icon: <Zap className="w-5 h-5 text-yellow-400" />,
    title: "Video Boost", desc: "Videon 24 saat öne çıkar, 3x daha fazla izleyici",
    price: "50 FenomenCoin", priceNum: 50, color: "border-yellow-500/30 bg-yellow-500/5", badge: "Popüler",
  },
  {
    id: "pro", icon: <Star className="w-5 h-5 text-cyan-400" />,
    title: "Ses Kristali", desc: "Arama sonuçlarında üst sıraya çık, 48 saat aktif",
    price: "120 FenomenCoin", priceNum: 120, color: "border-cyan-500/30 bg-cyan-500/5", badge: null,
  },
  {
    id: "elite", icon: <Crown className="w-5 h-5 text-purple-400" />,
    title: "Mega Doping Pack", desc: "Ana sayfada öne çıkar, yarışmada +%20 puan, 72 saat",
    price: "15 StarCoin", priceNum: 15, color: "border-purple-500/30 bg-purple-500/10", badge: "Çok Güçlü",
  },
  {
    id: "turbo", icon: <Rocket className="w-5 h-5 text-pink-400" />,
    title: "Popülerlik Bombası", desc: "7 gün sürekli boost + Profil Shine + Video Doping",
    price: "25 StarCoin", priceNum: 25, color: "border-pink-500/30 bg-pink-500/10", badge: "En Değerli",
  },
];

type Step = "select" | "details" | "boost" | "done";
type UploadMode = "file" | "live";

/* ─── Ana bileşen ─── */
export default function UploadPage() {
  const { toast } = useToast();
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);
  const previewRef    = useRef<HTMLVideoElement>(null);
  const mediaRecRef   = useRef<MediaRecorder | null>(null);
  const chunksRef     = useRef<Blob[]>([]);

  const [step, setStep]           = useState<Step>("select");
  const [mode, setMode]           = useState<UploadMode>("file");
  const [dragOver, setDragOver]   = useState(false);
  const [file, setFile]           = useState<File | null>(null);
  const [thumb, setThumb]         = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  /* Canlı çekim state */
  const [stream, setStream]           = useState<MediaStream | null>(null);
  const [camError, setCamError]       = useState<string | null>(null);
  const [recording, setRecording]     = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recSeconds, setRecSeconds]   = useState(0);
  const recTimerRef = useRef<ReturnType<typeof setInterval>>();
  const [camFacing, setCamFacing]     = useState<"user" | "environment">("user");

  /* Detay form state */
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]     = useState("");
  const [competitionId, setCompetitionId] = useState<number | null>(null);
  const [isKaraoke, setIsKaraoke]   = useState(false);
  const [catOpen, setCatOpen]       = useState(false);

  /* Doping state */
  const [selectedDoping, setSelectedDoping] = useState("none");

  /* Kamera başlat */
  const startCamera = useCallback(async () => {
    setCamError(null);
    setRecordedBlob(null); setRecordedUrl(null); setRecSeconds(0);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: camFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setStream(s);
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); }
    } catch (err: any) {
      setCamError("Kameraya erişim izni verilmedi. Tarayıcı ayarlarından izin verin.");
    }
  }, [camFacing]);

  /* Kamera durdur */
  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [stream]);

  useEffect(() => { return () => stopCamera(); }, []);

  /* Kayıt başlat */
  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" });
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
    };
    mr.start(100);
    mediaRecRef.current = mr;
    setRecording(true);
    setRecSeconds(0);
    recTimerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
  };

  /* Kayıt durdur */
  const stopRecording = () => {
    mediaRecRef.current?.stop();
    setRecording(false);
    clearInterval(recTimerRef.current);
  };

  /* Kaydı kullan */
  const useRecording = () => {
    if (!recordedBlob) return;
    const f = new File([recordedBlob], `kayit_${Date.now()}.webm`, { type: "video/webm" });
    setFile(f);
    stopCamera();
    setStep("details");
  };

  /* Dosya seç */
  const handleFile = (f: File) => {
    if (!f.type.startsWith("video/")) {
      toast({ title: "Hata", description: "Lütfen bir video dosyası seçin.", variant: "destructive" });
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      toast({ title: "Hata", description: "Video 500 MB'dan büyük olamaz.", variant: "destructive" });
      return;
    }
    setFile(f);
    setStep("details");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumb(URL.createObjectURL(f));
  };

  /* Form gönder */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast({ title: "Başlık gerekli", variant: "destructive" }); return; }
    setStep("boost");
  };

  /* Final yükle */
  const handleFinalUpload = async () => {
    setIsUploading(true);
    await new Promise(r => setTimeout(r, 2200));
    setIsUploading(false);
    setStep("done");
    const dopingPkg = DOPING_PACKAGES.find(d => d.id === selectedDoping);
    toast({
      title: "🎉 Video yüklendi!",
      description: dopingPkg && dopingPkg.id !== "none"
        ? `Videonuz "${dopingPkg.title}" doping paketi ile güçlendirildi!`
        : "Videonuz incelemeye alındı ve yakında yayınlanacak.",
      className: "bg-card border border-primary/30",
    });
  };

  const reset = () => {
    setStep("select"); setMode("file"); setFile(null); setThumb(null);
    setTitle(""); setDescription(""); setCategory(""); setCompetitionId(null);
    setIsKaraoke(false); setSelectedDoping("none");
    setRecordedBlob(null); setRecordedUrl(null); setRecSeconds(0);
    stopCamera();
  };

  const STEPS: Step[] = ["select", "details", "boost", "done"];
  const STEP_LABELS = ["Video Seç", "Detaylar", "Doping", "Tamamlandı"];
  const curIdx = STEPS.indexOf(step);

  const fmtSec = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-28">

        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-black mb-2">Video Yükle</h1>
          <p className="text-muted-foreground">Yeteneğini dünyayla paylaş ve yarışmalara katıl</p>
        </div>

        {/* Adım göstergesi */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                step === s ? "bg-primary text-white shadow-lg shadow-primary/40"
                  : curIdx > i ? "bg-green-500 text-white"
                  : "bg-white/10 text-muted-foreground"
              )}>
                {curIdx > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-sm font-medium whitespace-nowrap", step === s ? "text-white" : "text-muted-foreground")}>
                {STEP_LABELS[i]}
              </span>
              {i < STEPS.length - 1 && <div className={cn("w-6 h-px shrink-0", curIdx > i ? "bg-green-500" : "bg-white/10")} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════
              ADIM 1: Video Seç (Dosya veya Canlı Çekim)
          ══════════════════════════════════════ */}
          {step === "select" && (
            <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>

              {/* Mod seçici */}
              <div className="flex rounded-2xl bg-white/5 border border-white/10 p-1.5 mb-6 gap-1.5">
                <button
                  onClick={() => { setMode("file"); stopCamera(); setRecordedBlob(null); setRecordedUrl(null); }}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all",
                    mode === "file" ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted-foreground hover:text-white")}
                >
                  <Upload className="w-4 h-4" /> Dosya Yükle
                </button>
                <button
                  onClick={() => { setMode("live"); setRecordedBlob(null); setRecordedUrl(null); }}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all",
                    mode === "live" ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "text-muted-foreground hover:text-white")}
                >
                  <Camera className="w-4 h-4" />
                  <span className="flex items-center gap-1.5">
                    Canlı Çekim
                    <span className="text-[9px] bg-red-500/80 text-white px-1.5 py-0.5 rounded-full font-bold">YENİ</span>
                  </span>
                </button>
              </div>

              {/* ─ Dosya Yükle modu ─ */}
              {mode === "file" && (
                <>
                  <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all text-center",
                      dragOver ? "border-primary bg-primary/10 scale-[1.02]" : "border-white/20 bg-white/3 hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mb-5">
                      <Upload className="w-9 h-9 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Videoyu sürükle veya tıkla</h3>
                    <p className="text-muted-foreground text-sm mb-6">MP4, MOV, AVI, WebM — Maks. 500 MB</p>
                    <button onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/30">
                      Dosya Seç
                    </button>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      { icon: <Video className="w-4 h-4 text-primary" />, t: "En İyi Format", d: "1080p ve üstü, MP4 formatı" },
                      { icon: <Mic2 className="w-4 h-4 text-accent" />, t: "Karaoke Modu", d: "Ses kayıtlarında karaoke işaretle" },
                    ].map((tip, i) => (
                      <div key={i} className="flex gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">{tip.icon}</div>
                        <div><p className="font-semibold text-xs">{tip.t}</p><p className="text-muted-foreground text-[11px] mt-0.5">{tip.d}</p></div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ─ Canlı Çekim modu ─ */}
              {mode === "live" && (
                <div className="space-y-4">

                  {/* Kamera önizleme */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
                    {recordedUrl ? (
                      /* Kaydedilen video önizlemesi */
                      <video ref={previewRef} src={recordedUrl} controls className="w-full h-full object-cover" />
                    ) : stream ? (
                      <>
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        {recording && (
                          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 backdrop-blur px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span className="text-white text-xs font-bold">{fmtSec(recSeconds)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
                        <Camera className="w-12 h-12 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground text-sm">
                          {camError || "Kamerayı başlatmak için aşağıdaki butona tıkla"}
                        </p>
                        {camError && <AlertCircle className="w-5 h-5 text-red-400" />}
                      </div>
                    )}
                  </div>

                  {/* Kontroller */}
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {!stream && !recordedUrl && (
                      <button onClick={startCamera}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-red-500/30">
                        <Camera className="w-4 h-4" /> Kamerayı Başlat
                      </button>
                    )}

                    {stream && !recording && !recordedUrl && (
                      <>
                        <button onClick={startRecording}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-red-500/30">
                          <Circle className="w-4 h-4 fill-white" /> Kaydı Başlat
                        </button>
                        <button onClick={() => { setCamFacing(f => f === "user" ? "environment" : "user"); setTimeout(startCamera, 100); }}
                          className="p-3 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={stopCamera}
                          className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/15 transition-colors text-sm">
                          <X className="w-4 h-4" /> İptal
                        </button>
                      </>
                    )}

                    {recording && (
                      <button onClick={stopRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg">
                        <Square className="w-4 h-4 fill-black" /> Kaydı Durdur
                      </button>
                    )}

                    {recordedUrl && !recording && (
                      <>
                        <button onClick={useRecording}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/30">
                          <Check className="w-4 h-4" /> Bu Videoyu Kullan
                        </button>
                        <button onClick={() => { setRecordedBlob(null); setRecordedUrl(null); setRecSeconds(0); startCamera(); }}
                          className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/15 transition-colors text-sm">
                          <RotateCcw className="w-4 h-4" /> Tekrar Çek
                        </button>
                      </>
                    )}
                  </div>

                  {/* Canlı çekim ipuçları */}
                  <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground bg-white/3 rounded-2xl p-4 border border-white/10">
                    <p className="font-semibold text-white/80 mb-1">💡 İpuçları</p>
                    {[
                      "İyi aydınlatmalı bir ortamda çek",
                      "Mikrofona yakın dur, net konuş",
                      "Yatay (landscape) mod daha iyi görünür",
                      "Kaydı bitirdikten sonra önizle ve onayla",
                    ].map((t, i) => <p key={i}>• {t}</p>)}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              ADIM 2: Detaylar
          ══════════════════════════════════════ */}
          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Seçilen / Kaydedilen video */}
                <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center shrink-0">
                    {mode === "live" ? <Camera className="w-6 h-6 text-red-400" /> : <Video className="w-6 h-6 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{file?.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {mode === "live" ? "🔴 Canlı Çekim" : ""} {file ? (file.size / 1024 / 1024).toFixed(1) + " MB" : ""}
                    </p>
                  </div>
                  <button type="button" onClick={() => { setFile(null); setStep("select"); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Kapak görseli */}
                <div>
                  <label className="text-sm font-semibold text-white/80 mb-2 block">Kapak Görseli (İsteğe Bağlı)</label>
                  <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumb} />
                  <button type="button" onClick={() => thumbInputRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer overflow-hidden relative">
                    {thumb
                      ? <img src={thumb} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
                      : <><ImagePlus className="w-6 h-6 text-muted-foreground" /><span className="text-sm text-muted-foreground">Görsel Yükle</span></>}
                  </button>
                </div>

                {/* Başlık */}
                <div>
                  <label className="text-sm font-semibold text-white/80 mb-2 block">Başlık *</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Videonuza açıklayıcı bir başlık verin..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                </div>

                {/* Açıklama */}
                <div>
                  <label className="text-sm font-semibold text-white/80 mb-2 block">Açıklama</label>
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Videonuz hakkında birkaç kelime, hashtag ekleyin..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>

                {/* Kategori */}
                <div className="relative">
                  <label className="text-sm font-semibold text-white/80 mb-2 block">Kategori</label>
                  <button type="button" onClick={() => setCatOpen(o => !o)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-left flex items-center justify-between focus:outline-none focus:border-primary transition-colors">
                    <span className={category ? "text-white" : "text-muted-foreground"}>{category || "Kategori seçin"}</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", catOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {catOpen && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 top-full left-0 right-0 mt-2 bg-card border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        {CATEGORIES.map(cat => (
                          <button key={cat} type="button" onClick={() => { setCategory(cat); setCatOpen(false); }}
                            className={cn("w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center justify-between",
                              category === cat && "text-primary bg-primary/10")}>
                            {cat} {category === cat && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Yarışma seçimi */}
                <div>
                  <label className="text-sm font-semibold text-white/80 mb-2 block">Yarışmaya Katıl (İsteğe Bağlı)</label>
                  <div className="space-y-2">
                    {COMPETITIONS.map(c => (
                      <button key={c.id} type="button" onClick={() => setCompetitionId(id => id === c.id ? null : c.id)}
                        className={cn("w-full text-left px-4 py-3.5 rounded-2xl text-sm border transition-all",
                          competitionId === c.id ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:border-white/30")}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={cn("font-semibold", competitionId === c.id && "text-primary")}>{c.title}</span>
                            <span className="ml-2 text-[10px] bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full">{c.tag}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-yellow-400">{c.prize}</span>
                            {competitionId === c.id && <Check className="w-4 h-4 text-primary" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Togglelar */}
                {[
                  { key: "karaoke", label: "Karaoke Kaydı", sub: "Bu video bir karaoke performansı mı?", val: isKaraoke, set: setIsKaraoke },
                ].map(t => (
                  <div key={t.key} className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-4 border border-white/10">
                    <div>
                      <p className="font-semibold text-sm">{t.label}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{t.sub}</p>
                    </div>
                    <button type="button" onClick={() => t.set((v: boolean) => !v)}
                      className={cn("w-12 h-6 rounded-full transition-colors relative shrink-0", t.val ? "bg-primary" : "bg-white/20")}>
                      <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", t.val ? "left-7" : "left-1")} />
                    </button>
                  </div>
                ))}

                <button type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                  Devam Et — Doping Seçimi <Zap className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              ADIM 3: Doping Seçimi
          ══════════════════════════════════════ */}
          {step === "boost" && (
            <motion.div key="boost" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">

              <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-transparent rounded-2xl p-4 border border-yellow-500/20 flex items-start gap-3 mb-2">
                <Zap className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-yellow-300">Doping ile daha fazla izleyiciye ulaş!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Doping paketi seçerek videonun öne çıkmasını sağlayabilirsin. İstersen doping olmadan da yükleyebilirsin.</p>
                </div>
              </div>

              {DOPING_PACKAGES.map(pkg => (
                <motion.button
                  key={pkg.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={() => setSelectedDoping(pkg.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4",
                    selectedDoping === pkg.id
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : pkg.color
                  )}
                >
                  {pkg.icon ? (
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">{pkg.icon}</div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{pkg.title}</span>
                      {pkg.badge && (
                        <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{pkg.desc}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("text-xs font-bold", pkg.priceNum > 0 ? "text-yellow-400" : "text-muted-foreground")}>{pkg.price}</p>
                    {selectedDoping === pkg.id && <Check className="w-4 h-4 text-primary ml-auto mt-1" />}
                  </div>
                </motion.button>
              ))}

              {/* Coin bilgisi */}
              <div className="bg-white/3 rounded-2xl p-4 border border-white/10 text-xs text-muted-foreground">
                <p>💡 <strong className="text-white/80">FenomenCoin</strong> ≈ 0.75 ₺ · <strong className="text-white/80">StarCoin</strong> ≈ 2.5 ₺ · Coin satın almak için <Link href="/doping" className="text-primary underline">Doping Sayfasına</Link> git.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("details")}
                  className="flex-1 py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/15 transition-colors text-sm">
                  ← Geri
                </button>
                <button onClick={handleFinalUpload} disabled={isUploading}
                  className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                  {isUploading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...</>
                    : <><Upload className="w-5 h-5" />
                        {selectedDoping !== "none"
                          ? `Yükle + ${DOPING_PACKAGES.find(d => d.id === selectedDoping)?.title}`
                          : "Videoyu Yükle"}</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              ADIM 4: Tamamlandı
          ══════════════════════════════════════ */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-display font-black mb-3">Yüklendi! 🎉</h2>

              {selectedDoping !== "none" && (() => {
                const pkg = DOPING_PACKAGES.find(d => d.id === selectedDoping)!;
                return (
                  <div className="inline-flex items-center gap-2 mb-5 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-sm text-primary font-semibold">
                    {pkg.icon} {pkg.title} aktif!
                  </div>
                );
              })()}

              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Videonuz incelemeye alındı. Onaylandıktan sonra yayınlanacak ve yarışmacı sıralamana eklenecek.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/profile" className="px-8 py-3.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-2xl hover:opacity-90 transition-opacity">
                  Profilime Git
                </Link>
                <button onClick={reset}
                  className="px-8 py-3.5 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                  Yeni Video Yükle
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </Layout>
  );
}
