const canvas = document.getElementById('orbCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const wrap = document.getElementById('orbWrap');
  canvas.width  = wrap.offsetWidth  * devicePixelRatio;
  canvas.height = wrap.offsetHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let orbTime = 0;

function drawOrb(ts) {
  orbAnimId = requestAnimationFrame(drawOrb);
  orbTime = ts * 0.001;
  const sub=document.getElementById('orbSublabel');
  const label=orbState==='listening'?'IN ASCOLTO…':orbState==='thinking'?'ELABORAZIONE…':orbState==='speaking'?'HEIWA PARLA…':'TOCCA PER PARLARE';
  if(sub.textContent!==label)sub.textContent=label;

  const W = canvas.width / devicePixelRatio;
  const H = canvas.height / devicePixelRatio;
  const cx = W / 2, cy = H / 2;
  const baseR = Math.min(W, H) * 0.38;

  ctx.clearRect(0, 0, W, H);

  const speed = orbState === 'listening' ? 3.5
              : orbState === 'speaking'  ? 2.5
              : orbState === 'thinking'  ? 1.8
              : 0.6;

  const t = orbTime * speed;

  const rings = [
    { r: baseR * 1.0, segments: 24, dash: 0.6, width: 1.5, rot: t * 0.4 },
    { r: baseR * 0.84, segments: 16, dash: 0.7, width: 1.0, rot: -t * 0.6 },
    { r: baseR * 0.70, segments: 32, dash: 0.4, width: 0.8, rot: t * 0.9 },
    { r: baseR * 0.57, segments: 8,  dash: 0.8, width: 2.0, rot: -t * 1.2 },
  ];

  const glowAmt = orbState === 'idle'    ? 0.4 + 0.1 * Math.sin(t * 2)
                : orbState === 'thinking'? 0.5 + 0.3 * Math.sin(t * 5)
                : 0.7 + 0.3 * Math.sin(t * 8);

  const grd = ctx.createRadialGradient(cx, cy, baseR * 0.3, cx, cy, baseR * 1.3);
  grd.addColorStop(0, `rgba(0,200,255,${glowAmt * 0.25})`);
  grd.addColorStop(0.6, `rgba(0,100,200,${glowAmt * 0.08})`);
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(cx, cy, baseR * 1.3, 0, Math.PI * 2); ctx.fill();

  rings.forEach(ring => {
    const segAngle = (Math.PI * 2) / ring.segments;
    for (let i = 0; i < ring.segments; i++) {
      const start = ring.rot + i * segAngle;
      const end   = start + segAngle * ring.dash;
      const alpha = glowAmt * (0.5 + 0.5 * Math.sin(t * 2 + i * 0.7));
      ctx.beginPath(); ctx.arc(cx, cy, ring.r, start, end);
      ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
      ctx.lineWidth = ring.width; ctx.stroke();
    }
  });

  const innerGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.48);
  innerGrd.addColorStop(0, `rgba(0,30,70,0.95)`);
  innerGrd.addColorStop(1, `rgba(3,13,26,0.98)`);
  ctx.beginPath(); ctx.arc(cx, cy, baseR * 0.48, 0, Math.PI * 2);
  ctx.fillStyle = innerGrd; ctx.fill();

  ctx.beginPath(); ctx.arc(cx, cy, baseR * 0.48, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(0,200,255,${glowAmt * 0.6})`; ctx.lineWidth = 1.5; ctx.stroke();

  if (orbState === 'listening' || orbState === 'speaking') {
    const bars = 7, barW = 3;
    const totalW = bars * barW + (bars - 1) * 3;
    for (let i = 0; i < bars; i++) {
      const x = cx - totalW / 2 + i * (barW + 3);
      const h = baseR * 0.15 * (0.3 + Math.abs(Math.sin(t * 6 + i * 0.8)));
      ctx.fillStyle = `rgba(0,200,255,${glowAmt})`;
      ctx.beginPath(); ctx.roundRect(x, cy + 20 - h / 2, barW, h, 1); ctx.fill();
    }
  }
}
drawOrb(0);

function setOrbState(state) {
  orbState = state;
  const lbl = document.getElementById('orbSublabel');
  lbl.textContent = state === 'listening' ? 'IN ASCOLTO...'
                  : state === 'thinking'  ? 'ELABORAZIONE...'
                  : state === 'speaking'  ? 'HEIWA PARLA…'
                  : 'TOCCA PER PARLARE';
}

