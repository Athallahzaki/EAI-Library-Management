const bookResolver = require("./bookResolver");
const categoryResolver = require("./categoryResolver");
const memberResolver = require("./memberResolver");
const borrowingResolver = require("./borrowingResolver");
const fineResolver = require("./fineResolver");

module.exports = {
  Query: {
    hello: () => "Library GraphQL API Running",
    luckyNumber: () => Math.floor(Math.random() * 100),
    ...bookResolver.Query,
    ...categoryResolver.Query,
    ...memberResolver.Query,
    ...borrowingResolver.Query,
    ...fineResolver.Query,
  },

  Mutation: {
    ...bookResolver.Mutation,
    ...categoryResolver.Mutation,
    ...memberResolver.Mutation,
    ...borrowingResolver.Mutation,
    ...fineResolver.Mutation,
  },

  Book: {
    ...bookResolver.Book
  },

  Category: {
    ...categoryResolver.Category
  },

  Member: {
    ...memberResolver.Member
  },

  Borrowing: {
    ...borrowingResolver.Borrowing
  },

  Fine: {
    ...fineResolver.Fine
  }
};