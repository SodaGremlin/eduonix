const aws = require('aws-sdk');

aws.config.update({
    region: "us-east-1"
});

const dynamoDB = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    return dynamoDB.scan({
        TableName: "PhotoCloudPhoto",
        FilterExpression: "attribute_exists(detectFacesResponse)",
        // ExpressionAttributeValues: {
        //     // ":attr": "detectFacesResponse"
        // }
    }).promise()
    // this doesn't work:
    // return dynamoDB.scan({
    //     TableName: "PhotoCloudPhoto",
    //     FilterExpression: "contains(detectLabelsResponse.Labels, #Name = :val)",
    //     ExpressionAttributeNames: {
    //         "#Name": "Name"
    //     },
    //     ExpressionAttributeValues: {
    //         ":val": "Bar Counter"
    //     }
    // }).promise()
    .then(data => {
        console.log("successfully scan results - " + JSON.stringify(data));
    })
    .catch(err => {
        console.error("Could not scan the table", err);
    });
};

exports.handler();