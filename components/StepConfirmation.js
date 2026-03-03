"use client";

import { useEffect, useRef } from "react";

export default function StepConfirmation({ onReset }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ["#3B9B6E", "#4CAF7D", "#8ECDA7", "#1B3A5C", "#FFD700", "#FF6B6B"];
        const pieces = [];

        for (let i = 0; i < 80; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * -1,
                w: Math.random() * 8 + 4,
                h: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                vy: Math.random() * 3 + 2,
                vx: (Math.random() - 0.5) * 2,
                rot: Math.random() * 360,
                vr: (Math.random() - 0.5) * 6,
                opacity: 1,
            });
        }

        let frame;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;

            pieces.forEach((p) => {
                if (p.opacity <= 0) return;
                alive = true;
                p.y += p.vy;
                p.x += p.vx;
                p.rot += p.vr;

                if (p.y > canvas.height * 0.8) {
                    p.opacity -= 0.02;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rot * Math.PI) / 180);
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });

            if (alive) {
                frame = requestAnimationFrame(animate);
            }
        };

        animate();

        return () => {
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <div className="step-content" key="step-confirmation">
            <canvas ref={canvasRef} className="confetti-canvas" />

            <div className="confirmation">
                <div className="confirmation__check">
                    <span className="confirmation__check-icon">✓</span>
                </div>

                <h1 className="confirmation__title">You&rsquo;re in! 🎧</h1>
                <p className="confirmation__subtitle">
                    Thanks for sharing — here&rsquo;s what&rsquo;s coming your way.
                </p>

                <div className="confirmation__perks">
                    <div className="perk-card">
                        <span className="perk-card__icon">🎰</span>
                        <p className="perk-card__text">
                            <strong>AirPods raffle entry</strong> — winner drawn at the end of
                            HIMSS
                        </p>
                    </div>

                    <div className="perk-card">
                        <span className="perk-card__icon">📊</span>
                        <p className="perk-card__text">
                            <strong>Post-HIMSS insights</strong> — what the market said is
                            healthcare&rsquo;s most expensive workflow
                        </p>
                    </div>

                    <div className="perk-card">
                        <span className="perk-card__icon">🎁</span>
                        <p className="perk-card__text">
                            <strong>Grab your swag</strong> — ask anyone at the VytalMed booth!
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={onReset}
                    id="reset-btn"
                >
                    ← Start New Survey
                </button>
            </div>
        </div>
    );
}
