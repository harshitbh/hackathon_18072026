import { useState, useEffect, useRef } from "react"

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  base: "#070a10",
  surface: "#0b0f18",
  raised: "#0f1520",
  card: "#131a28",
  elevated: "#18202f",
  hover: "#1c2638",
  border0: "#171f2e",
  border1: "#1e2840",
  border2: "#273450",
  border3: "#2f3e5c",

  red: "#ff3d55",    redDim: "rgba(255,61,85,0.1)",    redBorder: "rgba(255,61,85,0.25)",
  emerald: "#00e87a", emDim: "rgba(0,232,122,0.08)",    emBorder: "rgba(0,232,122,0.22)",
  cyan: "#00d4ff",   cyanDim: "rgba(0,212,255,0.09)",   cyanBorder: "rgba(0,212,255,0.25)",
  mint: "#00f5c4",   mintDim: "rgba(0,245,196,0.08)",   mintBorder: "rgba(0,245,196,0.22)",
  amber: "#ffb020",  amberDim: "rgba(255,176,32,0.09)", amberBorder: "rgba(255,176,32,0.22)",
  violet: "#a78bfa", violetDim: "rgba(167,139,250,0.09)",

  t1: "#cfd8ea", t2: "#7c8fa8", t3: "#44556e", t4: "#283040",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  sans: "'Inter', system-ui, sans-serif",
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Persona = "Developer" | "DevOps Engineer" | "Engineering Manager"
type PrRoute = "branch" | "comment"
type Token = { t: string; c?: string }
type CodeLine = { ln: number; tokens: Token[]; kind?: "removed" | "added" | "context" }

// ─── Static data ─────────────────────────────────────────────────────────────
const DEFECTIVE: CodeLine[] = [
  { ln: 1,  kind: "context", tokens: [{ t: "import", c: "#c792ea" }, { t: " pytest, coverage" }] },
  { ln: 2,  kind: "context", tokens: [{ t: "from", c: "#c792ea" }, { t: " core.analyser " }, { t: "import", c: "#c792ea" }, { t: " BranchCoverage" }] },
  { ln: 3,  kind: "context", tokens: [{ t: "" }] },
  { ln: 4,  kind: "context", tokens: [{ t: "def", c: "#c792ea" }, { t: " " }, { t: "assert_coverage_threshold", c: "#82aaff" }, { t: "(threshold: " }, { t: "float", c: "#f07178" }, { t: ") -> " }, { t: "None", c: "#f07178" }, { t: ":" }] },
  { ln: 5,  kind: "context", tokens: [{ t: "    report = BranchCoverage" }, { t: "." }, { t: "run", c: "#82aaff" }, { t: "(mode=" }, { t: '"branch"', c: "#a5d6a7" }, { t: ")" }] },
  { ln: 6,  kind: "context", tokens: [{ t: "    actual = report" }, { t: "." }, { t: "percent", c: "#dde3ef" }] },
  { ln: 7,  kind: "context", tokens: [{ t: "" }] },
  { ln: 8,  kind: "removed", tokens: [{ t: "    # BUG: str cast breaks numeric comparison", c: "#3f5170" }] },
  { ln: 9,  kind: "removed", tokens: [{ t: "    if", c: "#c792ea" }, { t: " str(actual) " }, { t: ">=", c: "#89ddff" }, { t: " str(threshold):" }] },
  { ln: 10, kind: "context", tokens: [{ t: "        " }, { t: "return", c: "#c792ea" }, { t: " {" }, { t: '"pass"', c: "#a5d6a7" }, { t: ": " }, { t: "True", c: "#f07178" }, { t: ", " }, { t: '"actual"', c: "#a5d6a7" }, { t: ": actual}" }] },
  { ln: 11, kind: "context", tokens: [{ t: "" }] },
  { ln: 12, kind: "context", tokens: [{ t: "    raise", c: "#c792ea" }, { t: " " }, { t: "AssertionError", c: "#f07178" }, { t: "(" }] },
  { ln: 13, kind: "context", tokens: [{ t: "        f" }, { t: '"Expected {threshold}% but got {actual}%"', c: "#a5d6a7" }] },
  { ln: 14, kind: "context", tokens: [{ t: "    )" }] },
]

