var dara = require('../dara');

function first(req, res, next){
    res.data = {
        'greeting': 'Hello world!'
    };
    next(req, res);
}

function second(req, res, next){
    res.data.bye = 'Good bye!'
    next.done();
}


module.exports = {
    doIt: dara(first, second)
};
