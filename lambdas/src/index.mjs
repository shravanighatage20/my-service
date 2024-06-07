import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { DYNAMODB_TABLE } = process.env;

export const handler = async (event) => {
  const { httpMethod, body, pathParameters } = event;
  let response;

  try {
    switch (httpMethod) {
      case 'POST':
        response = await createItem(JSON.parse(body));
        break;
      case 'GET':
        if (pathParameters) {
          response = await getItem(pathParameters.id);
        } else {
          response = await getAllItems();
        }
        break;
      case 'PUT':
        response = await updateItem(pathParameters.id, JSON.parse(body));
        break;
      case 'DELETE':
        response = await deleteItem(pathParameters.id);
        break;
      default:
        throw new Error(`Unsupported method "${httpMethod}"`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

const createItem = async (data) => {
  const id = uuidv4();
  const params = {
    TableName: DYNAMODB_TABLE,
    Item: {
      StudentId: id,
      ...data,
    },
  };
  await dynamoDb.put(params).promise();
  return params.Item;
};

const getItem = async (id) => {
  const params = {
    TableName: DYNAMODB_TABLE,
    Key: {
      StudentId: id,
    },
  };
  const result = await dynamoDb.get(params).promise();
  return result.Item;
};

const getAllItems = async () => {
  const params = {
    TableName: DYNAMODB_TABLE,
  };
  const result = await dynamoDb.scan(params).promise();
  return result.Items;
};

const updateItem = async (id, data) => {
  const params = {
    TableName: DYNAMODB_TABLE,
    Key: {
      StudentId: id,
    },
    UpdateExpression: 'set ' + Object.keys(data).map((key, index) => `#${key} = :${key}`).join(', '),
    ExpressionAttributeNames: Object.keys(data).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
    ExpressionAttributeValues: Object.keys(data).reduce((acc, key) => ({ ...acc, [`:${key}`]: data[key] }), {}),
    ReturnValues: 'ALL_NEW',
  };
  const result = await dynamoDb.update(params).promise();
  return result.Attributes;
};

const deleteItem = async (id) => {
  const params = {
    TableName: DYNAMODB_TABLE,
    Key: {
      StudentId: id,
    },
  };
  await dynamoDb.delete(params).promise();
  return { message: 'Item deleted successfully' };
};
