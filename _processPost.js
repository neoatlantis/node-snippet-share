module.exports = function(params, response){
    var dataLength = params.data.length,
        dataSHA1HEX = params.sha1HEXDigest.toLowerCase();

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

};
