module.exports = function(params, response){
    var dataLength = params.data.length,
        dataSHA1HEX = params.sha1HEXDigest.toLowerCase();
    var newUUID = require('node-uuid').v4();

    var requiredBits = 160;
    var bitsDef = params.config.hashcash.bits;
    for(var maxlen in bitsDef){
        if(maxlen - dataLength >= 0 && requiredBits > bitsDef[maxlen])
            requiredBits = bitsDef[maxlen];
    };

    // check hashcash
    if(!require('./_validateHashcash.js')(
        params.hashcash,
        {
            bits: requiredBits,
            resource: dataSHA1HEX,
            timediff: params.config.hashcash.tolerance,
        }
    )){
        response.writeHead(412);
        response.end();
        return;
    };

    // save
    var mongoClient = require('mongodb').MongoClient;
    mongoClient.connect(params.config.server.mongodb, function(err, db){
        if(err){
            response.writeHead(500);
            response.end();
            return console.error('Error saving a snippet during connection');
        };

        var collection = db.collection('snippets');
        collection.insert({
            id: newUUID, 
            validTo: new Date().getTime() + params.config.snippet.life * 1000,
            base64: params.data.toString('base64'),
        }, function(err, result){
            if(err){
                response.writeHead(500);
                response.end();
                return console.error('Error saving a snippet during saving.');
            };

            console.log("New " + String(result.result.n) + " snippet.");
            db.close();

            response.writeHead(200);
            response.write(String(newUUID));
            response.end();
        });
    });
};
