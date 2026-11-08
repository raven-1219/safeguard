'use client';

import React, { useRef, useEffect } from 'react';

interface HeadPose3DGimbalProps {
  pitch: number; // degrees: up/down
  yaw: number;   // degrees: left/right
  roll: number;  // degrees: tilt
  direction: 'CENTER' | 'LEFT' | 'RIGHT' | 'DOWN' | 'UP';
  isDistracted: boolean;
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const HeadPose3DGimbal: React.FC<HeadPose3DGimbalProps> = ({
  pitch,
  yaw,
  roll,
  direction,
  isDistracted,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Smoothed internal angles for ultra-fluid 60fps interpolation
  const currentAngles = useRef({ pitch: 0, yaw: 0, roll: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // 3D wireframe geometric model of a stylized human head / biometric mesh
    // Normalized coordinates centered at (0, 0, 0)
    const vertices: Point3D[] = [
      // Cranium Top & Crown
      { x: 0, y: -65, z: 0 },       // 0: Crown Top
      { x: -28, y: -50, z: -10 },   // 1: Top Left Back
      { x: 28, y: -50, z: -10 },    // 2: Top Right Back
      { x: -30, y: -45, z: 18 },    // 3: Forehead Left
      { x: 30, y: -45, z: 18 },     // 4: Forehead Right
      { x: 0, y: -45, z: 28 },      // 5: Forehead Center (Glabella)
      // Temples & Cheeks
      { x: -38, y: -15, z: 8 },     // 6: Left Temple
      { x: 38, y: -15, z: 8 },      // 7: Right Temple
      { x: -34, y: 12, z: 12 },     // 8: Left Cheekbone
      { x: 34, y: 12, z: 12 },      // 9: Right Cheekbone
      // Nose & Midface
      { x: 0, y: -12, z: 32 },      // 10: Nose Bridge
      { x: 0, y: 4, z: 42 },        // 11: Nose Tip (Protruding forward)
      { x: -10, y: 8, z: 28 },      // 12: Left Nostril
      { x: 10, y: 8, z: 28 },       // 13: Right Nostril
      // Mouth & Jaw
      { x: -16, y: 24, z: 22 },     // 14: Left Mouth Corner
      { x: 16, y: 24, z: 22 },      // 15: Right Mouth Corner
      { x: 0, y: 22, z: 28 },       // 16: Upper Lip
      { x: 0, y: 30, z: 26 },       // 17: Lower Lip
      { x: -25, y: 48, z: 6 },      // 18: Left Jaw Angle
      { x: 25, y: 48, z: 6 },       // 19: Right Jaw Angle
      { x: 0, y: 55, z: 22 },       // 20: Chin Tip
      // Back of Skull
      { x: -26, y: 0, z: -32 },     // 21: Occipital Left
      { x: 26, y: 0, z: -32 },      // 22: Occipital Right
      { x: 0, y: 25, z: -28 },      // 23: Skull Base
    ];

    // Wireframe edges connecting vertices
    const edges: [number, number][] = [
      // Crown & Forehead
      [0, 1], [0, 2], [0, 5], [1, 3], [2, 4], [3, 5], [5, 4],
      // Facial Contour & Temples
      [3, 6], [4, 7], [6, 8], [7, 9], [8, 18], [9, 19], [18, 20], [19, 20],
      // Nose Feature lines
      [5, 10], [10, 11], [11, 12], [11, 13], [12, 10], [13, 10],
      // Mouth Feature lines
      [14, 16], [16, 15], [15, 17], [17, 14], [17, 20],
      // Cheek to Nose
      [8, 12], [9, 13], [6, 10], [7, 10],
      // Skull Contour & Depth
      [1, 21], [2, 22], [21, 22], [21, 23], [22, 23], [18, 23], [19, 23],
    ];

    const render = () => {
      // Fluid smoothing of incoming angles
      currentAngles.current.pitch += (pitch - currentAngles.current.pitch) * 0.18;
      currentAngles.current.yaw += (yaw - currentAngles.current.yaw) * 0.18;
      currentAngles.current.roll += (roll - currentAngles.current.roll) * 0.18;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 + 5;

      ctx.clearRect(0, 0, w, h);

      // Color scheme based on attention state
      const mainColor = isDistracted
        ? '#f43f5e'
        : direction !== 'CENTER'
        ? '#f59e0b'
        : '#00f0ff';
      const glowColor = isDistracted
        ? 'rgba(244, 63, 94, 0.35)'
        : direction !== 'CENTER'
        ? 'rgba(245, 158, 11, 0.25)'
        : 'rgba(0, 240, 255, 0.2)';

      // Convert angles to radians
      // Pitch: rotation around X axis (inverted so pitch up rotates up)
      const radPitch = -(currentAngles.current.pitch * Math.PI) / 180;
      // Yaw: rotation around Y axis
      const radYaw = (currentAngles.current.yaw * Math.PI) / 180;
      // Roll: rotation around Z axis
      const radRoll = -(currentAngles.current.roll * Math.PI) / 180;

      // Draw background 3D gimbal grid rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy, 75, 24, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // Pitch ladder markers
      for (let deg = -20; deg <= 20; deg += 10) {
        if (deg === 0) continue;
        const markY = cy - deg * 2.2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(cx - 20, markY);
        ctx.lineTo(cx + 20, markY);
        ctx.stroke();
      }

      // 3D Matrix Transformations: Yaw(Y) -> Pitch(X) -> Roll(Z)
      const cosY = Math.cos(radYaw);
      const sinY = Math.sin(radYaw);
      const cosP = Math.cos(radPitch);
      const sinP = Math.sin(radPitch);
      const cosR = Math.cos(radRoll);
      const sinR = Math.sin(radRoll);

      const fov = 260; // Camera perspective distance

      const projected = vertices.map((v) => {
        // 1. Rotate Y (Yaw)
        const x1 = v.x * cosY + v.z * sinY;
        const y1 = v.y;
        const z1 = -v.x * sinY + v.z * cosY;

        // 2. Rotate X (Pitch)
        const x2 = x1;
        const y2 = y1 * cosP - z1 * sinP;
        const z2 = y1 * sinP + z1 * cosP;

        // 3. Rotate Z (Roll)
        const x3 = x2 * cosR - y2 * sinR;
        const y3 = x2 * sinR + y2 * cosR;
        const z3 = z2;

        // Perspective Projection
        const scale = fov / (fov + z3 + 30);
        return {
          x: cx + x3 * scale,
          y: cy + y3 * scale,
          z: z3,
          scale,
        };
      });

      // Draw Wireframe Edges
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = mainColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;

      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        // Depth cueing: deeper edges become slightly faded
        const avgZ = (p1.z + p2.z) / 2;
        const opacity = Math.max(0.25, Math.min(1.0, 0.75 + avgZ / 80));

        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw Key Vertex Glowing Nodes
      ctx.shadowBlur = 10;
      projected.forEach((p, idx) => {
        // Highlight nose tip and eyes
        const isProminent = idx === 11 || idx === 10 || idx === 0 || idx === 20;
        ctx.globalAlpha = Math.max(0.4, Math.min(1.0, 0.8 + p.z / 60));
        ctx.fillStyle = isProminent ? '#ffffff' : mainColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isProminent ? 2.5 : 1.8, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Reset shadows & alpha
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Dynamic Orientation Heading Vector from Nose Tip
      const noseTip = projected[11];
      const forwardLength = 32;
      const fX = noseTip.x + sinY * cosP * forwardLength;
      const fY = noseTip.y - sinP * forwardLength;

      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(noseTip.x, noseTip.y);
      ctx.lineTo(fX, fY);
      ctx.stroke();

      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(fX, fY, 3.5, 0, 2 * Math.PI);
      ctx.fill();

      // Draw Horizon Center Crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [pitch, yaw, roll, direction, isDistracted]);

  return (
    <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/80 shadow-xl backdrop-blur-xl ${className}`}>
      {/* Top Header Tag */}
      <div className="w-full flex items-center justify-between text-[11px] mb-1 font-mono">
        <span className="text-slate-400 font-semibold tracking-wider flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${
            isDistracted ? 'bg-rose-500 animate-ping' : direction !== 'CENTER' ? 'bg-amber-400' : 'bg-cyan-400'
          }`} />
          <span>3D POSE GIMBAL</span>
        </span>
        <span className={`px-2 py-0.5 rounded font-black text-[10px] tracking-wider ${
          isDistracted
            ? 'bg-rose-950/90 text-rose-300 border border-rose-600'
            : direction !== 'CENTER'
            ? 'bg-amber-950/80 text-amber-300 border border-amber-600'
            : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800'
        }`}>
          {direction}
        </span>
      </div>

      {/* 3D Holographic Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={180}
          height={180}
          className="w-[180px] h-[180px] block"
        />
      </div>

      {/* Numerical Coordinate Readout Strip */}
      <div className="w-full grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800/60 text-center font-mono text-[10px]">
        <div className="bg-slate-950/60 p-1 rounded-lg border border-slate-850">
          <span className="text-slate-400 block text-[9px]">PITCH</span>
          <span className={`font-bold ${Math.abs(pitch) > 10 ? 'text-amber-400' : 'text-slate-200'}`}>
            {pitch > 0 ? `+${pitch}°` : `${pitch}°`}
          </span>
        </div>
        <div className="bg-slate-950/60 p-1 rounded-lg border border-slate-850">
          <span className="text-slate-400 block text-[9px]">YAW</span>
          <span className={`font-bold ${Math.abs(yaw) > 14 ? 'text-amber-400' : 'text-slate-200'}`}>
            {yaw > 0 ? `+${yaw}°` : `${yaw}°`}
          </span>
        </div>
        <div className="bg-slate-950/60 p-1 rounded-lg border border-slate-850">
          <span className="text-slate-400 block text-[9px]">ROLL</span>
          <span className="font-bold text-slate-200">
            {roll > 0 ? `+${roll}°` : `${roll}°`}
          </span>
        </div>
      </div>
    </div>
  );
};
