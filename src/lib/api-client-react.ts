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
type VotePayload = { videoId: number | string; data: { voteType?: string } };
type CommentPayload = { videoId: number | string; data: { content: string } };
type JoinPayload = { competitionId: number | string; data: { videoId?: number | string } };
type NotificationReadPayload = { notificationId: number | string };
type ReportStatusPayload = { reportId: number | string; status: "reviewing" | "resolved" | "dismissed" };
type ModerateVideoPayload = { videoId: number | string; action: "approve" | "reject" };
type DeactivateUserPayload = { userId: number | string };

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL?.replace(/\/$/, "") || "";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";
const USE_SUPABASE_AUTH =
  ((import.meta as any).env?.VITE_USE_SUPABASE_AUTH ?? "true") !== "false";

export const ACCESS_TOKEN_KEY = "fenomenstar_token";
export const REFRESH_TOKEN_KEY = "fenomenstar_refresh_token";

let authTokenGetter: (() => string | null) | undefined;

export function setAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter;
}

export function setStoredAuth(accessToken?: string | null, refreshToken?: string | null) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  setAuthTokenGetter(() => localStorage.getItem(ACCESS_TOKEN_KEY));
}

export function clearStoredAuth() {
  setStoredAuth(null, null);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "fenomenstar_user";
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function buildQuery(params?: Record<string, unknown>) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Web API adresi tanımlı değil");
  }

  const token = authTokenGetter?.();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = String(payload.message);
      }
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

async function requestWithToken<T>(path: string, token: string): Promise<T> {
  return request<T>(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function supabaseAuthRequest<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Web Supabase ayarları tanımlı değil");
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      String(
        payload?.msg ||
          payload?.error_description ||
          payload?.message ||
          payload?.error ||
          `Request failed: ${response.status}`,
      ),
    );
  }

  return payload as T;
}

function normalizeUser(raw: any) {
  const displayName = raw?.displayName || raw?.name || raw?.full_name || "FenomenStar Kullanıcı";
  const email = raw?.email || "";
  return {
    id: raw?.id ?? raw?.userId ?? raw?.user_id ?? 0,
    username: raw?.username || raw?.handle || slugify(displayName || email || String(raw?.id || "user")),
    displayName,
    name: displayName,
    email,
    role: raw?.role || "viewer",
    bio: raw?.bio || "",
    avatarUrl: raw?.avatarUrl || raw?.avatar || raw?.photo_url || "",
    city: raw?.city || "",
    category:
      raw?.category ||
      raw?.primaryTalent ||
      (Array.isArray(raw?.talents) && raw.talents.length > 0 ? raw.talents[0] : "") ||
      "",
    talents: toArray<string>(raw?.talents),
    totalVotes: toNumber(raw?.totalVotes ?? raw?.total_votes),
    totalViews: toNumber(raw?.totalViews ?? raw?.total_views),
    followers: toNumber(raw?.followers),
    following: toNumber(raw?.following),
    badgeCount:
      toNumber(raw?.badgeCount ?? raw?.badge_count) ||
      (Array.isArray(raw?.badges) ? raw.badges.length : 0),
    badges: toArray<string>(raw?.badges),
    isVerified: Boolean(raw?.isVerified ?? raw?.is_verified ?? raw?.verified),
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
    website: raw?.website || "",
    phone: raw?.phone || "",
    education: raw?.education || "",
    birthYear: raw?.birthYear || raw?.birth_year || undefined,
    videoCount: toNumber(raw?.videoCount ?? raw?.video_count),
    competitionCount: toNumber(raw?.competitionCount ?? raw?.competition_count),
    rank: toNumber(raw?.rank),
  };
}

