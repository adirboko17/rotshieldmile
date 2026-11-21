export type Confidence = "high" | "medium" | "low";
export type Decision = "ok" | "notme" | "del";

export type ExEntry = {
  sit?: string;
  resp?: string;
  did?: string;
  result?: string;
  more?: string;
};

export type SkillOut = {
  k: string;
  name: string;
  evidence: string;
  did: string;
  pro: string;
  rel: string;
  cv: string;
  cvAlt: string;
  iq: string;
  ia: string;
  tip: string;
  confidence: Confidence;
};

export type Result = {
  skills: SkillOut[];
  paragraph: string;
  paragraphAlt: string;
  fit: string;
};

export type Persisted = {
  email: string;
  fullName: string;
  step: number;
  qi: number;
  si: number;
  study: string;
  year: string;
  fields: string[];
  fieldOther: string;
  role: string;
  roleUnknown: boolean;
  exp: string;
  values: string[];
  valuesOther: string;
  roleTypes: string[];
  desc: string;
  tasks: string;
  resp: string[];
  challenge: string;
  challengeText: string;
  quiz: Record<string, number>;
  ex: Record<string, ExEntry>;
  selected: string[];
  result: Result | null;
  decisions: Record<string, Decision>;
  edits: Record<string, string>;
  tab: "cv" | "iv";
  usedFallback: boolean;
};

export const STUDY = [
  "מדעי המחשב",
  "הנדסת תוכנה",
  "הנדסת תעשייה וניהול",
  "הנדסת חשמל",
  "כלכלה",
  "מנהל עסקים",
  "חשבונאות",
  "פסיכולוגיה",
  "מדעי המדינה",
  "משפטים",
  "סוציולוגיה ואנתרופולוגיה",
  "תקשורת",
  "עבודה סוציאלית",
  "סיעוד",
  "ביולוגיה",
  "כימיה",
  "מתמטיקה",
  "סטטיסטיקה",
  "חינוך",
  "אדריכלות",
  "עיצוב",
  "היסטוריה",
  "ספרות",
];

export const YEARS = ["שנה א'", "שנה ב'", "שנה ג'", "שנה ד'", "תואר שני", "סיימתי לאחרונה"];

export const FIELDS = [
  "הייטק ותוכנה",
  "דאטה ואנליטיקה",
  "פיננסים",
  "ייעוץ וניהול",
  "שיווק",
  "משאבי אנוש",
  "חינוך",
  "בריאות",
  "מגזר ציבורי",
  "מחקר",
  "תעשייה והנדסה",
  "עוד לא יודע/ת",
  "אחר",
];

export const EXP = ["לא", "כן, עבודה חלקית או סטודנטיאלית", "כן, משרה מלאה"];

export const VALUES = [
  "למידה והתפתחות",
  "משמעות והשפעה",
  "שכר",
  "גמישות",
  "יציבות",
  "עבודת צוות",
  "אתגר מקצועי",
  "איזון בית-עבודה",
];

export const ROLETYPES = [
  "פיקוד",
  "הדרכה",
  "לוגיסטיקה",
  "טכנולוגיה",
  "מודיעין",
  "רפואה",
  "תפעול",
  "מטה",
  "תיאום",
  "תפקיד מבצעי",
  "אחר",
];

export const RESP = ["אנשים", "משימות", "ציוד", "תהליכים", "מידע", "תיאום בין גורמים", "אחר"];

export const ANS: [string, number][] = [
  ["כן, באופן משמעותי", 3],
  ["כן, מדי פעם", 2],
  ["כמעט שלא", 1],
  ["לא רלוונטי", 0],
];

export const STAGES = ["היכרות", "הניסיון שלך", "שאלון", "דוגמאות", "תוצרים"];

export type SkillDef = {
  k: string;
  name: string;
  q: string;
  pro: string;
  rel: string;
  cv: [string, string];
  iq: string;
};

