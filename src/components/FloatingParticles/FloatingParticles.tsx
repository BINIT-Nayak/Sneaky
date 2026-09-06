import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FC,
} from "react";

import styles from "./FloatingParticles.module.css";

type Particle = {
  x: number;
  y: number;
};

type CachedRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type FloatingParticlesProps = {
  attractionRadius?: number;
  className?: string;
  color?: string;
  count?: number;
  cursorAttraction?: boolean;
  damping?: number;
  opacity?: number;
  size?: number;
  speed?: number;
  strength?: number;
  velocityBias?: number;
};

const toCachedRect = (rect: DOMRectReadOnly): CachedRect => ({
  height: Math.max(1, rect.height),
  left: rect.left,
  top: rect.top,
  width: Math.max(1, rect.width),
});

export const FloatingParticles: FC<FloatingParticlesProps> = ({
  attractionRadius = 0.2,
  className = "",
  color = "var(--base-color4)",
  count = 20,
  cursorAttraction = false,
  damping = 0.98,
  opacity = 0.3,
  size = 4,
  speed = 0.0009,
  strength = 0.002,
  velocityBias = 0.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const workerRef = useRef<Worker | null>(null);
  const [renderMode, setRenderMode] = useState<
    "detecting" | "disabled" | "css" | "worker"
  >("detecting");
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }).map((_, index) => ({
        x: ((index * 37) % 100) / 100,
        y: ((index * 61) % 100) / 100,
      })),
    [count],
  );

  useEffect(() => {
    const navigatorWithMemory = navigator as Navigator & {
      deviceMemory?: number;
    };
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isLowEndDevice =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
      (navigatorWithMemory.deviceMemory !== undefined &&
        navigatorWithMemory.deviceMemory <= 2);
    const canvas = canvasRef.current;
    const canUseWorkerCanvas =
      canvas !== null && "transferControlToOffscreen" in canvas;

    if (prefersReducedMotion || isLowEndDevice) {
      setRenderMode("disabled");
      return;
    }

    setRenderMode(canUseWorkerCanvas ? "worker" : "css");
  }, []);

  useEffect(() => {
    if (renderMode !== "worker") return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !("transferControlToOffscreen" in canvas)) {
      return;
    }

    const resolvedColor = color.startsWith("var(")
      ? getComputedStyle(document.documentElement)
          .getPropertyValue(color.slice(4, -1).trim())
          .trim()
      : color;
    const worker = new Worker(
      new URL("./floatingParticlesWorker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    const sendResize = () => {
      const rect = container.getBoundingClientRect();
      worker.postMessage({
        height: Math.max(1, Math.round(rect.height)),
        type: "resize",
        width: Math.max(1, Math.round(rect.width)),
      });
    };
    const rect = container.getBoundingClientRect();
    let offscreenCanvas: OffscreenCanvas;

    try {
      offscreenCanvas = canvas.transferControlToOffscreen();
    } catch {
      worker.terminate();
      setRenderMode("css");
      return;
    }

    workerRef.current = worker;

    worker.postMessage(
      {
        attractionRadius,
        canvas: offscreenCanvas,
        color: resolvedColor || "#dfb682",
        count,
        cursorAttraction,
        damping,
        height: Math.max(1, Math.round(rect.height)),
        opacity,
        size,
        speed,
        strength,
        type: "init",
        velocityBias,
        width: Math.max(1, Math.round(rect.width)),
      },
      [offscreenCanvas],
    );

    const resizeObserver = new ResizeObserver(sendResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      worker.postMessage({ type: "stop" });
      worker.terminate();
      workerRef.current = null;
    };
  }, [
    color,
    attractionRadius,
    count,
    cursorAttraction,
    damping,
    opacity,
    renderMode,
    size,
    speed,
    strength,
    velocityBias,
  ]);

  useEffect(() => {
    if (renderMode !== "worker" || !cursorAttraction) return;

    let frameId = 0;
    let latestMouse = { x: 0.5, y: 0.5 };
    let rect = containerRef.current
      ? toCachedRect(containerRef.current.getBoundingClientRect())
      : null;

    const updateRect = () => {
      if (!containerRef.current) return;
      rect = toCachedRect(containerRef.current.getBoundingClientRect());
    };

    const sendMouse = () => {
      frameId = 0;
      workerRef.current?.postMessage({
        type: "mouse",
        x: latestMouse.x,
        y: latestMouse.y,
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!rect) return;

      latestMouse = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };

      if (!frameId) {
        frameId = requestAnimationFrame(sendMouse);
      }
    };

    const resizeObserver =
      containerRef.current && "ResizeObserver" in window
        ? new ResizeObserver(updateRect)
        : null;

    if (containerRef.current) {
      resizeObserver?.observe(containerRef.current);
    }

    window.addEventListener("resize", updateRect, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("mousemove", handleMouseMove);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [cursorAttraction, renderMode]);

  useEffect(() => {
    if (renderMode !== "css" || !cursorAttraction) return;

    let frameId = 0;
    let latestMouse = { x: 0.5, y: 0.5 };
    let rect = containerRef.current
      ? toCachedRect(containerRef.current.getBoundingClientRect())
      : null;

    const updateRect = () => {
      if (!containerRef.current) return;
      rect = toCachedRect(containerRef.current.getBoundingClientRect());
    };

    const resetParticles = () => {
      for (const particle of particleRefs.current) {
        if (particle) {
          particle.style.transform = "translate3d(0, 0, 0)";
        }
      }
    };

    const updateParticles = () => {
      frameId = 0;

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const element = particleRefs.current[index];
        if (!particle || !element) continue;

        const dx = latestMouse.x - particle.x;
        const dy = latestMouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= attractionRadius) {
          element.style.transform = "translate3d(0, 0, 0)";
          continue;
        }

        const influence = (attractionRadius - distance) / attractionRadius;
        const translateX = dx * influence * strength * 3600;
        const translateY = dy * influence * strength * 3600;

        element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!rect) return;

      latestMouse = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };

      if (!frameId) {
        frameId = requestAnimationFrame(updateParticles);
      }
    };

    const resizeObserver =
      containerRef.current && "ResizeObserver" in window
        ? new ResizeObserver(updateRect)
        : null;

    if (containerRef.current) {
      resizeObserver?.observe(containerRef.current);
    }

    window.addEventListener("resize", updateRect, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", resetParticles);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", resetParticles);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      resetParticles();
    };
  }, [attractionRadius, cursorAttraction, particles, renderMode, strength]);

  const particleStyles = {
    "--particle-attraction-radius": attractionRadius,
    "--particle-color": color,
    "--particle-damping": damping,
    "--particle-opacity": opacity,
    "--particle-size": `${size}px`,
    "--particle-speed": `${Math.max(8, 1 / speed / 80)}s`,
    "--particle-strength": strength,
    "--particle-velocity-bias": velocityBias,
  } as CSSProperties;

  if (renderMode === "disabled") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`${styles.floatingParticles} ${className}`}
      ref={containerRef}
      style={particleStyles}
    >
      {renderMode === "worker" || renderMode === "detecting" ? (
        <canvas className={styles.floatingParticles__canvas} ref={canvasRef} />
      ) : (
        particles.map((particle, index) => (
          <span
            className={`${styles.floatingParticles__particle} ${
              cursorAttraction
                ? styles.floatingParticles__particle_interactive
                : ""
            }`}
            key={`${particle.x}-${particle.y}-${index}`}
            ref={(element) => {
              particleRefs.current[index] = element;
            }}
            style={
              {
                "--particle-delay": `${-(index % 10)}s`,
                left: `${particle.x * 100}%`,
                top: `${particle.y * 100}%`,
              } as CSSProperties
            }
          />
        ))
      )}
    </div>
  );
};
