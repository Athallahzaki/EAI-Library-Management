const pool = require("../db/mysql");

async function findAll() {
  const [rows] = await pool.query(`
    SELECT
      id,
      member_id,
      book_id,
      borrow_date,
      due_date,
      return_date,
      status
    FROM borrowings
    ORDER BY borrow_date DESC
  `);

  return rows.map(mapBorrowing);
}

async function findById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      member_id,
      book_id,
      borrow_date,
      due_date,
      return_date,
      status
    FROM borrowings
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows.length > 0
    ? mapBorrowing(rows[0])
    : null;
}

async function create({
  memberId,
  bookId,
  borrowDate,
  dueDate,
  status,
}) {
  const [result] = await pool.query(
    `
    INSERT INTO borrowings (
      member_id,
      book_id,
      borrow_date,
      due_date,
      status
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      memberId,
      bookId,
      borrowDate,
      dueDate,
      status,
    ]
  );

  return await findById(result.insertId);
}

async function returnBook(
  borrowingId,
  {
    returnDate,
    status,
  }
) {
  await pool.query(
    `
    UPDATE borrowings
    SET
      return_date = ?,
      status = ?
    WHERE id = ?
    `,
    [
      returnDate,
      status,
      borrowingId,
    ]
  );

  return await findById(borrowingId);
}

async function findByBookId(bookId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      member_id,
      book_id,
      borrow_date,
      due_date,
      return_date,
      status
    FROM borrowings
    WHERE book_id = ?
    ORDER BY borrow_date DESC
    `,
    [bookId]
  );

  return rows.map(mapBorrowing);
}

async function findByMemberId(memberId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      member_id,
      book_id,
      borrow_date,
      due_date,
      return_date,
      status
    FROM borrowings
    WHERE member_id = ?
    ORDER BY borrow_date DESC
    `,
    [memberId]
  );

  return rows.map(mapBorrowing);
}

async function countActiveBorrowings(bookId) {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM borrowings
    WHERE book_id = ?
      AND status = 'BORROWED'
    `,
    [bookId]
  );

  return rows[0].total;
}

async function countActiveBorrowingsByMember(memberId) {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM borrowings
    WHERE member_id = ?
      AND status = 'BORROWED'
    `,
    [memberId]
  );

  return rows[0].total;
}

async function findActiveBorrowing(
  memberId,
  bookId
) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      member_id,
      book_id,
      borrow_date,
      due_date,
      return_date,
      status
    FROM borrowings
    WHERE member_id = ?
      AND book_id = ?
      AND status = 'BORROWED'
    LIMIT 1
    `,
    [
      memberId,
      bookId,
    ]
  );

  return rows.length > 0
    ? mapBorrowing(rows[0])
    : null;
}

function mapBorrowing(row) {
  return {
    id: row.id,

    memberId: row.member_id,
    bookId: row.book_id,

    borrowDate: row.borrow_date,
    dueDate: row.due_date,
    returnDate: row.return_date,

    status: row.status,
  };
}

module.exports = {
  findAll,
  findById,

  create,
  returnBook,

  findByBookId,
  findByMemberId,

  countActiveBorrowings,
  countActiveBorrowingsByMember,

  findActiveBorrowing,
};