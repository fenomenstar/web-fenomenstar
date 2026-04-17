import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/ui/Layout";
import { useGetKaraokeTracks } from "@workspace/api-client-react";
import {
  Mic2, Play, Search as SearchIcon, X, Music, Clock, Star,
  Volume2, VolumeX, Square, RotateCcw, Send, Upload,
  Headphones, Zap, TrendingUp, Flame, Sparkles, ChevronRight,
  Trophy, Check, Pause, Heart, Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Yardımcı ─── */
function formatDur(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

/* ─── Sabitler ─── */
const GENRES = [
  { id: "all", label: "Tümü", icon: "🎵" },
  { id: "pop", label: "Pop", icon: "✨" },
  { id: "turku", label: "Türkü", icon: "🪗" },
  { id: "arabesk", label: "Arabesk", icon: "🌙" },
  { id: "rock", label: "Rock", icon: "🎸" },
  { id: "rap", label: "Rap", icon: "🎤" },
  { id: "slow", label: "Slow", icon: "💫" },
  { id: "rb", label: "R&B", icon: "🎶" },
];

const TRACK_LYRICS: Record<number, string[]> = {
  1: ["Gözlerin gözlerime değdiğinde", "Felaketim olurdu, ağlardım", "Beni sevmiyordun bilirdim", "Yine de vazgeçemedim"],
  2: ["Oy Havada bulut yok", "Niye dökmez yağmur", "Gönlümde senin derdin", "Bitmez tükenmez oldu"],
  3: ["Seni seviyorum en derinden", "Kalbim sana ait olalı", "Geçen günler yordu bizi", "Yine de buradayım"],
};
const DEFAULT_LYRICS = ["♪ Altyapı çalınıyor ♪", "Sesi hisset, ritme gir", "Mikrofona doğru söyle", "Karaoke tutku demek!", "Sesini dünyayla paylaş"];

const COMPETITIONS = [
  { id: 1, title: "THY Ses Yarışması 2026", prize: "50.000 ₺" },
  { id: 2, title: "Coca-Cola Karaoke Challenge", prize: "20.000 ₺" },
  { id: 3, title: "Türkü Gecesi Özel", prize: "10.000 ₺" },
];

type RecState = "idle" | "countdown" | "recording" | "paused" | "done";
type StudioTab = "record" | "share";

/* ══════════════════════════════════════════
   KAYIT ODASI — Full-screen studio
══════════════════════════════════════════ */
function StudioModal({ track, onClose }: { track: any; onClose: () => void }) {
  const { toast } = useToast();
  const [recState, setRecState]       = useState<RecState>("idle");
  const [studioTab, setStudioTab]     = useState<StudioTab>("record");
  const [countdown, setCountdown]     = useState(3);
  const [elapsed, setElapsed]         = useState(0);
  const [lyricsIdx, setLyricsIdx]     = useState(0);
  const [bgVolume, setBgVolume]       = useState(80);
  const [micVolume, setMicVolume]     = useState(100);
  const [isMuted, setIsMuted]         = useState(false);
  const [waveData, setWaveData]       = useState<number[]>(Array(32).fill(4));
  const [beatPulse, setBeatPulse]     = useState(false);
  const [selectedComp, setSelectedComp] = useState<number | null>(null);
  const [micError, setMicError]       = useState<string | null>(null);
  const [isRecordingReal, setIsRecordingReal] = useState(false);

  const timerRef    = useRef<ReturnType<typeof setInterval>>();
  const beatRef     = useRef<ReturnType<typeof setInterval>>();
  const waveRef     = useRef<ReturnType<typeof setInterval>>();
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>();

  const lyrics = TRACK_LYRICS[track.id] ?? DEFAULT_LYRICS;
  const bpm = track.bpm ?? 90;

  /* Waveform animasyonu */
  const startWaveAnimation = useCallback(() => {
    const animate = () => {
      if (analyserRef.current) {
        const arr = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(arr);
        const bars: number[] = [];
        const step = Math.floor(arr.length / 32);
        for (let i = 0; i < 32; i++) bars.push(Math.max(4, (arr[i * step] / 255) * 60));
        setWaveData(bars);
      } else {
        // Simüle dalga
        setWaveData(prev => prev.map(() => recState === "recording"
          ? Math.max(4, Math.min(60, 15 + Math.random() * 35))
          : Math.max(4, Math.random() * 12)));
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, [recState]);

  /* Geri sayım */
  useEffect(() => {
    if (recState !== "countdown") return;
    setCountdown(3);
    let c = 3;
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) { clearInterval(t); setRecState("recording"); }
    }, 1000);
    return () => clearInterval(t);
  }, [recState]);

  /* Kayıt */
  useEffect(() => {
    if (recState !== "recording") return;
    setElapsed(0); setLyricsIdx(0);

    // Gerçek mikrofon girişi dene
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        src.connect(analyser);
        analyserRef.current = analyser;
        setIsRecordingReal(true);

        const mr = new MediaRecorder(stream);
        mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.start(100);
        mediaRecRef.current = mr;
      } catch {
        setMicError("Mikrofon erişimi yok — simülasyon modunda devam ediliyor.");
      }
    })();

    startWaveAnimation();

    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const n = e + 1;
        if (n % 5 === 0) setLyricsIdx(i => (i + 1) % lyrics.length);
        if (n >= (track.duration || 180)) {
          stopRecording();
          return n;
        }
        return n;
      });
    }, 1000);

    beatRef.current = setInterval(() => {
      setBeatPulse(true);
      setTimeout(() => setBeatPulse(false), 150);
    }, (60 / bpm) * 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(beatRef.current);
      cancelAnimationFrame(animFrameRef.current!);
    };
  }, [recState]);

  const stopRecording = () => {
    clearInterval(timerRef.current);
    clearInterval(beatRef.current);
    cancelAnimationFrame(animFrameRef.current!);
    mediaRecRef.current?.stop();
    setWaveData(Array(32).fill(4));
    setRecState("done");
  };

  const handlePublish = () => {
    toast({
      title: "🎉 Karaoke yüklendi!",
      description: selectedComp
        ? `Yarışmaya gönderildi: ${COMPETITIONS.find(c => c.id === selectedComp)?.title}`
        : "Profil galerinde yayınlandı.",
      className: "bg-card border border-primary/30",
    });
    onClose();
  };

  const progress = ((elapsed / (track.duration || 180)) * 100).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#06000f]">

      {/* ── Studio Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <img src={track.coverUrl || `https://picsum.photos/seed/ktrack${track.id}/80`}
            className="w-9 h-9 rounded-lg object-cover" alt={track.title} />
          <div>
            <p className="font-bold text-sm line-clamp-1">{track.title}</p>
            <p className="text-xs text-muted-foreground">{track.artist} · {formatDur(track.duration || 180)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {recState === "recording" && (
            <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> REC {formatDur(elapsed)}
            </span>
          )}
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Tabs (Record / Share) ── */}
      <div className="flex border-b border-white/5 shrink-0">
        {([["record", "🎙 Kayıt Stüdyosu"], ["share", "🚀 Paylaş & Gönder"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => { if (recState === "done" || id === "record") setStudioTab(id as StudioTab); }}
            className={cn("flex-1 py-3 text-sm font-semibold transition-all border-b-2",
              studioTab === id ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-white",
              id === "share" && recState !== "done" && "opacity-40 cursor-not-allowed")}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══ KAYIT STÜDYOSU ══ */}
        {studioTab === "record" && (
          <motion.div key="record" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden">

            {/* Arkaplan cover blur */}
            <div className="absolute inset-0 pointer-events-none">
              <img src={track.coverUrl || `https://picsum.photos/seed/ktrack${track.id}/600`}
                className="w-full h-full object-cover opacity-5 blur-2xl scale-110" alt="" />
            </div>

            {/* Progress barı */}
            <div className="h-1 bg-white/5 shrink-0">
              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>

            {/* ── Sözler ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 relative z-10 select-none">

              {/* Geri sayım */}
              <AnimatePresence>
                {recState === "countdown" && (
                  <motion.div key={countdown} initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30">
                    <span className="text-[120px] font-display font-black text-primary drop-shadow-[0_0_40px_rgba(255,0,255,0.8)] leading-none">
                      {countdown > 0 ? countdown : "GO!"}
                    </span>
                    <p className="text-white/60 text-lg mt-4">Hazır ol, kaydediyoruz...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hata banner */}
              {micError && (
                <div className="absolute top-4 left-4 right-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2 text-xs text-yellow-300 text-center z-20">
                  ⚠️ {micError}
                </div>
              )}

              {/* Tempo nabzı */}
              {recState === "recording" && (
                <div className="flex items-center gap-2 mb-6">
                  <motion.div animate={{ scale: beatPulse ? 1.4 : 1 }} transition={{ duration: 0.1 }}
                    className="w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_rgba(255,0,255,0.8)]" />
                  <span className="text-xs text-muted-foreground">{bpm} BPM</span>
                  <div className="flex gap-0.5">
                    {[...Array(8)].map((_, i) => (
                      <motion.div key={i} animate={{ opacity: beatPulse && i === (Math.floor(elapsed * (bpm / 60)) % 8) ? 1 : 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-primary" />
                    ))}
                  </div>
                </div>
              )}

              {/* Sözler */}
              <div className="text-center space-y-6 mb-8 max-w-lg">
                {(recState === "recording" || recState === "paused" || recState === "done") ? (
                  <>
                    <p className="text-lg font-semibold text-white/30 transition-all duration-500">
                      {lyrics[(lyricsIdx - 1 + lyrics.length) % lyrics.length]}
                    </p>
                    <motion.p key={lyricsIdx} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                      className="text-3xl md:text-4xl font-display font-black text-white drop-shadow-[0_0_20px_rgba(255,0,255,0.4)] leading-tight">
                      {lyrics[lyricsIdx]}
                    </motion.p>
                    <p className="text-lg font-semibold text-white/30 transition-all duration-500">
                      {lyrics[(lyricsIdx + 1) % lyrics.length]}
                    </p>
                  </>
                ) : recState === "idle" ? (
                  <div>
                    <Mic2 className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                    <p className="text-2xl font-display font-black text-white mb-2">Hazır mısın?</p>
                    <p className="text-muted-foreground">Kayıt başlatmak için aşağıdaki butona dokun</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-3xl font-display font-black text-primary mb-2">Muhteşem!</p>
                    <p className="text-muted-foreground">Kaydınız hazır. Paylaşmak için Paylaş sekmesine geç!</p>
                  </div>
                )}
              </div>

              {/* ── Ses dalgası görselleştirmesi ── */}
              <div className="flex items-end gap-0.5 h-16 mb-6">
                {waveData.map((h, i) => (
                  <motion.div key={i} animate={{ height: `${h}px` }} transition={{ duration: 0.08 }}
                    className={cn("w-1.5 rounded-full transition-colors",
                      recState === "recording"
                        ? i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-accent" : "bg-primary/60"
                        : "bg-white/15")} />
                ))}
              </div>
            </div>

            {/* ── Kontrol paneli ── */}
            <div className="shrink-0 px-6 pb-8 pt-2 space-y-5 bg-black/40 backdrop-blur-sm border-t border-white/5 relative z-10">

              {/* Ses seviyesi kontrolü */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs text-muted-foreground">Altyapı</span>
                    <span className="ml-auto text-xs font-bold text-cyan-400">%{bgVolume}</span>
                  </div>
                  <input type="range" min={0} max={100} value={bgVolume} onChange={e => setBgVolume(+e.target.value)}
                    className="w-full h-1.5 accent-cyan-400 rounded-full cursor-pointer" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mic2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">Mikrofon</span>
                    <span className="ml-auto text-xs font-bold text-primary">%{micVolume}</span>
                    <button onClick={() => setIsMuted(m => !m)} className="p-0.5">
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                  </div>
                  <input type="range" min={0} max={100} value={isMuted ? 0 : micVolume} onChange={e => setMicVolume(+e.target.value)}
                    className="w-full h-1.5 accent-primary rounded-full cursor-pointer" />
                </div>
              </div>

              {/* Ana butonlar */}
              <div className="flex items-center justify-center gap-4">
                {recState === "idle" && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setRecState("countdown")}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_40px_rgba(255,0,255,0.5)] border-4 border-white/20">
                    <Mic2 className="w-9 h-9 text-white" />
                  </motion.button>
                )}

                {recState === "recording" && (
                  <>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { clearInterval(timerRef.current); clearInterval(beatRef.current); cancelAnimationFrame(animFrameRef.current!); setRecState("paused"); }}
                      className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <Pause className="w-6 h-6" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={stopRecording}
                      className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] border-4 border-white/20">
                      <Square className="w-8 h-8 text-white fill-white" />
                    </motion.button>
                  </>
                )}

                {recState === "paused" && (
                  <>
                    <button onClick={() => { setRecState("idle"); setElapsed(0); setLyricsIdx(0); setMicError(null); }}
                      className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all">
                      <RotateCcw className="w-4 h-4" /> Sıfırla
                    </button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setRecState("recording")}
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_30px_rgba(255,0,255,0.4)] border-4 border-white/20">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </motion.button>
                    <button onClick={stopRecording}
                      className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all">
                      <Square className="w-4 h-4" /> Bitir
                    </button>
                  </>
                )}

                {recState === "done" && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="flex gap-3">
                      <button onClick={() => { setRecState("idle"); setElapsed(0); setLyricsIdx(0); setMicError(null); setStudioTab("record"); }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all">
                        <RotateCcw className="w-4 h-4" /> Tekrar Kaydet
                      </button>
                      <button onClick={() => setStudioTab("share")}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold shadow-[0_0_20px_rgba(255,0,255,0.4)] hover:scale-105 transition-all">
                        <Send className="w-4 h-4" /> Paylaş
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDur(elapsed)} kayıt hazır · Paylaş sekmesine geç</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ PAYLAŞ ══ */}
        {studioTab === "share" && recState === "done" && (
          <motion.div key="share" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Kayıt özeti */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
              <img src={track.coverUrl || `https://picsum.photos/seed/ktrack${track.id}/80`}
                className="w-14 h-14 rounded-xl object-cover" alt={track.title} />
              <div className="flex-1">
                <p className="font-bold">{track.title}</p>
                <p className="text-sm text-muted-foreground">{track.artist}</p>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Kayıt hazır</span>
                  <span className="text-muted-foreground">⏱ {formatDur(elapsed)}</span>
                  {isRecordingReal && <span className="text-cyan-400">🎙 Gerçek ses</span>}
                </div>
              </div>
            </div>

            {/* Yayın Seçenekleri */}
            <div>
              <h3 className="font-bold text-sm text-white/80 mb-3">Nereye Göndermek İstiyorsunuz?</h3>
              <div className="space-y-2">
                <button onClick={() => setSelectedComp(null)}
                  className={cn("w-full flex items-center gap-3 px-4 py-4 rounded-2xl border text-left transition-all",
                    selectedComp === null ? "border-primary bg-primary/10" : "border-white/10 bg-white/3 hover:border-white/20")}>
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Profil Galerisi</p>
                    <p className="text-xs text-muted-foreground">Takipçilerinle paylaş, oy topla</p>
                  </div>
                  {selectedComp === null && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>

                {COMPETITIONS.map(comp => (
                  <button key={comp.id} onClick={() => setSelectedComp(comp.id)}
                    className={cn("w-full flex items-center gap-3 px-4 py-4 rounded-2xl border text-left transition-all",
                      selectedComp === comp.id ? "border-primary bg-primary/10" : "border-white/10 bg-white/3 hover:border-white/20")}>
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{comp.title}</p>
                      <p className="text-xs text-yellow-400 font-bold">🏆 {comp.prize} ödüllü yarışma</p>
                    </div>
                    {selectedComp === comp.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="text-sm font-semibold text-white/80 mb-2 block">Açıklama (İsteğe Bağlı)</label>
              <textarea rows={3} placeholder="Bu karaoke kaydı hakkında bir şeyler yaz..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none" />
            </div>

            {/* Doping */}
            <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
              <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-yellow-300">Doping ile öne çık!</p>
                <p className="text-xs text-muted-foreground">Karaoke kaydını daha fazla kişiye ulaştır</p>
              </div>
              <button className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-3 py-1.5 rounded-full hover:bg-yellow-400/20 transition-colors">
                Paketi Gör
              </button>
            </div>

            {/* Gönder */}
            <button onClick={handlePublish}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
              <Upload className="w-5 h-5" />
              {selectedComp
                ? `Yarışmaya Gönder — ${COMPETITIONS.find(c => c.id === selectedComp)?.title}`
                : "Profilde Yayınla"}
            </button>

          </motion.div>
        )}

        {studioTab === "share" && recState !== "done" && (
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div>
              <Mic2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">Önce bir kayıt yapmanız gerekiyor.</p>
              <button onClick={() => setStudioTab("record")} className="mt-4 text-primary font-semibold text-sm hover:text-primary/80 transition-colors">
                Kayıt Stüdyosuna Dön →
              </button>
            </div>
          </div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   ANA SAYFA
══════════════════════════════════════════ */
export default function Karaoke() {
  const [search, setSearch]             = useState("");
  const [genre, setGenre]               = useState("all");
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const { data, isLoading }             = useGetKaraokeTracks({ q: search });

  /* Demo altyapı zenginleştirme */
  const enrichTrack = (t: any, i: number) => ({
    ...t,
    bpm: [90, 105, 75, 120, 95, 110][i % 6],
    genre: GENRES[(i % (GENRES.length - 1)) + 1].id,
    difficulty: (i % 3) + 1,
    plays: Math.floor(Math.random() * 50000) + 5000,
    likes: Math.floor(Math.random() * 8000) + 500,
  });

  const rawTracks = (data?.tracks ?? []).map(enrichTrack);
  const tracks = rawTracks.filter((t: any) =>
    (genre === "all" || t.genre === genre) &&
    (!search || t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-16">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-b-3xl p-8 md:p-12 mb-8"
          style={{ background: "linear-gradient(135deg, #1a0040 0%, #2d0060 60%, #0a001a 100%)" }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(ellipse at 70% 30%, rgba(192,132,252,0.5) 0%, transparent 60%)" }} />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Mic2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black text-primary tracking-widest uppercase">FenomenStar</p>
                  <h1 className="text-3xl md:text-5xl font-display font-black leading-tight">Karaoke Stüdyosu</h1>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Profesyonel altyapılar eşliğinde kaydet — ses dalgasını gör, ritmi hisset, yarışmalara gönder!
              </p>
              <div className="relative max-w-md">
                <input type="text" placeholder="Şarkı adı veya sanatçı ara..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-full py-4 pl-12 pr-5 text-white focus:outline-none focus:border-primary transition-colors backdrop-blur-md placeholder:text-gray-500" />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center gap-3">
              <div className="text-[80px] leading-none select-none">🎤</div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mic2 className="w-3 h-3 text-primary" /> Gerçek Kayıt</span>
                <span className="flex items-center gap-1"><Headphones className="w-3 h-3 text-cyan-400" /> Mix Kontrol</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8">

          {/* Hızlı seçimler */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { icon: <Flame className="w-4 h-4 text-orange-400" />, label: "Trend", sub: "Bu hafta çok söylendi", color: "border-orange-500/20 hover:border-orange-500/40" },
              { icon: <Sparkles className="w-4 h-4 text-yellow-400" />, label: "Yeni Eklenenler", sub: "Taze altyapılar", color: "border-yellow-500/20 hover:border-yellow-500/40" },
              { icon: <TrendingUp className="w-4 h-4 text-green-400" />, label: "Yarışma Önerileri", sub: "Aktif yarışmalar için", color: "border-green-500/20 hover:border-green-500/40" },
            ].map((c, i) => (
              <button key={i} className={cn("flex flex-col items-start gap-1.5 bg-white/3 border rounded-2xl p-3 text-left transition-all", c.color)}>
                <div className="flex items-center gap-1.5">{c.icon}<span className="font-bold text-sm">{c.label}</span></div>
                <span className="text-[11px] text-muted-foreground">{c.sub}</span>
              </button>
            ))}
          </div>

          {/* Tür filtreleri */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
            {GENRES.map(g => (
              <button key={g.id} onClick={() => setGenre(g.id)}
                className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0",
                  genre === g.id
                    ? "bg-primary text-white shadow-[0_0_15px_rgba(255,0,255,0.3)]"
                    : "bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10")}>
                {g.icon} {g.label}
              </button>
            ))}
          </div>

          {/* Parça listesi */}
          <div className="space-y-2">
            {isLoading ? (
              [1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)
            ) : tracks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Parça bulunamadı.</p>
                <p className="text-sm mt-1">Farklı bir kategori veya arama terimi deneyin.</p>
              </div>
            ) : tracks.map((track: any, i: number) => (
              <motion.div key={track.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} whileHover={{ x: 3 }}
                className="group flex items-center justify-between p-4 rounded-2xl bg-card border border-white/5 hover:border-primary/30 hover:bg-white/3 transition-all cursor-pointer"
                onClick={() => setSelectedTrack(track)}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Kapak */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                    <img src={track.coverUrl || `https://picsum.photos/seed/k${track.id}/150`}
                      className="w-full h-full object-cover" alt={track.title} />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Mic2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors line-clamp-1">{track.title}</h3>
                    <p className="text-muted-foreground text-xs">{track.artist}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {track.genre && (
                        <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                          {GENRES.find(g => g.id === track.genre)?.icon} {GENRES.find(g => g.id === track.genre)?.label}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Play className="w-2.5 h-2.5" /> {(track.plays / 1000).toFixed(1)}K
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5" /> {(track.likes / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {/* Zorluk */}
                  <div className="hidden md:flex gap-0.5">
                    {[1,2,3].map(s => (
                      <Star key={s} className={cn("w-3 h-3", s <= track.difficulty ? "text-yellow-400 fill-yellow-400" : "text-gray-700")} />
                    ))}
                  </div>
                  {/* BPM */}
                  <span className="hidden md:block text-[10px] text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
                    {track.bpm} BPM
                  </span>
                  <span className="text-xs text-gray-500 hidden md:flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDur(track.duration || 180)}
                  </span>
                  <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-all text-sm border border-primary/30 hover:border-transparent hover:shadow-[0_0_15px_rgba(255,0,255,0.3)]">
                    <Mic2 className="w-3.5 h-3.5" /> Söyle
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground hidden md:block" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Kayıt Stüdyosu Modalı */}
      <AnimatePresence>
        {selectedTrack && (
          <StudioModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
