// Bootstrap: load the research data and saved progress before app.tsx runs, because app.tsx
// builds tables like CHECK_IDS and TAL_INDEX from WF_DATA at module load.
// Keep WF_DATA, WF_STORE and the Guard boundary working: the EliteDesk relies on them (DATA_CONTRACT.md, "Page code").
import React from "react";
import { createRoot } from "react-dom/client";
import { KIT_CSS } from "./kit";
import SEED from "../../wowf-data.json";

const LOCAL_KEY = "wf-site-state"; // browser fallback while the EliteDesk is unreachable

// The EliteDesk adds /wf-guard.js to every page load; it defines WF_REPORT and rolls back a crashing update.
function report(kind: string, message: string, extra?: Record<string, unknown>) {
  const fn = (globalThis as any).WF_REPORT;
  if (typeof fn === "function") fn(kind, message, extra);
  else console.error(`[${kind}]`, message, extra);
}

function readLocal(): any {
  try { const raw = window.localStorage.getItem(LOCAL_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function writeLocal(s: any) {
  try { window.localStorage.setItem(LOCAL_KEY, JSON.stringify(s)); } catch { /* storage blocked */ }
}

async function getJson(url: string): Promise<any> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return r.json();
}

function makeStore(initial: any, online: boolean) {
  const state: any = { ...(initial || {}) };
  const subs: ((ok: boolean) => void)[] = [];
  let timer: any = null, dirty = false;
  const setOnline = (ok: boolean) => { if (ok !== store.online) { store.online = ok; subs.forEach((f) => f(ok)); } };
  const flush = async () => {
    timer = null;
    if (!dirty) return;
    dirty = false;
    state.updated_at = Date.now();
    writeLocal(state);
    try {
      const r = await fetch("/api/state", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(state) });
      setOnline(r.ok);
      if (!r.ok) dirty = true;
    } catch { setOnline(false); dirty = true; }
  };
  const store = {
    initial: state, online,
    save(part: string, value: unknown) {
      if (JSON.stringify(state[part]) === JSON.stringify(value)) return;
      state[part] = value; dirty = true;
      if (!timer) timer = setTimeout(flush, 400);
    },
    onStatus(fn: (ok: boolean) => void) { subs.push(fn); return () => { const i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); }; },
  };
  // Retry unsent changes every 30 s while offline.
  setInterval(() => { if (dirty && !timer) flush(); }, 30000);
  return store;
}

// Catches render crashes so the page shows a message instead of going blank, and tells the EliteDesk.
class Guard extends React.Component<{ children: React.ReactNode }, { err: any }> {
  state = { err: null as any };
  static getDerivedStateFromError(err: any) { return { err }; }
  componentDidCatch(err: any, info: any) {
    report("boundary", String(err?.message || err), { stack: `${err?.stack || ""}\n${info?.componentStack || ""}`.slice(0, 4000) });
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ padding: "40px 16px", fontFamily: "Georgia, serif", color: "#ece2c8" }}>
        <h2 style={{ color: "#c9a44c" }}>The Command Table hit an error</h2>
        <p>{String(this.state.err?.message || this.state.err)}</p>
        <p style={{ color: "#a99d82" }}>The EliteDesk has been told. If this came from a new page update, it goes back to the last good version and this page reloads.</p>
      </div>
    );
  }
}

async function boot() {
  const el = document.getElementById("root")!;
  const style = document.createElement("style");
  style.textContent = KIT_CSS;
  document.head.appendChild(style);

  let data: any = SEED;
  try { data = await getJson("/data/wowf-data.json"); } catch { /* bundled seed */ }
  (globalThis as any).WF_DATA = data;

  let saved: any = null, online = false;
  try { saved = await getJson("/api/state"); online = true; } catch { saved = readLocal(); }
  const local = readLocal();
  if (online && local && (local.updated_at || 0) > (saved?.updated_at || 0)) saved = local; // offline edits win if newer
  (globalThis as any).WF_STORE = makeStore(saved, online);

  const { default: App } = await import("./app");
  createRoot(el).render(<Guard><App /></Guard>);
}

boot().catch((e) => {
  report("boot", String(e?.message || e), { stack: String(e?.stack || "").slice(0, 4000) });
  document.getElementById("root")!.textContent = `The Command Table failed to start: ${e}`;
});
