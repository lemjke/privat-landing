(() => {
  const ICONS = {
    tent: '<path d="M3 20 12 5l9 15z M12 5v15 M9 20l3-5 3 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    pack: '<path d="M7 8a5 5 0 0 1 10 0v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z M9 14h6v4H9z M10 3h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    sleep: '<path d="M4 17c0-6 4-11 9-11 4 0 7 3 7 7v4z M4 17h16v3H4z M9 11a2 2 0 1 0 0 .1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    kitchen: '<path d="M5 10h14v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z M3 10h18 M9 4c0 2 2 2 0 4 M14 4c0 2 2 2 0 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    gear: '<path d="M7 3v18 M17 3v18 M7 8l-3 2 M17 8l3 2 M5 21h4 M15 21h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
  };

  const CATEGORIES = [
    { id: 'all', name: 'Всё' },
    { id: 'tent', name: 'Палатки', tint: '#fbe2d6', ink: '#c9512a' },
    { id: 'pack', name: 'Рюкзаки', tint: '#dbe7dc', ink: '#2f5643' },
    { id: 'sleep', name: 'Сон', tint: '#e2e1f2', ink: '#4c4a8a' },
    { id: 'kitchen', name: 'Кухня', tint: '#f6e7c4', ink: '#9a6a12' },
    { id: 'gear', name: 'Мелочи', tint: '#e3ecef', ink: '#2e5966' }
  ];

  const ITEMS = [
    { id: 't2', cat: 'tent', name: 'Палатка «Трек-2»', spec: '2 места · 2,4 кг', price: 350 },
    { id: 't4', cat: 'tent', name: 'Палатка «Базальт-4»', spec: '4 места · 5,1 кг', price: 550 },
    { id: 'p65', cat: 'pack', name: 'Рюкзак 65 л', spec: 'Анатомическая спина', price: 250 },
    { id: 'p40', cat: 'pack', name: 'Рюкзак 40 л', spec: 'Для выходных', price: 180 },
    { id: 's5', cat: 'sleep', name: 'Спальник −5 °C', spec: 'Кокон · 1,3 кг', price: 200 },
    { id: 's15', cat: 'sleep', name: 'Спальник −15 °C', spec: 'Пух · 1,1 кг', price: 300 },
    { id: 'mat', cat: 'sleep', name: 'Коврик самонадувающийся', spec: '5 см · R 4,0', price: 120 },
    { id: 'burn', cat: 'kitchen', name: 'Горелка + газ', spec: 'Баллон 450 г в комплекте', price: 150 },
    { id: 'pots', cat: 'kitchen', name: 'Набор котелков', spec: 'На 4 человека', price: 120 },
    { id: 'thermo', cat: 'kitchen', name: 'Термос 1 л', spec: 'Держит 24 часа', price: 80 },
    { id: 'poles', cat: 'gear', name: 'Треккинговые палки', spec: 'Пара, телескоп', price: 100 },
    { id: 'lamp', cat: 'gear', name: 'Налобный фонарь', spec: '300 лм, аккумулятор', price: 60 }
  ];

  const KITS = [
    {
      name: 'Первый поход', tag: 'на двоих', color: '#2f5643',
      items: { t2: 1, p40: 2, s5: 2, mat: 2, burn: 1 }
    },
    {
      name: 'Выходные на Алтае', tag: 'на четверых', color: '#c9512a',
      items: { t4: 1, p65: 4, s15: 4, mat: 4, burn: 1, pots: 1 }
    },
    {
      name: 'Лёгкий одиночка', tag: 'на одного', color: '#4c4a8a',
      items: { t2: 1, p40: 1, s5: 1, mat: 1, lamp: 1, poles: 1 }
    }
  ];

  const byId = Object.fromEntries(ITEMS.map(i => [i.id, i]));
  const catById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);
  const rub = n => n.toLocaleString('ru-RU') + ' ₽';
  const plural = (n, one, few, many) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  };
  const icon = cat => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[cat]}</svg>`;
  const plusIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const state = { filter: 'all', cart: {}, days: 3 };

  // Корзину сохраняем между перезагрузками, если хранилище доступно
  try {
    const saved = JSON.parse(localStorage.getItem('privat-cart') || 'null');
    if (saved && typeof saved === 'object') {
      for (const [id, q] of Object.entries(saved.cart || {})) if (byId[id] && q > 0) state.cart[id] = q;
      if (saved.days >= 1 && saved.days <= 14) state.days = saved.days;
    }
  } catch (e) { /* без сохранения */ }
  const save = () => {
    try { localStorage.setItem('privat-cart', JSON.stringify({ cart: state.cart, days: state.days })); } catch (e) {}
  };

  const discountFor = days => (days >= 7 ? 0.2 : days >= 3 ? 0.1 : 0);

  function totals() {
    const perDay = Object.entries(state.cart).reduce((s, [id, q]) => s + byId[id].price * q, 0);
    const d = discountFor(state.days);
    const gross = perDay * state.days;
    const total = Math.round(gross * (1 - d));
    const count = Object.values(state.cart).reduce((s, q) => s + q, 0);
    return { perDay, d, gross, total, count };
  }

  /* Фильтры */
  function renderFilters() {
    $('[data-filters]').innerHTML = CATEGORIES.map(c =>
      `<button class="chip" role="tab" aria-selected="${c.id === state.filter}" data-cat="${c.id}">${c.name}</button>`
    ).join('');
  }

  /* Каталог */
  function renderGrid() {
    const list = state.filter === 'all' ? ITEMS : ITEMS.filter(i => i.cat === state.filter);
    $('[data-grid]').innerHTML = list.map((item, idx) => {
      const c = catById[item.cat];
      const inCart = state.cart[item.id] > 0;
      return `<article class="card" style="animation-delay:${idx * 30}ms">
        <div class="card__icon" style="background:${c.tint};color:${c.ink}">${icon(item.cat)}</div>
        <h3>${item.name}</h3>
        <p class="card__spec">${item.spec}</p>
        <div class="card__foot">
          <span class="card__price">${rub(item.price)} <small>/ сутки</small></span>
          <button class="add${inCart ? ' is-in' : ''}" data-add="${item.id}" aria-label="Добавить: ${item.name}">${inCart ? checkIcon : plusIcon}</button>
        </div>
      </article>`;
    }).join('');
  }

  /* Наборы */
  function renderKits() {
    $('[data-kits]').innerHTML = KITS.map((kit, k) => {
      const perDay = Object.entries(kit.items).reduce((s, [id, q]) => s + byId[id].price * q, 0);
      const lines = Object.entries(kit.items).map(([id, q]) => `<li>${byId[id].name}${q > 1 ? ` × ${q}` : ''}</li>`).join('');
      return `<article class="kit reveal">
        <div class="kit__top" style="background:${kit.color}">
          <span class="kit__tag">${kit.tag}</span>
          <h3>${kit.name}</h3>
        </div>
        <div class="kit__body">
          <ul class="kit__list">${lines}</ul>
          <div class="kit__foot">
            <span class="kit__price">${rub(perDay)}<small>в сутки, без скидки</small></span>
            <button class="btn btn--accent btn--sm" data-kit="${k}">Взять набор</button>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  /* Калькулятор */
  function renderCart() {
    const ids = Object.keys(state.cart);
    $('[data-cart-list]').innerHTML = ids.map(id => {
      const it = byId[id], q = state.cart[id];
      return `<li class="calc__item">
        <span>${it.name}</span>
        <span class="calc__item-price">${rub(it.price)} × ${q}</span>
        <span class="qty">
          <button type="button" data-dec="${id}" aria-label="Уменьшить: ${it.name}">−</button>
          <span>${q}</span>
          <button type="button" data-inc="${id}" aria-label="Увеличить: ${it.name}">+</button>
        </span>
      </li>`;
    }).join('');
    $('[data-cart-empty]').hidden = ids.length > 0;

    const t = totals();
    $('[data-days]').value = state.days;
    $('[data-days-out]').textContent = `${state.days} ${plural(state.days, 'день', 'дня', 'дней')}`;
    $('[data-per-day]').textContent = rub(t.perDay);
    $('[data-discount]').textContent = t.d && t.perDay ?`−${t.d * 100}% · ${rub(t.gross - t.total)}` : '—';
    $('[data-total]').textContent = rub(t.total);

    const hint = state.days < 3 ? `Ещё ${3 - state.days} ${plural(3 - state.days, 'день', 'дня', 'дней')} — и скидка 10%`
      : state.days < 7 ? `Ещё ${7 - state.days} ${plural(7 - state.days, 'день', 'дня', 'дней')} — и скидка 20%`
      : 'Максимальная скидка 20% ✓';
    $('[data-discount-hint]').textContent = hint;

    $$('[data-cart-count]').forEach(el => {
      if (el.textContent !== String(t.count)) {
        el.textContent = t.count;
        el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      }
    });
    const mobile = $('[data-mobile-cart]');
    mobile.hidden = t.count === 0;
    $('[data-mobile-total]').textContent = rub(t.total);

    renderSummary(t);
    save();
  }

  function renderSummary(t) {
    const el = $('[data-order-summary]');
    if (!t.count) {
      el.innerHTML = 'Комплект пока пуст — можно оставить заявку, и мы поможем собрать его по телефону. <a href="#catalog">Перейти в каталог</a>';
      return;
    }
    el.innerHTML = `${t.count} ${plural(t.count, 'вещь', 'вещи', 'вещей')} на ${state.days} ${plural(state.days, 'день', 'дня', 'дней')}
      <strong>${rub(t.total)}</strong>`;
  }

  function change(id, delta) {
    const q = (state.cart[id] || 0) + delta;
    if (q <= 0) delete state.cart[id]; else state.cart[id] = Math.min(q, 10);
    renderCart();
    renderGrid();
  }

  /* События */
  document.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.cat) { state.filter = t.dataset.cat; renderFilters(); renderGrid(); }
    else if (t.dataset.add) change(t.dataset.add, 1);
    else if (t.dataset.inc) change(t.dataset.inc, 1);
    else if (t.dataset.dec) change(t.dataset.dec, -1);
    else if (t.dataset.kit) {
      for (const [id, q] of Object.entries(KITS[t.dataset.kit].items)) state.cart[id] = Math.min((state.cart[id] || 0) + q, 10);
      renderCart(); renderGrid();
      $('#calc').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  $('[data-days]').addEventListener('input', e => { state.days = +e.target.value; renderCart(); });

  /* Маска телефона */
  const phone = $('[data-phone]');
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = d.slice(1);
    let out = '+7';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ')';
    if (p.length > 3) out += ' ' + p.slice(3, 6);
    if (p.length > 6) out += '-' + p.slice(6, 8);
    if (p.length > 8) out += '-' + p.slice(8, 10);
    phone.value = d.length > 1 ? out : '';
  });

  /* Дата: не раньше сегодня */
  const date = $('[data-date]');
  const today = new Date();
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  date.min = iso(today);

  /* Форма */
  const form = $('[data-form]');
  const success = $('[data-success]');
  const validators = {
    name: v => v.trim().length >= 2,
    phone: v => v.replace(/\D/g, '').length === 11,
    date: v => !!v && v >= date.min
  };

  form.addEventListener('input', e => {
    const field = e.target.closest('.field');
    if (field && field.classList.contains('is-invalid') && validators[e.target.name]?.(e.target.value)) field.classList.remove('is-invalid');
    if (e.target.name === 'agree') e.target.closest('.check').classList.remove('is-invalid');
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstBad = null;
    for (const [name, ok] of Object.entries(validators)) {
      const input = form.elements[name];
      const bad = !ok(input.value);
      input.closest('.field').classList.toggle('is-invalid', bad);
      if (bad && !firstBad) firstBad = input;
    }
    const agree = form.elements.agree;
    agree.closest('.check').classList.toggle('is-invalid', !agree.checked);
    if (!agree.checked && !firstBad) firstBad = agree;
    if (firstBad) { firstBad.focus(); return; }

    const t = totals();
    const when = new Date(form.elements.date.value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    $('[data-order-id]').textContent = '№' + Math.floor(1000 + Math.random() * 9000);
    $('[data-success-text]').textContent =
      `${form.elements.name.value.trim()}, перезвоним на ${form.elements.phone.value} в течение 10 минут. ` +
      (t.count ? `Комплект из ${t.count} ${plural(t.count, 'вещи', 'вещей', 'вещей')} на ${rub(t.total)} отложим к ${when}.` : `Подберём комплект к ${when}.`);
    form.hidden = true;
    success.hidden = false;
  });

  $('[data-reset]').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    success.hidden = true;
  });

  /* Шапка и появление блоков */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  renderFilters();
  renderGrid();
  renderKits();
  renderCart();

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }
})();
