const aws = require('aws-sdk');

aws.config.update({
    region: "us-east-1"
});

const dynamoDB = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    return dynamoDB.scan({
        TableName: "PhotoCloud",
        FilterExpression: "contains(labels, :keyword)",
        ExpressionAttributeValues: {
            ":keyword": event.keyword
        }
    }).promise()
    .then(data => {
        console.log("successfully scan results - " + JSON.stringify(data));

        const response = {
            statusCode: 200,
            body: JSON.stringify(data)
        };

        return response;
    })
    .catch(err => {
        console.error("Could not scan the table test", err);

        const response = {
            statusCode: 500,
            message: "An error has occured, please review the logs"
        };

        return response;
    });
};