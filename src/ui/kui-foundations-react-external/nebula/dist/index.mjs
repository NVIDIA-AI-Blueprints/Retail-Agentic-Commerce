// src/components/Nebula.tsx
import { useCallback, useEffect, useRef } from "react";

// src/lib/particles/Base.ts
var SMALL_PARTICLE_COLOR = "rgba(255, 255, 255, 0.3)";
var MEDIUM_PARTICLE_COLOR = "rgba(87, 146, 16, 0.4)";
var LARGE_PARTICLE_COLOR = "rgba(118, 185, 0, 0.5)";
var Particle = class {
  constructor() {
    this.getSizeAndColor = () => {
      const rand = Math.random();
      if (rand < 0.7) {
        return {
          radius: this.randomFloat(1, 2),
          color: SMALL_PARTICLE_COLOR,
          spinSpeed: this.randomFloat(0.05, 0.1)
        };
      }
      if (rand < 0.9) {
        return {
          radius: this.randomFloat(2, 3),
          color: MEDIUM_PARTICLE_COLOR,
          spinSpeed: this.randomFloat(0.03, 0.08)
        };
      }
      return {
        radius: this.randomFloat(3, 4),
        color: LARGE_PARTICLE_COLOR,
        spinSpeed: this.randomFloat(0.01, 0.04)
      };
    };
    const { radius, color, spinSpeed } = this.getSizeAndColor();
    this.radius = radius;
    this.color = color;
    this.spinSpeed = spinSpeed;
  }
  draw(c) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.spinAngle);
    c.beginPath();
    c.moveTo(0, -this.radius);
    c.lineTo(-this.radius, this.radius);
    c.lineTo(this.radius, this.radius);
    c.closePath();
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
};

// src/lib/particles/AmbientParticle.ts
var AmbientParticle = class extends Particle {
  constructor(canvas) {
    super();
    this.spinAngle = 0;
    this.x = 0;
    this.y = 0;
    this.driftVelocityX = this.randomFloat(-0.3, 0.3);
    this.driftVelocityY = this.randomFloat(-0.3, 0.3);
    this.prevCanvasSize = "";
    this.canvas = canvas;
    this.setPosition();
  }
  setPosition() {
    this.prevCanvasSize = `${this.canvas.width}x${this.canvas.height}`;
    this.x = this.randomFloat(0, this.canvas.width);
    this.y = this.randomFloat(0, this.canvas.height);
  }
  update(_) {
    if (this.prevCanvasSize !== `${this.canvas.width}x${this.canvas.height}`) {
      this.setPosition();
      return;
    }
    this.x += this.driftVelocityX;
    this.y += this.driftVelocityY;
    if (this.x < 0 || this.x > this.canvas.width) this.driftVelocityX *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.driftVelocityY *= -1;
    this.spinAngle += this.spinSpeed;
  }
};

// src/lib/particles/SphereParticle.ts
var SphereParticle = class extends Particle {
  constructor(center, scaleFactor) {
    super();
    this.spinAngle = 0;
    this.orbitVelocity = 2e-3;
    this.opacity = 0;
    this.radians = Math.random() * Math.PI * 2;
    this.center = center;
    this.x = center.x;
    this.y = center.y;
    this.originalDistance = {
      x: this.randomFloat(40, 70) * scaleFactor,
      y: this.randomFloat(40, 70) * scaleFactor
    };
    this.distanceFromCenter = { ...this.originalDistance };
  }
  update(fadeSpeed) {
    if (this.opacity < 1) {
      this.opacity += fadeSpeed;
    }
    this.radians += this.orbitVelocity;
    this.x = this.center.x + Math.cos(this.radians) * this.distanceFromCenter.x;
    this.y = this.center.y + Math.sin(this.radians) * this.distanceFromCenter.y;
    this.spinAngle += this.spinSpeed;
  }
  scaleOrbit(center, scaleFactor) {
    this.center = center;
    this.originalDistance.x *= scaleFactor;
    this.originalDistance.y *= scaleFactor;
    this.distanceFromCenter.x = this.originalDistance.x;
    this.distanceFromCenter.y = this.originalDistance.y;
  }
};

