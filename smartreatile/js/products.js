/* =========================================================
   SmartReatile — products.js (API version)
   ========================================================= */

const API_BASE = window.API_BASE || 'http://localhost:8000/api';

// Fetch products with filters
async function getProducts(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });
  const url = `${API_BASE}/products?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

// Fetch single product by ID
async function getProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

// Product card HTML
function productCardHTML(p) {
  const badges = [];
  if (p.verified) badges.push('<span class="badge badge-verified">✓ Verified</span>');
  // We can add other badges later if we extend the model
  return `
  <a href="product.html?id=${p.id}" class="product-card card reveal">
    <div class="pc-media">
      <div class="pc-badges">${badges.join('')}</div>
      <button class="pc-wishlist" aria-label="Save to wishlist" data-product-id="${p.id}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
      <img src="${p.images && p.images.length ? p.images[0] : 'https://via.placeholder.com/400'}" alt="${p.title}" loading="lazy">
    </div>
    <div class="pc-body">
      <div class="flex items-center gap-8">
        <span class="pc-price">₹${p.price.toLocaleString('en-IN')}</span>
        ${p.mrp ? `<span class="text-dim" style="font-size:12.5px; text-decoration:line-through">₹${p.mrp.toLocaleString('en-IN')}</span>` : ''}
      </div>
      <div class="pc-title">${p.title}</div>
      <div class="pc-meta">
        <span>${p.dept}</span><span class="dot-sep"></span><span>${p.condition}</span>
      </div>
      <div class="pc-seller">
        <span>Seller · ${new Date(p.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  </a>`;
}

// Render products into a grid container
async function renderProductGrid(elId, productsOrPromise){
  const el = document.getElementById(elId);
  if (!el) return;
  let products;
  if (typeof productsOrPromise.then === 'function') {
    products = await productsOrPromise;
  } else {
    products = productsOrPromise;
  }
  if (!products || products.length === 0) {
    el.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1">
      <div class="es-icon">🔍</div>
      <h3>No products found</h3>
      <p>Try adjusting your filters or search terms.</p>
    </div>`;
    return;
  }
  el.innerHTML = products.map(p => productCardHTML(p)).join('');
  // trigger reveal
  requestAnimationFrame(() => {
    el.querySelectorAll('.reveal').forEach((card, i) => {
      setTimeout(() => card.classList.add('in'), i * 60);
    });
  });
}

// ---- Wishlist toggle (using API) ----
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.pc-wishlist');
  if (!btn) return;
  e.stopPropagation();
  e.preventDefault();
  const productId = btn.dataset.productId;
  if (!productId) return;
  const token = localStorage.getItem('jwt');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  // Check if already active (toggle)
  const isActive = btn.classList.contains('active');
  const method = isActive ? 'DELETE' : 'POST';
  try {
    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
      method: method,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to update wishlist');
    btn.classList.toggle('active');
    const svg = btn.querySelector('svg path');
    if (svg) svg.setAttribute('fill', isActive ? 'none' : 'currentColor');
    showToast(isActive ? 'Removed from wishlist' : 'Added to wishlist', 'success', 2000);
  } catch (err) {
    console.error(err);
    showToast('Error updating wishlist', 'error');
  }
});

// Expose functions globally
window.getProducts = getProducts;
window.getProductById = getProductById;
window.productCardHTML = productCardHTML;
window.renderProductGrid = renderProductGrid;

export { getProducts, getProductById, productCardHTML, renderProductGrid };