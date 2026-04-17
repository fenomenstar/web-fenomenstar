import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

export type SearchType = "all" | "users" | "videos" | "competitions";
export type GetLeaderboardPeriod = "weekly" | "monthly" | "alltime";

type QueryConfig<T> = {
  query?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;
};

type MutationConfig<TData, TVariables> = {
  mutation?: UseMutationOptions<TData, Error, TVariables>;
};

type LoginPayload = { data: { email: string; password: string } };
type RegisterPayload = {
  data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
    city?: string;
    category?: string;
  };
};
type VotePayload = { videoId: number; data: { voteType: string } };
type CommentPayload = { videoId: number; data: { content: string } };
type JoinPayload = { competitionId: number; data: { videoId: number } };

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

let authTokenGetter: (() => string | null) | undefined;

export function setAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter;
}

const mockUsers = [
  {
    id: 1,
    email: "zeynep@example.com",
    username: "zeynep_ses",
    displayName: "Zeynep Kaya",
    role: "talent",
    bio: "Sahne ve karaoke performanslarıyla öne çıkan genç yetenek.",
    avatarUrl: "https://picsum.photos/seed/user1/300",
    city: "Istanbul",
    category: "Ses",
    totalVotes: 12500,
    totalViews: 84000,
    badgeCount: 3,
    isVerified: true,
    createdAt: "2026-03-01T12:00:00.000Z",
  },
  {
    id: 2,
    email: "cem@example.com",
    username: "cem_ritim",
    displayName: "Cem Aydin",
    role: "talent",
    bio: "Dans ve ritim içerikleri üretiyor.",
    avatarUrl: "https://picsum.photos/seed/user2/300",
    city: "Ankara",
    category: "Dans",
    totalVotes: 9800,
    totalViews: 62000,
    badgeCount: 2,
    isVerified: true,
    createdAt: "2026-03-05T12:00:00.000Z",
  },
];

const mockCompetitions = [
  {
    id: 1,
    title: "THY Genç Yetenek Yarışması",
    description: "Sesini ve sahne enerjini göster, büyük ödülü kazan.",
    category: "Ses",
    status: "active",
    startDate: "2026-04-01T12:00:00.000Z",
    endDate: "2026-05-20T12:00:00.000Z",
    prizeDescription: "50.000 TL + reklam çekimi",
    brandId: 101,
    brandName: "THY",
    brandLogoUrl: "",
    participantCount: 324,
    thumbnailUrl: "https://picsum.photos/seed/comp1/900/500",
    createdAt: "2026-03-25T12:00:00.000Z",
  },
  {
    id: 2,
    title: "PepsiStar Karaoke Gecesi",
    description: "Karaoke performansını yükle, jüriyi etkile.",
    category: "Karaoke",
    status: "active",
    startDate: "2026-04-05T12:00:00.000Z",
    endDate: "2026-05-10T12:00:00.000Z",
    prizeDescription: "25.000 TL + stüdyo günü",
    brandId: 102,
    brandName: "Pepsi",
    brandLogoUrl: "",
    participantCount: 188,
    thumbnailUrl: "https://picsum.photos/seed/comp2/900/500",
    createdAt: "2026-03-28T12:00:00.000Z",
  },
  {
    id: 3,
    title: "FenomenStar Dans Sahnesi",
    description: "Dans kategorisinde haftanın yıldızı ol.",
    category: "Dans",
    status: "upcoming",
    startDate: "2026-05-12T12:00:00.000Z",
    endDate: "2026-06-10T12:00:00.000Z",
    prizeDescription: "Sponsorlu içerik paketi",
    brandId: 0,
    brandName: "",
    brandLogoUrl: "",
    participantCount: 76,
    thumbnailUrl: "https://picsum.photos/seed/comp3/900/500",
    createdAt: "2026-04-02T12:00:00.000Z",
  },
];

const mockVideos = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: `Performans ${index + 1}`,
  description: "FenomenStar sahnesinden öne çıkan performans.",
  videoUrl: "",
  thumbnailUrl: `https://picsum.photos/seed/video${index + 1}/500/900`,
  category: index % 3 === 0 ? "Karaoke" : index % 3 === 1 ? "Ses" : "Dans",
  isKaraoke: index % 3 === 0,
  userId: index % 2 === 0 ? 1 : 2,
  username: index % 2 === 0 ? "zeynep_ses" : "cem_ritim",
  userAvatarUrl: `https://picsum.photos/seed/avatar${index + 1}/200`,
  competitionId: (index % 2) + 1,
  voteCount: 1200 + index * 170,
  viewCount: 6400 + index * 510,
  commentCount: 10 + index,
  duration: 45,
  createdAt: "2026-04-01T12:00:00.000Z",
}));

const mockComments = [
  {
    id: 1,
    content: "Harika performans.",
    userId: 10,
    username: "ayse_yorum",
    userAvatarUrl: "",
    createdAt: "2026-04-10T12:00:00.000Z",
  },
  {
    id: 2,
    content: "Finale kalırsın.",
    userId: 11,
    username: "onur_live",
    userAvatarUrl: "",
    createdAt: "2026-04-11T12:00:00.000Z",
  },
];

