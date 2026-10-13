(() => {
  'use strict';
  const products = window.OZONE_PRODUCTS;
  const cut = new Set(['anticellulit', 'dnevnoy-krem', 'maska-volosy', 'ochischenie', 'otri-6000', 'ozodermik-3', 'ozodermik-5', 'shampun']);
  const categories = { face: 'Для лица', hair: 'Для волос', body: 'Для тела', oils: 'Масло', sets: 'Набор' };
  const rub = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let filter = 'all';
  const search = document.querySelector('#search');
  const grid = document.querySelector('#catalog-products');
  const bag = document.querySelector('#bag');
  const basket = new Map();
  let toastTimer;
  function card(p) {
    const [id, name, price, cats] = p;
    return `<article class="product"><div class="product-image ${cut.has(id) ? 'cut' : ''}"><img src="img/${cut.has(id) ? 'cut/' : ''}${id}.webp" alt="${escape(name)}" width="480" height="528" loading="lazy"><button class="add" data-add="${id}" aria-label="Добавить ${escape(name)} в корзину">+</button></div><p class="product-category">${categories[cats.includes('sets') ? 'sets' : cats[0]]}</p><h3>${escape(name)}</h3><p class="product-price">${rub(price)}</p></article>`;
  }
  function render() {
    const query = search.value.toLocaleLowerCase('ru').trim();
    const selected = products.filter(p => (filter === 'all' || p[3].includes(filter)) && p[1].toLocaleLowerCase('ru').includes(query));
    grid.innerHTML = selected.map(card).join('');
    document.querySelector('#empty').hidden = selected.length !== 0;
    document.querySelector('#catalog-count').textContent = `${selected.length} из ${products.length}`;
    document.querySelectorAll('[data-filter]').forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function renderBag() {
    let count = 0, total = 0;
    document.querySelector('#bag-items').innerHTML = [...basket].map(([id, quantity]) => {
      const p = products.find(p => p[0] === id);
      count += quantity; total += p[2] * quantity;
      return `<div class="bag-row"><img src="img/${id}.webp" alt="" width="64" height="80"><div><h3>${escape(p[1])}</h3><p>${rub(p[2] * quantity)}</p></div><div class="quantity"><button data-change="${id}" data-delta="-1" aria-label="Убрать одну единицу ${escape(p[1])}">−</button><span>${quantity}</span><button data-change="${id}" data-delta="1" aria-label="Добавить одну единицу ${escape(p[1])}">+</button></div></div>`;
    }).join('') || '<p>Пока пусто. Найди свой уход в каталоге.</p>';
    document.querySelector('#bag-count').textContent = count;
    document.querySelector('#bag-total').textContent = rub(total);
    document.querySelector('#bag-toggle').setAttribute('aria-label', `Открыть корзину, товаров: ${count}`);
  }
  document.addEventListener('click', event => {
    const add = event.target.closest('[data-add]');
    const cat = event.target.closest('[data-category], [data-filter]');
    const change = event.target.closest('[data-change]');
    if (add) {
      const id = add.dataset.add;
      basket.set(id, (basket.get(id) || 0) + 1);
      renderBag();
      const toast = document.querySelector('#toast');
      toast.textContent = 'Добавлено в твою корзину'; toast.classList.add('visible');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
    }
    if (cat) { filter = cat.dataset.category || cat.dataset.filter; search.value = ''; render(); }
    if (change) {
      const id = change.dataset.change;
      const quantity = (basket.get(id) || 0) + Number(change.dataset.delta);
      if (quantity <= 0) basket.delete(id); else basket.set(id, quantity);
      const delta = change.dataset.delta;
      renderBag();
      const replacement = [...bag.querySelectorAll('[data-change]')].find(b => b.dataset.change === id && b.dataset.delta === delta);
      (replacement || document.querySelector('#bag-close')).focus();
    }
  });
  search.addEventListener('input', render);
  document.querySelector('#search-toggle').addEventListener('click', () => { document.querySelector('#catalog').scrollIntoView(); search.focus({preventScroll:true}); });
  document.querySelector('#bag-toggle').addEventListener('click', () => bag.showModal());
  document.querySelector('#bag-close').addEventListener('click', () => bag.close());
  document.querySelector('#continue').addEventListener('click', () => { bag.close(); document.querySelector('#catalog').scrollIntoView(); });
  bag.addEventListener('click', event => { if(event.target === bag) { const r = bag.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right) bag.close(); } });
  document.querySelector('#season-products').innerHTML = ['ochischenie','dnevnoy-krem','otri-6000','ozodermik-3'].map(id => card(products.find(p => p[0] === id))).join('');
  render(); renderBag();
})();
