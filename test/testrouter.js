var path = require('path'),
    url = require('url'),
    routes = [];

function router(req, res){
    var u = url.parse(req.url),
        _path = u.pathname, m, str = '[';
    
    for(var i=0, len=routes.length; i<len; i++){
        str += routes[i].rawPath+',';
        if(m = _path.match(routes[i].pattern)){
            routes[i].fn(req, res);
            return;
        }
    }
    
    str += ']';
    
    res.end('Nothing found at '+_path+'. Try one of these paths '+str+'.');
}

router.route = function(method, _path, fn){
    
    pattern = '^'+_path.replace(/[/]/, "[/]")+'$';
    routes.push({
        method: method,
        pattern: new RegExp(pattern),
        rawPath: _path,
        fn: fn
    });
};
router.get = function(_path, fn){
    router.route('get', _path, fn);
};

router.post = function(_path, fn){
    router.route('post', _path, fn);
};

module.exports = router;
