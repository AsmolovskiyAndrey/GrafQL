const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const setToArray = require("./index.js");

const app = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());

// console.log(setToArray);

app.get("/api/stations/search/", (req, res) => {
  let searchValue = req.query.key.toLowerCase();

  const result = setToArray.filter((el) =>
    el.toLowerCase().includes(searchValue)
  );
  res.json(result);
});

app.listen(3000, (err) => {
  if (err) console.error("Error at server launch:", err);

  console.log("Server running. CORS-enabled. Use our API on port: 3000");
});
