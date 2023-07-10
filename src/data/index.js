const fs = require("fs");

const syncData = fs.readFileSync("./data/stops.txt", "utf8");
let set = new Set();
const dataStr = syncData.split("\n");

dataStr.forEach((element) => {
  const el = element.split(",")[1];
  set.add(el.slice(1, -1));
});

const setToArray = Array.from(set);
setToArray.splice(0, 1);

module.exports = setToArray;
