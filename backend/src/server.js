const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");

require('dotenv').config();

const HOST = process.env.API_HOST || "localhost";
const PORT = process.env.API_PORT || 4000;

const typeDefs = require("./schemas");
const resolvers = require("./resolvers");

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  await server.start();

  app.use(cors());
  app.use(bodyParser.json());

  app.use(
    "/graphql",
    expressMiddleware(server)
  );

  app.listen(PORT, () => {
    console.log(`Server running at http://${HOST}:${PORT}/graphql`);
  });
}

startServer();