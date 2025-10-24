-- ...existing code...
DROP TABLE IF EXISTS library;
CREATE TABLE library (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_small TEXT,
  image_normal TEXT,
  image_large TEXT,
  image_png TEXT,
  set_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name_setname (name(100), set_name(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ...existing code...