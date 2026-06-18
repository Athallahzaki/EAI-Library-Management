const fineRepository = require("../repositories/fineRepository");
const borrowingRepository = require("../repositories/borrowingRepository");

module.exports = {
  Query: {
    fines: async () => {
      return await fineRepository.findAll();
    },

    fine: async (_, { id }) => {
      return await fineRepository.findById(id);
    },

    unpaidFines: async () => {
      return await fineRepository.findByStatus("UNPAID");
    },
  },

  Mutation: {
    payFine: async (_, { fineId }) => {
      const fine = await fineRepository.findById(fineId);
      if (!fine) {
        throw new Error("Fine tidak ditemukan");
      }

      if (fine.status === "PAID") {
        throw new Error("Fine sudah dibayar");
      }

      return await fineRepository.markAsPaid(
        fineId,
        {
          paidAt: new Date(),
          status: "PAID",
        }
      );
    },
  },

  Fine: {
    borrowing: async (fine) => {
      return await borrowingRepository.findById(
        fine.borrowingId
      );
    },
  },
};