import { Layout } from "@/components/ui/Layout";
import { Download, Eye, Flame, Mic2, Play, Radio, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useGetVideos } from "@workspace/api-client-react";
import { PLAY_STORE_URL } from "@/lib/constants";

export default function LiveRoom() {
  const { data } = useGetVideos({ limit: 4 });
  const videos = data?.videos ?? [];

  return (
    <Layout hideBottomNav>
      <div className="h-[100dvh] w-full bg-black flex flex-col md:flex-row relative overflow-hidden">
        <div className="flex-1 relative flex items-center justify-center bg-[#060010] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0030] to-[#000520]">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 50% 50%, rgba(192,132,252,0.3) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6 text-center">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-4 border-primary/40 flex items-center justify-center shadow-[0_0_60px_rgba(255,0,255,0.3)] overflow-hidden">
              <img
                src="https://picsum.photos/seed/live-host-preview/400"
                className="w-full h-full object-cover"
                alt="live preview"
              />
            </div>
            <div className="mt-4">
              <p className="font-display font-black text-2xl text-white">Canlı Yayın Sahnesi</p>
              <p className="text-primary text-sm">Yayın başlatma ve host olma deneyimi mobil uygulamada aktif</p>
            </div>
          </div>

          <div className="absolute top-4 left-4 right-4 flex items-center gap-3 z-20">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-3 py-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-white text-sm font-bold">TANITIM</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-3 py-2 border border-white/10 text-sm">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-white font-bold">1.2K</span>
            </div>
            <div className="flex-1" />
          </div>

          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-gradient-to-r from-primary to-accent px-6 py-2.5 rounded-full shadow-[0_0_25px_rgba(255,0,255,0.4)] border border-white/20">
              <p className="font-black text-xl text-white text-center">CANLI YAYIN MOBILDE</p>
            </div>
          </div>

          <div className="absolute right-4 bottom-8 md:bottom-12 flex flex-col gap-3 z-30">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)] border-2 border-white/20 hover:scale-110 transition-all"
            >
              <Radio className="w-6 h-6 text-white" />
            </a>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.6)] border-2 border-white/20 hover:scale-110 transition-all"
            >
              <Download className="w-6 h-6 text-white" />
            </a>
          </div>
        </div>

        <div className="w-full md:w-96 h-[42vh] md:h-full bg-card border-l border-white/10 flex flex-col z-20">
          <div className="p-4 border-b border-white/10 bg-black/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" /> Canlı Yayın Bilgisi
              </h3>
              <span className="text-xs text-muted-foreground">Webde kesif · mobilde yayin</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "İzleyici", value: "1.2K" },
                { label: "Oy", value: "324" },
                { label: "Hediye", value: "18" },
              ].map((item) => (
                <div key={item.label} className="bg-white/3 rounded-lg px-2 py-2 text-center">
                  <p className="text-sm font-black text-white">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-red-400" />
                <p className="font-bold text-sm text-red-300">Yayın başlatma sadece uygulamada</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Host olarak canli yayin acma, WebRTC kamera/mikrofon akisi, hediye gonderimi ve anlik oylama mobil uygulama ile entegre calisir.
              </p>
            </div>

            <div className="space-y-3">
              {videos.map((video: any) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 bg-white/3 rounded-2xl p-3 border border-white/5"
                >
                  <img
                    src={video.thumbnailUrl || `https://picsum.photos/seed/live-side-${video.id}/120/180`}
                    className="w-16 h-20 rounded-xl object-cover"
                    alt={video.title}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold line-clamp-2">{video.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">@{video.username}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Play className="w-3 h-3" /> Keşifte görünür
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-white/10 bg-black/30">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold hover:scale-[1.01] transition-all"
            >
              <Mic2 className="w-4 h-4" /> Uygulamayı indir ve yayın başlat
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
