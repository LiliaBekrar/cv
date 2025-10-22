// (function(){
//   if (window.initGlowSnake) return; // idempotent

//   // Limites sûres pour tous navigateurs
//   const MAX_DIM     = 400;          // px max par côté
//   const MAX_PIXELS  =800;     // ~8MP (sûr et performant)

//   window.initGlowSnake = function(cardEl){
//     try {
//       if (!cardEl || !window.gsap) return;
//       if (cardEl.__glowSnakeReady) return; // déjà initialisé
//       cardEl.__glowSnakeReady = true;

//       if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

//       // Évite de créer deux canvases si déjà présent
//       if (cardEl.querySelector('.card-glowtrail')) return;

//       // Canvas sous le contenu
//       const canvas = document.createElement('canvas');
//       canvas.className = 'card-glowtrail';
//       cardEl.prepend(canvas);
//       const ctx = canvas.getContext('2d', { alpha: true });

//       let running = false;
//       let W = 0, H = 0;     // taille CSS du canvas (en px)
//       let S = 1;            // scale effectif (<= dpr), appliqué via setTransform

//       // ---- Resize robuste avec caps ----
// // ---- Resize : canvas = taille exacte de la carte ----
// const doResize = () => {
//   const r = cardEl.getBoundingClientRect();

//   // Si la carte est invisible (display:none ou rect=0), on attend le prochain frame
//   if (r.width === 0 || r.height === 0) {
//     requestAnimationFrame(doResize);
//     return;
//   }

//   const dpr = Math.max(1, window.devicePixelRatio || 1);

//   // On prend la taille exacte du bloc, sans marge
//   const targetW = Math.floor(r.width);
//   const targetH = Math.floor(r.height);

//   // Taille réelle du bitmap (pour netteté retina)
//   const bmpW = Math.round(targetW * dpr);
//   const bmpH = Math.round(targetH * dpr);

//   // Applique dimensions
//   canvas.width  = bmpW;
//   canvas.height = bmpH;
//   canvas.style.width  = targetW + 'px';
//   canvas.style.height = targetH + 'px';

//   // Applique le transform (scale pour dpr)
//   ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

//   // Sauve les dimensions CSS utiles au dessin
//   W = targetW;
//   H = targetH;
// };

//       // Throttle resize via rAF
//       let resizeScheduled = false;
//       const scheduleResize = () => {
//         if (resizeScheduled) return;
//         resizeScheduled = true;
//         requestAnimationFrame(() => {
//           resizeScheduled = false;
//           doResize();
//         });
//       };
//       scheduleResize();

//       const ro = new ResizeObserver(scheduleResize);
//       ro.observe(cardEl);

//       // Palette depuis CSS vars
//       const css = getComputedStyle(document.documentElement);
//       const c1 = css.getPropertyValue('--brand6')?.trim() || '#00E5FF';
//       const c2 = css.getPropertyValue('--brand7')?.trim() || '#9B5CF6';
//       const c3 = css.getPropertyValue('--brand8')?.trim() || '#FF5AA5';

//       // Serpent
//       const SEGMENTS = 42;
//       const trail = new Array(SEGMENTS).fill(0).map(()=>({x: 0, y: 0}));
//       const head = { x: 0, y: 0, vx: 0.9, vy: 0.6, t: Math.random()*Math.PI*2, ready:false };

//       // Init tête au centre après premier resize effectif
//       const ensureHead = () => {
//         if (head.ready || W === 0 || H === 0) return false;
//         head.x = W * 0.65;
//         head.y = H * 0.35;
//         for (let i=0;i<trail.length;i++) { trail[i].x = head.x; trail[i].y = head.y; }
//         head.ready = true;
//         return true;
//       };

//       // Parallaxe souris
//       const pointer = { x: 0, y: 0, active: false };
//       cardEl.addEventListener('pointerenter', ()=>{ pointer.active = true; });
//       cardEl.addEventListener('pointermove', (e)=>{
//         const r = cardEl.getBoundingClientRect();
//         pointer.x = (e.clientX - r.left) * 1.20;
//         pointer.y = (e.clientY - r.top ) * 1.20;
//       });
//       cardEl.addEventListener('pointerleave', ()=>{ pointer.active = false; });

