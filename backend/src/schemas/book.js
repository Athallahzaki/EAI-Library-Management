const { gql } = require('graphql-tag');

const bookType = gql`
  type Book {
    id: ID!
    isbn: String
    title: String!
    authors: [String!]
    coverImage: String
    stock: Int!

    categoryId: ID!

    category: Category

    borrowings: [Borrowing]

    availableStock: Int!
  }

  extend type Query {
    books(
      categoryId: ID
      title: String
    ): [Book]
    book(id: ID!): Book
  }

  extend type Mutation {
    addBookManual(
      title: String!
      authors: [String!]
      isbn: String
      stock: Int!
      categoryId: ID!
    ): Book

    addBookByISBN(
      isbn: String!
      stock: Int!
      categoryId: ID!
    ): Book

    updateBookStock(
      id: ID!
      stock: Int!
    ): Book

    deleteBook(id: ID!): Boolean
  }
`;

module.exports = bookType;