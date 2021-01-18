import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

import unirest from "unirest";

export const main = handler(async (event, context) => {
  const id = event.requestContext.identity.cognitoIdentityId;

  const params = {
    TableName: "watchlists",
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    KeyConditionExpression: "userId = :userId",
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be the id of the author
    ExpressionAttributeValues: {
      ":userId": id,
    },
  };

  const result = await dynamoDb.query(params);

  console.log(result.Items);

  let items = result.Items;
  let allSymbols = new Set();

  for (let i = 0; i < items.length; i++) {
    items[i].symbols = items[i].symbols.values;
    items[i].symbols.forEach(symbol => allSymbols.add(symbol));
  }

  const symbolString = Array.from(allSymbols.values()).join(',');

  console.log(symbolString);

  if (symbolString.length > 0) {

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

    const stockData = {};
    for (let result of res.body.quoteResponse.result) {
      stockData[result.symbol] = result;
    }

    for (let i = 0; i < result.Items.length; i++) {
      let newItems = [];

      for (let symbol of result.Items[i].symbols) {
        newItems.push(stockData[symbol]);
      }
      result.Items[i].symbols = newItems;
    }
  }

  return result.Items;
});