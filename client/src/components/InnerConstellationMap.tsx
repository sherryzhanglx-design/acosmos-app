import { useEffect, useRef, useCallback } from "react";

/**
 * InnerConstellationMap — Nebula backdrop with Guardian avatar images.
 *
 * Uses a generated cosmic nebula image as the backdrop.
 * Guardian avatars (PNG with transparent background) float over the nebula
 * without any circular frame — just the raw cutout blending into the cosmos.
 * Names appear below each avatar in golden text.
 */

interface GuardianNode {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string;
  /** Position as fraction of container (0-1) */
  xFrac: number;
  yFrac: number;
  isActive: boolean;
}

interface Props {
  /** 0-1 visibility factor driven by scroll position */
  visibility: number;
  /** slug of the currently hovered guardian card (or null) */
  hoveredGuardian: string | null;
  /** callback when a constellation node is clicked */
  onNodeClick?: (slug: string) => void;
  /** callback when hovering a node */
  onNodeHover?: (slug: string | null) => void;
}

// Avatar CDN URLs
const AVATARS: Record<string, string> = {
  andy:  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/dCYqiRmHEEeSnkZx.png",
  anya:  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/jvaFmJRQXdASRYQl.png",
  alma:  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/lLrTeiYvdbDStChq.png",
  axel:  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/KTbsWTRNwAdhObNB.png",
  alan:  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/APsAVJvhJfONWSsS.png",
  atlas: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/ZeGqdDryhkHBPLgi.png",
  amos:  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/eOVjFlKTtQnFuGnK.png",
  annie: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/plzLgfWzNLLtfILt.png",
};

// Guardian positions distributed organically across the nebula
const GUARDIAN_NODES: GuardianNode[] = [
  { id: "andy",  slug: "career",         name: "Andy",  avatarUrl: AVATARS.andy,  xFrac: 0.62, yFrac: 0.20, isActive: true },
  { id: "anya",  slug: "anxiety",        name: "Anya",  avatarUrl: AVATARS.anya,  xFrac: 0.22, yFrac: 0.48, isActive: true },
  { id: "alma",  slug: "relationships",  name: "Alma",  avatarUrl: AVATARS.alma,  xFrac: 0.56, yFrac: 0.72, isActive: true },
  { id: "axel",  slug: "transformation", name: "Axel",  avatarUrl: AVATARS.axel,  xFrac: 0.30, yFrac: 0.26, isActive: true },
  { id: "alan",  slug: "leadership",     name: "Alan",  avatarUrl: AVATARS.alan,  xFrac: 0.82, yFrac: 0.32, isActive: false },
  { id: "atlas", slug: "legacy",         name: "Atlas", avatarUrl: AVATARS.atlas, xFrac: 0.80, yFrac: 0.62, isActive: false },
  { id: "amos",  slug: "family",         name: "Amos",  avatarUrl: AVATARS.amos,  xFrac: 0.40, yFrac: 0.82, isActive: false },
  { id: "annie", slug: "emotions",       name: "Annie", avatarUrl: AVATARS.annie, xFrac: 0.15, yFrac: 0.72, isActive: false },
];

// Tiny ambient stars
const AMBIENT_STARS = Array.from({ length: 30 }, (_, i) => ({
  xFrac: 0.05 + (i * 0.618033) % 0.9,
  yFrac: 0.05 + ((i * 0.381966) + i * 0.1) % 0.9,
  size: 0.5 + (i % 4) * 0.4,
  speed: 0.3 + (i % 5) * 0.2,
  phase: (i * 1.3) % (Math.PI * 2),
}));

const NEBULA_CDN_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/pKTTbCkRNCWrkFnx.png";

// Avatar display size (diameter in CSS pixels)
const AVATAR_SIZE_ACTIVE = 56;
const AVATAR_SIZE_INACTIVE = 44;
const AVATAR_SIZE_HOVERED = 66;

