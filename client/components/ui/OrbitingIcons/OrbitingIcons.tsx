"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Mail, Instagram, Facebook } from "lucide-react";
import Image from "next/image";

type Props = {
  className?: string;
  height?: number;
  radius?: number;
};

type Pos = { x: number; y: number; rotate: number };

export default function OrbitingIcons({
  className = "",
  height = 320,
  radius: radiusProp,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: height });

  const [phase, setPhase] = useState<"scatter" | "converge" | "orbit">(
    "scatter"
  );

  const hubControls = useAnimation();
  const iconControls = [useAnimation(), useAnimation(), useAnimation()];

  // Scale factor (1 = base, shrink on small screens)
  const baseSize = 320;
  const scaleFactor = Math.min(
    1,
    Math.min(containerSize.w, containerSize.h) / baseSize
  );

  // Dynamic radius
  const radius =
    radiusProp ??
    Math.max(
      40,
      (Math.min(containerSize.w, containerSize.h) / 2 - 60) * scaleFactor
    );

  // Track current positions
  const currentPosRef = useRef<Pos[]>(
    Array.from({ length: 3 }, () => ({ x: 0, y: 0, rotate: 0 }))
  );

  const setCurrent = (i: number, p: Pos) => {
    currentPosRef.current[i] = p;
  };
  const getCurrent = (i: number) => currentPosRef.current[i];

  // make orbit tighter
  const orbitR = radius * 0.55; // 60% of radius, tweak this number as you like

  const orbitAnchors: Pos[] = [
    { x: 0, y: -orbitR, rotate: 0 },
    { x: 0.866 * orbitR, y: 0.5 * orbitR, rotate: 0 },
    { x: -0.866 * orbitR, y: 0.5 * orbitR, rotate: 0 },
  ];

  const getRandomScatterPositions = (count: number): Pos[] => {
    const positions: Pos[] = [];
    // scatter close to the tighter orbit (±20%)
    const minR = orbitR * 0.8;
    const maxR = orbitR * 1.2;

    for (let i = 0; i < count; i++) {
      const base = i * 120;
      const jitter = Math.random() * 60 - 30;
      const a = ((base + jitter) * Math.PI) / 180;
      const r = minR + Math.random() * (maxR - minR);

      positions.push({
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        rotate: -15 + Math.random() * 30,
      });
    }
    return positions;
  };

  // Helper: animate from current → new positions
  const animateFromCurrent = async (
    idx: number,
    toXs: number[],
    toYs: number[],
    toRotate: number | number[] | undefined,
    transition: any
  ) => {
    const cur = getCurrent(idx);
    const x = [cur.x, ...toXs];
    const y = [cur.y, ...toYs];
    const rotate =
      typeof toRotate === "number"
        ? [cur.rotate, toRotate]
        : Array.isArray(toRotate)
          ? [cur.rotate, ...toRotate]
          : undefined;

    await iconControls[idx].start({ x, y, rotate, transition });

    // Save last
    setCurrent(idx, {
      x: x[x.length - 1],
      y: y[y.length - 1],
      rotate: rotate
        ? Array.isArray(rotate)
          ? rotate[rotate.length - 1]
          : rotate
        : cur.rotate,
    });
  };

  // 🔑 Animation loop
  useEffect(() => {
    let mounted = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const runOnce = async () => {
      if (!mounted) return;

      // === Scatter ===
      setPhase("scatter");
      const scatters = getRandomScatterPositions(iconControls.length);
      await Promise.all(
        iconControls.map((_, i) =>
          animateFromCurrent(
            i,
            [scatters[i].x],
            [scatters[i].y],
            scatters[i].rotate,
            { duration: 1.8, ease: "easeInOut" }
          )
        )
      );

      // === Converge ===
      setPhase("converge");
      await hubControls.start({
        scale: [1, 1.15, 1],
        boxShadow: [
          "0 0 20px rgba(147,51,234,.5)",
          "0 0 40px rgba(147,51,234,.8)",
          "0 0 20px rgba(147,51,234,.5)",
        ],
        transition: { duration: 0.8, ease: "easeOut" },
      });

      for (let i = 0; i < iconControls.length; i++) {
        if (!mounted) return;
        await animateFromCurrent(
          i,
          [orbitAnchors[i].x],
          [orbitAnchors[i].y],
          0,
          { duration: 0.9, ease: "easeInOut" }
        );
        await hubControls.start({
          scale: 1 + (i + 1) * 0.05,
          transition: { duration: 0.25 },
        });
        await wait(100);
      }

      // === Orbit ===
      // === Orbit ===
      setPhase("orbit");
      const laps = 3;
      const duration = 4;

      await Promise.all(
        iconControls.map((_, i) => {
          const cur = getCurrent(i);
          const startAngle = Math.atan2(cur.y, cur.x);

          // 👉 вместо 4*laps точки, правим 120*laps за гладка орбита
          const steps = 120 * laps;
          const angles: number[] = [];
          for (let k = 1; k <= steps; k++) {
            angles.push(startAngle + (k * 2 * Math.PI) / 120);
          }

          const xs = angles.map((a) => orbitR * Math.cos(a));
          const ys = angles.map((a) => orbitR * Math.sin(a));

          return animateFromCurrent(i, xs, ys, undefined, {
            duration: duration * laps,
            ease: "linear",
          });
        })
      );

      await wait(300);
    };

    const loop = async () => {
      while (mounted) {
        await runOnce();
      }
    };

    loop();
    return () => {
      mounted = false;
    };
  }, [orbitR, containerSize.h]);

  // Track container size (responsive)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Icons
  const icons = [
    { Icon: Instagram, color: "text-pink-500" },
    { Icon: Mail, color: "text-red-500" },
    { Icon: Facebook, color: "text-blue-600" },
  ];

  // Sizes scale with container
  const hubSize = 112 * scaleFactor;
  const iconWrapperSize = 48 * scaleFactor;
  const iconSize = 30 * scaleFactor;

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex items-center justify-center overflow-hidden bg-transparent ${className}`}
      style={{ height }}
    >
      {/* Hub */}
      <motion.div
        animate={hubControls}
        className="relative z-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-900 to-purple-700 flex items-center justify-center shadow-lg"
        style={{
          width: hubSize,
          height: hubSize,
          boxShadow:
            "0 0 20px rgba(147,51,234,.5), inset 0 0 20px rgba(255,255,255,.3)",
        }}
      >
        <div
          className="text-white flex items-baseline text-center leading-tight"
          style={{ fontSize: `${12 * scaleFactor}px` }}
        >
          <Image
            src="/assets/inboxlyone.png"
            alt="Inboxlyone"
            width={20 * scaleFactor}
            height={20 * scaleFactor}
            className="object-contain mb-1 mx-1"
          />
          Inboxlyone
        </div>
      </motion.div>

      {/* Orbiting Icons */}
      {icons.map(({ Icon, color }, index) => (
        <motion.div
          key={index}
          animate={iconControls[index]}
          className={`absolute ${color} `}
          style={{
            width: iconWrapperSize,
            height: iconWrapperSize,
          }}
        >
          <Icon size={iconSize} />
        </motion.div>
      ))}

      {/* Orbit guide */}
      {phase === "orbit" && (
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <circle
            cx="50%"
            cy="50%"
            r={orbitR}
            fill="none"
            stroke="rgba(147,51,234,.4)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </motion.svg>
      )}
    </div>
  );
}
