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
  const [phase, setPhase] = useState<"scatter" | "converge" | "orbit">(
    "scatter"
  );

  const hubControls = useAnimation();
  const iconControls = [useAnimation(), useAnimation(), useAnimation()];

  const radius = radiusProp ?? 120;

  // Track each icon’s last known end position so every new animation starts from it
  const currentPosRef = useRef<Pos[]>(
    Array.from({ length: 3 }, () => ({ x: 0, y: 0, rotate: 0 }))
  );

  const setCurrent = (i: number, p: Pos) => {
    currentPosRef.current[i] = p;
  };
  const getCurrent = (i: number) => currentPosRef.current[i];

  const orbitAnchors: Pos[] = [
    { x: 0, y: -radius, rotate: 0 }, // -90°
    { x: 0.866 * radius, y: 0.5 * radius, rotate: 0 }, // 30°
    { x: -0.866 * radius, y: 0.5 * radius, rotate: 0 }, // 150°
  ];

  const getRandomScatterPositions = (count: number): Pos[] => {
    const positions: Pos[] = [];
    const minR = radius + 40;
    const maxR = Math.min(height / 2 - 20, radius + 160);
    for (let i = 0; i < count; i++) {
      const base = i * 120;
      const jitter = Math.random() * 60 - 30; // ±30°
      const a = ((base + jitter) * Math.PI) / 180;
      const r = Math.max(
        minR,
        Math.min(maxR, minR + Math.random() * (maxR - minR || 1))
      );
      positions.push({
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        rotate: -15 + Math.random() * 30,
      });
    }
    return positions;
  };

  // Helper: animate from current -> ...keyframes (we prepend current to avoid jumps)
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
    // After completion, set current to the last of our keyframes
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

  useEffect(() => {
    let mounted = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const runOnce = async () => {
      if (!mounted) return;

      // === SCATTER (from wherever we are -> new random positions) ===
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

      // === CONVERGE (hub pulse + move to each icon’s orbit anchor) ===
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

      // === ORBIT (continue from the exact angle where you are now) ===
      setPhase("orbit");
      const laps = 3; // 3 full circles without resetting
      const duration = 4; // seconds per full circle

      await Promise.all(
        iconControls.map((_, i) => {
          const cur = getCurrent(i);
          // compute current angle relative to center from current x/y
          const startAngle = Math.atan2(cur.y, cur.x); // radians
          // Build angles for smooth quarter steps over N laps * 360°
          const steps = 4 * laps;
          const angles: number[] = [];
          for (let k = 1; k <= steps; k++) {
            angles.push(startAngle + (k * (2 * Math.PI)) / 4); // +90° per step
          }
          const xs = angles.map((a) => radius * Math.cos(a));
          const ys = angles.map((a) => radius * Math.sin(a));

          return animateFromCurrent(i, xs, ys, undefined, {
            duration: duration * laps,
            ease: "linear",
          });
        })
      );

      // loop continues; next scatter will start from the exact last orbit point
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, radius]);

  const icons = [
    { Icon: Instagram, color: "text-pink-500" },
    { Icon: Mail, color: "text-red-500" },
    { Icon: Facebook, color: "text-blue-600" },
  ];

  return (
    <div
      className={`relative w-full flex items-center justify-center overflow-hidden bg-transparent ${className}`}
      style={{ height }}
    >
      {/* Central Hub */}
      <motion.div
        animate={hubControls}
        className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 via-purple-900 to-purple-700 flex items-center justify-center shadow-lg"
        style={{
          boxShadow:
            "0 0 20px rgba(147,51,234,.5), inset 0 0 20px rgba(255,255,255,.3)",
        }}
      >
        <div className="text-white flex items-baseline text-sm text-center leading-tight">
          <Image
            src="/assets/inboxlyone.png"
            alt="Inboxlyone"
            width={20}
            height={20}
            className="object-contain mb-4 mx-1"
          />
          Inboxlyone
        </div>
      </motion.div>

      {/* Icons */}
      {icons.map(({ Icon, color }, index) => (
        <motion.div
          key={index}
          animate={iconControls[index]}
          className={`absolute w-12 h-12 ${color} flex items-center justify-center rounded-full shadow-lg`}
        >
          <Icon size={30} />
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
            r={radius}
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
