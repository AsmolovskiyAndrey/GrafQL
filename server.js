const express = require("express");
const {graphqlHTTP} = require("express-graphql");
const schema = require('../schema/schema.js')

const port = 3000;
const app = express();

app.use("/graphql", graphqlHTTP({
  schema,
  graphiql: true
}));

app.listen(port, (err) => {
  err ? console.log(err) : console.log(`Server started in port ${port}`);
});
