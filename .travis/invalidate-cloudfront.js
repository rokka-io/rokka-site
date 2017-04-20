#! /usr/bin/env node
//
// copied and adapted from
// https://github.com/alexpatow/travis-ci-cloudfront-invalidation
//
// invalidates cloudfront cache.
//
const AWS = require('aws-sdk');

const CLOUDFRONT_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !CLOUDFRONT_DISTRIBUTION_ID) {
  console.log('Missing Required Argument(s)', {
    AWS_ACCESS_KEY: AWS_ACCESS_KEY ? 'exists' : 'missing',
    AWS_SECRET_KEY: AWS_SECRET_KEY ? 'exists' : 'missing',
    CLOUDFRONT_DISTRIBUTION_ID: CLOUDFRONT_DISTRIBUTION_ID ? 'exists' : 'missing'
  });
  process.exit(1);
}

const cloudfront = new AWS.CloudFront({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY
});

const currentTimestamp = new Date().toISOString();

var params = {
  DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
  InvalidationBatch: {
    CallerReference: currentTimestamp,
    Paths: {
      Quantity: 1,
      Items: '/*'
    }
  }
};

cloudfront.createInvalidation(params, function(err, data) {
  if (err) {
    console.log('Error invalidting CloudFront Cache: ' + JSON.stringify(err));
    process.exit(1);
  } else {
    console.log(JSON.stringify(data));
    process.exit(0);
  }
});
