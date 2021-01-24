import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

const PRIVACY_OPTIONS = ["PRIVATE", "FRIENDS", "PUBLIC"];

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const name = data.name;
  const id = event.requestContext.identity.cognitoIdentityId;

  const privacySetting = data.privacy || "PRIVATE";

  if (PRIVACY_OPTIONS.indexOf(privacySetting) < 0) {
    throw `Invalid privacy option, must be one of: ${PRIVACY_OPTIONS}`;
  }

  const params = {
    TableName: "watchlists",
    Key: {
      userId: id,
      watchlistId: name,
    },
    UpdateExpression: "SET privacy = :privacy",
    ExpressionAttributeValues: {
      ":privacy": privacySetting
    },
  };

  await dynamoDb.update(params);

  return { status: true };
});