const PATCHED: CodeLine[] = [
  { ln: 1,  kind: "context", tokens: [{ t: "import", c: "#c792ea" }, { t: " pytest, coverage" }] },
  { ln: 2,  kind: "context", tokens: [{ t: "from", c: "#c792ea" }, { t: " core.analyser " }, { t: "import", c: "#c792ea" }, { t: " BranchCoverage" }] },
  { ln: 3,  kind: "context", tokens: [{ t: "" }] },
  { ln: 4,  kind: "context", tokens: [{ t: "def", c: "#c792ea" }, { t: " " }, { t: "assert_coverage_threshold", c: "#82aaff" }, { t: "(threshold: " }, { t: "float", c: "#f07178" }, { t: ") -> " }, { t: "None", c: "#f07178" }, { t: ":" }] },
  { ln: 5,  kind: "context", tokens: [{ t: "    report = BranchCoverage" }, { t: "." }, { t: "run", c: "#82aaff" }, { t: "(mode=" }, { t: '"branch"', c: "#a5d6a7" }, { t: ")" }] },
  { ln: 6,  kind: "context", tokens: [{ t: "    actual = report" }, { t: "." }, { t: "percent", c: "#dde3ef" }] },
  { ln: 7,  kind: "context", tokens: [{ t: "" }] },
  { ln: 8,  kind: "added", tokens: [{ t: "    # FIX: cast both operands to float for IEEE 754 precision", c: "#3f5170" }] },
  { ln: 9,  kind: "added", tokens: [{ t: "    if", c: "#c792ea" }, { t: " " }, { t: "float", c: "#f07178" }, { t: "(actual) " }, { t: ">=", c: "#89ddff" }, { t: " " }, { t: "float", c: "#f07178" }, { t: "(threshold):" }] },
  { ln: 10, kind: "context", tokens: [{ t: "        " }, { t: "return", c: "#c792ea" }, { t: " {" }, { t: '"pass"', c: "#a5d6a7" }, { t: ": " }, { t: "True", c: "#f07178" }, { t: ", " }, { t: '"actual"', c: "#a5d6a7" }, { t: ": actual}" }] },
  { ln: 11, kind: "context", tokens: [{ t: "" }] },
  { ln: 12, kind: "context", tokens: [{ t: "    raise", c: "#c792ea" }, { t: " " }, { t: "AssertionError", c: "#f07178" }, { t: "(" }] },
  { ln: 13, kind: "context", tokens: [{ t: "        f" }, { t: '"Expected {threshold}% but got {actual}%"', c: "#a5d6a7" }] },
  { ln: 14, kind: "context", tokens: [{ t: "    )" }] },
]

interface GridRow { id: string; source: string; refPath: string; branchDepth: number; status: "passed" | "running" | "failed" | "queued"; commit: string }
const GRID_ROWS: GridRow[] = [
  { id: "1", source: "pytest (backend-main)",    refPath: "tests/core/coverage_assert.py",    branchDepth: 94.8, status: "passed",  commit: "a4f2c91" },
  { id: "2", source: "allure-js (frontend-ui)",  refPath: "src/__tests__/CoverageCard.spec.ts", branchDepth: 89.4, status: "running", commit: "b8e1d04" },
  { id: "3", source: "pytest (mutation-suite)",  refPath: "tests/mutation/kill_rate.py",       branchDepth: 76.0, status: "failed",  commit: "c7a3f62" },
  { id: "4", source: "playwright (e2e-smoke)",   refPath: "e2e/flows/auth.spec.ts",            branchDepth: 91.2, status: "passed",  commit: "d0c9e37" },
  { id: "5", source: "allure-js (api-contract)", refPath: "src/__tests__/api/contract.test.ts", branchDepth: 88.0, status: "queued",  commit: "e5b2a18" },
]

interface LogEntry { time: string; event: string; traceId: string; status: string; payload: Record<string, unknown> }
const SEED_LOGS: LogEntry[] = [
  { time: "14:32:07.441", event: "coverage.threshold.assert", traceId: "tr_a4f2c91_041", status: "FAIL",
    payload: { threshold: 88.2, actual: 76.0, delta: "-12.2pp", branch: "feature/api-refactor" } },
  { time: "14:32:09.118", event: "gemini.patch.generated",    traceId: "tr_a4f2c91_042", status: "SUCCESS",
    payload: { model: "gemini-2.5-pro", tokens_used: 1420, cost_usd: 0.02, confidence: 0.974 } },
  { time: "14:32:10.884", event: "viasocket.dispatch",        traceId: "tr_a4f2c91_043", status: "DELIVERED",
    payload: { endpoint: "https://hook.viasocket.com/tst_4f9", http_status: 200, latency_ms: 141 } },
  { time: "14:31:55.209", event: "allure.report.ingest",      traceId: "tr_b8e1d04_039", status: "SUCCESS",
    payload: { suite: "frontend-ui", tests: 847, passed: 831, flaky: 2, duration_ms: 48200 } },
  { time: "14:31:12.670", event: "mutation.kill.scan",        traceId: "tr_c7a3f62_038", status: "WARN",
    payload: { mutants_total: 80, killed: 76, survivors: 4, score_pct: 95.0 } },
]
const EXTRA_LOGS: LogEntry[] = [
  { time: "", event: "pr.comment.posted",   traceId: "tr_h2k5_044", status: "SUCCESS",
    payload: { pr: 412, comment_id: 8841, type: "inline_suggestion", line: 9 } },
  { time: "", event: "coverage.py.stream",  traceId: "tr_i7n3_045", status: "IN_PROGRESS",
    payload: { runner: "worker-07", shard: "2/4", progress_pct: 63 } },
  { time: "", event: "github.action.rerun", traceId: "tr_j9q1_046", status: "QUEUED",
    payload: { workflow: "ci-coverage.yml", run_id: 9921044, trigger: "patch_push" } },
]

// ─── Micro components ─────────────────────────────────────────────────────────

function Pill({ color, border, bg, children }: { color: string; border: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 100,
      background: bg, border: `1px solid ${border}`, color, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{children}</span>
  )
}

function Dot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <span style={{
      width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0,
      boxShadow: pulse ? `0 0 0 0 ${color}` : "none",
      animation: pulse ? "pulseGlow 2s ease-in-out infinite" : "none",
    }} />
  )
}

function ConnPill({ color, dimColor, border, label, live }: { color: string; dimColor: string; border: string; label: string; live?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 8, cursor: "pointer",
        background: hov ? dimColor : "transparent",
        border: `1px solid ${hov ? color + "55" : border}`,
        transition: "all 0.15s ease",
      }}
    >
      <Dot color={color} pulse={live} />
      <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: C.mono }}>
        {label}
      </span>
    </button>
  )
}

