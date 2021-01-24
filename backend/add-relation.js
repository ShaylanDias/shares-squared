import handler from "./libs/handler-lib";
import dynamoDb from './libs/dynamodb-lib';

const tableName = "user-relations";

// const input = {
//   userId,
//   otherUserId,
//   relationship: "FRIEND"
// };

const RELATIONSHIP_OPTIONS = ["FRIEND", "BLOCKED", "NEUTRAL"];

export const main = handler(async (event, context) => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);
  const id = event.requestContext.identity.cognitoIdentityId;

  const otherUserId = data.otherUserId;
  const relationship = data.relationship;

  if (RELATIONSHIP_OPTIONS.indexOf(relationship) < 0) {
    throw `Invalid enum option, must be one of: ${RELATIONSHIP_OPTIONS}`;
  }

  const params = {
    TableName: tableName,
    // 'Key' defines the partition key and sort key of the item to be updated
    Key: {
      userId: id,
      otherUserId: otherUserId
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET relationship = :relationship",
    ExpressionAttributeValues: {
      ":relationship": relationship,
    }
  };

  await dynamoDb.update(params);

  return { status: true };
});