function normalizeVideo(raw: any) {
  const displayName = raw?.displayName || raw?.user_name || raw?.name || "";
  const username = raw?.username || slugify(displayName || `user_${raw?.user_id || raw?.userId || raw?.id}`);
  return {
    id: raw?.id ?? 0,
    title: raw?.title || "FenomenStar Performansı",
    description: raw?.description || "",
    videoUrl: raw?.videoUrl || raw?.video_url || "",
    thumbnailUrl: raw?.thumbnailUrl || raw?.thumbnail || "",
    category: raw?.category || "Genel",
    isKaraoke: Boolean(raw?.isKaraoke ?? raw?.is_karaoke ?? String(raw?.category || "").toLowerCase().includes("karaoke")),
    userId: raw?.userId ?? raw?.user_id ?? 0,
    username,
    displayName,
    userAvatarUrl: raw?.userAvatarUrl || raw?.user_avatar || "",
    competitionId: raw?.competitionId ?? raw?.competition_id ?? null,
    voteCount: toNumber(raw?.voteCount ?? raw?.votes),
    viewCount: toNumber(raw?.viewCount ?? raw?.views),
    commentCount: toNumber(raw?.commentCount ?? raw?.comments_count),
    duration: toNumber(raw?.duration, 0),
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
    status: raw?.status || "ready",
  };
}

function normalizeCompetition(raw: any) {
  return {
    id: raw?.id ?? 0,
    title: raw?.title || "FenomenStar Yarışması",
    description: raw?.description || "",
    category: raw?.category || raw?.thematic || "Genel",
    status: raw?.status || "upcoming",
    startDate: raw?.startDate || raw?.start_date || "",
    endDate: raw?.endDate || raw?.end_date || "",
    prizeDescription: raw?.prizeDescription || raw?.prize || "",
    brandId: raw?.brandId ?? raw?.brand_id ?? null,
    brandName: raw?.brandName || raw?.brand_name || "",
    brandLogoUrl: raw?.brandLogoUrl || raw?.brand_logo_url || "",
    participantCount: toNumber(raw?.participantCount ?? raw?.participants),
    thumbnailUrl: raw?.thumbnailUrl || raw?.image || raw?.thumbnail || "",
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
  };
}

function normalizeBrand(raw: any) {
  return {
    id: raw?.id ?? 0,
    name: raw?.name || "FenomenStar Marka",
    logoUrl: raw?.logoUrl || raw?.logo_url || "",
    description: raw?.description || "",
    website: raw?.website || "",
    isVerified: Boolean(raw?.isVerified ?? raw?.is_verified ?? raw?.verified),
    activeCompetitions: toNumber(raw?.activeCompetitions ?? raw?.active_competitions),
    totalParticipants: toNumber(raw?.totalParticipants ?? raw?.total_participants),
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
  };
}

function normalizeLeaderboardEntry(raw: any) {
  const displayName = raw?.displayName || raw?.name || "FenomenStar Kullanıcısı";
  const totalVotes = toNumber(raw?.voteCount ?? raw?.total_votes ?? raw?.score ?? raw?.totalPoints);
  return {
    rank: toNumber(raw?.rank),
    userId: raw?.userId ?? raw?.user_id ?? raw?.id ?? 0,
    username: raw?.username || slugify(displayName),
    displayName,
    avatarUrl: raw?.avatarUrl || raw?.avatar || "",
    category: raw?.category || raw?.city || "",
    score: totalVotes,
    totalPoints: totalVotes,
    voteCount: totalVotes,
    totalVotes,
    totalViews: toNumber(raw?.total_views ?? raw?.totalViews),
    videoCount: toNumber(raw?.videoCount ?? raw?.video_count),
    city: raw?.city || "",
  };
}

function normalizeTrack(raw: any) {
  return {
    id: raw?.id ?? 0,
    title: raw?.title || "Karaoke Parçası",
    artist: raw?.artist || "FenomenStar Originals",
    genre: raw?.genre || "Pop",
    duration: toNumber(raw?.duration ?? raw?.duration_seconds),
    audioUrl: raw?.audioUrl || raw?.audio_url || "",
    lyricsUrl: raw?.lyricsUrl || raw?.lyrics_url || "",
    coverUrl: raw?.coverUrl || raw?.cover_url || "",
    bpm: toNumber(raw?.bpm, 90),
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
  };
}

