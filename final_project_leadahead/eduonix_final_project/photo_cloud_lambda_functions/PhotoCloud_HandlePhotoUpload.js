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

    let bucketName = message.Records[0].s3.bucket.name;
    let objectKey = message.Records[0].s3.object.key;

    let requestParams = {
        Image: {
            S3Object: {
                Bucket: bucketName,
                Name: objectKey
            }
        }
    };

    let photoMetaData = {
        uuid: uuidv4(),
        photoUploadName: objectKey,
        labels: []
    };

    console.log("Using the request params to detect labels - " + JSON.stringify(requestParams));

    return rekog.detectLabels(requestParams)
    .promise()
    .then(data => {
        console.log("detectLabelsResponse - " + JSON.stringify(data));

        photoMetaData.detectLabelsResponse = data;
        photoMetaData.imagePath = `processed_images/${photoMetaData.uuid}.${objectKey.substr(objectKey.lastIndexOf(".") + 1)}`;

        let facesExist = false;

        data.Labels.forEach(currentLabel => {
            // only keep ones that have a high confidence
            if (currentLabel.Confidence < 60) return;

            photoMetaData.labels.push(currentLabel.Name);

            if (currentLabel.Name === 'Face') {
                facesExist = true;
            }
        });

        if (facesExist) {
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

        return null;
    })
    .then(data => {
        if (data) {
            console.log("detectFacesResponse - ", data, photoMetaData);

            photoMetaData.detectFacesResponse = data;

            // there could be multiple faces, so let's just record if the photo had it at all
            data.FaceDetails.forEach(currentFace => {
                Object.keys(currentFace).forEach(currentKey => {
                    if (currentKey === 'BoundingBox' ||
                        currentKey === 'AgeRange' ||
                        currentKey === 'Pose' ||
                        currentKey === 'Quality' ||
                        currentKey === 'Confidence' ||
                        currentKey === 'Landmarks') {
                        return;
                    }

                    // only keep ones that have a high confidence
                    if (currentFace[currentKey].Confidence &&
                        currentFace[currentKey].Confidence < 60) return;

                    if (currentKey === 'Emotions') {
                        photoMetaData.emotions = [];

                        // record if the photo has the emotion somewhere in it, don't worry about which face
                        currentFace.Emotions.forEach(currentEmotion => {
                            if (currentEmotion.Confidence < 60) {
                                return;
                            }

                            photoMetaData.emotions.push(currentEmotion.Type);
                        });
                        return;
                    }

                    if (!photoMetaData.faces) {
                        photoMetaData.faces = [];
                    }

                    photoMetaData.faces.push(currentKey);
                });
            });
        }

        // insert meta data
        return dynamoDB.put({
            TableName: "PhotoCloudPhoto",
            Item: photoMetaData
        }).promise();
    })
    .then(data => {
        console.log("saved the photo metadata", JSON.stringify(photoMetaData), data);

        // now let's put this in S3 for log term storage, and delete the uploaded version
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#copyObject-property
        return s3.copyObject({
            Bucket: 'photocloud-development.greggharrington.com',
            Key: photoMetaData.imagePath,
            CopySource: `${bucketName}/${objectKey}`,
            ACL: 'public-read'
        }).promise();
    })
    .then(data => {
        console.log("saved the image to the processed_images folder", data);
        return s3.deleteObject({
            Bucket: bucketName,
            Key: objectKey
        }).promise();
    })
    .then((data) => {
        console.log("deleted uploaded file", data);
    })
    .catch(err => {
        console.error("Error with the detect labels step", err);
    });
};
