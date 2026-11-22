import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "ממילואים לקריירה",
  description: "מהניסיון במילואים ליתרון בקריירה. מרכז אדמונד דה רוטשילד לחיבור השכלה גבוהה-תעסוקה.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${rubik.className}`}>
      <body>{children}</body>
    </html>
  );
}
