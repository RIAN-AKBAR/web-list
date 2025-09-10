import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseSetup {
    private static final String DB_URI = "jdbc:mysql://2j-o08.h.filess.io:61002/";
    private static final String USER = "silverhold_againstcat";
    private static final String PASSWORD = "eb2805e018106915a17b60b8ca812959359872a5";
    private static final String DATABASE_NAME = "silverhold_againstcat";

    public static void main(String[] args) {
        Connection conn = null;
        Statement stmt = null;
        
        try {
            // Load driver MySQL
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            // Koneksi ke server MySQL (tanpa memilih database tertentu)
            conn = DriverManager.getConnection(DB_URI, USER, PASSWORD);
            
            // Buat statement
            stmt = conn.createStatement();
            
            // Buat database jika belum ada
            String createDbSQL = "CREATE DATABASE IF NOT EXISTS " + DATABASE_NAME;
            stmt.executeUpdate(createDbSQL);
            System.out.println("Database '" + DATABASE_NAME + "' berhasil dibuat atau sudah ada.");
            
            // Gunakan database
            String useDbSQL = "USE " + DATABASE_NAME;
            stmt.executeUpdate(useDbSQL);
            System.out.println("Menggunakan database '" + DATABASE_NAME + "'.");
            
            // Buat tabel products
            String createTableSQL = "CREATE TABLE IF NOT EXISTS products (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "category VARCHAR(100) NOT NULL, " +
                "name VARCHAR(255) NOT NULL, " +
                "price INT NOT NULL, " +
                "status ENUM('Ada', 'Kosong') DEFAULT 'Ada', " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")";
            stmt.executeUpdate(createTableSQL);
            System.out.println("Tabel 'products' berhasil dibuat atau sudah ada.");
            
            // Masukkan data default jika tabel kosong
            String checkDataSQL = "SELECT COUNT(*) AS count FROM products";
            var rs = stmt.executeQuery(checkDataSQL);
            rs.next();
            int rowCount = rs.getInt("count");
            
            if (rowCount == 0) {
                String insertDataSQL = "INSERT INTO products (category, name, price, status) VALUES " +
                    "('Alight Motion', '1 Tahun Privat', 3000, 'Ada'), " +
                    "('CapCut', '1 Bulan (garansi 7 hari)', 6000, 'Ada'), " +
                    "('CapCut', '1 Bulan Full Garansi', 12000, 'Ada'), " +
                    "('GetContact', '30 Hari', 15000, 'Ada')";
                stmt.executeUpdate(insertDataSQL);
                System.out.println("Data default berhasil dimasukkan.");
            } else {
                System.out.println("Tabel sudah berisi data. Tidak perlu memasukkan data default.");
            }
            
            System.out.println("Setup database selesai dengan sukses!");
            
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL JDBC Driver tidak ditemukan.");
            e.printStackTrace();
        } catch (SQLException e) {
            System.err.println("Error menghubungkan ke database: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Tutup resources
            try {
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
