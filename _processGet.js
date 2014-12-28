module.exports = function(params, response){
    var uuid = params.uuid;
    
    var mongoClient = require('mongodb').MongoClient;
    mongoClient.connect(params.config.server.mongodb, function(err, db){
        if(err){
            response.writeHead(500);
            response.end();
            return console.error('Error connecting to db.');
        };

        var collection = db.collection('snippets');
        collection.findOne({id: uuid}, function(err, obj){
            if(err || !obj){
                response.writeHead(404);
                response.end();
                return;
            };
            response.writeHead(200);
            response.write(new require('buffer').Buffer(obj.base64, 'base64'));
            response.end();
        });
    });
};
