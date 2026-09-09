/* =========================================================
   SmartReatile — app.js (shared)
   ========================================================= */

// ---- API base ----
const API_BASE = 'http://localhost:8000/api';

// ---- Toast system ----
function ensureToastWrap(){
  let wrap = document.querySelector('.toast-wrap');
  if(!wrap){
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  return wrap;
}
const ICONS = { success:'✓', info:'i', error:'!' };
function showToast(message, type = 'info', duration = 3200){
  const wrap = ensureToastWrap();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="t-icon">${ICONS[type] || 'i'}</span><span>${message}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(24px)';
    setTimeout(() => el.remove(), 300);
  }, duration);
}
window.showToast = showToast;

// ---- Auth helpers ----
function getToken(){
  return localStorage.getItem('jwt');
}
function setToken(token){
  localStorage.setItem('jwt', token);
}
function removeToken(){
  localStorage.removeItem('jwt');
}

function authFetch(url, options = {}){
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return Promise.reject('No token');
  }
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
}

// ---- Manual login ----
async function login(email, password){
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Login failed');
  setToken(data.access_token);
  showToast('Logged in successfully!', 'success');
  return data;
}

// ---- Manual registration ----
async function register(name, email, password){
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Registration failed');
  setToken(data.access_token);
  showToast('Account created! Logged in automatically.', 'success');
  return data;
}

// ---- Logout ----
function logout(){
  removeToken();
  showToast('Logged out', 'info');
  window.location.href = 'index.html';
}

// ---- Check authentication ----
async function checkAuth() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await authFetch(`${API_BASE}/users/me`);
    if (res.ok) {
      const user = await res.json();
      return user;
    } else {
      removeToken();
      return null;
    }
  } catch {
    removeToken();
    return null;
  }
}

// ---- Navbar scroll ----
const navbar = document.querySelector('.navbar');
function onScrollNav(){
  if(!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 12);
}
window.addEventListener('scroll', onScrollNav, { passive:true });
onScrollNav();

// ---- Mobile menu ----
const burger = document.querySelector('.nav-burger');
const mobileMenu = document.querySelector('.mobile-menu');
if(burger && mobileMenu){
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    burger.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burger.classList.remove('active');
    document.body.style.overflow = '';
  }));
}

// ---- Scroll reveal ----
const revealEls = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && revealEls.length){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// ---- Back to top ----
const backTop = document.querySelector('.back-top');
if(backTop){
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('show', window.scrollY > 500);
  }, { passive:true });
  backTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

// ---- FAQ accordion ----
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  });
});

// ---- Newsletter ----
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    if(input && input.value.trim()){
      showToast('You\'re subscribed! Watch your inbox.', 'success');
      form.reset();
    }
  });
});

// ---- Set current year ----
document.querySelectorAll('.current-year').forEach(el => el.textContent = new Date().getFullYear());

// ---- Exports ----
export {
  API_BASE,
  getToken,
  setToken,
  removeToken,
  authFetch,
  login,
  register,
  logout,
  checkAuth,
  showToast
};