const { gql } = require('graphql-tag');

const borrowingType = gql`
  enum BorrowStatus {
    BORROWED
    RETURNED
  }

  type Borrowing {
    id: ID!

    memberId: ID!
    bookId: ID!

    borrowDate: String!
    dueDate: String!
    returnDate: String

    status: BorrowStatus!

    book: Book
    member: Member
    fine: Fine
  }

  extend type Query {
    borrowings: [Borrowing]
    borrowing(id: ID!): Borrowing
  }

  extend type Mutation {
    borrowBook(
      memberId: ID!
      bookId: ID!
    ): Borrowing

    returnBook(
      borrowingId: ID!
    ): Borrowing
  }
`;

module.exports = borrowingType;