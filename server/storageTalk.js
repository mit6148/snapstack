const {Storage} = require('@google-cloud/storage');
const request = require('request');

const storageInfo = {projectId: "snapstack"};
if(process.env.GCP_PRIVATE_KEY && process.env.GCP_CLIENT_EMAIL) {
    storageInfo.credentials = {private_key: process.env.GCP_PRIVATE_KEY, client_email: process.env.GCP_CLIENT_EMAIL};
} else {
    const path = require('path'); // only need here
    storageInfo.keyFilename = path.join(__dirname, 'storage-secret.json'); // for developer ease on localhost only
}
const storage = new Storage(storageInfo);

const bucket = storage.bucket('snapstack-photos');

function generateObjectName() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    const length = 12; // could safely store 2^70 objects without slowing runtime
    let ans = ""
    for(let i = 0; i < length; i++) {
        ans += chars[Math.floor(Math.random() * chars.length)];
    }
    return ans;
}


function uploadImagePromise(image) {
    // WARNING: should validate image here
    return new Promise(function(resolve, reject) {
        const name = generateObjectName();
        const file = bucket.file(name, {generation: 0}); // generation:0 means there can't exist a previous file
        file.createWriteStream()
            .on('error', error => {
                if(error.code == 412) {
                    resolve(uploadImagePromise(image));
                } else {
                    reject(error);
                }
            })
            .on('finish', () => {
                resolve(name);
            })
            .end(Buffer.from(image)); // WARNING: inefficient coding as utf-8 when is just base64. fix later, but change download too
    });
}

function downloadImagePromise(name) {
    return bucket.file(name).download().then(data => data[0].toString()); // data[0] is the file data
}

function deleteImagePromise(name) { // returns true if succeeded
    return bucket.file(name).delete().then(resp => true).catch(err => {
        return err.code === 404; // 404 means already deleted
    });
}


function fetchImagePromise(url) {
    // WARNING: validate!
    return new Promise(function(resolve, reject) {
        request.defaults({encoding: null}).get(url, function(err, response, body) {
            if(err || response.statusCode != 200) {
                reject(err || "Unsuccessful fetch for unknown reason");
            } else if (!response.headers["content-type"].startsWith("image/")) {
                reject("Image not accessible");
            } else {
                resolve("data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64'));
            }
        });
    });
}


module.exports = {uploadImagePromise, downloadImagePromise, deleteImagePromise, fetchImagePromise};