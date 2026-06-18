-- =====================================================
-- Mini Library System
-- GraphQL + Docker + MySQL
-- =====================================================

CREATE DATABASE IF NOT EXISTS library_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE library_db;

-- =====================================================
-- CATEGORY
-- =====================================================

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- =====================================================
-- BOOK
-- =====================================================

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,

    isbn VARCHAR(20) UNIQUE NULL,

    title VARCHAR(255) NOT NULL,

    authors JSON NULL,

    cover_image TEXT NULL,

    stock INT NOT NULL DEFAULT 0,

    category_id INT NOT NULL,

    CONSTRAINT fk_books_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- =====================================================
-- MEMBER
-- =====================================================

CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    phone_number VARCHAR(30) NOT NULL UNIQUE
);

-- =====================================================
-- BORROWING
-- =====================================================

CREATE TABLE borrowings (
    id INT AUTO_INCREMENT PRIMARY KEY,

    member_id INT NOT NULL,

    book_id INT NOT NULL,

    borrow_date DATETIME NOT NULL,

    due_date DATETIME NOT NULL,

    return_date DATETIME NULL,

    status ENUM(
        'BORROWED',
        'RETURNED'
    ) NOT NULL DEFAULT 'BORROWED',

    CONSTRAINT fk_borrowings_member
        FOREIGN KEY (member_id)
        REFERENCES members(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_borrowings_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- =====================================================
-- FINE
-- =====================================================

CREATE TABLE fines (
    id INT AUTO_INCREMENT PRIMARY KEY,

    borrowing_id INT NOT NULL UNIQUE,

    amount INT NOT NULL,

    status ENUM(
        'UNPAID',
        'PAID'
    ) NOT NULL DEFAULT 'UNPAID',

    paid_at DATETIME NULL,

    CONSTRAINT fk_fines_borrowing
        FOREIGN KEY (borrowing_id)
        REFERENCES borrowings(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_books_title
ON books(title);

CREATE INDEX idx_books_category
ON books(category_id);

CREATE INDEX idx_borrowings_member
ON borrowings(member_id);

CREATE INDEX idx_borrowings_book
ON borrowings(book_id);

CREATE INDEX idx_borrowings_status
ON borrowings(status);

CREATE INDEX idx_fines_status
ON fines(status);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

INSERT INTO categories (name)
VALUES
('Novel'),
('Teknologi'),
('Pendidikan');

INSERT INTO books (
    isbn,
    title,
    authors,
    cover_image,
    stock,
    category_id
)
VALUES
(
    '9780132350884',
    'Clean Code',
    JSON_ARRAY('Robert C. Martin'),
    NULL,
    5,
    2
),
(
    '9780201616224',
    'The Pragmatic Programmer',
    JSON_ARRAY('Andrew Hunt', 'David Thomas'),
    NULL,
    3,
    2
),
(
    '9786020324781',
    'Laskar Pelangi',
    JSON_ARRAY('Andrea Hirata'),
    NULL,
    4,
    1
);

INSERT INTO members (
    name,
    phone_number
)
VALUES
(
    'Budi',
    '081234567890'
),
(
    'Siti',
    '081298765432'
);
