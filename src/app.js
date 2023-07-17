import {} from 'dotenv/config';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import gql from "graphql-tag";
import fetch from 'node-fetch';
import express from "express";
// import { ApolloClient } from 'apollo-client';
import pkg from 'apollo-client';

const { ApolloClient } = pkg;
const app = express();

const CLIENT_ID = process.env.clientID;
const tenantID = process.env.tenantID;
const CLIENT_SECRET = process.env.clientSecret;
const RESOURCE_ID = process.env.resource;
const HOSTNAME = process.env.hostname;
const CLIENT_API_URL = process.env.client_api_url;

const OAUTH_URL = `https://login.microsoftonline.com/{${tenantID}}/oauth2/token`


const accessToken = async () => {
    const promise = new Promise(async (resolve, reject) => {
        const response = await fetch(OAUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=client_credentials
        &client_id=${CLIENT_ID}
        &client_secret=${CLIENT_SECRET}
        &resource=${RESOURCE_ID}`
        });

        resolve(response.json());
    })

    const json = await promise;
    return json["access_token"];
}

const httpLink = new HttpLink({
    uri: HOSTNAME,
    credentials: 'same-origin',
    fetch: fetch
});

const authMiddleware = setContext((request) => new Promise(async (resolve,reject) => {
    const token = await accessToken();
    resolve({
    headers: {
        authorization: `Bearer ${token}`,
    } })
}));

const client = new ApolloClient({
    link: ApolloLink.from([authMiddleware, httpLink]),
    cache: new InMemoryCache()
});


// NICHT FUNCTIONERT
// client.query({
//     query: gql`
//         query {
//             stations(first: 3 lat:49.483076 long:8.468409 distance:0.5) {
//             totalCount
//             elements {
//                 ... on Station {
//                 hafasID
//             globalID
//             longName }
//         } }
// } `,
// }).then(result => console.log(result["data"]));


app.get("/getAccessTokenForClient", async (req, res) => {
    const tokenAccess = await accessToken()
    res.json(tokenAccess);
});

app.listen(3000, (err) => {
    if (err) console.error("Error at server launch:", err);

    console.log("Server running. Use our API on port: 3000");
    });
