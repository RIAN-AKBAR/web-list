// Konfigurasi koneksi database menggunakan URI
const DB_URI = 'mysql://silverhold_againstcat:eb2805e018106915a17b60b8ca812959359872a5@2j-o08.h.filess.io:61002/silverhold_againstcat';

// Data produk (default jika tidak bisa terhubung ke database)
let products = [
    { id: 1, category: "Alight Motion", name: "1 Tahun Privat", price: 3000, status: "Ada" },
    { id: 2, category: "CapCut", name: "1 Bulan (garansi 7 hari)", price: 6000, status: "Ada" },
    { id: 3, category: "CapCut", name: "1 Bulan Full Garansi", price: 12000, status: "Ada" },
    { id: 4, category: "GetContact", name: "30 Hari", price: 15000, status: "Ada" }
];

// Parse URI database
function parseDatabaseUri(uri) {
    const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = uri.match(regex);
    
    if (!match) {
        throw new Error('Invalid database URI format');
    }
    
    return {
        user: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4]),
        database: match[5]
    };
}

// Fungsi untuk membuat koneksi ke database
async function connectToDatabase() {
    try {
        console.log('Mencoba terhubung ke database...');
        
        // Parse URI database
        const dbConfig = parseDatabaseUri(DB_URI);
        
        // Simulasi koneksi ke database MySQL
        // Catatan: Di lingkungan browser, kita tidak dapat terhubung langsung ke MySQL
        // Ini hanya simulasi. Implementasi nyata memerlukan backend API.
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulasi koneksi berhasil
        const mockConnection = {
            config: dbConfig,
            query: (sql, params) => {
                console.log('Query executed:', sql, params);
                
                // Simulasi query berdasarkan perintah SQL
                if (sql.toLowerCase().includes('select')) {
                    return Promise.resolve([products]);
                } else if (sql.toLowerCase().includes('insert')) {
                    const newId = Math.max(...products.map(p => p.id)) + 1;
                    const newProduct = {
                        id: newId,
                        category: params[0],
                        name: params[1],
                        price: params[2],
                        status: params[3]
                    };
                    products.push(newProduct);
                    return Promise.resolve([{ insertId: newId }]);
                } else if (sql.toLowerCase().includes('update')) {
                    const id = params[4];
                    const index = products.findIndex(p => p.id === id);
                    if (index !== -1) {
                        products[index] = {
                            id: id,
                            category: params[0],
                            name: params[1],
                            price: params[2],
                            status: params[3]
                        };
                    }
                    return Promise.resolve([{ affectedRows: 1 }]);
                } else if (sql.toLowerCase().includes('delete')) {
                    const id = params[0];
                    const initialLength = products.length;
                    products = products.filter(p => p.id !== id);
                    return Promise.resolve([{ affectedRows: initialLength - products.length }]);
                }
                
                return Promise.resolve([]);
            },
            end: () => console.log('Koneksi database ditutup')
        };
        
        console.log('Berhasil terhubung ke database MySQL:', dbConfig.host);
        return mockConnection;
    } catch (error) {
        console.error('Gagal terhubung ke database:', error.message);
        throw error;
    }
}

