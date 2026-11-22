"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const EASE = "cubic-bezier(.2,.7,.2,1)";

export function SplitText({
  text,
  accent,
  delay = 0,
  stagger = 70,
  shiny = false,
}: {
  text: string;
  accent?: string;
  delay?: number;
  stagger?: number;
  shiny?: boolean;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  const acc = accent ? accent.split(/\s+/).filter(Boolean) : [];
  const [on, setOn] = useState(false);
  return (
    <span className="split">
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className="w" style={{ animationDelay: `${delay + i * stagger}ms` }}>
            {w}
          </span>{" "}
        </span>
      ))}
      {acc.length > 0 && (
        <span className={on ? "acc shiny" : "acc"}>
          {acc.map((w, i) => (
            <span key={`${w}-${i}`}>
              <span
                className="w"
                style={{ animationDelay: `${delay + (words.length + i) * stagger}ms` }}
                onAnimationEnd={shiny && i === acc.length - 1 ? () => setOn(true) : undefined}
              >
                {w}
              </span>
              {i < acc.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

export function Reveal({
  i = 0,
  y = 22,
  dur = 720,
  className,
  style,
  children,
}: {
  i?: number;
  y?: number;
  dur?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en?.isIntersecting) return;
        io.disconnect();
        el.animate(
          [
            { opacity: 0, transform: `translateY(${y}px)`, filter: "blur(8px)" },
            { opacity: 1, transform: "none", filter: "blur(0)" },
          ],
          { duration: dur, delay: i * 70, easing: EASE, fill: "backwards" }
        );
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [i, y, dur]);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

export function Decrypt({ text }: { text: string }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    const HE = "אבגדהוזחטיכלמנסעפצקרשת0123456789";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }
    const t0 = performance.now();
    const dur = Math.max(500, text.length * 32);
    let raf = 0;
    const f = (n: number) => {
      const p = Math.max(0, Math.min(1, (n - t0) / dur));
      const k = Math.floor(p * text.length);
      setOut(
        text
          .split("")
          .map((ch, i) => (i < k || ch === " " ? ch : HE[(Math.random() * HE.length) | 0]))
          .join("")
      );
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return <span>{out}</span>;
}

export function Count({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = from.current;
    const to = value;
    const dur = 1100;
    const t0 = performance.now();
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const f = (n: number) => {
      const p = reduce ? 1 : Math.min(1, (n - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = start + (to - start) * e;
      from.current = v;
      setShown(Math.round(v));
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className="count">
      {shown}
      {suffix}
    </span>
  );
}

export function CountIn({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => {
      if (!en?.isIntersecting) return;
      io.disconnect();
      setOn(true);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref}>
      <Count value={on ? value : 0} suffix={suffix} />
    </span>
  );
}

export function Aurora({ opacity = 0.55 }: { opacity?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const h = host.current;
    if (!c || !h) return;
    const x = c.getContext("2d");
    if (!x) return;
    const cols = ["#1C9AFF", "#1481E2", "#3C5896", "#0F6BC7"];
    const blobs = cols.map((col, i) => ({
      col,
      a: i * 1.7,
      b: i * 2.3,
      s: 0.00011 + i * 0.00004,
      rr: 0.45 + ((i * 37) % 20) / 60,
    }));
    let raf = 0;
    const draw = (t: number) => {
      const r = h.getBoundingClientRect();
      const d = Math.min(devicePixelRatio || 1, 2) * 0.12;
      const w = Math.max(1, Math.round(r.width * d));
      const hh = Math.max(1, Math.round(r.height * d));
      if (c.width !== w || c.height !== hh) {
        c.width = w;
        c.height = hh;
      }
      x.clearRect(0, 0, w, hh);
      x.globalCompositeOperation = "lighter";
      const alpha = Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0");
      for (const b of blobs) {
        const cx = w * (0.5 + 0.42 * Math.sin(t * b.s + b.a));
        const cy = hh * (0.5 + 0.45 * Math.cos(t * b.s * 1.3 + b.b));
        const rad = Math.max(w, hh) * b.rr;
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, b.col + alpha);
        g.addColorStop(1, b.col + "00");
        x.fillStyle = g;
        x.fillRect(0, 0, w, hh);
      }
      x.globalCompositeOperation = "source-over";
    };
    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [opacity]);
  return (
    <div ref={host} className="aurora" aria-hidden>
      <canvas ref={ref} />
    </div>
  );
}

type Particle =
  | { kind: "spark"; x: number; y: number; a: number; dist: number; len: number; col: string; t0: number; life: number }
  | {
      kind: "c";
      x: number;
      y: number;
      vx: number;
      vy: number;
      w: number;
      h: number;
      rot: number;
      vr: number;
      flip: number;
      col: string;
      t0: number;
      life: number;
    };

const particles: Particle[] = [];
let fxCanvas: HTMLCanvasElement | null = null;
let fxOn = false;

function ensure() {
  if (!fxCanvas) return 1;
  const d = Math.min(devicePixelRatio || 1, 2);
  const w = innerWidth * d;
  const h = innerHeight * d;
  if (fxCanvas.width !== w || fxCanvas.height !== h) {
    fxCanvas.width = w;
    fxCanvas.height = h;
  }
  return d;
}

function loop() {
  const d = ensure();
  const canvas = fxCanvas;
  if (!canvas) return;
  const x = canvas.getContext("2d");
  if (!x) return;
  x.setTransform(d, 0, 0, d, 0, 0);
  x.clearRect(0, 0, innerWidth, innerHeight);
  const now = performance.now();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    const age = now - p.t0;
    const k = age / p.life;
    if (k >= 1) {
      particles.splice(i, 1);
      continue;
    }
    if (p.kind === "spark") {
      const e = 1 - Math.pow(1 - k, 3);
      const d1 = p.dist * e;
      const len = p.len * (1 - k);
      x.strokeStyle = p.col;
      x.lineWidth = 2;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(p.x + Math.cos(p.a) * d1, p.y + Math.sin(p.a) * d1);
      x.lineTo(p.x + Math.cos(p.a) * (d1 + len), p.y + Math.sin(p.a) * (d1 + len));
      x.stroke();
    } else {
      p.vy += 0.18;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      x.save();
      x.globalAlpha = Math.min(1, (1 - k) * 2);
      x.translate(p.x, p.y);
      x.rotate(p.rot);
      x.scale(1, Math.cos(age * p.flip));
      x.fillStyle = p.col;
      x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      x.restore();
    }
  }
  if (particles.length) requestAnimationFrame(loop);
  else {
    fxOn = false;
    x.clearRect(0, 0, innerWidth, innerHeight);
  }
}

function kick() {
  if (!fxOn) {
    fxOn = true;
    requestAnimationFrame(loop);
  }
}

export function burstConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cols = ["#1C9AFF", "#1481E2", "#1E2E53", "#3C5896", "#DCE2F7", "#9FD3FF"];
  const t0 = performance.now();
  const x0 = innerWidth / 2;
  const y0 = innerHeight * 0.32;
  for (let i = 0; i < 150; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25;
    const v = 6 + Math.random() * 9;
    particles.push({
      kind: "c",
      x: x0,
      y: y0,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.3,
      flip: 0.004 + Math.random() * 0.01,
      col: cols[i % cols.length],
      t0,
      life: 2200 + Math.random() * 900,
    });
  }
  kick();
}

function spark(x: number, y: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const t0 = performance.now();
  for (let i = 0; i < 9; i++) {
    particles.push({
      kind: "spark",
      x,
      y,
      a: (i / 9) * 6.283 + Math.random() * 0.3,
      dist: 22 + Math.random() * 8,
      len: 11,
      col: "#1C9AFF",
      t0,
      life: 460,
    });
  }
  kick();
}

export function FxLayer() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    fxCanvas = ref.current;
    const onDown = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target.closest("button") : null;
      if (!el || (el as HTMLButtonElement).disabled) return;
      spark(e.clientX, e.clientY);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      if (fxCanvas === ref.current) fxCanvas = null;
    };
  }, []);
  return <canvas ref={ref} className="fx" aria-hidden />;
}
