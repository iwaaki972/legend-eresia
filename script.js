/* =====================================================
   Legend Eresia & Fantasya — script.js
   ArtixSkills — Improved front + back-end logic
   ===================================================== */

// --- CONFIGURATION ---
const API_URL = 'http://localhost:3000';

// Mot de passe admin (côté front uniquement — la vraie protection est côté serveur)
const ADMIN_TOKEN_KEY = 'artix_admin_session';
const ADMIN_PASSWORD  = 'eresia2025'; // à remplacer par vérification serveur

// Données de fallback si le serveur est offline
const FALLBACK_HEROES = [
  { name: 'Aria', title: 'La Flamme Éternelle', desc: 'Gardienne du feu sacré d\'Eresia, elle maîtrise les flammes ancestrales.', img: '' },
  { name: 'Kael', title: 'Le Lame Brisée', desc: 'Ancien chevalier de Fantasya, porteur d\'une épée maudite mais puissante.', img: '' },
  { name: 'Lyra', title: 'L\'Enchanteresse des Brumes', desc: 'Sorcière des marais, elle tisse des sorts oubliés depuis l\'Ère Sombre.', img: '' },
];

const FALLBACK_COSMETICS = [
  { category: 'Armure Spectrale', rarity: 'Légendaire', color: '#d4af37', img: '' },
  { category: 'Cape de Fantasya', rarity: 'Épique',     color: '#9333ea', img: '' },
  { category: 'Lame d\'Eresia',   rarity: 'Rare',       color: '#60a5fa', img: '' },
];

// =====================================================
// UTILITAIRES
// =====================================================

/**
 * Affiche un toast (non-bloquant) à la place des alert()
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration — ms avant disparition
 */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');

  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

/**
 * Validation d'adresse email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Valide une URL
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  if (!url) return true; // optionnel
  try { return ['http:', 'https:'].includes(new URL(url).protocol); }
  catch { return false; }
}

/**
 * Ajoute la classe .error sur un champ et la retire à la saisie
 */
function markFieldError(field) {
  field.classList.add('error');
  field.addEventListener('input', () => field.classList.remove('error'), { once: true });
}

// =====================================================
// INIT
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  setupHeader();
  setupNav();
  setupButtons();
  setupAnimations();
  setupAdmin();
  chargerHeros();
  chargerShowcase();
});

// =====================================================
// HEADER : effet scroll + scroll-spy
// =====================================================

function setupHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// =====================================================
// NAV : hamburger mobile + smooth scroll
// =====================================================

function setupNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  // Smooth scroll + fermeture du menu mobile
  nav.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// =====================================================
// BOUTONS HERO
// =====================================================

