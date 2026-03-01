const CART_KEY = 'cod-store-cart';
const PRODUCT_KEY = 'cod-store-products';
const WHATSAPP_NUMBER = '15551234567';

const productsEl = document.getElementById('products');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

let products = [];
let cart = loadCart();

init();

async function init() {
  products = await loadProducts();
  renderProducts();
  renderCart();
}

async function loadProducts() {
  const customProducts = localStorage.getItem(PRODUCT_KEY);
  if (customProducts) {
    return JSON.parse(customProducts);
  }

  const response = await fetch('products.json');
  return response.json();
}

function loadCart() {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderProducts() {
  productsEl.innerHTML = '';

  if (!products.length) {
    productsEl.innerHTML = '<p>No products available.</p>';
    return;
  }

  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" />
      <h3 class="product-title">${product.name}</h3>
      <p class="product-price">$${product.price}</p>
      <button class="btn" data-id="${product.id}">Add to Cart</button>
    `;

    card.querySelector('button').addEventListener('click', () => addToCart(product.id));
    productsEl.appendChild(card);
  });
}

function addToCart(productId) {
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = '';
  let total = 0;

  if (!cart.length) {
    cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
    cartTotalEl.textContent = '$0';
    return;
  }

  cart.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    if (!product) {
      return;
    }

    const itemTotal = product.price * cartItem.quantity;
    total += itemTotal;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div>
        <h4>${product.name}</h4>
        <p>$${product.price} x ${cartItem.quantity} = $${itemTotal}</p>
      </div>
      <button class="link-btn" data-id="${product.id}">Remove</button>
    `;

    itemEl.querySelector('button').addEventListener('click', () => removeFromCart(product.id));
    cartItemsEl.appendChild(itemEl);
  });

  cartTotalEl.textContent = `$${total}`;
}

checkoutBtn.addEventListener('click', () => {
  if (!cart.length) {
    alert('Your cart is empty.');
    return;
  }

  const lines = ['New COD Order', ''];
  let total = 0;

  cart.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    if (!product) {
      return;
    }

    const lineTotal = product.price * cartItem.quantity;
    total += lineTotal;
    lines.push(`- ${product.name} (${cartItem.quantity} x $${product.price}) = $${lineTotal}`);
  });

  lines.push('', `Total: $${total}`, 'Payment Method: Cash on Delivery');

  const message = encodeURIComponent(lines.join('\n'));
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, '_blank');
});
