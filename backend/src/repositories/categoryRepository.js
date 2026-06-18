const pool = require("../db/mysql");

async function findAll() {
  const [rows] = await pool.query(`
    SELECT
      id,
      name
    FROM categories
    ORDER BY name ASC
  `);

  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name
    FROM categories
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function findByName(name) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name
    FROM categories
    WHERE name = ?
    LIMIT 1
    `,
    [name]
  );

  return rows[0] || null;
}

async function create({ name }) {
  const [result] = await pool.query(
    `
    INSERT INTO categories (name)
    VALUES (?)
    `,
    [name]
  );

  return await findById(result.insertId);
}

async function deleteCategory(id) {
  const [result] = await pool.query(
    `
    DELETE FROM categories
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  delete: deleteCategory,
};