var router = require('./testrouter'),
    http = require('http'),
    dara = require("../dara");

dara.extend(require("./toextend"));

router.get("/", function(req, res){
    res.end('home!');
});

router.get("/test", function(req, res){
    res.end('this is a test!');
});

router.get("/mix", function(req, res){
    dara.mix({
        speak: function(){
            return "Hello world!";
        }
    });
    
    res.end(dara.speak());
});

router.get("/extend", function(req, res){
    
    
    res.end(dara.speak());
});

http.createServer(function(req, res){
    router(req, res);
}).listen(3000);

