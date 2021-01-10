// import * as uuid from "uuid";
import handler from "./libs/handler-lib";
import dynamoDb from './libs/dynamodb-lib';
// import unirest from "unirest";

const tableName = "watchlists";

/**
 * Returns the symbol if it is invalid, else true
 * @param {*} symbol
 */
const checkValidity = async (symbol) => {
  let req = unirest("GET", "https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete");

  req.query({
    "q": symbol,
    "region": "US"
  });

  req.headers({
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": process.env.RAPIDAPI_HOST,
    "useQueryString": true
  });

  const res = await req.send();
  if (res.error) return symbol;
  let quotes = res.body.quotes;
  for (let quote of quotes) {
    if (quote.symbol === symbol) {
      return true;
    }
  }
  return false;
};


// const input = {
//   symbols: [],
//   watchlistId: "name"
// };

export const main = handler(async (event, context) => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  // check user ID permissions

  // throw error if watchlist does not exist

  // Check stock symbol validity
  const symbols = data.symbols;
  // Resolve validity on all symbols asynchronously
  const validities = await Promise.all(symbols.map(ticker => checkValidity(ticker)));
  // Filter validities to only the invalidSymbols left
  const invalid = validities.filter(validity => validity !== true);
  // Return if invalid.
  if (invalid.length > 0) {
    throw new Error(`Invalid tickers: ${invalid}`);
  }

  const params = {
    TableName: tableName,
    Key: {
      userId: "123",
      watchlistId: data.watchlist,
    },
    UpdateExpression: "SET symbols = :symbols",
    ExpressionAttributeValues: {
      ":symbols": dynamoDb.createSet(symbols)
    },
  };

  const params = {
    TableName: tableName,
    Item: {
      // The attributes of the item to be created
      userId: "123", // The id of the author
      watchlistId: data.watchlist, // A unique uuid
      symbols: dynamoDb.createSet(symbols),
      createdAt: Date.now(), // Current Unix timestamp
    },
  };

  await dynamoDb.put(params);

  return { status: true };
});