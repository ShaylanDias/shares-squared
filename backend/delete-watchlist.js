import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const name = data.name;
  const id = event.requestContext.identity.cognitoIdentityId;


  const params = {
    TableName: "watchlists",
    // 'Key' defines the partition key and sort key of the item to be removed
    Key: {
      userId: id,
      watchlistId: name,
    },
  };

  await dynamoDb.delete(params);

  return params.Item;
});