//       function wander() {
//         head.t += 0.012;
//         head.vx = Math.cos(head.t*0.9) * 1.1 + Math.sin(head.t*0.53) * 0.6;
//         head.vy = Math.sin(head.t*0.8) * 1.1 + Math.cos(head.t*0.47) * 0.6;
//         head.x += head.vx; head.y += head.vy;

//         // rebond doux
//         if (head.x < 20 || head.x > W-20) head.vx *= -1;
//         if (head.y < 20 || head.y > H-20) head.vy *= -1;

//         // petite attraction souris
//         if (pointer.active) {
//           head.x += (pointer.x - W/2) * 0.0009;
//           head.y += (pointer.y - H/2) * 0.0009;
//         }
//       }

//       function render(){
//         if (!head.ready) return; // attend la 1ère taille valide

//         ctx.clearRect(0,0,W,H);

//         // halo subtil
//         const grad = ctx.createRadialGradient(W*0.75, H*0.2, 10, W*0.75, H*0.2, Math.max(W,H)*0.9);
//         grad.addColorStop(0, 'rgba(255,255,255,0.05)');
//         grad.addColorStop(1, 'rgba(255,255,255,0.00)');
//         ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);

//         // trail
//         trail.pop(); trail.unshift({ x: head.x, y: head.y });

//         ctx.save();
//         ctx.globalCompositeOperation = 'lighter';
//         ctx.lineCap = 'round';
//         ctx.lineJoin = 'round';

//         const strokes = [
//           { w: 12, s: 24, color: c2, alpha: 0.10 },
//           { w:  3, s: 10, color: c1, alpha: 0.85 }
//         ];
//         for (const pass of strokes) {
//           ctx.beginPath();
//           for (let i=0; i<trail.length-1; i++) {
//             const p = trail[i], n = trail[i+1];
//             if (i === 0) ctx.moveTo(p.x, p.y);
//             const mx = (p.x + n.x) / 2;
//             const my = (p.y + n.y) / 2;
//             ctx.quadraticCurveTo(p.x, p.y, mx, my);
//           }
//           ctx.shadowColor = pass.color;
//           ctx.shadowBlur  = pass.s;
//           ctx.strokeStyle = pass.color;
//           ctx.globalAlpha = pass.alpha;
//           ctx.lineWidth = pass.w;
//           ctx.stroke();
//         }

//         // étincelle (tête)
//         ctx.globalAlpha = 0.9;
//         ctx.shadowBlur = 22;
//         ctx.shadowColor = c3;
//         ctx.fillStyle = c3;
//         ctx.beginPath();
//         ctx.arc(head.x, head.y, 1.6, 0, Math.PI*2);
//         ctx.fill();

//         ctx.restore();
//       }

//       const tick = () => {
//         ensureHead();  // no-op après init
//         wander();
//         render();
//       };

//       const start = () => {
//         if (running) return;
//         running = true;
//         canvas.style.opacity = '1';
//         gsap.ticker.add(tick);
//       };
//       const stop = () => {
//         if (!running) return;
//         running = false;
//         canvas.style.opacity = '0';
//         gsap.ticker.remove(tick);
//       };

//       const isActive = () =>
//         cardEl.matches(':hover') ||
//         cardEl.matches(':focus-within') ||
//         cardEl.classList.contains('is-flipped');

//       const sync = () => (isActive() ? start() : stop());

//       cardEl.addEventListener('mouseenter', sync);
//       cardEl.addEventListener('mouseleave', sync);
//       cardEl.addEventListener('focusin',   sync);
//       cardEl.addEventListener('focusout',  sync);
//       new MutationObserver(sync).observe(cardEl, { attributes: true, attributeFilter: ['class'] });

//       // Démarre/arrête selon l’état initial (après 1er resize)
//       requestAnimationFrame(() => { scheduleResize(); sync(); });

//       // Nettoyage
//       cardEl.addEventListener('remove', () => { stop(); ro.disconnect(); }, { once: true });

//     } catch (err) {
//       // fail-soft
//       console.error('[GlowSnake] init error', err);
//     }
//   };
// })();