// src/lib/animate.ts
var FADE_SPEED = 0.02;
var CONNECTION_OPACITY = 0.2;
var SIZE_CHANGE_SENSITIVITY = 0.02;
var PARTICLE_COUNT = 250;
var lerp = (start, end, t) => {
  return start + (end - start) * t;
};
var resizeCanvas = (nebulaState) => {
  if (!nebulaState.current?.ctx || !nebulaState.current.canvas) return;
  nebulaState.current.canvas.width = nebulaState.current.canvas.parentElement.clientWidth;
  nebulaState.current.canvas.height = nebulaState.current.canvas.parentElement.clientHeight;
  nebulaState.current.center = {
    x: nebulaState.current.xOffset || nebulaState.current.canvas.width / 2,
    y: nebulaState.current.yOffset || nebulaState.current.canvas.height / 2
  };
};
var drawConnections = (ctx, i, particles, connectionDistance) => {
  for (let j = i + 1; j < particles.length; j++) {
    const row = particles[i];
    const column = particles[j];
    if (!row || !column) continue;
    const dx = row.x - column.x;
    const dy = row.y - column.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < connectionDistance) {
      const chosenColor = Math.random() < 0.5 ? row.color : column.color;
      ctx.beginPath();
      ctx.moveTo(row.x, row.y);
      ctx.lineTo(column.x, column.y);
      ctx.strokeStyle = chosenColor.replace(
        /[\d.]+\)$/g,
        `${CONNECTION_OPACITY})`
      );
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }
  }
};
var animate = (nebulaState) => () => {
  if (!nebulaState.current?.ctx || !nebulaState.current.canvas) return;
  resizeCanvas(nebulaState);
  const ctx = nebulaState.current.ctx;
  ctx.clearRect(
    0,
    0,
    nebulaState.current.canvas.width,
    nebulaState.current.canvas.height
  );
  let scaleFactor = 1;
  if (Math.abs(
    nebulaState.current.sphereSize - nebulaState.current.lastSphereSize
  ) > 0.1) {
    const newSphereSize = lerp(
      nebulaState.current.lastSphereSize,
      nebulaState.current.sphereSize,
      SIZE_CHANGE_SENSITIVITY
    );
    scaleFactor = newSphereSize / nebulaState.current.lastSphereSize;
    nebulaState.current.lastSphereSize = newSphereSize;
  }
  const connectionDistance = nebulaState.current.variant === "sphere" ? nebulaState.current.lastSphereSize * 0.8 : 45;
  nebulaState.current.particles.forEach((particle, i) => {
    drawConnections(ctx, i, nebulaState.current.particles, connectionDistance);
    if (particle instanceof SphereParticle) {
      particle.scaleOrbit(nebulaState.current.center, scaleFactor);
    }
    particle.update(FADE_SPEED);
    particle.draw(ctx);
  });
  requestAnimationFrame(animate(nebulaState));
};
var initialize = (nebulaState, canvas, variant) => {
  if (!canvas || !nebulaState.current || nebulaState.current?.initialized)
    return;
  nebulaState.current.initialized = true;
  nebulaState.current.lastSphereSize = nebulaState.current.sphereSize;
  const ctx = canvas.getContext("2d", { alpha: true });
  nebulaState.current.canvas = canvas;
  nebulaState.current.ctx = ctx;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = variant === "sphere" ? new SphereParticle(
      nebulaState.current.center,
      nebulaState.current.sphereSize / 10
    ) : new AmbientParticle(canvas);
    nebulaState.current.particles.push(particle);
  }
  requestAnimationFrame(animate(nebulaState));
};

// src/components/Nebula.tsx
import { jsx } from "react/jsx-runtime";
var Nebula = ({
  variant = "sphere",
  className = "",
  ...props
}) => {
  const sphereProps = variant === "sphere" ? props : null;
  const x = sphereProps?.x;
  const y = sphereProps?.y;
  const sphereSize = sphereProps?.sphereSize ?? 20;
  const nebulaState = useRef({
    xOffset: x,
    yOffset: y,
    variant,
    initialized: false,
    sphereSize,
    particles: [],
    lastSphereSize: 0,
    center: { x: 0, y: 0 },
    canvas: null,
    ctx: null
  });
  useEffect(() => {
    if (!nebulaState.current) return;
    if (x) {
      nebulaState.current.xOffset = x;
    }
    if (y) {
      nebulaState.current.yOffset = y;
    }
    nebulaState.current.sphereSize = sphereSize;
  }, [x, y, sphereSize]);
  const handleRef = useCallback(
    (canvasElement) => {
      initialize(nebulaState, canvasElement, variant);
    },
    [variant]
  );
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `relative size-full min-h-[200px] min-w-[200px] ${className}`,
      "data-testid": "nv-nebula",
      children: /* @__PURE__ */ jsx(
        "canvas",
        {
          ref: handleRef,
          className: "pointer-events-none absolute inset-0"
        }
      )
    }
  );
};
export {
  Nebula
};
