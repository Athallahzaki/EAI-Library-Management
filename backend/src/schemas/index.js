const { gql } = require('graphql-tag');

const categoryType = require("./category");
const bookType = require("./book");
const memberType = require("./member");
const borrowingType = require("./borrowing");
const fineType = require("./fine");

const rootType = gql`
  type Query {
    hello: String
    luckyNumber: Int
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

module.exports = [
  rootType,
  categoryType,
  bookType,
  memberType,
  borrowingType,
  fineType
];