// wait-for-server.js
const http = require('http');
require('dotenv').config()

const address = process.env.SERVER_ADDRESS;
const port = process.env.SERVER_PORT

const MAX_RETRIES = 3; // Number of retries before giving up
let attempts = 0;

const checkServer = () => {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://${address}:${port}/ready`, (res) => {
            if (res.statusCode === 200) {
                resolve();
            } else {
                reject(new Error(`Server responded with status code: ${res.statusCode}`));
            }
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
};

const waitForServer = async () => {
    while (attempts < MAX_RETRIES) {
        try {
            await checkServer();
            console.log('Server is up and running!');
            return;
        } catch (err) {
            attempts++;
            console.log(`Attempt ${attempts}: Server not ready yet. Retrying...`);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
    }
    console.error('\x1b[31m%s\x1b[0m', 'Server did not start in time. Exiting...');
    process.exit(1);
};

waitForServer();