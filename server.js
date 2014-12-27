var fs = require('fs'),
    crypto = require('crypto'),
    http = require('http');

console.log("> Reading config file...");
var config = JSON.parse(fs.readFileSync('config.json'));


var server = http.createServer(require('./_httpServer.js')(
    config
));
server.listen(config.server.port);
console.log("> HTTP listening on port: " + config.server.port);
