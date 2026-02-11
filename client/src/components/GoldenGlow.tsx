import { useEffect, useRef } from "react";

/**
 * GoldenGlow — A Canvas-based radiant golden energy glow effect.
 *
 * Renders behind the hero text to create a luminous, star-like
 * golden light with rotating rays, pulsing core, and soft halos.
 * Inspired by solar/stellar energy visuals.
 */

export default function GoldenGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.parentElement?.clientWidth || 600;
      h = canvas.parentElement?.clientHeight || 400;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const t = now * 0.001;
      const cx = w / 2;
      const cy = h / 2;

      // ── 1. Outermost soft halo ──
      const outerPulse = 0.7 + 0.3 * Math.sin(t * 0.4);
      const outerR = Math.min(w, h) * 0.48 * outerPulse;
      const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      outerGrad.addColorStop(0, "rgba(191, 163, 106, 0.12)");
      outerGrad.addColorStop(0.3, "rgba(191, 163, 106, 0.06)");
      outerGrad.addColorStop(0.7, "rgba(160, 130, 70, 0.02)");
      outerGrad.addColorStop(1, "transparent");
      ctx.fillStyle = outerGrad;
      ctx.fillRect(0, 0, w, h);

      // ── 2. Rotating light rays ──
      const numRays = 12;
      const rayBaseLen = Math.min(w, h) * 0.38;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2 + t * 0.15;
        // Each ray has slightly different pulse phase
        const rayPulse = 0.5 + 0.5 * Math.sin(t * 0.8 + i * 0.8);
        const rayLen = rayBaseLen * (0.6 + 0.4 * rayPulse);
        const rayWidth = Math.PI * 0.015 * (0.7 + 0.3 * rayPulse);

        const grad = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
        const alpha = 0.06 + 0.06 * rayPulse;
        grad.addColorStop(0, `rgba(240, 210, 130, ${alpha * 2})`);
        grad.addColorStop(0.3, `rgba(220, 185, 100, ${alpha})`);
        grad.addColorStop(0.7, `rgba(191, 163, 106, ${alpha * 0.3})`);
        grad.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angle - rayWidth) * rayLen,
          Math.sin(angle - rayWidth) * rayLen
        );
        ctx.lineTo(
          Math.cos(angle + rayWidth) * rayLen,
          Math.sin(angle + rayWidth) * rayLen
        );
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ── 3. Secondary set of thinner, faster-rotating rays ──
      const numRays2 = 8;
      for (let i = 0; i < numRays2; i++) {
        const angle = (i / numRays2) * Math.PI * 2 - t * 0.1;
        const rayPulse = 0.4 + 0.6 * Math.sin(t * 1.2 + i * 1.1);
        const rayLen = rayBaseLen * 0.7 * (0.5 + 0.5 * rayPulse);
        const rayWidth = Math.PI * 0.008;

        const grad = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
        const alpha = 0.04 + 0.04 * rayPulse;
        grad.addColorStop(0, `rgba(255, 225, 150, ${alpha * 2})`);
        grad.addColorStop(0.5, `rgba(220, 190, 110, ${alpha})`);
        grad.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angle - rayWidth) * rayLen,
          Math.sin(angle - rayWidth) * rayLen
        );
        ctx.lineTo(
          Math.cos(angle + rayWidth) * rayLen,
          Math.sin(angle + rayWidth) * rayLen
        );
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.restore();
      ctx.globalCompositeOperation = "source-over";

      // ── 4. Middle warm halo ──
      const midPulse = 0.75 + 0.25 * Math.sin(t * 0.6 + 0.5);
      const midR = Math.min(w, h) * 0.22 * midPulse;
      const midGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, midR);
      midGrad.addColorStop(0, "rgba(240, 210, 130, 0.25)");
      midGrad.addColorStop(0.4, "rgba(220, 185, 100, 0.12)");
      midGrad.addColorStop(0.8, "rgba(191, 163, 106, 0.04)");
      midGrad.addColorStop(1, "transparent");
      ctx.fillStyle = midGrad;
      ctx.fillRect(0, 0, w, h);

      // ── 5. Bright core ──
      const corePulse = 0.8 + 0.2 * Math.sin(t * 0.9);
      const coreR = Math.min(w, h) * 0.08 * corePulse;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrad.addColorStop(0, "rgba(255, 235, 170, 0.35)");
      coreGrad.addColorStop(0.5, "rgba(240, 210, 130, 0.15)");
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.fillRect(cx - coreR, cy - coreR, coreR * 2, coreR * 2);

      // ── 6. Swirling orbital rings (like the reference image) ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = "lighter";
      
      for (let ring = 0; ring < 3; ring++) {
        const ringR = Math.min(w, h) * (0.12 + ring * 0.1);
        const ringPulse = 0.6 + 0.4 * Math.sin(t * 0.5 + ring * 1.2);
        const ringAngle = t * (0.2 - ring * 0.05);
        const tilt = 0.3 + ring * 0.15;

        ctx.save();
        ctx.rotate(ringAngle);
        ctx.scale(1, tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, ringR, ringR, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(220, 190, 120, ${0.06 * ringPulse})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
      ctx.globalCompositeOperation = "source-over";

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
