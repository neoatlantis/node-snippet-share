var buffer = require('buffer');

module.exports = function(config){
//////////////////////////////////////////////////////////////////////////////
function _returnStaticPage(res){
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

function processGet(req, res){
    var url = require('url').parse(req.url).pathname;
    var r36 = url.slice(-36);
    if(/^[0-9a-f]{8}\-([0-9a-f]{4}\-){3}[0-9a-f]{12}$/.test(r36))
        return require('./_processGet.js')({
            config: config,
            uuid: r36,
        }, res);
    _returnStaticPage(res);
};

function processPost(req, res){
    var data = new buffer.Buffer(0), terminated = false;
    var sha1sum = require('crypto').createHash('sha1');

    var hashcash = require('url').parse(req.url).pathname;
    if(null != hashcash) hashcash = hashcash.slice(1);

    console.log("New post: " + hashcash);

    req.on('data', function(d){
        sha1sum.update(d);
        data = buffer.Buffer.concat([data, d]);
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
    if(req.method == 'POST') return processPost(req, res);
    if(req.method == 'GET') return processGet(req, res);
    res.writeHead(405);
    res.end();
};
//////////////////////////////////////////////////////////////////////////////
};
