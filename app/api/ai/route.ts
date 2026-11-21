import { NextResponse } from "next/server";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-sonnet-4.5";
const MAX_INPUT_CHARS = 20000;
const MAX_REPHRASE_CHARS = 3000;

const ANALYZE_SYSTEM =
  'אתה מנוע שמתרגם ניסיון ממילואים לשפה אזרחית לקורות חיים ולראיונות. כללים: אין להמציא מידע, הישגים, מספרי אנשים או תוצאות שלא נאמרו. אין להניח מיומנות לפי תפקיד צבאי בלבד. אין להפוך "תיאום משימות" אוטומטית ל"ניהול פרויקטים". אין להציג ניסיון צבאי כניסיון אזרחי שלא היה. שפה אזרחית, בלי מונחים צבאיים. אם הדוגמה חלשה, confidence=low. ' +
  'מקורות: כל מיומנות נשענת על הדוגמה שלה בלבד (sit, resp, did, result, more של אותה מיומנות). התיאור הכללי והמשימות משמשים רק להקשר. אין להעביר למיומנות פעולות או תוצאות שמופיעות רק בדוגמה של מיומנות אחרת. אם הדוגמה דלה, כתוב ניסוח קצר וזהיר שמבוסס רק על מה שנאמר בה, ואל תשלים אותו מדוגמאות אחרות. evidence הוא ציטוט מדויק מתוך הדוגמה של אותה מיומנות. ' +
  'גיוון: שורות ה-cv של המיומנויות השונות חייבות להיות שונות זו מזו. כל שורה מדגישה את ההיבט שמייצג את המיומנות שלה, פותחת בפועל או בשם פעולה אחר, ולא חוזרת על אותה רשימת פעולות. אותו כלל חל על cvAlt. ' +
  'גוף ולשון: paragraph, paragraphAlt, ia ו-fit נכתבים בגוף ראשון בלבד, כאילו המשתמש מדבר או כותב בעצמו. cv ו-cvAlt נכתבים כשורת קורות חיים בלי גוף. לעולם אין לפנות אל המשתמש בגוף שני, ואין להתייחס לתהליך המילוי עצמו: בלי "ציינת", "כפי שתיארת", "לפי התיאור שלי", "לפי מה שכתבת". ia היא תשובה בעל פה, טבעית ושוטפת. ' +
  'כל השדות מלבד evidence נכתבים במשפטים שלמים ותקינים. אין להציב מילה בודדת מדברי המשתמש כמשפט בפני עצמו (למשל "חילקתי."); אם הדוגמה דלה, הרחב אותה רק דקדוקית ובאופן כללי (למשל "חילקתי את העבודה"), בלי להוסיף פרטים, אנשים או תוצאות. ' +
  'החזר JSON בלבד.';

const ANALYZE_FORMAT =
  '{"skills":[{"k":"<מפתח מהדוגמאות>","evidence":"ציטוט קצר מדברי המשתמש","did":"מה המשתמש תיאר שעשה, משפט אחד","pro":"מה זה אומר בשפה מקצועית","rel":"למה זה רלוונטי לתפקיד המבוקש","cv":"ניסוח לקו\\"ח, שורה אחת","cvAlt":"ניסוח חלופי","iq":"שאלת ראיון אפשרית","ia":"תשובה מוצעת בגוף ראשון לפי: מצב, אחריות, מה עשיתי, מה קרה, מה למדתי, רלוונטיות","tip":"טיפ קצר","confidence":"high|medium|low"}],"paragraph":"פסקה אחת של 2-3 משפטים קצרים המשלבת 2-3 מיומנויות, בלי להשתמש בפעלים שהמשתמש לא אמר (כמו ניהלתי) ובלי השוואה לתפקידים","paragraphAlt":"ניסוח חלופי לפסקה","fit":"תשובה לשאלה: מה מהניסיון שלך במילואים יכול לסייע לך בתפקיד הזה?"}';

type Message = { role: "system" | "user"; content: string };

async function complete(key: string, messages: Message[], maxTokens: number) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": "Miluim to Career",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
      messages,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(50000),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function POST(req: Request) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return NextResponse.json({ error: "missing_key" }, { status: 503 });

  let body: { kind?: string; input?: unknown; text?: string; target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  try {
    if (body.kind === "analyze") {
      const input = JSON.stringify(body.input ?? {});
      if (input.length > MAX_INPUT_CHARS) return NextResponse.json({ error: "too_long" }, { status: 413 });
      const prompt = `נתוני המשתמש:\n${input}\n\nהחזר JSON בפורמט: ${ANALYZE_FORMAT}. כלול רק את המפתחות שבדוגמאות.`;
      const txt = await complete(
        key,
        [
          { role: "system", content: ANALYZE_SYSTEM },
          { role: "user", content: prompt },
        ],
        6000
      );
      const start = txt.indexOf("{");
      const end = txt.lastIndexOf("}");
      if (start < 0 || end <= start) return NextResponse.json({ error: "no_json" }, { status: 502 });
      return NextResponse.json({ data: JSON.parse(txt.slice(start, end + 1)) });
    }

    if (body.kind === "rephrase") {
      const text = (body.text || "").slice(0, MAX_REPHRASE_CHARS);
      const target = (body.target || "").slice(0, 100);
      if (!text.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
      const prompt = `נסח מחדש את הטקסט הבא ל${target}, בעברית מקצועית, בלי להוסיף מידע או הישגים שלא מופיעים בו ובלי מונחים צבאיים. החזר רק את הניסוח החדש.\n\n${text}`;
      const out = await complete(key, [{ role: "user", content: prompt }], 800);
      if (!out) return NextResponse.json({ error: "empty_reply" }, { status: 502 });
      return NextResponse.json({ text: out });
    }

    return NextResponse.json({ error: "unknown_kind" }, { status: 400 });
  } catch (e) {
    console.error("[api/ai]", e);
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }
}
