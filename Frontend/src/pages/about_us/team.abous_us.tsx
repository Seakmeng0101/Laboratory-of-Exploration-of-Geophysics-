import { useState, useEffect, useRef, useCallback } from 'react';
import MemberList from './MemberList';
import TeamList from './TeamList';

const PALETTE = [
  { blob: [99, 102, 241], bg: [10, 10, 15] },
  { blob: [56, 189, 248], bg: [13, 27, 42] },
  { blob: [139, 92, 246], bg: [15, 23, 42] },
  { blob: [52, 211, 153], bg: [7, 26, 16] },
  { blob: [248, 113, 113], bg: [26, 10, 10] },
  { blob: [192, 132, 252], bg: [15, 10, 26] },
  { blob: [96, 165, 250], bg: [10, 16, 32] },
];

class Blob {
  x: number; y: number; vx: number; vy: number;
  radius: number; birth: number; life: number;
  color: number[]; phase: number; wobbleSpeed: number;
  wobbleAmp: number; driftX: number; driftY: number;
  alpha: number; currentRadius: number;

  constructor(x: number, y: number, color: number[]) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.radius = 60 + Math.random() * 60;
    this.birth = performance.now();
    this.life = 8000 + Math.random() * 6000;
    this.color = color;
    this.phase = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.0008 + Math.random() * 0.0005;
    this.wobbleAmp = 0.12 + Math.random() * 0.1;
    this.driftX = (Math.random() - 0.5) * 0.008;
    this.driftY = -0.005 - Math.random() * 0.008;
    this.alpha = 0; this.currentRadius = 0;
  }

  update(now: number, w: number, h: number): boolean {
    const age = now - this.birth;
    const lifeRatio = age / this.life;
    if (lifeRatio < 0.08) this.alpha = lifeRatio / 0.08;
    else if (lifeRatio > 0.75) this.alpha = 1 - (lifeRatio - 0.75) / 0.25;
    else this.alpha = 1;
    this.alpha = Math.max(0, Math.min(1, this.alpha));
    const wobble = 1 + Math.sin(now * this.wobbleSpeed + this.phase) * this.wobbleAmp;
    this.currentRadius = this.radius * wobble * this.alpha;
    this.vx += this.driftX; this.vy += this.driftY;
    this.vx *= 0.995; this.vy *= 0.995;
    this.x += this.vx; this.y += this.vy;
    if (this.x < -200) this.x = w + 200;
    if (this.x > w + 200) this.x = -200;
    if (this.y < -300) this.y = h + 100;
    return age < this.life;
  }
}

