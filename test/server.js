var http = require('http'),
    mash = require('../mash'),
    fs = require('fs'),
    path = require('path');


var server = http.createServer(function(req, res){
    
    var mashing = mash.send(req, res);
    
    console.log('mashing ', mashing);
    if(!mashing){
        console.log('no mash');
        if(path.basename(req.url) === 'test.html'){
            fs.readFile(path.join(__dirname,'/test.html'), {encoding: 'utf-8'}, function(err, text){
                if(err){
                    res.end(err.message);
                    return;
                }
                
                res.end(text);
            });
        }
    }
});

server.listen(8080);
