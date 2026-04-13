"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

// ── Color palettes matching the wedding site ──
const COLORS_DARK = [
  [211, 0, 113],   // --color-darkprimary #D30071
  [214, 146, 183], // --color-darksecondary #D692B7
  [239, 194, 255], // --color-accent #EFC2FF
  [140, 88, 245],  // --color-lightsecondary #8C58F5
  [255, 200, 230], // soft pink
  [180, 130, 255], // pale violet
];

const COLORS_LIGHT = [
  [42, 0, 127],    // --color-lightprimary #2A007F
  [140, 88, 245],  // --color-lightsecondary #8C58F5
  [211, 0, 113],   // --color-darkprimary #D30071
  [100, 40, 180],  // deep purple
  [79, 20, 200],   // indigo
  [160, 60, 220],  // medium purple
];

export function StarfieldBackground() {
  const canvasRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const isDarkRef = useRef(true);
  const animFrameRef = useRef(null);

  useEffect(() => {
    isDarkRef.current = resolvedTheme === "dark";
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W, H, stars;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    }

    class Star {
      constructor(initial = false) {
        this.reset(initial);
      }

      reset(initial = false) {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.baseRadius = Math.random() * 2.2 + 0.4;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 1.2 + 0.4;
        this.maxLife = Math.random() * 4000 + 2000;
        this.born =
          performance.now() - (initial ? Math.random() * 6000 : 0);
        const ci = Math.floor(Math.random() * COLORS_DARK.length);
        this.colorIdxDark = ci;
        this.colorIdxLight = ci % COLORS_LIGHT.length;
        this.twinkleAmt = Math.random() * 0.5 + 0.5;
        this.driftX = (Math.random() - 0.5) * 0.15;
        this.driftY = (Math.random() - 0.5) * 0.1;
      }

      update(now) {
        const life = now - this.born;
        this.x += this.driftX;
        this.y += this.driftY;
        if (
          life > this.maxLife ||
          this.x < -10 ||
          this.x > W + 10 ||
          this.y < -10 ||
          this.y > H + 10
        ) {
          this.reset(false);
        }
      }

      draw(now) {
        const life = now - this.born;
        const t = life / this.maxLife;

        let alpha;
        if (t < 0.2) alpha = t / 0.2;
        else if (t > 0.8) alpha = (1 - t) / 0.2;
        else alpha = 1;

        const twinkle =
          Math.sin(now * 0.001 * this.speed + this.phase) * 0.5 + 0.5;
        alpha *= (1 - this.twinkleAmt) + this.twinkleAmt * twinkle;

        const isDark = isDarkRef.current;
        const colors = isDark ? COLORS_DARK : COLORS_LIGHT;
        const ci = isDark ? this.colorIdxDark : this.colorIdxLight;
        const [r, g, b] = colors[ci];
        const radius = this.baseRadius * (0.7 + twinkle * 0.3);

        if (radius > 1 && alpha > 0.3) {
          const grad = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, radius * 4
          );
          grad.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.35})`);
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.beginPath();
          ctx.arc(this.x, this.y, radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }
    }

    function initStars() {
      const count = Math.min(Math.floor((W * H) / 3500), 300);
      stars = Array.from({ length: count }, () => new Star(true));
    }

    function animate(now) {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.update(now);
        s.draw(now);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    resize();
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <>
      {/* Canvas starfield — desktop only (md+) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 hidden md:block pointer-events-none"
      />

      {/* Nebula blobs — desktop only */}
      <div className="fixed inset-0 -z-10 hidden md:block pointer-events-none overflow-hidden">
        <div
          className="nebula-blob"
          style={{
            width: "55vw", height: "55vw",
            top: "-10vw", left: "-10vw",
            background: "radial-gradient(circle, rgba(42,0,127,0.08), transparent 70%)",
            animation: "nebulaDrift1 25s ease-in-out infinite alternate",
          }}
        />
        <div
          className="nebula-blob"
          style={{
            width: "45vw", height: "45vw",
            bottom: "-8vw", right: "-8vw",
            background: "radial-gradient(circle, rgba(211,0,113,0.06), transparent 70%)",
            animation: "nebulaDrift2 30s ease-in-out infinite alternate",
          }}
        />
        <div
          className="nebula-blob"
          style={{
            width: "30vw", height: "30vw",
            top: "40%", left: "50%",
            background: "radial-gradient(circle, rgba(140,88,245,0.05), transparent 70%)",
            opacity: 0.5,
            animation: "nebulaDrift3 20s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Mobile static background (below md) */}
      <div className="fixed inset-0 -z-10 md:hidden pointer-events-none">
        <div className="absolute inset-0 mobile-stars" />
      </div>

      <style>{`
        .nebula-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
        }

        @keyframes nebulaDrift1 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(8vw, 6vw) scale(1.15); }
        }
        @keyframes nebulaDrift2 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-6vw, -8vw) scale(1.1); }
        }
        @keyframes nebulaDrift3 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-10vw, 5vw) scale(1.2); }
        }

        /* Mobile static stars — dark mode */
        .dark .mobile-stars {
          background-image:
            radial-gradient(1.5px 1.5px at 10% 15%, rgba(211,0,113,0.8), transparent),
            radial-gradient(1px 1px at 25% 40%, rgba(214,146,183,0.7), transparent),
            radial-gradient(2px 2px at 40% 10%, rgba(239,194,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 55% 60%, rgba(140,88,245,0.8), transparent),
            radial-gradient(1px 1px at 70% 25%, rgba(255,200,230,0.7), transparent),
            radial-gradient(2px 2px at 80% 75%, rgba(211,0,113,0.6), transparent),
            radial-gradient(1px 1px at 90% 45%, rgba(214,146,183,0.8), transparent),
            radial-gradient(1.5px 1.5px at 15% 70%, rgba(140,88,245,0.7), transparent),
            radial-gradient(1px 1px at 35% 85%, rgba(239,194,255,0.6), transparent),
            radial-gradient(2px 2px at 60% 90%, rgba(211,0,113,0.7), transparent),
            radial-gradient(1px 1px at 75% 5%, rgba(180,130,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 5% 50%, rgba(214,146,183,0.6), transparent),
            radial-gradient(1px 1px at 45% 30%, rgba(140,88,245,0.7), transparent),
            radial-gradient(2px 2px at 85% 55%, rgba(211,0,113,0.8), transparent),
            radial-gradient(1px 1px at 20% 95%, rgba(239,194,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 65% 45%, rgba(140,88,245,0.7), transparent),
            radial-gradient(1px 1px at 30% 20%, rgba(214,146,183,0.8), transparent),
            radial-gradient(2px 2px at 95% 30%, rgba(180,130,255,0.6), transparent),
            radial-gradient(1px 1px at 50% 75%, rgba(211,0,113,0.7), transparent),
            radial-gradient(1.5px 1.5px at 8% 35%, rgba(140,88,245,0.8), transparent);
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }

        /* Mobile static stars — light mode */
        .mobile-stars {
          background-image:
            radial-gradient(1.5px 1.5px at 10% 15%, rgba(42,0,127,0.35), transparent),
            radial-gradient(1px 1px at 25% 40%, rgba(140,88,245,0.3), transparent),
            radial-gradient(2px 2px at 40% 10%, rgba(211,0,113,0.25), transparent),
            radial-gradient(1.5px 1.5px at 55% 60%, rgba(42,0,127,0.35), transparent),
            radial-gradient(1px 1px at 70% 25%, rgba(100,40,180,0.3), transparent),
            radial-gradient(2px 2px at 80% 75%, rgba(140,88,245,0.25), transparent),
            radial-gradient(1px 1px at 90% 45%, rgba(42,0,127,0.35), transparent),
            radial-gradient(1.5px 1.5px at 15% 70%, rgba(160,60,220,0.3), transparent),
            radial-gradient(1px 1px at 35% 85%, rgba(211,0,113,0.25), transparent),
            radial-gradient(2px 2px at 60% 90%, rgba(42,0,127,0.3), transparent),
            radial-gradient(1px 1px at 75% 5%, rgba(140,88,245,0.35), transparent),
            radial-gradient(1.5px 1.5px at 5% 50%, rgba(79,20,200,0.25), transparent),
            radial-gradient(1px 1px at 45% 30%, rgba(211,0,113,0.3), transparent),
            radial-gradient(2px 2px at 85% 55%, rgba(42,0,127,0.35), transparent),
            radial-gradient(1px 1px at 20% 95%, rgba(140,88,245,0.25), transparent),
            radial-gradient(1.5px 1.5px at 65% 45%, rgba(100,40,180,0.3), transparent),
            radial-gradient(1px 1px at 30% 20%, rgba(42,0,127,0.35), transparent),
            radial-gradient(2px 2px at 95% 30%, rgba(160,60,220,0.25), transparent),
            radial-gradient(1px 1px at 50% 75%, rgba(211,0,113,0.3), transparent),
            radial-gradient(1.5px 1.5px at 8% 35%, rgba(42,0,127,0.35), transparent);
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }
      `}</style>
    </>
  );
}