export const SK: SkillDef[] = [
  {
    k: "decision",
    name: "קבלת החלטות",
    q: "האם נדרשת לקבל החלטות במצבים שבהם המידע לא היה מלא?",
    pro: "קבלת החלטות עצמאית על סמך הערכת המצב והמידע הזמין.",
    rel: "שיקול דעת וקבלת החלטות גם כשאין הנחיה מלאה",
    cv: [
      "קבלת החלטות בזמן אמת על סמך הערכת מצב והמידע הזמין.",
      "הערכת חלופות וקבלת החלטות עצמאית בתנאי אי-ודאות.",
    ],
    iq: "ספר/י על החלטה שקיבלת בעצמך כשלא הייתה הנחיה ברורה.",
  },
  {
    k: "problem",
    name: "פתרון בעיות",
    q: "האם נדרשת למצוא פתרונות לבעיות שלא היה להן מענה מוגדר מראש?",
    pro: "זיהוי בעיות לא צפויות ומציאת פתרונות מעשיים.",
    rel: "טיפול בתקלות ומציאת פתרונות מעשיים",
    cv: [
      "איתור בעיות לא צפויות ומציאת פתרונות מעשיים לטיפול בהן.",
      "ניתוח בעיות והתאמת פתרון מהיר תוך שמירה על רציפות העבודה.",
    ],
    iq: "תאר/י בעיה לא צפויה שנתקלת בה ואיך פתרת אותה.",
  },
  {
    k: "team",
    name: "עבודת צוות",
    q: "האם עבדת עם אנשים בעלי תפקידים או רקעים שונים להשגת מטרה משותפת?",
    pro: "עבודה משותפת עם אחרים להשגת מטרה, תוך חלוקת אחריות.",
    rel: "עבודה שוטפת עם עמיתים וממשקים",
    cv: [
      "עבודה בצוות לקידום משימות משותפות, תוך חלוקת אחריות ותיאום שוטף.",
      "שיתוף פעולה עם בעלי תפקידים שונים לעמידה ביעדים משותפים.",
    ],
    iq: "ספר/י על פעם שעבדת בצוות כדי להשלים משימה מורכבת. מה היה התפקיד שלך?",
  },
  {
    k: "lead",
    name: "הובלה",
    q: "האם הובלת אנשים או משימות והיית אחראי להתקדמות שלהם?",
    pro: "הנחיה והכוונה של אחרים בביצוע משימות.",
    rel: "הנחיית אחרים והובלת משימות",
    cv: [
      "הנחיית חברי צוות במשימות שוטפות ומתן משוב להתקדמותם.",
      "הדרכה והכוונה של אנשים בביצוע משימות.",
    ],
    iq: "ספר/י על מקרה שבו הנחית או הובלת אחרים. איך ניגשת לזה?",
  },
  {
    k: "comm",
    name: "תקשורת בין־אישית",
    q: "האם נדרשת להסביר מידע, לתאם ציפיות או להעביר מסרים לאנשים או לגורמים שונים?",
    pro: "העברת מידע ברור ותיווך בין גורמים שונים.",
    rel: "תקשורת ברורה מול עמיתים, לקוחות וממשקים",
    cv: [
      "העברת מידע ברור ותיאום בין גורמים שונים לשמירה על רצף העבודה.",
      "תקשורת שוטפת מול בעלי תפקידים שונים וגישור בין צרכים.",
    ],
    iq: "איך את/ה מוודא/ת שמידע חשוב מגיע בצורה ברורה לכל הגורמים?",
  },
  {
    k: "prio",
    name: "ניהול ותעדוף משימות",
    q: "האם נדרשת לתעדף בין כמה משימות במקביל?",
    pro: "תיאום משימות בין גורמים שונים תוך התמודדות עם אילוצים משתנים.",
    rel: "קידום תהליכים, עבודה עם ממשקים ותעדוף פעילות",
    cv: [
      "תיאום והובלת משימות מול מספר גורמים, תוך תעדוף פעילות, התאמה לשינויים ועמידה בלוחות זמנים.",
      "תעדוף וחלוקת משימות דחופות בין אנשי צוות ותיאום ביניהם לעמידה בזמנים.",
    ],
    iq: "ספר/י על מקרה שבו היו לך כמה משימות דחופות במקביל. איך החלטת מה קודם?",
  },
  {
    k: "adapt",
    name: "הסתגלות לשינויים",
    q: "האם נדרשת לשנות במהירות תוכניות או דרכי פעולה בעקבות שינוי בלתי צפוי?",
    pro: "התאמה מהירה לשינויים בתוכניות ובסדרי עדיפויות.",
    rel: "גמישות והתאמה לשינויים בסדרי עדיפויות",
    cv: [
      "התאמת דרכי עבודה במהירות לשינויים בתוכניות ובסדרי עדיפויות.",
      "תפקוד אפקטיבי בסביבה דינמית ומשתנה.",
    ],
    iq: "ספר/י על פעם שתוכנית השתנתה ברגע האחרון. מה עשית?",
  },
  {
    k: "learn",
    name: "למידה עצמאית",
    q: "האם נדרשת ללמוד באופן עצמאי ידע, כלים או נהלים חדשים?",
    pro: "לימוד עצמאי של מערכות ונהלים חדשים ויישומם.",
    rel: "למידה מהירה של כלים ונהלים חדשים",
    cv: [
      "לימוד עצמאי ומהיר של מערכות ונהלים חדשים ויישומם בעבודה.",
      "רכישת ידע חדש באופן עצמאי לצורך ביצוע משימות.",
    ],
    iq: "ספר/י על משהו שהיית צריך ללמוד לבד בזמן קצר.",
  },
  {
    k: "init",
    name: "יוזמה",
    q: "האם זיהית צורך ופעלת לקידום פתרון גם בלי שקיבלת הנחיה מפורשת?",
    pro: "זיהוי הזדמנויות לשיפור ופעולה ביוזמה אישית.",
    rel: "יוזמה והצעת שיפורים",
    cv: [
      "זיהוי נקודות לשיפור והצעת פתרונות ביוזמה אישית.",
      "קידום שיפורים בתהליכי עבודה מעבר להגדרת התפקיד.",
    ],
    iq: "ספר/י על שיפור שהצעת או יזמת בלי שהתבקשת.",
  },
  {
    k: "critical",
    name: "חשיבה ביקורתית",
    q: "האם נדרשת לבדוק מידע, להשוות בין אפשרויות או לבחון הנחות לפני פעולה?",
    pro: "בחינת מידע ושקילת חלופות לפני פעולה.",
    rel: "בחינת מידע וקבלת החלטות מבוססות",
    cv: [
      "בחינה ביקורתית של מידע וזיהוי טעויות לפני קבלת החלטות.",
      "שקילת חלופות וניתוח מידע כבסיס לפעולה.",
    ],
    iq: "ספר/י על מקרה שבו זיהית טעות או שאלת שאלה שאחרים לא שאלו.",
  },
  {
    k: "resp",
    name: "אחריות אישית",
    q: "האם היית אחראי לביצוע משימה או תהליך מתחילתו ועד סופו?",
    pro: "אחריות אישית על תוצאה, תהליך או משאבים.",
    rel: "אמינות ואחריות על תוצרים",
    cv: [
      "אחריות אישית על ביצוע תהליכים ועל המשאבים שהופקדו בידיי.",
      "אחריות מלאה על תוצרי משימה ועמידה בסטנדרטים.",
    ],
    iq: "ספר/י על משהו שהיית אחראי עליו באופן אישי. מה עשית כדי שזה יצליח?",
  },
  {
    k: "load",
    name: "תפקוד תחת עומס",
    q: "האם נדרשת להמשיך לבצע משימות באופן יעיל גם בתנאי עומס, לחץ או ריבוי דרישות?",
    pro: "שמירה על איכות העבודה בלחץ זמנים ובעומס.",
    rel: "עמידה בלוחות זמנים ובעומס",
    cv: [
      "עמידה במשימות תחת לחץ זמנים ועומס, תוך שמירה על איכות הביצוע.",
      "תפקוד יעיל ושמירה על סדרי עדיפויות בתקופות עומס.",
    ],
    iq: "איך את/ה מתפקד/ת כשיש לחץ זמנים? תן/י דוגמה.",
  },
];

