// Stand-ins for the "grok/canvas" kit the Command Table was written against. Same props as the
// call sites in app.tsx use (catalogued from Grok's Nov 3 export), dark WoW look to sit beside
// the page's own gold-on-black components.
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export { useState, useEffect, useMemo };
export type { ReactNode };

const C = {
  bg: "#0c0a08", card: "linear-gradient(180deg,#1a1712,#0d0c0a)", line: "#4a3d22", lineSoft: "#2e2618",
  gold: "#c9a44c", goldHi: "#f5d77a", ink: "#ece2c8", muted: "#a99d82", faint: "#7d735f",
  info: "#3fa9ff", warn: "#ff8000", ok: "#1eff00",
};
const SERIF = "'Friz Quadrata', 'Cinzel', 'Trajan Pro', Georgia, serif";

const THEME = {
  text: { primary: C.ink, secondary: C.muted, tertiary: C.faint },
  border: { default: C.line, subtle: C.lineSoft },
};
export function useGrokTheme() { return THEME; }

declare const WF_DATA: any;
const captionFor = (id?: string, fallback?: string) => {
  try { const c = id ? WF_DATA?.captions?.[id] : undefined; return typeof c === "string" ? c : fallback; } catch { return fallback; }
};

export function Page({ title, summary, width, children }: { title: string; summary?: string; width?: string; children: ReactNode }) {
  useEffect(() => { document.title = title; }, [title]);
  return (
    <main className="kit-page" title={summary} style={{ maxWidth: width === "wide" ? 1240 : 920 }}>
      {children}
    </main>
  );
}

const Depth = createContext(0);
export function Section({ heading, id, caption, children }: { heading: string; id?: string; caption?: string; children?: ReactNode }) {
  const depth = useContext(Depth);
  const cap = captionFor(id, caption);
  return (
    <section id={id} className={depth ? "kit-sub" : "kit-section"}>
      {depth ? <h3 className="kit-h3">{heading}</h3> : <h2 className="kit-h2">{heading}</h2>}
      {cap ? <p className="kit-caption">{cap}</p> : null}
      <Depth.Provider value={depth + 1}><div className="kit-stack">{children}</div></Depth.Provider>
    </section>
  );
}

export function Text({ children }: { children?: ReactNode }) {
  return <p className="kit-text">{children}</p>;
}

export function Callout({ tone, lead, children }: { tone?: string; lead?: string; children?: ReactNode }) {
  const col = tone === "warning" ? C.warn : C.info;
  return (
    <div className="kit-callout" style={{ borderColor: `${col}88`, background: `${col}14` }}>
      {lead ? <b style={{ color: col }}>{lead}. </b> : null}{children}
    </div>
  );
}

