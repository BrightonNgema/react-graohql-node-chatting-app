const { ApolloServer, gql } = require('apollo-server');
const mongoose = require("mongoose");
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
// The GraphQL schema


// A map of functions which return data for the schema.
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");


const contextMiddleware = require("./utils/contextMiddleware");
const Url  = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chat';

mongoose
  .connect(Url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false })
  .then(() => console.log("DB Connected"))
  .catch(err => console.log("DB Err", err));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: contextMiddleware,
  })

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

