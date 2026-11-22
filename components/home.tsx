"use client";

import { useEffect, useState } from "react";
import { HOW, SK } from "@/lib/model";
import { CountIn, Reveal, SplitText } from "@/components/fx";

const SAMPLES = [
  {
    tag: "תיאום ותעדוף",
    said: "תיאמתי בין כמה צוותים כשהגיעו משימות דחופות במקביל.",
    cv: "תיאום עבודה בין צוותים ותעדוף משימות תחת לוחות זמנים צפופים.",
  },
  {
    tag: "קבלת החלטות",
    said: "החלטתי מה מבצעים קודם כשלא הייתה הנחיה ברורה.",
    cv: "קבלת החלטות עצמאית על סמך הערכת מצב ומידע חלקי.",
  },
  {
    tag: "הדרכה",
    said: "הדרכתי אנשים חדשים שהצטרפו לצוות באמצע הפעילות.",
    cv: "הדרכה וקליטה של אנשי צוות חדשים והעברת ידע מקצועי.",
  },
];

const RULES = [
  ["לא לפי שם התפקיד", "מיומנות נקבעת לפי מה שתיארת שעשית, לא לפי התפקיד הצבאי."],
  ["בלי להמציא", "לא נוסיף הישגים, תוצאות או מספרים שלא אמרת."],
  ["בשפה אזרחית", "ניסוחים שמעסיקים מבינים, בלי מונחים צבאיים."],
] as const;

function Check() {
  return (
    <span className="chk" aria-hidden>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function Arch({ size = 22 }: { size?: number }) {
  return <img className="arch" src="/icon.png" alt="" style={{ height: size }} />;
}

function Translator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % SAMPLES.length), 4200);
    return () => window.clearInterval(t);
  }, []);
  const s = SAMPLES[i];
  return (
    <div className="tr" aria-hidden>
      <div className="tr-ghost g2" />
      <div className="tr-ghost g1" />
      <div className="tr-card">
        <div className="tr-head">
          <span>מתרגמים את הניסיון</span>
          <span className="tr-tag" key={`t${i}`}>
            {s.tag}
          </span>
        </div>
        <div className="tr-body" key={i}>
          <div className="tr-said">
            <small>מה שסיפרת</small>
            <p>״{s.said}״</p>
          </div>
          <div className="tr-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </div>
          <div className="tr-cv">
            <small>בקורות החיים</small>
            <p>{s.cv}</p>
          </div>
        </div>
        <div className="tr-dots">
          {SAMPLES.map((_, n) => (
            <i key={n} className={n === i ? "on" : ""} />
          ))}
        </div>
      </div>
      <div className="tr-gauge">
        <small>מיומנויות בולטות</small>
        <svg width="104" height="58" viewBox="0 0 104 58">
          <path d="M8 52a44 44 0 0 1 88 0" fill="none" stroke="#dde8fb" strokeWidth="10" strokeLinecap="round" />
          <path className="gauge-fill" d="M8 52a44 44 0 0 1 88 0" fill="none" stroke="url(#gg)" strokeWidth="10" strokeLinecap="round" pathLength={100} />
          <defs>
            <linearGradient id="gg" x1="0" x2="1">
              <stop offset="0" stopColor="#1481e2" />
              <stop offset="1" stopColor="#1c9aff" />
            </linearGradient>
          </defs>
        </svg>
        <b>4/12</b>
      </div>
    </div>
  );
}

