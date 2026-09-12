/* Club GreenSock plugins are licensed and loaded locally; the preview build
   ships without them, so every use is guarded. */
const HAS_SMOOTHER = typeof ScrollSmoother !== 'undefined';
const HAS_SPLIT = typeof SplitText !== 'undefined';
const HAS_EASE = typeof CustomEase !== 'undefined';

gsap.registerPlugin(ScrollTrigger, Flip);
if (HAS_SMOOTHER) gsap.registerPlugin(ScrollSmoother);
if (HAS_SPLIT) gsap.registerPlugin(SplitText);
if (HAS_EASE) gsap.registerPlugin(CustomEase);

const GLIDE = HAS_EASE
  ? CustomEase.create('glide', 'M0,0 C0.16,0.9 0.2,1 1,1')
  : 'expo.out';

if (HAS_SMOOTHER) {
  ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.1,
    effects: true,
    normalizeScroll: true,
    smoothTouch: 0.1
  });
}

const grid = document.getElementById('grid');
const filtersEl = document.getElementById('filters');
const sortEl = document.getElementById('sort');
const modal = document.getElementById('modal');
const cmpBar = document.getElementById('cmpBar');

let activeCat = 'all';
let compare = [];

const money = n => n.toLocaleString('ru-RU');
const badgeClass = b => {
  const t = b.toLowerCase();
  if (t === 'хит') return 'is-hit';
  if (t.includes('%')) return 'is-sale';
  if (t === 'новинка' || t === 'лечебное') return 'is-new';
  return '';
};