function normalizeNotification(raw: any) {
  return {
    id: raw?.id ?? 0,
    type: raw?.type || "system",
    title: raw?.title || raw?.message || "FenomenStar Bildirimi",
    text: raw?.message || raw?.title || "Yeni bir bildirim var.",
    sub: raw?.sub || raw?.metadata?.subtitle || "",
    read: Boolean(raw?.read ?? raw?.is_read),
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
  };
}

function normalizeWalletHistory(raw: any) {
  return {
    id: raw?.id ?? `${raw?.type || "txn"}-${raw?.created_at || Date.now()}`,
    type: raw?.type || "transaction",
    description: raw?.description || raw?.label || "Cüzdan işlemi",
    amount: toNumber(raw?.amount),
    currency: raw?.currency || "TRY",
    balanceAfter: toNumber(raw?.balanceAfter ?? raw?.balance_after),
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
    metadata: raw?.metadata || {},
  };
}

function normalizeReport(raw: any) {
  return {
    id: raw?.id ?? 0,
    targetType: raw?.targetType || raw?.target_type || "unknown",
    targetId: raw?.targetId || raw?.target_id || "",
    reporterName: raw?.reporterName || raw?.reporter_name || "",
    reason: raw?.reason || "",
    status: raw?.status || "open",
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
  };
}

function normalizeModerationVideo(raw: any) {
  return {
    id: raw?.id ?? 0,
    title: raw?.title || "İçerik",
    description: raw?.description || "",
    status: raw?.status || "pending",
    videoUrl: raw?.videoUrl || raw?.video_url || "",
    thumbnailUrl: raw?.thumbnailUrl || raw?.thumbnail || "",
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
    userId: raw?.userId ?? raw?.user_id ?? 0,
    userName: raw?.userName || raw?.user_name || "Kullanıcı",
    userEmail: raw?.userEmail || raw?.user_email || "",
  };
}

export function useLogin(config?: MutationConfig<any, LoginPayload>) {
  return useMutation({
    mutationFn: async ({ data }: LoginPayload) => {
      if (USE_SUPABASE_AUTH) {
        const response = await supabaseAuthRequest<any>("/token?grant_type=password", {
          email: data.email,
          password: data.password,
        });
        const accessToken = response?.access_token || response?.session?.access_token || null;
        const refreshToken = response?.refresh_token || response?.session?.refresh_token || null;
        const me = accessToken ? await requestWithToken<any>("/api/auth/me", accessToken) : null;

        return {
          accessToken,
          refreshToken,
          user: normalizeUser(me?.user || me || response?.user || {}),
        };
      }

      const response = await request<any>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return {
        ...response,
        accessToken: response?.accessToken || response?.token || null,
        refreshToken: response?.refreshToken || null,
        user: normalizeUser(response?.user || {}),
      };
    },
    ...(config?.mutation ?? {}),
  });
}

