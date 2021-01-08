import * as uuid from "uuid";
import handler from "./libs/handler-lib";
import dynamoDb from './libs/dynamodb-lib';
import unirest from "unirest";

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

  let isValid = false;
  req.end(function (res) {
    if (res.error) return;
    let quotes = res.body.quotes;
    for (let quote of quotes) {
      if (quote.symbol === symbol) {
        isValid = true;
        return;
      }
    }
  });
  console.log(isValid);
  return isValid || symbol;
};


// const input = {
//   symbols: [],
//   watchlistId: "name"
// };

export const main = handler(async (event, context) => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  // check user ID permissions

  // Check stock symbol validity
  const symbols = data.symbols;
  // Resolve validity on all symbols asynchronously
  const validities = await Promise.all(symbols.map(ticker => checkValidity(ticker)));
  // Filter validities to only the invalidSymbols left
  console.log(validities);
  const invalid = validities.filter(validity => validity);
  console.log(invalid);
  // Return if invalid.
  if (invalid.length > 0) {
    return { status: false, invalid: invalid };
  }
  console.log("VALIDATED");
  // add ticker to database

  const params = {
    TableName: tableName,
    Key: {
      userId: "123",
      watchlistId: data.watchlist,
    },
    UpdateExpression: "ADD symbols :symbols",
    ExpressionAttributeValues: {
      ":symbols": dynamoDb.createSet(symbols)
    },
    Item: {
      // The attributes of the item to be created
      userId: "123", // The id of the author
      noteId: uuid.v1(), // A unique uuid
      content: data.content, // Parsed from request body
      attachment: data.attachment, // Parsed from request body
      createdAt: Date.now(), // Current Unix timestamp
    },
  };

  await dynamoDb.update(params).promise();

  return { status: true };
});