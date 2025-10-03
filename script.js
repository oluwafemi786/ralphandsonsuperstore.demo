/* script.js
   Implements:
   - Mobile nav toggle
   - Product filtering & search (client-side)
   - Simple cart stored in localStorage (add/remove/clear)
   - Contact form front-end validation and success message
   - Lazy-loading support is used via loading="lazy" attributes in images
*/

/* ---------- Nav Toggle (handles multiple pages) ---------- */
function initNavToggle() {
  const toggles = document.querySelectorAll('.nav-toggle');
  toggles.forEach(btn=>{
    btn.addEventListener('click', () => {
      // find nearest nav (same header)
      const header = btn.closest('.header-inner') || document.querySelector('.header-inner');
      const nav = header.querySelector('.site-nav');
      if(!nav) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  });
}

/* ---------- Sample product data (replace or extend) ---------- */
const sampleProducts = [
  { id: 'p1', name: 'Multivitamin', category: 'neolife', price: 8500, description: 'Daily multivitamin for general wellness.', img: 'images/assets/multivitamin.jpg' },
  { id: 'p2', name: 'Nutri shake', category: 'neolife', price: 25000, description: 'Protein and nutrition shake mix.', img: 'images/assets/nutri shake.jpg' },
  { id: 'p3', name: 'Aloe vera', category: 'Neolife', price: 45000, description: 'health care.', img: 'images/assets/aloe vera.jpg' },
  { id: 'p4', name: 'Zinc Chilated', category: 'Neolife', price: 26000, description: 'for infertility and digestion', img: 'images/assets/zinc chilated.jpg' },
  { id: 'p5', name: 'Amitone', category: 'Neolife', price: 25000, description: 'natural muscle toner.', img: 'images/assets/amitone.jpg' },
  { id: 'p6', name: 'calmag-chelated', category: 'Neolife', price: 15000, description: 'help with metabolism of carbohydrate, fat and protein.', img: 'images/assets/calmag.jpg' },
  { id: 'p7', name: 'tre-en-en', category: 'Neolife', price: 16000, description: 'increase metabolism of nutrient.', img: 'images/assets/tre en en.jpg' }
];

/* ---------- Product rendering & filtering ---------- */
function formatPrice(n){ return '₦' + n.toLocaleString(); }

function renderProducts(products) {
  const grid = document.getElementById('products-grid') || document.getElementById('product-grid');
  if(!grid) return;
  grid.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-category', p.category);
    card.setAttribute('data-id', p.id);
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="muted">${p.description}</p>
        <div class="product-meta">
          <span class="price">${formatPrice(p.price)}</span>
          <button class="btn small add-to-cart" data-id="${p.id}">Add to Cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  attachAddToCartButtons();
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
});

document.querySelectorAll(".scroll-animate").forEach(el => observer.observe(el));

/* ---------- Product filter buttons ---------- */
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if(filterBtns.length){
    filterBtns.forEach(btn=>{
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        const searchVal = document.getElementById('search')?.value?.toLowerCase() || '';
        applyFilter(filter, searchVal);
      });
    });
  }
  const search = document.getElementById('search');
  if(search){
    search.addEventListener('input', () => {
      const active = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
      applyFilter(active, search.value.toLowerCase());
    });
  }
}

function applyFilter(filter, searchVal=''){
  const filtered = sampleProducts.filter(p=>{
    const matchFilter = filter === 'all' ? true : p.category === filter;
    const matchSearch = !searchVal || p.name.toLowerCase().includes(searchVal) || p.description.toLowerCase().includes(searchVal);
    return matchFilter && matchSearch;
  });
  renderProducts(filtered);
}

/* ---------- Cart: localStorage persistence ---------- */
const CART_KEY = 'rs_superstore_cart';

function getCart(){
  try{
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  }catch(e){
    return {};
  }
}
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); renderCartItems(); }

function addToCart(id){
  const product = sampleProducts.find(p=>p.id===id);
  if(!product) return;
  const cart = getCart();
  if(cart[id]) cart[id].qty += 1;
  else cart[id] = { id: product.id, name: product.name, price: product.price, qty: 1, img: product.img };
  saveCart(cart);
}

