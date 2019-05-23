const aws = require('aws-sdk');
aws.config.update({
    region: "us-east-1"
});

const uuidv4 = require('uuid/v4');
const dynamoDB = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const recordUuid = "0479036e-1591-4d5e-b453-89b1c470622a";

    const params = {
        TableName: "test",
        Key: {
            uuid: recordUuid
        },
        UpdateExpression: "set #name = :name, otherThing = :otherThing",
        ExpressionAttributeNames: {
            "#name": "name"
        },
        ExpressionAttributeValues: {
            ":name": "test change",
            ":otherThing": "other thing change"
        }
    };

    console.log("putting - " + JSON.stringify(params));

    await dynamoDB.update(params).promise()
    .then(data => {
        console.log(JSON.stringify(data));
    })
    .catch(err => {
        console.error("could not put record", err);
    });
};

exports.handler();