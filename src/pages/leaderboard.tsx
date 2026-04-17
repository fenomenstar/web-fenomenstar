import { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { useGetLeaderboard, GetLeaderboardPeriod } from "@workspace/api-client-react";
import { Trophy, Medal, Star, Flame } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function Leaderboard() {
  const [period, setPeriod] = useState<GetLeaderboardPeriod>("weekly");
  const { data, isLoading } = useGetLeaderboard({ period });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 inline-block mb-4 filter drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">
            Liderlik Tablosu
          </h1>
          <p className="text-gray-400">En çok oy alan yetenekler zirvede!</p>
          
          <div className="flex justify-center gap-2 mt-6">
            {(['weekly', 'monthly', 'alltime'] as GetLeaderboardPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                  period === p ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {p === 'weekly' ? 'Bu Hafta' : p === 'monthly' ? 'Bu Ay' : 'Tüm Zamanlar'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4 relative">
            {/* Top 3 Podium (Desktop optimized) */}
            <div className="hidden md:flex justify-center items-end gap-6 mb-12 mt-10">
              {data?.entries.slice(0, 3).map((entry, i) => {
                // Reorder for podium: 2, 1, 3
                const order = i === 0 ? 1 : i === 1 ? 0 : 2;
                const actualEntry = data.entries[order];
                if (!actualEntry) return null;
                
                const height = order === 0 ? 'h-48' : order === 1 ? 'h-40' : 'h-32';
                const color = order === 0 ? 'from-yellow-400 to-yellow-600' : order === 1 ? 'from-gray-300 to-gray-500' : 'from-amber-600 to-orange-800';

                return (
                  <div key={actualEntry.userId} className="flex flex-col items-center">
                    <div className="relative mb-4">
                      {order === 0 && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />}
                      <img src={actualEntry.avatarUrl || `${import.meta.env.BASE_URL}images/default-avatar.png`} className={`rounded-full object-cover border-4 border-background ${order === 0 ? 'w-24 h-24' : 'w-20 h-20'}`} />
                    </div>
                    <div className={`w-32 ${height} bg-gradient-to-b ${color} rounded-t-2xl flex flex-col items-center pt-4 shadow-lg`}>
                      <span className="text-3xl font-black text-black/50">{actualEntry.rank}</span>
                      <p className="font-bold text-center mt-2 text-white drop-shadow-md px-2 line-clamp-1">@{actualEntry.username}</p>
                      <p className="text-xs font-bold bg-black/30 px-2 py-1 rounded mt-2">{formatNumber(actualEntry.score)} Puan</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* List View */}
            <div className="space-y-3">
              {data?.entries.map((entry) => (
                <div key={entry.userId} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  entry.rank === 1 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50' : 
                  entry.rank === 2 ? 'bg-gradient-to-r from-gray-400/20 to-transparent border-gray-400/50' : 
                  entry.rank === 3 ? 'bg-gradient-to-r from-orange-500/20 to-transparent border-orange-500/50' : 
                  'bg-card border-white/5 hover:bg-white/5'
                }`}>
                  <div className="w-8 font-black text-xl text-center text-gray-400">
                    {entry.rank}
                  </div>
                  
                  <img src={entry.avatarUrl || `${import.meta.env.BASE_URL}images/default-avatar.png`} className="w-12 h-12 rounded-full object-cover" />
                  
                  <div className="flex-1">
                    <p className="font-bold text-lg">@{entry.username}</p>
                    <p className="text-sm text-muted-foreground">{entry.category || 'Yetenek'}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-xl text-primary flex items-center gap-1 justify-end">
                      {formatNumber(entry.score)} <Flame className="w-5 h-5" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Helper icon component
function Crown(props: any) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>;
}