const mockBrands = [
  {
    id: 101,
    name: "THY",
    logoUrl: "",
    description: "Sponsor marka",
    website: "https://www.turkishairlines.com",
    isVerified: true,
    activeCompetitions: 4,
    totalParticipants: 1200,
    createdAt: "2026-03-01T12:00:00.000Z",
  },
  {
    id: 102,
    name: "Pepsi",
    logoUrl: "",
    description: "Sponsor marka",
    website: "https://www.pepsi.com",
    isVerified: true,
    activeCompetitions: 2,
    totalParticipants: 640,
    createdAt: "2026-03-04T12:00:00.000Z",
  },
];

const mockLeaderboardEntries = [
  {
    rank: 1,
    userId: 1,
    username: "zeynep_ses",
    displayName: "Zeynep Kaya",
    avatarUrl: "https://picsum.photos/seed/lb1/200",
    category: "Ses",
    score: 18400,
    voteCount: 12500,
    videoCount: 14,
  },
  {
    rank: 2,
    userId: 2,
    username: "cem_ritim",
    displayName: "Cem Aydin",
    avatarUrl: "https://picsum.photos/seed/lb2/200",
    category: "Dans",
    score: 15200,
    voteCount: 9800,
    videoCount: 11,
  },
  {
    rank: 3,
    userId: 3,
    username: "melis_karaoke",
    displayName: "Melis Demir",
    avatarUrl: "https://picsum.photos/seed/lb3/200",
    category: "Karaoke",
    score: 14100,
    voteCount: 9100,
    videoCount: 9,
  },
];

const mockTracks = [
  {
    id: 1,
    title: "Yalan",
    artist: "Sezen Aksu",
    genre: "Pop",
    duration: 220,
    audioUrl: "",
    lyricsUrl: "",
    coverUrl: "https://picsum.photos/seed/track1/300",
    bpm: 98,
    createdAt: "2026-04-01T12:00:00.000Z",
  },
  {
    id: 2,
    title: "Bir Derdim Var",
    artist: "Mor ve Otesi",
    genre: "Rock",
    duration: 240,
    audioUrl: "",
    lyricsUrl: "",
    coverUrl: "https://picsum.photos/seed/track2/300",
    bpm: 110,
    createdAt: "2026-04-01T12:00:00.000Z",
  },
  {
    id: 3,
    title: "Benimle Oynar Misin",
    artist: "Tarkan",
    genre: "Pop",
    duration: 210,
    audioUrl: "",
    lyricsUrl: "",
    coverUrl: "https://picsum.photos/seed/track3/300",
    bpm: 102,
    createdAt: "2026-04-01T12:00:00.000Z",
  },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API base URL missing");
  }

  const token = authTokenGetter?.();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function withFallback<T>(remote: () => Promise<T>, fallback: () => T | Promise<T>) {
  return async () => {
    try {
      return await remote();
    } catch {
      return await fallback();
    }
  };
}

export function useLogin(config?: MutationConfig<any, LoginPayload>) {
  return useMutation({
    mutationFn: async ({ data }: LoginPayload) => {
      try {
        return await request("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch {
        return {
          token: "demo-token",
          user: mockUsers[0],
        };
      }
    },
    ...(config?.mutation ?? {}),
  });
}

export function useRegister(config?: MutationConfig<any, RegisterPayload>) {
  return useMutation({
    mutationFn: async ({ data }: RegisterPayload) => {
      try {
        return await request("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch {
        return {
          token: "demo-token",
          user: {
            ...mockUsers[0],
            username: data.username,
            email: data.email,
            displayName: data.displayName || data.username,
            city: data.city || "Istanbul",
            category: data.category || "Ses",
          },
        };
      }
    },
    ...(config?.mutation ?? {}),
  });
}

export function useGetCompetitions(
  params?: { category?: string; status?: string; page?: number; limit?: number },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["competitions", params],
    queryFn: withFallback(
      () => request(`/api/competitions`),
      () => {
        let competitions = [...mockCompetitions];
        if (params?.status && params.status !== "all") {
          competitions = competitions.filter((item) => item.status === params.status);
        }
        if (params?.category && params.category !== "all") {
          competitions = competitions.filter((item) => item.category === params.category);
        }
        if (params?.limit) {
          competitions = competitions.slice(0, params.limit);
        }
        return {
          competitions,
          total: competitions.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? competitions.length,
        };
      },
    ),
    ...(config?.query ?? {}),
  });
}

export function useGetCompetitionById(id: number, config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["competition", id],
    queryFn: withFallback(
      () => request(`/api/competitions/${id}`),
      () => mockCompetitions.find((item) => item.id === id) ?? mockCompetitions[0],
    ),
    enabled: !!id && (config?.query?.enabled ?? true),
    ...(config?.query ?? {}),
  });
}

