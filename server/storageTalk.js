const {Storage} = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({projectId: "snapstack", keyFilename: path.join(__dirname, 'storage-secret.json')});

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
        return err.code == 404; // 404 means already deleted
    });
}


module.exports = {uploadImagePromise, downloadImagePromise, deleteImagePromise};