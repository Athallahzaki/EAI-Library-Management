const { gql } = require('graphql-tag');

const categoryType = gql`
  type Category {
    id: ID!
    name: String!

    books: [Book]
  }

  extend type Query {
    categories: [Category]
    category(id: ID!): Category
  }

  extend type Mutation {
    addCategory(
      name: String!
    ): Category

    deleteCategory(id: ID!): Boolean
  }
`;

module.exports = categoryType;