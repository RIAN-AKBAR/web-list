// script.js
// Ganti dengan URL dan anon key Supabase Anda
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let products = [];

// Ambil data produk dari Supabase
async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  if (error) {
    alert('Gagal mengambil data produk: ' + error.message);
    return;
  }
  products = data;
  groupAndRender();
}

// Kelompokkan dan render produk
function groupAndRender() {
  const categories = {};
  products.forEach(product => {
    if (!categories[product.category]) {
      categories[product.category] = [];
    }
    categories[product.category].push(product);
  });

  const priceListElement = document.getElementById('priceList');
  if (!priceListElement) return; // jika elemen tidak ada (misal di halaman login)
  priceListElement.innerHTML = '';

  for (const category in categories) {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'category';

    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.innerHTML = `<div class="category-title">${category}</div>`;

    const productList = document.createElement('div');
    productList.className = 'product-list';

    categories[category].forEach(product => {
      const productItem = document.createElement('div');
      productItem.className = 'product-item';

      productItem.innerHTML = `
        <div class="product-name">${product.name}</div>
        <div class="product-price user-only">Rp ${product.price.toLocaleString('id-ID')}</div>
        <div class="product-status user-only ${product.status === 'Ada' ? 'status-ada' : 'status-kosong'}">${product.status}</div>

        <div class="admin-only admin-controls">
          <input type="number" value="${product.price}" data-id="${product.id}" min="0" onchange="updatePriceSupabase(this)">
          <select data-id="${product.id}" onchange="updateStatusSupabase(this)">
            <option value="Ada" ${product.status === 'Ada' ? 'selected' : ''}>Ada</option>
            <option value="Kosong" ${product.status === 'Kosong' ? 'selected' : ''}>Kosong</option>
          </select>
        </div>
      `;

      productList.appendChild(productItem);
    });

    categoryElement.appendChild(categoryHeader);
    categoryElement.appendChild(productList);
    priceListElement.appendChild(categoryElement);
  }
}

// Update harga di Supabase
async function updatePriceSupabase(input) {
  const id = input.getAttribute('data-id');
  const newPrice = parseInt(input.value);
  if (isNaN(newPrice) || newPrice < 0) {
    alert('Harga tidak valid');
    return;
  }
  const { error } = await supabase
    .from('products')
    .update({ price: newPrice })
    .eq('id', id);
  if (error) {
    alert('Gagal update harga: ' + error.message);
  }
}

// Update status di Supabase
async function updateStatusSupabase(select) {
  const id = select.getAttribute('data-id');
  const newStatus = select.value;
  const { error } = await supabase
    .from('products')
    .update({ status: newStatus })
    .eq('id', id);
  if (error) {
    alert('Gagal update status: ' + error.message);
  }
}

// Setup realtime subscription supaya user dan admin dapat update otomatis
function setupRealtime() {
  supabase
    .channel('public:products')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      payload => {
        const newRow = payload.new;
        const oldRow = payload.old;
        if (payload.eventType === 'UPDATE') {
          const idx = products.findIndex(p => p.id === newRow.id);
          if (idx !== -1) {
            products[idx] = newRow;
          } else {
            products.push(newRow);
          }
        } else if (payload.eventType === 'INSERT') {
          products.push(newRow);
        } else if (payload.eventType === 'DELETE') {
          products = products.filter(p => p.id !== oldRow.id);
        }
        groupAndRender();
      }
    )
    .subscribe();
}

// Login admin (password sederhana)
function toggleAdminMode() {
  const password = document.getElementById('adminPassword').value;
  if (password === 'admin123') {
    document.body.classList.toggle('mode-admin');
    if (document.body.classList.contains('mode-admin')) {
      alert('Mode Admin diaktifkan');
      document.getElementById('adminPassword').value = '';
    } else {
      alert('Mode User diaktifkan');
    }
  } else {
    alert('Password admin salah!');
  }
}

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', async () => {
  await fetchProducts();
  setupRealtime();
});
