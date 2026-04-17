import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/ui/Layout";
import { useSearch, SearchType } from "@workspace/api-client-react";
import {
  Search as SearchIcon, User, Play, Trophy, Mic2,
  Sparkles, Brain, Zap, TrendingUp, X, ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TRENDING = ["Tarkan", "Dans", "Karaoke", "Ses Yarışması", "THY Star", "Türkü", "Hip-Hop", "Akustik"];

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "";

async function semanticSearch(q: string, type: string) {
  const res = await fetch(`${BASE_URL}/api/ai/semantic-search-enhanced?q=${encodeURIComponent(q)}&type=${type}`);
  if (!res.ok) throw new Error("AI arama başarısız");
  return res.json();
}

export default function SearchPage() {
  const [query, setQuery]               = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [type, setType]                 = useState<SearchType>("all");
  const [aiMode, setAiMode]             = useState(true);
  const [aiData, setAiData]             = useState<any>(null);
  const [aiLoading, setAiLoading]       = useState(false);
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const aiTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const h = setTimeout(() => setDebouncedQuery(query), 450);
    return () => clearTimeout(h);
  }, [query]);

  /* Normal arama (fallback) */
  const { data: normalData, isLoading: normalLoading } = useSearch(
    { q: debouncedQuery || "a", type },
    { query: { enabled: !aiMode && debouncedQuery.length >= 2 } }
  );

  /* AI Semantic Search */
  useEffect(() => {
    if (!aiMode || debouncedQuery.length < 2) {
      setAiData(null); setExpandedTerms([]); setAiSuggestions([]);
      return;
    }
    clearTimeout(aiTimer.current);
    aiTimer.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const result = await semanticSearch(debouncedQuery, type);
        setAiData(result);
        setExpandedTerms(result.expandedTerms || []);
        setAiSuggestions(result.aiSuggestions || []);
      } catch {
        setAiData(null);
      } finally {
        setAiLoading(false);
      }
    }, 200);
  }, [debouncedQuery, type, aiMode]);

  const data    = aiMode ? aiData    : normalData;
  const isLoading = aiMode ? aiLoading : normalLoading;

  const hasResults =
    (data?.users?.length ?? 0) > 0 ||
    (data?.videos?.length ?? 0) > 0 ||
    (data?.competitions?.length ?? 0) > 0;

  const tabs = [
    { id: "all",          label: "Tümü",        icon: <Sparkles className="w-4 h-4" /> },
    { id: "users",        label: "Kullanıcılar", icon: <User className="w-4 h-4" />     },
    { id: "videos",       label: "Videolar",     icon: <Play className="w-4 h-4" />     },
    { id: "competitions", label: "Yarışmalar",   icon: <Trophy className="w-4 h-4" />   },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 md:p-8">

        {/* Sayfa başlığı */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-black">Keşfet & Ara</h1>
            <p className="text-muted-foreground text-sm mt-0.5">İstediğin yeteneği, yarışmayı veya videoyu bul</p>
          </div>
          {/* AI Toggle */}
          <button
            onClick={() => setAiMode(m => !m)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-bold transition-all",
              aiMode
                ? "bg-gradient-to-r from-violet-600 to-purple-500 border-transparent text-white shadow-lg shadow-purple-500/30"
                : "bg-white/5 border-white/10 text-muted-foreground hover:border-primary/40"
            )}
          >
            <Brain className="w-4 h-4" />
            {aiMode ? "AI Aktif" : "AI Kapalı"}
          </button>
        </div>

        {/* Arama Kutusu */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={aiMode ? "AI ile ara — 'dans yarışması', 'karaoke ses'..." : "Kullanıcı, video veya yarışma ara..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-card border-2 border-white/10 rounded-2xl py-5 pl-14 pr-12 text-lg text-white focus:outline-none focus:border-primary transition-colors shadow-lg placeholder:text-muted-foreground"
          />
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* AI mod — genişletilmiş terimler */}
        <AnimatePresence>
          {aiMode && expandedTerms.length > 0 && query && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 flex-wrap p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <span className="text-xs font-bold text-violet-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> AI Genişletme:
                </span>
                {expandedTerms.map((t, i) => (
                  <button key={i} onClick={() => setQuery(t)}
                    className="text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2.5 py-1 rounded-full hover:bg-violet-500/30 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trend aramaları (query yokken) */}
        {!query && (
          <div className="mb-8">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Trend Aramalar
            </p>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(t => (
                <button key={t} onClick={() => setQuery(t)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-primary/20 hover:border-primary/40 hover:text-white transition-all">
                  🔥 {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Önerileri */}
        <AnimatePresence>
          {aiMode && aiSuggestions.length > 0 && query && !isLoading && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" /> AI Önerileri
              </p>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((s, i) => (
                  <button key={i} onClick={() => setQuery(s)}
                    className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all flex items-center gap-2">
                    <ChevronRight className="w-3 h-3" /> {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtre sekmeleri */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setType(tab.id as SearchType)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all text-sm",
                type === tab.id
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(255,0,255,0.3)]"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              )}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Sonuçlar */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : !hasResults && debouncedQuery ? (
          <div className="text-center py-20 text-muted-foreground">
            <SearchIcon className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">"{debouncedQuery}" için sonuç bulunamadı.</p>
            {aiMode && (
              <p className="text-sm mt-2 text-purple-400">AI genişletilmiş arama da denendi. Farklı kelimeler deneyin.</p>
            )}
          </div>
        ) : (
          <div className="space-y-12">

            {/* AI etiket */}
            {aiMode && hasResults && data?.isSemanticSearch && (
              <div className="flex items-center gap-2 text-xs text-violet-400">
                <Brain className="w-3.5 h-3.5" />
                <span>Semantik arama aktif — alakalılık puanına göre sıralandı</span>
              </div>
            )}

            {/* Kullanıcılar */}
            {(type === "all" || type === "users") && (data?.users?.length ?? 0) > 0 && (
              <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs">
                  <User className="w-4 h-4 text-primary" /> Kullanıcılar
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data!.users!.map((user: any, i: number) => (
                    <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link href={`/profile/${user.id}`} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all group">
                        <img
                          src={user.avatarUrl || `https://picsum.photos/seed/u${user.id}/200`}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-primary/40 transition-colors"
                          alt={user.username}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base group-hover:text-primary transition-colors">@{user.username}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.category || "Yetenekli"}</p>
                        </div>
                        {aiMode && user._score > 0 && (
                          <span className="text-[10px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full font-bold">
                            %{Math.min(99, Math.round(user._score * 10))}
                          </span>
                        )}
                        <span className="text-xs bg-white/5 px-3 py-1 rounded-full text-muted-foreground">{user.city || "TR"}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Videolar */}
            {(type === "all" || type === "videos") && (data?.videos?.length ?? 0) > 0 && (
              <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs">
                  <Play className="w-4 h-4 text-secondary" /> Videolar
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data!.videos!.map((video: any, i: number) => (
                    <motion.div key={video.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                      <Link href={`/feed?videoId=${video.id}`} className="relative aspect-[3/4] rounded-xl overflow-hidden group block">
                        <img
                          src={video.thumbnailUrl || `https://picsum.photos/seed/vs${video.id}/300/400`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={video.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                        {aiMode && video._score > 3 && (
                          <div className="absolute top-2 right-2 bg-violet-500/80 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" /> EN İYİ
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-xs font-bold text-white line-clamp-2">{video.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1">@{video.username}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Yarışmalar */}
            {(type === "all" || type === "competitions") && (data?.competitions?.length ?? 0) > 0 && (
              <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs">
                  <Trophy className="w-4 h-4 text-yellow-400" /> Yarışmalar
                </h3>
                <div className="space-y-3">
                  {data!.competitions!.map((comp: any, i: number) => (
                    <motion.div key={comp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link href={`/competitions/${comp.id}`} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-white/5 hover:border-yellow-400/30 hover:bg-white/5 transition-all group">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-900 to-purple-900">
                          <img src={comp.thumbnailUrl || `https://picsum.photos/seed/cs${comp.id}/200`} className="w-full h-full object-cover" alt={comp.title} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold group-hover:text-yellow-400 transition-colors line-clamp-1">{comp.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{comp.category} · {comp.participantCount ?? 0} katılımcı</p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-full shrink-0",
                          comp.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"
                        )}>
                          {comp.status === "active" ? "AKTİF" : "KAPALI"}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </Layout>
  );
}
