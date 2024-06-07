'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE;

module.exports.hello = async (event) => {
  const params = {
    TableName: tableName,
    Item: {
      id: '1',
      message: 'Hello, World!',
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hello, World! Item stored in DynamoDB!',
      }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 501,
      body: JSON.stringify({
        error: 'Couldn\'t store the item.',
      }),
    };
  }
};