export const SKM: Record<string, SkillDef> = Object.fromEntries(SK.map((s) => [s.k, s]));

export const USER_TEXT =
  "במהלך שירות המילואים הייתי אחראי על תיאום משימות בין מספר צוותים. באחד הימים קיבלנו כמה משימות דחופות במקביל, והייתי צריך להחליט מה לבצע קודם. בדקתי את רמת הדחיפות של כל משימה, חילקתי את העבודה בין אנשי הצוות ותיאמתי ביניהם כדי למנוע עיכובים. בסופו של דבר הצלחנו להשלים את המשימות החשובות בזמן, ולמדתי איך לתעדף משימות ולנהל עבודה תחת לחץ.";

export const DEMO_Q: Record<string, number> = {
  decision: 3,
  problem: 2,
  team: 2,
  lead: 1,
  comm: 3,
  prio: 3,
  adapt: 2,
  learn: 1,
  init: 1,
  critical: 2,
  resp: 2,
  load: 3,
};

export const DEMO_EX: Record<string, ExEntry> = {
  prio: {
    sit: "קיבלנו כמה משימות דחופות במקביל",
    resp: "להחליט מה מבצעים קודם ולתאם בין הצוותים",
    did: "בדקתי את רמת הדחיפות של כל משימה, חילקתי את העבודה בין אנשי הצוות ותיאמתי ביניהם כדי למנוע עיכובים",
    result: "השלמנו את המשימות החשובות בזמן, ולמדתי איך לתעדף משימות",
  },
  decision: {
    sit: "כמה משימות דחופות הגיעו באותו זמן, בלי הנחיה מה קודם",
    resp: "להחליט על סדר הביצוע",
    did: "בדקתי את רמת הדחיפות של כל משימה וקבעתי מה מבוצע ראשון",
    result: "המשימות החשובות הושלמו בזמן",
  },
  comm: {
    sit: "כמה צוותים עבדו במקביל על משימות קשורות",
    resp: "לתאם בין הצוותים",
    did: "עדכנתי כל צוות במה שנדרש ממנו ווידאתי שכולם יודעים מה הסטטוס",
    result: "נמנעו עיכובים וכפילויות בעבודה",
  },
  load: {
    sit: "יום עם כמה משימות דחופות במקביל",
    resp: "לוודא שהעבודה מתקדמת בזמן",
    did: "חילקתי את העבודה בין אנשי הצוות ועקבתי אחר ההתקדמות לאורך היום",
    result: "למדתי לנהל עבודה תחת לחץ",
  },
};