function removeFromCart(id){
  const cart = getCart();
  if(cart[id]) delete cart[id];
  saveCart(cart);
}

function clearCart(){
  localStorage.removeItem(CART_KEY);
  updateCartCount();
  renderCartItems();
}

function updateCartCount(){
  const cart = getCart();
  const count = Object.values(cart).reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('#cart-count, #cart-count-2, #cart-count-3, #cart-count-4, #cart-count-5').forEach(el=>{
    if(el) el.textContent = count;
  });
}

/* Render cart items inside modal */
function renderCartItems(){
  const container = document.getElementById('cart-items');
  if(!container) return;
  const cart = getCart();
  const items = Object.values(cart);
  if(items.length === 0){
    container.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  container.innerHTML = items.map(i=>`
    <div class="cart-line" data-id="${i.id}" style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.6rem">
      <img src="${i.img}" alt="${i.name}" style="width:56px;height:56px;object-fit:cover;border-radius:6px">
      <div style="flex:1">
        <strong>${i.name}</strong>
        <div class="muted">${formatPrice(i.price)} × ${i.qty}</div>
      </div>
      <div style="text-align:right">
        <button class="btn small remove-from-cart" data-id="${i.id}">Remove</button>
      </div>
    </div>
  `).join('');
  // attach remove handlers
  document.querySelectorAll('.remove-from-cart').forEach(btn=>{
    btn.addEventListener('click', ()=> removeFromCart(btn.dataset.id));
  });
}

/* Add to cart buttons across pages */
function attachAddToCartButtons(){
  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = btn.dataset.id;
      addToCart(id);
      // small visual feedback
      btn.textContent = 'Added';
      setTimeout(()=> btn.textContent = 'Add to Cart', 900);
    });
  });
}

/* Cart modal open/close */
function initCartModal(){
  const cartModal = document.getElementById('cart-modal');
  const cartButton = document.getElementById('cart-button') || document.getElementById('cart-button-2') || document.getElementById('cart-button-3') || document.getElementById('cart-button-4') || document.getElementById('cart-button-5');
  const cartClose = document.getElementById('cart-close');
  const clearBtn = document.getElementById('clear-cart');
  const checkout = document.getElementById('checkout');

  // open from any cart button
  document.querySelectorAll('.cart-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      if(!cartModal) return;
      cartModal.setAttribute('aria-hidden', 'false');
      renderCartItems();
    });
  });

  if(cartClose) cartClose.addEventListener('click', ()=> cartModal?.setAttribute('aria-hidden', 'true'));
  if(clearBtn) clearBtn.addEventListener('click', ()=> { clearCart(); });
  if(checkout) checkout.addEventListener('click', ()=> {
    alert('Checkout is a sample action. Integrate payment or backend to complete purchases.');
  });

  // close modal by clicking backdrop
  if(cartModal) cartModal.addEventListener('click', (e)=>{
    if(e.target === cartModal) cartModal.setAttribute('aria-hidden', 'true');
  });
}

/* ---------- Contact form validation (front-end only) ---------- */
function initContactForm(){
  const form = document.getElementById('contact-form');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const message = form.message.value.trim();

    if(name.length < 2){ alert('Please enter your name.'); return; }
    if(!/^\S+@\S+\.\S+$/.test(email)){ alert('Please enter a valid email.'); return; }
    if(phone.length < 6){ alert('Please enter a valid phone number.'); return; }
    if(message.length < 6){ alert('Please enter a message.'); return; }

    // Simulate success (front-end only). Replace with real submission to backend or email service.
    form.reset();
    const success = document.getElementById('contact-success');
    if(success){
      success.hidden = false;
      setTimeout(()=> success.hidden = true, 5000);
    }
  });
}

AOS.init();


/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  initNavToggle();
  renderProducts(sampleProducts); // initial product render on pages with product-grid
  initFilters();
  initCartModal();
  updateCartCount();
  renderCartItems();
  initContactForm();

  // Attach generic event delegation for add-to-cart in case of dynamically created buttons
  document.body.addEventListener('click', (e)=>{
    if(e.target.matches('.add-to-cart')) {
      const id = e.target.dataset.id;
      addToCart(id);
    }
  });
});
