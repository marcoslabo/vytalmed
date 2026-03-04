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

        const confetti = Array.from({ length: 80 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 5 + 3,
            d: Math.random() * 2 + 1,
            color: ["#3B9B6E", "#1B3A5C", "#4CAF7D", "#2D8259", "#FF9F43", "#5B8DEF"][
                Math.floor(Math.random() * 6)
            ],
            tilt: Math.random() * 10 - 5,
            tiltAngle: Math.random() * Math.PI * 2,
            tiltSpeed: Math.random() * 0.04 + 0.02,
        }));

        let frameId;
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confetti.forEach((c) => {
                ctx.beginPath();
                ctx.fillStyle = c.color;
                ctx.ellipse(c.x, c.y, c.r, c.r * 0.6, c.tilt, 0, Math.PI * 2);
                ctx.fill();
                c.y += c.d;
                c.tiltAngle += c.tiltSpeed;
                c.tilt = Math.sin(c.tiltAngle) * 10;
                if (c.y > canvas.height) {
                    c.y = -10;
                    c.x = Math.random() * canvas.width;
                }
            });
            frameId = requestAnimationFrame(draw);
        }
        draw();
        const timer = setTimeout(() => cancelAnimationFrame(frameId), 4000);
        return () => { cancelAnimationFrame(frameId); clearTimeout(timer); };
    }, []);

    return (
        <div className="step-content">
            <canvas ref={canvasRef} className="confetti-canvas" />
            <div className="confirmation">
                <div className="confirmation__check">
                    <span className="confirmation__check-icon">✓</span>
                </div>
                <h2 className="confirmation__title">You&apos;re in!</h2>
                <p className="confirmation__subtitle">Check your email for confirmation details.</p>

                <div className="confirmation__perks">
                    <div className="perk-card">
                        <div className="perk-card__icon perk-card__icon--blue">🎧</div>
                        <p className="perk-card__text">
                            <strong>AirPods Raffle</strong> — Winner announced end of HIMSS
                        </p>
                    </div>
                    <div className="perk-card">
                        <div className="perk-card__icon perk-card__icon--green">📊</div>
                        <p className="perk-card__text">
                            <strong>Post-HIMSS Insights</strong> — We&apos;ll share what the industry said
                        </p>
                    </div>
                    <div className="perk-card">
                        <div className="perk-card__icon perk-card__icon--orange">🎁</div>
                        <p className="perk-card__text">
                            <strong>Booth Swag</strong> — Grab yours before you leave!
                        </p>
                    </div>
                </div>

                <button className="btn btn--ghost" onClick={onReset} type="button">
                    Start Over
                </button>
            </div>
        </div>
    );
}