const AboutUs = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'member' | 'team'>('member');
  const [showAddMember, setShowAddMember] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<Blob[]>([]);
  const paletteIdxRef = useRef(0);
  const animRef = useRef<number>(0);

  // const role = localStorage.getItem('role') || 'visitor';
  const role = 'admin'; 

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const spawnBlob = useCallback((x: number, y: number) => {
    const next = (paletteIdxRef.current + 1) % PALETTE.length;
    paletteIdxRef.current = next;
    setPaletteIdx(next);
    const p = PALETTE[next];
    for (let i = 0; i < 4; i++) {
      const jx = x + (Math.random() - 0.5) * 80;
      const jy = y + (Math.random() - 0.5) * 80;
      blobsRef.current.push(new Blob(jx, jy, p.blob));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const THRESHOLD = 0.6;
    const TILE = 6;
    const draw = (now: number) => {
      const w = canvas.width; const h = canvas.height;
      blobsRef.current = blobsRef.current.filter(b => b.update(now, w, h));
      ctx.clearRect(0, 0, w, h);
      const bg = PALETTE[paletteIdxRef.current].bg;
      ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
      ctx.fillRect(0, 0, w, h);
      if (blobsRef.current.length > 0) {
        const cols = Math.ceil(w / TILE) + 1;
        const rows = Math.ceil(h / TILE) + 1;
        const field = new Float32Array(cols * rows);
        const colR = new Float32Array(cols * rows);
        const colG = new Float32Array(cols * rows);
        const colB = new Float32Array(cols * rows);
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const px = i * TILE; const py = j * TILE;
            let val = 0; let wr = 0, wg = 0, wb = 0, wt = 0;
            for (const b of blobsRef.current) {
              if (b.currentRadius <= 0) continue;
              const dx = px - b.x; const dy = py - b.y;
              const dist2 = dx * dx + dy * dy;
              const r = b.currentRadius;
              const contrib = (r * r) / (dist2 + 0.001);
              val += contrib;
              const w2 = contrib * b.alpha;
              wr += b.color[0] * w2; wg += b.color[1] * w2; wb += b.color[2] * w2; wt += w2;
            }
            const idx = j * cols + i;
            field[idx] = val;
            if (wt > 0) { colR[idx] = wr / wt; colG[idx] = wg / wt; colB[idx] = wb / wt; }
          }
        }
        const imgData = ctx.createImageData(w, h);
        const data = imgData.data;
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const idx = j * cols + i;
            const v = field[idx];
            if (v < THRESHOLD * 0.3) continue;
            const px = i * TILE; const py = j * TILE;
            const tw = Math.min(TILE, w - px); const th = Math.min(TILE, h - py);
            const t = Math.max(0, Math.min(1, (v - THRESHOLD * 0.3) / (THRESHOLD * 0.7)));
            const glow = Math.max(0, Math.min(1, (v - THRESHOLD) / 0.4));
            const cr = Math.min(255, colR[idx] * (0.3 + glow * 0.7) + glow * 60);
            const cg = Math.min(255, colG[idx] * (0.3 + glow * 0.7) + glow * 20);
            const cb = Math.min(255, colB[idx] * (0.3 + glow * 0.7) + glow * 80);
            const alpha = Math.round(t * 255);
            for (let dy = 0; dy < th; dy++) {
              for (let dx = 0; dx < tw; dx++) {
                const p = ((py + dy) * w + (px + dx)) * 4;
                data[p] = cr; data[p + 1] = cg; data[p + 2] = cb; data[p + 3] = alpha;
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        ctx.filter = 'blur(8px)'; ctx.globalAlpha = 0.3;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none'; ctx.globalAlpha = 1;
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    spawnBlob(e.clientX - rect.left, e.clientY - rect.top);
  };

  const bg = PALETTE[paletteIdx].bg;

  return (
    <div>
      {/* Header */}
      <div
        onPointerDown={handlePointerDown}
        className="relative overflow-hidden py-20 px-5 text-center cursor-pointer select-none"
        style={{
          backgroundColor: `rgb(${bg[0]},${bg[1]},${bg[2]})`,
          transition: 'background-color 0.8s ease',
          minHeight: 320,
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: 'block' }} />
        <div
          className="fixed w-96 h-96 rounded-full pointer-events-none z-0"
          style={{
            top: mousePos.y - 200,
            left: mousePos.x - 200,
            background: `radial-gradient(circle, rgba(${PALETTE[paletteIdx].blob.join(',')}, 0.2) 0%, transparent 70%)`,
            filter: 'blur(40px)',
            transition: 'top 0.1s ease, left 0.1s ease',
          }}
        />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white leading-snug mb-4">
            We are the team who<br />involved in lab
          </h1>
          {/* <p className="text-sm text-white/50 max-w-xl mx-auto leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
          </p> */}
        </div>
      </div>

      {/* Content */}
{/* Content */}
<div className="flex items-center justify-between max-w-screen-xl mx-auto px-6 py-8">
  <div className="flex gap-8">
    <button
      onClick={() => setActiveTab('member')}
      className={`pb-3 text-xl font-bold border-b-4 -mb-0.5 transition-colors ${
        activeTab === 'member'
          ? 'border-cyan-500 text-cyan-500'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      Member
    </button>
    {role === 'admin' && (
      <button
        onClick={() => setActiveTab('team')}
        className={`pb-3 text-xl font-bold border-b-4 -mb-0.5 transition-colors ${
          activeTab === 'team'
            ? 'border-cyan-500 text-cyan-500'
            : 'border-transparent text-gray-400 hover:text-gray-600'
        }`}
      >
        Team
      </button>
    )}
  </div>

  {(role === 'admin' || role === 'moderator') && (
    <button
      onClick={() => activeTab === 'member' && setShowAddMember(true)}
      className="mb-2 px-6 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition"
    >
      {activeTab === 'member' ? '+ Add member' : '+ Add team'}
    </button>
  )}
</div>

{/* Lists */}
{activeTab === 'member' && (
  <MemberList role={role} showModal={showAddMember} onModalClose={() => setShowAddMember(false)} />
)}
{activeTab === 'team' && role === 'admin' && <TeamList />}

    </div>
    
  );
};

export default AboutUs;