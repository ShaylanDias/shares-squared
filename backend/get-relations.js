import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const id = event.requestContext.identity.cognitoIdentityId;

  const relation = data.relation;

  const params = {
    TableName: "user-relations",
    FilterExpression: "otherUserId = :userId AND relationship = :relation",
    // Set up like this since we are checking against the other user's settings, not this user's
    ExpressionAttributeValues: {
      ":userId": id,
      ":relation": relation,
    },
  };

  console.log(params);

  const result = await dynamoDb.scan(params);

  console.log(result.Items);

  let friends = [];

  for (let item of result.Items) {
    friends.push(item.userId);
  }

  return friends;
});