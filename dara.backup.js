(function(isNode, _globals){
"use strict";
//Polyfills, and masking shortcuts.
if (typeof Object.create != 'function') {
  Object.create = (function() {
    var Object = function() {};
    return function (prototype) {
      if (arguments.length > 1) {
        throw Error('Second argument not supported');
      }
      if (typeof prototype != 'object') {
        throw TypeError('Argument must be an object');
      }
      Object.prototype = prototype;
      var result = new Object();
      Object.prototype = null;
      return result;
    };
  })();
}

if (!Object.keys) Object.keys = function(o) {
      if (o !== Object(o))
        throw new TypeError('Object.keys called on a non-object');
      var k=[],p;
      for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
      return k;
    };

if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}

if (!Array.prototype.every) {
  Array.prototype.every = function(callbackfn, thisArg) {
    'use strict';
    var T, k;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the this 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method
    //    of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
    if (typeof callbackfn !== 'function') {
      throw new TypeError();
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0.
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method
        //    of O with argument Pk.
        kValue = O[k];

        // ii. Let testResult be the result of calling the Call internal method
        //     of callbackfn with T as the this value and argument list 
        //     containing kValue, k, and O.
        var testResult = callbackfn.call(T, kValue, k, O);

        // iii. If ToBoolean(testResult) is false, return false.
        if (!testResult) {
          return false;
        }
      }
      k++;
    }
    return true;
  };
}


[].map||(Array.prototype.map=function(a,t){for(var c=this,b=c.length,d=[],e=0;e<b;)e in c&&(d[e]=a.call(t,c[e],e++,c));d.length=b;return d})

var
unbound1 = Object.prototype.hasOwnProperty,
unbound2 = Object.prototype.toString,
unbound3 = Array.prototype.slice,

hasprop = Function.prototype.call.bind(unbound1), 
getType = Function.prototype.call.bind(unbound2),
slice = Function.prototype.call.bind(unbound3),

typeString = function(obj){
    var type = getType(obj);
    return type.substring(type.indexOf(' ')+1, type.indexOf(']'));
},
isType = function(obj, str){
    return typeString(obj) === str;
};

//ie8 you suck
if(typeString(null) === 'Object'){
    typeString = function(obj){
        var type = getType(obj);
        if(obj === null) return 'Null';
        var result = type.substring(type.indexOf(' ')+1, type.indexOf(']'));
        
        if(result === 'Object') if(typeof obj === 'undefined') return 'Undefined';
        return result;
    };
}
/*
dose

*/
function dara(){
    
    var args = slice(arguments);
    
    if(!(this instanceof dara)){
        
        if(args.length > 1 && args.every(function(val){ return isType(val, 'Function'); }))
            return dara.compose.apply(this, args);
        
        return new meld(args);
    }
    
    this.args = (args.length > 0) ? args[0] : [];
}

dara.mix = function(obj, context){
    context = context || false;
    
    for(var n in obj){
        
        if(typeof obj[n] === 'function'){
            
            if(!context){
                dara.prototype[n] = (function(fn){
                    return function(){
                        return fn.apply(this, this.args.concat(slice(arguments)));
                    };
                })(obj[n]);
                
            }else{
                
                dara.prototype[n] = (function(fn, context){
                    return function(){
                        return fn.apply(context, this.args.concat(slice(arguments)));
                    };
                })(obj[n], context);
            
            }
        }else{
            dara.prototype[n] = obj[n];
        }
    }
};