export const EXF: [keyof ExEntry, string, string][] = [
  ["sit", "תאר מצב או משימה שבהם היכולת באה לידי ביטוי", "למשל: קיבלנו כמה משימות דחופות במקביל"],
  ["resp", "מה הייתה האחריות שלך?", "למשל: לתאם בין הצוותים"],
  ["did", "מה עשית בפועל?", "מה בדקת, החלטת או ביצעת"],
  ["result", "מה הייתה התוצאה או מה למדת?", 'גם "למדתי ש..." זו תשובה טובה'],
];

export const ANA_LINES = ["קוראים את התשובות שלך", "מזהים יכולות שמבוססות בדוגמאות", "מתרגמים לשפה מקצועית"];

export const IV_STRUCTURE = [
  "מה היה המצב?",
  "מה הייתה האחריות שלי?",
  "מה עשיתי?",
  "מה קרה בעקבות הפעולה?",
  "מה למדתי?",
  "כיצד זה רלוונטי לתפקיד שאני רוצה?",
];

export const HOW = [
  ["01", "היכרות קצרה", "לימודים, תחום ותפקיד שמעניין אותך. אפשר גם בלי לדעת עדיין."],
  ["02", "הניסיון שלך", "מה עשית ועל מה היית אחראי, במילים פשוטות."],
  ["03", "שאלון מיומנויות", "12 שאלות קצרות על מה שנדרשת לעשות בפועל."],
  ["04", "דוגמאות", "דוגמה אמיתית לכל אחת מ־3 עד 5 המיומנויות הבולטות."],
  ["05", "תוצרים", "ניסוח לקורות החיים והכנה לראיון עבודה."],
] as const;

