const aws = require('aws-sdk');
aws.config.update({
    region: "us-east-1"
});

const uuidv4 = require('uuid/v4');
const dynamoDB = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const recordUuid = uuidv4();

    const params = {
        TableName: "PhotoCloudPhoto",
        Key: {
            uuid: "6e92435e-0937-408e-95d8-aa04213c446c"
        }
    };

    console.log("getting - " + JSON.stringify(params));

    await dynamoDB.get(params).promise()
    .then(data => {
        console.log(JSON.stringify(data));
    })
    .catch(err => {
        console.error("could not get record", err);
    });
};

exports.handler();