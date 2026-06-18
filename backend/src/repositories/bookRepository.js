const pool = require("../db/mysql");

async function findAll(filters = {}) {
  const { categoryId, title } = filters;

  let sql = `
    SELECT
      id,
      isbn,
      title,
      authors,
      cover_image,
      stock,
      category_id
    FROM books
  `;

  const conditions = [];
  const params = [];

  if (categoryId) {
    conditions.push("category_id = ?");
    params.push(categoryId);
  }

  if (title) {
    conditions.push("title LIKE ?");
    params.push(`%${title}%`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  sql += " ORDER BY title ASC";

  const [rows] = await pool.query(sql, params);

  return rows.map(mapBook);
}

async function findById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      isbn,
      title,
      authors,
      cover_image,
      stock,
      category_id
    FROM books
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows.length > 0
    ? mapBook(rows[0])
    : null;
}

async function findByISBN(isbn) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      isbn,
      title,
      authors,
      cover_image,
      stock,
      category_id
    FROM books
    WHERE isbn = ?
    LIMIT 1
    `,
    [isbn]
  );

  return rows.length > 0
    ? mapBook(rows[0])
    : null;
}

async function findByCategoryId(categoryId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      isbn,
      title,
      authors,
      cover_image,
      stock,
      category_id
    FROM books
    WHERE category_id = ?
    ORDER BY title ASC
    `,
    [categoryId]
  );

  return rows.map(mapBook);
}

async function create({
  isbn,
  title,
  authors,
  coverImage,
  stock,
  categoryId,
}) {
  try {
    const [result] = await pool.query(
      `
      INSERT INTO books (
        isbn,
        title,
        authors,
        cover_image,
        stock,
        category_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        isbn ?? null,
        title,
        JSON.stringify(authors || []),
        coverImage ?? null,
        stock,
        categoryId,
      ]
    );

    return await findById(result.insertId);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new Error(
        "Book with this ISBN already exists"
      );
    }

    throw err;
  }
}

async function updateStock(id, stock) {
  await pool.query(
    `
    UPDATE books
    SET stock = ?
    WHERE id = ?
    `,
    [stock, id]
  );

  return await findById(id);
}

async function deleteBook(id) {
  const [result] = await pool.query(
    `
    DELETE FROM books
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
}

function mapBook(row) {
  return {
    id: row.id,
    isbn: row.isbn,
    title: row.title,

    authors: row.authors
      ? typeof row.authors === "string"
        ? JSON.parse(row.authors)
        : row.authors
      : [],

    coverImage: row.cover_image,

    stock: row.stock,

    categoryId: row.category_id,
  };
}

module.exports = {
  findAll,
  findById,
  findByISBN,
  findByCategoryId,
  create,
  updateStock,
  delete: deleteBook,
};