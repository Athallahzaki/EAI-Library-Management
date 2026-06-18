const { gql } = require('graphql-tag');

const memberType = gql`
  type Member {
    id: ID!

    name: String!
    phoneNumber: String!

    activeBorrowings: Int!
    borrowings: [Borrowing]
  }

  extend type Query {
    members: [Member]
    member(id: ID!): Member
  }

  extend type Mutation {
    addMember(
      name: String!
      phoneNumber: String!
    ): Member

    deleteMember(id: ID!): Boolean
  }
`;

module.exports = memberType;