function Marquee() {
  const names = SK.map((s) => s.name);
  const half = Math.ceil(names.length / 2);
  const rows = [names.slice(0, half), names.slice(half)];
  return (
    <div className="mq" aria-hidden>
      {rows.map((row, r) => (
        <div key={r} className={`mq-row${r ? " rev" : ""}`}>
          <div className="mq-track">
            {[...row, ...row, ...row, ...row].map((n, i) => (
              <span key={i} className="mq-item">
                <Arch size={r ? 26 : 30} />
                {n}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Home({ onStart, onResume, saved }: { onStart: () => void; onResume: () => void; saved: boolean }) {
  return (
    <section className="home">
      <div className="hd" id="top">
        <div className="hd-bg" aria-hidden>
          <div className="beam b1" />
          <div className="beam b2" />
          <div className="beam b3" />
        </div>
        <div className="hd-wrap hd-top">
          <img className="hd-logo" src="/logo-full.png" alt="מרכז אדמונד דה רוטשילד לחיבור השכלה גבוהה-תעסוקה" />
        </div>
        <div className="hd-wrap hd-grid">
          <div className="hd-copy">
            <h1 className="h1 hd-h1">
              <SplitText text="מהניסיון במילואים" accent="ליתרון בקריירה" delay={120} stagger={90} shiny />
            </h1>
            <Reveal i={6}>
              <p className="hd-lead">
                ייתכן שבתקופת המילואים החמצת הזדמנויות מקצועיות. במקביל, צברת ניסיון ותרגלת יכולות שעשויות להיות רלוונטיות לעולם העבודה. נעזור לך לזהות אותן, לנסח אותן לקורות החיים ולהתכונן לראיונות.
              </p>
            </Reveal>
            <Reveal i={8}>
              <div className="cta-row">
                <button type="button" className="btn btn-lg btn-navy" onClick={onStart}>
                  מתחילים <span aria-hidden="true">←</span>
                </button>
                {saved ? (
                  <button type="button" className="btn-ghost" onClick={onResume}>
                    להמשיך מאיפה שעצרתי
                  </button>
                ) : null}
                <span className="hd-mins">כ־10–15 דקות · נשמר אוטומטית</span>
              </div>
            </Reveal>
          </div>
          <Reveal i={4} y={50} dur={1000} className="hd-visual">
            <Translator />
          </Reveal>
        </div>
        <div className="hd-wrap hd-note" role="note">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9FD3FF" strokeWidth="2" aria-hidden>
            <path d="M12 3l9 16H3z" />
            <path d="M12 10v4M12 17v.5" strokeLinecap="round" />
          </svg>
          <p>
            <strong>חשוב:</strong> אין להזין מידע מסווג, פרטים מבצעיים או פרטים מזהים על אנשים אחרים. מספיק לתאר את סוג המשימות והאחריות שלך.
          </p>
        </div>
      </div>

      <div className="home-in">
        <div className="stats">
          {(
            [
              [15, "דקות", "בערך. היכרות קצרה, כמה שאלות ודוגמאות מהניסיון שלך."],
              [12, "מיומנויות", "נבדקות בשאלון קצר, לפי מה שעשית בפועל ולא לפי התפקיד."],
              [2, "תוצרים", "ניסוחים מוכנים לקורות החיים והכנה לראיון עבודה."],
            ] as const
          ).map(([n, unit, d], i) => (
            <Reveal key={unit} i={i} className="stat">
              <div className="stat-n">
                <b>
                  <CountIn value={n} />
                </b>
                <span>{unit}</span>
              </div>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>

        <div className="story" id="principles">
          <div className="story-copy">
            <Reveal>
              <div className="block-head">
                <span className="kicker">העיקרון שלנו</span>
                <h2 className="h2">רק מה שבאמת עשית</h2>
                <p className="lead">הניסיון מהמילואים ממשיך איתך. המטרה היא לא להמציא סיפור חדש, אלא לעשות סדר במה שכבר יש ולספר אותו בשפה שמעסיקים מבינים.</p>
              </div>
            </Reveal>
            <ul className="checks">
              {RULES.map(([t, d], i) => (
                <Reveal key={t} i={i + 1}>
                  <li>
                    <Check />
                    <div>
                      <strong>{t}</strong>
                      <span>{d}</span>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
            <Reveal i={4}>
              <button type="button" className="btn-soft" onClick={onStart}>
                בואו נתרגם את הניסיון שלי <span aria-hidden="true">←</span>
              </button>
            </Reveal>
          </div>
          <Reveal i={1} y={60} dur={1000} className="story-art">
            <div className="arch-frame" aria-hidden />
            <div className="arch-photo">
              <img src="/images/home-portrait.jpg" alt="סטודנט עובד על קורות החיים במחשב נייד בקמפוס" loading="lazy" />
              <span className="arch-cap">הניסיון שלך ממשיך איתך.</span>
            </div>
            <div className="float-badge">
              <Check />
              <div>
                <small>בלי להמציא.</small>
                <b>רק מה שסיפרת.</b>
              </div>
            </div>
            <div className="float-photo">
              <img src="/images/home-together.jpg" alt="" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </div>

      <Marquee />

      <div className="home-in">
        <div className="block" id="how">
          <Reveal>
            <div className="block-head">
              <span className="kicker">איך זה עובד</span>
              <h2 className="h2">חמישה שלבים קצרים, מהשירות ועד לניסוח מוכן</h2>
            </div>
          </Reveal>
          <div className="steps">
            {HOW.map(([n, t, d], i) => (
              <Reveal key={n} i={i + 1} className="step">
                <span className="step-n">{n}</span>
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

        <Reveal y={60} dur={1000}>
          <div className="band">
            <div className="band-photo">
              <img src="/images/home-band.jpg" alt="" loading="lazy" />
            </div>
            <div className="band-scrim" aria-hidden />
            <div className="band-copy">
              <div className="band-copy-inner">
                <div className="stack">
                  <p className="band-q">השאלה היא לא מה היה התפקיד שלך.</p>
                  <h2>השאלה היא מה עשית בו, ואיך מספרים את זה.</h2>
                  <span className="mins-light">כ־10–15 דקות · נשמר אוטומטית</span>
                </div>
                <button type="button" className="btn btn-lg btn-white" onClick={onStart}>
                  מתחילים <span aria-hidden="true">←</span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <footer className="foot">
        <img className="foot-logo" src="/logo-full.png" alt="מרכז אדמונד דה רוטשילד לחיבור השכלה גבוהה-תעסוקה" />
        <p className="foot-title" aria-hidden>
          ממילואים לקריירה
        </p>
        <div className="foot-line">
          <span>© 2026 ממילואים לקריירה</span>
          <span className="foot-tag">
            <Arch size={14} /> מהניסיון במילואים ליתרון בקריירה
          </span>
        </div>
      </footer>
    </section>
  );
}
