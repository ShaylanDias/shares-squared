import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const id = event.requestContext.identity.cognitoIdentityId;

  const relationship = event.pathParameters.relationship;

  const params = {
    TableName: "user-relations",
    FilterExpression: "otherUserId = :userId AND relationship = :relationship",
    // Set up like this since we are checking against the other user's settings, not this user's
    ExpressionAttributeValues: {
      ":userId": id,
      ":relationship": relationship,
    },
  };

  const result = await dynamoDb.scan(params);

  let friends = [];

  for (let item of result.Items) {
    friends.push(item.userId);
  }

  return friends;
});