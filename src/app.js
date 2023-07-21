import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import {InMemoryCache} from "apollo-cache-inmemory";
import {HttpLink} from "apollo-link-http";
import {ApolloLink} from "apollo-link";
import {setContext} from "apollo-link-context";
import gql from "graphql-tag";
import fetch from "node-fetch";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import pkg from "apollo-client";
import { log } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });
const {ApolloClient} = pkg;

const CLIENT_ID = process.env.clientID;
const tenantID = process.env.tenantID;
const CLIENT_SECRET = process.env.clientSecret;
const RESOURCE_ID = process.env.resource;
const HOSTNAME = process.env.hostname;
const OAUTH_URL = `https://login.microsoftonline.com/{${tenantID}}/oauth2/token`;

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

const accessToken = async () => {
    const promise = new Promise(async (resolve, reject) => {
        const response = await fetch(OAUTH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials
            &client_id=${CLIENT_ID}
            &client_secret=${CLIENT_SECRET}
            &resource=${RESOURCE_ID}`,
        });

        resolve(response.json());
    });

    const json = await promise;
    return json["access_token"];
};

const httpLink = new HttpLink({
    uri: HOSTNAME,
    credentials: "same-origin",
    fetch: fetch,
});

const authMiddleware = setContext(
    (request) =>
        new Promise(async (resolve, reject) => {
        const token = await accessToken();
        resolve({
            headers: {
            authorization: `Bearer ${token}`,
            },
        });
    })
);

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
            // console.log(args.id);
            // console.log(stationId.station);
            return stationId.station
        },
        stations: async () => {
            const stationNotWar = await Object(getStationNotWarAway());
            // console.log(stationNotWar);
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