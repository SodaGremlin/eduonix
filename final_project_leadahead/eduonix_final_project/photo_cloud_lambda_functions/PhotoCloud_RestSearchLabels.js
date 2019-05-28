const aws = require('aws-sdk');

aws.config.update({
    region: "us-east-1"
});

const dynamoDB = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    console.log("Search requested", JSON.stringify(event));

    return dynamoDB.scan({
        TableName: "PhotoCloudPhoto",
        FilterExpression: `contains(labels, :keyword)`,
        ExpressionAttributeValues: {
            ":keyword": `${event.keyword}`
        }
    }).promise()
    .then(data => {
        console.log("successfully scan results - " + JSON.stringify(data));

        const response = {
            statusCode: 200,
            body: JSON.stringify(data),
        };

        return response;
    })
    .catch(err => {
        console.error("Could not scan the table", err);
    });
};
