(async function(){
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* Année dans le footer */
  $('#year')?.append(new Date().getFullYear());

  /* Scroll vers Expériences */
  $('#start-btn')?.addEventListener('click', ()=>{
    document.getElementById('experience')?.scrollIntoView({behavior:'smooth'});
  });

  /* Apparition des cards (in-view) */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, {threshold:.2});
  $$('.card').forEach(c=> io.observe(c));

  /* Navigation clavier J/K */
  const cards = $$('.card');
  let idx = 0;
  const focusCard = (i) => {
    idx = Math.max(0, Math.min(cards.length-1, i));
    cards[idx].focus({preventScroll:true});
    cards[idx].scrollIntoView({behavior:'smooth', block:'center'});
  };
  document.addEventListener('keydown', (e)=>{
    if (e.code === 'ArrowDown' || e.code === 'KeyJ') focusCard(idx+1);
    if (e.code === 'ArrowUp'   || e.code === 'KeyK') focusCard(idx-1);
  });

  /* ===== Flip 3D : transformer automatiquement les cartes Expériences + Formations ===== */
  const flipTargets = $$('#experience .card, #education .card');
  flipTargets.forEach((card)=>{
    const inner = card.querySelector('.card-inner') || card;
    // Récupère les éléments utiles (selon ton HTML actuel)
    const title = inner.querySelector('h3');
    const meta  = inner.querySelector('.meta');
    const para  = inner.querySelector('p');

    // Si on a au moins un titre, on peut construire le flip
    if (!title) return;

    // Construire les faces
    const front = document.createElement('div');
    front.className = 'card-face front';
    front.append(title.cloneNode(true));
    if (meta) front.append(meta.cloneNode(true));

    const back = document.createElement('div');
    back.className = 'card-face back';
    back.append(title.cloneNode(true));
    if (meta) back.append(meta.cloneNode(true));
    if (para) back.append(para.cloneNode(true));

    // Remplacer le contenu par la structure 3D
    const c3d = document.createElement('div');
    c3d.className = 'card-3d';
    c3d.append(front, back);

    // Si on avait .card-inner, on la remplace, sinon on vide la carte puis on injecte
    if (inner !== card) {
      inner.replaceWith(c3d);
    } else {
      card.innerHTML = '';
      card.appendChild(c3d);
    }

    // Marquer la carte comme flip + focusable
    card.classList.add('flip');
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

    // Clavier : Enter / Espace pour retourner
    card.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') {
        card.classList.toggle('is-flipped');
        e.preventDefault();
      }
    });

    // Mobile/tactile : tap pour retourner (sans bloquer liens/boutons éventuels)
    card.addEventListener('click', (e)=>{
      if (e.target.closest('a, button')) return;
      card.classList.toggle('is-flipped');
    }, { passive: true });
  });

  //   // === Serpent lumineux sur chaque carte flip (Expériences + Formations)
  // if (window.initGlowSnake) {
  //   $$('#experience .card.flip, #education .card.flip').forEach(window.initGlowSnake);
  // }

})();