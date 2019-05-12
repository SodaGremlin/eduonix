const aws = require('aws-sdk');
const s3 = new aws.S3(); // global, doesn't need region parameters
let rekog;

exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log(JSON.stringify(message));

    rekog = new aws.Rekognition({
        region: "us-east-1"
    }); // not global, use the region parameter

    let requestParams = {
        Image: {
            S3Object: {
                Bucket: message.Records[0].s3.bucket.name,
                Name: message.Records[0].s3.object.key
            }
        }
    };

    console.log("Using the request params to detect labels - " + JSON.stringify(requestParams));

    return rekog.detectLabels(requestParams)
    .promise()
    .then(data => {
        console.log("detectLabelsResponse - " + JSON.stringify(data));

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
                Attributes: 'ALL'
            };

            console.log("Using the request params to detect faces - " +
                JSON.stringify(requestParams));

            return rekog.detectFaces(requestParams).promise()
            .then(detectFacesResponse => {
                console.log("detectFacesResponse - " +
                    JSON.stringify(detectFacesResponse));
            });
        }
    })
    .catch(err => {
        console.error("Error with the detect labels step", err);
    });
};
