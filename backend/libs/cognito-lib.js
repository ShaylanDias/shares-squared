import AWS from "aws-sdk";

const cognito = new AWS.CognitoIdentityServiceProvider();

export default {
  adminGetUser : (params) => cognito.adminGetUser(params).promise(),
};