dara.compose = function(){
    var stackSave = slice(arguments);
        
    if(!stackSave.every(function(val){ return getType(val) === '[object Function]'; })){
        return null;
    }
    
    var fn = function(){
        "use strict";
        
        var self = this,
            stack = stackSave.concat([]),
            index = -1,
            len = stack.length,
            fnArgs = slice(arguments);
        
        if(typeof fnArgs[fnArgs.length-1] === 'function'){
            
            stack[stack.length] = fnArgs.pop();
            len = stack.length;
        }
        
        var next = function(){
            var args = slice(arguments);
            
            if(++index < len){
                
                if(index+1 !== len){
                    args[args.length] = next;
                }
                
                return stack[index].apply(self, args);
            }
        };
        
        next.done = function(){
            
            return (++index < len)
                   ? stack[stack.length-1].apply(self, arguments)
                   : undefined;
        };
        
        next.skip = function(){
            index++;
            return next.apply(self, arguments);
        };
        
        next.first = function(){
            index = -1;
            return next.apply(self, arguments);
        };
        
        next.self = function(){
            var args = slice(arguments);
            args[args.length] = next;
            return stack[index].apply(self, args);
        };
        
        
        return next.apply(self, fnArgs);
    };
    
    return fn;
};

dara.computed = function(self, obj){
    if(isType(obj, 'Object')){
    
        for(var n in obj){
            if(typeof obj[n] === 'function'){
                (function(fn, name){
                    Object.definedProperty(self, name, {
                        get: function(){
                            return fn.call(self);
                        }
                    });
                }(obj[n], n));
            }
        }
    }else if(isType(obj, 'String')){
        var fn = arguments[2],
            name = obj;
        
        Object.defineProperty(self, name,{
            get: function(){
                return fn.call(self);
            }
        });
    }
};

dara.computedOnce = function(self, obj){
    if(isType(obj, 'Object')){
    
        for(var n in obj){
            if(typeof obj[n] === 'function'){
                (function(fn, name){
                    var computed = false, value;
                    Object.definedProperty(self, name, {
                        get: function(){
                            if(!computed){
                                value = fn.call(self);
                                computed = true;
                            }
                            
                            return value;
                        }
                    });
                }(obj[n], n));
            }
        }
    }else if(isType(obj, 'String')){
        var fn = arguments[2],
            name = obj,
            computed = false, value;
        
        Object.defineProperty(self, name,{
            get: function(){
                if(!computed){
                    value = fn.call(self);
                    computed = true;
                }
                
                return value;
            }
        });
    }
};


dara.assign = function(self, obj){
    for(var n in obj){
        self[n] = obj[n];
    }
};

dara.messenger = function(){
    
    var connection = function(obj, messenger){
        var stacks = messenger.stacks;
        
        for(var n in stacks){
            
            this[n] = (function(name){
                return function(){
                    
                    var event = messenger.stacks[name],
                        len = event.length;
                    
                    if(event !== null){
                        while(len--){
                            event[len].apply(obj, arguments);
                        }
                    }
                };
            }(n));
            
        }
    };
    
    var m = function(){
        this.stacks = {};
        
        this.on = function(event, fn){
            this.stacks[event] = this.stacks[event] || [];
            this.stacks[event].push(fn);
            
            return this;
        };
        
        this.off = function(event){
            this.stacks[event] = null;
        };
        
        this.connect = function(obj){
            return new connection(obj, this);
        };
    };
    
    
    return new m;
};


dara.getargs = dara.getobject = function(names, arr, fn){
    arr = slice(arr);
    var a = {}, j = -1, fn = fn || false;
    for(var i=0; i=names.length; i++){
        a[names[i]] = (!fn) ? arr[i] : fn(arr[i], arr, i);
    }
    
    for(; args.length; i++){
        a[++j] = (!fn) ? arr[i] : fn(arr[i], arr, i);
    }
    
    return a;
};

var uniq = dara.uniq = function(arr, fn){
    if(!isType(arr, 'Array') && !isType(fn, 'Function'))
        return null;
    
    var result = [], tmp = arr,
    val, fn = fn || false;
    
    while(val = tmp.shift()){
        
        if(result.indexOf(val) < 0){
            
            result.push(!fn ? val : fn(val));
        }
    }
    
    return !fn ? result : uniq(result);
};