function StatusBadge({ status }: { status: GridRow["status"] }) {
  const M = {
    passed:  { color: C.emerald, bg: C.emDim,    border: C.emBorder,    label: "Passed"  },
    running: { color: C.cyan,   bg: C.cyanDim,   border: C.cyanBorder,  label: "Running" },
    failed:  { color: C.red,    bg: C.redDim,    border: C.redBorder,   label: "Failed"  },
    queued:  { color: C.amber,  bg: C.amberDim,  border: C.amberBorder, label: "Queued"  },
  }
  const { color, bg, border, label } = M[status]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 100,
      background: bg, border: `1px solid ${border}`, color, fontSize: 10, fontWeight: 700,
    }}>
      <span style={{
        width: 4, height: 4, borderRadius: "50%", background: color,
        animation: status === "running" ? "pulseGlow 1.4s ease-in-out infinite" : "none",
      }} />
      {label}
    </span>
  )
}

function SyntaxLine({ line }: { line: CodeLine }) {
  const kind = line.kind ?? "context"
  const bgMap   = { removed: "rgba(255,61,85,0.07)", added: "rgba(0,232,122,0.06)", context: "transparent" }
  const gutMap  = { removed: C.red, added: C.emerald, context: "transparent" }
  const markMap = { removed: "−", added: "+", context: " " }
  return (
    <div style={{
      display: "flex", minHeight: 21,
      background: bgMap[kind],
      borderLeft: `2px solid ${kind !== "context" ? gutMap[kind] : "transparent"}`,
    }}>
      <span style={{
        width: 32, flexShrink: 0, textAlign: "right", paddingRight: 8,
        fontFamily: C.mono, fontSize: 10, lineHeight: "21px",
        color: kind !== "context" ? gutMap[kind] : C.t4, userSelect: "none",
      }}>{line.ln}</span>
      <span style={{
        width: 14, flexShrink: 0, textAlign: "center",
        fontFamily: C.mono, fontSize: 11, lineHeight: "21px",
        color: gutMap[kind], userSelect: "none",
      }}>{markMap[kind]}</span>
      <span style={{ fontFamily: C.mono, fontSize: 11.5, lineHeight: "21px", paddingRight: 12 }}>
        {line.tokens.map((tok, i) => (
          <span key={i} style={{ color: tok.c ?? C.t1 }}>{tok.t}</span>
        ))}
      </span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: C.t3,
      letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ flex: 1, height: 1, background: C.border0 }} />
      {children}
      <span style={{ flex: 1, height: 1, background: C.border0 }} />
    </div>
  )
}

