import gql from "graphql-tag";
import fetch from "node-fetch";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import pkg from '@apollo/client';
import { accessToken, authMiddleware } from "../middleware/authMiddleware.js";

const { ApolloClient, InMemoryCache, ApolloLink, HttpLink } = pkg;

const HOSTNAME = "https://graphql-sandbox-dds.rnv-online.de";


const typeDefs = `#graphql
    type Query {
        token: String
        station(id: ID): stationWithId
        stations: stationsNearby
        }

    type stationWithId {
        hafasID: ID,
        longName: String,
        shortName: String,
        name: String,
    }

    type stationsNearby {
        totalCount: Int,
        elements:[stationsInfo]
    }

    type stationsInfo {
        hafasID: String,
        globalID: String,
        longName: String,
    }
`;

const httpLink = new HttpLink({
    uri: HOSTNAME,
    credentials: "same-origin",
    fetch: fetch,
});

const client = new ApolloClient({
    link: ApolloLink.from([authMiddleware, httpLink]),
    cache: new InMemoryCache(),
});

const getStationNotWarAway = () => client.query({
        query: gql`
        query {
            stations(first: 3, lat: 49.483076, long: 8.468409, distance: 0.5) {
            totalCount
            elements {
                ... on Station {
                hafasID
                globalID
                longName
                }
            }
            }
        }
        `,
}).then((result) => (result["data"]));

const getStationWithId = (hafasID) => client.query({
    query: gql`
        query {
            station(id: "${hafasID}") {
                hafasID
                longName
                shortName
                name
        } }
    `,
}).then(result => result["data"]);

const resolvers = {
    Query: {
        token: async () => {
            const tokenAccess = await accessToken();
            return tokenAccess;
        },
        station: async (parent, args) => {
            const stationId = await Object(getStationWithId(args.id));
            return stationId.station
        },
        stations: async () => {
            const stationNotWar = await Object(getStationNotWarAway());
            return stationNotWar.stations
        }
    },
    };

const server = new ApolloServer({
    typeDefs,
    resolvers,
    });
    
const { url } = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${url}`);