import { useState, useRef, useCallback } from "react";
import { Layout } from "@/components/ui/Layout";
import { useGetVideos, useVoteVideo, useGetVideoComments, useAddComment } from "@workspace/api-client-react";
import { Heart, Star, MessageCircle, Share2, Music, X, Send, Mic2, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_VIDEOS = [
  {
    id: "sample-video-1",
    title: "Performans 1",
    username: "zeynep_ses",
    userId: "sample-user-1",
    userAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
    voteCount: 6400,
    viewCount: 22100,
    commentCount: 18,
    isKaraoke: true,
  },
  {
    id: "sample-video-2",
    title: "Performans 2",
    username: "cem_ritim",
    userId: "sample-user-2",
    userAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
    voteCount: 7100,
    viewCount: 26400,
    commentCount: 23,
    isKaraoke: false,
  },
  {
    id: "sample-video-3",
    title: "Performans 3",
    username: "melis_karaoke",
    userId: "sample-user-3",
    userAvatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    voteCount: 5200,
    viewCount: 19800,
    commentCount: 9,
    isKaraoke: true,
  },
];

function VideoPlayer({
  video,
  onNext,
  onPrev,
  isPromo,
}: {
  video: any;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  isPromo: boolean;
}) {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [localVotes, setLocalVotes] = useState(video.voteCount ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

  const voteMutation = useVoteVideo({
    mutation: {
      onSuccess: () => {
        setIsLiked(true);
        setLocalVotes((value: number) => value + 1);
        toast({ title: "⭐ Oyunuz kaydedildi!", className: "bg-primary text-white border-none" });
      },
    },
  });

  const commentMutation = useAddComment({
    mutation: {
      onSuccess: () => {
        toast({ title: "Yorum gönderildi!", className: "bg-card border border-white/10" });
        setComment("");
      },
    },
  });

  const { data: commentsData } = useGetVideoComments(video.id);

  const handleVote = () => {
    if (isPromo) {
      toast({ title: "Tanıtım içeriği", description: "Bu örnek kart tanıtım amaçlıdır.", className: "bg-card border border-white/10" });
      return;
    }
    if (isLiked || voteMutation.isPending) return;
    voteMutation.mutate({ videoId: video.id, data: { voteType: "star" } });
  };

  const handleComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    if (isPromo) {
      toast({ title: "Tanıtım içeriği", description: "Bu örnek kartta yorum akışı tanıtım amaçlıdır.", className: "bg-card border border-white/10" });
      return;
    }
    commentMutation.mutate({ videoId: video.id, data: { content: comment } });
  };

  const imgSrc = video.thumbnailUrl || `https://picsum.photos/seed/feed${video.id}/800/1400`;

  return (
    <div className="w-full h-[100dvh] snap-start relative bg-black flex-shrink-0">
      <img src={imgSrc} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/85 pointer-events-none" />

      <button onClick={onPrev} className="absolute top-20 left-1/2 -translate-x-1/2 text-white/40 hover:text-white transition-colors z-30 p-3">
        <ChevronUp className="w-6 h-6" />
      </button>
      <button onClick={onNext} className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/40 hover:text-white transition-colors z-30 p-3">
        <ChevronDown className="w-6 h-6" />
      </button>

      <div className="absolute right-4 bottom-28 md:bottom-20 flex flex-col items-center gap-5 z-20">
        <div className="relative">
          <img
            src={video.userAvatarUrl || `https://picsum.photos/seed/avatar${video.userId}/200`}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary"
            alt={video.username}
          />
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-md">+</span>
        </div>

        <button onClick={handleVote} disabled={isLiked} className="flex flex-col items-center gap-1 group">
          <div className={cn("p-3 rounded-full bg-black/40 backdrop-blur transition-all duration-300", isLiked ? "text-yellow-400" : "text-white group-hover:text-yellow-400")}>
            <Star className={cn("w-7 h-7", isLiked && "fill-yellow-400")} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{formatNumber(localVotes)}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="p-3 rounded-full bg-black/40 backdrop-blur text-white group-hover:text-pink-400 transition-colors">
            <Heart className="w-7 h-7" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{formatNumber(video.viewCount ?? 0)}</span>
        </button>

        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group">
          <div className="p-3 rounded-full bg-black/40 backdrop-blur text-white group-hover:text-cyan-400 transition-colors">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{formatNumber(video.commentCount ?? 0)}</span>
        </button>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            toast({ title: "Link kopyalandı!" });
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 rounded-full bg-black/40 backdrop-blur text-white group-hover:text-white/70 transition-colors">
            <Share2 className="w-7 h-7" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">Paylaş</span>
        </button>

        <div className="w-11 h-11 rounded-full border-2 border-white/20 overflow-hidden animate-[spin_6s_linear_infinite] mt-2">
          <img src={imgSrc} className="w-full h-full object-cover" alt="" />
        </div>
      </div>

      <div className="absolute left-4 bottom-24 md:bottom-16 w-[68%] z-20 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-white text-lg drop-shadow-md">@{video.username}</span>
          {video.isKaraoke && (
            <span className="text-[10px] font-bold bg-primary/80 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <Mic2 className="w-2.5 h-2.5" /> Karaoke
            </span>
          )}
          {isPromo && (
            <span className="text-[10px] font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Tanıtım
            </span>
          )}
        </div>
        <p className="text-white/90 text-sm drop-shadow-md line-clamp-2">{video.title}</p>
        <div className="flex items-center gap-2 text-white/80 text-xs bg-black/30 w-fit px-3 py-1.5 rounded-full backdrop-blur border border-white/10">
          <Music className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap overflow-hidden max-w-[160px] text-ellipsis">Orijinal Ses — {video.username}</span>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 h-[60%] bg-card/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 z-40 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-bold text-base">{video.commentCount ?? 0} Yorum</h3>
              <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {(commentsData?.comments ?? []).length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  {isPromo ? "Bu kart için örnek yorum alanı gösteriliyor." : "Henüz yorum yok. İlk yorumu sen yap!"}
                </p>
              ) : (
                (commentsData?.comments ?? []).map((commentItem: any) => (
                  <div key={commentItem.id} className="flex gap-3">
                    <img src={`https://picsum.photos/seed/cmt${commentItem.userId}/80`} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-primary">{commentItem.username} </span>
                      <span className="text-sm text-white">{commentItem.content}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleComment} className="p-4 border-t border-white/10 flex gap-3">
              <input
                type="text"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Yorum yaz..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
              <button type="submit" disabled={commentMutation.isPending} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform disabled:opacity-60">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Feed() {
  const { data, isLoading } = useGetVideos({ limit: 12 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const apiVideos = data?.videos ?? [];
  const videos = apiVideos.length > 0 ? apiVideos : SAMPLE_VIDEOS;
  const isPromoFeed = apiVideos.length === 0;

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(videos.length - 1, index));
    setCurrentIndex(clamped);
    containerRef.current?.children[clamped]?.scrollIntoView({ behavior: "smooth" });
  }, [videos.length]);

  if (isLoading && apiVideos.length === 0) {
    return (
      <Layout hideBottomNav>
        <div className="h-[100dvh] w-full bg-black flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideBottomNav>
      <div className="bg-black h-[100dvh] w-full overflow-hidden relative">
        {isPromoFeed && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-200 backdrop-blur">
            <Sparkles className="inline w-3.5 h-3.5 mr-2" />
            Keşfet akışı şu anda tanıtım amaçlı örnek içeriklerle gösteriliyor.
          </div>
        )}

        <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
          {videos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Star className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Henüz video yok.</p>
            </div>
          ) : (
            videos.map((video, index) => (
              <VideoPlayer
                key={video.id}
                video={video}
                isActive={index === currentIndex}
                onNext={() => goTo(index + 1)}
                onPrev={() => goTo(index - 1)}
                isPromo={isPromoFeed}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
