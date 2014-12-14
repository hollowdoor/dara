(function(isNode, _globals){
"use strict";
//git remote add origin https://github.com/hollowdoor/dara.git
//git push -u origin master
//npm publish
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
dara

*/
function dara(){
    
    var args = slice(arguments);
    
    if(!(this instanceof dara)){
        
        if(args.length > 1 && args.every(function(val){ return isType(val, 'Function'); }))
            return dara.compose.apply(this, args);
        
        return dara.activate(dara, args);
    }
    
    this.flipped = false;
    this.args = args;
}
/**
Instanciate now.
dara.activate(constructor, array);
Bind to create a factory.
var factory = dara.activate.bind(null, constructor);
var result = factory();
http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
*/
var activate = dara.activate = function(constructor, args){
    var args = [null].concat(args);
    var factory = constructor.bind.apply(constructor, args);
    return new factory();
};

dara.partial = function(fn){
    var args = slice(arguments, 1);
    
    return Function.prototype.bind.apply(fn, [null].concat(args));
};



dara.mix = function(obj, context){
    context = context || false;
    
    for(var n in obj){
        
        if(typeof obj[n] === 'function'){
            
            if(!context){
                dara.prototype[n] = (function(fn){
                    return function(){
                        var args = this.args.concat(slice(arguments));
                        if(this.flipped)
                            args = args.reverse();
                        return fn.apply(this, args);
                    };
                })(obj[n]);
                
            }else{
                
                dara.prototype[n] = (function(fn, context){
                    return function(){
                        var args = this.args.concat(slice(arguments));
                        if(this.flipped)
                            args = args.reverse();
                        return fn.apply(context, args);
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
    
    fn.final = function(){
        return function(){
            fn.apply(this, arguments);
        };
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
    if(!isType(arr, 'Array'))
        return null;
    
    fn = fn || false;
        
    var result = [arr[0]], container = {};
    
    for(var i=1; i<arr.length; i++){
        if(!container[arr[i]]){
            container[arr[i]] = 1;
            result.push(!fn ? arr[i] : fn(arr[i]));
        }
    }
    
    return result;
};

var union = dara.union = function(){
    
    
    
    var result = [],
        args = slice(arguments),
        temp = args.shift(),
        len = args.length,
        val, index;
    
    if(!args.every(function(one, i){ index = i; return isType(one, 'Array'); }))
        throw new Error('Error in dara.union: argument '+index+' is not an array.');
    
    for(var i=0; i<len; i++){
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
        type = typeString(result),
        src,
        current,
        name,
        i;
    
    if(args.length > 2){
        
        if(fnType === 'Function'){
            fn = args.pop();
        }else if(fnType === 'String'){
            args.pop();
        }
    }
    
    if(args.every(function(thing){ return isType(thing, 'Array'); })){
        result = [];
        
        while(!fn && (src = args.shift())){
            result = result.concat(src);
        }
        
        while(fn && (src = args.shift())){
            current = [];
            for(i=0; i<src.length; i++){
                current[i] = fn(src, i);
                
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
            result[name] = !fn ? src[name] : fn(src, name);
        }
    }
    
    return result;
    
};

/*
http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm/
http://js-naturalsort.googlecode.com/svn/trunk/naturalSort.js
*/

/*
 * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
 */
 /*
 function naturalSort (a, b) {
    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD)
        if ( xD < yD ) return -1;
        else if ( xD > yD ) return 1;
    // natural sorting through split numeric strings and default strings
    for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL) {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL) return -1;
        if (oFxNcL > oFyNcL) return 1;
    }
    return 0;
}*/

/*
 *createSort using the above natural sort modified with a direction.
 */

function createSort(direction){
    
    direction = direction || 1;
    
    if(direction < -1 || direction > 1){
        direction = 1;
    }
    
    function naturalSort (a, b) {
        var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
            sre = /(^[ ]*|[ ]*$)/g,
            dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
            hre = /^0x[0-9a-f]+$/i,
            ore = /^0/,
            i = function(s) { return naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
            // convert all to strings strip whitespace
            x = i(a).replace(sre, '') || '',
            y = i(b).replace(sre, '') || '',
            // chunk/tokenize
            xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            // numeric, hex or date detection
            xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
            yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
            oFxNcL, oFyNcL;
        // first try and sort Hex codes or Dates
        if (yD)
            if ( xD < yD ) return -1 * direction;
            else if ( xD > yD ) return 1 * direction;
        // natural sorting through split numeric strings and default strings
        for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
            // find floats not starting with '0', string or 0 if not defined (Clint Priest)
            oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
            oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
            // handle numeric vs string comparison - number < string - (Kyle Adams)
            if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1  * direction: -1 * direction; }
            // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
            else if (typeof oFxNcL !== typeof oFyNcL) {
                oFxNcL += '';
                oFyNcL += '';
            }
            if (oFxNcL < oFyNcL) return -1 * direction;
            if (oFxNcL > oFyNcL) return 1 * direction;
        }
        return 0;
    }
    
    naturalSort.insensitive = createSort.insensitive || false;
    
    return naturalSort;
}

var sort = dara.sort = function(arr, fn){
    
    if(isType(fn, 'Function')){
        return arr.sort(fn);
    }else if(isType(fn, 'Number')){
        return arr.sort(createSort(fn));
    }else{
        return arr.sort(createSort());
    }
};




dara.hasprop = hasprop;
dara.getType = getType;
dara.isType = isType;
dara.type = typeString;

dara.mix(dara);

dara.prototype.flip = function(){
    this.args = this.args.reverse();
    this.flipped = true;
};

dara.prototype.unFlip = function(){
    if(this.flipped){
        this.args = this.args.reverse();
        this.flipped = false;
    }
};

var thisname = 'dara.js';

if(isNode){
    var bestow = require('bestow');
    
    dara.send = bestow.createSender('dara.js', __dirname);
    dara.middleWare = bestow.createMiddleware('dara.js', __dirname);
    
    module.exports = dara;
}else{
    window.dara = dara;
}

})(typeof module !== 'undefined' && module.exports, this);
