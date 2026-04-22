import { Layout } from "@/components/ui/Layout";
import { useGetKaraokeTracks } from "@workspace/api-client-react";
import { Mic2, Music, Play, Sparkles, Trophy, Download } from "lucide-react";
import { motion } from "framer-motion";
import { PLAY_STORE_URL } from "@/lib/constants";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function Karaoke() {
  const { data, isLoading } = useGetKaraokeTracks({ limit: 18 });
  const tracks = data?.tracks ?? [];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-16">
        <div
          className="relative overflow-hidden rounded-b-3xl p-8 md:p-12 mb-8"
          style={{ background: "linear-gradient(135deg, #1a0040 0%, #2d0060 60%, #0a001a 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 70% 30%, rgba(192,132,252,0.5) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Mic2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black text-primary tracking-widest uppercase">FenomenStar</p>
                  <h1 className="text-3xl md:text-5xl font-display font-black leading-tight">
                    Karaoke Sahnesi
                  </h1>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Karaoke katalogu webde acik. Gercek ses kaydi, performans gonderimi ve karaoke recording deneyimi mobil uygulamada aktif.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-accent font-bold text-white shadow-[0_0_25px_rgba(255,0,255,0.4)] hover:scale-105 transition-all"
                >
                  <Download className="w-4 h-4" /> Uygulamayı İndir
                </a>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all"
                >
                  <Trophy className="w-4 h-4" /> Yarışmaya Katılmak İçin İndir
                </a>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center gap-3">
              <div className="text-[80px] leading-none select-none">🎤</div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Music className="w-3 h-3 text-primary" /> Katalog açık
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-7">
            {[
              {
                icon: <Sparkles className="w-4 h-4 text-orange-400" />,
                label: "Mobilde Recording",
                sub: "Gercek karaoke kaydi uygulamada",
              },
              {
                icon: <Trophy className="w-4 h-4 text-yellow-400" />,
                label: "Yarışma Gönderimi",
                sub: "Karaoke performansi uygulamada gonderilir",
              },
              {
                icon: <Music className="w-4 h-4 text-green-400" />,
                label: "Katalog Webde Açık",
                sub: "Parçaları ve sanatçıları burada keşfet",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="flex flex-col items-start gap-1.5 bg-white/3 border rounded-2xl p-3 text-left border-white/10"
              >
                <div className="flex items-center gap-1.5">
                  {card.icon}
                  <span className="font-bold text-sm">{card.label}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{card.sub}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
              ))
            ) : tracks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Parça bulunamadı.</p>
              </div>
            ) : (
              tracks.map((track: any) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ x: 3 }}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-card border border-white/5 hover:border-primary/30 hover:bg-white/3 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                      <img
                        src={track.coverUrl || `https://picsum.photos/seed/track-${track.id}/150`}
                        className="w-full h-full object-cover"
                        alt={track.title}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors line-clamp-1">
                        {track.title}
                      </h3>
                      <p className="text-muted-foreground text-xs">{track.artist}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{track.genre || "Pop"}</span>
                        <span>{formatDuration(track.duration || 180)}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-all text-sm border border-primary/30 hover:border-transparent"
                  >
                    <Play className="w-3.5 h-3.5" /> Uygulamada Söyle
                  </a>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
