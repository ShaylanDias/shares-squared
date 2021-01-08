import * as uuid from "uuid";
import handler from "./libs/handler-lib";
import dynamoDb from './libs/dynamodb-lib';
import unirest from "unirest";

const tableName = "watchlists";



export const main = handler(async (event, context) => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  // check user ID permissions

  // check stock ticker validities
  const tickers = data.tickers;


  // remove tickers from database watchlist

  const params = {
    TableName: tableName,
    Item: {
      // The attributes of the item to be created
      userId: "123", // The id of the author
      watchlistId: "TestList", // A unique uuid
      content: data.content, // Parsed from request body
      attachment: data.attachment, // Parsed from request body
      createdAt: Date.now(), // Current Unix timestamp
    },
  };

  await dynamoDb.put(params).promise();

  return { status: true };
});