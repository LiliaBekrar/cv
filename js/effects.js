// Progress, light sweep body, reveal, tilt, theme toggle, confetti celebration
(function(){
  const progress = document.getElementById('progress');

  // Scroll progress + celebrate at 100%
  function onScroll(){
    const s = window.scrollY;
    const d = document.documentElement.scrollHeight - window.innerHeight;
    const p = Math.max(0, Math.min(1, s / (d || 1)));
    progress.style.transform = `scaleX(${p})`;
    if (p === 1) celebrateOnce();
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Body light sweep follows mouse
  const light = document.querySelector('.light-sweep');
  window.addEventListener('pointermove', (e)=>{
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    light?.style.setProperty('--mx', x + '%');
    light?.style.setProperty('--my', y + '%');
  }, {passive:true});

  // Reveal on view
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: .16 });
  document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelectorAll('.card').forEach(c=> io.observe(c));
  });

  // Tilt gentle
  document.addEventListener('pointermove', (e)=>{
    document.querySelectorAll('.card.in-view').forEach(card => {
      const b = card.getBoundingClientRect();
      const cx = b.left + b.width/2, cy = b.top + b.height/2;
      const dx = (e.clientX - cx) / (b.width/2);
      const dy = (e.clientY - cy) / (b.height/2);
      card.style.transform = `rotateX(${(-dy*5).toFixed(2)}deg) rotateY(${(dx*5).toFixed(2)}deg) translateY(0) scale(1)`;
    });
  }, {passive:true});
  document.addEventListener('pointerleave', (e)=>{
    if (!e.relatedTarget) document.querySelectorAll('.card').forEach(el=> el.style.transform = '');
  });

  // Theme toggle: auto/light/dark
  const root = document.documentElement;
  const btn = document.getElementById('theme-btn');
  const key = 'cv_theme';
  const applyTheme = (t) => { if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t); };
  const next = { 'auto':'light', 'light':'dark', 'dark':'auto' };
  let theme = localStorage.getItem(key) || 'auto';
  applyTheme(theme);
  if (btn) {
    btn.textContent = theme === 'dark' ? '🌙 Thème' : theme === 'light' ? '☀️ Thème' : '🌗 Thème';
    btn.addEventListener('click', ()=>{
      theme = next[theme] || 'auto';
      localStorage.setItem(key, theme);
      applyTheme(theme);
      btn.textContent = theme === 'dark' ? '🌙 Thème' : theme === 'light' ? '☀️ Thème' : '🌗 Thème';
    });
  }

  // Celebration once
  let done = false;
  window.celebrateOnce = function(){
    if (done) return;
    done = true;
    const modal = document.getElementById('celebrate');
    const close = document.getElementById('celebrate-close');
    const canvas = document.getElementById('confetti');
    if (!modal || !canvas) return;
    modal.classList.add('show');
    close?.addEventListener('click', ()=> modal.classList.remove('show'));
    modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.remove('show'); });
    confettiBurst(canvas, 180);
  };

  // Confetti burst
  function confettiBurst(canvas, n=150){
    const ctx = canvas.getContext('2d');
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;
    const colors = ['#FFD166','#06D6A0','#118AB2','#EF476F','#FFFFFF'];
    const parts = Array.from({length:n}).map(()=> ({
      x: w/2, y: h/2,
      vx: (Math.random()*2-1)*6,
      vy: (Math.random()*2-1)*7 - 4,
      g: 0.18 + Math.random()*0.12,
      s: 4 + Math.random()*6,
      c: colors[(Math.random()*colors.length)|0],
      a: 1, spin: Math.random()*6.28
    }));
    let raf;
    function step(){
      ctx.clearRect(0,0,w,h);
      parts.forEach(p=>{
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.spin += 0.1; p.a -= 0.006;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.a); ctx.translate(p.x, p.y); ctx.rotate(p.spin);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s); ctx.restore();
      });
      if (parts.some(p=>p.a>0)) raf = requestAnimationFrame(step);
    }
    step();
    setTimeout(()=> cancelAnimationFrame(raf), 6000);
    window.addEventListener('resize', ()=>{ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }, {once:true});
  }
})();
