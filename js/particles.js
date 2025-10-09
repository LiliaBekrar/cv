// Particules simples (hero)
(function(){
  const c = document.getElementById('particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, particles;
  const colors = ['#FFD166', '#06D6A0', '#118AB2', '#EF476F'];

  function resize(){
    w = c.width = c.offsetWidth;
    h = c.height = c.offsetHeight;
    particles = Array.from({length: Math.max(70, Math.floor(w/18))}).map(()=> ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-.5)*0.45, vy: (Math.random()-.5)*0.45,
      r: Math.random()*1.9 + 0.6,
      c: colors[(Math.random()*colors.length)|0],
    }));
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  function step(){
    ctx.clearRect(0,0,w,h);
    for (const p of particles){
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.c; ctx.globalAlpha = 0.85; ctx.fill();
    }
    ctx.globalAlpha = 0.12;
    for (let i=0;i<particles.length;i++){
      for (let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx=a.x-b.x, dy=a.y-b.y, d2=dx*dx+dy*dy;
        if (d2 < 140*140){
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = '#eaf1ff'; ctx.lineWidth = 0.45; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
