const aws = require('aws-sdk');

aws.config.update({
    region: "us-east-1"
});

const dynamoDB = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    return dynamoDB.query({
        TableName: "Test",
        KeyConditionExpression: "bucketLocation = :location",
        IndexName: "name-index",
        ExpressionAttributeValues: {
            ":location": "images/image_0003.jpg"
        }
    }).promise()
    .then(data => {
        console.log(JSON.stringify(data));
    })
    .catch(err => {
        console.error("could not get record", err);
    });
};