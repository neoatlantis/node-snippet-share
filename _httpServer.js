module.exports = function(config){
//////////////////////////////////////////////////////////////////////////////
function returnStaticPage(res){
    var html 
        = "<!DOCTYPE html><html>"
        + "<head><title>Snippet Server</title></head>"
        + "<body>"
        + "<h1>Snippet Server</h1><hr />"
        + "<!-- <![CDATA[\n" + JSON.stringify(config.hashcash) + "\n]]> -->"
        + "</body>"
        + "</html>"
    ;
    res.end(html);
};

function processPost(req, res){
    var data = '', terminated = false;
    var sha1sum = require('crypto').createHash('sha1');

    var hashcash = require('url').parse(req.url).pathname;
    if(null != hashcash) hashcash = hashcash.slice(1);

    req.on('data', function(d){
        sha1sum.update(d);
        data += d;
        if(data.length > config.max){
            try{
                res.writeHead(413);
                res.end();
                req.socket.end();
            } catch(e){
            };
            terminated = true;
            return;
        };
    });
    req.on('end', function(){
        if(terminated) return;
        terminated = true;
        require('./_processPost.js')(
            {
                config: config,
                hashcash: hashcash,
                sha1HEXDigest: sha1sum.digest('hex'),
                data: data,
            },
            res
        );
    });
};


return function(req, res){
    if(req.method != 'POST') return returnStaticPage(res);
    processPost(req, res);
};
//////////////////////////////////////////////////////////////////////////////
};
