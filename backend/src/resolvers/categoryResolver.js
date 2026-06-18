const categoryRepository = require("../repositories/categoryRepository");
const bookRepository = require("../repositories/bookRepository");

module.exports = {
  Query: {
    categories: async () => {
      return await categoryRepository.findAll();
    },

    category: async (_, { id }) => {
      return await categoryRepository.findById(id);
    },
  },

  Mutation: {
    addCategory: async (_, { name }) => {
      const normalizedName = name.trim();
      if (!normalizedName) {
        throw new Error("Nama category tidak boleh kosong");
      }

      const existingCategory =
        await categoryRepository.findByName(normalizedName);
      if (existingCategory) {
        throw new Error("Category sudah ada");
      }

      return await categoryRepository.create({
        name: normalizedName,
      });
    },

    deleteCategory: async (_, { id }) => {
      const category =
        await categoryRepository.findById(id);

      if (!category) {
        throw new Error("Category tidak ditemukan");
      }

      const books =
        await bookRepository.findByCategoryId(id);
      if (books.length > 0) {
        throw new Error(
          "Category tidak bisa dihapus karena sedang digunakan oleh Book"
        );
      }

      return await categoryRepository.delete(id);
    },
  },

  Category: {
    books: async (category) => {
      return await bookRepository.findByCategoryId(
        category.id
      );
    },
  },
};