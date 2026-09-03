"use client";

import { EMPTY_FEED, normalizeFeed, type NotificationFeed } from "./client";

export type FeedState = {
  feed: NotificationFeed;
  status: "loading" | "ready" | "error";
};

const INITIAL: FeedState = { feed: EMPTY_FEED, status: "loading" };

let state: FeedState = INITIAL;
let inflight: Promise<void> | null = null;
const listeners = new Set<(next: FeedState) => void>();

function publish(next: FeedState) {
  state = next;
  for (const listener of listeners) listener(state);
}

export function getFeedState() {
  return state;
}

export function subscribeToFeed(listener: (next: FeedState) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function loadFeed(options: { force?: boolean } = {}) {
  if (inflight && !options.force) return inflight;
  if (!options.force && state.status === "ready") return Promise.resolve();

  inflight = fetch("/api/notifications", { headers: { Accept: "application/json" } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const body = (await response.json()) as { data?: NotificationFeed };
      publish({ feed: normalizeFeed(body.data), status: "ready" });
    })
    .catch(() => {
      publish({ feed: state.feed, status: "error" });
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export async function markFeedSeen() {
  const seenAt = new Date().toISOString();
  publish({
    feed: { items: state.feed.items.map((item) => ({ ...item, read: true })), unreadCount: 0, seenAt },
    status: "ready",
  });

  await fetch("/api/notifications/seen", { method: "POST" }).catch(() => undefined);
}

export function resetFeed() {
  inflight = null;
  publish(INITIAL);
}
