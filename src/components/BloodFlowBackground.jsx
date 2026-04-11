import React, { useEffect, useRef } from 'react';

const BloodFlowBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mouse = { x: 0, y: 0 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    resizeCanvas();

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
        this.z = Math.random() * 2 + 0.5; // Depth factor
        this.size = Math.random() * 15 + 5;
        this.speedY = (Math.random() * 1 + 0.5) * -1; // Moving Up
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.type = Math.random() > 0.8 ? 'white' : 'red';
      }

      update() {
        // Parallax effect based on mouse
        const dx = (mouse.x - canvas.width / 2) * 0.001 * this.z;
        const dy = (mouse.y - canvas.height / 2) * 0.001 * this.z;

        this.x += this.speedX + dx;
        this.y += this.speedY + dy;

        // Reset if out of bounds
        if (this.y < -50 || this.x < -50 || this.x > canvas.width + 50) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (this.type === 'red') {
          // 3D Red Blood Cell Look using Gradients
          const gradient = ctx.createRadialGradient(
            this.x - this.size/3, 
            this.y - this.size/3, 
            this.size * 0.1, 
            this.x, 
            this.y, 
            this.size
          );
          gradient.addColorStop(0, '#ff6b6b'); // Highlight
          gradient.addColorStop(0.4, '#dc2626'); // Main red
          gradient.addColorStop(1, '#7f1d1d'); // Shadow
          ctx.fillStyle = gradient;
        } else {
          // White Blood Cell / Plasma
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.shadowColor = "rgba(255,255,255,0.5)";
        }
        
        ctx.beginPath();
        // Donut shape for red blood cells
        if (this.type === 'red') {
            ctx.ellipse(this.x, this.y, this.size, this.size * 0.85, Math.PI / 4, 0, Math.PI * 2);
        } else {
            ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        }
        ctx.fill();

        // Inner dimple for RBCs to make them look 3D
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

    // Initialize particles
    const particleCount = Math.min(window.innerWidth / 10, 100); // Responsive count
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      // Clear with trail effect
      ctx.fillStyle = 'rgb(10, 10, 10)'; // Dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle background grid/vein texture
      ctx.strokeStyle = '#220a0a';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(canvas.width/3, canvas.height, canvas.width/1.5, 0, canvas.width, canvas.height);
      ctx.stroke();

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
};

export default BloodFlowBackground;