export default function InnerConstellationMap({
  visibility,
  hoveredGuardian,
  onNodeClick,
  onNodeHover,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const hoveredNodeRef = useRef<string | null>(null);
  const nebulaImgRef = useRef<HTMLImageElement | null>(null);
  const nebulaLoadedRef = useRef(false);
  const avatarImgsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const avatarsLoadedRef = useRef(false);

  // Keep latest props in refs for animation loop
  const visibilityRef = useRef(visibility);
  visibilityRef.current = visibility;
  const hoveredGuardianRef = useRef(hoveredGuardian);
  hoveredGuardianRef.current = hoveredGuardian;

  // Load nebula image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      nebulaImgRef.current = img;
      nebulaLoadedRef.current = true;
    };
    img.src = NEBULA_CDN_URL;
  }, []);

  // Load all avatar images
  useEffect(() => {
    let loaded = 0;
    const total = GUARDIAN_NODES.length;
    for (const node of GUARDIAN_NODES) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        avatarImgsRef.current.set(node.id, img);
        loaded++;
        if (loaded >= total) avatarsLoadedRef.current = true;
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= total) avatarsLoadedRef.current = true;
      };
      img.src = node.avatarUrl;
    }
  }, []);

  // Hit-test helper
  const hitTest = useCallback(
    (mx: number, my: number, w: number, h: number) => {
      for (const node of GUARDIAN_NODES) {
        const nx = node.xFrac * w;
        const ny = node.yFrac * h;
        const size = node.isActive ? AVATAR_SIZE_ACTIVE : AVATAR_SIZE_INACTIVE;
        const dist = Math.sqrt((mx - nx) ** 2 + (my - ny) ** 2);
        if (dist < size * 0.6) return node;
      }
      return null;
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Click handler
    const handleClick = (e: MouseEvent) => {
      const vis = visibilityRef.current;
      if (vis < 0.3) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const node = hitTest(mx, my, rect.width, rect.height);
      if (node && onNodeClick) {
        onNodeClick(node.slug);
      }
    };

    // Hover handler
    const handleMouseMove = (e: MouseEvent) => {
      const vis = visibilityRef.current;
      if (vis < 0.3) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const node = hitTest(mx, my, rect.width, rect.height);
      const slug = node?.slug ?? null;
      if (slug !== hoveredNodeRef.current) {
        hoveredNodeRef.current = slug;
        onNodeHover?.(slug);
        canvas.style.cursor = slug ? "pointer" : "default";
      }
    };

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousemove", handleMouseMove);

    // ═══ Main animation loop ═══
    const animate = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const vis = visibilityRef.current;
      if (vis < 0.01) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const time = now * 0.001;

      // ── Draw nebula image as background ──
      if (nebulaLoadedRef.current && nebulaImgRef.current) {
        const img = nebulaImgRef.current;
        const imgAspect = img.width / img.height;
        const viewAspect = w / h;
        let drawW: number, drawH: number, drawX: number, drawY: number;
        if (viewAspect > imgAspect) {
          drawW = w;
          drawH = w / imgAspect;
          drawX = 0;
          drawY = (h - drawH) / 2;
        } else {
          drawH = h;
          drawW = h * imgAspect;
          drawX = (w - drawW) / 2;
          drawY = 0;
        }
        const breathe = 0.85 + 0.15 * Math.sin(time * 0.3);
        ctx.globalAlpha = vis * 0.7 * breathe;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.globalAlpha = 1;
      }

      // ── Ambient twinkling stars ──
      for (const star of AMBIENT_STARS) {
        const x = star.xFrac * w;
        const y = star.yFrac * h;
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * star.speed + star.phase));
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 225, 240, ${twinkle * vis * 0.6})`;
        ctx.fill();
      }

      // ── Draw Guardian avatars and labels ──
      const hovGuardian = hoveredGuardianRef.current;
      for (const node of GUARDIAN_NODES) {
        const x = node.xFrac * w;
        const y = node.yFrac * h;
        const isHovered = hovGuardian === node.slug || hoveredNodeRef.current === node.slug;

        // Staggered fade-in
        const fadeDelay = node.isActive ? 0.1 : 0.35;
        const nodeAlpha = Math.max(0, Math.min(1, (vis - fadeDelay) / (1 - fadeDelay)));
        if (nodeAlpha < 0.01) continue;

        const pulse = 0.7 + 0.3 * Math.sin(time * 0.8 + node.xFrac * 5);

        // Avatar size
        const baseSize = isHovered
          ? AVATAR_SIZE_HOVERED
          : node.isActive
            ? AVATAR_SIZE_ACTIVE
            : AVATAR_SIZE_INACTIVE;
        // Gentle floating motion
        const floatY = Math.sin(time * 0.5 + node.yFrac * 10) * 3;

        // ── Soft glow behind the avatar ──
        const glowSize = isHovered ? 50 : node.isActive ? 35 : 22;
        const glowAlpha = isHovered
          ? 0.45
          : node.isActive
            ? 0.2 * pulse
            : 0.08 * pulse;
        const glowColor = isHovered || node.isActive
          ? `rgba(220, 195, 130, ${glowAlpha * nodeAlpha})`
          : `rgba(170, 190, 220, ${glowAlpha * nodeAlpha})`;

        const grad = ctx.createRadialGradient(x, y + floatY, 0, x, y + floatY, glowSize);
        grad.addColorStop(0, glowColor);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(x - glowSize, y + floatY - glowSize, glowSize * 2, glowSize * 2);

        // ── Draw avatar image (no circular clip — raw PNG cutout) ──
        const avatarImg = avatarImgsRef.current.get(node.id);
        if (avatarImg) {
          ctx.save();
          const drawSize = baseSize;
          const ax = x - drawSize / 2;
          const ay = y + floatY - drawSize / 2;

          // For inactive (coming soon) guardians, reduce opacity
          const imgAlpha = node.isActive
            ? (isHovered ? 0.95 : 0.8) * nodeAlpha
            : 0.4 * pulse * nodeAlpha;
          ctx.globalAlpha = imgAlpha;

          // Draw the avatar without any clipping — PNG transparency handles the shape
          ctx.drawImage(avatarImg, ax, ay, drawSize, drawSize);
          ctx.restore();
        }

        // ── Halo ring for hovered ──
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(x, y + floatY, baseSize / 2 + 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(220, 195, 130, ${0.4 * nodeAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // ── Name label below avatar ──
        const labelY = y + floatY + baseSize / 2 + 14;
        ctx.font = isHovered
          ? "bold 14px Inter, sans-serif"
          : node.isActive
            ? "bold 12px Inter, sans-serif"
            : "11px Inter, sans-serif";
        ctx.textAlign = "center";

        const labelAlpha = isHovered
          ? 0.95
          : node.isActive
            ? 0.7 + 0.2 * pulse
            : 0.3 * pulse;
        ctx.fillStyle = isHovered
          ? `rgba(245, 220, 150, ${labelAlpha * nodeAlpha})`
          : node.isActive
            ? `rgba(220, 195, 130, ${labelAlpha * nodeAlpha})`
            : `rgba(170, 190, 220, ${labelAlpha * nodeAlpha})`;
        ctx.fillText(node.name, x, labelY);

        // "Coming Soon" sub-label
        if (!node.isActive && nodeAlpha > 0.3) {
          ctx.font = "9px Inter, sans-serif";
          ctx.fillStyle = `rgba(170, 190, 220, ${0.25 * pulse * nodeAlpha})`;
          ctx.fillText("Coming Soon", x, labelY + 14);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hitTest, onNodeClick, onNodeHover]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{
        zIndex: 1,
        opacity: Math.min(1, visibility * 1.5),
        pointerEvents: visibility > 0.3 ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
      aria-hidden="true"
    />
  );
}
