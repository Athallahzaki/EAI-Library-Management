const pool = require("../db/mysql");

async function findAll() {
  const [rows] = await pool.query(`
    SELECT
      id,
      name,
      phone_number
    FROM members
    ORDER BY name ASC
  `);

  return rows.map(mapMember);
}

async function findById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      phone_number
    FROM members
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows.length > 0
    ? mapMember(rows[0])
    : null;
}

async function findByPhoneNumber(phoneNumber) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      phone_number
    FROM members
    WHERE phone_number = ?
    LIMIT 1
    `,
    [phoneNumber]
  );

  return rows.length > 0
    ? mapMember(rows[0])
    : null;
}

async function create({ name, phoneNumber }) {
  const [result] = await pool.query(
    `
    INSERT INTO members (
      name,
      phone_number
    )
    VALUES (?, ?)
    `,
    [name, phoneNumber]
  );

  return await findById(result.insertId);
}

async function deleteMember(id) {
  const [result] = await pool.query(
    `
    DELETE FROM members
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
}

function mapMember(row) {
  return {
    id: row.id,
    name: row.name,
    phoneNumber: row.phone_number,
  };
}

module.exports = {
  findAll,
  findById,
  findByPhoneNumber,
  create,
  delete: deleteMember,
};