export function useRegister(config?: MutationConfig<any, RegisterPayload>) {
  return useMutation({
    mutationFn: async ({ data }: RegisterPayload) => {
      if (USE_SUPABASE_AUTH) {
        const response = await supabaseAuthRequest<any>("/signup", {
          email: data.email,
          password: data.password,
          data: {
            name: data.displayName || data.username,
            username: data.username,
            city: data.city,
            category: data.category,
            role: "viewer",
          },
        });
        const accessToken = response?.access_token || response?.session?.access_token || null;
        const refreshToken = response?.refresh_token || response?.session?.refresh_token || null;
        const me = accessToken ? await requestWithToken<any>("/api/auth/me", accessToken) : null;

        return {
          accessToken,
          refreshToken,
          requiresEmailConfirmation: !accessToken,
          user: normalizeUser(
            me?.user || me || {
              id: response?.user?.id,
              email: data.email,
              username: data.username,
              displayName: data.displayName || data.username,
              city: data.city,
              category: data.category,
            },
          ),
        };
      }

      const response = await request<any>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: data.displayName || data.username,
          email: data.email,
          password: data.password,
          city: data.city,
          bio: data.category ? `${data.category} kategorisinde yeni FenomenStar kullanıcısı.` : undefined,
        }),
      });
      return {
        ...response,
        accessToken: response?.accessToken || response?.token || null,
        refreshToken: response?.refreshToken || null,
        user: normalizeUser({
          ...response?.user,
          username: data.username,
          category: data.category,
        }),
      };
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
    queryFn: async () => {
      const response = await request<any>(`/api/competitions${buildQuery(params)}`);
      const competitions = toArray<any>(response?.competitions ?? response).map(normalizeCompetition);
      return {
        competitions,
        total: toNumber(response?.total, competitions.length),
        page: toNumber(response?.page, params?.page || 1),
        limit: toNumber(response?.limit, params?.limit || competitions.length || 0),
      };
    },
    ...(config?.query ?? {}),
  });
}

export function useGetCompetitionById(id: number | string, config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["competition", id],
    queryFn: async () => normalizeCompetition(await request<any>(`/api/competitions/${id}`)),
    enabled: !!id && (config?.query?.enabled ?? true),
    ...(config?.query ?? {}),
  });
}

export function useJoinCompetition(config?: MutationConfig<any, JoinPayload>) {
  return useMutation({
    mutationFn: async ({ competitionId, data }: JoinPayload) =>
      request(`/api/competitions/${competitionId}/join`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...(config?.mutation ?? {}),
  });
}

export function useGetVideos(
  params?: { category?: string; competitionId?: number | string; page?: number; limit?: number },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["videos", params],
    queryFn: async () => {
      const response = await request<any>(`/api/videos${buildQuery(params)}`);
      const videos = toArray<any>(response?.videos ?? response).map(normalizeVideo);
      return {
        videos,
        total: toNumber(response?.total, videos.length),
        page: toNumber(response?.page, params?.page || 1),
        limit: toNumber(response?.limit, params?.limit || videos.length || 0),
      };
    },
    ...(config?.query ?? {}),
  });
}

export function useVoteVideo(config?: MutationConfig<any, VotePayload>) {
  return useMutation({
    mutationFn: async ({ videoId, data }: VotePayload) =>
      request(`/api/videos/${videoId}/vote`, {
        method: "POST",
        body: JSON.stringify({ voteType: data.voteType || "upvote" }),
      }),
    ...(config?.mutation ?? {}),
  });
}

export function useGetVideoComments(videoId: number | string, config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      const response = await request<any>(`/api/videos/${videoId}/comments`);
      return {
        comments: toArray<any>(response?.comments ?? response).map((comment) => ({
          id: comment?.id ?? 0,
          content: comment?.content || "",
          userId: comment?.userId ?? comment?.user_id ?? 0,
          username: comment?.username || slugify(comment?.user_name || "yorumcu"),
          userAvatarUrl: comment?.userAvatarUrl || comment?.user_avatar || "",
          createdAt: comment?.createdAt || comment?.created_at || new Date().toISOString(),
        })),
      };
    },
    enabled: !!videoId && (config?.query?.enabled ?? true),
    ...(config?.query ?? {}),
  });
}

export function useAddComment(config?: MutationConfig<any, CommentPayload>) {
  return useMutation({
    mutationFn: async ({ videoId, data }: CommentPayload) =>
      request(`/api/videos/${videoId}/comments`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...(config?.mutation ?? {}),
  });
}

export function useGetBrands(_params?: Record<string, never>, config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await request<any>("/api/brands");
      return { brands: toArray<any>(response?.brands ?? response).map(normalizeBrand) };
    },
    ...(config?.query ?? {}),
  });
}

