var spentCache = [];
function addCache(hashcashDigestHEX, until){
    spentCache.push({t: until, h: hashcashDigestHEX});
};
function inCache(hashcashDigestHEX){
    for(var i=0; i<spentCache.length; i++)
        if(spentCache[i].h == hashcashDigestHEX)
            return true;
    return false;
};


/*
 * Validate hashcash
 *
 * conditions:
 *  bits - required bits, default 20
 *  resource - asserting resource name: when given, this will be tested
 *  timediff - time difference tolerance, absolute value, default 3600
 */
function validateHashcash(hashcash, conditions){
    // pre process
    hashcash = hashcash.trim();
    if(!conditions) conditions = {};
    if(!conditions.bits) conditions.bits = 20;
    if(!conditions.timediff) conditions.timediff = 3600;


    // 1. parse hashcash string carried declarations
    var hashcashParams = hashcash.trim().split(':');
    if(hashcashParams.length != 7) return false;
    if('1' != hashcashParams[0]) return false; // version
    if(parseInt(hashcashParams[1], 10) < conditions.bits) 
        return false; // require bits
    if(conditions.resource && hashcashParams[3] != conditions.resource)
        return false; // assert resource
    if(!/^[0-9]{12}$/.test(hashcashParams[2]))
        return false; // check timestamp format


    // 2. check hashcash timestamp
    var timestr = '20' + hashcashParams[2];
    var datetime = new Date(
        timestr.slice(0, 4) + '-' +
        timestr.slice(4, 6) + '-' +
        timestr.slice(6, 8) + 'T' +
        timestr.slice(8, 10) + ':' +
        timestr.slice(10, 12) + ':' +
        timestr.slice(12, 14) + 'Z'
    );
    var nowtime = new Date();
    if(
        Math.abs(nowtime.getTime() - datetime.getTime()) / 1000 > 
        conditions.timediff
    )
        return false;


    // 3. validate bits declaration
    var hashcashSHA1 = require('crypto').createHash('sha1').update(hashcash);
    var hashcashSHA1HEXDigest = hashcashSHA1.digest('hex');
    var decToBinTable = [
        '0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111',
        '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111',
    ];
    var hexToDecTable = '0123456789abcdef';
    var hashcashSHA1BinDigest = '';
    for(var i=0; i<hashcashSHA1HEXDigest.length; i++)
        hashcashSHA1BinDigest += 
            decToBinTable[hexToDecTable.indexOf(hashcashSHA1HEXDigest[i])];
    for(var i=0; i<conditions.bits; i++)
        if(hashcashSHA1BinDigest[i] != '0') return false;

    // 4. validate double spent, or cache for non-double spent
    if(inCache(hashcashSHA1HEXDigest)) return false;
    var cacheUntil = nowtime.getTime() + conditions.timediff * 1000;
    addCache(hashcashSHA1HEXDigest, cacheUntil);

    return true;
};

module.exports = validateHashcash;

console.log(validateHashcash('1:23:141227153138:test::14hrjNtYaQjQaSm7:0000000HU/8', {resource: 'test', bits: 23}))
console.log(validateHashcash('1:23:141227153138:test::14hrjNtYaQjQaSm7:0000000HU/8', {resource: 'test', bits: 23}))
