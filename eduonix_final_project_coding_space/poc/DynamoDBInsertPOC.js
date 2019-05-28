const uuidv4 = require('uuid');
const aws = require('aws-sdk');

aws.config.update({
    region: "us-east-1"
});

const dynamoDB = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const recordUuid = uuidv4();

    console.log("recordUuid - " + recordUuid);

    return dynamoDB.put({
        TableName: "Test",
        Item: {
            uuid: recordUuid,
            bucketLocation: "images/image_0001.jpg",
            facesDetected: true,
            detectLabelsResponse: {
                test: "labels part"
            },
            detectFacesResponse: {
                test: "faces part"
            }
        }
    }).promise()
    .then(data => {
        console.log("successfully put a record to the test dynamodb - " + JSON.stringify(data));
    })
    .catch(err => {
        console.error("Could not put a record to the test table", err);
    });
};