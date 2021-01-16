const config = {
  s3: {
    REGION: "us-west-1",
    BUCKET: "stocks-vibes",
  },
  apiGateway: {
    REGION: "us-west-1",
    URL: "https://oq2bdt52sb.execute-api.us-west-1.amazonaws.com/prod",
  },
  cognito: {
    REGION: "us-west-1",
    USER_POOL_ID: "us-west-1_smdJmm8Ms",
    APP_CLIENT_ID: "7ag6999d2t1uk9u2h39v87jbg6",
    IDENTITY_POOL_ID: "us-west-1:3649b9ad-f8ac-4537-80a5-34f27f2f40a7",
  },
};

export default config;