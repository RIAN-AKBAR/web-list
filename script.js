import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.Set;
import java.util.HashSet;
import java.io.Console;

public class ProductManager {
    // Konfigurasi koneksi database
    private static final String DB_URI = "mysql://silverhold_againstcat:eb2805e018106915a17b60b8ca812959359872a5@2j-o08.h.filess.io:61002/silverhold_againstcat";
    
    // Data produk default
    private static List<Product> products = new ArrayList<>();
    
    static {
        // Inisialisasi data produk default
        products.add(new Product(1, "Alight Motion", "1 Tahun Privat", 3000, "Ada"));
        products.add(new Product(2, "CapCut", "1 Bulan (garansi 7 hari)", 6000, "Ada"));
        products.add(new Product(3, "CapCut", "1 Bulan Full Garansi", 12000, "Ada"));
        products.add(new Product(4, "GetContact", "30 Hari", 15000, "Ada"));
    }
    
    // Kelas untuk merepresentasikan produk
    static class Product {
        private int id;
        private String category;
        private String name;
        private int price;
        private String status;
        
        public Product(int id, String category, String name, int price, String status) {
            this.id = id;
            this.category = category;
            this.name = name;
            this.price = price;
            this.status = status;
        }
        
        // Getter dan setter
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public int getPrice() { return price; }
        public void setPrice(int price) { this.price = price; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        @Override
        public String toString() {
            return String.format("ID: %d, Category: %s, Name: %s, Price: %d, Status: %s", 
                               id, category, name, price, status);
        }
    }
    
    // Parse URI database
    public static DatabaseConfig parseDatabaseUri(String uri) {
        // Format: mysql://user:password@host:port/database
        String[] parts = uri.split("://|:|@|/");
        
        if (parts.length < 7) {
            throw new Error("Invalid database URI format");
        }
        
        return new DatabaseConfig(
            parts[3], // host
            parts[6], // database
            parts[4], // port
            parts[1], // username
            parts[2]  // password
        );
    }
    
    // Kelas untuk konfigurasi database
    static class DatabaseConfig {
        private String host;
        private String database;
        private String port;
        private String username;
        private String password;
        
        public DatabaseConfig(String host, String database, String port, String username, String password) {
            this.host = host;
            this.database = database;
            this.port = port;
            this.username = username;
            this.password = password;
        }
        
        // Getter
        public String getHost() { return host; }
        public String getDatabase() { return database; }
        public String getPort() { return port; }
        public String getUsername() { return username; }
        public String getPassword() { return password; }
    }
    
    // Fungsi untuk membuat koneksi ke database
    public static Connection connectToDatabase() throws SQLException, ClassNotFoundException {
        System.out.println("Mencoba terhubung ke database...");
        
        // Parse URI database
        DatabaseConfig dbConfig = parseDatabaseUri(DB_URI);
        
        // Load driver MySQL
        Class.forName("com.mysql.cj.jdbc.Driver");
        
        // Buat URL koneksi
        String url = "jdbc:mysql://" + dbConfig.getHost() + ":" + dbConfig.getPort() + "/" + dbConfig.getDatabase();
        
        // Buat koneksi
        Connection conn = DriverManager.getConnection(url, dbConfig.getUsername(), dbConfig.getPassword());
        
        System.out.println("Berhasil terhubung ke database MySQL: " + dbConfig.getHost());
        return conn;
    }
    
    // Fungsi untuk mengambil data produk dari database
    public static List<Product> fetchProductsFromDatabase() {
        List<Product> productList = new ArrayList<>();
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = connectToDatabase();
            stmt = conn.createStatement();
            
            // Query untuk mengambil semua produk
            String query = "SELECT * FROM products ORDER BY category, name";
            rs = stmt.executeQuery(query);
            
            // Proses hasil query
            while (rs.next()) {
                Product product = new Product(
                    rs.getInt("id"),
                    rs.getString("category"),
                    rs.getString("name"),
                    rs.getInt("price"),
                    rs.getString("status")
                );
                productList.add(product);
            }
            
            System.out.println("Data produk berhasil diambil dari database");
        } catch (Exception e) {
            System.out.println("Error mengambil data produk: " + e.getMessage());
            // Menggunakan data default jika tidak bisa terhubung ke database
            productList = products;
        } finally {
            // Tutup resources
            try { if (rs != null) rs.close(); } catch (SQLException e) {}
            try { if (stmt != null) stmt.close(); } catch (SQLException e) {}
            try { if (conn != null) conn.close(); } catch (SQLException e) {}
        }
        
