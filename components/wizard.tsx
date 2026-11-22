"use client";

import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import {
  ANA_LINES,
  ANS,
  DEMO_EX,
  DEMO_Q,
  EXF,
  EXP,
  FIELDS,
  HOW,
  IV_STRUCTURE,
  RESP,
  ROLETYPES,
  SK,
  SKM,
  STAGES,
  STUDY,
  USER_TEXT,
  VALUES,
  YEARS,
  aiInput,
  clean,
  clearSaved,
  computeSelected,
  fallback,
  freshData,
  loadByEmail,
  loadSaved,
  mergeAi,
  progressOf,
  writeSaved,
  type Decision,
  type Persisted,
} from "@/lib/model";
import { Aurora, Count, Decrypt, FxLayer, Reveal, SplitText, burstConfetti } from "@/components/fx";

type State = Persisted & {
  vis: boolean;
  err: Record<string, boolean>;
  studyFocus: boolean;
  anaI: number;
  anaPct: number;
  editing: string | null;
  draft: string;
  busy: string | null;
  toast: string;
  login: boolean;
  found: Persisted | null;
  saved: Persisted | null;
  nameErr: boolean;
  emailErr: boolean;
};

type TextKey = "study" | "fullName" | "email" | "fieldOther" | "role" | "valuesOther" | "desc" | "tasks" | "challengeText";
type ListKey = "fields" | "values" | "roleTypes" | "resp";
type OneKey = "year" | "exp" | "challenge";

type Api = {
  state: State;
  commit: (recipe: (s: State) => State) => void;
  next: () => void;
  back: () => void;
  fillDemo: () => void;
  flash: (t: string) => void;
  start: () => void;
  closeLogin: () => void;
  submitLogin: (e: FormEvent) => void;
  resume: () => void;
  resumeFound: () => void;
  startFresh: () => void;
  restart: () => void;
  printPdf: () => void;
  editAnswers: () => void;
  setQuiz: (k: string, v: number) => void;
  toggleIn: (key: ListKey, v: string) => void;
  pickOne: (key: OneKey, v: string) => void;
  setField: (key: TextKey, value: string) => void;
  setEx: (f: string, value: string) => void;
  decide: (k: string, v: Decision) => void;
  toggleRoleUnknown: () => void;
  setTab: (tab: "cv" | "iv") => void;
  openStudy: () => void;
  closeStudy: () => void;
  pickStudy: (label: string) => void;
  altText: (key: string, cur: string, alt: string, target: string) => void;
  orig: Record<string, string>;
};

const Ctx = createContext<Api | null>(null);

function useW() {
  const v = useContext(Ctx);
  if (!v) throw new Error("wizard context missing");
  return v;
}

function freshState(): State {
  return {
    ...freshData(),
    vis: true,
    err: {},
    studyFocus: false,
    anaI: 0,
    anaPct: 0,
    editing: null,
    draft: "",
    busy: null,
    toast: "",
    login: false,
    found: null,
    saved: null,
    nameErr: false,
    emailErr: false,
  };
}

function pick(s: State): Persisted {
  return {
    email: s.email,
    fullName: s.fullName,
    step: s.step,
    qi: s.qi,
    si: s.si,
    study: s.study,
    year: s.year,
    fields: s.fields,
    fieldOther: s.fieldOther,
    role: s.role,
    roleUnknown: s.roleUnknown,
    exp: s.exp,
    values: s.values,
    valuesOther: s.valuesOther,
    roleTypes: s.roleTypes,
    desc: s.desc,
    tasks: s.tasks,
    resp: s.resp,
    challenge: s.challenge,
    challengeText: s.challengeText,
    quiz: s.quiz,
    ex: s.ex,
    selected: s.selected,
    result: s.result,
    decisions: s.decisions,
    edits: s.edits,
    tab: s.tab,
    usedFallback: s.usedFallback,
  };
}