function Card({ children, style, accent }: { children: React.ReactNode; style?: React.CSSProperties; accent?: string }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: C.card, borderRadius: 12, padding: 20,
        border: `1px solid ${hov && accent ? accent + "44" : C.border1}`,
        boxShadow: hov && accent ? `0 0 0 1px ${accent}18, 0 8px 32px rgba(0,0,0,0.4)` : "0 2px 16px rgba(0,0,0,0.3)",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function BarMeter({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ height: 4, background: C.border1, borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`, height: "100%", background: color,
        borderRadius: 2, transition: "width 0.6s ease",
      }} />
    </div>
  )
}

function useTypewriter(text: string, speed = 14) {
  const [out, setOut] = useState("")
  const i = useRef(0)
  useEffect(() => {
    i.current = 0; setOut("")
    const id = setInterval(() => {
      i.current++; setOut(text.slice(0, i.current))
      if (i.current >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return out
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [persona, setPersona]       = useState<Persona>("Developer")
  const [personaOpen, setPersonaOpen] = useState(false)
  const [prRoute, setPrRoute]       = useState<PrRoute>("branch")
  const [logs, setLogs]             = useState<LogEntry[]>(SEED_LOGS)
  const [logIdx, setLogIdx]         = useState(0)
  const [hovRow, setHovRow]         = useState<string | null>(null)
  const [approving, setApproving]   = useState(false)
  const [approved, setApproved]     = useState(false)
  const [rejected, setRejected]     = useState(false)
  const logRef                      = useRef<HTMLDivElement>(null)

  const aiText = "Root cause: string coercion in numeric comparison. str(actual) >= str(threshold) triggers lexicographic ordering — '9' > '88.2' evaluates True regardless of numeric magnitude. Fix: explicit float() cast on both operands enforces IEEE 754 numeric semantics. Confidence: 97.4%. Regression risk: low — no API surface changes."
  const typed  = useTypewriter(aiText)

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      const ts  = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}.${String(now.getMilliseconds()).padStart(3,"0")}`
      const e   = { ...EXTRA_LOGS[logIdx % EXTRA_LOGS.length], time: ts }
      setLogs(p => [e, ...p].slice(0, 24))
      setLogIdx(i => i + 1)
    }, 3800)
    return () => clearInterval(id)
  }, [logIdx])

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 0 }, [logs.length])

  const personaColor: Record<Persona, string> = {
    "Developer":          C.cyan,
    "DevOps Engineer":    C.mint,
    "Engineering Manager": C.amber,
  }

  const handleApprove = () => {
    setApproving(true)
    setTimeout(() => { setApproving(false); setApproved(true) }, 1800)
  }

  return (
    <div style={{ minHeight: "100vh", background: C.base, fontFamily: C.sans, color: C.t1, display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1e2840;border-radius:4px}
        @keyframes pulseGlow{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes logEntry{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
        .hov-btn:hover{filter:brightness(1.12);transform:translateY(-1px)}
        .hov-btn:active{filter:brightness(.94);transform:translateY(0)}
        .row-hov:hover{background:#1c2638!important}
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — GLOBAL INTEGRATION HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <header style={{
        background: C.surface, borderBottom: `1px solid ${C.border1}`,
        padding: "0 24px", height: 56, display: "flex", alignItems: "center",
        gap: 16, flexShrink: 0, position: "sticky", top: 0, zIndex: 50,
      }}>
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: `linear-gradient(135deg, ${C.cyanDim}, ${C.emDim})`,
            border: `1px solid ${C.cyanBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
              <path d="M3 9h2l1.5-5 3 10 1.5-5H13" stroke={C.cyan} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>
            healix<span style={{ color: C.cyan }}>.</span>
          </span>
          <span style={{ fontSize: 10, color: C.t3, fontFamily: C.mono }}>v4.2.0</span>
        </div>

        <div style={{ width: 1, height: 22, background: C.border1, flexShrink: 0 }} />

        {/* ── Persona dropdown ── */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setPersonaOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 12px", borderRadius: 8, cursor: "pointer",
              background: personaOpen ? C.elevated : "transparent",
              border: `1px solid ${personaOpen ? personaColor[persona] + "44" : C.border1}`,
              color: C.t1, transition: "all 0.15s ease",
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              background: `linear-gradient(135deg, ${personaColor[persona]}44, ${personaColor[persona]}22)`,
              border: `1px solid ${personaColor[persona]}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 800, color: personaColor[persona],
            }}>
              {persona[0]}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 9, color: C.t3, letterSpacing: "0.08em", textTransform: "uppercase" }}>Active Persona Role</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: personaColor[persona] }}>{persona}</div>
            </div>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth={2} strokeLinecap="round"
              style={{ transform: personaOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {personaOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: 200,
              background: C.elevated, border: `1px solid ${C.border2}`,
              borderRadius: 10, overflow: "hidden", zIndex: 100,
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              animation: "slideDown 0.18s ease",
            }}>
              {(["Developer", "DevOps Engineer", "Engineering Manager"] as Persona[]).map(p => (
                <button key={p} onClick={() => { setPersona(p); setPersonaOpen(false) }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 14px", cursor: "pointer",
                    background: persona === p ? personaColor[p] + "18" : "transparent",
                    border: "none", color: persona === p ? personaColor[p] : C.t2,
                    fontSize: 12, fontWeight: persona === p ? 600 : 400,
                    transition: "background 0.12s ease",
                  }}>
                  <Dot color={personaColor[p]} />
                  {p}
                  {persona === p && (
                    <svg style={{ marginLeft: "auto" }} width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Branch context ── */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 10,
          background: C.raised, border: `1px solid ${C.border1}`,
          borderRadius: 8, padding: "0 14px", height: 36, minWidth: 0,
        }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth={2} strokeLinecap="round">
            <line x1={6} y1={3} x2={6} y2={15} />
            <circle cx={18} cy={6} r={3} /><circle cx={6} cy={18} r={3} /><circle cx={6} cy={6} r={3} />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <span style={{ fontSize: 10, color: C.t3, whiteSpace: "nowrap" }}>Active Branch:</span>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            feature/api-refactor
          </span>
          <span style={{ fontSize: 10, color: C.t3 }}>·</span>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.cyan, fontWeight: 600, whiteSpace: "nowrap" }}>PR #412</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <Dot color={C.red} pulse />
            <span style={{ fontSize: 10, color: C.red, fontWeight: 700, letterSpacing: "0.06em" }}>FAILURE</span>
          </div>
        </div>

        {/* ── Connection pills ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <ConnPill color={C.amber} dimColor={C.amberDim} border={C.amberBorder} label="coverage.py stream" live />
          <ConnPill color={C.cyan}  dimColor={C.cyanDim}  border={C.cyanBorder}  label="Allure adapter"      live />
          <ConnPill color={C.mint}  dimColor={C.mintDim}  border={C.mintBorder}  label="viaSocket engine"    live />
        </div>
      </header>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — TELEMETRY & FINANCIAL SCOREBOARD
        ══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Telemetry &amp; Financial Scoreboard</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>

          {/* Card A — Coverage Delta */}
          <Card accent={C.emerald}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Change-Based Coverage Delta
              </span>
              <span style={{ padding: "2px 8px", borderRadius: 4, background: C.emDim, border: `1px solid ${C.emBorder}`, fontSize: 10, color: C.emerald, fontWeight: 600 }}>
                ↑ +1.2pp
              </span>
            </div>
            <div style={{ fontFamily: C.mono, fontSize: 40, fontWeight: 700, color: C.emerald, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 12, textShadow: `0 0 32px ${C.emerald}44` }}>
              94.8%
            </div>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 10 }}>Covered</div>
            <BarMeter value={94.8} color={C.emerald} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: C.t3, fontFamily: C.mono }}>
              <span>threshold 88.2%</span><span>5,218 lines</span>
            </div>
          </Card>

          {/* Card B — AI PR Risk */}
          <Card accent={C.mint}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              AI PR Risk Assessment
            </div>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 20px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "12px 28px", borderRadius: 100,
                background: `linear-gradient(135deg, ${C.emDim}, ${C.mintDim})`,
                border: `1px solid ${C.mintBorder}`,
                boxShadow: `0 0 32px ${C.mint}22`,
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.mint} strokeWidth={2.5} strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ fontFamily: C.mono, fontSize: 18, fontWeight: 800, color: C.mint, letterSpacing: "0.04em" }}>
                  LOW RISK
                </span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[["Complexity", "Low"], ["Churn", "Minimal"], ["Blast Radius", "Contained"]].map(([k, v]) => (
                <div key={k} style={{ textAlign: "center", padding: 8, background: C.raised, borderRadius: 8, border: `1px solid ${C.border0}` }}>
                  <div style={{ fontSize: 9, color: C.t3, marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.mint }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Card C — Token Budget */}
          <Card accent={C.violet}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              Gemini API Pipeline Token Usage
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: C.violetDim, border: `1px solid ${C.violet}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.violet} strokeWidth={2} strokeLinecap="round">
                  <rect x={2} y={3} width={20} height={14} rx={2} />
                  <line x1={8} y1={21} x2={16} y2={21} /><line x1={12} y1={17} x2={12} y2={21} />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.t3, marginBottom: 4 }}>Estimated Transaction Cost</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: C.mono, fontSize: 22, fontWeight: 700, color: C.violet }}>1,420</span>
                  <span style={{ fontFamily: C.mono, fontSize: 13, color: C.t3 }}>tokens</span>
                  <span style={{
                    padding: "1px 8px", borderRadius: 4,
                    background: C.emDim, border: `1px solid ${C.emBorder}`,
                    fontFamily: C.mono, fontSize: 12, fontWeight: 700, color: C.emerald,
                  }}>$0.02</span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 6 }}>
                <span style={{ color: C.t3 }}>Remaining Daily Quota</span>
                <span style={{ fontFamily: C.mono, color: C.emerald, fontWeight: 700 }}>82%</span>
              </div>
              <div style={{ height: 6, background: C.border1, borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: "82%", height: "100%", borderRadius: 3,
                  background: `linear-gradient(90deg, ${C.emerald}, ${C.cyan})`,
                  boxShadow: `0 0 8px ${C.emerald}44`,
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: C.t3, fontFamily: C.mono }}>
                <span>0</span><span>daily cap: 2M tokens</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — COVERAGE METRICS MATRIX
        ══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Expanded Coverage Metrics Matrix</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            {
              label: "Logical Branch & Condition Coverage",
              value: "89.4%", valueColor: C.cyan,
              sub: "Tracks true/false execution paths of complex conditionals",
              bar: 89.4, barColor: C.cyan,
              icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 6h16M4 12h8m-8 6h16" /></svg>,
            },
            {
              label: "Mutation Score (Kill Rate)",
              value: "76/80", valueColor: C.emerald,
              sub: "Mutants Cleared — 4 survivors",
              bar: 95, barColor: C.emerald,
              badge: "95%",
              icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
            },
            {
              label: "Path Coverage Depth",
              value: "91.2%", valueColor: C.mint,
              sub: "Verifies execution maps across all redundant function loops",
              bar: 91.2, barColor: C.mint,
              icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
            },
            {
              label: "Test Flakiness Index",
              value: null, valueColor: C.amber,
              pill: "0.2% Flaky Run Impact",
              sub: "Flags race conditions and brittle UI selectors",
              bar: 0.2, barColor: C.amber,
              icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>,
            },
          ].map((tile) => (
            <div key={tile.label} style={{
              background: C.card, borderRadius: 10, padding: 16,
              border: `1px solid ${C.border1}`,
              transition: "border-color 0.15s ease",
              cursor: "default",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = tile.valueColor + "44")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border1)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: tile.valueColor, opacity: 0.7 }}>{tile.icon}</span>
                {tile.badge && (
                  <span style={{ fontSize: 9, fontFamily: C.mono, color: tile.valueColor, background: tile.valueColor + "18", padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>{tile.badge}</span>
                )}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.t3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, lineHeight: 1.4 }}>
                {tile.label}
              </div>
              {tile.value ? (
                <div style={{ fontFamily: C.mono, fontSize: 24, fontWeight: 700, color: tile.valueColor, letterSpacing: "-0.02em", marginBottom: 8, textShadow: `0 0 16px ${tile.valueColor}44` }}>
                  {tile.value}
                </div>
              ) : (
                <div style={{ marginBottom: 8 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 10px", borderRadius: 100,
                    background: C.amberDim, border: `1px solid ${C.amberBorder}`, color: C.amber,
                    fontSize: 11, fontWeight: 700, fontFamily: C.mono,
                  }}>
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
                    {tile.pill}
                  </span>
                </div>
              )}
              <BarMeter value={tile.bar} max={tile.label === "Test Flakiness Index" ? 5 : 100} color={tile.barColor} />
              <div style={{ fontSize: 9, color: C.t3, marginTop: 6, lineHeight: 1.5 }}>{tile.sub}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — SELF-HEALING DIAGNOSTIC SUITE
        ══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Interactive Self-Healing Diagnostic Suite</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* Left — Defective */}
          <div style={{ background: C.surface, border: `1px solid ${C.redBorder}`, borderRadius: 12, overflow: "hidden", boxShadow: `0 4px 24px rgba(0,0,0,0.3)` }}>
            <div style={{ padding: "10px 14px", background: C.raised, borderBottom: `1px solid ${C.border1}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f56" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ffbd2e" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#27c93f" }} />
                </div>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.t3, marginLeft: 4 }}>coverage_assert.py</span>
              </div>
              <Pill color={C.red} border={C.redBorder} bg={C.redDim}>Defective</Pill>
            </div>
            <div style={{ padding: "8px 14px", background: "rgba(255,61,85,0.04)", borderBottom: `1px solid ${C.border0}`, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth={2.5} strokeLinecap="round">
                <circle cx={12} cy={12} r={10} /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.red }}>Incoming Defective Code State (Assertion Failure)</span>
            </div>
            {/* Error pill */}
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border0}` }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: 6,
                background: "#0e0408", border: `1px solid ${C.redBorder}`,
              }}>
                <Dot color={C.red} pulse />
                <span style={{ fontFamily: C.mono, fontSize: 11, color: C.red, fontWeight: 500 }}>
                  AssertionError: Expected 88.2% but got 76.0%
                </span>
              </div>
            </div>
            <div style={{ overflowX: "auto", padding: "10px 0" }}>
              {DEFECTIVE.map(l => <SyntaxLine key={l.ln} line={l} />)}
            </div>
            <div style={{ margin: "0 14px 14px", padding: "10px 12px", borderRadius: 6, background: "rgba(255,61,85,0.05)", border: `1px solid ${C.redBorder}` }}>
              <div style={{ fontSize: 9, color: C.red, fontWeight: 700, marginBottom: 4, letterSpacing: "0.08em" }}>STATIC ANALYSIS · LINE 9</div>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.t2, lineHeight: 1.65 }}>
                <span style={{ color: C.red }}>TypeError:</span> Operator{" "}
                <span style={{ color: C.amber }}>{">="}</span> applied to{" "}
                <span style={{ color: "#f07178" }}>str</span> vs{" "}
                <span style={{ color: "#f07178" }}>str</span> — lexicographic ordering yields{" "}
                <span style={{ color: C.red }}>True</span> for <span style={{ fontFamily: C.mono }}>"9" &gt;= "88.2"</span>
              </div>
            </div>
          </div>

          {/* Right — Patched */}
          <div style={{ background: C.surface, border: `1px solid ${C.emBorder}`, borderRadius: 12, overflow: "hidden", boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px ${C.emerald}08` }}>
            <div style={{ padding: "10px 14px", background: C.raised, borderBottom: `1px solid ${C.border1}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f56" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ffbd2e" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#27c93f" }} />
                </div>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.t3, marginLeft: 4 }}>coverage_assert.patch.py</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: C.mono, fontSize: 9, color: C.t3, background: C.elevated, padding: "1px 6px", borderRadius: 3, border: `1px solid ${C.border1}` }}>gemini-2.5-pro</span>
                <Pill color={C.emerald} border={C.emBorder} bg={C.emDim}>AI Patch</Pill>
              </div>
            </div>
            <div style={{ padding: "8px 14px", background: "rgba(0,232,122,0.03)", borderBottom: `1px solid ${C.border0}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth={2.5} strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.emerald }}>AI Regenerated Patch Script</span>
              </div>
              <span style={{ fontSize: 10, color: C.t3, fontFamily: C.mono }}>confidence 97.4% · +1 −1</span>
            </div>
            {/* Confidence indicator */}
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border0}` }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["Type Safety", "Logic Correct", "No API Change", "Regression Risk: Low"].map((t, i) => (
                  <span key={t} style={{
                    fontSize: 9, padding: "2px 7px", borderRadius: 4, fontWeight: 600,
                    background: C.emDim, color: C.emerald, border: `1px solid ${C.emBorder}`,
                  }}>✓ {t}</span>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto", padding: "10px 0" }}>
              {PATCHED.map(l => <SyntaxLine key={l.ln} line={l} />)}
            </div>
            <div style={{ margin: "0 14px 14px", padding: "10px 12px", borderRadius: 6, background: "rgba(0,232,122,0.04)", border: `1px solid ${C.emBorder}` }}>
              <div style={{ fontSize: 9, color: C.emerald, fontWeight: 700, marginBottom: 4, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx={12} cy={12} r={10} /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} /></svg>
                GEMINI RATIONALE
              </div>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.t2, lineHeight: 1.7, minHeight: 50 }}>
                {typed}
                <span style={{
                  display: typed.length < aiText.length ? "inline-block" : "none",
                  width: 1, height: 10, background: C.emerald, marginLeft: 1, verticalAlign: "middle",
                  animation: "pulseGlow 0.7s ease-in-out infinite alternate",
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — PR DEPLOYMENT GATEWAY
        ══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Automated PR Deployment Feedback Gateway</SectionLabel>
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Git Destination Integration Router</div>
              <div style={{ fontSize: 11, color: C.t3 }}>Select how the AI-generated patch is delivered to the repository.</div>
            </div>
            <span style={{
              fontSize: 10, fontFamily: C.mono, color: C.cyan,
              background: C.cyanDim, padding: "2px 8px", borderRadius: 4, border: `1px solid ${C.cyanBorder}`,
            }}>
              PR #412 · feature/api-refactor
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {([
              {
                key: "branch" as PrRoute,
                title: "Push Direct Patch Commit to Developer Branch",
                desc: "Auto-applies fixes directly to feature/api-refactor to re-trigger the CI/CD pipeline immediately. The corrected commit will be authored as the Gemini bot identity.",
                icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><line x1={6} y1={3} x2={6} y2={15} /><circle cx={18} cy={6} r={3} /><circle cx={6} cy={18} r={3} /><circle cx={6} cy={6} r={3} /><path d="M18 9a9 9 0 0 1-9 9" /></svg>,
                color: C.cyan,
                dim: C.cyanDim,
                border: C.cyanBorder,
                tag: "Automated",
              },
              {
                key: "comment" as PrRoute,
                title: "Submit as Inline GitHub PR Review Comment Thread",
                desc: "Generates a clean markdown suggestion block within PR #412 for manual developer review. The patch is embedded as a GitHub code suggestion — no direct commits.",
                icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
                color: C.mint,
                dim: C.mintDim,
                border: C.mintBorder,
                tag: "Manual Review",
              },
            ] as const).map(opt => (
              <button
                key={opt.key}
                onClick={() => setPrRoute(opt.key)}
                style={{
                  padding: 16, borderRadius: 10, textAlign: "left", cursor: "pointer",
                  background: prRoute === opt.key ? opt.dim : C.elevated,
                  border: `2px solid ${prRoute === opt.key ? opt.color + "55" : C.border1}`,
                  color: C.t1, transition: "all 0.18s ease",
                  boxShadow: prRoute === opt.key ? `0 0 0 1px ${opt.color}18, 0 4px 20px rgba(0,0,0,0.3)` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ color: prRoute === opt.key ? opt.color : C.t3 }}>{opt.icon}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, color: opt.color, fontWeight: 700, background: opt.dim, padding: "1px 6px", borderRadius: 3, border: `1px solid ${opt.border}` }}>
                      {opt.tag}
                    </span>
                    {/* Toggle ring */}
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      border: `2px solid ${prRoute === opt.key ? opt.color : C.border2}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {prRoute === opt.key && <div style={{ width: 7, height: 7, borderRadius: "50%", background: opt.color }} />}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: prRoute === opt.key ? opt.color : C.t1, marginBottom: 6, lineHeight: 1.3 }}>
                  {opt.title}
                </div>
                <div style={{ fontSize: 11, color: C.t3, lineHeight: 1.6 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 6 — POLYGLOT DATA GRID & EVENT STREAM
        ══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Polyglot Matrix Data Grid &amp; Event Stream Ledger</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* Left — Data Grid */}
          <div style={{ background: C.card, border: `1px solid ${C.border1}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border0}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth={2} strokeLinecap="round">
                  <rect x={3} y={3} width={18} height={18} rx={2} /><line x1={3} y1={9} x2={21} y2={9} /><line x1={3} y1={15} x2={21} y2={15} /><line x1={9} y1={3} x2={9} y2={21} />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Active Test Path Matrix</span>
              </div>
              <span style={{ fontSize: 10, color: C.t3, fontFamily: C.mono }}>{GRID_ROWS.length} frames</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border0}` }}>
                  {["Source Frame", "Reference Path", "Branch %", "GH Action"].map(h => (
                    <th key={h} style={{
                      padding: "8px 12px", textAlign: "left", fontSize: 9,
                      fontWeight: 700, color: C.t3, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRID_ROWS.map(row => (
                  <tr
                    key={row.id}
                    className="row-hov"
                    onMouseEnter={() => setHovRow(row.id)}
                    onMouseLeave={() => setHovRow(null)}
                    style={{ borderBottom: `1px solid ${C.border0}`, transition: "background 0.1s ease", cursor: "default" }}
                  >
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontFamily: C.mono, fontSize: 10, color: C.cyan, fontWeight: 500 }}>{row.source.split(" ")[0]}</div>
                      <div style={{ fontSize: 9, color: C.t3 }}>{row.source.split(" ").slice(1).join(" ")}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontFamily: C.mono, fontSize: 9, color: C.t2, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                        {row.refPath}
                      </span>
                      <span style={{ fontSize: 9, color: C.t3, fontFamily: C.mono }}>{row.commit}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 40, height: 3, background: C.border1, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${row.branchDepth}%`, height: "100%", background: row.branchDepth >= 90 ? C.emerald : row.branchDepth >= 80 ? C.amber : C.red, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, color: row.branchDepth >= 90 ? C.emerald : row.branchDepth >= 80 ? C.amber : C.red }}>
                          {row.branchDepth}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right — JSON Stream */}
          <div style={{ background: C.card, border: `1px solid ${C.border1}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{
              padding: "10px 14px", background: C.surface, borderBottom: `1px solid ${C.border0}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f56" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ffbd2e" }} />
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#27c93f" }} />
                </div>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.t3 }}>Standardized JSON Payload Pipeline Output</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: C.emerald, fontFamily: C.mono }}>
                <Dot color={C.emerald} pulse />
                STREAMING · {logs.length} events
              </div>
            </div>
            <div ref={logRef} style={{ flex: 1, padding: 12, overflowY: "auto", maxHeight: 340, fontFamily: C.mono, fontSize: 10 }}>
              {logs.map((entry, i) => (
                <div key={`${entry.traceId}-${i}`} style={{
                  marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${C.border0}`,
                  animation: i === 0 ? "logEntry 0.25s ease" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ color: C.t4 }}>{entry.time}</span>
                    <span style={{
                      padding: "1px 5px", borderRadius: 3, fontSize: 9, fontWeight: 700,
                      background: entry.status === "SUCCESS" || entry.status === "DELIVERED" ? C.emDim
                        : entry.status === "FAIL" ? C.redDim
                        : entry.status === "WARN" ? C.amberDim : C.cyanDim,
                      color: entry.status === "SUCCESS" || entry.status === "DELIVERED" ? C.emerald
                        : entry.status === "FAIL" ? C.red
                        : entry.status === "WARN" ? C.amber : C.cyan,
                    }}>{entry.status}</span>
                    <span style={{ color: C.cyan, fontWeight: 600 }}>{entry.event}</span>
                    <span style={{ color: C.t4 }}>· {entry.traceId}</span>
                  </div>
                  <pre style={{
                    margin: 0, padding: "6px 10px", borderRadius: 5,
                    background: C.raised, border: `1px solid ${C.border0}`,
                    color: C.t2, fontSize: 10, overflowX: "auto", whiteSpace: "pre-wrap",
                  }}>
                    <span style={{ color: C.t4 }}>{"{"}</span>
                    {Object.entries(entry.payload).map(([k, v], idx, arr) => (
                      <span key={k}>
                        {"\n  "}
                        <span style={{ color: C.cyan }}>"{k}"</span>
                        <span style={{ color: C.t4 }}>: </span>
                        <span style={{ color: typeof v === "boolean" ? C.emerald : typeof v === "number" ? C.amber : typeof v === "string" && v.startsWith("http") ? C.violet : C.t1 }}>
                          {typeof v === "string" ? `"${v}"` : String(v)}
                        </span>
                        {idx < arr.length - 1 && <span style={{ color: C.t4 }}>,</span>}
                      </span>
                    ))}
                    {"\n"}
                    <span style={{ color: C.t4 }}>{"}"}</span>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 7 — LEAD COMMITMENT FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer style={{
        background: C.surface, borderTop: `1px solid ${C.border1}`,
        padding: "14px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 16, flexShrink: 0, flexWrap: "wrap",
      }}>
        {/* Left — Status notice */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: C.amberDim, border: `1px solid ${C.amberBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth={2.5} strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2={12.01} y2={17} />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 1 }}>
              ⚠️ System Notification: Token Threshold Requires Lead Verification
            </div>
            <div style={{ fontSize: 10, color: C.t3, fontFamily: C.mono }}>
              Persona: <span style={{ color: personaColor[persona] }}>{persona}</span> · Route: <span style={{ color: prRoute === "branch" ? C.cyan : C.mint }}>{prRoute === "branch" ? "Direct Branch Push" : "PR Comment Thread"}</span> · PR #412
            </div>
          </div>
        </div>

        {/* Center — Reviewer */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: C.t3 }}>Pending lead approval from</span>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 800, color: "#fff",
          }}>SR</div>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.t2 }}>S. Ramirez, Lead Eng.</span>
        </div>

        {/* Right — Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="hov-btn"
            onClick={() => setRejected(true)}
            disabled={approved || rejected}
            style={{
              padding: "9px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: "transparent", border: `1px solid ${rejected ? C.redBorder : C.border2}`,
              color: rejected ? C.red : C.t2, cursor: approved || rejected ? "not-allowed" : "pointer",
              transition: "all 0.15s ease", opacity: approved ? 0.35 : 1,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
            </svg>
            {rejected ? "Flagged as Flaky" : "Reject & Flag Flaky Test"}
          </button>

          <button
            className="hov-btn"
            onClick={handleApprove}
            disabled={approving || approved || rejected}
            style={{
              padding: "9px 20px", borderRadius: 8, fontSize: 12, fontWeight: 800,
              background: approved
                ? C.emDim
                : `linear-gradient(135deg, ${C.cyan}cc, #0088bb)`,
              border: `1px solid ${approved ? C.emBorder : C.cyanBorder}`,
              color: approved ? C.emerald : "#001824",
              cursor: approving || approved || rejected ? "not-allowed" : "pointer",
              transition: "all 0.2s ease", opacity: rejected ? 0.35 : 1,
              boxShadow: approved ? `0 0 20px ${C.emerald}44` : approving ? "none" : `0 0 24px ${C.cyan}44, 0 4px 16px rgba(0,0,0,0.35)`,
              display: "flex", alignItems: "center", gap: 7,
            }}
          >
            {approving ? (
              <>
                <span style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Pushing to GitHub…
              </>
            ) : approved ? (
              <>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                Patch Pushed · PR #412
              </>
            ) : (
              <>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Lead Approve &amp; Push Patch to GitHub
              </>
            )}
          </button>
        </div>
      </footer>

      {/* ── Success modal ── */}
      {approved && (
        <div onClick={() => setApproved(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 200, animation: "fadeIn 0.2s ease",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.card, border: `1px solid ${C.emBorder}`,
            borderRadius: 16, padding: 40, maxWidth: 440, width: "90%", textAlign: "center",
            boxShadow: `0 0 80px ${C.emerald}18, 0 32px 64px rgba(0,0,0,0.7)`,
            animation: "slideUp 0.3s ease",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: C.emDim, border: `2px solid ${C.emBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", boxShadow: `0 0 28px ${C.emerald}44`,
            }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth={2.5} strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Patch Successfully Deployed</h2>
            <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.6, marginBottom: 20 }}>
              AI-generated fix committed to{" "}
              <span style={{ color: C.amber, fontFamily: C.mono, fontSize: 12 }}>feature/api-refactor</span>
              {" "}via <span style={{ color: prRoute === "branch" ? C.cyan : C.mint, fontFamily: C.mono, fontSize: 12 }}>{prRoute === "branch" ? "direct push" : "PR review comment"}</span>.
              CI pipeline re-triggered automatically.
            </p>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.t3, padding: "8px 14px", background: C.surface, borderRadius: 6, border: `1px solid ${C.border1}`, marginBottom: 20 }}>
              github.com/org/repo/pull/412 · commit a9f3d22
            </div>
            <button onClick={() => { setApproved(false); setRejected(false) }} style={{
              padding: "9px 24px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: C.elevated, border: `1px solid ${C.border2}`, color: C.t1, cursor: "pointer",
            }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
