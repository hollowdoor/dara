var express = require('express'),
    app = express(),
    dara = require('../dara'),
    fs = require('fs'),
    path = require('path'),
    libdara = require('./libdara');


app.use(dara.middleware());

app.get('/greeting', function(req, res, next){
    libdara.doIt(req, res, function(){
        next();
    });
});

app.get('/greeting', function(req, res){
    res.send(JSON.stringify(res.data));
});

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