function useApi(): Api {
  const [state, setState] = useState<State>(freshState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const goTimer = useRef<number | null>(null);
  const anaTimer = useRef<number | null>(null);
  const anaTick = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const orig = useRef<Record<string, string>>({});

  const commit = (recipe: (s: State) => State) => {
    const n = recipe(stateRef.current);
    stateRef.current = n;
    setState(n);
  };

  const go = (patch: Partial<State>) => {
    if (goTimer.current) window.clearTimeout(goTimer.current);
    commit((s) => ({ ...s, vis: false }));
    goTimer.current = window.setTimeout(() => {
      commit((s) => ({ ...s, ...patch, vis: true, err: {}, editing: null }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 170);
  };

  function flash(t: string) {
    commit((p) => ({ ...p, toast: t }));
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => commit((p) => ({ ...p, toast: "" })), 1800);
  }

  async function analyze() {
    const s = stateRef.current;
    const t0 = Date.now();
    go({ step: 8, anaI: 0, anaPct: 0 });
    if (anaTick.current) window.clearInterval(anaTick.current);
    anaTick.current = window.setInterval(() => {
      const t = Date.now() - t0;
      commit((p) => ({
        ...p,
        anaI: t > 9000 ? 2 : t > 3000 ? 1 : 0,
        anaPct: Math.round(92 * (1 - Math.exp(-t / 9000))),
      }));
    }, 400);
    const base = fallback(s);
    let result = base;
    let usedFallback = true;
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "analyze", input: aiInput(s) }),
      });
      if (res.ok) {
        const merged = mergeAi(base, (await res.json()).data);
        if (merged) {
          result = merged;
          usedFallback = false;
        }
      }
    } catch {
      /* fall back to templates */
    }
    if (anaTimer.current) window.clearTimeout(anaTimer.current);
    anaTimer.current = window.setTimeout(() => {
      if (anaTick.current) window.clearInterval(anaTick.current);
      if (stateRef.current.step !== 8) return;
      commit((p) => ({ ...p, anaI: 3, anaPct: 100 }));
      anaTimer.current = window.setTimeout(() => {
        if (stateRef.current.step !== 8) return;
        go({ step: 9, result, usedFallback, decisions: {}, edits: {} });
      }, 900);
    }, Math.max(0, 2400 - (Date.now() - t0)));
  }

  function next() {
    const s = stateRef.current;
    const err: Record<string, boolean> = {};
    if (s.step === 1) {
      if (!s.study.trim()) err.study = true;
      if (!s.year) err.year = true;
    }
    if (s.step === 4) {
      if (!s.roleTypes.length) err.roleType = true;
      if (s.desc.trim().length < 20) err.desc = true;
    }
    if (s.step === 7 && s.selected.length) {
      const k = s.selected[s.si];
      if (k && !clean(s.ex[k]?.did)) err.did = true;
    }
    if (s.step === 9 && !s.selected.some((k) => (s.decisions[k] || "ok") === "ok")) err.review = true;
    if (Object.keys(err).length) {
      commit((p) => ({ ...p, err }));
      return;
    }
    if (s.step === 6) {
      if (s.qi < SK.length - 1) return go({ qi: s.qi + 1 });
      return go({ step: 7, si: 0, selected: computeSelected(s.quiz) });
    }
    if (s.step === 7) {
      if (s.si < s.selected.length - 1) return go({ si: s.si + 1 });
      return analyze();
    }
    if (s.step === 9) {
      go({ step: 10, tab: "cv" });
      window.setTimeout(() => burstConfetti(), 420);
      return;
    }
    go({ step: s.step + 1, ...(s.step === 5 ? { qi: 0 } : {}) });
  }

  function back() {
    const s = stateRef.current;
    if (s.step === 6 && s.qi > 0) return go({ qi: s.qi - 1 });
    if (s.step === 7 && s.si > 0) return go({ si: s.si - 1 });
    if (s.step === 7) return go({ step: 6, qi: SK.length - 1 });
    if (s.step === 9) return go({ step: 7, si: Math.max(0, s.selected.length - 1) });
    go({ step: Math.max(0, s.step - 1) });
  }

  function fillDemo() {
    const s = stateRef.current;
    if (s.step === 1) commit((p) => ({ ...p, study: "מנהל עסקים", year: "שנה ג'", err: {} }));
    if (s.step === 2) commit((p) => ({ ...p, fields: ["ייעוץ וניהול"], role: "רכז/ת פרויקטים", roleUnknown: false }));
    if (s.step === 3) commit((p) => ({ ...p, exp: EXP[1], values: ["למידה והתפתחות", "עבודת צוות", "אתגר מקצועי"] }));
    if (s.step === 4) commit((p) => ({ ...p, roleTypes: ["תיאום", "מטה"], desc: USER_TEXT, err: {} }));
    if (s.step === 5)
      commit((p) => ({
        ...p,
        tasks: "ריכוז המשימות שהגיעו לצוותים, חלוקת עבודה בין אנשי הצוות, מעקב אחר ההתקדמות ועדכון הגורמים הרלוונטיים.",
        resp: ["משימות", "תיאום בין גורמים", "אנשים"],
        challenge: "כן",
        challengeText: "משימות דחופות שהגיעו במקביל ושינויים בתוכניות בהתראה קצרה.",
      }));
    if (s.step === 6) {
      const k = SK[s.qi]?.k;
      if (!k) return;
      commit((p) => ({ ...p, quiz: { ...p.quiz, [k]: DEMO_Q[k] } }));
      window.setTimeout(() => next(), 250);
    }
    if (s.step === 7) {
      const k = s.selected[s.si];
      if (k) commit((p) => ({ ...p, err: {}, ex: { ...p.ex, [k]: { ...(DEMO_EX[k] || DEMO_EX.prio) } } }));
    }
  }

  useEffect(() => {
    const saved = loadSaved();
    if (saved) commit((p) => ({ ...p, saved }));
    return () => {
      if (goTimer.current) window.clearTimeout(goTimer.current);
      if (anaTimer.current) window.clearTimeout(anaTimer.current);
      if (anaTick.current) window.clearInterval(anaTick.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
    // mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.step > 0) writeSaved(pick(state));
  }, [state]);

  return {
    state,
    commit,
    next,
    back,
    fillDemo,
    flash,
    orig: orig.current,
    start: () => go({ login: true, found: null, emailErr: false }),
    closeLogin: () => go({ login: false, found: null, emailErr: false }),
    submitLogin: (e) => {
      e.preventDefault();
      const s = stateRef.current;
      const em = (s.email || "").trim().toLowerCase();
      const nm = (s.fullName || "").trim();
      const nameErr = nm.split(/\s+/).length < 2;
      const emailErr = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
      if (nameErr || emailErr) {
        commit((p) => ({ ...p, nameErr, emailErr }));
        return;
      }
      const sv = loadByEmail(em);
      if (sv) {
        commit((p) => ({ ...p, found: sv, email: em, emailErr: false, nameErr: false }));
        return;
      }
      clearSaved();
      go({ ...freshData(), saved: null, login: false, found: null, email: em, fullName: nm, step: 1 });
    },
    resume: () => {
      const sv = stateRef.current.saved;
      if (!sv) return;
      go({ ...freshData(), ...sv, saved: null, login: false, found: null, step: sv.step === 8 ? 7 : sv.step });
    },
    resumeFound: () => {
      const s = stateRef.current;
      const sv = s.found;
      if (!sv) return;
      go({
        ...freshData(),
        ...sv,
        saved: null,
        login: false,
        found: null,
        email: s.email,
        fullName: (s.fullName || "").trim() || sv.fullName,
        step: sv.step === 8 ? 7 : sv.step,
      });
    },
    startFresh: () => {
      const s = stateRef.current;
      clearSaved(s.email);
      go({ ...freshData(), saved: null, login: false, found: null, email: s.email, fullName: (s.fullName || "").trim(), step: 1 });
    },
    restart: () => {
      const email = stateRef.current.email;
      clearSaved(email);
      go({ ...freshState(), saved: null, login: false, found: null, toast: "" });
    },
    printPdf: () => window.print(),
    editAnswers: () => go({ step: 1 }),
    setQuiz: (k, v) => {
      const qi = stateRef.current.qi;
      commit((p) => ({ ...p, quiz: { ...p.quiz, [k]: v } }));
      window.setTimeout(() => {
        const s = stateRef.current;
        if (s.step === 6 && s.qi === qi) next();
      }, 280);
    },
    toggleIn: (key, v) =>
      commit((p) => ({
        ...p,
        [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v],
        err: {},
      })),
    pickOne: (key, v) => commit((p) => ({ ...p, [key]: v, err: { ...p.err, [key]: false } })),
    setField: (key, value) =>
      commit((p) => {
        const err = { ...p.err };
        if (key === "study" || key === "desc") err[key] = false;
        return {
          ...p,
          [key]: value,
          err,
          nameErr: key === "fullName" ? false : p.nameErr,
          emailErr: key === "email" ? false : p.emailErr,
        };
      }),
    setEx: (f, value) => {
      const s = stateRef.current;
      const k = s.selected[s.si];
      if (!k) return;
      commit((p) => ({ ...p, err: {}, ex: { ...p.ex, [k]: { ...(p.ex[k] || {}), [f]: value } } }));
    },
    decide: (k, v) => commit((p) => ({ ...p, err: {}, decisions: { ...p.decisions, [k]: v } })),
    toggleRoleUnknown: () => commit((p) => ({ ...p, roleUnknown: !p.roleUnknown })),
    setTab: (tab) => commit((p) => ({ ...p, tab, editing: null })),
    openStudy: () => commit((p) => ({ ...p, studyFocus: true })),
    closeStudy: () => window.setTimeout(() => commit((p) => ({ ...p, studyFocus: false })), 120),
    pickStudy: (label) => commit((p) => ({ ...p, study: label, studyFocus: false, err: { ...p.err, study: false } })),
    altText: async (key, cur, alt, target) => {
      commit((p) => ({ ...p, busy: key }));
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "rephrase", text: cur, target }),
        });
        const text = res.ok ? ((await res.json()).text as string | undefined) : undefined;
        if (text) {
          commit((p) => ({ ...p, busy: null, edits: { ...p.edits, [key]: text } }));
          flash("נוצר ניסוח חלופי");
          return;
        }
      } catch {
        /* fall back to the stored alternative */
      }
      const base = orig.current[key] || alt;
      commit((p) => ({ ...p, busy: null, edits: { ...p.edits, [key]: cur === alt ? base : alt } }));
      flash("נוצר ניסוח חלופי");
    },
  };
}

