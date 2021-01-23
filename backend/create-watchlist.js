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
    Item: {
      // The attributes of the item to be created
      userId: id, // The id of the author
      watchlistId: name, // A unique uuid
      symbols: dynamoDb.createSet([""]),
      privacy: privacySetting
    },
    ConditionalExpression: {
      
    }
  };

  await dynamoDb.put(params);

  return params.Item;
});