        return productList;
    }
    
    // Fungsi untuk menyimpan produk ke database
    public static int saveProductToDatabase(Product product) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        int result = 0;
        
        try {
            conn = connectToDatabase();
            
            // Query untuk menyimpan produk
            String query = "INSERT INTO products (category, name, price, status) VALUES (?, ?, ?, ?)";
            pstmt = conn.prepareStatement(query);
            pstmt.setString(1, product.getCategory());
            pstmt.setString(2, product.getName());
            pstmt.setInt(3, product.getPrice());
            pstmt.setString(4, product.getStatus());
            
            result = pstmt.executeUpdate();
            System.out.println("Produk berhasil disimpan ke database: " + result + " baris terpengaruh");
        } catch (Exception e) {
            System.out.println("Error menyimpan produk: " + e.getMessage());
        } finally {
            // Tutup resources
            try { if (pstmt != null) pstmt.close(); } catch (SQLException e) {}
            try { if (conn != null) conn.close(); } catch (SQLException e) {}
        }
        
        return result;
    }
    
    // Fungsi untuk memperbarui produk di database
    public static int updateProductInDatabase(Product product) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        int result = 0;
        
        try {
            conn = connectToDatabase();
            
            // Query untuk memperbarui produk
            String query = "UPDATE products SET category = ?, name = ?, price = ?, status = ? WHERE id = ?";
            pstmt = conn.prepareStatement(query);
            pstmt.setString(1, product.getCategory());
            pstmt.setString(2, product.getName());
            pstmt.setInt(3, product.getPrice());
            pstmt.setString(4, product.getStatus());
            pstmt.setInt(5, product.getId());
            
            result = pstmt.executeUpdate();
            System.out.println("Produk berhasil diperbarui di database: " + result + " baris terpengaruh");
        } catch (Exception e) {
            System.out.println("Error memperbarui produk: " + e.getMessage());
        } finally {
            // Tutup resources
            try { if (pstmt != null) pstmt.close(); } catch (SQLException e) {}
            try { if (conn != null) conn.close(); } catch (SQLException e) {}
        }
        
        return result;
    }
    
    // Fungsi untuk menghapus produk dari database
    public static int deleteProductFromDatabase(int productId) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        int result = 0;
        
        try {
            conn = connectToDatabase();
            
            // Query untuk menghapus produk
            String query = "DELETE FROM products WHERE id = ?";
            pstmt = conn.prepareStatement(query);
            pstmt.setInt(1, productId);
            
            result = pstmt.executeUpdate();
            System.out.println("Produk berhasil dihapus dari database: " + result + " baris terpengaruh");
        } catch (Exception e) {
            System.out.println("Error menghapus produk: " + e.getMessage());
        } finally {
            // Tutup resources
            try { if (pstmt != null) pstmt.close(); } catch (SQLException e) {}
            try { if (conn != null) conn.close(); } catch (SQLException e) {}
        }
        
        return result;
    }
    
    // Fungsi untuk menampilkan produk
    public static void displayProducts(List<Product> productsToDisplay) {
        if (productsToDisplay.isEmpty()) {
            System.out.println("Tidak ada produk yang ditemukan");
            return;
        }
        
        for (Product product : productsToDisplay) {
            System.out.println(product);
        }
        
        // Update statistik
        updateStatistics(productsToDisplay);
    }
    
    // Fungsi untuk memfilter produk
    public static List<Product> filterProducts(List<Product> productList, String searchText, String selectedCategory) {
        List<Product> filteredProducts = new ArrayList<>();
        
        for (Product product : productList) {
            boolean matchesSearch = product.getName().toLowerCase().contains(searchText.toLowerCase()) || 
                                   product.getCategory().toLowerCase().contains(searchText.toLowerCase());
            boolean matchesCategory = selectedCategory.isEmpty() || product.getCategory().equals(selectedCategory);
            
            if (matchesSearch && matchesCategory) {
                filteredProducts.add(product);
            }
        }
        
        return filteredProducts;
    }
    
    // Fungsi untuk memperbarui statistik
    public static void updateStatistics(List<Product> productsToDisplay) {
        int totalProducts = productsToDisplay.size();
        
        Set<String> uniqueCategories = new HashSet<>();
        int availableProducts = 0;
        
        for (Product product : productsToDisplay) {
            uniqueCategories.add(product.getCategory());
            if ("Ada".equals(product.getStatus())) {
                availableProducts++;
            }
        }
        
        System.out.println("\n--- STATISTIK ---");
        System.out.println("Total Produk: " + totalProducts);
        System.out.println("Total Kategori: " + uniqueCategories.size());
        System.out.println("Produk Tersedia: " + availableProducts);
        System.out.println("-----------------\n");
    }
    
    // Fungsi untuk menambah produk baru
    public static void addNewProduct(Scanner scanner) {
        System.out.print("Masukkan kategori produk: ");
        String category = scanner.nextLine();
        if (category.isEmpty()) return;
        
        System.out.print("Masukkan nama produk: ");
        String name = scanner.nextLine();
        if (name.isEmpty()) return;
        
        System.out.print("Masukkan harga produk: ");
        String priceInput = scanner.nextLine();
        int price;
        try {
            price = Integer.parseInt(priceInput);
        } catch (NumberFormatException e) {
            System.out.println("Harga harus berupa angka!");
            return;
        }
        
        System.out.print("Produk tersedia? (y/n): ");
        String statusInput = scanner.nextLine();
        String status = "y".equalsIgnoreCase(statusInput) ? "Ada" : "Kosong";
        
        Product newProduct = new Product(0, category, name, price, status);
        
        try {
            // Simpan ke database
            int result = saveProductToDatabase(newProduct);
            
            if (result > 0) {
                System.out.println("Produk berhasil ditambahkan!");
            } else {
                System.out.println("Gagal menambahkan produk!");
            }
        } catch (Exception e) {
            System.out.println("Gagal menambahkan produk: " + e.getMessage());
        }
    }
    
    // Fungsi untuk mengedit produk
    public static void editProduct(Scanner scanner, List<Product> productList) {
        System.out.print("Masukkan ID produk yang akan diedit: ");
        String idInput = scanner.nextLine();
        int productId;
        try {
            productId = Integer.parseInt(idInput);
        } catch (NumberFormatException e) {
            System.out.println("ID harus berupa angka!");
            return;
        }
        
        Product productToEdit = null;
        for (Product product : productList) {
            if (product.getId() == productId) {
                productToEdit = product;
                break;
            }
        }
        
        if (productToEdit == null) {
            System.out.println("Produk dengan ID " + productId + " tidak ditemukan!");
            return;
        }
        
        System.out.print("Edit kategori produk (" + productToEdit.getCategory() + "): ");
        String newCategory = scanner.nextLine();
        if (newCategory.isEmpty()) newCategory = productToEdit.getCategory();
        
        System.out.print("Edit nama produk (" + productToEdit.getName() + "): ");
        String newName = scanner.nextLine();
        if (newName.isEmpty()) newName = productToEdit.getName();
        
        System.out.print("Edit harga produk (" + productToEdit.getPrice() + "): ");
        String newPriceInput = scanner.nextLine();
        int newPrice;
        if (newPriceInput.isEmpty()) {
            newPrice = productToEdit.getPrice();
        } else {
            try {
                newPrice = Integer.parseInt(newPriceInput);
            } catch (NumberFormatException e) {
                System.out.println("Harga harus berupa angka!");
                return;
            }
        }
        
        System.out.print("Produk tersedia? (y/n) [" + productToEdit.getStatus() + "]: ");
        String newStatusInput = scanner.nextLine();
        String newStatus;
        if (newStatusInput.isEmpty()) {
            newStatus = productToEdit.getStatus();
        } else {
            newStatus = "y".equalsIgnoreCase(newStatusInput) ? "Ada" : "Kosong";
        }
        
        Product updatedProduct = new Product(
            productToEdit.getId(),
            newCategory,
            newName,
            newPrice,
            newStatus
        );
        
        try {
            // Perbarui di database
            int result = updateProductInDatabase(updatedProduct);
            
            if (result > 0) {
                System.out.println("Produk berhasil diperbarui!");
            } else {
                System.out.println("Gagal memperbarui produk!");
            }
        } catch (Exception e) {
            System.out.println("Gagal memperbarui produk: " + e.getMessage());
        }
    }
    
    // Fungsi untuk menghapus produk
    public static void deleteProduct(Scanner scanner, List<Product> productList) {
        System.out.print("Masukkan ID produk yang akan dihapus: ");
        String idInput = scanner.nextLine();
        int productId;
        try {
            productId = Integer.parseInt(idInput);
        } catch (NumberFormatException e) {
            System.out.println("ID harus berupa angka!");
            return;
        }
        
        System.out.print("Apakah Anda yakin ingin menghapus produk ini? (y/n): ");
        String confirm = scanner.nextLine();
        if (!"y".equalsIgnoreCase(confirm)) {
            return;
        }
        
        try {
            // Hapus dari database
            int result = deleteProductFromDatabase(productId);
            
            if (result > 0) {
                System.out.println("Produk berhasil dihapus!");
            } else {
                System.out.println("Gagal menghapus produk!");
            }
        } catch (Exception e) {
            System.out.println("Gagal menghapus produk: " + e.getMessage());
        }
    }
    
    // Fungsi untuk menyegarkan data produk
    public static List<Product> refreshProducts() {
        List<Product> updatedProducts = fetchProductsFromDatabase();
        displayProducts(updatedProducts);
        return updatedProducts;
    }
    
    // Fungsi untuk mengekspor data ke CSV
    public static void exportToCSV(List<Product> productList) {
        System.out.println("Category,Name,Price,Status");
        for (Product product : productList) {
            System.out.println(product.getCategory() + "," + 
                             product.getName() + "," + 
                             product.getPrice() + "," + 
                             product.getStatus());
        }
        System.out.println("\nData telah diekspor dalam format CSV");
    }
    
    // Inisialisasi aplikasi
    public static void initApp() {
        try {
            // Tampilkan status koneksi
            DatabaseConfig dbInfo = parseDatabaseUri(DB_URI);
            System.out.println("Menggunakan database: " + dbInfo.getDatabase() + " pada host: " + dbInfo.getHost());
            
            Scanner scanner = new Scanner(System.in);
            List<Product> currentProducts = refreshProducts();
            
            boolean running = true;
            while (running) {
                System.out.println("\n=== MENU MANAJEMEN PRODUK ===");
                System.out.println("1. Tampilkan Semua Produk");
                System.out.println("2. Cari Produk");
                System.out.println("3. Filter Berdasarkan Kategori");
                System.out.println("4. Tambah Produk");
                System.out.println("5. Edit Produk");
                System.out.println("6. Hapus Produk");
                System.out.println("7. Ekspor ke CSV");
                System.out.println("8. Segarkan Data");
                System.out.println("0. Keluar");
                System.out.print("Pilihan: ");
                
                String choice = scanner.nextLine();
                
                switch (choice) {
                    case "1":
                        displayProducts(currentProducts);
                        break;
                    case "2":
                        System.out.print("Masukkan kata kunci pencarian: ");
                        String searchText = scanner.nextLine();
                        List<Product> searchResults = filterProducts(currentProducts, searchText, "");
                        displayProducts(searchResults);
                        break;
                    case "3":
                        System.out.print("Masukkan kategori untuk filter: ");
                        String category = scanner.nextLine();
                        List<Product> categoryResults = filterProducts(currentProducts, "", category);
                        displayProducts(categoryResults);
                        break;
                    case "4":
                        addNewProduct(scanner);
                        currentProducts = refreshProducts();
                        break;
                    case "5":
                        editProduct(scanner, currentProducts);
                        currentProducts = refreshProducts();
                        break;
                    case "6":
                        deleteProduct(scanner, currentProducts);
                        currentProducts = refreshProducts();
                        break;
                    case "7":
                        exportToCSV(currentProducts);
                        break;
                    case "8":
                        currentProducts = refreshProducts();
                        break;
                    case "0":
                        running = false;
                        System.out.println("Terima kasih telah menggunakan aplikasi!");
                        break;
                    default:
                        System.out.println("Pilihan tidak valid!");
                }
            }
            
            scanner.close();
        } catch (Exception e) {
            System.out.println("Gagal menginisialisasi aplikasi: " + e.getMessage());
        }
    }
    
    // Metode utama
    public static void main(String[] args) {
        initApp();
    }
}

// Kelas untuk konfigurasi database
class DatabaseConfig {
    private String host;
    private String database;
    private String port;
    private String username;
    private String password;
    
    public DatabaseConfig(String host, String database, String port, String username, String password) {
        this.host = host;
        this.database = database;
        this.port = port;
        this.username = username;
        this.password = password;
    }
    
    // Getter
    public String getHost() { return host; }
    public String getDatabase() { return database; }
    public String getPort() { return port; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
}
