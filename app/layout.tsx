import type { Metadata } from "next";
import { Heebo, Rubik } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heebo",
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "ממילואים לקריירה",
  description: "מהניסיון במילואים ליתרון בקריירה. מרכז אדמונד דה רוטשילד לחיבור השכלה גבוהה-תעסוקה.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${rubik.variable} ${heebo.className}`}>
      <body>{children}</body>
    </html>
  );
}
