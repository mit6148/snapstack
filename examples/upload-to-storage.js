// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage({projectId: "snapstack", keyFilename: "[filename]"});

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const bucketName = 'nms-test';
const filename = '/Users/nikhil/Desktop/IMG_7264.jpg';

// Uploads a local file to the bucket
storage.bucket(bucketName).upload(filename, {
  // Support for HTTP requests made with `Accept-Encoding: gzip`
  gzip: true,
  metadata: {
    // Enable long-lived HTTP caching headers
    // Use only if the contents of the file will never change
    // (If the contents will change, use cacheControl: 'no-cache')
    cacheControl: 'no-cache',
  },
}).then(() => console.log(`${filename} uploaded to ${bucketName}.`));