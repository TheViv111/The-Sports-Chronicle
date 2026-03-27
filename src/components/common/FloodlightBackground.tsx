import { useEffect, useRef, useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Component ────────────────────────────────────────────────────────────────

const HERO_HEIGHT = 600; // px — fade starts at this scroll depth
const SPOT_RADIUS = 120; // px — spotlight radius
const OVERLAY_OPACITY = 1; // fully dark to hide background completely

interface FloodlightProps {
  imagePath?: string;
}

const FloodlightBackground = ({ imagePath = "/images/green-turf.png" }: FloodlightProps) => {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const tiltRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const textureRef = useRef<HTMLImageElement | null>(null);
  const canvasOpacityRef = useRef<number>(1);

  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [gyroPrompt, setGyroPrompt] = useState(false);

  // ── Preload texture ──────────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.src = imagePath;
    img.onload = () => { textureRef.current = img; };
  }, [imagePath]);

  // ── Scroll-based canvas fade ──────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const fadeStart = HERO_HEIGHT * 0.6;
      const fadeEnd = HERO_HEIGHT;

      if (scrollY <= fadeStart) {
        canvasOpacityRef.current = 1;
      } else if (scrollY >= fadeEnd) {
        canvasOpacityRef.current = 0;
      } else {
        canvasOpacityRef.current = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
      }

      // Apply directly to canvas for performance (no React re-render)
      if (canvasRef.current) {
        canvasRef.current.style.opacity = String(canvasOpacityRef.current);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [prefersReduced]);

  // ── Draw loop ────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // Determine spotlight centre
    let cx: number;
    let cy: number;

    // Auto-pan on mobile if no gyro
    if (isMobile && !gyroEnabled) {
      const time = performance.now() / 2000;
      cx = w / 2 + Math.sin(time) * (w / 3);
      cy = h / 2 + Math.cos(time * 0.8) * (h / 4);
    } else if (isMobile && gyroEnabled) {
      cx = w / 2 + tiltRef.current.x * 20;
      cy = h / 2 + tiltRef.current.y * 20;
    } else if (!isMobile) {
      cx = mouseRef.current.x;
      cy = mouseRef.current.y;
    } else {
      return; // mobile without gyro — CSS fallback handles it
    }

    ctx.clearRect(0, 0, w, h);

    // 1. Dark overlay covers everything
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(23, 23, 23, ${OVERLAY_OPACITY})`;
    ctx.fillRect(0, 0, w, h);

    // 2. Punch a soft transparent hole at cursor
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, SPOT_RADIUS);
    grad.addColorStop(0,   "rgba(0,0,0,1)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.85)");
    grad.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 3. Draw texture AT THE BACK (revealed by the hole)
    ctx.globalCompositeOperation = "destination-over";
    if (textureRef.current) {
      const img = textureRef.current;
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      
      let drawWidth = w;
      let drawHeight = h;
      let offsetX = 0;
      let offsetY = 0;
      
      // object-fit: contain scaling
      if (imgRatio > canvasRatio) {
        drawWidth = w;
        drawHeight = w / imgRatio;
        offsetY = (h - drawHeight) / 2;
      } else {
        drawHeight = h;
        drawWidth = h * imgRatio;
        offsetX = (w - drawWidth) / 2;
      }
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      ctx.fillStyle = "rgb(23, 23, 23)";
      ctx.fillRect(0, 0, w, h);
    }

    ctx.globalCompositeOperation = "source-over";

    rafRef.current = requestAnimationFrame(draw);
  }, [isMobile, gyroEnabled]);

  // ── Canvas resize ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) return;
    if (isMobile && !gyroEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      const width = parent ? parent.clientWidth : window.innerWidth;
      const height = parent ? parent.clientHeight : window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    return () => window.removeEventListener("resize", resize);
  }, [isMobile, gyroEnabled, prefersReduced]);

  // ── Mouse tracking (desktop) ─────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced || isMobile) return;

    const onMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Map exact mouse position within the canvas taking into account any CSS scaling
      const rect = canvas.getBoundingClientRect();
      const cssX = e.clientX - rect.left;
      const cssY = e.clientY - rect.top;

      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;

      // If CSS size differs from logical size, multiply by this scale
      const scaleX = rect.width ? logicalWidth / rect.width : 1;
      const scaleY = rect.height ? logicalHeight / rect.height : 1;

      mouseRef.current = { 
        x: cssX * scaleX, 
        y: cssY * scaleY 
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [isMobile, prefersReduced]);

  // ── RAF loop start/stop ──────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) return;
    if (isMobile && !gyroEnabled) return;

    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [draw, isMobile, gyroEnabled, prefersReduced]);

  // ── Gyroscope setup (mobile) ─────────────────────────────────────────────────
  const attachGyro = useCallback(() => {
    let lastBeta = 0;
    let lastGamma = 0;

    const onOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      if (Math.abs(beta - lastBeta) < 0.5 && Math.abs(gamma - lastGamma) < 0.5) return;
      lastBeta = beta;
      lastGamma = gamma;
      tiltRef.current = {
        x: Math.max(-1, Math.min(1, gamma / 30)),
        y: Math.max(-1, Math.min(1, (beta - 45) / 30)),
      };
    };

    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    setGyroEnabled(true);
    setGyroPrompt(false);

    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, []);

  useEffect(() => {
    if (!isMobile || prefersReduced) return;

    if ("DeviceOrientationEvent" in window) {
      if (
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
          .requestPermission === "function"
      ) {
        setGyroPrompt(true);
      } else {
        attachGyro();
      }
    }
  }, [isMobile, prefersReduced, attachGyro]);

  const handleEnableMotion = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DOE.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission();
        if (result === "granted") attachGyro();
        else setGyroPrompt(false);
      } catch {
        setGyroPrompt(false);
      }
    } else {
      attachGyro();
    }
  }, [attachGyro]);

  // ── Reduced-motion fallback ──────────────────────────────────────────────────
  if (prefersReduced) {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: "rgba(23, 23, 23, 0.6)" }}
      />
    );
  }

  // ── Mobile without gyro → ambient CSS pulse ──────────────────────────────────
  if (isMobile && !gyroEnabled) {
    return (
      <>
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: "rgba(23, 23, 23, 0.85)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 35%, rgba(249,115,22,0.06) 0%, transparent 65%)",
            animation: "ambientPulse 6s ease-in-out infinite",
          }}
        />
        {gyroPrompt && (
          <button
            onClick={handleEnableMotion}
            className="fixed bottom-6 right-4 z-10 text-xs px-3 py-1.5 rounded-full
              bg-white/10 backdrop-blur-sm border border-white/20 text-white/70
              hover:bg-white/20 transition-all duration-200"
            aria-label="Enable motion effects"
          >
            Enable motion effects
          </button>
        )}
      </>
    );
  }

  // ── Desktop (+ mobile with gyro): canvas floodlight ──────────────────────────
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ display: "block", transition: "opacity 0.4s ease-out" }}
    />
  );
};

export default FloodlightBackground;
