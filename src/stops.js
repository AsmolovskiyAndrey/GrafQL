import fs from "fs";
import path from "path";

const rightPath = path.resolve('/Users/andriiasmolovskyi/Desktop/workspace/zweite Aufgabe/graphql_aufgabe/data/Haltestellen.csv')

const syncData = fs.readFileSync(rightPath, "utf8");
const stopsWithId = {};
const dataStr = syncData.split("\r");

dataStr.forEach((element) => {
        const hafasId = element.split("\t")[1];
        const langName = element.split("\t")[2];

        if (typeof (hafasId) !== "undefined") {
                stopsWithId[hafasId.slice(1, -1)] = langName.slice(1, -1);
        }
});
export const arrayEntries = Object.entries(stopsWithId)
