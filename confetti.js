class ConfettiManager {
    constructor() {
        this.maxParticleCount = 150;
        this.particleSpeed = 2;
        this.colors = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"];
        this.streamingConfetti = false;
        this.animationTimer = null;
        this.particles = [];
        this.waveAngle = 0;
        this.canvas = null;
        this.context = null;
        
        this.initRequestAnimFrame();
    }

    initRequestAnimFrame() {
        window.requestAnimFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                return window.setTimeout(callback, 16.6666667);
            };
    }

    createCanvas() {
        if (this.canvas) return;
        
        this.canvas = document.createElement("canvas");
        this.canvas.id = "confetti-canvas";
        this.canvas.style.cssText = "position:fixed;top:0;left:0;display:block;z-index:999999;pointer-events:none";
        document.body.appendChild(this.canvas);
        
        this.updateCanvasSize();
        window.addEventListener("resize", () => this.updateCanvasSize(), true);
        
        this.context = this.canvas.getContext("2d");
    }

    updateCanvasSize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    resetParticle(particle) {
        const { innerWidth: width, innerHeight: height } = window;
        particle.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        particle.x = Math.random() * width;
        particle.y = Math.random() * height - height;
        particle.diameter = Math.random() * 10 + 5;
        particle.tilt = Math.random() * 10 - 10;
        particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
        particle.tiltAngle = 0;
        return particle;
    }

    start() {
        this.createCanvas();
        
        while (this.particles.length < this.maxParticleCount) {
            this.particles.push(this.resetParticle({}));
        }
        
        this.streamingConfetti = true;
        
        if (!this.animationTimer) {
            this.animate();
        }
    }

    animate() {
        this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        if (this.particles.length === 0) {
            this.animationTimer = null;
            return;
        }
        
        this.updateParticles();
        this.drawParticles();
        this.animationTimer = requestAnimFrame(() => this.animate());
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.context.beginPath();
            this.context.lineWidth = particle.diameter;
            this.context.strokeStyle = particle.color;
            
            const x = particle.x + particle.tilt;
            this.context.moveTo(x + particle.diameter / 2, particle.y);
            this.context.lineTo(x, particle.y + particle.tilt + particle.diameter / 2);
            this.context.stroke();
        });
    }

    updateParticles() {
        const { innerWidth: width, innerHeight: height } = window;
        this.waveAngle += 0.01;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (!this.streamingConfetti && particle.y < -15) {
                particle.y = height + 100;
            } else {
                particle.tiltAngle += particle.tiltAngleIncrement;
                particle.x += Math.sin(this.waveAngle);
                particle.y += (Math.cos(this.waveAngle) + particle.diameter + this.particleSpeed) * 0.5;
                particle.tilt = Math.sin(particle.tiltAngle) * 15;
            }
            
            if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
                if (this.streamingConfetti && this.particles.length <= this.maxParticleCount) {
                    this.resetParticle(particle);
                } else {
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    stop() {
        this.streamingConfetti = false;
    }

    remove() {
        this.stop();
        this.particles = [];
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.canvas = null;
        this.context = null;
        this.animationTimer = null;
    }

    celebrate() {
        this.start();
        setTimeout(() => this.stop(), 4000);
        setTimeout(() => this.remove(), 6000);
    }
}

const confetti = new ConfettiManager();