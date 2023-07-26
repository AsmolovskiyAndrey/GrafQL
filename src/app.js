import gql from "graphql-tag";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { accessToken, client} from "./middleware/authorization.js";
import { arrayEntries } from "./stops.js";

const typeDefs = `#graphql
    type Query {
        token: String
        station(id: ID): stationWithId
        stations: stationsNearby
        searchStation(search: String): [stationWithId]
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

const getStationNotFarAway = () => client.query({
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

const getStationWithId = (hafasID = 2171) => client.query({
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
            const stationNotWar = await Object(getStationNotFarAway());
            return stationNotWar.stations
        },
        searchStation: async (parent, args) => {
            const searchValue = args.search.toLowerCase().trim();
            const arrayWithHafasID = [];
            const resultArrayWithStopsData = [];

            const result = arrayEntries.filter((element) => 
                element[1].toLowerCase().includes(searchValue)
            );

            result.forEach((item)=>{
                arrayWithHafasID.push(item[0]);
            })
            
            async function stationId() {
                for (const item of arrayWithHafasID) {
                    const stationWithSpecificId = await Object(getStationWithId(item));
                    resultArrayWithStopsData.push(stationWithSpecificId.station)
                }
            };
            await stationId();

            return resultArrayWithStopsData
        }
    },
    };

const server = new ApolloServer({
    typeDefs,
    resolvers,
    });
    
const { url } = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${url}`);
