var express = require('express'),
    app = express(),
    dara = require('../dara'),
    fs = require('fs'),
    path = require('path');


app.use(dara.middleWare());

app.get('/', function(req, res){
    res.end('hello');
});

app.get('/exp.html', function(req, res){
    fs.readFile(path.join(__dirname,'/exp.html'), {encoding: 'utf-8'}, function(err, text){
        if(err){
            res.end(err.message);
            return;
        }
        
        res.end(text);
    });
});

app.listen(3000);
