const express = require('express');
const path = require('path');
const app = express()

const parentDir = path.join(__dirname, '..'); 
const configDir = path.join(parentDir, 'config');
console.log(configDir);
process.env.NODE_CONFIG_DIR = configDir;
const config = require('config');
app.use(express.urlencoded({ limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
    req.config = { env: config.get('env'), token: config.get('token') };
    next();
});
module.exports = {
    handler: app
}

