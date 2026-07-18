const serverless = require('serverless-http');
const app = require('../../index.js');

module.exports.handler = serverless(app, {
    request: (request, event, context) => {
        context.callbackWaitsForEmptyEventLoop = false;
    }
});
