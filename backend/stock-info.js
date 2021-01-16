import unirest from "unirest";

import handler from "./libs/handler-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const symbols = data.symbols;
  const symbolString = symbols.join(',');

  var req = unirest("GET", "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes");

  req.query({
    "region": "US",
    "symbols": symbolString,
  });

  req.headers({
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": process.env.RAPIDAPI_HOST,
    "useQueryString": true
  });

  const res = await req.send();
  if (res.error) throw new Error(res.error);
  console.log(res.body);
  return res.body;
});