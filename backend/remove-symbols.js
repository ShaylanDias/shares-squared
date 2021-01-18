import handler from "./libs/handler-lib";
import dynamoDb from './libs/dynamodb-lib';

const tableName = "watchlists";

// const input = {
//   symbols: [],
//   watchlistId: "name"
// };

export const main = handler(async (event, context) => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);
  const id = event.requestContext.identity.cognitoIdentityId;

  const params = {
    TableName: tableName,
    // 'Key' defines the partition key and sort key of the item to be updated
    Key: {
      userId: id, // The id of the author
      watchlistId: data.watchlist, // The id of the note from the path
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "DELETE symbols :symbols",
    ExpressionAttributeValues: {
      ":symbols": dynamoDb.createSet(data.symbols)
    },
  };

  await dynamoDb.update(params);

  return { status: true };
});