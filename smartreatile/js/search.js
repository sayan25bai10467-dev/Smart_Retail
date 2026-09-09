/* =========================================================
   SmartReatile — search.js (Browse Products page logic)
   ========================================================= */

import { getProducts, renderProductGrid } from './products.js';

(function(){
  const grid = document.getElementById('results-grid');
  if (!grid) return;

  const state = {
    categories: [],
    conditions: [],
    hostels: [],
    dept: '',
    semester: '',
    priceMax: 25000,
    sort: 'popular',
    view: 'grid',
    page: 1,
    perPage: 8,
  };

  // Pre-select category from URL (?cat=)
  const urlCat = new URLSearchParams(location.search).get('cat');
  const CAT_MAP = { books:'Books', electronics:'Electronics', calculators:'Calculators', furniture:'Furniture', cycles:'Cycles', hostel:'Hostel Essentials', lab:'Lab Equipment', notes:'Notes', gaming:'Gaming Accessories', clothing:'Clothing', instruments:'Musical Instruments' };
  if (urlCat && CAT_MAP[urlCat]){
    state.categories.push(CAT_MAP[urlCat]);
    const cb = document.querySelector(`input[name="category"][value="${CAT_MAP[urlCat]}"]`);
    if (cb) cb.checked = true;
  }

  function getFilters() {
    const filters = {};
    if (state.categories.length) filters.category = state.categories[0];
    if (state.conditions.length) filters.condition = state.conditions[0];
    if (state.hostels.length) filters.hostel = state.hostels[0];
    if (state.dept) filters.dept = state.dept;
    if (state.semester) filters.semester = state.semester;
    if (state.priceMax) filters.priceMax = state.priceMax;
    filters.sort = state.sort;
    filters.limit = state.perPage;
    filters.skip = (state.page - 1) * state.perPage;
    const q = document.getElementById('nav-search-input')?.value?.trim();
    if (q) filters.search = q;
    return filters;
  }

  async function render(reset) {
    if (reset) state.page = 1;
    const filters = getFilters();
    try {
      const products = await getProducts(filters);
      document.getElementById('result-count').textContent = `${products.length} product${products.length !== 1 ? 's' : ''} found`;
      await renderProductGrid('results-grid', products);
      const loadBtn = document.getElementById('load-more-btn');
      if (products.length < state.perPage) {
        loadBtn.style.display = 'none';
      } else {
        loadBtn.style.display = 'inline-flex';
      }
      renderChips();
    } catch (err) {
      console.error(err);
      showToast('Error loading products', 'error');
    }
  }

  function renderChips() {
    const wrap = document.getElementById('active-chips');
    const chips = [];
    state.categories.forEach(c => chips.push({ label:c, kind:'categories', value:c }));
    state.conditions.forEach(c => chips.push({ label:c, kind:'conditions', value:c }));
    state.hostels.forEach(c => chips.push({ label:c, kind:'hostels', value:c }));
    if(state.dept) chips.push({ label: state.dept, kind:'dept', value: state.dept });
    if(state.semester) chips.push({ label: state.semester, kind:'semester', value: state.semester });
    wrap.innerHTML = chips.map(c => `
      <span class="filter-chip" data-kind="${c.kind}" data-value="${c.value}">
        ${c.label}
        <button aria-label="Remove filter">✕</button>
      </span>`).join('');
    wrap.querySelectorAll('.filter-chip button').forEach(btn => {
      btn.addEventListener('click', () => {
        const chip = btn.closest('.filter-chip');
        const kind = chip.dataset.kind, value = chip.dataset.value;
        if(Array.isArray(state[kind])) state[kind] = state[kind].filter(v => v !== value);
        else state[kind] = '';
        syncCheckboxes();
        render(true);
      });
    });
  }

  function syncCheckboxes() {
    document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = state.categories.includes(cb.value));
    document.querySelectorAll('input[name="condition"]').forEach(cb => cb.checked = state.conditions.includes(cb.value));
    document.querySelectorAll('input[name="hostel"]').forEach(cb => cb.checked = state.hostels.includes(cb.value));
    document.getElementById('filter-dept').value = state.dept;
    document.getElementById('filter-sem').value = state.semester;
  }

  // ---------- Checkbox filters ----------
  document.querySelectorAll('input[name="category"]').forEach(cb => cb.addEventListener('change', () => {
    state.categories = [...document.querySelectorAll('input[name="category"]:checked')].map(c => c.value);
    render(true);
  }));
  document.querySelectorAll('input[name="condition"]').forEach(cb => cb.addEventListener('change', () => {
    state.conditions = [...document.querySelectorAll('input[name="condition"]:checked')].map(c => c.value);
    render(true);
  }));
  document.querySelectorAll('input[name="hostel"]').forEach(cb => cb.addEventListener('change', () => {
    state.hostels = [...document.querySelectorAll('input[name="hostel"]:checked')].map(c => c.value);
    render(true);
  }));
  document.getElementById('filter-dept').addEventListener('change', e => { state.dept = e.target.value; render(true); });
  document.getElementById('filter-sem').addEventListener('change', e => { state.semester = e.target.value; render(true); });

  // ---------- Price ----------
  const priceSlider = document.getElementById('price-slider');
  const priceMax = document.getElementById('price-max');
  priceSlider.addEventListener('input', () => { priceMax.value = priceSlider.value; });
  document.getElementById('apply-filters').addEventListener('click', () => {
    state.priceMax = Number(priceMax.value) || 25000;
    render(true);
    document.getElementById('filters-panel').classList.remove('open');
    document.getElementById('filters-backdrop').style.display = 'none';
  });

  // ---------- Clear filters ----------
  document.getElementById('clear-filters').addEventListener('click', () => {
    state.categories = []; state.conditions = []; state.hostels = []; state.dept=''; state.semester=''; state.priceMax = 25000;
    priceSlider.value = 25000; priceMax.value = '';
    document.getElementById('price-min').value = '';
    syncCheckboxes();
    render(true);
  });

  // ---------- Sort ----------
  document.getElementById('sort-select').addEventListener('change', e => { state.sort = e.target.value; render(true); });

  // ---------- View toggle ----------
  const gridBtn = document.getElementById('grid-view-btn');
  const listBtn = document.getElementById('list-view-btn');
  gridBtn.addEventListener('click', () => {
    gridBtn.classList.add('active'); listBtn.classList.remove('active');
    document.getElementById('results-grid').classList.remove('list-view');
  });
  listBtn.addEventListener('click', () => {
    listBtn.classList.add('active'); gridBtn.classList.remove('active');
    document.getElementById('results-grid').classList.add('list-view');
  });

  // ---------- Search from navbar ----------
  const navSearch = document.getElementById('nav-search-input');
  if(navSearch){
    navSearch.addEventListener('input', () => render(true));
  }

  // ---------- Load more (simulated infinite scroll) ----------
  const loadBtn = document.getElementById('load-more-btn');
  loadBtn.addEventListener('click', async () => {
    const spinner = document.getElementById('load-spinner');
    const text = document.getElementById('load-more-text');
    spinner.classList.remove('hidden');
    text.textContent = 'Loading…';
    state.page += 1;
    await render(false);
    spinner.classList.add('hidden');
    text.textContent = 'Load more products';
  });

  // ---------- Mobile filter panel ----------
  const openFilters = document.getElementById('open-filters');
  const filtersPanel = document.getElementById('filters-panel');
  const backdrop = document.getElementById('filters-backdrop');
  if(openFilters){
    openFilters.addEventListener('click', () => {
      filtersPanel.classList.add('open');
      backdrop.style.display = 'block';
    });
    backdrop.addEventListener('click', () => {
      filtersPanel.classList.remove('open');
      backdrop.style.display = 'none';
    });
  }

  syncCheckboxes();
  render(true);
})();