function setupButtons() {
  // Bouton "Être notifié" — inscription email
  const btnComingSoon = document.getElementById('btn-coming-soon');
  if (btnComingSoon) {
    btnComingSoon.addEventListener('click', () => openSubscribeModal());
  }

  // Bouton PC
  const btnPc = document.getElementById('btn-pc');
  if (btnPc) {
    btnPc.addEventListener('click', () => {
      showToast('Le launcher PC n\'est pas encore disponible. Rejoignez le Discord pour être prévenus !', 'info', 5000);
    });
  }

  // Back to top
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          backToTop.classList.toggle('show', window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

// =====================================================
// INSCRIPTION EMAIL (modale simple inline)
// =====================================================

function openSubscribeModal() {
  // Crée une mini-modale inline
  const existing = document.getElementById('subscribe-modal');
  if (existing) { existing.remove(); return; }

  const modal = document.createElement('div');
  modal.id = 'subscribe-modal';
  modal.style.cssText = `
    position:fixed; inset:0; z-index:9000; display:flex;
    align-items:center; justify-content:center;
    background:rgba(0,0,0,.75); backdrop-filter:blur(6px);
  `;
  modal.innerHTML = `
    <div style="
      background:#0d0020; border:1px solid rgba(212,175,55,.3);
      border-radius:16px; padding:2rem; max-width:400px; width:90%;
      display:flex; flex-direction:column; gap:1rem; position:relative;
    ">
      <button id="close-modal" style="
        position:absolute; top:1rem; right:1rem;
        background:none; border:none; color:rgba(255,255,255,.4);
        font-size:1.2rem; cursor:pointer;
      ">✕</button>
      <h3 style="font-family:'Cinzel',serif; color:#d8b4fe; font-size:1.2rem;">
        🔔 Être notifié du lancement
      </h3>
      <p style="font-size:.88rem; color:rgba(255,255,255,.5);">
        Entrez votre adresse e-mail pour rejoindre la liste d'attente.
      </p>
      <input id="subscribe-email" type="email" placeholder="votre@email.com" class="input-field"
             autocomplete="email" style="background:#120030;">
      <button id="submit-subscribe" class="btn btn-primary">Rejoindre la liste d'attente</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('close-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  const emailInput = document.getElementById('subscribe-email');
  const submitBtn  = document.getElementById('submit-subscribe');

  emailInput.focus();
  emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitBtn.click(); });

  submitBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();

    if (!isValidEmail(email)) {
      markFieldError(emailInput);
      showToast('Veuillez entrer une adresse e-mail valide.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi…';

    try {
      const resp = await fetch(`${API_URL}/api/subscribe`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
        signal:  AbortSignal.timeout(8000),
      });

      if (resp.ok) {
        modal.remove();
        showToast('Merci ! Vous êtes inscrit à la liste d\'attente. 🎉', 'success', 5000);
      } else {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.message || `Erreur serveur (${resp.status})`);
      }
    } catch (err) {
      if (err.name === 'TimeoutError') {
        showToast('Le serveur ne répond pas. Réessayez plus tard.', 'error');
      } else {
        showToast(err.message || 'Erreur de connexion au serveur.', 'error');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Rejoindre la liste d\'attente';
    }
  });
}

// =====================================================
// API : CHARGER LES HÉROS
// =====================================================

async function chargerHeros() {
  const container = document.getElementById('heroes-container');
  if (!container) return;

  try {
    const resp = await fetch(`${API_URL}/api/heroes`, { signal: AbortSignal.timeout(6000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const heroes = await resp.json();

    if (!Array.isArray(heroes) || heroes.length === 0) throw new Error('Données vides');
    renderHeroes(container, heroes);

  } catch {
    // Fallback silencieux avec données fictives
    renderHeroes(container, FALLBACK_HEROES, true);
  }
}

function renderHeroes(container, heroes, isFallback = false) {
  container.innerHTML = '';

  heroes.forEach(hero => {
    const li = document.createElement('li');
    li.className = 'hero-card';
    li.innerHTML = `
      <img
        src="${hero.img || ''}"
        alt="${hero.name}"
        class="hero-avatar"
        onerror="this.src=''; this.style.background='var(--c-surface2)';"
      >
      <div>
        <div class="hero-info-name">${escapeHtml(hero.name)}</div>
        <div class="hero-info-title">${escapeHtml(hero.title)}</div>
        <p class="hero-info-desc">${escapeHtml(hero.desc)}</p>
      </div>`;
    container.appendChild(li);
  });

  if (isFallback) {
    const note = document.createElement('li');
    note.style.cssText = 'font-size:.78rem; color:rgba(255,255,255,.25); text-align:center; padding:.5rem;';
    note.textContent = '(Données fictives — serveur non connecté)';
    container.appendChild(note);
  }
}

// =====================================================
// API : CHARGER LE SHOWCASE
// =====================================================

async function chargerShowcase() {
  const container = document.getElementById('showcase-container');
  if (!container) return;

  try {
    const resp = await fetch(`${API_URL}/api/cosmetics`, { signal: AbortSignal.timeout(6000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const items = await resp.json();

    if (!Array.isArray(items) || items.length === 0) throw new Error('Données vides');
    renderShowcase(container, items);

  } catch {
    renderShowcase(container, FALLBACK_COSMETICS, true);
  }
}

function renderShowcase(container, items, isFallback = false) {
  container.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'feature-card';
    card.style.borderColor = item.color || 'var(--c-border)';
    card.innerHTML = `
      ${item.img ? `<img src="${item.img}" class="showcase-img" alt="${escapeHtml(item.category)}" onerror="this.style.display='none'">` : ''}
      <h3 style="color:${item.color || 'var(--c-gold)'}">${escapeHtml(item.category)}</h3>
      <p>${escapeHtml(item.rarity)}</p>`;
    container.appendChild(card);
  });

  if (isFallback) {
    const note = document.createElement('p');
    note.style.cssText = 'grid-column:1/-1; font-size:.78rem; color:rgba(255,255,255,.25); text-align:center;';
    note.textContent = '(Données fictives — serveur non connecté)';
    container.appendChild(note);
  }
}

// =====================================================
// API : AJOUTER UN ITEM (ADMIN)
// =====================================================

async function ajouterItem() {
  const nameField   = document.getElementById('admin-name');
  const rarityField = document.getElementById('admin-rarity');
  const imgField    = document.getElementById('admin-img');
  const btn         = document.getElementById('btn-ajouter-item');

  // Validation
  let hasError = false;
  if (!nameField.value.trim()) { markFieldError(nameField); hasError = true; }
  if (!rarityField.value.trim()) { markFieldError(rarityField); hasError = true; }
  if (imgField.value && !isValidUrl(imgField.value)) { markFieldError(imgField); hasError = true; }

  if (hasError) {
    showToast('Veuillez remplir correctement tous les champs.', 'error');
    return;
  }

  const data = {
    category: nameField.value.trim(),
    rarity:   rarityField.value.trim(),
    color:    '#d4af37',
    img:      imgField.value.trim() || '',
  };

  btn.disabled = true;
  btn.textContent = 'Envoi…';

  try {
    const resp = await fetch(`${API_URL}/api/cosmetics`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem(ADMIN_TOKEN_KEY) || ''}`,
      },
      body:   JSON.stringify(data),
      signal: AbortSignal.timeout(8000),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.message || `Erreur ${resp.status}`);
    }

    showToast(`"${data.category}" ajouté avec succès ! ✅`, 'success');
    nameField.value = rarityField.value = imgField.value = '';
    chargerShowcase();

  } catch (err) {
    showToast(err.message || 'Erreur lors de l\'ajout. Le serveur est-il allumé ?', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ajouter à la base de données';
  }
}