var union = dara.union = function(){
    
    var result = [],
        args = slice(arguments),
        temp = args.shift(),
        len = args.length,
        val, index;
        
    
    if(typeString(args[0]) !== 'Array')
        throw new Error('Error dara.union argument 0 is not an array.');
    
    for(var i=0; i<len; i++){
        if(typeString(args[i]) !== 'Array')
            throw new Error('Error dara.union argument '+i+' is not an array.');
        temp = temp.concat(args[i]);
    }
    
    i = -1;
    len = temp.length;
    
    result = uniq(temp);
    
    return result;
    
};

var equals = dara.equals = function(first, second){
    
    var type1 = typeString(first),
        type2 = typeString(second);
    
    if(type1 !== type2) return false;
    
    if(['String', 'Number', 'Boolean'].indexOf(type1) > -1){
        return first === second;
    }
    
    if('Object' === type1){
        for(var n in first){
            if(!second.hasOwnProperty(n)){
                if(!equals(first[n], second[n])){
                    return false;
                }
            }else{
                return false;
            }
        }
        
        return true;
    }
    
    if('Array' === type1){
        if(first.length !== second.length) return false;
        
        for(var i=0, len=first.length; i<len; i++){
            if(!equals(first[i], second[i])){
                return false;
            }
        }
        
        return true;
    }
    
};

dara.pick = function(gets, params, fn){
    
    var type = typeString(params);
        fn = fn || false,
        result, key;
        
    if('Object' === type){
    
        result = {};
        
        for(var i=0, len=gets.length; i<len; i++){
        
            key = gets[i];
            
            if(hasprop(params, key)){
                
                result[key] = !fn ? params[key] : fn(params, key);
            }
        }
        
    }
    
    return result;
};

var merge = dara.merge = function(){
    
    var args = slice(arguments),
        fn = false,
        fnType = typeString(args[args.length-1]),
        result,
        type = typeString(result);
        src,
        current,
        name,
        i;
    
    if(args.length > 2){
        
        if(fnType === 'Function'){
            fn = args.pop();
        }
    }
    
    if(args.every(function(thing){ return isType(thing, 'Array'); })){
        result = [];
        
        while(!fn && src = args.shift()){
            result = result.concat(src);
        }
        
        while(fn && src = args.shift()){
            current = [];
            for(i=0; i<src.length; i++){
                current[i] = fn(src[i], i, src);
                
            }
            result = result.concat(current);
        }
        
        return result;
    }
    
    if(!args.every(function(thing){ return isType(thing, 'Object'); }))
        return undefined;
    
    result = {};
    
    while(src = args.shift()){
        
        for(name in src){
            result[name] = !fn ? src[name] : fn(src[name], name, src);
        }
    }
    
    return result;
    
};




dara.hasprop = hasprop;
dara.getType = getType;
dara.isType = isType;
dara.type = typeString;

dara.mix(dara);

var thisname = 'dara.js';

if(isNode){
    var path = require('path'),
        fs = require('fs'),
        url = require('url');
    
    dara.send = function(req, res, options){
        
        options = options || {};
        
        var root = (options.root) ? options.root : '/',
            basename = path.basename(req.url),
            dirname = path.dirname(url.parse(req.url).pathname),
            modulename = path.join(__dirname, thisname);
        
        if(thisname !== basename)
            return false;
        if(root !== dirname)
            return false;
        
        var readstream = fs.createReadStream(modulename);
        
        res.setHeader('content-type', 'application/javascript');
        readstream.pipe(res).on('error', function(e){
            res.writeHead(500);
            res.end('500 Internal server error.');
            console.log(thisname+' javascript stream failed. 500 error was sent.');
        });
        
        return true;
    };
    
    dara.middleWare = function(options){
        
        return function(req, res, next){
            
            var daraed = dara.send(req, res, options);
            //Continue to the next middle ware
            if(!daraed)
                next();
        }; 
    };
    
    module.exports = dara;
}else{
    window.dara = dara;
}

})(typeof module !== 'undefined' && module.exports, this);
