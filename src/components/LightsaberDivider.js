"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", check);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", check);
    };
  }, []);
  return isDark;
}

const THEMES = {
  dark: {
    // Ahsoka White for Dark Mode
    core: "#ffffff",
    mid: "#e2e8f0",
    tip: "rgba(226, 232, 240, 0.05)",
    glow: "rgba(255, 255, 255, 0.6)",
    glowWide: "rgba(255, 255, 255, 0.15)",
    // Bright chrome for dark background
    m1: "#f1f5f9",
    m2: "#94a3b8",
    m3: "#475569",
    accent: "#1e293b",
    button: "#ffffff",
  },
  light: {
    // Dark Purple for Light Mode
    core: "#ffffff", 
    mid: "#4c1d95", 
    tip: "rgba(76, 29, 149, 0.12)",
    glow: "rgba(109, 40, 217, 0.75)",
    glowWide: "rgba(109, 40, 217, 0.18)",
    // Darker steel for light background
    m1: "#64748b", // Brushed steel gray top
    m2: "#334155",
    m3: "#0f172a",
    accent: "#020617",
    button: "#7c3aed",
  },
};

function Lightsaber({ direction, isActive, t }) {
  const isLeft = direction === "left";
  const H_W = 64;
  const H_H = 16;
  const B_H = 6;

  return (
    <div
      className="relative flex items-center w-full"
      style={{ height: "44px" }}
    >
      {/* 1. BLADE */}
      <motion.div
        style={{
          position: "absolute",
          height: `${B_H}px`,
          top: 0,
          bottom: 0,
          margin: "auto 0",
          width: `calc(100% - ${H_W}px)`,
          ...(isLeft ? { right: H_W } : { left: H_W }),
          transformOrigin: isLeft ? "right center" : "left center",
          zIndex: 5,
        }}
        initial={{ scaleX: 0 }}
        animate={isActive ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "99px",
            background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${t.core}, ${t.mid} 50%, ${t.tip})`,
            boxShadow: isActive
              ? `0 0 4px #fff, 0 0 14px ${t.glow}, 0 0 28px ${t.glowWide}`
              : "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "1.5px 0",
            background: "white",
            opacity: 0.8,
            borderRadius: "99px",
            filter: "blur(0.5px)",
          }}
        />
      </motion.div>

      {/* 2. HILT */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          margin: "auto 0",
          height: `${H_H}px`,
          width: `${H_W}px`,
          ...(isLeft ? { right: 0 } : { left: 0 }),
          zIndex: 10,
        }}
      >
        {/* Main body - Removed external shadow logic */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "6px",
            background: `
        linear-gradient(
          180deg,
          ${t.m3} 0%,
          ${t.m2} 12%,
          ${t.m1} 30%,
          ${t.m2} 52%,
          ${t.m3} 100%
        )
      `,
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: `
        inset 0 1px 0 rgba(255,255,255,0.25),
        inset 0 -2px 4px rgba(0,0,0,0.25)
      `,
            overflow: "hidden",
          }}
        />

        {/* Top highlight strip */}
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: "6px",
            right: "6px",
            height: "2px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.18)",
            filter: "blur(0.2px)",
          }}
        />

        {/* Emitter section */}
        <div
          style={{
            position: "absolute",
            top: "-3px",
            bottom: "-3px",
            width: "18px",
            ...(isLeft ? { right: "-2px" } : { left: "-2px" }),
            borderRadius: isLeft ? "0 6px 6px 0" : "6px 0 0 6px",
            background: `
        linear-gradient(
          180deg,
          ${t.m1} 0%,
          ${t.m2} 35%,
          ${t.m3} 100%
        )
      `,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: `
        inset 0 1px 0 rgba(255,255,255,0.22),
        inset 0 -1px 2px rgba(0,0,0,0.25)
      `,
            clipPath: isLeft
              ? "polygon(0 18%, 100% 0, 100% 100%, 0 82%)"
              : "polygon(0 0, 100% 18%, 100% 82%, 0 100%)",
          }}
        />

        {/* Grip base */}
        <div
          style={{
            position: "absolute",
            top: "3px",
            bottom: "3px",
            width: "42px",
            ...(isLeft ? { left: "14px" } : { right: "14px" }),
            borderRadius: "4px",
            background: `
        linear-gradient(
          180deg,
          #1a1c20 0%,
          ${t.accent} 18%,
          #111317 100%
        )
      `,
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: `
        inset 0 1px 0 rgba(255,255,255,0.08),
        inset 0 -2px 4px rgba(0,0,0,0.35)
      `,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly",
            overflow: "hidden",
          }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "4px",
                height: "84%",
                borderRadius: "999px",
                background: `
            linear-gradient(
              180deg,
              rgba(255,255,255,0.18) 0%,
              rgba(255,255,255,0.04) 20%,
              rgba(0,0,0,0.35) 100%
            )
          `,
                boxShadow: "inset 0 0 2px rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>

        {/* Activation box */}
        <div
          style={{
            position: "absolute",
            top: "-7px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "24px",
            height: "10px",
            borderRadius: "3px 3px 2px 2px",
            background: `
        linear-gradient(
          180deg,
          #4c525c 0%,
          ${t.m2} 55%,
          #2a2e35 100%
        )
      `,
            border: `1px solid ${t.m3}`,
            boxShadow: `
        inset 0 1px 0 rgba(255,255,255,0.2),
        0 1px 2px rgba(0,0,0,0.2)
      `,
          }}
        >
          <motion.div
            animate={{
              backgroundColor: isActive ? t.button : "#5b6068",
              boxShadow: isActive
                ? `0 0 8px ${t.button}, inset 0 0 2px rgba(255,255,255,0.5)`
                : "inset 0 0 2px rgba(255,255,255,0.18)",
            }}
            transition={{ duration: 0.25 }}
            style={{
              position: "absolute",
              left: "4px",
              right: "4px",
              top: "2px",
              bottom: "2px",
              borderRadius: "2px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function LightsaberDivider({ delay = 150, className = "" }) {
  const isDark = useDarkMode();
  const [isActive, setIsActive] = useState(false);
  const t = isDark ? THEMES.dark : THEMES.light;

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`flex items-center justify-center w-full px-4 overflow-hidden ${className}`}
      style={{ height: "80px" }}
    >
      <div className="flex items-center justify-center w-full max-w-5xl md:gap-4">
        <div className="hidden md:block w-full">
          <Lightsaber direction="left" isActive={isActive} t={t} />
        </div>
        <div className="w-full">
          <Lightsaber direction="right" isActive={isActive} t={t} />
        </div>
      </div>
    </div>
  );
}