export function useGetLeaderboard(
  params?: { period?: GetLeaderboardPeriod; category?: string },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["leaderboard", params],
    queryFn: async () => {
      const response = await request<any>(`/api/users/leaderboard${buildQuery(params)}`);
      const entries = toArray<any>(response?.entries ?? response).map(normalizeLeaderboardEntry);
      return {
        entries,
        period: params?.period ?? "weekly",
        category: params?.category ?? "all",
        updatedAt: new Date().toISOString(),
      };
    },
    ...(config?.query ?? {}),
  });
}

export function useGetKaraokeTracks(
  params?: { q?: string; genre?: string; page?: number; limit?: number },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["karaoke-tracks", params],
    queryFn: async () => {
      const response = await request<any>(`/api/karaoke/tracks${buildQuery(params)}`);
      const tracks = toArray<any>(response?.tracks ?? response).map(normalizeTrack);
      return {
        tracks,
        total: toNumber(response?.total, tracks.length),
        page: toNumber(response?.page, params?.page || 1),
      };
    },
    ...(config?.query ?? {}),
  });
}

export function useSearch(
  params: { q: string; type?: SearchType; page?: number; limit?: number; mode?: "fts" | "semantic" | "hybrid" },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["search", params],
    queryFn: async () => {
      const query = params.q.trim();
      if (query.length < 2) {
        return { users: [], videos: [], competitions: [], total: 0, query, isSemanticSearch: false };
      }

      const [searchResponse, competitionsResponse] = await Promise.all([
        request<any>(
          `/api/search${buildQuery({
            q: query,
            type: params.type === "competitions" ? "all" : params.type || "all",
            limit: params.limit || 20,
            mode: params.mode || "fts",
          })}`,
        ),
        params.type === "all" || params.type === "competitions"
          ? request<any>(`/api/competitions${buildQuery({ limit: params.limit || 20 })}`)
          : Promise.resolve({ competitions: [] }),
      ]);

      const users = toArray<any>(searchResponse?.users).map(normalizeUser);
      const videos = toArray<any>(searchResponse?.videos).map(normalizeVideo);
      const competitionSource = toArray<any>(competitionsResponse?.competitions ?? competitionsResponse);
      const lowered = query.toLowerCase();
      const competitions = competitionSource
        .map(normalizeCompetition)
        .filter((competition) =>
          [competition.title, competition.description, competition.brandName, competition.category]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(lowered)),
        );

      return {
        users: params.type === "all" || params.type === "users" ? users : [],
        videos: params.type === "all" || params.type === "videos" ? videos : [],
        competitions:
          params.type === "all" || params.type === "competitions" ? competitions : [],
        total: users.length + videos.length + competitions.length,
        query,
        isSemanticSearch: (params.mode || "fts") !== "fts",
      };
    },
    ...(config?.query ?? {}),
  });
}

export function useGetMe(config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await request<any>("/api/auth/me");
      return normalizeUser(response?.user || response);
    },
    ...(config?.query ?? {}),
  });
}

export function useGetUserById(userId: number | string, config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => normalizeUser(await request<any>(`/api/users/${userId}`)),
    enabled: !!userId && (config?.query?.enabled ?? true),
    ...(config?.query ?? {}),
  });
}

export function useGetUserVideos(userId: number | string, config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["user-videos", userId],
    queryFn: async () => {
      const response = await request<any>("/api/videos?limit=50");
      return toArray<any>(response?.videos ?? response)
        .map(normalizeVideo)
        .filter((video) => String(video.userId) === String(userId));
    },
    enabled: !!userId && (config?.query?.enabled ?? true),
    ...(config?.query ?? {}),
  });
}

export function useGetTalents(config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["talents"],
    queryFn: async () => {
      const response = await request<any>("/api/users/talents");
      return { talents: toArray<any>(response?.talents ?? response).map(normalizeUser) };
    },
    ...(config?.query ?? {}),
  });
}

