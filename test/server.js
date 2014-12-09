var http = require('http'),
    dara = require('../dara'),
    fs = require('fs'),
    path = require('path');


var server = http.createServer(function(req, res){
    
    var mashing = dara.send(req, res);
    
    console.log('mashing ', mashing);
    if(!mashing){
        console.log('no mash');
        if(path.basename(req.url) === 'http.html'){
            fs.readFile(path.join(__dirname,'/http.html'), {encoding: 'utf-8'}, function(err, text){
                if(err){
                    res.end(err.message);
                    return;
                }
                
                res.end(text);
            });
        }else{
            res.end('Not a valid address. Use localhost:8080/http.html');
        }
    }
});

server.listen(8080);
