/* ========= Load-time effects: fade-in + carousel ========= */
window.addEventListener('load', () => {
  // Staggered fade-in
  [document.querySelector('.intro img'), document.querySelector('.track')]
    .filter(Boolean)
    .forEach((el, i) => {
      el.style.opacity = 0;
      setTimeout(() => { el.style.transition = 'opacity 1s'; el.style.opacity = 1; }, i * 300);
    });

  // Seamless marquee (duplicate once + duration by width)
  const track = document.querySelector('.track');
  if (track) {
    track.innerHTML += track.innerHTML; // duplicate children once
    const half = Array.from(track.children).slice(0, track.children.length / 2);
    const gap = parseFloat(getComputedStyle(track).gap || 0);
    const width = half.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0) + (half.length - 1) * gap;
    const PX_PER_SEC = 50; // lower = slower
    track.style.animationDuration = `${width / PX_PER_SEC}s`;
  }
});

/* ========= Modal (lightbox) ========= */
let modal, closeBtn, lbBody, lastFocused, focusables;

initModal();
bindGlobalHandlers();

function initModal() {
  if (modal) return;
  modal = document.createElement('div');
  modal.id = 'lightbox';
  modal.className = 'hidden';
  modal.innerHTML = `
    <div class="overlay" data-close></div>
    <div class="content" role="dialog" aria-modal="true" aria-labelledby="lb-title">
      <button class="close" aria-label="Close" data-close>✖</button>
      <div id="lightbox-body"></div>
    </div>`;
  document.body.appendChild(modal);
  closeBtn = modal.querySelector('.close');
  lbBody = modal.querySelector('#lightbox-body');
}

function bindGlobalHandlers() {
  // Open on project card; close on overlay/✖
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.project');
    if (card) { openModal(card); return; }
    if (e.target.closest('[data-close]')) closeModal();
  });

  // Esc to close + focus trap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
    if (e.key === 'Tab' && modal?.classList.contains('open')) trapTab(e);
  });
}

function openModal(projectEl) {
  const imgEl  = projectEl.querySelector('img');
  const alt    = (imgEl?.alt || '').trim();
  const title  = (projectEl.querySelector('h3')?.textContent || alt || 'Project').trim();
  const thumb  = imgEl?.getAttribute('src') || '';
  const desc   = (projectEl.querySelector('p')?.textContent || '').trim();

  lbBody.innerHTML = renderContentFor(alt, title, thumb, desc);

  modal.classList.remove('hidden');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  lastFocused = document.activeElement;
  closeBtn.focus();

  focusables = modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.classList.remove('open');
  lbBody.innerHTML = '';
  document.body.style.overflow = '';
  lastFocused?.focus();
  focusables = null;
}

