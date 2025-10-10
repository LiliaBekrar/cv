(async function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  $('#year')?.append(new Date().getFullYear());

  $('#start-btn')?.addEventListener('click', ()=>{
    document.getElementById('experience')?.scrollIntoView({behavior:'smooth'});
  });

  // charge un JSON ou fallback
  async function loadJSON(path, fallbackId){
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('fetch failed');
      return await res.json();
    } catch (e) {
      const raw = document.getElementById(fallbackId)?.textContent || 'null';
      return raw ? JSON.parse(raw) : null;
    }
  }

  // 🧩 englobe le contenu de chaque .card dans un <div class="card-inner">
  const injectInner = (cardEl) => {
    if (!cardEl || cardEl.querySelector('.card-inner')) return;
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    while (cardEl.firstChild) inner.appendChild(cardEl.firstChild);
    cardEl.appendChild(inner);
  };

  const [exp, edu, projects, highlights, reco] = await Promise.all([
    loadJSON('data/experience.json', 'data-experience'),
    loadJSON('data/education.json', 'data-education'),
    loadJSON('data/projects.json', 'data-projects'),
    loadJSON('data/highlights.json', 'data-highlights'),
    loadJSON('data/reco.json', 'data-reco')
  ]);

  /* =========================
     🕰️ Timeline
     ========================= */
  const iconFor = (type) => ({ lead:'⚙️', dev:'💻', ops:'🛠', edu:'🎓', other:'✨' }[type] || '✨');
  const expList = $('#exp-list');
  const frag = document.createDocumentFragment();

  (exp?.items||[]).forEach(it => {
    const li = document.createElement('li'); li.className = 'timeline-item';
    const side = document.createElement('div'); side.className = 'side';
    side.innerHTML = `<span class="date-badge">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="4" y="4" width="16" height="16" rx="2"></rect>
  <path d="M4 10h16"></path>
</svg>

        ${it.period || ''}
      </span>`;
    const dot = document.createElement('div'); dot.className='dot'; dot.setAttribute('aria-hidden','true');
    const card = document.createElement('article'); card.className='card'; card.tabIndex=0;

    const h3 = document.createElement('h3');
    h3.innerHTML = `<span class="icon">${iconFor(it.type)}</span> ${it.title} — ${it.company}`;
    const meta = document.createElement('div'); meta.className='meta';
    (it.stack||[]).slice(0,10).forEach(t=>{
      const s = document.createElement('span'); s.className='tag'; s.textContent=t; meta.appendChild(s);
    });
    const p = document.createElement('p'); p.textContent = it.desc || '';
    card.append(h3, meta, p);
    injectInner(card); // <---- encapsule le contenu
    li.append(side, dot, card); frag.append(li);
  });
  expList?.appendChild(frag);

  /* =========================
     👁️ Apparition des cards
     ========================= */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, {threshold:.2});
  $$('.card').forEach(c=> io.observe(c));

  /* =========================
     ⌨️ Navigation clavier J/K
     ========================= */
  const cards = $$('.card');
  let idx = 0;
  const focusCard = (i) => {
    idx = Math.max(0, Math.min(cards.length-1, i));
    cards[idx].focus({preventScroll:true});
    cards[idx].scrollIntoView({behavior:'smooth', block:'center'});
  };
  document.addEventListener('keydown', (e)=>{
    if (['ArrowDown','KeyJ'].includes(e.code)) focusCard(idx+1);
    if (['ArrowUp','KeyK'].includes(e.code)) focusCard(idx-1);
  });

  /* =========================
     🎓 Formation
     ========================= */
  const eduGrid = $('#edu-grid');
  (edu?.items||[]).forEach(it=>{
    const el = document.createElement('article'); el.className='card';
    el.innerHTML = `<h3>🎓 ${it.title}</h3><div class="meta">${it.place} • ${it.years}</div><p>${it.desc||''}</p>`;
    injectInner(el);
    eduGrid?.appendChild(el);
  });

  /* =========================
     🚀 Projets + filtres
     ========================= */
  const projGrid = $('#proj-grid');
  const projFilters = $('#proj-filters');
  const tags = Array.from(new Set((projects?.items||[]).flatMap(p => p.tags || []))).sort();

  const renderProjects = (activeTag) => {
    projGrid.innerHTML = '';
    (projects?.items||[])
      .filter(p => !activeTag || (p.tags||[]).includes(activeTag))
      .forEach(p=>{
        const el = document.createElement('article'); el.className='card';
        const links = [`<a class="btn small" href="${p.link}" target="_blank" rel="noopener">GitHub</a>`];
        if (p.demo) links.push(`<a class="btn small ghost" href="${p.demo}" target="_blank" rel="noopener">Démo</a>`);
        el.innerHTML = `<h3>🚀 ${p.title}</h3>
                        <div class="meta">${p.year || ''} • ${(p.tags||[]).join(' • ')}</div>
                        <p>${p.desc||''}</p>
                        <div class="actions">${links.join(' ')}</div>`;
        injectInner(el);
        projGrid.appendChild(el);
      });
  };

  if (projFilters) {
    projFilters.innerHTML = `<button class="btn small" data-tag="">Tous</button>` +
      tags.map(t=>`<button class="btn small ghost" data-tag="${t}">${t}</button>`).join(' ');
    projFilters.addEventListener('click', (e)=>{
      const tag = e.target.getAttribute('data-tag');
      if (tag !== null) {
        $$('#proj-filters .btn').forEach(b=> b.classList.toggle('ghost', b.getAttribute('data-tag')!==tag));
        renderProjects(tag||undefined);
      }
    });
  }
  if (projGrid) renderProjects();

  /* =========================
     ✨ Highlights
     ========================= */
  const hiList = $('#hi-list');
  (highlights?.items||[]).forEach(h=>{
    const li = document.createElement('li'); li.className = 'badge';
    li.innerHTML = h.link ? `<a href="${h.link}" target="_blank" rel="noopener">${h.text}</a>` : h.text;
    hiList?.appendChild(li);
  });

  /* =========================
     💬 Recommandations
     ========================= */
  const recoList = $('#reco-list');
  const initials = name => (name||'?').split(/\s+/).map(p=>p[0]).join('').slice(0,2).toUpperCase();
  const renderReco = (arr=[]) => {
    recoList.innerHTML = '';
    arr.forEach(r=>{
      const div = document.createElement('article'); div.className='card reco';
      const avatar = document.createElement('div'); avatar.className='reco-avatar';
      if (r.avatar_url) {
        avatar.innerHTML = `<img src="${r.avatar_url}" alt="Photo de ${r.author}" onerror="this.replaceWith(document.createTextNode(''));">`;
      } else {
        avatar.textContent = initials(r.author||'?');
        avatar.setAttribute('aria-hidden','true');
      }

      const header = document.createElement('header');
      const who = document.createElement('div'); who.className='who';
      who.innerHTML = r.profile_url
        ? `<a href="${r.profile_url}" target="_blank" rel="noopener"><strong>${r.author}</strong></a><span class="muted">${r.role||''}</span>`
        : `<strong>${r.author}</strong><span class="muted">${r.role||''}</span>`;
      header.append(avatar, who);
      const quote = document.createElement('blockquote'); quote.textContent = r.text;
      div.append(header, quote);
      injectInner(div);
      recoList.appendChild(div);
    });
  };
  if (recoList) renderReco(reco);
})();
