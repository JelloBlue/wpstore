const PASSWORD = 'admin123';
const AUTH_KEY = 'cod-store-admin-auth';
const PRODUCT_KEY = 'cod-store-products';

const loginPanel = document.getElementById('login-panel');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const productForm = document.getElementById('product-form');
const adminProductList = document.getElementById('admin-product-list');
const logoutBtn = document.getElementById('logout-btn');

let products = [];

init();

async function init() {
  products = await loadProducts();
  if (localStorage.getItem(AUTH_KEY) === 'true') {
    showAdmin();
  } else {
    showLogin();
  }
}

function showAdmin() {
  loginPanel.classList.add('hidden');
  adminPanel.classList.remove('hidden');
  renderProductList();
}

function showLogin() {
  loginPanel.classList.remove('hidden');
  adminPanel.classList.add('hidden');
}

async function loadProducts() {
  const localProducts = localStorage.getItem(PRODUCT_KEY);
  if (localProducts) {
    return JSON.parse(localProducts);
  }

  const response = await fetch('products.json');
  return response.json();
}

function saveProducts() {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}

function renderProductList() {
  adminProductList.innerHTML = '';

  products.forEach((product) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <span>${product.name} - $${product.price}</span>
      <button class="link-btn" data-id="${product.id}">Delete</button>
    `;

    item.querySelector('button').addEventListener('click', () => {
      deleteProduct(product.id);
    });

    adminProductList.appendChild(item);
  });
}

function deleteProduct(productId) {
  products = products.filter((product) => product.id !== productId);
  saveProducts();
  renderProductList();
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const password = formData.get('password');

  if (password === PASSWORD) {
    localStorage.setItem(AUTH_KEY, 'true');
    loginError.textContent = '';
    showAdmin();
    return;
  }

  loginError.textContent = 'Invalid password.';
});

productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(productForm);

  const newProduct = {
    id: `p${Date.now()}`,
    name: String(formData.get('name')).trim(),
    price: Number(formData.get('price')),
    image: String(formData.get('image')).trim(),
  };

  if (!newProduct.name || !newProduct.price || !newProduct.image) {
    return;
  }

  products.unshift(newProduct);
  saveProducts();
  renderProductList();
  productForm.reset();
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(AUTH_KEY);
  showLogin();
});