export function useJoinCompetition(config?: MutationConfig<any, JoinPayload>) {
  return useMutation({
    mutationFn: async ({ competitionId, data }: JoinPayload) => {
      try {
        return await request(`/api/competitions/${competitionId}/join`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch {
        return { success: true, competitionId, ...data };
      }
    },
    ...(config?.mutation ?? {}),
  });
}

export function useGetVideos(
  params?: { category?: string; competitionId?: number; page?: number; limit?: number },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["videos", params],
    queryFn: withFallback(
      () => request(`/api/videos`),
      () => {
        let videos = [...mockVideos];
        if (params?.category) {
          videos = videos.filter((item) => item.category === params.category);
        }
        if (params?.competitionId) {
          videos = videos.filter((item) => item.competitionId === params.competitionId);
        }
        if (params?.limit) {
          videos = videos.slice(0, params.limit);
        }
        return {
          videos,
          total: videos.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? videos.length,
        };
      },
    ),
    ...(config?.query ?? {}),
  });
}

export function useVoteVideo(config?: MutationConfig<any, VotePayload>) {
  return useMutation({
    mutationFn: async ({ videoId, data }: VotePayload) => {
      try {
        return await request(`/api/videos/${videoId}/vote`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch {
        return { success: true, newVoteCount: 1, message: "Mock vote recorded" };
      }
    },
    ...(config?.mutation ?? {}),
  });
}

export function useGetVideoComments(videoId: number, config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["comments", videoId],
    queryFn: withFallback(
      () => request(`/api/videos/${videoId}/comments`),
      () => ({ comments: mockComments }),
    ),
    enabled: !!videoId && (config?.query?.enabled ?? true),
    ...(config?.query ?? {}),
  });
}

export function useAddComment(config?: MutationConfig<any, CommentPayload>) {
  return useMutation({
    mutationFn: async ({ videoId, data }: CommentPayload) => {
      try {
        return await request(`/api/videos/${videoId}/comments`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch {
        return {
          id: Date.now(),
          content: data.content,
          userId: 1,
          username: "zeynep_ses",
          createdAt: new Date().toISOString(),
        };
      }
    },
    ...(config?.mutation ?? {}),
  });
}

export function useGetBrands(_params?: Record<string, never>, config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["brands"],
    queryFn: withFallback(
      () => request(`/api/brands`),
      () => ({ brands: mockBrands }),
    ),
    ...(config?.query ?? {}),
  });
}

export function useGetLeaderboard(
  params?: { period?: GetLeaderboardPeriod; category?: string },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["leaderboard", params],
    queryFn: withFallback(
      () => request(`/api/leaderboard`),
      () => ({
        entries: mockLeaderboardEntries,
        period: params?.period ?? "weekly",
        category: params?.category ?? "all",
        updatedAt: new Date().toISOString(),
      }),
    ),
    ...(config?.query ?? {}),
  });
}

export function useGetKaraokeTracks(
  params?: { q?: string; genre?: string; page?: number; limit?: number },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["karaoke-tracks", params],
    queryFn: withFallback(
      () => request(`/api/karaoke/tracks`),
      () => {
        let tracks = [...mockTracks];
        if (params?.q) {
          const lowered = params.q.toLowerCase();
          tracks = tracks.filter(
            (item) =>
              item.title.toLowerCase().includes(lowered) ||
              item.artist.toLowerCase().includes(lowered),
          );
        }
        if (params?.genre && params.genre !== "all") {
          tracks = tracks.filter((item) => item.genre.toLowerCase() === params.genre?.toLowerCase());
        }
        if (params?.limit) {
          tracks = tracks.slice(0, params.limit);
        }
        return {
          tracks,
          total: tracks.length,
          page: params?.page ?? 1,
        };
      },
    ),
    ...(config?.query ?? {}),
  });
}

export function useSearch(
  params: { q: string; type?: SearchType; page?: number; limit?: number },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["search", params],
    queryFn: withFallback(
      () => request(`/api/search?q=${encodeURIComponent(params.q)}&type=${params.type ?? "all"}`),
      () => {
        const q = params.q.toLowerCase();
        const users = mockUsers.filter(
          (item) =>
            item.username.toLowerCase().includes(q) ||
            item.displayName.toLowerCase().includes(q),
        );
        const videos = mockVideos.filter((item) => item.title.toLowerCase().includes(q));
        const competitions = mockCompetitions.filter((item) => item.title.toLowerCase().includes(q));
        return {
          users: params.type === "all" || params.type === "users" ? users : [],
          videos: params.type === "all" || params.type === "videos" ? videos : [],
          competitions:
            params.type === "all" || params.type === "competitions" ? competitions : [],
          total: users.length + videos.length + competitions.length,
          query: params.q,
          isSemanticSearch: false,
        };
      },
    ),
    ...(config?.query ?? {}),
  });
}

export function useGetMe(config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["me"],
    queryFn: withFallback(() => request(`/api/users/me`), () => mockUsers[0]),
    ...(config?.query ?? {}),
  });
}

export function useGetUserVideos(userId: number, config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["user-videos", userId],
    queryFn: withFallback(
      () => request(`/api/users/${userId}/videos`),
      () => mockVideos.filter((item) => item.userId === userId),
    ),
    enabled: !!userId && (config?.query?.enabled ?? true),
    ...(config?.query ?? {}),
  });
}
