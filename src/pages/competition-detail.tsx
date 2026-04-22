import { Layout } from "@/components/ui/Layout";
import { useRoute } from "wouter";
import { useGetCompetitionById, useJoinCompetition } from "@workspace/api-client-react";
import { Trophy, Calendar, Users, Target, Info, UploadCloud, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CompetitionDetail() {
  const route = useRoute("/competitions/:id");
  const params = route[1] as { id?: string } | null;
  const id = Number(params ? params.id : 0);
  const { data: comp, isLoading } = useGetCompetitionById(id, { query: { enabled: !!id } });
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);

  const joinMutation = useJoinCompetition({
    mutation: {
      onSuccess: () => {
        setIsJoining(false);
        toast({ title: "Başarıyla katıldınız!", description: "Videonuz incelenmek üzere gönderildi." });
      },
      onError: () => {
        setIsJoining(false);
        toast({ title: "Hata", description: "Bir sorun oluştu.", variant: "destructive" });
      }
    }
  });

  const handleJoin = () => {
    setIsJoining(true);
    // Simulating delay for UI
    setTimeout(() => {
      joinMutation.mutate({ competitionId: id, data: { videoId: 1 } });
    }, 1000);
  };

  if (isLoading || !comp) {
    return (
      <Layout>
        <div className="p-8 animate-pulse space-y-8">
          <div className="h-64 bg-white/5 rounded-3xl" />
          <div className="h-8 bg-white/5 w-1/3 rounded-lg" />
          <div className="h-32 bg-white/5 rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Header Cover */}
        <div className="relative h-64 md:h-96 w-full">
          <img src={comp.thumbnailUrl || `https://picsum.photos/seed/cd${comp.id}/1200/500`} alt={comp.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-bold uppercase tracking-wide">
                {comp.category}
              </span>
              <span className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded-full text-sm font-medium">
                {comp.status === 'active' ? '🔴 Aktif' : 'Yaklaşan'}
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-display font-black text-white mb-2 leading-tight">
              {comp.title}
            </h1>
            {comp.brandName && (
              <p className="text-lg text-gray-300 flex items-center gap-2">
                Sponsor: <span className="font-bold text-white">{comp.brandName}</span>
              </p>
            )}
          </div>
        </div>

        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" /> Yarışma Detayları
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5">
                {comp.description || "Bu yarışma Türkiye'nin yeni yeteneklerini keşfetmek için düzenleniyor. Hemen katıl, yeteneğini milyonlara göster ve büyük ödülün sahibi ol!"}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Play className="w-6 h-6 text-secondary" /> Örnek Videolar
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="aspect-[9/16] bg-gray-800 rounded-xl overflow-hidden relative group cursor-pointer">
                    <img src={`https://picsum.photos/seed/cdv${id}${i}/300/500`} className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white opacity-80 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-card p-6 rounded-3xl border border-white/10 shadow-xl shadow-black/50 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Özet Bilgiler</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Büyük Ödül</p>
                    <p className="font-bold text-white">{comp.prizeDescription}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Son Katılım</p>
                    <p className="font-bold text-white">{new Date(comp.endDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Katılımcı</p>
                    <p className="font-bold text-white">{comp.participantCount} Kişi</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleJoin}
                disabled={isJoining || comp.status !== 'active'}
                className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Bekleniyor...</>
                ) : comp.status !== 'active' ? (
                  "Yarışma Kapalı"
                ) : (
                  <><UploadCloud className="w-5 h-5" /> Hemen Katıl</>
                )}
              </button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                Katılmak için bir videonuzun olması gerekir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
