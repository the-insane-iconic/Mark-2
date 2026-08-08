/**
 * CRYO_BYTE AI OS Client Engine
 * Features: AI Natural Language Assistant Bar, Dual Theme System (Obsidian/Quartz),
 * Asymmetric Bento Grid Controls, 1-Click Buy Now, and Real-Time Multi-Tab Sync.
 */

// Currency Conversion Engine
const CURRENCIES = {
  INR: { symbol: '₹', rate: 1.0 },
  USD: { symbol: '$', rate: 0.012 },
  EUR: { symbol: '€', rate: 0.011 },
  GBP: { symbol: '£', rate: 0.0094 }
};

let currentCurrency = 'INR';

function formatPrice(priceInINR) {
  const curr = CURRENCIES[currentCurrency] || CURRENCIES.INR;
  const converted = priceInINR * curr.rate;
  if (currentCurrency === 'INR') {
    return `${curr.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  }
  return `${curr.symbol}${converted.toFixed(2)}`;
}

// Initial Catalog Datastore
const INITIAL_PRODUCTS = [
  {
    id: "p1",
    sku: "LED-101",
    title: "RGB Ambient LED Strip Pro",
    category: "lighting",
    price: 2999,
    discount_price: 1999,
    stock: 45,
    rating: 4.9,
    rating_count: 128,
    image: "https://foyr.com/learn/wp-content/uploads/2019/01/lighting-for-gaming-room-scaled.jpg",
    description: "16-Million color music-sync Bluetooth & Wi-Fi smart LED strip with high-density light beads.",
    specs: ["Voice Control (Alexa/Google)", "Music Sync Sensor", "Cuttable & Extendable", "1 Year Warranty"]
  },
  {
    id: "p2",
    sku: "DESK-202",
    title: "Ergonomic Cable-Managed Desk",
    category: "furniture",
    price: 8999,
    discount_price: 6999,
    stock: 8,
    rating: 4.8,
    rating_count: 94,
    image: "https://cdn.shopify.com/s/files/1/1881/2599/files/0d554ee22af77852eabae82936cee6ee_480x480.jpg?v=1717754907",
    description: "55-inch carbon fiber textured heavy-duty desk with built-in power strip and concealed tray.",
    specs: ["55\" Carbon Fiber Top", "Integrated Cable Tray", "Headset & Cup Holder", "300 lbs Capacity"]
  },
  {
    id: "p3",
    sku: "PANEL-303",
    title: "Hexagon Acoustic Wall Panels",
    category: "furniture",
    price: 1899,
    discount_price: 1499,
    stock: 24,
    rating: 4.6,
    rating_count: 67,
    image: "https://m.media-amazon.com/images/I/815NKi8l4kL._UF1000,1000_QL80_.jpg",
    description: "Sound-dampening high-density polyester fiber acoustic panels for streaming and audio clarity.",
    specs: ["12-Pack Beveled Edges", "NRC 0.95 Noise Dampening", "Self-Adhesive Backing", "Eco-Friendly Material"]
  },
  {
    id: "p4",
    sku: "CHAIR-404",
    title: "Cyberpunk Pro Lumbar Chair",
    category: "furniture",
    price: 14999,
    discount_price: 10999,
    stock: 3,
    rating: 4.9,
    rating_count: 215,
    image: "https://foyr.com/learn/wp-content/uploads/2019/01/seating-for-gaming-room.jpg",
    description: "Multi-tilt ergonomic chair with memory foam headrest and 4D adjustable armrests.",
    specs: ["4D Armrest Adjustability", "Class 4 Gas Cylinder", "Breathable PU Leather", "150° Recline System"]
  },
  {
    id: "p5",
    sku: "KIT-505",
    title: "Smart Atmosphere LED Kit",
    category: "lighting",
    price: 5999,
    discount_price: 4999,
    stock: 19,
    rating: 4.7,
    rating_count: 82,
    image: "https://www.almila.com.tr/sites/default/files/styles/content_header_mobile/public/2024-06/37888785-fa43-4243-ae48-2a9ca2f35ff0_atmosphaerisches-gamer-zimmer.jpg.webp?itok=6YA57pOv",
    description: "Dual light bars + camera reactive TV backlighting for immersion during gameplay.",
    specs: ["Screen Color Mirroring", "HDMI Pass-through Sync", "App Customization", "16M Dynamic Colors"]
  },
  {
    id: "p6",
    sku: "POST-606",
    title: "Neon Cyber Poster Collection",
    category: "posters",
    price: 999,
    discount_price: 699,
    stock: 50,
    rating: 4.5,
    rating_count: 41,
    image: "https://i.pinimg.com/736x/da/95/0a/da950ab5bd3f8812988bf75113af8d27.jpg",
    description: "Set of 4 high-gloss 12x18 inch ultra-detailed cyberpunk anime metallic wall prints.",
    specs: ["300 GSM Heavy Paper", "UV Resilient Ink", "Frameless Modern Look", "Set of 4 Prints"]
  },
  {
    id: "p7",
    sku: "ANIME-707",
    title: "Anime Silhouette LED Lamp",
    category: "lighting",
    price: 3499,
    discount_price: 2499,
    stock: 12,
    rating: 4.8,
    rating_count: 110,
    image: "https://static.wixstatic.com/media/973641_dd18afbf52c44615b55545334043c0ee~mv2.jpg/v1/fill/w_480,h_600,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/973641_dd18afbf52c44615b55545334043c0ee~mv2.jpg",
    description: "Laser-etched acrylic optical 3D LED lamp with touch sensor and remote color switcher.",
    specs: ["16 Touch Color Modes", "USB or Battery Powered", "Shatterproof Acrylic", "Zero Heat Output"]
  },
  {
    id: "p8",
    sku: "SHELF-808",
    title: "RGB Floating Wall Shelves",
    category: "furniture",
    price: 3999,
    discount_price: 2999,
    stock: 14,
    rating: 4.7,
    rating_count: 53,
    image: "https://images-cdn.ubuy.co.in/66f1469f4206364186049347-gaming-floating-shelves-with-lights-led.jpg",
    description: "Heavy duty wall floating shelf pair with embedded under-shelf LED strip for collectibles.",
    specs: ["Holds up to 25 lbs", "Under-shelf RGB Strip", "Concealed Wall Anchors", "Solid Hardwood"]
  }
];

const ITEM_AFFINITY_MATRIX = {
  "p1": ["p5", "p3", "p8"],
  "p2": ["p4", "p1", "p9"],
  "p3": ["p1", "p6", "p10"],
  "p4": ["p2", "p9", "p1"],
  "p5": ["p1", "p7", "p8"],
  "p6": ["p10", "p3", "p7"]
};

// Global Store State
class AppStore {
  constructor() {
    this.products = JSON.parse(localStorage.getItem('cryo_products')) || INITIAL_PRODUCTS;
    this.cart = JSON.parse(localStorage.getItem('cryo_cart')) || [];
    this.wishlist = JSON.parse(localStorage.getItem('cryo_wishlist')) || [];
    
    this.filters = {
      searchQuery: '',
      categories: ['lighting', 'furniture', 'posters'],
      maxPrice: 20000,
      inStockOnly: false,
      minRating: 0,
      sortBy: 'featured'
    };
  }

  saveProducts() {
    localStorage.setItem('cryo_products', JSON.stringify(this.products));
  }

  saveCart() {
    localStorage.setItem('cryo_cart', JSON.stringify(this.cart));
  }

  saveWishlist() {
    localStorage.setItem('cryo_wishlist', JSON.stringify(this.wishlist));
  }
}

const store = new AppStore();

// Live Broadcast Engine
class LiveSyncEngine {
  constructor() {
    this.channel = new BroadcastChannel('cryo_byte_live_bus');
    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'PRODUCT_PRICE_UPDATED') {
        this.handleRemoteProductUpdate(payload);
      }
    };
  }

  broadcastUpdate(productId, updatedFields) {
    const payload = { productId, updatedFields, timestamp: Date.now() };
    this.channel.postMessage({ type: 'PRODUCT_PRICE_UPDATED', payload });
    this.handleRemoteProductUpdate(payload);
  }

  handleRemoteProductUpdate(payload) {
    const { productId, updatedFields } = payload;
    const target = store.products.find(p => p.id === productId);
    if (!target) return;

    Object.assign(target, updatedFields);
    store.saveProducts();

    const cardEl = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (cardEl) {
      cardEl.classList.add('live-updated');
      setTimeout(() => cardEl.classList.remove('live-updated'), 1600);
    }

    renderCatalog();
    showToast(`⚡ Live Update: "${target.title}" price/stock updated live!`);
  }
}

const liveSync = new LiveSyncEngine();

// Collaborative Recommendation Engine
class RecommendationEngine {
  static getRecommendations(currentProductId, limit = 4) {
    const affinityList = ITEM_AFFINITY_MATRIX[currentProductId] || [];
    let recs = store.products.filter(p => affinityList.includes(p.id));

    if (recs.length < limit) {
      const currentItem = store.products.find(p => p.id === currentProductId);
      const sameCat = store.products.filter(p => p.id !== currentProductId && p.category === currentItem?.category);
      recs = [...new Set([...recs, ...sameCat])];
    }

    return recs.slice(0, limit);
  }

  static renderRecommendationsCarousel() {
    const container = document.getElementById('recommendations-carousel');
    if (!container) return;

    const focusId = store.cart[0]?.id || 'p1';
    const recs = this.getRecommendations(focusId, 4);

    container.innerHTML = recs.map(item => `
      <div class="rec-card" onclick="openProductModal('${item.id}')">
        <img src="${item.image}" alt="${item.title}" />
        <span class="affinity-score">⚡ 94% Vector Match</span>
        <h4 class="card-title" style="font-size:0.8rem">${item.title}</h4>
        <span class="price-current" style="font-size:0.9rem">${formatPrice(item.discount_price)}</span>
      </div>
    `).join('');
  }
}

// AI Assistant Natural Language Intent Parser
function applyAiPrompt(promptText) {
  const inputEl = document.getElementById('ai-prompt-input');
  if (inputEl) inputEl.value = promptText;

  const text = promptText.toLowerCase();

  // Reset filters
  store.filters.categories = ['lighting', 'furniture', 'posters'];
  store.filters.maxPrice = 20000;
  store.filters.inStockOnly = false;
  store.filters.minRating = 0;
  store.filters.searchQuery = '';

  if (text.includes('lighting') || text.includes('rgb')) {
    store.filters.categories = ['lighting'];
  } else if (text.includes('furniture') || text.includes('desk') || text.includes('chair')) {
    store.filters.categories = ['furniture'];
  }

  if (text.includes('3,000') || text.includes('3000')) {
    store.filters.maxPrice = 3000;
  } else if (text.includes('8,000') || text.includes('8000')) {
    store.filters.maxPrice = 8000;
  }

  if (text.includes('highest rated') || text.includes('4.8+')) {
    store.filters.sortBy = 'rating';
  }

  if (text.includes('in stock')) {
    store.filters.inStockOnly = true;
  }

  renderCatalog();
  showToast(`✨ AI Assistant applied filters for: "${promptText}"`);
}

// Catalog Grid Renderer
function renderCatalog() {
  const gridContainer = document.getElementById('product-grid');
  if (!gridContainer) return;

  const spotlight = store.products[0];
  if (spotlight) {
    document.getElementById('spotlight-img').src = spotlight.image;
    document.getElementById('spotlight-title').textContent = spotlight.title;
    document.getElementById('spotlight-desc').textContent = spotlight.description;
    document.getElementById('spotlight-price').textContent = formatPrice(spotlight.discount_price);
  }

  let filtered = store.products.filter(p => {
    if (store.filters.searchQuery) {
      const q = store.filters.searchQuery.toLowerCase();
      const matches = p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (!store.filters.categories.includes(p.category)) return false;
    if (p.discount_price > store.filters.maxPrice) return false;
    if (store.filters.inStockOnly && p.stock <= 0) return false;
    if (p.rating < store.filters.minRating) return false;

    return true;
  });

  if (store.filters.sortBy === 'price-low') {
    filtered.sort((a, b) => a.discount_price - b.discount_price);
  } else if (store.filters.sortBy === 'price-high') {
    filtered.sort((a, b) => b.discount_price - a.discount_price);
  } else if (store.filters.sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  document.getElementById('results-count').textContent = `Showing ${filtered.length} products`;

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-sub);">
        <h3>No products match query</h3>
        <p>Try clearing your AI Assistant prompt or resetting price sliders.</p>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = filtered.map(product => {
    return `
      <div class="product-card" data-id="${product.id}">
        <div class="card-media" onclick="openProductModal('${product.id}')">
          <img src="${product.image}" alt="${product.title}" loading="lazy" />
          <span class="card-badge">${product.category.toUpperCase()}</span>
        </div>

        <div class="card-content">
          <h3 class="card-title" onclick="openProductModal('${product.id}')">${product.title}</h3>
          
          <div class="card-rating">
            <span>★ ${product.rating}</span>
            <span style="color:var(--text-sub)">(${product.rating_count})</span>
          </div>

          <div class="card-price-row">
            <span class="price-current">${formatPrice(product.discount_price)}</span>
            <span class="price-old">${formatPrice(product.price)}</span>
          </div>

          <div class="card-actions">
            <button class="btn-linear full" onclick="addToCart('${product.id}')">
              <span>🛒 Add to Cart</span>
            </button>
            <button class="btn-one-click-sm full" onclick="oneClickBuyNow('${product.id}')">
              <span>⚡ Buy Now (1-Click)</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function oneClickBuyNow(productId) {
  const p = store.products.find(item => item.id === productId);
  if (!p) return;

  const orderId = `#CB-${Math.floor(10000 + Math.random() * 90000)}`;
  showToast(`⚡ 1-Click Purchase Success! Order ${orderId} placed.`);

  document.getElementById('tracking-input-id').value = orderId;
  openModal('tracking-modal');
}

function openProductModal(productId) {
  const p = store.products.find(item => item.id === productId);
  if (!p) return;

  document.getElementById('modal-main-image').src = p.image;
  document.getElementById('modal-title').textContent = p.title;
  document.getElementById('modal-category-badge').textContent = p.category.toUpperCase();
  document.getElementById('modal-stock-badge').textContent = p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock';
  document.getElementById('modal-price').textContent = formatPrice(p.discount_price);
  document.getElementById('modal-old-price').textContent = formatPrice(p.price);
  document.getElementById('modal-description').textContent = p.description;

  document.getElementById('modal-add-cart-btn').onclick = () => {
    addToCart(p.id);
    closeModal('product-modal');
  };
  document.getElementById('modal-one-click-btn').onclick = () => {
    closeModal('product-modal');
    oneClickBuyNow(p.id);
  };

  const recs = RecommendationEngine.getRecommendations(p.id, 2);
  const bundleItems = [p, ...recs];
  const bundleTotal = bundleItems.reduce((sum, item) => sum + item.discount_price, 0);

  document.getElementById('bundle-items-list').innerHTML = bundleItems.map(item => `
    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
      <span>✓ ${item.title}</span>
      <strong>${formatPrice(item.discount_price)}</strong>
    </div>
  `).join('');

  document.getElementById('bundle-total-price').textContent = formatPrice(bundleTotal);
  document.getElementById('add-bundle-btn').onclick = () => {
    bundleItems.forEach(item => addToCart(item.id));
    closeModal('product-modal');
    showToast(`📦 Added 3-Item Bundle to Cart!`);
  };

  openModal('product-modal');
}

function addToCart(productId) {
  const p = store.products.find(item => item.id === productId);
  if (!p) return;

  const existing = store.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    store.cart.push({ id: p.id, title: p.title, price: p.discount_price, image: p.image, qty: 1 });
  }

  store.saveCart();
  updateCartBadge();
  showToast(`🛒 "${p.title}" added to cart!`);
  RecommendationEngine.renderRecommendationsCarousel();
}

function updateCartBadge() {
  const totalCount = store.cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cart-badge-count').textContent = totalCount;
  document.getElementById('cart-items-count').textContent = totalCount;
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-list');
  if (!container) return;

  if (store.cart.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-sub); padding:30px;">Your cart is empty.</p>`;
    document.getElementById('cart-grand-total').textContent = formatPrice(0);
    return;
  }

  let subtotal = 0;
  container.innerHTML = store.cart.map(item => {
    subtotal += item.price * item.qty;
    return `
      <div style="display:flex; gap:10px; background:rgba(255,255,255,0.03); padding:8px; border-radius:6px;">
        <img src="${item.image}" style="width:48px; height:48px; object-fit:cover; border-radius:4px;" />
        <div style="flex:1;">
          <h5 style="font-size:0.8rem; margin-bottom:4px;">${item.title}</h5>
          <span style="color:var(--accent-cyan); font-weight:700;">${formatPrice(item.price)} (x${item.qty})</span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('cart-grand-total').textContent = formatPrice(subtotal);
}

function renderAdminTable() {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  tbody.innerHTML = store.products.map(p => `
    <tr>
      <td><code>${p.sku}</code></td>
      <td><strong>${p.title}</strong></td>
      <td>${p.category}</td>
      <td><input type="number" id="admin-price-${p.id}" value="${p.discount_price}" class="linear-input" style="width:80px" /></td>
      <td><input type="number" id="admin-stock-${p.id}" value="${p.stock}" class="linear-input" style="width:60px" /></td>
      <td>
        <button class="btn-accent-glow" style="padding:4px 10px; font-size:0.75rem" onclick="publishAdminUpdate('${p.id}')">
          ⚡ Publish Live
        </button>
      </td>
    </tr>
  `).join('');
}

function publishAdminUpdate(productId) {
  const newPrice = Number(document.getElementById(`admin-price-${productId}`).value);
  const newStock = Number(document.getElementById(`admin-stock-${productId}`).value);

  liveSync.broadcastUpdate(productId, {
    discount_price: newPrice,
    stock: newStock
  });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>⚡</span><span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function openModal(modalId) {
  document.getElementById(modalId)?.classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.add('hidden');
}

// Telemetry Simulator
function startTelemetrySimulator() {
  setInterval(() => {
    const val = Math.floor(10 + Math.random() * 6);
    const lat1 = document.getElementById('telemetry-latency');
    const lat2 = document.getElementById('telemetry-latency-val');
    if (lat1) lat1.textContent = val;
    if (lat2) lat2.textContent = val;
  }, 3000);
}

// DOM Setup
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  updateCartBadge();
  RecommendationEngine.renderRecommendationsCarousel();
  startTelemetrySimulator();

  // Dual Theme Toggle Switcher
  const themeBtn = document.getElementById('theme-toggle-btn');
  const appBody = document.getElementById('app-body');
  const themeIcon = document.getElementById('theme-icon');
  const themeLabel = document.getElementById('theme-label');

  themeBtn?.addEventListener('click', () => {
    if (appBody.classList.contains('light-theme')) {
      appBody.classList.remove('light-theme');
      appBody.classList.add('dark-theme');
      themeIcon.textContent = '🌙';
      themeLabel.textContent = 'Dark OS';
      showToast('Switched to Obsidian Dark AI OS Theme');
    } else {
      appBody.classList.remove('dark-theme');
      appBody.classList.add('light-theme');
      themeIcon.textContent = '☀️';
      themeLabel.textContent = 'Quartz OS';
      showToast('Switched to Quartz Light AI OS Theme');
    }
  });

  // AI Assistant Prompt Form
  document.getElementById('ai-prompt-submit-btn')?.addEventListener('click', () => {
    const promptVal = document.getElementById('ai-prompt-input').value;
    if (promptVal) applyAiPrompt(promptVal);
  });

  document.getElementById('currency-select')?.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    renderCatalog();
    renderCartDrawer();
    RecommendationEngine.renderRecommendationsCarousel();
    showToast(`Currency converted to ${currentCurrency}`);
  });

  document.querySelectorAll('input[name="category"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const selected = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(c => c.value);
      store.filters.categories = selected;
      renderCatalog();
    });
  });

  const priceSlider = document.getElementById('price-range-slider');
  if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      store.filters.maxPrice = val;
      document.getElementById('price-range-value').textContent = formatPrice(val);
      renderCatalog();
    });
  }

  document.getElementById('in-stock-only-toggle')?.addEventListener('change', (e) => {
    store.filters.inStockOnly = e.target.checked;
    renderCatalog();
  });

  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    store.filters.sortBy = e.target.value;
    renderCatalog();
  });

  document.getElementById('global-search-input')?.addEventListener('input', (e) => {
    store.filters.searchQuery = e.target.value;
    renderCatalog();
  });

  document.getElementById('cart-drawer-trigger')?.addEventListener('click', () => {
    renderCartDrawer();
    openModal('cart-drawer-overlay');
  });

  document.getElementById('cart-drawer-close')?.addEventListener('click', () => closeModal('cart-drawer-overlay'));
  document.getElementById('admin-console-toggle')?.addEventListener('click', () => {
    renderAdminTable();
    openModal('admin-modal');
  });

  document.getElementById('admin-modal-close')?.addEventListener('click', () => closeModal('admin-modal'));
  document.getElementById('product-modal-close')?.addEventListener('click', () => closeModal('product-modal'));

  document.getElementById('checkout-trigger-btn')?.addEventListener('click', () => {
    closeModal('cart-drawer-overlay');
    openModal('checkout-modal');
  });

  document.getElementById('to-step-2-btn')?.addEventListener('click', () => {
    document.getElementById('checkout-step-1').classList.add('hidden');
    document.getElementById('checkout-step-2').classList.remove('hidden');
  });

  document.getElementById('back-to-step-1-btn')?.addEventListener('click', () => {
    document.getElementById('checkout-step-2').classList.add('hidden');
    document.getElementById('checkout-step-1').classList.remove('hidden');
  });

  document.getElementById('place-order-btn')?.addEventListener('click', () => {
    document.getElementById('checkout-step-2').classList.add('hidden');
    document.getElementById('checkout-step-3').classList.remove('hidden');
    store.cart = [];
    store.saveCart();
    updateCartBadge();
  });

  document.getElementById('checkout-modal-close')?.addEventListener('click', () => closeModal('checkout-modal'));
  document.getElementById('track-order-btn')?.addEventListener('click', () => openModal('tracking-modal'));
  document.getElementById('track-this-order-btn')?.addEventListener('click', () => {
    closeModal('checkout-modal');
    openModal('tracking-modal');
  });
  document.getElementById('tracking-modal-close')?.addEventListener('click', () => closeModal('tracking-modal'));
});