function trapTab(e) {
  if (!focusables?.length) return;
  const first = focusables[0], last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ========= Templates ========= */

const esc = (s) => String(s).replace(/[&<>\"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const isMatch = (alt, title, ...names) => {
  const a = (alt || '').toLowerCase(), t = (title || '').toLowerCase();
  return names.some(n => { n = n.toLowerCase(); return a === n || t === n; });
};
const imgTag = (src, alt, fallback) => `<img src="${src}" alt="${alt}" onerror="this.src='${fallback}'">`;
const gallery = (arr, alt, fallback) => arr.map(src => imgTag(src, alt, fallback)).join('');

function renderContentFor(alt, title, thumbSrc, fallbackDesc) {
  /* Recycled Chopsticks — 3-up gallery */
  if (isMatch(alt, title, 'Recycled Chopsticks')) {
    const imgs = ['images/skb13.jpg', 'images/skb14.jpg', 'images/skb15.jpg'];
    return `
      <article class="lb-article">
        <h2 id="lb-title">${esc(title)}</h2>
        <p>The chopsticks pair recycled stainless-steel offcuts with beech-wood handles for a durable, repairable, and low-waste utensil set. Stainless steel is long-lasting and easily recyclable, while beech offers strength, a smooth texture, and a warm, natural feel in the hand. Combining these materials yields an ergonomic, timeless design that avoids single-use plastics and reduces reliance on new raw resources.</p>
        <p><em>In collaboration with Jazmine Theobold and Jiyoung Kim.</em></p>
        <h3 class="muted">Materials: Beech wood and stainless steel offcuts (100% natural and sustainable materials)</h3>
        <div class="lb-grid">${gallery(imgs, 'Recycled Chopsticks detail', thumbSrc || 'images/skb15.jpg')}</div>
      </article>`;
  }

  /* Weaving / Handwoven Herringbone — split (left • text • right) */
  if (isMatch(alt, title, 'Weaving', 'Handwoven Herringbone')) {
    const fallback = thumbSrc || 'images/skb16.jpg';
    return `
      <article class="lb-article">
        <div class="lb-split-3">
          <figure>${imgTag('images/skb17.jpg', 'Handwoven Herringbone — left image', fallback)}</figure>
          <div>
            <h2 id="lb-title">Handwoven Herringbone</h2>
            <p>One of my first weavings. This piece was made in the first few months of lockdown, made on a borrowed warping loom and four shaft loom. Wool native to western Ireland and hand dyed using turmeric, coffee grounds, tea leaves, and vinegar.</p>
            <p>This piece is a colour study that is part of a series that studied bones I collected from the Irish mountains where I lived.</p>
            <h3 class="muted">Materials: Naturally hand-dyed Irish wool</h3>
          </div>
          <figure>${imgTag('images/skb18.jpg', 'Handwoven Herringbone — right image', fallback)}</figure>
        </div>
      </article>`;
  }

  /* Segment — 3-up gallery */
  if (isMatch(alt, title, 'Segment', 'Segment')) {
    const imgs = ['images/skb24.jpg', 'images/skb25.jpg', 'images/skb26.jpg'];
    return `
      <article class="lb-article">
        <h2 id="lb-title">${esc(title)}</h2>
        <p>A three-legged coffee table with two supports, developed from the idea of creating a flat-pack, easy-to-ship furniture piece. Made from hand-turned oak and manufactured entirely in the UK. By creating a deconstructable piece, customers have easier access to furniture globally.</p>
        <p>The flat-pack table with a glass tabletop blends functionality and aesthetics. It allows easy assembly and disassembly—great for small apartments or people on the move. Three sturdy legs fold for hassle-free storage or transport, and the glass top provides an elegant, easy-to-clean surface.</p>
        <h3 class="muted">Materials: Oak and glass</h3>
        <div class="lb-grid">${gallery(imgs, 'Segment detail', thumbSrc || 'images/skb22.jpg')}</div>
      </article>`;
  }

  /* Folding Screen — split w/ stacked diagram on left (copy, diagram • right) */
  if (isMatch(alt, title, 'Folding Screen')) {
    const fallback = thumbSrc || 'images/skb27.jpg';
    return `
      <article class="lb-article">
        <div class="lb-screen">
          <div class="copy">
            <h2 id="lb-title">Folding Screen</h2>
            <p>Inspired by Eileen Gray's iconic 1922 folding screen, known as the "brick" screen. The screen's frame is constructed from sturdy plywood, chosen for its versatility, durability, and ability to showcase the inherent beauty of the wood's grain.</p>
            <p>Made of nine horizontal rows of panels joined by thin vertical metal rods, it is not only a movable wall but also a sculpture composed of solids and voids with an underlying Cubist influence.</p>
            <h3 class="muted">Materials: Plywood and metal rods</h3>
          </div>
          <figure class="right">${imgTag('images/skb30.jpg', 'Folding Screen assembled view', fallback)}</figure>
          <figure class="diagram">${imgTag('images/skb28.jpg', 'Folding Screen panel layout diagram', fallback)}</figure>
        </div>
      </article>`;
  }

  /* Cork Dart Board — split like Folding Screen (copy + bottom image • right hero) */
  if (isMatch(alt, title, 'Cork Dart Board')) {
    const fallback = thumbSrc || 'images/skb31.jpg';
    return `
      <article class="lb-article">
        <div class="lb-screen">
          <div class="copy">
            <h2 id="lb-title">Cork Dart Board</h2>
            <p>Crafted dart board, a harmonious blend of natural cork and precision-engineered steel numbers. Designed to elevate the traditional dart experience, this handmade piece boasts a sturdy and visually striking composition.</p>
            <p>At its core are carefully selected cork layers, stacked and compressed to create a resilient, welcoming surface. Cork’s natural texture and pliability provide excellent grip and a smooth, consistent release. Complementing the warm, organic cork is a set of laser-cut steel numbers, seamlessly integrated into the design.</p>
            <h3 class="muted">Materials: Cork, plywood, and stainless steel</h3>
          </div>
          <figure class="right">${imgTag('images/skb33.jpg', 'Cork Dart Board — detail', fallback)}</figure>
          
        </div>
      </article>`;
  }

  /* Wishbone Screen — split like Weaving */
  if (isMatch(alt, title, 'Wishbone Screen')) {
    const fallback = thumbSrc || 'images/skb44.jpg';
    return `
      <article class="lb-article">
        <div class="lb-split-3">
          <figure>${imgTag('images/skb38.jpg', 'Wishbone Screen detail', fallback)}</figure>
          <div>
            <h2 id="lb-title">Wishbone Screen</h2>
            <p>A folding screen with interchangeable woven fabrics offers numerous benefits. The interchangeable panels let users easily update the fabric based on preference, mood, or interior decor—tailoring the aesthetic to personal style and needs.</p>
            <p>Woven fabrics provide a wide range of textures, patterns, and colours that can be swapped to complement any room. This customizability refreshes a space without buying entirely new furniture.</p>
            <p>By letting panels be changed, the design reduces waste and supports a more sustainable approach to home furnishings.</p>
            <h3 class="muted">Materials: UK-grown ash and hand-woven linen</h3>
          </div>
          <figure>${imgTag('images/skb40.jpg', 'Wishbone Screen full view', fallback)}</figure>
        </div>
      </article>`;
  }

  /* Ercol Shaker Bench — split like Weaving */
  if (isMatch(alt, title, 'Ercol Shaker Bench')) {
    const fallback = thumbSrc || 'images/skb46.jpg';
    return `
      <article class="lb-article">
        <div class="lb-split-3">
          <figure>${imgTag('images/skb48.jpg', 'Ercol Shaker Bench drawings', fallback)}</figure>
          <div>
            <h2 id="lb-title">Ercol Shaker Bench</h2>
            <p>In this design, a shaker bench is crafted from high-quality ash wood and manufactured in the UK.</p>
            <p>The bench combines a timeless silhouette with modern craftsmanship. A sturdy frame provides durability and stability; the seat accommodates two people and is ergonomically designed for comfort. Production follows strict UK quality standards and ethical practice.</p>
            <h3 class="muted">Materials: UK-grown ash</h3>
          </div>
          <figure class="right">${imgTag('images/skb50.jpg', 'Ercol Shaker Bench — model view', fallback)}</figure>
        </div>
      </article>`;
  }

  /* Default fallback */
  const img = thumbSrc ? `<img src="${thumbSrc}" alt="${esc(title)}" style="width:100%;height:auto;border-radius:8px;margin-bottom:1rem;">` : '';
  return `
    <article class="lb-article">
      <h2 id="lb-title">${esc(title)}</h2>
      ${img}
      <p>${esc(fallbackDesc || '')}</p>
    </article>`;
}

/* ========= Contact → compact lightbox with centered text ========= */
(() => {
  const CONTACT_SELECTOR = 'nav a[href^="mailto:"], #contact-link, [data-modal="contact"]';
  const EMAIL = 'sidneykonigbrock@icloud.com';

  // Ensure project modals are never stuck in compact mode
  if (typeof openModal === 'function') {
    const _openModal = openModal;
    openModal = function (projectEl) {
      modal?.querySelector('.content')?.classList.remove('compact');
      _openModal(projectEl);
    };
  }
  if (typeof closeModal === 'function') {
    const _closeModal = closeModal;
    closeModal = function () {
      modal?.querySelector('.content')?.classList.remove('compact');
      _closeModal();
    };
  }

  function openContactModal() {
    if (!modal || !lbBody || !closeBtn) return;
    const content = modal.querySelector('.content');
    content?.classList.add('compact'); // requires the CSS .compact rules you added

    lbBody.innerHTML = `
      <article class="lb-article" aria-labelledby="lb-title" style="text-align:center">
        <h2 id="lb-title">Contact</h2>
        <p style="font-size:1.1rem; margin-bottom:.75rem;">
          For all inquiries and requests, please feel free to reach me at <strong>${EMAIL}</strong>. Thank you!
        </p>
        <p>
          <button type="button" class="copy-email" data-email="${EMAIL}">Copy email</button>
        </p>
      </article>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    lastFocused = document.activeElement;
    closeBtn.focus();

    focusables = modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
  }

  // Intercept Contact clicks (mailto:, #contact-link, or data-modal="contact")
  document.addEventListener('click', (e) => {
    const link = e.target.closest(CONTACT_SELECTOR);
    if (!link) return;
    e.preventDefault();
    openContactModal();
  });

  // Copy-to-clipboard for the email button
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-email');
    if (!btn) return;
    const email = btn.dataset.email || EMAIL;
    try {
      await navigator.clipboard.writeText(email);
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = prev), 1200);
    } catch {
      prompt('Copy email address:', email);
    }
  });
})();