export function Table({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="kit-tablewrap">
      <table className="kit-table">
        <thead><tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

const TONE: Record<string, string> = { success: C.ok, warning: C.warn, info: C.info, neutral: C.muted, danger: "#ff4d4d" };
export function Status({ tone, children }: { tone?: string; children?: ReactNode }) {
  const col = TONE[tone ?? "neutral"] ?? C.muted;
  return <span className="kit-status" style={{ color: col, borderColor: `${col}77`, background: `${col}14` }}>{children}</span>;
}

type Row = { lead?: string; title: string; detail?: string; meta?: string; status?: { label: string; tone?: string } };
export function Rows({ rows }: { rows: Row[] }) {
  return (
    <div className="kit-rows">
      {rows.map((r, i) => (
        <div key={i} className="kit-row">
          <div className="kit-row-lead">{r.lead}</div>
          <div style={{ minWidth: 0 }}>
            <div className="kit-row-title">{r.title} {r.status ? <Status tone={r.status.tone}>{r.status.label}</Status> : null}</div>
            {r.detail ? <div className="kit-row-detail">{r.detail}</div> : null}
            {r.meta ? <div className="kit-row-meta">{r.meta}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Properties({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="kit-props">
      {items.map((p, i) => <div key={i}><dt>{p.label}</dt><dd>{p.value}</dd></div>)}
    </dl>
  );
}

export function Grid({ columns, plain, children }: { columns?: number; plain?: boolean; children?: ReactNode }) {
  const kids = React.Children.toArray(children);
  return (
    <div className="kit-grid" style={{ ["--cols" as any]: columns ?? 2 }}>
      {kids.map((k, i) => plain ? <React.Fragment key={i}>{k}</React.Fragment> : <div key={i} className="kit-cell">{k}</div>)}
    </div>
  );
}

export function Segmented({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="kit-seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value}
          className={o.value === value ? "kit-seg-on" : ""} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Steps({ steps }: { steps: { title: string; detail?: string }[] }) {
  return (
    <ol className="kit-steps">
      {steps.map((s, i) => (
        <li key={i}><span className="kit-step-n">{i + 1}</span><div><b>{s.title}</b>{s.detail ? <div className="kit-step-d">{s.detail}</div> : null}</div></li>
      ))}
    </ol>
  );
}

export function LinkCards({ links }: { links: { title: string; site: string; date?: string; href: string }[] }) {
  return (
    <div className="kit-links">
      {links.map((l, i) => (
        <a key={i} className="kit-link" href={l.href} target="_blank" rel="noopener noreferrer">
          <span className="kit-link-title">{l.title}</span>
          <span className="kit-link-site">{l.site}{l.date ? ` · ${l.date}` : ""}</span>
        </a>
      ))}
    </div>
  );
}

export function TableOfContents({ items }: { items: { label: string; id: string }[] }) {
  return (
    <nav className="kit-toc">
      {items.map((t) => <a key={t.id} href={`#${t.id}`}>{t.label}</a>)}
    </nav>
  );
}

// Feed data may carry {text, _source, _date} per bullet (Grok's research format) instead of a bare string.
type Bullet = string | { text: string; _source?: string | null; _date?: string | null };
export function BulletList({ items }: { items: Bullet[] }) {
  return (
    <ul className="kit-bullets">
      {items.map((t, i) => typeof t === "string" ? <li key={i}>{t}</li> : (
        <li key={i}>{t.text}{t._source || t._date ? <span className="kit-src"> · {[t._source, t._date].filter(Boolean).join(", ")}</span> : null}</li>
      ))}
    </ul>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={value} className="kit-toggle" onClick={() => onChange(!value)}>
      <span className={value ? "kit-knob kit-knob-on" : "kit-knob"} /><span>{label}</span>
    </button>
  );
}

export const KIT_CSS = `
:root{color-scheme:dark}
html,body{margin:0;background:${C.bg};color:${C.ink};font-family:'Alegreya Sans','Gill Sans','Trebuchet MS',sans-serif;font-size:15px;line-height:1.5}
body{background:radial-gradient(1200px 600px at 20% -10%,#2a2117 0%,transparent 60%),radial-gradient(900px 500px at 110% 10%,#1c1426 0%,transparent 55%),${C.bg};background-attachment:fixed}
a{color:${C.goldHi}}
.kit-page{margin:0 auto;padding:20px 16px 80px;display:flex;flex-direction:column;gap:22px;overflow-x:clip}
.kit-section{scroll-margin-top:12px}
.kit-h2{font-family:${SERIF};font-weight:400;font-size:24px;color:${C.goldHi};margin:0 0 4px;padding-bottom:6px;border-bottom:1px solid ${C.line};text-shadow:0 2px 0 #000}
.kit-h3{font-family:${SERIF};font-weight:400;font-size:17px;color:${C.gold};margin:6px 0 2px}
.kit-caption{margin:0 0 10px;color:${C.muted};font-size:13px}
.kit-stack{display:flex;flex-direction:column;gap:12px}
.kit-text{margin:0;color:${C.muted};font-size:14px}
.kit-callout{border:1px solid;border-radius:10px;padding:10px 14px;font-size:14px}
.kit-tablewrap{overflow-x:auto;border:1px solid ${C.line};border-radius:10px;background:${C.card}}
.kit-table{border-collapse:collapse;width:100%;font-size:13px}
.kit-table th{text-align:left;font-weight:500;color:${C.gold};padding:8px 10px;border-bottom:1px solid ${C.line};white-space:nowrap}
.kit-table td{padding:7px 10px;border-bottom:1px solid ${C.lineSoft};vertical-align:top}
.kit-table tr:last-child td{border-bottom:none}
.kit-status{display:inline-block;font-size:11px;padding:1px 8px;border:1px solid;border-radius:999px;white-space:nowrap;vertical-align:1px}
.kit-rows{border:1px solid ${C.line};border-radius:10px;background:${C.card}}
.kit-row{display:grid;grid-template-columns:78px minmax(0,1fr);gap:12px;padding:10px 14px;border-bottom:1px solid ${C.lineSoft}}
.kit-row:last-child{border-bottom:none}
.kit-row-lead{color:${C.gold};font-size:12px;padding-top:2px}
.kit-row-title{color:${C.ink};font-weight:500}
.kit-row-detail{color:${C.muted};font-size:13px;margin-top:2px}
.kit-row-meta{color:${C.faint};font-size:12px;margin-top:3px}
.kit-props{margin:0;display:flex;flex-direction:column;gap:8px}
.kit-props dt{color:${C.gold};font-size:12px}
.kit-props dd{margin:0;font-size:14px}
.kit-grid{display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));gap:12px}
.kit-cell{border:1px solid ${C.line};border-radius:10px;padding:12px 14px;background:${C.card}}
.kit-seg{display:flex;flex-wrap:wrap;gap:6px}
.kit-seg button{font:inherit;font-size:13px;padding:5px 12px;border-radius:999px;border:1px solid ${C.line};background:#14110d;color:${C.muted};cursor:pointer}
.kit-seg button:hover{border-color:${C.gold};color:${C.ink}}
.kit-seg .kit-seg-on{border-color:${C.gold};color:${C.goldHi};background:linear-gradient(180deg,#3a2c14,#1a140b)}
.kit-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.kit-steps li{display:flex;gap:10px;align-items:flex-start}
.kit-step-n{flex:none;width:22px;height:22px;border-radius:50%;border:1px solid ${C.gold};color:${C.goldHi};font-size:12px;display:flex;align-items:center;justify-content:center;font-family:${SERIF}}
.kit-step-d{color:${C.muted};font-size:13px}
.kit-links{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.kit-link{display:flex;flex-direction:column;gap:2px;padding:9px 12px;border:1px solid ${C.line};border-radius:10px;background:${C.card};text-decoration:none;color:${C.ink};transition:border-color .15s,transform .15s}
.kit-link:hover{border-color:${C.gold};transform:translateY(-1px)}
.kit-link-title{font-size:13px}
.kit-link-site{font-size:11px;color:${C.faint}}
.kit-toc{display:flex;flex-wrap:wrap;gap:6px;padding:10px 12px;border:1px solid ${C.line};border-radius:10px;background:${C.card}}
.kit-toc a{font-size:13px;text-decoration:none;color:${C.gold};padding:2px 8px;border-radius:6px}
.kit-toc a:hover{background:#2a2117;color:${C.goldHi}}
.kit-bullets{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px;font-size:14px}
.kit-src{color:${C.faint};font-size:12px}
.kit-toggle{display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:13px;color:${C.ink};background:none;border:none;cursor:pointer;padding:2px}
.kit-knob{position:relative;width:32px;height:18px;border-radius:999px;border:1px solid ${C.line};background:#14110d;flex:none}
.kit-knob::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:${C.muted};transition:left .15s}
.kit-knob-on{border-color:${C.gold}}
.kit-knob-on::after{left:16px;background:${C.goldHi}}
button:focus-visible,a:focus-visible{outline:2px solid ${C.goldHi};outline-offset:2px}
@media (max-width:720px){.kit-grid{grid-template-columns:minmax(0,1fr)}.kit-row{grid-template-columns:minmax(0,1fr);gap:2px}.kit-h2{font-size:21px}}
`;
