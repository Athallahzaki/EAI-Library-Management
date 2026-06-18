const borrowingRepository = require("../repositories/borrowingRepository");
const memberRepository = require("../repositories/memberRepository");
const bookRepository = require("../repositories/bookRepository");
const fineRepository = require("../repositories/fineRepository");

const DAILY_FINE = Number(process.env.DAILY_FINE || 2000);

module.exports = {
  Query: {
    borrowings: async () => {
      return await borrowingRepository.findAll();
    },

    borrowing: async (_, { id }) => {
      return await borrowingRepository.findById(id);
    },
  },

  Mutation: {
    borrowBook: async (_, { memberId, bookId }) => {
      const member = await memberRepository.findById(memberId);
      if (!member) {
        throw new Error("Member tidak ditemukan");
      }

      const book = await bookRepository.findById(bookId);

      if (!book) {
        throw new Error("Book tidak ditemukan");
      }

      const activeBorrowings =
        await borrowingRepository.countActiveBorrowings(
          bookId
        );

      const availableStock =
        book.stock - activeBorrowings;
      if (availableStock <= 0) {
        throw new Error("Stok book sudah habis");
      }

      const existingBorrowing =
        await borrowingRepository.findActiveBorrowing(
          memberId,
          bookId
        );

      if (existingBorrowing) {
        throw new Error(
          "Member sudah meminjam book ini"
        );
      }

      const borrowDate = new Date();
      const dueDate = new Date(borrowDate);
      dueDate.setDate(dueDate.getDate() + 7);

      return await borrowingRepository.create({
        memberId,
        bookId,
        borrowDate,
        dueDate,
        status: "BORROWED",
      });
    },

    returnBook: async (_, { borrowingId }) => {
      const borrowing =
        await borrowingRepository.findById(
          borrowingId
        );

      if (!borrowing) {
        throw new Error("Borrowing tidak ditemukan");
      }

      if (borrowing.status === "RETURNED") {
        throw new Error(
          "Book sudah dikembalikan"
        );
      }

      const returnedBorrowing = await borrowingRepository.returnBook(
        borrowingId,
        {
          returnDate: new Date(),
          status: "RETURNED",
        }
      );

      const retDate = new Date(returnedBorrowing.returnDate);
      const dDate = new Date(returnedBorrowing.dueDate);

      const isOverdue = retDate.getTime() > dDate.getTime();
      if (isOverdue) {
        const timeDifference = retDate - dDate;
        const daysLate = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        await fineRepository.create({
          borrowingId: borrowing.id,
          amount: daysLate * DAILY_FINE,
          status: "UNPAID",
        });
      }

      return returnedBorrowing;
    },
  },

  Borrowing: {
    book: async (borrowing) => {
      return await bookRepository.findById(
        borrowing.bookId
      );
    },

    member: async (borrowing) => {
      return await memberRepository.findById(
        borrowing.memberId
      );
    },

    fine: async (borrowing) => {
      return await fineRepository.findByBorrowingId(
        borrowing.id
      );
    },
  },
};