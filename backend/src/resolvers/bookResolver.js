const bookRepository = require("../repositories/bookRepository");
const categoryRepository = require("../repositories/categoryRepository");
const borrowingRepository = require("../repositories/borrowingRepository");

const isbnService = require("../services/isbnService");

module.exports = {
  Query: {
    books: async (_, args) => {
      const { categoryId, title } = args;

      return await bookRepository.findAll({
        categoryId,
        title,
      });
    },

    book: async (_, { id }) => {
      return await bookRepository.findById(id);
    },
  },

  Mutation: {
    addBookManual: async (_, args) => {
      const {
        title,
        authors,
        isbn,
        stock,
        categoryId,
      } = args;

      const category = await categoryRepository.findById(categoryId);
      if (!category) {
        throw new Error("Category tidak ada");
      }

      const existingBook = await bookRepository.findByISBN(isbn);
      if (existingBook) {
        throw new Error("Book dengan ISBN sudah ada");
      }

      return await bookRepository.create({
        title,
        authors,
        isbn,
        stock,
        categoryId,
      });
    },

    addBookByISBN: async (_, args) => {
      const {
        isbn,
        stock,
        categoryId,
      } = args;

      const category = await categoryRepository.findById(categoryId);
      if (!category) {
        throw new Error("Category tidak ada");
      }

      const existingBook = await bookRepository.findByISBN(isbn);
      if (existingBook) {
        throw new Error("Book dengan ISBN sudah ada");
      }

      const externalBook = await isbnService.fetchBook(isbn);
      if (!externalBook) {
        throw new Error("Book not found from ISBN service");
      }

      return await bookRepository.create({
        isbn,
        title: externalBook.title,
        authors: externalBook.authors,
        coverImage: externalBook.coverImage,
        stock,
        categoryId,
      });
    },

    updateBookStock: async (_, { id, stock }) => {
      const book = await bookRepository.findById(id);
      if (!book) {
        throw new Error("Book tidak ditemukan");
      }
      
      if (stock < 0) {
        throw new Error("Stock tidak bisa negatif");
      }
      
      const activeBorrowings = await borrowingRepository.countActiveBorrowings(id);
      if (stock < activeBorrowings) {
        throw new Error(
          `Stock tidak bisa kurang dari borrowing (${activeBorrowings})`
        );
      }

      return await bookRepository.updateStock(id, stock);
    },

    deleteBook: async (_, { id }) => {
      const book = await bookRepository.findById(id);
      if (!book) {
        throw new Error("Book tidak ditemukan");
      }

      const activeBorrowings = await borrowingRepository.countActiveBorrowings(id);
      if (activeBorrowings > 0) {
        throw new Error(
          "Book tidak bisa dihapus karena sedang dipinjam"
        );
      }

      return await bookRepository.delete(id);
    },
  },

  Book: {
    category: async (book) => {
      return await categoryRepository.findById(
        book.categoryId
      );
    },

    borrowings: async (book) => {
      return await borrowingRepository.findByBookId(
        book.id
      );
    },

    availableStock: async (book) => {
      const activeBorrowings =
        await borrowingRepository.countActiveBorrowings(
          book.id
        );

      return book.stock - activeBorrowings;
    },
  },
};