export function useGetNotifications(config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await request<any>("/api/notifications");
      return {
        notifications: toArray<any>(response?.notifications ?? response).map(normalizeNotification),
        pagination: response?.pagination,
      };
    },
    ...(config?.query ?? {}),
  });
}

export function useGetUnreadNotificationCount(config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => request<any>("/api/notifications/unread-count"),
    ...(config?.query ?? {}),
  });
}

export function useMarkNotificationRead(config?: MutationConfig<any, NotificationReadPayload>) {
  return useMutation({
    mutationFn: async ({ notificationId }: NotificationReadPayload) =>
      request(`/api/notifications/${notificationId}/read`, { method: "PATCH" }),
    ...(config?.mutation ?? {}),
  });
}

export function useMarkAllNotificationsRead(config?: MutationConfig<any, void>) {
  return useMutation({
    mutationFn: async () => request("/api/notifications/read-all", { method: "PATCH" }),
    ...(config?.mutation ?? {}),
  });
}

export function useGetPaymentCatalog(config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["payments", "catalog"],
    queryFn: async () => request<any>("/api/payments/catalog"),
    ...(config?.query ?? {}),
  });
}

export function useGetWalletSummary(config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["payments", "wallet"],
    queryFn: async () => {
      const response = await request<any>("/api/payments/wallet");
      return {
        wallet: {
          ...response?.wallet,
          fenomenCoins: toNumber(response?.wallet?.fenomenCoins ?? response?.wallet?.fenomen_coins),
          starCoins: toNumber(response?.wallet?.starCoins ?? response?.wallet?.star_coins),
        },
        history: toArray<any>(response?.history).map(normalizeWalletHistory),
      };
    },
    ...(config?.query ?? {}),
  });
}

export function useGetAdminDashboard(config?: QueryConfig<any>) {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => request<any>("/api/admin/dashboard"),
    ...(config?.query ?? {}),
  });
}

export function useGetAdminUsers(
  params?: { limit?: number; offset?: number; role?: string },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const response = await request<any>(`/api/admin/users${buildQuery(params)}`);
      return { users: toArray<any>(response?.users ?? response).map(normalizeUser) };
    },
    ...(config?.query ?? {}),
  });
}

export function useDeactivateUser(config?: MutationConfig<any, DeactivateUserPayload>) {
  return useMutation({
    mutationFn: async ({ userId }: DeactivateUserPayload) =>
      request(`/api/admin/users/${userId}`, { method: "DELETE" }),
    ...(config?.mutation ?? {}),
  });
}

export function useGetAdminReports(
  params?: { limit?: number; offset?: number; status?: string },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["admin", "reports", params],
    queryFn: async () => {
      const response = await request<any>(`/api/admin/reports${buildQuery(params)}`);
      return { reports: toArray<any>(response?.reports ?? response).map(normalizeReport) };
    },
    ...(config?.query ?? {}),
  });
}

export function useUpdateReportStatus(config?: MutationConfig<any, ReportStatusPayload>) {
  return useMutation({
    mutationFn: async ({ reportId, status }: ReportStatusPayload) =>
      request(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    ...(config?.mutation ?? {}),
  });
}

export function useGetAdminModerationQueue(
  params?: { limit?: number; offset?: number; status?: string },
  config?: QueryConfig<any>,
) {
  return useQuery({
    queryKey: ["admin", "moderation", params],
    queryFn: async () => {
      const response = await request<any>(`/api/admin/videos/moderation${buildQuery(params)}`);
      return {
        videos: toArray<any>(response?.videos ?? response).map(normalizeModerationVideo),
      };
    },
    ...(config?.query ?? {}),
  });
}

export function useModerateVideo(config?: MutationConfig<any, ModerateVideoPayload>) {
  return useMutation({
    mutationFn: async ({ videoId, action }: ModerateVideoPayload) =>
      request(`/api/admin/videos/${videoId}/moderation`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      }),
    ...(config?.mutation ?? {}),
  });
}
