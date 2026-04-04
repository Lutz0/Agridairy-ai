CREATE DATABASE IF NOT EXISTS cattle_monitoring;
USE cattle_monitoring;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('farmer', 'buyer', 'admin') DEFAULT 'farmer',
    paymentStatus ENUM('paid', 'unpaid') DEFAULT 'unpaid',
    mpesaCheckoutId VARCHAR(100),
    phone VARCHAR(20),
    profile_pic VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cattle Table
CREATE TABLE IF NOT EXISTS cattle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tagId VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    breed VARCHAR(100),
    age INT,
    weight DECIMAL(10,2),
    healthStatus ENUM('healthy', 'sick', 'critical', 'recovering') DEFAULT 'healthy',
    location VARCHAR(100),
    temperature DECIMAL(5,2),
    heartRate INT,
    activity ENUM('grazing', 'resting', 'moving', 'feeding') DEFAULT 'grazing',
    milkProduction DECIMAL(10,2) DEFAULT 0.00,
    aiHealthRisk DECIMAL(3,2) DEFAULT 0.00,
    aiBehaviorPattern VARCHAR(50),
    farmerId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmerId) REFERENCES users(id) ON DELETE SET NULL
);

-- Milk Records Table
CREATE TABLE IF NOT EXISTS milk_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cattleId INT,
    tagId VARCHAR(50),
    quantity DECIMAL(10,2),
    quality ENUM('excellent', 'good', 'fair', 'poor'),
    temperature DECIMAL(5,2),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(100),
    FOREIGN KEY (cattleId) REFERENCES cattle(id) ON DELETE CASCADE
);

-- Marketplace Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmerId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('milk', 'cream', 'butter', 'ghee', 'mozzarella', 'feta', 'parmesan', 'cottage cheese') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantityInStock INT NOT NULL DEFAULT 0,
    description TEXT,
    imageUrl VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY farmer_product_type (farmerId, type),
    FOREIGN KEY (farmerId) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    buyerId INT NOT NULL,
    totalAmount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('mpesa', 'card', 'cash') DEFAULT 'mpesa',
    mpesaCheckoutId VARCHAR(100),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyerId) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Health History Table (Vet visits, vaccinations)
CREATE TABLE IF NOT EXISTS health_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cattleId INT NOT NULL,
    tagId VARCHAR(50) NOT NULL,
    recordType ENUM('vet_visit', 'vaccination', 'treatment', 'checkup', 'weight_check') NOT NULL,
    description TEXT,
    weight DECIMAL(10,2),
    cost DECIMAL(10,2) DEFAULT 0.00,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    nextFollowUp DATETIME,
    FOREIGN KEY (cattleId) REFERENCES cattle(id) ON DELETE CASCADE
);
