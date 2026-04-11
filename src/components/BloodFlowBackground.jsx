import React, { useEffect, useRef } from 'react';

// Static fallback for mobile/iOS — prevents WebKit canvas crashes
const StaticBackground = () => (
  <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-[#0a0a0a]">
    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-red-900/10 blur-3xl" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-red-950/10 blur-3xl" />
  </div>
);

const CanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let mouse = { x: 0, y: 0 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', onMouseMove);
    resizeCanvas();

    class Particle {
      constructor() { this.reset(true); }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
        this.z = Math.random() * 2 + 0.5;
        this.size = Math.random() * 15 + 5;
        this.speedY = (Math.random() * 1 + 0.5) * -1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.type = Math.random() > 0.8 ? 'white' : 'red';
      }

      update() {
        const dx = (mouse.x - canvas.width / 2) * 0.001 * this.z;
        const dy = (mouse.y - canvas.height / 2) * 0.001 * this.z;
        this.x += this.speedX + dx;
        this.y += this.speedY + dy;
        if (this.y < -50 || this.x < -50 || this.x > canvas.width + 50) this.reset();
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        if (this.type === 'red') {
          const gradient = ctx.createRadialGradient(
            this.x - this.size / 3, this.y - this.size / 3, this.size * 0.1,
            this.x, this.y, this.size
          );
          gradient.addColorStop(0, '#ff6b6b');
          gradient.addColorStop(0.4, '#dc2626');
          gradient.addColorStop(1, '#7f1d1d');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(255,255,255,0.5)';
        }
        ctx.beginPath();
        if (this.type === 'red') {
          ctx.ellipse(this.x, this.y, this.size, this.size * 0.85, Math.PI / 4, 0, Math.PI * 2);
        } else {
          ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        }
        ctx.fill();
        if (this.type === 'red') {
          ctx.globalAlpha = this.opacity * 0.5;
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.ellipse(this.x, this.y, this.size * 0.3, this.size * 0.25, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const particleCount = Math.min(window.innerWidth / 10, 80);
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.fillStyle = 'rgb(10, 10, 10)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#220a0a';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(canvas.width / 3, canvas.height, canvas.width / 1.5, 0, canvas.width, canvas.height);
      ctx.stroke();
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />
  );
};

const BloodFlowBackground = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
  return isMobile ? <StaticBackground /> : <CanvasBackground />;
};

export default BloodFlowBackground;
