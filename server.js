const express = require("express")
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello: String
    otherField: Int
    rollDice(numDice: Int!, numSides: Int = 6): [Int]
    quoteOfTheDay: String
    random: Float!
    user(name: String = "Test name"): User
  }

  type User {
    name: String
    age: Int
  }
`)

class User {
  constructor(name) {
    this.name = name
  }
  age() {
    return Math.floor(Math.random() * 100)
  }
}

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => {
    return "Hello world!"
  },

  otherField: 1234,

  rollDice: ({ numDice, numSides }) => {
    let output = []
    for (let i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)))
    }
    return output
  },

  quoteOfTheDay: () => {
    return Math.random() < 0.5 ? "Take it easy" : "Salvation lies within"
  },

  random: () => {
    return Math.random()
  },

  user: (args) => new User(args.name)
}

const app = express()
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)
app.listen(4000)
console.log("Running a GraphQL API server at http://localhost:4000/graphql")