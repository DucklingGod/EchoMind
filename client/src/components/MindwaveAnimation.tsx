import { useEffect, useRef } from "react";

interface MindwaveAnimationProps {
  isActive?: boolean;
  intensity?: number;
}

export function MindwaveAnimation({ isActive = false, intensity = 0 }: MindwaveAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentIntensityRef = useRef(0);
  const targetIntensityRef = useRef(0);
  const currentAmplitudeRef = useRef(12);
  const currentSpeedRef = useRef(0.02);

  useEffect(() => {
    targetIntensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Smoothly interpolate all values
      const lerpSpeed = 0.15;
      currentIntensityRef.current += (targetIntensityRef.current - currentIntensityRef.current) * lerpSpeed;

      // Target amplitude and speed based on isActive state
      const targetBaseAmplitude = isActive ? 25 : 12;
      const targetSpeed = isActive ? 0.05 : 0.02;

      // Smoothly transition amplitude and speed (faster for more noticeable change)
      const transitionSpeed = 0.2;
      currentAmplitudeRef.current += (targetBaseAmplitude - currentAmplitudeRef.current) * transitionSpeed;
      currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * transitionSpeed;

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(108, 99, 255, 0.5)");
      gradient.addColorStop(0.5, "rgba(255, 182, 193, 0.4)");
      gradient.addColorStop(1, "rgba(0, 212, 255, 0.5)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      const waves = 3;
      const amplitude = currentAmplitudeRef.current * (1 + currentIntensityRef.current * 0.5);
      const frequency = 0.02;
      const speed = currentSpeedRef.current;

      for (let w = 0; w < waves; w++) {
        ctx.beginPath();
        ctx.globalAlpha = 0.7 - (w * 0.15);

        for (let x = 0; x < width; x += 2) {
          const y = height / 2 +
            Math.sin(x * frequency + time * speed + w) * amplitude +
            Math.sin(x * frequency * 2 + time * speed * 1.5) * (amplitude / 2);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      time += 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 md:h-40"
      style={{ imageRendering: "auto" }}
    />
  );
}
