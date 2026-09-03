"use client";

import type { AppRole } from "./contracts";

export type SessionUser = {
  email: string;
  username?: string;
  role?: { type: AppRole } | null;
};

export type SessionState = SessionUser | null | undefined;

let state: SessionState = undefined;
let inflight: Promise<void> | null = null;
const listeners = new Set<(next: SessionState) => void>();

function publish(next: SessionState) {
  state = next;
  for (const listener of listeners) listener(state);
}

export function getSession() {
  return state;
}

export function subscribeToSession(listener: (next: SessionState) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function loadSession() {
  if (inflight) return inflight;
  if (state !== undefined) return Promise.resolve();

  inflight = fetch("/api/auth/session")
    .then((response) => response.json())
    .then((body) => {
      publish(body.ok && body.user ? (body.user as SessionUser) : null);
    })
    .catch(() => {
      publish(null);
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function clearSession() {
  inflight = null;
  publish(null);
}

export function resetSession() {
  inflight = null;
  state = undefined;
}
