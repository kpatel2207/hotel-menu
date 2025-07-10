-- Admin table
CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Menu table
CREATE TABLE IF NOT EXISTS menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  category VARCHAR(50),
  veg BOOLEAN DEFAULT TRUE,
  spicy_level INT DEFAULT 0
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_number INT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  order_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  menu_id INT,
  quantity INT,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_id) REFERENCES menu(id)
); 

INSERT INTO menu (name, description, price, category, veg, spicy_level) VALUES
('Paneer Tikka', 'Grilled cottage cheese with spices and herbs', 180.00, 'starters', TRUE, 2),
('Chicken 65', 'Spicy deep-fried chicken with curry leaves', 220.00, 'starters', FALSE, 3),
('Dal Makhani', 'Slow-cooked black lentils with cream and butter', 120.00, 'main', TRUE, 1),
('Chicken Biryani', 'Aromatic rice with tender chicken and spices', 220.00, 'main', FALSE, 2),
('Butter Naan', 'Soft leavened bread brushed with butter', 40.00, 'breads', TRUE, 0),
('Gulab Jamun', 'Sweet milk dumplings in sugar syrup', 80.00, 'desserts', TRUE, 0),
('Lassi', 'Sweet yogurt-based drink', 60.00, 'beverages', TRUE, 0);
