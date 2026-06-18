const pool = require("../db/mysql");

async function findAll() {
  const [rows] = await pool.query(`
    SELECT
      id,
      borrowing_id,
      amount,
      status,
      paid_at
    FROM fines
    ORDER BY id DESC
  `);

  return rows.map(mapFine);
}

async function findById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      borrowing_id,
      amount,
      status,
      paid_at
    FROM fines
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows.length > 0
    ? mapFine(rows[0])
    : null;
}

async function findByBorrowingId(borrowingId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      borrowing_id,
      amount,
      status,
      paid_at
    FROM fines
    WHERE borrowing_id = ?
    LIMIT 1
    `,
    [borrowingId]
  );

  return rows.length > 0
    ? mapFine(rows[0])
    : null;
}

async function findByStatus(status) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      borrowing_id,
      amount,
      status,
      paid_at
    FROM fines
    WHERE status = ?
    ORDER BY id DESC
    `,
    [status]
  );

  return rows.map(mapFine);
}

async function create({
  borrowingId,
  amount,
  status,
}) {
  try {
    const [result] = await pool.query(
      `
      INSERT INTO fines (
        borrowing_id,
        amount,
        status
      )
      VALUES (?, ?, ?)
      `,
      [
        borrowingId,
        amount,
        status,
      ]
    );

    return await findById(result.insertId);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new Error(
        "Fine for this borrowing already exists"
      );
    }

    throw err;
  }
}

async function markAsPaid(
  fineId,
  {
    paidAt,
    status,
  }
) {
  await pool.query(
    `
    UPDATE fines
    SET
      paid_at = ?,
      status = ?
    WHERE id = ?
    `,
    [
      paidAt,
      status,
      fineId,
    ]
  );

  return await findById(fineId);
}

function mapFine(row) {
  return {
    id: row.id,

    borrowingId: row.borrowing_id,

    amount: row.amount,

    status: row.status,

    paidAt: row.paid_at,
  };
}

module.exports = {
  findAll,
  findById,

  findByBorrowingId,
  findByStatus,

  create,

  markAsPaid,
};