// =====================================================
// ADMIN : PROTECTION MOT DE PASSE (FRONT)
// =====================================================

function setupAdmin() {
  const lock        = document.getElementById('admin-lock');
  const panel       = document.getElementById('admin-panel');
  const pwdInput    = document.getElementById('admin-password');
  const loginBtn    = document.getElementById('btn-admin-login');
  const logoutBtn   = document.getElementById('btn-admin-logout');
  const ajouterBtn  = document.getElementById('btn-ajouter-item');

  if (!lock || !panel) return;

  // Vérifie si déjà connecté (session)
  if (sessionStorage.getItem(ADMIN_TOKEN_KEY) === '1') {
    lock.classList.add('hidden');
    panel.classList.remove('hidden');
  }

  loginBtn?.addEventListener('click', () => {
    if (!pwdInput.value) { markFieldError(pwdInput); return; }

    if (pwdInput.value === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, '1');
      lock.classList.add('hidden');
      panel.classList.remove('hidden');
      showToast('Bienvenue, administrateur. 🛡️', 'success');
    } else {
      markFieldError(pwdInput);
      pwdInput.value = '';
      showToast('Mot de passe incorrect.', 'error');
    }
  });

  pwdInput?.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    panel.classList.add('hidden');
    lock.classList.remove('hidden');
    showToast('Déconnecté.', 'info');
  });

  ajouterBtn?.addEventListener('click', ajouterItem);
}

// =====================================================
// ANIMATIONS AU SCROLL
// =====================================================

function setupAnimations() {
  // IntersectionObserver pour les éléments fade-in
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

  // Particules hero
  spawnParticles();
}

// =====================================================
// PARTICULES HERO
// =====================================================

function spawnParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const count = window.innerWidth < 768 ? 12 : 22;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left  = Math.random() * 100 + '%';
    p.style.top   = Math.random() * 100 + '%';
    p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
    p.style.opacity = (Math.random() * 0.5 + 0.2).toString();
    p.style.animation = `float ${5 + Math.random() * 6}s ease-in-out ${Math.random() * 5}s infinite`;
    container.appendChild(p);
  }
}

// =====================================================
// SÉCURITÉ : ÉCHAPPEMENT HTML
// =====================================================

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