export const KEY = "mmk-state-main";

export function freshData(): Persisted {
  return {
    email: "",
    fullName: "",
    step: 0,
    qi: 0,
    si: 0,
    study: "",
    year: "",
    fields: [],
    fieldOther: "",
    role: "",
    roleUnknown: false,
    exp: "",
    values: [],
    valuesOther: "",
    roleTypes: [],
    desc: "",
    tasks: "",
    resp: [],
    challenge: "",
    challengeText: "",
    quiz: {},
    ex: {},
    selected: [],
    result: null,
    decisions: {},
    edits: {},
    tab: "cv",
    usedFallback: false,
  };
}

export function clean(s?: string) {
  return (s || "").trim().replace(/[.\s]+$/g, "");
}

export function targetOf(s: Pick<Persisted, "role" | "roleUnknown" | "fields" | "fieldOther">) {
  if (s.roleUnknown || !s.role.trim()) {
    return s.fields.find((f) => f !== "אחר" && f !== "עוד לא יודע/ת") || s.fieldOther || "";
  }
  return s.role.trim();
}

export function computeSelected(quiz: Record<string, number>) {
  const ranked = SK.map((s, i) => ({ k: s.k, v: quiz[s.k] ?? -1, i })).sort((a, b) => b.v - a.v || a.i - b.i);
  let sel = ranked.filter((r) => r.v === 3).slice(0, 5);
  if (sel.length < 3) sel = sel.concat(ranked.filter((r) => r.v === 2).slice(0, 3 - sel.length));
  return sel.map((r) => r.k);
}

export function fallback(s: Persisted): Result {
  const t = targetOf(s);
  const skills = s.selected.map((k) => {
    const d = SKM[k];
    const e = s.ex[k] || {};
    const did = clean(e.did);
    const sit = clean(e.sit);
    const rs = clean(e.resp);
    const res = clean(e.result);
    const more = clean(e.more);
    const len = (did + sit + more).length;
    const filled = [sit, rs, did, res].filter(Boolean).length;
    const confidence: Confidence = filled >= 4 && len > 70 ? "high" : len > 30 ? "medium" : "low";
    const ia = [
      sit && `במהלך המילואים ${sit}.`,
      rs && `האחריות שלי הייתה ${rs}.`,
      did && `${did}.`,
      more && `${more}.`,
      res && `${res}.`,
      `אני חושב/ת שזה רלוונטי ${t ? "לתפקיד " + t : "לתפקיד"}, כי נדרשים בו ${d.rel}.`,
    ]
      .filter(Boolean)
      .join(" ");
    return {
      k,
      name: d.name,
      evidence: did || sit,
      did: (did || sit) + ".",
      pro: d.pro,
      rel: `${t ? "בתפקיד " + t : "ברוב התפקידים בתחילת הדרך"} נדרשים ${d.rel}.`,
      cv: d.cv[0],
      cvAlt: d.cv[1],
      iq: d.iq,
      ia,
      tip: "פתח/י במצב בקצרה, והקדש/י את רוב הזמן למה שעשית את/ה. אין צורך בפרטים מבצעיים.",
      confidence,
    };
  });
  const top = skills.slice(0, 3);
  const names = top.map((x) => x.name);
  const nm = names.length > 1 ? names.slice(0, -1).join(", ") + " ו" + names[names.length - 1] : names[0] || "";
  const paragraph = `שירות המילואים במקביל ללימודים${s.study ? " ב" + s.study : ""} חיזק אצלי יכולות של ${nm}. ${top[0] ? top[0].cv : ""} ${top[1] ? top[1].cv : ""}`.trim();
  const paragraphAlt = `במהלך שירות מילואים לצד הלימודים צברתי ניסיון מעשי ב${nm}, בסביבה דינמית ותחת לוחות זמנים צפופים.`;
  const fit = `מהמילואים אני מביא/ה ניסיון מעשי ב${nm}. למשל, ${top[0] ? clean(top[0].evidence) : ""}. ${t ? "בתפקיד " + t : "בתפקיד"} אני רואה בזה בסיס ל${top[0] ? SKM[top[0].k].rel : "עבודה מקצועית"}.`;
  return { skills, paragraph, paragraphAlt, fit };
}

