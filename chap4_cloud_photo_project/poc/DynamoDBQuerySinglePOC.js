const aws = require('aws-sdk');

aws.config.update({
    region: "us-east-1"
});

const dynamoDB = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    return dynamoDB.get({
        TableName: "Test",
        Key: {
            uuid: "118d812f-0bca-46b1-b325-4037a30c59c5"
        }
    }).promise()
    .then(data => {
        console.log("successfully got a record from dynamodb - " + JSON.stringify(data));
    })
    .catch(err => {
        console.error("Could not get a record from the test table", err);
    });
};