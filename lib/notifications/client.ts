type Fetcher = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
  timeoutMs?: number;
};

export const NOTIFICATION_KIND = {
  teacherApplication: "teacher_application",
  newStudent: "new_student",
  newTeacher: "new_teacher",
  quizAttempt: "quiz_attempt",
  applicationDecision: "application_decision",
  newQuiz: "new_quiz",
} as const;

export type NotificationKind = (typeof NOTIFICATION_KIND)[keyof typeof NOTIFICATION_KIND];

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  createdAt: string;
  read: boolean;
  href: string | null;
  data: Record<string, string | number | null>;
};

export type NotificationFeed = {
  items: NotificationItem[];
  unreadCount: number;
  seenAt: string | null;
};

export const EMPTY_FEED: NotificationFeed = { items: [], unreadCount: 0, seenAt: null };

export type FeedResult = { ok: true; data: NotificationFeed } | { ok: false; error: string };

export type SeenResult = { ok: true; seenAt: string } | { ok: false; error: string };

export function createNotificationsClient(options: ClientOptions = {}) {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337");
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10000;

  return {
    async list(accessToken: string): Promise<FeedResult> {
      try {
        const response = await fetcher(`${baseUrl}/api/notifications`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) return { ok: false, error: `HTTP_${response.status}` };

        const body = (await response.json()) as { data?: Partial<NotificationFeed> };
        return { ok: true, data: normalizeFeed(body.data) };
      } catch {
        return { ok: false, error: "UNKNOWN_ERROR" };
      }
    },

    async markSeen(accessToken: string): Promise<SeenResult> {
      try {
        const response = await fetcher(`${baseUrl}/api/notifications/seen`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) return { ok: false, error: `HTTP_${response.status}` };

        const body = (await response.json()) as { data?: { seenAt?: string } };
        return { ok: true, seenAt: body.data?.seenAt ?? new Date().toISOString() };
      } catch {
        return { ok: false, error: "UNKNOWN_ERROR" };
      }
    },
  };
}

export function normalizeFeed(value: Partial<NotificationFeed> | undefined): NotificationFeed {
  const items = Array.isArray(value?.items) ? value.items.filter(isNotificationItem) : [];
  return {
    items,
    unreadCount: typeof value?.unreadCount === "number" ? value.unreadCount : items.filter((item) => !item.read).length,
    seenAt: typeof value?.seenAt === "string" ? value.seenAt : null,
  };
}

function isNotificationItem(value: unknown): value is NotificationItem {
  const item = value as NotificationItem | undefined;
  return Boolean(item && typeof item.id === "string" && typeof item.kind === "string" && typeof item.createdAt === "string");
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
