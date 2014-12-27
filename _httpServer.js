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

function _processData(data){
};

function processPost(req, res){
    var data = '', terminated = false;
    req.on('data', function(d){
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
        _processData(data);
    });
};


return function(req, res){
    if(req.method != 'POST') return returnStaticPage(res);
    processPost(req, res);
};
//////////////////////////////////////////////////////////////////////////////
};
