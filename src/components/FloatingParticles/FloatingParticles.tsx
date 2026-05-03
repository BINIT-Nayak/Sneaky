import { useEffect, useRef, type CSSProperties, type FC } from "react";

import styles from "./FloatingParticles.module.css";

type Particle = {
  vx: number;
  vy: number;
  x: number;
  y: number;
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mouseX = 0.5;
    let mouseY = 0.5;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = (event.clientX - rect.left) / rect.width;
      mouseY = (event.clientY - rect.top) / rect.height;
    };

    if (cursorAttraction) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    const particles: Particle[] = Array.from({ length: count }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - velocityBias) * speed,
      vy: (Math.random() - velocityBias) * speed,
    }));

    const elements = particles.map(() => {
      const element = document.createElement("div");
      element.className = styles.floatingParticles__particle;
      container.appendChild(element);
      return element;
    });

    let frameId: number;

    const animate = () => {
      const width = container.clientWidth - size;
      const height = container.clientHeight - size;

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (cursorAttraction) {
          const dx = mouseX - particle.x;
          const dy = mouseY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < attractionRadius) {
            particle.vx += dx * strength;
            particle.vy += dy * strength;
          }

          particle.vx *= damping;
          particle.vy *= damping;
        }

        if (particle.x <= 0 || particle.x >= 1) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= 1) particle.vy *= -1;

        elements[index].style.transform = `translate(${particle.x * width}px, ${
          particle.y * height
        }px)`;
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      if (cursorAttraction) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      elements.forEach((element) => element.remove());
    };
  }, [
    attractionRadius,
    count,
    cursorAttraction,
    damping,
    size,
    speed,
    strength,
    velocityBias,
  ]);

  const particleStyles = {
    "--particle-color": color,
    "--particle-opacity": opacity,
    "--particle-size": `${size}px`,
  } as CSSProperties;

  return (
    <div
      className={`${styles.floatingParticles} ${className}`}
      ref={containerRef}
      style={particleStyles}
    />
  );
};