function spot(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

function Clock() {
  return (
    <svg className="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3C5896" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function Warn({ color = "#9FD3FF" }: { color?: string }) {
  return (
    <svg className="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden style={{ marginTop: 2 }}>
      <path d="M12 3l9 16H3z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3C5896" strokeWidth="2" aria-hidden style={{ marginTop: 2 }}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1481E2" strokeWidth="2" aria-hidden style={{ marginTop: 3 }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" />
    </svg>
  );
}

function Chip({ on, onClick, children, r10 }: { on: boolean; onClick: () => void; children?: ReactNode; r10?: boolean }) {
  return (
    <button type="button" aria-pressed={on} className={`chip${on ? " on" : ""}${r10 ? " r10" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Choice({ on, onClick, children, quiz }: { on: boolean; onClick: () => void; children: ReactNode; quiz?: boolean }) {
  return (
    <button type="button" role="radio" aria-checked={on} className={`choice${on ? " on" : ""}${quiz ? " quiz" : ""}`} onClick={onClick}>
      <span className="dot" style={{ width: quiz ? 22 : 20, height: quiz ? 22 : 20 }}>
        <i style={{ width: quiz ? 11 : 10, height: quiz ? 11 : 10 }} />
      </span>
      {children}
    </button>
  );
}

function Mark({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <Chip r10 on={on} onClick={onClick}>
      <span className="mk">{on ? "✓" : "+"}</span>
      {label}
    </Chip>
  );
}

function Editable({
  id,
  text,
  alt,
  target = "",
  tone,
  lead,
  tall,
}: {
  id: string;
  text: string;
  alt?: string;
  target?: string;
  tone: "dark" | "light";
  lead?: boolean;
  tall?: boolean;
}) {
  const { state, commit, flash, altText, orig } = useW();
  orig[id] = text;
  const val = state.edits[id] ?? text;
  const editing = state.editing === id;
  return (
    <>
      {editing ? (
        <textarea
          className={`edit-area ${tone}${tall ? " tall" : ""}`}
          aria-label="עריכה"
          value={state.draft}
          onChange={(e) => commit((p) => ({ ...p, draft: e.target.value }))}
        />
      ) : (
        <p className={lead ? "lead-p" : undefined}>{val}</p>
      )}
      <div className="inline-actions noprint">
        {editing ? (
          <>
            <button type="button" className={`text-btn ${tone}`} onClick={() => commit((p) => ({ ...p, editing: null, edits: { ...p.edits, [id]: p.draft } }))}>
              שמירה
            </button>
            <button type="button" className={`text-btn ${tone}`} onClick={() => commit((p) => ({ ...p, editing: null }))}>
              ביטול
            </button>
          </>
        ) : (
          <>
            <button type="button" className={`text-btn ${tone}`} onClick={() => commit((p) => ({ ...p, editing: id, draft: val }))}>
              עריכה
            </button>
            <button
              type="button"
              className={`text-btn ${tone}`}
              onClick={() => {
                try {
                  void navigator.clipboard.writeText(val);
                } catch {
                  /* ignore */
                }
                flash("הועתק");
              }}
            >
              העתקה
            </button>
            {alt ? (
              <button type="button" className={`text-btn ${tone}`} disabled={state.busy === id} onClick={() => altText(id, val, alt, target)}>
                {state.busy === id ? "יוצר ניסוח…" : "ניסוח חלופי"}
              </button>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

function Welcome() {
  const { state, start, resume } = useW();
  return (
    <section>
      <div className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-text">
              <h1 className="h1">
                <SplitText text="מהניסיון במילואים" accent="ליתרון בקריירה" delay={120} stagger={90} shiny />
              </h1>
              <Reveal i={6}>
                <p className="lead">
                  ייתכן שבתקופת המילואים החמצת הזדמנויות מקצועיות. במקביל, צברת ניסיון ותרגלת יכולות שעשויות להיות רלוונטיות לעולם העבודה. נעזור לך לזהות אותן, לנסח אותן לקורות החיים ולהתכונן לראיונות.
                </p>
              </Reveal>
            </div>
            <Reveal i={8}>
              <div className="cta-row">
                <span className="glow">
                  <button type="button" className="btn btn-lg btn-navy" onClick={start}>
                    מתחילים <span aria-hidden="true">←</span>
                  </button>
                </span>
                {state.saved ? (
                  <button type="button" className="btn-outline" onClick={resume}>
                    להמשיך מאיפה שעצרתי
                  </button>
                ) : null}
                <span className="mins">
                  <Clock />
                  כ־10–15 דקות
                </span>
              </div>
            </Reveal>
          </div>
          <div className="hero-icon" aria-hidden>
            <Reveal i={3} y={80} dur={1100} className="hero-icon-inner">
              <img src="/icon.png" alt="" />
            </Reveal>
          </div>
        </div>
        <div className="note" role="note">
          <div className="note-inner">
            <Warn />
            <p>
              <strong>חשוב:</strong> אין להזין מידע מסווג, פרטים מבצעיים או פרטים מזהים על אנשים אחרים. מספיק לתאר את סוג המשימות והאחריות שלך.
            </p>
          </div>
        </div>
      </div>
      <div className="landing">
        <div className="block" id="how">
          <Reveal>
            <div className="block-head">
              <span className="kicker">איך זה עובד</span>
              <h2 className="h2">חמישה שלבים קצרים, מהשירות ועד לניסוח מוכן</h2>
            </div>
          </Reveal>
          <div className="how">
            {HOW.map(([n, t, d], i) => (
              <Reveal key={n} i={i + 1} className={`how-item${i === 4 ? " last" : ""}`}>
                <span className="num">{n}</span>
                <strong>{t}</strong>
                <span>{d}</span>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="block" id="get">
          <Reveal>
            <div className="block-head">
              <span className="kicker">מה מקבלים בסוף</span>
              <h2 className="h2">הניסיון שלך בשפה שמעסיקים מבינים</h2>
            </div>
          </Reveal>
          <div className="cards">
            <Reveal i={1}>
              <article className="card">
                <div className="stack">
                  <span className="card-k">תוצר ראשון</span>
                  <h3>קורות החיים שלי</h3>
                </div>
                <div className="sample">
                  <strong>ניהול ותעדוף משימות</strong>
                  <p>
                    <span style={{ fontWeight: 600, color: "#1E2E53" }}>מה עשית: </span>
                    תיאום משימות בין גורמים שונים תוך התמודדות עם אילוצים משתנים.
                  </p>
                  <p className="line">״תיאום והובלת משימות מול מספר גורמים, תוך תעדוף פעילות, התאמה לשינויים ועמידה בלוחות זמנים.״</p>
                </div>
                <p className="fine">לכל מיומנות: מה תיארת שעשית, מה זה אומר בשפה מקצועית, למה זה רלוונטי לתפקיד וניסוח מוצע לקורות החיים.</p>
              </article>
            </Reveal>
            <Reveal i={2}>
              <article className="card-dark">
                <div className="glow-blob" aria-hidden />
                <div className="stack">
                  <span className="card-k">תוצר שני</span>
                  <h3>הכנה לראיון</h3>
                </div>
                <p className="ask">״מה מהניסיון שלך במילואים יכול לסייע לך בתפקיד הזה?״</p>
                <div className="pills">
                  {["מה היה המצב", "מה עשיתי", "מה קרה בעקבות זה", "מה למדתי"].map((p) => (
                    <span key={p} className="pill">
                      {p}
                    </span>
                  ))}
                </div>
                <p className="fine">שאלות ראיון אפשריות ותשובות מוצעות שמבוססות רק על מה שסיפרת. כלי הכנה, לא טקסט לשינון.</p>
              </article>
            </Reveal>
          </div>
        </div>
        <div className="feature" id="principles">
          <Reveal i={1} y={60} dur={1000}>
            <div className="portrait">
              <img src="/illus-principles.svg" alt="" />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <div className="block-head">
                <span className="kicker">העיקרון שלנו</span>
                <h2 className="h2">רק מה שבאמת עשית</h2>
              </div>
            </Reveal>
            <div className="rules">
              <Reveal i={1}>
                <div className="rule">
                  <strong>לא לפי שם התפקיד</strong>
                  <span>מיומנות נקבעת לפי מה שתיארת שעשית, לא לפי התפקיד הצבאי.</span>
                </div>
              </Reveal>
              <Reveal i={2}>
                <div className="rule">
                  <strong>בלי להמציא</strong>
                  <span>לא נוסיף הישגים, תוצאות או מספרים שלא אמרת.</span>
                </div>
              </Reveal>
              <Reveal i={3}>
                <div className="rule">
                  <strong>בשפה אזרחית</strong>
                  <span>ניסוחים שמעסיקים מבינים, בלי מונחים צבאיים.</span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
        <Reveal y={60} dur={1000}>
          <div className="band">
            <div className="band-photo">
              <img src="/illus-band.svg" alt="" />
            </div>
            <div className="band-scrim" aria-hidden />
            <div className="band-copy">
              <div className="band-copy-inner">
                <div className="stack">
                  <h2>מוכנים להתחיל?</h2>
                  <span className="mins-light">כ־10–15 דקות · נשמר אוטומטית</span>
                </div>
                <button type="button" className="btn btn-lg btn-white" onClick={start}>
                  מתחילים <span aria-hidden="true">←</span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Login() {
  const { state, setField, submitLogin, closeLogin, resumeFound, startFresh } = useW();
  const greet = state.found?.fullName ? ", " + state.found.fullName.trim().split(/\s+/)[0] : "";
  return (
    <section className="login-wrap">
      <form className="login-card" onSubmit={submitLogin} noValidate>
        <div className="intro">
          <h2 className="h-login">רגע לפני שמתחילים</h2>
          <p className="sub">נשמור את התשובות שלך כדי שתוכל/י לחזור ולהמשיך מאיפה שעצרת.</p>
        </div>
        {!state.found ? (
          <>
            <div className="stack">
              <label className="lbl" htmlFor="login-name">
                שם מלא
              </label>
              <input id="login-name" className={`field${state.nameErr ? " bad" : ""}`} autoComplete="name" value={state.fullName} aria-invalid={state.nameErr} onChange={(e) => setField("fullName", e.target.value)} />
              {state.nameErr ? (
                <span className="alert login" role="alert">
                  נא להזין שם מלא
                </span>
              ) : null}
            </div>
            <div className="stack">
              <label className="lbl" htmlFor="login-email">
                כתובת מייל
              </label>
              <input id="login-email" className={`field ltr${state.emailErr ? " bad" : ""}`} type="email" dir="ltr" autoComplete="email" placeholder="name@example.com" value={state.email} aria-invalid={state.emailErr} onChange={(e) => setField("email", e.target.value)} />
              {state.emailErr ? (
                <span className="alert login" role="alert">
                  נא להזין כתובת מייל תקינה
                </span>
              ) : null}
            </div>
            <div className="stack-lg stack">
              <button type="submit" className="btn btn-md btn-navy">
                ממשיכים <span aria-hidden="true">←</span>
              </button>
              <span className="legal">השם והמייל משמשים רק לשמירת התשובות. לא נשלח דיוור.</span>
            </div>
          </>
        ) : (
          <>
            <div className="found">
              <strong>מצאנו תשובות שמורות{greet}</strong>
              <span dir="ltr">{state.email}</span>
            </div>
            <div className="stack">
              <button type="button" className="btn btn-md btn-navy" onClick={resumeFound}>
                להמשיך מאיפה שעצרתי
              </button>
              <button type="button" className="btn-outline-md" onClick={startFresh}>
                להתחיל מחדש
              </button>
            </div>
          </>
        )}
        <button type="button" className="linkish" onClick={closeLogin}>
          חזרה לעמוד הראשי
        </button>
      </form>
    </section>
  );
}

function Side({ title, text }: { title: string; text: string }) {
  return (
    <div className="side">
      <h2 className="h2 h2-sm">
        <SplitText text={title} />
      </h2>
      <p className="sub">{text}</p>
    </div>
  );
}

function Intro1() {
  const { state, setField, openStudy, closeStudy, pickStudy, pickOne } = useW();
  const q = state.study.trim();
  const matches = (q ? STUDY.filter((x) => x.includes(q)) : STUDY).slice(0, 7);
  const open = state.studyFocus && matches.length > 0 && !STUDY.includes(state.study);
  return (
    <section className="form">
      <Side title="בואו נכיר קצת" text="כדי שנוכל להתאים את התהליך אליך, נתחיל בכמה שאלות קצרות." />
      <div className="maincol">
        <div className="field-wrap">
          <label className="lbl" htmlFor="study">
            מהו תחום הלימודים שלך?
          </label>
          <input id="study" className={`field${state.err.study ? " bad" : ""}`} value={state.study} autoComplete="off" placeholder="חיפוש או הקלדה חופשית" aria-invalid={!!state.err.study} onChange={(e) => setField("study", e.target.value)} onFocus={openStudy} onBlur={closeStudy} />
          {open ? (
            <div className="listbox" role="listbox">
              {matches.map((label) => (
                <button key={label} type="button" role="option" onMouseDown={(e) => { e.preventDefault(); pickStudy(label); }}>
                  {label}
                </button>
              ))}
            </div>
          ) : null}
          {state.err.study ? (
            <div className="alert" role="alert">
              יש לבחור או להקליד תחום לימודים
            </div>
          ) : null}
        </div>
        <fieldset>
          <legend className="gap">באיזו שנת לימודים את/ה?</legend>
          <div className="chips">
            {YEARS.map((y) => (
              <Chip key={y} on={state.year === y} onClick={() => pickOne("year", y)}>
                {y}
              </Chip>
            ))}
          </div>
          {state.err.year ? (
            <div className="alert" role="alert">
              יש לבחור שנת לימודים
            </div>
          ) : null}
        </fieldset>
      </div>
    </section>
  );
}

function Intro2() {
  const { state, toggleIn, setField, toggleRoleUnknown } = useW();
  return (
    <section className="form">
      <Side title="לאן תרצה להגיע?" text="גם כיוון כללי מספיק. אפשר לעדכן בהמשך." />
      <div className="maincol">
        <fieldset>
          <legend className="gap">באיזה תחום תרצה להשתלב?</legend>
          <div className="chips">
            {FIELDS.map((f) => (
              <Chip key={f} r10 on={state.fields.includes(f)} onClick={() => toggleIn("fields", f)}>
                {f}
              </Chip>
            ))}
          </div>
          {state.fields.includes("אחר") ? (
            <input className="field" value={state.fieldOther} aria-label="תחום אחר" placeholder="איזה תחום?" onChange={(e) => setField("fieldOther", e.target.value)} />
          ) : null}
        </fieldset>
        <div className="field-wrap">
          <label className="lbl" htmlFor="role">
            האם יש תפקיד ספציפי שמעניין אותך? <span className="opt">(לא חובה)</span>
          </label>
          <input id="role" className="field" value={state.role} disabled={state.roleUnknown} placeholder="למשל: רכז/ת פרויקטים, Data Analyst" onChange={(e) => setField("role", e.target.value)} />
          <label className="check">
            <input type="checkbox" checked={state.roleUnknown} onChange={toggleRoleUnknown} />
            עוד לא יודע/ת, וזה בסדר גמור
          </label>
        </div>
      </div>
    </section>
  );
}

function Intro3() {
  const { state, pickOne, toggleIn, setField } = useW();
  return (
    <section className="form">
      <Side title="עוד שתי שאלות קצרות" text="אין תשובות נכונות או לא נכונות." />
      <div className="maincol">
        <fieldset>
          <legend className="gap">האם יש לך ניסיון תעסוקתי אזרחי קודם?</legend>
          <div className="radios" role="radiogroup">
            {EXP.map((x) => (
              <Choice key={x} on={state.exp === x} onClick={() => pickOne("exp", x)}>
                {x}
              </Choice>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>מה חשוב לך בעבודה העתידית?</legend>
          <div className="help">אפשר לבחור כמה</div>
          <div className="chips">
            {VALUES.map((v) => (
              <Mark key={v} label={v} on={state.values.includes(v)} onClick={() => toggleIn("values", v)} />
            ))}
          </div>
          <input className="field" value={state.valuesOther} aria-label="משהו נוסף שחשוב לך" placeholder="משהו נוסף? (לא חובה)" onChange={(e) => setField("valuesOther", e.target.value)} />
        </fieldset>
      </div>
    </section>
  );
}

function Exp1() {
  const { state, toggleIn, setField } = useW();
  const words = state.desc.trim() ? `${state.desc.trim().split(/\s+/).length} מילים` : "";
  return (
    <section className="form">
      <Side title="בואו נדבר על הניסיון שלך" text="אין צורך במונחים צבאיים מורכבים. פשוט תאר מה עשית, אילו משימות ביצעת ועל מה היית אחראי." />
      <div className="maincol">
        <fieldset>
          <legend>מה היה סוג התפקיד שלך?</legend>
          <div className="help">אפשר לבחור יותר מאחד</div>
          <div className="chips">
            {ROLETYPES.map((x) => (
              <Chip key={x} r10 on={state.roleTypes.includes(x)} onClick={() => toggleIn("roleTypes", x)}>
                {x}
              </Chip>
            ))}
          </div>
          {state.err.roleType ? (
            <div className="alert" role="alert">
              יש לבחור לפחות סוג תפקיד אחד
            </div>
          ) : null}
        </fieldset>
        <div className="field-wrap">
          <label className="lbl" htmlFor="desc">
            תאר במילים פשוטות מה עשית, כאילו אתה מסביר לאדם שאינו מכיר את הצבא.
          </label>
          <textarea id="desc" className={`area tall${state.err.desc ? " bad" : ""}`} value={state.desc} aria-invalid={!!state.err.desc} placeholder="למשל: הייתי אחראי על תיאום בין כמה צוותים, דאגתי ש..." onChange={(e) => setField("desc", e.target.value)} />
          <div className="meta">
            <span>אפשר לכתוב כמו שמדברים</span>
            <span>{words}</span>
          </div>
          {state.err.desc ? (
            <div className="alert" role="alert">
              כמה משפטים יעזרו לנו להבין. אפשר בקצרה.
            </div>
          ) : null}
        </div>
      </div>
      <div className="lock">
        <LockIcon />
        <span>תזכורת: אין לציין מידע מסווג, פרטים מבצעיים או פרטים מזהים על אחרים.</span>
      </div>
    </section>
  );
}

function Exp2() {
  const { state, setField, toggleIn, pickOne } = useW();
  return (
    <section className="form">
      <Side title="משימות ואחריות" text="עוד קצת פרטים על מה שעשית בפועל." />
      <div className="maincol">
        <div className="field-wrap">
          <label className="lbl" htmlFor="tasks">
            אילו משימות ביצעת?
          </label>
          <textarea id="tasks" className="area" value={state.tasks} placeholder="אפשר ברשימה קצרה" onChange={(e) => setField("tasks", e.target.value)} />
        </div>
        <fieldset>
          <legend>על מה היית אחראי?</legend>
          <div className="help">אפשר לבחור כמה</div>
          <div className="chips">
            {RESP.map((x) => (
              <Mark key={x} label={x} on={state.resp.includes(x)} onClick={() => toggleIn("resp", x)} />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="gap">האם נדרשת להתמודד עם שינויים או אתגרים משמעותיים?</legend>
          <div className="chips" role="radiogroup">
            {["כן", "לא"].map((x) => (
              <Chip key={x} on={state.challenge === x} onClick={() => pickOne("challenge", x)}>
                {x}
              </Chip>
            ))}
          </div>
          {state.challenge === "כן" ? (
            <textarea className="area mid" value={state.challengeText} aria-label="תיאור השינויים או האתגרים" placeholder="מה השתנה, ואיך התמודדת?" onChange={(e) => setField("challengeText", e.target.value)} />
          ) : null}
        </fieldset>
      </div>
    </section>
  );
}

function Quiz() {
  const { state, setQuiz } = useW();
  const skill = SK[state.qi];
  if (!skill) return null;
  return (
    <section className="quiz">
      <div className="stack" style={{ gap: 14 }}>
        <div className="quiz-top">
          <span className="kicker">
            שאלה {state.qi + 1} מתוך {SK.length}
          </span>
          <div className="dots" aria-hidden>
            {SK.map((s, i) => (
              <i key={s.k} style={{ width: i === state.qi ? 18 : 6, background: i === state.qi ? "#1C9AFF" : state.quiz[s.k] !== undefined ? "#3C5896" : "#DCE2F7" }} />
            ))}
          </div>
        </div>
        <h2 className="h-quiz">
          <SplitText key={skill.q} text={skill.q} />
        </h2>
        <p className="quiz-note">בתקופת המילואים. תשובה ספונטנית היא התשובה הנכונה.</p>
      </div>
      <div className="radio-col" role="radiogroup" aria-label={skill.q}>
        {ANS.map(([label, v], i) => (
          <Reveal key={label} i={i}>
            <Choice quiz on={state.quiz[skill.k] === v} onClick={() => setQuiz(skill.k, v)}>
              {label}
            </Choice>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Examples() {
  const { state, setEx } = useW();
  const curK = state.selected[state.si];
  const cur = curK ? SKM[curK] : undefined;
  const ex = (curK && state.ex[curK]) || {};
  const didLen = clean(ex.did).length;
  return (
    <section className="ex">
      {state.si === 0 && state.selected.length > 0 ? (
        <div className="ex-intro">
          <div>לפי התשובות שלך, אלה היכולות שבלטו. עכשיו נבסס כל אחת בדוגמה אמיתית.</div>
          <div className="pills">
            {state.selected.map((k) => (
              <span key={k} className="pill-solid">
                {SKM[k]?.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {!state.selected.length ? <div className="empty">לא סימנת יכולות שבאו לידי ביטוי באופן משמעותי או מדי פעם. אפשר לחזור לשאלון ולעדכן תשובות.</div> : null}
      {cur ? (
        <>
          <div className="stack" style={{ gap: 10 }}>
            <span className="kicker">
              מיומנות {state.si + 1} מתוך {state.selected.length}
            </span>
            <h2 className="h2 h2-sm">
              <SplitText key={cur.name} text={cur.name} />
            </h2>
            <p className="sub">תאר מצב אחד שבו זה בא לידי ביטוי. כתיבה פשוטה וקצרה מספיקה.</p>
          </div>
          <div className="stack" style={{ gap: 24, paddingTop: 8 }}>
            {EXF.map(([f, label, ph]) => (
              <div key={f} className="field-wrap">
                <label className="lbl" htmlFor={`ex-${f}`}>
                  {label} {f === "did" ? <span className="opt">(חובה)</span> : null}
                </label>
                <textarea id={`ex-${f}`} className={`area short${f === "did" && state.err.did ? " bad" : ""}`} value={ex[f] || ""} placeholder={ph} onChange={(e) => setEx(f, e.target.value)} />
              </div>
            ))}
            {state.err.did ? (
              <div className="alert" role="alert">
                כדי לבסס את המיומנות, ספר/י לפחות מה עשית בפועל.
              </div>
            ) : null}
            {didLen > 0 && didLen < 45 ? (
              <div className="follow">
                <div className="follow-q">
                  <HelpIcon />
                  <label htmlFor="ex-more">כדי לבסס את ״{cur.name}״, אפשר לתאר צעד אחד ספציפי שעשית? למשל, מה בדקת או החלטת, ומול מי עבדת.</label>
                </div>
                <textarea id="ex-more" className="area short" value={ex.more || ""} placeholder="לא חובה, אבל יעזור לניסוח מדויק יותר" onChange={(e) => setEx("more", e.target.value)} />
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}

function Analyzing() {
  const { state } = useW();
  const shown = ANA_LINES.slice(0, Math.min(ANA_LINES.length, state.anaI + 1));
  return (
    <section className="analyze" aria-live="polite">
      <Aurora opacity={0.6} />
      <div className="pct">
        <Count value={state.anaPct} suffix="%" />
      </div>
      <h2>רגע, מנתחים את התשובות שלך</h2>
      <p className="ana-note">זה לוקח בדרך כלל עד חצי דקה</p>
      <div className="ana-list">
        {shown.map((t, i) => {
          const done = i < state.anaI;
          return (
            <div key={t} className="ana-row" style={{ color: done ? "#9FD3FF" : "#FFFFFF" }}>
              <span className="ana-mark" style={{ borderColor: done ? "#9FD3FF" : "#FFFFFF", background: done ? "#9FD3FF" : "transparent" }}>
                {done ? "✓" : ""}
              </span>
              <Decrypt text={t} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

const CONF: Record<string, [string, string, string]> = {
  high: ["ביטחון גבוה", "#F0F6FD", "#1E2E53"],
  medium: ["ביטחון בינוני", "#DCE2F7", "#1E2E53"],
  low: ["ביטחון נמוך", "#FFF7E8", "#5A3A00"],
};

function Review() {
  const { state, decide } = useW();
  const skills = state.result?.skills ?? [];
  return (
    <section className="review">
      <div className="stack" style={{ gap: 10 }}>
        <h2 className="h2 h2-sm">
          <SplitText text="אלה היכולות שזיהינו מתוך הדברים שלך" />
        </h2>
        <p className="sub">לפני שנכין את התוצרים: אשר/י, מחק/י או סמן/י מה לא משקף אותך.</p>
      </div>
      {state.usedFallback ? <div className="sample-note">מוצגים ניסוחים לדוגמה המבוססים על התשובות שלך (מנוע ה־AI לא זמין כרגע).</div> : null}
      <div className="review-list">
        {skills.map((x, i) => {
          const d = state.decisions[x.k] || "ok";
          const c = CONF[x.confidence] || CONF.medium;
          return (
            <Reveal key={x.k} i={i}>
              <article className="skill spot" onMouseMove={spot} style={{ opacity: d === "ok" ? 1 : 0.55 }}>
                <div className="skill-top">
                  <h3>{x.name}</h3>
                  <span className="badge" style={{ background: c[1], color: c[2] }}>
                    {c[0]}
                  </span>
                </div>
                <div className="stack">
                  <div className="quote-label">מתוך הדברים שלך</div>
                  <blockquote>״{clean(x.evidence)}״</blockquote>
                </div>
                <div className="stack">
                  <div className="quote-label">בשפה מקצועית</div>
                  <div className="pro">{x.pro}</div>
                </div>
                {x.confidence === "low" && d === "ok" ? <div className="low">הדוגמה קצרה, ולכן הביטחון בזיהוי נמוך. כדאי להוסיף פרטים לפני שמציגים את זה בקורות החיים.</div> : null}
                <div className="act-row">
                  <button type="button" className={`act${d === "ok" ? " on" : ""}`} aria-pressed={d === "ok"} onClick={() => decide(x.k, "ok")}>
                    {d === "ok" ? "✓ מאושר" : "אישור"}
                  </button>
                  <button type="button" className={`act${d === "notme" ? " danger" : ""}`} aria-pressed={d === "notme"} onClick={() => decide(x.k, "notme")}>
                    לא משקף אותי
                  </button>
                  <button type="button" className={`act${d === "del" ? " danger" : ""}`} aria-pressed={d === "del"} onClick={() => decide(x.k, "del")}>
                    מחיקה
                  </button>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
      {state.err.review ? (
        <div className="alert" role="alert">
          יש להשאיר לפחות מיומנות אחת כדי להמשיך.
        </div>
      ) : null}
    </section>
  );
}

function Results() {
  const { state, setTab, printPdf, editAnswers, restart } = useW();
  const r = state.result;
  const kept = r ? r.skills.filter((x) => (state.decisions[x.k] || "ok") === "ok") : [];
  return (
    <section className="results">
      <div className="stack noprint" style={{ gap: 16 }}>
        <div className="ready">
          <i>✓</i>
          התוצרים שלך מוכנים
        </div>
        <div className="tabs" role="tablist">
          {(
            [
              ["cv", "קורות החיים שלי", "תוצר ראשון"],
              ["iv", "הכנה לראיון", "תוצר שני"],
            ] as const
          ).map(([k, label, sub]) => (
            <button key={k} type="button" role="tab" aria-selected={state.tab === k} className={`tab${state.tab === k ? " on" : ""}`} onClick={() => setTab(k)}>
              <small>{sub}</small>
              <b>{label}</b>
            </button>
          ))}
        </div>
      </div>
      {state.tab === "cv" && r ? (
        <div className="col">
          <h2 className="h-result">
            <SplitText text="הניסיון שלך במילואים בשפה שמעסיקים מבינים" />
          </h2>
          <article className="summary">
            <Aurora opacity={0.35} />
            <div className="eyebrow">פסקת סיכום לקורות החיים</div>
            <Editable id="para" text={r.paragraph} alt={r.paragraphAlt} target="פסקת סיכום בקורות חיים" tone="dark" lead />
          </article>
          {kept.map((x, i) => (
            <Reveal key={x.k} i={i}>
              <article className="cv spot" onMouseMove={spot}>
                <h3>{x.name}</h3>
                <div className="cv-grid">
                  <div>
                    <div className="quote-label">מה עשית</div>
                    <div className="body">{x.did}</div>
                  </div>
                  <div>
                    <div className="quote-label">בשפה מקצועית</div>
                    <div className="body">{x.pro}</div>
                  </div>
                  <div>
                    <div className="quote-label">הרלוונטיות לתפקיד</div>
                    <div className="body">{x.rel}</div>
                  </div>
                </div>
                <div className="cv-box">
                  <div className="eyebrow">ניסוח לקו״ח</div>
                  <Editable id={`cv-${x.k}`} text={x.cv} alt={x.cvAlt} target="שורה בקורות חיים" tone="light" />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      ) : null}
      {state.tab === "iv" && r ? (
        <div className="col">
          <div className="head-gap">
            <h2 className="h-result">
              <SplitText text="איך לדבר על הניסיון שלך במילואים בראיון עבודה?" />
            </h2>
            <p className="sub">התשובות הן כלי הכנה ולא טקסט לשינון. הן מבוססות רק על מה שסיפרת.</p>
          </div>
          <div className="struct">
            <div style={{ fontSize: 15, fontWeight: 700 }}>מבנה התשובה</div>
            <ol>
              {IV_STRUCTURE.map((t, i) => (
                <li key={t}>
                  <span>{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          {kept.map((x, i) => (
            <Reveal key={x.k} i={i}>
              <article className="iv spot" onMouseMove={spot}>
                <span className="tag">{x.name}</span>
                <h3>{x.iq}</h3>
                <div className="ia">
                  <div className="quote-label">תשובה מוצעת</div>
                  <Editable id={`ia-${x.k}`} text={x.ia} tone="light" tall />
                </div>
                <div className="tip">
                  <strong>טיפ</strong>
                  <span>{x.tip}</span>
                </div>
              </article>
            </Reveal>
          ))}
          <article className="fit-card">
            <Aurora opacity={0.35} />
            <div className="eyebrow">שאלה שכדאי להתכונן אליה</div>
            <h3>״מה מהניסיון שלך במילואים יכול לסייע לך בתפקיד הזה?״</h3>
            <Editable id="fit" text={r.fit} tone="dark" />
          </article>
        </div>
      ) : null}
      <div className="savebar noprint">
        <div>
          <div className="t">לשמור את התוצרים</div>
          <div className="d">ההורדה כוללת את הלשונית הפתוחה כרגע.</div>
        </div>
        <div className="save-actions">
          <button type="button" className="btn btn-pdf" onClick={printPdf}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" aria-hidden>
              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
            </svg>
            הורדה כ־PDF
          </button>
          <button type="button" className="btn btn-quiet" onClick={editAnswers}>
            עריכת תשובות
          </button>
          <button type="button" className="btn btn-quiet dim" onClick={restart}>
            התחלה מחדש
          </button>
        </div>
      </div>
    </section>
  );
}

function Nav() {
  const { state, next, back, fillDemo } = useW();
  const skill = SK[state.qi];
  const blocked = (state.step === 6 && skill && state.quiz[skill.k] === undefined) || (state.step === 7 && !state.selected.length);
  const nextLabel =
    state.step === 6
      ? state.qi === SK.length - 1
        ? "סיום השאלון"
        : "הבא"
      : state.step === 7
        ? state.si === state.selected.length - 1
          ? "לניתוח"
          : "למיומנות הבאה"
        : state.step === 9
          ? "להכנת התוצרים"
          : "המשך";
  return (
    <div className="nav noprint">
      <div className="nav-next">
        <button type="button" className="btn btn-next" disabled={!!blocked} onClick={next}>
          {nextLabel} <span aria-hidden="true">←</span>
        </button>
        {state.step < 8 ? (
          <button type="button" className="demo" onClick={fillDemo}>
            מילוי לדוגמה
          </button>
        ) : null}
      </div>
      <button type="button" className="btn btn-back" onClick={back}>
        <span aria-hidden="true">→</span> חזרה
      </button>
    </div>
  );
}

function TopNav() {
  const { start } = useW();
  return (
    <nav className="topnav noprint" aria-label="ניווט ראשי">
      <a className="topnav-brand" href="#top">
        <img src="/icon.png" alt="" />
        ממילואים לקריירה
      </a>
      <div className="topnav-links">
        <a href="#how">איך זה עובד</a>
        <a href="#get">מה מקבלים</a>
        <a href="#principles">העיקרון שלנו</a>
      </div>
      <button type="button" className="btn topnav-cta" onClick={start}>
        מתחילים <span aria-hidden="true">←</span>
      </button>
    </nav>
  );
}

function Shell() {
  const { state } = useW();
  const st = state.step;
  const { stageIdx, pct, mins } = progressOf(state);
  const maxW = st === 0 ? "none" : st === 10 || st === 9 ? "880px" : st === 6 || st === 8 ? "720px" : "1120px";
  const showProgress = st > 0 && st < 10;
  const showNav = st > 0 && st < 10 && st !== 8;
  return (
    <div className="page">
      <FxLayer />
      <div className="orbs noprint" aria-hidden>
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
      </div>
      {st === 0 ? <TopNav /> : null}
      <header id="top" className={`header noprint${st > 0 ? " bar" : " home"}`}>
        <div className="header-bar">
          <img className="logo" src="/logo-full.png" alt="מרכז אדמונד דה רוטשילד לחיבור השכלה גבוהה-תעסוקה" />
          {showProgress ? <span className="saved">נשמר אוטומטית</span> : null}
        </div>
        {showProgress ? (
          <div className="progress-wrap">
            <div className="progress" role="progressbar" aria-label="התקדמות בתהליך" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : null}
      </header>
      {showProgress ? (
        <nav className="steps-bar noprint" aria-label="שלבי התהליך">
          <ol className="steps-wide">
            {STAGES.map((label, i) => (
              <li key={label} aria-current={i === stageIdx ? "step" : undefined} style={{ color: i === stageIdx ? "#1E2E53" : i < stageIdx ? "#3C5896" : "#7D89A6", fontWeight: i === stageIdx ? 700 : 400 }}>
                {i < stageIdx ? "✓ " : ""}
                {label}
              </li>
            ))}
          </ol>
          <span className="steps-narrow">
            <strong>{STAGES[stageIdx]}</strong> · שלב {stageIdx + 1} מתוך 5
          </span>
          <span className="time-left">{mins ? `כ־${mins} דקות נותרו` : ""}</span>
        </nav>
      ) : null}
      <main className="main" style={{ padding: st === 0 ? 0 : "clamp(32px,5vw,64px) clamp(16px,4vw,48px) 96px" }}>
        <div
          className="stage"
          style={{
            maxWidth: maxW,
            opacity: state.vis ? 1 : 0,
            transform: state.vis ? "none" : "translateY(14px) scale(.985)",
            filter: state.vis ? "none" : "blur(6px)",
          }}
        >
          {st === 0 && !state.login ? <Welcome /> : null}
          {st === 0 && state.login ? <Login /> : null}
          {st === 1 ? <Intro1 /> : null}
          {st === 2 ? <Intro2 /> : null}
          {st === 3 ? <Intro3 /> : null}
          {st === 4 ? <Exp1 /> : null}
          {st === 5 ? <Exp2 /> : null}
          {st === 6 ? <Quiz /> : null}
          {st === 7 ? <Examples /> : null}
          {st === 8 ? <Analyzing /> : null}
          {st === 9 ? <Review /> : null}
          {st === 10 ? <Results /> : null}
          {showNav ? <Nav /> : null}
        </div>
      </main>
      <div className="toast-wrap" aria-live="polite">
        {state.toast ? <div className="toast">{state.toast}</div> : null}
      </div>
    </div>
  );
}

export default function Wizard() {
  const api = useApi();
  return (
    <Ctx.Provider value={api}>
      <Shell />
    </Ctx.Provider>
  );
}
