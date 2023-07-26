import fs from "fs";

const syncData = fs.readFileSync("../data/Haltestellen.csv", "utf8");
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
