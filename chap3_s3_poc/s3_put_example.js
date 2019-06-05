const aws = require('aws-sdk');
const s3 = new aws.S3();
const uuid = require('uuid');

exports.handler = async (event) => {
    // log out the inforamtion that we got
    console.log("Got the event to our S3POC class - " + JSON.stringify(event));

    // create a uuid so we can have a unique file name
    const newUuid = uuid.v4();

    // put our sentence into s3
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    return s3.putObject({
        Bucket: "eduonix-helloworld-s3.greggharrington.com",
        Key: newUuid + ".json",
        Body: event.sentence
    }).promise()
        .then(data => {
            console.log("Successfully stored the object in s3 - " + JSON.stringify(data));
        })
        .catch(err => {
            console.error("Could not save the object to s3", err);
        });
};