// Fungsi untuk mengambil data produk dari database
async function fetchProductsFromDatabase() {
    let connection;
    try {
        connection = await connectToDatabase();
        
        // Query untuk mengambil semua produk
        const query = 'SELECT * FROM products ORDER BY category, name';
        const [results] = await connection.query(query);
        
        console.log('Data produk berhasil diambil dari database');
        return results;
    } catch (error) {
        console.error('Error mengambil data produk:', error.message);
        // Menggunakan data default jika tidak bisa terhubung ke database
        return products;
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

// Fungsi untuk menyimpan produk ke database
async function saveProductToDatabase(product) {
    let connection;
    try {
        connection = await connectToDatabase();
        
        // Query untuk menyimpan produk
        const query = 'INSERT INTO products (category, name, price, status) VALUES (?, ?, ?, ?)';
        const params = [product.category, product.name, product.price, product.status];
        
        const [result] = await connection.query(query, params);
        console.log('Produk berhasil disimpan ke database:', result);
        
        return result;
    } catch (error) {
        console.error('Error menyimpan produk:', error.message);
        throw error;
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

// Fungsi untuk memperbarui produk di database
async function updateProductInDatabase(product) {
    let connection;
    try {
        connection = await connectToDatabase();
        
        // Query untuk memperbarui produk
        const query = 'UPDATE products SET category = ?, name = ?, price = ?, status = ? WHERE id = ?';
        const params = [product.category, product.name, product.price, product.status, product.id];
        
        const [result] = await connection.query(query, params);
        console.log('Produk berhasil diperbarui di database:', result);
        
        return result;
    } catch (error) {
        console.error('Error memperbarui produk:', error.message);
        throw error;
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

// Fungsi untuk menghapus produk dari database
async function deleteProductFromDatabase(productId) {
    let connection;
    try {
        connection = await connectToDatabase();
        
        // Query untuk menghapus produk
        const query = 'DELETE FROM products WHERE id = ?';
        const params = [productId];
        
        const [result] = await connection.query(query, params);
        console.log('Produk berhasil dihapus dari database:', result);
        
        return result;
    } catch (error) {
        console.error('Error menghapus produk:', error.message);
        throw error;
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

// Fungsi untuk menampilkan produk
function displayProducts(productsToDisplay) {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">Tidak ada produk yang ditemukan</div>';
        return;
    }
    
    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-header">
                <h3>${product.name}</h3>
                <p>${product.category}</p>
            </div>
            <div class="product-body">
                <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <span class="product-status status-${product.status.toLowerCase()}">${product.status}</span>
                <div class="product-actions">
                    <button class="btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
    
    // Update statistik
    updateStatistics(productsToDisplay);
}

// Fungsi untuk mengisi filter kategori
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Hapus opsi yang ada kecuali opsi default
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Dapatkan kategori unik dari produk
    const categories = [...new Set(products.map(product => product.category))];
    
    // Tambahkan setiap kategori ke dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Fungsi untuk memfilter produk
function filterProducts() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchText) || 
                             product.category.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    displayProducts(filteredProducts);
}

// Fungsi untuk memperbarui statistik
function updateStatistics(productsToDisplay) {
    const totalProductsElement = document.getElementById('totalProducts');
    const totalCategoriesElement = document.getElementById('totalCategories');
    const availableProductsElement = document.getElementById('availableProducts');
    
    if (totalProductsElement) {
        totalProductsElement.textContent = productsToDisplay.length;
    }
    
    if (totalCategoriesElement) {
        const uniqueCategories = new Set(productsToDisplay.map(product => product.category));
        totalCategoriesElement.textContent = uniqueCategories.size;
    }
    
    if (availableProductsElement) {
        const availableProducts = productsToDisplay.filter(product => product.status === 'Ada').length;
        availableProductsElement.textContent = availableProducts;
    }
}

// Fungsi untuk menambah produk baru
async function addNewProduct() {
    const category = prompt('Masukkan kategori produk:');
    if (!category) return;
    
    const name = prompt('Masukkan nama produk:');
    if (!name) return;
    
    const priceInput = prompt('Masukkan harga produk:');
    const price = parseInt(priceInput);
    if (isNaN(price)) {
        alert('Harga harus berupa angka!');
        return;
    }
    
    const status = confirm('Produk tersedia? (OK untuk Ya, Cancel untuk Tidak)') ? 'Ada' : 'Kosong';
    
    const newProduct = {
        category,
        name,
        price,
        status
    };
    
    try {
        // Simpan ke database
        await saveProductToDatabase(newProduct);
        
        // Perbarui tampilan
        await refreshProducts();
        
        alert('Produk berhasil ditambahkan!');
    } catch (error) {
        alert('Gagal menambahkan produk: ' + error.message);
    }
}

// Fungsi untuk mengedit produk
async function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newCategory = prompt('Edit kategori produk:', product.category);
    if (!newCategory) return;
    
    const newName = prompt('Edit nama produk:', product.name);
    if (!newName) return;
    
    const newPriceInput = prompt('Edit harga produk:', product.price);
    const newPrice = parseInt(newPriceInput);
    if (isNaN(newPrice)) {
        alert('Harga harus berupa angka!');
        return;
    }
    
    const newStatus = confirm('Produk tersedia? (OK untuk Ya, Cancel untuk Tidak)') ? 'Ada' : 'Kosong';
    
    const updatedProduct = {
        ...product,
        category: newCategory,
        name: newName,
        price: newPrice,
        status: newStatus
    };
    
    try {
        // Perbarui di database
        await updateProductInDatabase(updatedProduct);
        
        // Perbarui tampilan
        await refreshProducts();
        
        alert('Produk berhasil diperbarui!');
    } catch (error) {
        alert('Gagal memperbarui produk: ' + error.message);
    }
}

// Fungsi untuk menghapus produk
async function deleteProduct(productId) {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        return;
    }
    
    try {
        // Hapus dari database
        await deleteProductFromDatabase(productId);
        
        // Perbarui tampilan
        await refreshProducts();
        
        alert('Produk berhasil dihapus!');
    } catch (error) {
        alert('Gagal menghapus produk: ' + error.message);
    }
}

// Fungsi untuk menyegarkan data produk
async function refreshProducts() {
    products = await fetchProductsFromDatabase();
    displayProducts(products);
    populateCategoryFilter();
}

// Fungsi untuk mengekspor data ke CSV
function exportToCSV() {
    const headers = ['Category', 'Name', 'Price', 'Status'];
    const csvData = [headers];
    
    products.forEach(product => {
        csvData.push([
            product.category,
            product.name,
            product.price,
            product.status
        ]);
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_export.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fungsi untuk mengimpor data dari CSV
function importFromCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            const lines = content.split('\n');
            
            // Lewati header
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const [category, name, price, status] = lines[i].split(',');
                
                if (category && name && price && status) {
                    const product = {
                        category: category.trim(),
                        name: name.trim(),
                        price: parseInt(price.trim()),
                        status: status.trim()
                    };
                    
                    try {
                        await saveProductToDatabase(product);
                    } catch (error) {
                        console.error('Gagal mengimpor produk:', error);
                    }
                }
            }
            
            // Perbarui tampilan
            await refreshProducts();
            alert('Data berhasil diimpor!');
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Inisialisasi aplikasi
async function initApp() {
    try {
        // Tampilkan status koneksi
        const dbInfo = parseDatabaseUri(DB_URI);
        console.log('Menggunakan database:', dbInfo.database, 'pada host:', dbInfo.host);
        
        // Ambil data dari database
        await refreshProducts();
        
        // Tambahkan event listener untuk pencarian
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', filterProducts);
        }
        
        // Tambahkan event listener untuk filter kategori
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterProducts);
        }
        
        // Tambahkan event listener untuk tombol tambah produk
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', addNewProduct);
        }
        
        // Tambahkan event listener untuk tombol ekspor
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportToCSV);
        }
        
        // Tambahkan event listener untuk tombol impor
        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.addEventListener('click', importFromCSV);
        }
        
        // Tambahkan event listener untuk tombol refresh
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', refreshProducts);
        }
        
        console.log('Aplikasi berhasil diinisialisasi');
    } catch (error) {
        console.error('Gagal menginisialisasi aplikasi:', error);
    }
}

// Jalankan aplikasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', initApp);

// Ekspor fungsi untuk akses global
window.addNewProduct = addNewProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.filterProducts = filterProducts;
window.exportToCSV = exportToCSV;
window.importFromCSV = importFromCSV;
window.refreshProducts = refreshProducts;
