import { useEffect, useRef, useCallback } from "react";

/**
 * CosmicBreath — A living, breathing cosmic background for A.Cosmos.
 * 
 * Five-layer particle system:
 *   Layer 1: Stardust (~800) — very faint, creates depth
 *   Layer 2: Cool stars (~150) — blue-white, rationality & clarity
 *   Layer 3: Warm stars (~100) — gold/amber, warmth & guardianship
 *   Layer 4: Bright stars (~30) — cross-ray diffraction, focal points
 *   Layer 5: Cursor trail (dynamic) — gold particles following cursor
 * 
 * Breathing cycle: 30s subtle brightness oscillation
 * Respects prefers-reduced-motion
 * Performance: auto-degrades on low-end devices
 */

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  driftX: number;
  driftY: number;
  color: [number, number, number]; // RGB
}

interface BrightStar extends Star {
  rayLength: number;
  rayAlpha: number;
}

interface TrailParticle {
  x: number;
  y: number;
  alpha: number;
  size: number;
  vx: number;
  vy: number;
  life: number;
}

// Detect low-end device
const isLowEnd = () => {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 4;
  return cores <= 2;
};

// Check reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export default function CosmicBreath() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const trailRef = useRef<TrailParticle[]>([]);
  const animFrameRef = useRef<number>(0);
  const starsRef = useRef<{
    stardust: Star[];
    cool: Star[];
    warm: Star[];
    bright: BrightStar[];
  }>({ stardust: [], cool: [], warm: [], bright: [] });
  const initializedRef = useRef(false);

  const createStars = useCallback((width: number, height: number) => {
    const lowEnd = isLowEnd();
    const scale = lowEnd ? 0.4 : 1;

    // Layer 1: Stardust
    const stardust: Star[] = [];
    const stardustCount = Math.floor(800 * scale);
    for (let i = 0; i < stardustCount; i++) {
      stardust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 0.8 + 0.2,
        baseAlpha: Math.random() * 0.15 + 0.03,
        alpha: 0,
        twinkleSpeed: Math.random() * 0.0003 + 0.0001,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.015,
        driftY: (Math.random() - 0.5) * 0.01,
        color: [200 + Math.random() * 55, 210 + Math.random() * 45, 230 + Math.random() * 25],
      });
    }

    // Layer 2: Cool stars (blue-white)
    const cool: Star[] = [];
    const coolCount = Math.floor(150 * scale);
    for (let i = 0; i < coolCount; i++) {
      cool.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.5,
        baseAlpha: Math.random() * 0.4 + 0.15,
        alpha: 0,
        twinkleSpeed: Math.random() * 0.0008 + 0.0002,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.008,
        driftY: (Math.random() - 0.5) * 0.006,
        color: [180 + Math.random() * 40, 200 + Math.random() * 30, 240 + Math.random() * 15],
      });
    }

    // Layer 3: Warm stars (gold/amber)
    const warm: Star[] = [];
    const warmCount = Math.floor(100 * scale);
    for (let i = 0; i < warmCount; i++) {
      warm.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.3 + 0.6,
        baseAlpha: Math.random() * 0.35 + 0.1,
        alpha: 0,
        twinkleSpeed: Math.random() * 0.0006 + 0.0002,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.01,
        driftY: (Math.random() - 0.5) * 0.008,
        color: [220 + Math.random() * 35, 180 + Math.random() * 40, 100 + Math.random() * 50],
      });
    }

    // Layer 4: Bright stars with cross-rays
    const bright: BrightStar[] = [];
    const brightCount = Math.floor(30 * scale);
    for (let i = 0; i < brightCount; i++) {
      bright.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 1,
        baseAlpha: Math.random() * 0.5 + 0.3,
        alpha: 0,
        twinkleSpeed: Math.random() * 0.001 + 0.0003,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.005,
        driftY: (Math.random() - 0.5) * 0.004,
        color: Math.random() > 0.5
          ? [240 + Math.random() * 15, 230 + Math.random() * 25, 200 + Math.random() * 55] // warm white
          : [200 + Math.random() * 30, 220 + Math.random() * 20, 250 + Math.random() * 5], // cool white
        rayLength: Math.random() * 8 + 4,
        rayAlpha: Math.random() * 0.3 + 0.1,
      });
    }

    starsRef.current = { stardust, cool, warm, bright };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reducedMotion = prefersReducedMotion();

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!initializedRef.current) {
        createStars(window.innerWidth, window.innerHeight);
        initializedRef.current = true;
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // Mouse tracking for trail
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      if (!reducedMotion) {
        // Spawn trail particles
        for (let i = 0; i < 2; i++) {
          trailRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 6,
            y: e.clientY + (Math.random() - 0.5) * 6,
            alpha: 0.4 + Math.random() * 0.2,
            size: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5 - 0.2,
            life: 1,
          });
        }
        // Limit trail particles
        if (trailRef.current.length > 60) {
          trailRef.current = trailRef.current.slice(-60);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Draw background gradient
    const drawBackground = (breathPhase: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Option 1: center #141B3D, mid #0E2A47, edge #0A0E27
      // Breathing modulates the center brightness slightly
      const breathMod = reducedMotion ? 0 : Math.sin(breathPhase) * 0.03;

      const grad = ctx.createRadialGradient(
        w * 0.5, h * 0.45, 0,
        w * 0.5, h * 0.45, Math.max(w, h) * 0.8
      );
      
      // Center: deep navy with slight warmth
      const cR = 20 + breathMod * 80;
      const cG = 27 + breathMod * 60;
      const cB = 61 + breathMod * 40;
      grad.addColorStop(0, `rgb(${cR}, ${cG}, ${cB})`);
      // Mid ring
      grad.addColorStop(0.5, `rgb(${14 + breathMod * 30}, ${42 + breathMod * 20}, ${71 + breathMod * 15})`);
      // Edge: very dark blue
      grad.addColorStop(1, "rgb(10, 14, 39)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle nebula hints
      const nebula1 = ctx.createRadialGradient(
        w * 0.25, h * 0.8, 0,
        w * 0.25, h * 0.8, w * 0.35
      );
      nebula1.addColorStop(0, "rgba(40, 20, 80, 0.12)");
      nebula1.addColorStop(1, "transparent");
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, w, h);

      const nebula2 = ctx.createRadialGradient(
        w * 0.75, h * 0.2, 0,
        w * 0.75, h * 0.2, w * 0.3
      );
      nebula2.addColorStop(0, "rgba(20, 50, 90, 0.1)");
      nebula2.addColorStop(1, "transparent");
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, w, h);
    };

    // Draw a single star
    const drawStar = (star: Star, time: number) => {
      if (reducedMotion) {
        star.alpha = star.baseAlpha;
      } else {
        // Twinkle
        star.alpha = star.baseAlpha * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset));
        // Drift
        star.x += star.driftX;
        star.y += star.driftY;
        // Wrap
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (star.x < -10) star.x = w + 10;
        if (star.x > w + 10) star.x = -10;
        if (star.y < -10) star.y = h + 10;
        if (star.y > h + 10) star.y = -10;
      }

      const [r, g, b] = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.alpha})`;
      ctx.fill();
    };

    // Draw bright star with cross-rays
    const drawBrightStar = (star: BrightStar, time: number) => {
      drawStar(star, time);

      if (star.alpha < 0.1) return;

      const rayAlpha = star.rayAlpha * star.alpha;
      const [r, g, b] = star.color;
      const len = star.rayLength * (0.8 + 0.2 * Math.sin(time * star.twinkleSpeed * 1.5 + star.twinkleOffset));

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${rayAlpha})`;
      ctx.lineWidth = 0.5;

      // Horizontal ray
      ctx.beginPath();
      ctx.moveTo(star.x - len, star.y);
      ctx.lineTo(star.x + len, star.y);
      ctx.stroke();

      // Vertical ray
      ctx.beginPath();
      ctx.moveTo(star.x, star.y - len);
      ctx.lineTo(star.x, star.y + len);
      ctx.stroke();
    };

    // Draw trail particles
    const drawTrail = () => {
      const trail = trailRef.current;
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;
        p.alpha *= 0.97;

        if (p.life <= 0 || p.alpha < 0.01) {
          trail.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 180, 100, ${p.alpha * p.life})`;
        ctx.fill();
      }
    };

    // Animation loop
    let startTime = performance.now();
    const animate = (now: number) => {
      const time = now - startTime;
      const breathPhase = (time / 30000) * Math.PI * 2; // 30s cycle

      drawBackground(breathPhase);

      const { stardust, cool, warm, bright } = starsRef.current;

      // Apply breathing to all stars
      const breathMod = reducedMotion ? 1 : 1 + Math.sin(breathPhase) * 0.08;

      // Draw layers
      for (const star of stardust) {
        const origAlpha = star.baseAlpha;
        star.baseAlpha = origAlpha * breathMod;
        drawStar(star, time);
        star.baseAlpha = origAlpha;
      }

      for (const star of cool) {
        const origAlpha = star.baseAlpha;
        star.baseAlpha = origAlpha * breathMod;
        drawStar(star, time);
        star.baseAlpha = origAlpha;
      }

      for (const star of warm) {
        const origAlpha = star.baseAlpha;
        star.baseAlpha = origAlpha * breathMod;
        drawStar(star, time);
        star.baseAlpha = origAlpha;
      }

      for (const star of bright) {
        const origAlpha = star.baseAlpha;
        star.baseAlpha = origAlpha * breathMod;
        drawBrightStar(star, time);
        star.baseAlpha = origAlpha;
      }

      // Layer 5: Cursor trail
      if (!reducedMotion) {
        drawTrail();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [createStars]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