/* ---------- Render ---------- */
function cardHTML(p) {
  const off = Math.round((1 - p.price / p.old) * 100);
  return `
  <article class="card" data-id="${p.id}" data-cats="${p.cats.join(' ')}${p.badge === 'Хит' ? ' hit' : ''}"
           data-price="${p.price}" data-off="${off}" tabindex="0">
    <div class="card-media">
      ${p.badge ? `<span class="badge ${badgeClass(p.badge)}">${p.badge}</span>` : ''}
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <span class="card-glow"></span>
    </div>
    <div class="card-body">
      <h3 class="card-name">${p.name}</h3>
      <p class="card-tag">${p.tag}</p>
      <div class="price-row">
        <span class="price">${money(p.price)} ₽</span>
        <span class="price-old">${money(p.old)} ₽</span>
        ${off > 0 ? `<span class="price-off">−${off}%</span>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn btn-buy" data-buy>В корзину</button>
        <button class="btn btn-cmp" data-cmp aria-label="Добавить к сравнению">⇄</button>
      </div>
    </div>
  </article>`;
}

function render() {
  grid.innerHTML = PRODUCTS.map(cardHTML).join('');
  bindCards();
  animateIn();
}

/* ---------- Entrance ---------- */
function animateIn() {
  const cards = gsap.utils.toArray('.card');
  const eases = ['power3.out', 'expo.out', 'back.out(1.2)', 'circ.out'];

  ScrollTrigger.batch(cards, {
    start: 'top 88%',
    onEnter: batch => {
      batch.forEach((el, i) => {
        gsap.fromTo(el,
          { y: 44 + (i % 3) * 10, opacity: 0, scale: 0.965 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.72 + (i % 3) * 0.14,
            ease: eases[i % eases.length],
            delay: i * 0.06
          }
        );
      });
    },
    once: true
  });
}

/* ---------- Hero ---------- */
function heroIn() {
  if (HAS_SPLIT) {
    SplitText.create('[data-anim="title"]', {
      type: 'lines,words',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.words, {
          yPercent: 108, opacity: 0,
          duration: 0.95, stagger: 0.035,
          ease: GLIDE, delay: 0.22
        });
      }
    });
  } else {
    gsap.from('[data-anim="title"]', {
      y: 42, opacity: 0, duration: 0.9, ease: 'expo.out', delay: 0.25
    });
  }

  const tl = gsap.timeline({ delay: 0.15 });
  tl.from('[data-anim="eyebrow"]', { y: 16, opacity: 0, duration: 0.55, ease: 'power2.out' })
    .from('[data-anim="lead"]', { y: 26, opacity: 0, duration: 0.7, ease: 'power3.out' }, 0.42)
    .from('[data-anim="stats"] .stat', { y: 22, opacity: 0, duration: 0.6, stagger: 0.09, ease: 'back.out(1.4)' }, 0.56);

  document.querySelectorAll('[data-count]').forEach(el => {
    const end = +el.dataset.count;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.6, ease: 'power2.out', delay: 0.7,
      onUpdate: () => { el.textContent = Math.round(obj.v); }
    });
  });

  gsap.to('.orb-1', { y: 60, x: 30, duration: 18, repeat: 20, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.orb-2', { y: -50, x: -25, duration: 22, repeat: 20, yoyo: true, ease: 'sine.inOut' });
}

/* ---------- Filters ---------- */
function buildFilters() {
  filtersEl.innerHTML = CATEGORIES.map(c =>
    `<button class="filter${c.id === 'all' ? ' is-on' : ''}" data-cat="${c.id}">${c.label}</button>`
  ).join('');

  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.filter');
    if (!btn) return;
    filtersEl.querySelectorAll('.filter').forEach(b => b.classList.remove('is-on'));
    btn.classList.add('is-on');
    activeCat = btn.dataset.cat;
    applyView();
  });
}

function applyView() {
  const cards = gsap.utils.toArray('.card');
  const state = Flip.getState(cards);
  const mode = sortEl.value;

  let visible = cards.filter(c =>
    activeCat === 'all' || c.dataset.cats.split(' ').includes(activeCat)
  );

  if (mode !== 'default') {
    visible.sort((a, b) => {
      if (mode === 'asc') return a.dataset.price - b.dataset.price;
      if (mode === 'desc') return b.dataset.price - a.dataset.price;
      return b.dataset.off - a.dataset.off;
    });
    visible.forEach(c => grid.appendChild(c));
  }

  cards.forEach(c => {
    const show = visible.includes(c);
    c.style.display = show ? '' : 'none';
  });

  Flip.from(state, {
    duration: 0.68,
    ease: 'power3.inOut',
    stagger: 0.02,
    absolute: true,
    onEnter: els => gsap.fromTo(els,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.3)' }),
    onLeave: els => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' })
  });

  const empty = grid.querySelector('.empty');
  if (empty) empty.remove();
  if (!visible.length) {
    grid.insertAdjacentHTML('beforeend', '<p class="empty">В этой категории пока пусто</p>');
  }
}

/* ---------- Card interactions ---------- */
function bindCards() {
  grid.addEventListener('pointermove', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  grid.addEventListener('pointerenter', e => {
    const card = e.target.closest && e.target.closest('.card');
    if (card) gsap.to(card, { y: -8, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
  }, true);

  grid.addEventListener('pointerleave', e => {
    const card = e.target.closest && e.target.closest('.card');
    if (card) gsap.to(card, { y: 0, duration: 0.55, ease: 'power2.out', overwrite: 'auto' });
  }, true);

  grid.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const p = PRODUCTS.find(x => x.id === card.dataset.id);

    if (e.target.closest('[data-buy]')) {
      window.open(p.url, '_blank', 'noopener');
      return;
    }
    if (e.target.closest('[data-cmp]')) {
      toggleCompare(p, e.target.closest('[data-cmp]'));
      return;
    }
    openModal(p, card);
  });

  grid.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const card = e.target.closest('.card');
    if (card) openModal(PRODUCTS.find(x => x.id === card.dataset.id), card);
  });
}

/* ---------- Modal: the card itself opens ---------- */
const modalBox = modal.querySelector('.modal-box');
const modalMedia = document.getElementById('modalMedia');
let flipHome = null;   // .card-media the image flew out of
let flownImg = null;   // the image element on loan from the card
let titleSplit = null;
let isAnimating = false;

/* ScrollSmoother owns the scroll — overflow:hidden on body breaks its layout */
function lockScroll(on) {
  if (HAS_SMOOTHER) ScrollSmoother.get().paused(on);
  else document.body.classList.toggle('is-locked', on);
}

function fillModal(p) {
  document.getElementById('modalSku').textContent = 'Артикул ' + p.sku;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalTag').textContent = p.tag;
  document.getElementById('modalContents').innerHTML = p.contents.map(c => `<li>${c}</li>`).join('');
  document.getElementById('modalBenefits').innerHTML = p.benefits.map(b => `<li>${b}</li>`).join('');
  document.getElementById('modalPrice').textContent = money(p.price) + ' ₽';
  document.getElementById('modalLink').href = p.url;
}

// clip-path insets that make the panel grow out of the card's screen rect
function growFrom(cardEl) {
  const c = cardEl.getBoundingClientRect();
  const b = modalBox.getBoundingClientRect();
  const px = n => Math.max(0, Math.round(n));
  return `inset(${px(c.top - b.top)}px ${px(b.right - c.right)}px ${px(b.bottom - c.bottom)}px ${px(c.left - b.left)}px round 20px)`;
}

function openModal(p, cardEl) {
  if (isAnimating) return;
  isAnimating = true;

  fillModal(p);
  modal.classList.add('is-open');

  flipHome = cardEl.querySelector('.card-media');
  flownImg = flipHome.querySelector('img');

  const state = Flip.getState(flownImg);
  modalMedia.appendChild(flownImg);

  gsap.set(modalBox, { clipPath: growFrom(cardEl) });
  gsap.set('.modal-veil', { opacity: 0 });

  // lock only once the opening animation is done — pausing the smoother
  // mid-flight interferes with the tween that is still running
  const tl = gsap.timeline({
    onComplete: () => { lockScroll(true); isAnimating = false; }
  });

  tl.to('.modal-veil', { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0)
    .to(modalBox, {
      clipPath: 'inset(0px 0px 0px 0px round 26px)',
      duration: 0.72, ease: 'expo.inOut'
    }, 0)
    .add(Flip.from(state, {
      duration: 0.72,
      ease: 'expo.inOut',
      absolute: true,
      scale: false
    }), 0);

  // headline resolves after the panel settles
  if (HAS_SPLIT) {
    titleSplit = SplitText.create('#modalName', { type: 'lines', mask: 'lines' });
    tl.from(titleSplit.lines, {
      yPercent: 105, duration: 0.6, stagger: 0.07, ease: GLIDE
    }, 0.3);
  }

  tl.from('.modal-sku', { opacity: 0, duration: 0.4 }, 0.34)
    .from('.modal-tag', { y: 14, opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.42)
    .from('.modal-block', { y: 20, opacity: 0, duration: 0.55, stagger: 0.09, ease: 'power3.out' }, 0.48)
    .from('.modal-list li', { x: -12, opacity: 0, duration: 0.4, stagger: 0.035, ease: 'power2.out' }, 0.56)
    .from('.modal-buy', { y: 18, opacity: 0, duration: 0.5, ease: 'back.out(1.3)' }, 0.66);
}

function closeModal() {
  if (isAnimating || !flipHome) return;
  isAnimating = true;
  lockScroll(false);

  if (titleSplit) { titleSplit.revert(); titleSplit = null; }

  const card = flipHome.closest('.card');
  const state = Flip.getState(flownImg);
  flipHome.appendChild(flownImg);

  gsap.timeline({
    onComplete: () => {
      modal.classList.remove('is-open');
      gsap.set(modalBox, { clearProps: 'clipPath,y' });
      flipHome = null; flownImg = null; isAnimating = false;
    }
  })
    .to(modalBox, { clipPath: growFrom(card), duration: 0.5, ease: 'power3.inOut' }, 0)
    .add(Flip.from(state, { duration: 0.5, ease: 'power3.inOut', absolute: true, scale: false }), 0)
    .to('.modal-veil', { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.1);
}

/* swipe the panel away on touch */
if (typeof Draggable !== 'undefined') {
  const HAS_INERTIA = typeof InertiaPlugin !== 'undefined';
  gsap.registerPlugin(Draggable);
  if (HAS_INERTIA) gsap.registerPlugin(InertiaPlugin);

  Draggable.create(modalBox, {
    type: 'y',
    trigger: '.modal-media',
    inertia: HAS_INERTIA,
    edgeResistance: 0.9,
    bounds: { minY: -40, maxY: 600 },
    allowNativeTouchScrolling: false,
    onDragEnd() {
      if (this.endY > 130 || this.getVelocity('y') > 700) {
        gsap.to(modalBox, {
          y: window.innerHeight, opacity: 0, duration: 0.35, ease: 'power2.in',
          onComplete: () => {
            gsap.set(modalBox, { y: 0, opacity: 1 });
            if (flownImg && flipHome) flipHome.appendChild(flownImg);
            modal.classList.remove('is-open');
            lockScroll(false);
            gsap.set(modalBox, { clearProps: 'clipPath' });
            if (titleSplit) { titleSplit.revert(); titleSplit = null; }
            flipHome = null; flownImg = null;
            gsap.set('.modal-veil', { opacity: 0 });
          }
        });
      } else {
        gsap.to(modalBox, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
      }
    }
  });
}

modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});

/* ---------- Compare ---------- */
function toggleCompare(p, btn) {
  const i = compare.findIndex(x => x.id === p.id);
  if (i > -1) {
    compare.splice(i, 1);
    btn.classList.remove('is-on');
  } else {
    if (compare.length >= 3) {
      gsap.fromTo(cmpBar, { x: '-52%' }, { x: '-50%', duration: 0.4, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    compare.push(p);
    btn.classList.add('is-on');
    gsap.fromTo(btn, { scale: 0.8 }, { scale: 1, duration: 0.45, ease: 'back.out(2.5)' });
  }
  renderCompare();
}

function barX() { return window.innerWidth > 900 ? -50 : 0; }

function renderCompare() {
  document.getElementById('cmpCount').textContent = `Выбрано ${compare.length} из 3`;
  document.getElementById('cmpThumbs').innerHTML = compare
    .map(p => `<span class="cmp-thumb"><img src="${p.img}" alt=""></span>`).join('');
  document.getElementById('cmpGo').disabled = compare.length < 2;

  gsap.to(cmpBar, {
    xPercent: barX(),
    yPercent: compare.length ? 0 : 140,
    duration: 0.55,
    ease: compare.length ? 'back.out(1.4)' : 'power2.in'
  });
}

window.addEventListener('resize', () => {
  gsap.set(cmpBar, { xPercent: barX() });
});

document.getElementById('cmpClear').addEventListener('click', () => {
  compare = [];
  document.querySelectorAll('[data-cmp]').forEach(b => b.classList.remove('is-on'));
  renderCompare();
});

const cmpModal = document.getElementById('cmpModal');

document.getElementById('cmpGo').addEventListener('click', () => {
  if (compare.length < 2) return;

  const cheapest = Math.min(...compare.map(p => p.price));
  const bestOff = Math.max(...compare.map(p => Math.round((1 - p.price / p.old) * 100)));

  document.getElementById('cmpTable').innerHTML = compare.map(p => {
    const off = Math.round((1 - p.price / p.old) * 100);
    return `
    <div class="cmp-col">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <dl>
        <div class="cmp-row"><dt>Цена</dt><dd class="${p.price === cheapest ? 'cmp-best' : ''}">${money(p.price)} ₽</dd></div>
        <div class="cmp-row"><dt>Было</dt><dd>${money(p.old)} ₽</dd></div>
        <div class="cmp-row"><dt>Скидка</dt><dd class="${off === bestOff ? 'cmp-best' : ''}">−${off}%</dd></div>
        <div class="cmp-row"><dt>Артикул</dt><dd>${p.sku}</dd></div>
        <div class="cmp-row"><dt>Состав</dt><dd>${p.contents.length} поз.</dd></div>
      </dl>
      <a class="btn btn-buy" href="${p.url}" target="_blank" rel="noopener">Заказать</a>
    </div>`;
  }).join('');

  document.querySelector('.cmp-table').style.gridTemplateColumns =
    window.innerWidth > 900 ? `repeat(${compare.length}, minmax(0, 1fr))` : '1fr';

  cmpModal.classList.add('is-open');
  lockScroll(true);

  gsap.timeline()
    .to('#cmpModal .modal-veil', { opacity: 1, duration: 0.35, ease: 'power2.out' })
    .fromTo('#cmpModal .modal-box',
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'expo.out' }, 0.06)
    .from('#cmpModal .cmp-col',
      { y: 26, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out' }, 0.25);
});

function closeCmp() {
  gsap.timeline({
    onComplete: () => {
      cmpModal.classList.remove('is-open');
      lockScroll(false);
    }
  })
    .to('#cmpModal .modal-box', { opacity: 0, y: 24, scale: 0.97, duration: 0.28, ease: 'power2.in' })
    .to('#cmpModal .modal-veil', { opacity: 0, duration: 0.24 }, 0.04);
}

cmpModal.addEventListener('click', e => { if (e.target.closest('[data-cmp-close]')) closeCmp(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cmpModal.classList.contains('is-open')) closeCmp();
});

/* ---------- Header state ---------- */
ScrollTrigger.create({
  start: 'top -10',
  onUpdate: self => {
    document.getElementById('head').classList.toggle('is-stuck', self.scroll() > 10);
  }
});

/* ---------- Sticky toolbar under the fixed header ---------- */
const headH = () => document.querySelector('.site-head').offsetHeight;

ScrollTrigger.create({
  trigger: '#toolbar',
  start: () => `top ${headH() - 14}px`,
  endTrigger: '#grid',
  end: 'bottom bottom',
  pin: true,
  pinSpacing: false,
  invalidateOnRefresh: true
});

sortEl.addEventListener('change', applyView);

/* ---------- Boot ---------- */
buildFilters();
render();
heroIn();
renderCompare();
