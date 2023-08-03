import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {setContext} from "apollo-link-context";
import pkg from '@apollo/client';
const { ApolloClient, InMemoryCache, ApolloLink, HttpLink } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const CLIENT_ID = process.env.clientID;
const tenantID = process.env.tenantID;
const CLIENT_SECRET = process.env.clientSecret;
const RESOURCE_ID = process.env.resource;
const OAUTH_URL = `https://login.microsoftonline.com/{${tenantID}}/oauth2/token`;
const HOSTNAME = "https://graphql-sandbox-dds.rnv-online.de";

export const accessToken = async () => {
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

export const authMiddleware = setContext(
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

const httpLink = new HttpLink({
    uri: HOSTNAME,
    credentials: "same-origin",
    fetch: fetch,
});

export const client = new ApolloClient({
    link: ApolloLink.from([authMiddleware, httpLink]),
    cache: new InMemoryCache({
        // addTypename: false
    }),
});
