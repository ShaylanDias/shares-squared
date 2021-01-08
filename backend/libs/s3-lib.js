import AWS from "aws-sdk";

const s3 = new AWS.S3();

export default {
  listObjectsV2      : (params) => s3.listObjectsV2(params).promise(),
  getSignedUrlPromise: (operation, params) => s3.getSignedUrlPromise(operation, params),
  deleteObject       : (params) => s3.deleteObject(params).promise(),
  deleteObjects      : (params) => s3.deleteObjects(params).promise(),
  copyObject         : (params) => s3.copyObject(params).promise(),
  // Object             : (params) => s3.Object(params).promise(),
  // get_object         : (params) => s3.get_object(params).promise(),
  // head_object        : (params) => s3.head_object(params).promise(),
  // generate_presigned_url : (operation, params) => s3.generate_presigned_url(operation, params).promise()
};
