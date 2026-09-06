type InitMessage = {
  type: "init";
  canvas: OffscreenCanvas;
  color: string;
  count: number;
  cursorAttraction: boolean;
  attractionRadius: number;
  damping: number;
  height: number;
  opacity: number;
  size: number;
  speed: number;
  strength: number;
  velocityBias: number;
  width: number;
};

type MouseMessage = {
  type: "mouse";
  x: number;
  y: number;
};

type ResizeMessage = {
  type: "resize";
  height: number;
  width: number;
};

type StopMessage = {
  type: "stop";
};

type WorkerMessage = InitMessage | MouseMessage | ResizeMessage | StopMessage;

type Particle = {
  vx: number;
  vy: number;
  x: number;
  y: number;
};

let animationFrameId = 0;
let canvasContext: OffscreenCanvasRenderingContext2D | null = null;
let canvasHeight = 0;
let canvasWidth = 0;
let hasCursorAttraction = true;
let particleColor = "#dfb682";
let particleAttractionRadius = 0.2;
let particleDamping = 0.68;
let particleOpacity = 0.3;
let particleSize = 4;
let particleSpeed = 0.9;
let particleStrength = 0.002;
let particleVelocityBias = 0.0005;
let mouseX = 0.5;
let mouseY = 0.5;
let particles: Particle[] = [];

const workerScope = self as unknown as {
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<WorkerMessage>) => void,
  ) => void;
};

const createParticles = (count: number) =>
  Array.from({ length: count }).map((_, index) => ({
    x: ((index * 37) % 100) / 100,
    y: ((index * 61) % 100) / 100,
    vx: (Math.random() - particleVelocityBias) * particleSpeed,
    vy: (Math.random() - particleVelocityBias) * particleSpeed,
  }));

const draw = () => {
  if (!canvasContext) return;

  canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
  canvasContext.globalAlpha = particleOpacity;
  canvasContext.fillStyle = particleColor;

  for (const particle of particles) {
    if (hasCursorAttraction) {
      const dx = mouseX - particle.x;
      const dy = mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < particleAttractionRadius) {
        const influence =
          (particleAttractionRadius - distance) / particleAttractionRadius;

        particle.vx += dx * particleStrength * influence;
        particle.vy += dy * particleStrength * influence;
        particle.vx *= particleDamping;
        particle.vy *= particleDamping;
      }
    }

    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x <= 0 || particle.x >= 1) particle.vx *= -1;
    if (particle.y <= 0 || particle.y >= 1) particle.vy *= -1;

    particle.x = Math.max(0, Math.min(1, particle.x));
    particle.y = Math.max(0, Math.min(1, particle.y));

    canvasContext.beginPath();
    canvasContext.arc(
      particle.x * canvasWidth,
      particle.y * canvasHeight,
      particleSize / 2,
      0,
      Math.PI * 2,
    );
    canvasContext.fill();
  }

  animationFrameId = requestAnimationFrame(draw);
};

const stop = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }
};

workerScope.addEventListener("message", (event) => {
  const message = event.data;

  if (message.type === "init") {
    stop();
    canvasWidth = message.width;
    canvasHeight = message.height;
    message.canvas.width = canvasWidth;
    message.canvas.height = canvasHeight;
    canvasContext = message.canvas.getContext("2d");
    hasCursorAttraction = message.cursorAttraction;
    particleAttractionRadius = message.attractionRadius;
    particleColor = message.color;
    particleDamping = message.damping;
    particleOpacity = message.opacity;
    particleSize = message.size;
    particleSpeed = message.speed;
    particleStrength = message.strength;
    particleVelocityBias = message.velocityBias;
    particles = createParticles(message.count);
    draw();
    return;
  }

  if (message.type === "resize") {
    canvasWidth = message.width;
    canvasHeight = message.height;
    if (canvasContext) {
      canvasContext.canvas.width = canvasWidth;
      canvasContext.canvas.height = canvasHeight;
    }
    return;
  }

  if (message.type === "mouse") {
    mouseX = message.x;
    mouseY = message.y;
    return;
  }

  stop();
});
