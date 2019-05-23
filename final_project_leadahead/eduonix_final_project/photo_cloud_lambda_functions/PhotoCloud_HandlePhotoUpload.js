const aws = require('aws-sdk');
const uuidv4 = require('uuid');
const s3 = new aws.S3(); // global, doesn't need region parameters

aws.config.update({
    region: "us-east-1"
});

const rekog = new aws.Rekognition();
const dynamoDB = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log(JSON.stringify(message));

    let requestParams = {
        Image: {
            S3Object: {
                Bucket: message.Records[0].s3.bucket.name,
                Name: message.Records[0].s3.object.key
            }
        }
    };

    let photoMetaData = {
        uuid: uuidv4(),
        photoUploadName: message.Records[0].s3.object.key
    };

    console.log("Using the request params to detect labels - " + JSON.stringify(requestParams));

    return rekog.detectLabels(requestParams)
    .promise()
    .then(data => {
        console.log("detectLabelsResponse - " + JSON.stringify(data));

        photoMetaData.detectLabelsResponse = data;

        let facesExist = false;

        data.Labels.forEach(currentLabel => {
            if (currentLabel.Name === 'Face') {
                facesExist = true;
            }
        });

        if(facesExist) {
            console.log("Faces exist, detectFaces");
            requestParams = {
                Image: {
                    S3Object: {
                        Bucket: message.Records[0].s3.bucket.name,
                        Name: message.Records[0].s3.object.key
                    }
                },
                Attributes: ['ALL']
            };

            console.log("Using the request params to detect faces - " +
                JSON.stringify(requestParams));

            return rekog.detectFaces(requestParams).promise();
        }
    })
    .then(data => {
        console.log("detectFacesResponse - ", data,
            photoMetaData);

        photoMetaData.detectFacesResponse = data;

        // insert meta data
        return dynamoDB.put({
            TableName: "PhotoCloudPhoto",
            Item: photoMetaData
        }).promise();
    })
    .then(data => {
        console.log("saved the photo metadata", photoMetaData, data);
    })
    .catch(err => {
        console.error("Error with the detect labels step", err);
    });
};
