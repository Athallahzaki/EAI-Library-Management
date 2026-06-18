const memberRepository = require("../repositories/memberRepository");
const borrowingRepository = require("../repositories/borrowingRepository");

module.exports = {
  Query: {
    members: async () => {
      return await memberRepository.findAll();
    },

    member: async (_, { id }) => {
      return await memberRepository.findById(id);
    },
  },

  Mutation: {
    addMember: async (_, { name, phoneNumber }) => {
      const normalizedName = name.trim();
      const normalizedPhone = phoneNumber.trim();

      if (!normalizedName) {
        throw new Error("Nama member tidak boleh kosong");
      }

      if (!normalizedPhone) {
        throw new Error("Nomor telepon tidak boleh kosong");
      }

      const existingMember =
        await memberRepository.findByPhoneNumber(
          normalizedPhone
        );
      if (existingMember) {
        throw new Error(
          "Member dengan nomor telepon sudah ada"
        );
      }

      return await memberRepository.create({
        name: normalizedName,
        phoneNumber: normalizedPhone,
      });
    },

    deleteMember: async (_, { id }) => {
      const member = await memberRepository.findById(id);

      if (!member) {
        throw new Error("Member tidak ditemukan");
      }

      const activeBorrowings =
        await borrowingRepository.countActiveBorrowingsByMember(
          id
        );
      if (activeBorrowings > 0) {
        throw new Error(
          "Member tidak bisa dihapus karena masih meminjam buku"
        );
      }

      return await memberRepository.delete(id);
    },
  },

  Member: {
    borrowings: async (member) => {
      return await borrowingRepository.findByMemberId(
        member.id
      );
    },

    activeBorrowings: async (member) => {
      return await borrowingRepository.countActiveBorrowingsByMember(
        member.id
      );
    },
  },
};