export function aiInput(s: Persisted) {
  return {
    לימודים: s.study,
    שנה: s.year,
    תחום_מבוקש: s.fields.join(", ") + (s.fieldOther ? " " + s.fieldOther : ""),
    תפקיד_מבוקש: targetOf(s),
    סוג_תפקיד_במילואים: s.roleTypes.join(", "),
    תיאור: s.desc,
    משימות: s.tasks,
    אחריות: s.resp.join(", "),
    אתגרים: s.challengeText,
    שאלון: Object.fromEntries(SK.map((x) => [x.name, (ANS.find((a) => a[1] === s.quiz[x.k]) || ["לא נענה"])[0]])),
    דוגמאות: s.selected.map((k) => ({ k, מיומנות: SKM[k].name, ...(s.ex[k] || {}) })),
  };
}

type AiSkill = Partial<Record<keyof SkillOut, unknown>>;

export function mergeAi(base: Result, ai: unknown): Result | null {
  if (!ai || typeof ai !== "object") return null;
  const j = ai as { skills?: AiSkill[]; paragraph?: unknown; paragraphAlt?: unknown; fit?: unknown };
  if (!Array.isArray(j.skills) || !j.skills.length) return null;
  const str = (v: unknown, fb: string) => (typeof v === "string" && v.trim() ? v.trim() : fb);
  return {
    paragraph: str(j.paragraph, base.paragraph),
    paragraphAlt: str(j.paragraphAlt, base.paragraphAlt),
    fit: str(j.fit, base.fit),
    skills: base.skills.map((b) => {
      const a = j.skills?.find((x) => x && x.k === b.k) || {};
      const conf = a.confidence === "high" || a.confidence === "medium" || a.confidence === "low" ? a.confidence : b.confidence;
      return {
        ...b,
        evidence: str(a.evidence, b.evidence),
        did: str(a.did, b.did),
        pro: str(a.pro, b.pro),
        rel: str(a.rel, b.rel),
        cv: str(a.cv, b.cv),
        cvAlt: str(a.cvAlt, b.cvAlt),
        iq: str(a.iq, b.iq),
        ia: str(a.ia, b.ia),
        tip: str(a.tip, b.tip),
        confidence: conf,
      };
    }),
  };
}

export function progressOf(s: Pick<Persisted, "step" | "qi" | "si" | "selected">) {
  const st = s.step;
  const stageIdx = st <= 3 ? 0 : st <= 5 ? 1 : st === 6 ? 2 : st === 7 ? 3 : 4;
  const within =
    st <= 3
      ? st / 3
      : st <= 5
        ? (st - 3) / 2
        : st === 6
          ? (s.qi + 1) / SK.length
          : st === 7
            ? (s.si + 1) / Math.max(1, s.selected.length)
            : st >= 10
              ? 1
              : st === 9
                ? 0.6
                : 0.3;
  const pct = Math.round(((stageIdx + within) / 5) * 100);
  const mins: Record<number, number> = { 1: 14, 2: 13, 3: 12, 4: 11, 5: 9, 6: 8, 7: 5, 8: 2, 9: 1 };
  return { stageIdx, pct, mins: mins[st] };
}

export function loadSaved(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null") as Persisted | null;
    if (s && s.step > 0) return s;
  } catch {
    /* ignore broken storage */
  }
  return null;
}

export function loadByEmail(email: string): Persisted | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY + ":" + email) || "null") as Persisted | null;
    if (s && s.step > 0) return s;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeSaved(s: Persisted) {
  try {
    const j = JSON.stringify(s);
    localStorage.setItem(KEY, j);
    if (s.email) localStorage.setItem(KEY + ":" + s.email, j);
  } catch {
    /* ignore quota */
  }
}

export function clearSaved(email?: string) {
  try {
    localStorage.removeItem(KEY);
    if (email) localStorage.removeItem(KEY + ":" + email);
  } catch {
    /* ignore */
  }
}
