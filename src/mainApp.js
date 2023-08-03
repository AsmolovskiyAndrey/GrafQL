import express from "express";
import { arrayEntries } from "./stops.js";
import { getStationWithId } from "./appWithGraphql.js";

const app = express();

app.get("/api/stations/search/",async (req, res) => {
    let searchValue = req.query.key.toLowerCase();
    const resultsIdUndName = arrayEntries.filter((el) =>
        el[1].toLowerCase().includes(searchValue)
    );

    const resultWithDataAboutStops = [];

    for (const item of resultsIdUndName) {
        const dataAboutOneStop = await getStationWithId(item[0]);
        resultWithDataAboutStops.push(dataAboutOneStop)
    }
    res.json(resultWithDataAboutStops);
});

app.listen(3000, (err) => {
    if (err) console.error("Error at server launch:", err);

    console.log("🚀 Server ready at http://localhost:3000/ for GET requests");
});
