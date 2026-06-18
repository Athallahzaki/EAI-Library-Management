const { gql } = require('graphql-tag');

const fineType = gql`
  enum FineStatus {
    UNPAID
    PAID
  }

  type Fine {
    id: ID!

    borrowingId: ID!
    amount: Int!
    paidAt: String

    status: FineStatus!

    borrowing: Borrowing
  }

  extend type Query {
    fines: [Fine]
    fine(id: ID!): Fine
    unpaidFines: [Fine]
  }

  extend type Mutation {
    payFine(
      fineId: ID!
    ): Fine
  }
`;

module.exports = fineType;