import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

import unirest from "unirest";

export const main = handler(async (event, context) => {

  const callerId = event.requestContext.identity.cognitoIdentityId;
  let pathId = event.pathParameters ? event.pathParameters.id : null;
  if (pathId === "self") {
    pathId = null;
  }

  const id = pathId || callerId;

  let isFriend = false;
  let isUser = false;

  // Do a check for privileges on watchlists
  if (id !== callerId) {
    const params = {
      TableName: "user-relations",
      KeyConditionExpression: "userId = :userId AND otherUserId = :otherUserId",
      // Set up like this since we are checking against the other user's settings, not this user's
      ExpressionAttributeValues: {
        ":userId": id,
        ":otherUserId": callerId,
      },
    };

    const result = await dynamoDb.query(params);

    if (result.Items.length > 0) {
      isFriend = result.Items[0].relationship === "FRIEND";
      if (result.Items[0].relationship === "BLOCKED") {
        throw "This user blocked you";
      }
    }
  } else {
    isFriend = true;
    isUser = true;
  }

  let expressionValues = {
    ":userId": id,
    ":public": "PUBLIC",
  };

  if (isFriend) {
    expressionValues[":friends"] = "FRIENDS";
  }
  if (isUser) {
    expressionValues[":private"] = "PRIVATE";
  }

  const params = {
    TableName: "watchlists",
    FilterExpression: `userId = :userId AND (privacy = :public${isFriend ? " OR privacy = :friends" : ""}${isUser ? " OR privacy = :private" : ""})`,
    ExpressionAttributeValues: expressionValues,
  };

  console.log(params);

  const result = await dynamoDb.scan(params);

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