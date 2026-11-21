import { useEffect, useState } from "react";
import { discover, PUBLISHER } from "./publication-contract.mjs";

type ResourceKind = "json-feed" | "books";
export type SubscriptionStatus = "snapshot" | "cached" | "fresh" | "unavailable";
type Snapshot<T> = { data: T; status: SubscriptionStatus; capturedAt?: number };
const LIMIT = 700_000;
const REFRESH_MS = 300_000;

function getSaved<T>(key: string, validate: (value: unknown) => T): { data: T; capturedAt: number } | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("capturedAt" in parsed) || !("data" in parsed)) return null;
    const { capturedAt, data } = parsed as { capturedAt: unknown; data: unknown };
    if (typeof capturedAt !== "number" || !Number.isFinite(capturedAt) ||
        capturedAt > Date.now() || capturedAt <= 0) return null;
    return { data: validate(data), capturedAt };
  } catch {
    return null;
  }
}

async function readJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { mode: "cors", credentials: "omit", signal });
  if (!response.ok) throw new Error("Publisher HTTP " + response.status);
  if (Number(response.headers.get("content-length") || 0) > LIMIT) throw new Error("Publisher payload exceeds limit");
  const body = await response.text();
  if (body.length > LIMIT) throw new Error("Publisher payload exceeds limit");
  return JSON.parse(body) as unknown;
}

/**
 * Site-owned transport: Folio remains the UI/router, NOT the subscription
 * provider. Only publisher-validated state is cached; invalid responses
 * preserve the last known good version or the dated built-in snapshot.
 */
export function usePublicationResource<T>(
  kind: ResourceKind,
  validate: (value: unknown) => T,
  initialData: T,
): Snapshot<T> {
  const [state, setState] = useState<Snapshot<T>>({ data: initialData, status: "snapshot" });
  useEffect(() => {
    let mounted = true;
    let active: AbortController | null = null;
    // The first JSON Feed subscription predated Issue image. Never hydrate a
    // fresh cover-enabled page with a still-valid coverless browser cache.
    const key = "tomzlab-publication-" + (kind === "json-feed" ? "v3:" : "v2:") + kind;
    let latest = getSaved(key, validate);
    if (latest) setState({ data: latest.data, status: "cached", capturedAt: latest.capturedAt });

    async function sync() {
      if (active) return;
      if (latest && Date.now() - latest.capturedAt < REFRESH_MS) return;
      const controller = new AbortController();
      active = controller;
      const timeout = setTimeout(() => controller.abort(), 12_000);
      try {
        const endpoints = discover(await readJson(PUBLISHER + "feeds.json", controller.signal));
        const payload = validate(await readJson(endpoints[kind], controller.signal));
        if (!mounted) return;
        latest = { data: payload, capturedAt: Date.now() };
        setState({ data: payload, status: "fresh", capturedAt: latest.capturedAt });
        try { localStorage.setItem(key, JSON.stringify(latest)); } catch { /* Optional browser storage. */ }
      } catch {
        if (mounted) setState(latest
          ? { data: latest.data, status: "cached", capturedAt: latest.capturedAt }
          : { data: initialData, status: "unavailable" });
      } finally {
        clearTimeout(timeout);
        active = null;
      }
    }
    void sync();
    const interval = setInterval(() => { if (!document.hidden) void sync(); }, REFRESH_MS);
    const onVisibility = () => { if (!document.hidden) void sync(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mounted = false;
      active?.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kind, validate, initialData]);
  return state;
}
