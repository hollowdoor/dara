# Dara.js
## A little helper for Javascript async, and functional programming.

**dara uses the MIT license**

## The dara function.

The dara function is an overloaded constructor with several static methods attached to it. It does not need `new` to be instantiated.

If the dara function is called with all function arguments it creates a new function that is composed of those functions. These functions are not simply composed, and some preparation is needed to use this functionality.

See [dara.compose][#dara.compose] to see the explanation of how to use function composition with dara.

## Install and require dara

`npm install dara`
```
var dara = require('dara');
```

## dara(..., all functions or depends on the methods attached)

Because the `dara` function is overloaded and you can attache any function to it, and it's arguments are used by the methods set on it. The arguments passed to it can be potentially any object, or primitive.

## dara.mix(object, context)

This static method is a special function used to add methods to the dara constructor. Use it to add methods that will be a partial application of the instantiation of dara.

**example**
```javascript
dara.mix({
    add: function(arg1, arg2){
        return arg1+arg2;
    },
    callFn: function(fn){
        return fn();
    }
});

var num = dara(2).add(3); //returns 5
console.log(num);

var adder = dara(2);
num = adder.add(3); //still returns 5
console.log(num);

adder.callFn(); //produces an error. The fn argument is not a function.
```

**News**

`dara.mix` also extends the static method space.

Both static, and constructor calls will work.

```javascript
dara.mix({
    myMethod: function(){ /***/ }
});
//The next calls are the same providing the args match the
//myMethod signature.
dara.myMethod(args, ...);
dara(args, ...).myMethod(args, ...);
```

That last call to `adder.callFn` demonstrates the limits of the dara constructor, and why you must be careful using the `mix` method to extend `dara`.

This compromise allows the `dara` constructor to be almost any type of operator. It's a weakness, and a strength. It depends on how careful you are when designing methods you intend to use to extend the dara constructor.

## Static methods

## dara.compose

**example**
```javascript
function first(arg1, next){
    next(arg1+1);
}
function second(arg1){
    console.log(arg1);
}
var fn = dara.compose(first, second);
fn(2); //log 3
```

dara.compose works very similar to middleware like what is used in express so if you like making servers with express this syntax will be familiar to you.

You can return a value from the last function in the composed function, but `dara.compose` is best used for async operations. Never the less the `next` callback can be leveraged in sync operations as well.

## The next callback

The next callback has four static methods for control flow.

* next.done (call the last function)
* next.skip (skip the next function)
* next.first (go back to first introducing recursion through all functions)
* next.self (call the present function)

**example**
```javascript
function first(arg1, next){
    if(arg1 === 1)
        next(arg1+1);
    else
        next.done(arg1+3);
}
function second(arg1, next){
    next(arg1);
}
function third(arg1){
    console.log(arg1);
}
var fn = dara.compose(first, second);
fn(1, third); //log 2
fn(3, third): //log 6
```

Be careful of using next.first, or next.self because the same call stack error that effects regular recursive functions also effects functions composed with `dara`.

**example**
```javascript
function first(arg1, next){
    if(arg1 === 1)
        next(arg1+1);
    else
        next.self(arg1+3);
}
function second(arg1, next){
    next(arg1);
}
function third(arg1){
    console.log(arg1);
}
var fn = dara.compose(first, second);
fn(1, third); //log 2
fn(3, third): //call stack error. Too much recursion.
```

**example**
```javascript
function first(arg1, next){
    if(arg1 > 3)
        next.done(arg1+1);
    else
        next.self(arg1+1);
}
function second(arg1, next){
    next(arg1);
}
function third(arg1){
    console.log(arg1);
}
var fn = dara.compose(first, second);
//This is making a safe call even though the function is naive, and has no other checks like isNaN.
fn(1, third); //log 4
```

The last two examples also demomstrate the async nature of the compose method. A callback in the last argument of a composed function is used last in the virtual call stack created by dara.compose.

So when using dara.compose
```javascript
function callback1(arg1, next){
    next(arg1);
}
function callback2(arg1){
    console.log(arg1);
}
var composedFunction = dara.compose(callback1);
composedFunction(1, callback2);
```
Callback `callback2` is called after `callback1`. `callback2` can also return a value, but it's assumed that the most common use case will be async operations. When the `yield` operator has more support then maybe dara will have added support for return values that work with async operations. Until then dara is meant to used in the browser, and server so it will not contain special support for yield for the time being.

### Notice
*Sorry to all of you who have installed dara before I added the last few amendments to the documentation.*

*The usage of how the last callback works on a composed function from dara.compose should be emphasised. Thank you for your interest.*

### dara(..., function)

dara called with all functions as arguments is the same as calling dara.compose.

## dara(function).compose(function)

dara called with one function then .compose still creates a composition.

## More static methods

**All static methods can be called directly, or after the constructor.**

`dara.method()`, and `dara(args, ...).method()` are the same invocation for the same method name as long as the arguments used are acceptable to the method.

## dara.partial(function)

Make a simple partial function. Internally this method uses the `bind` static function method so it's mostly just a mnemonic reminder of what's being accomplished.

## dara.getargs | dara.getobject

These two do the same thing, but their names are a mnemonic that represents their intended usage for different situations.

**example**
```javascript
var list = [1, 2, 3]; 
dara.getobject(['one', 'two', 'three'], list); //returns an object
/*
{
    'one': 1,
    'two': 2,
    'three': 3
}
*/
```

**example**
```
function nums(one, two, three){
    var args = dara.getargs(['one', 'two', 'three'], arguments);
    return args;
}
nums(1, 2, 3); //returns an object
/*
{
    'one': 1,
    'two': 2,
    'three': 3
}
*/
```

## dara.uniq(array, callback)

Produce an array with unique values. Use an optional callback to process each array member.

## dara.assign(destination, source)

Assign all the members of object `source` to `destination` object.

## dara.uniq(array, callback)

The fastest possible function for making unique member arrays.
Make an array with only unique values. Pass an optional callback to process each member of the array.

## dara.union(array, ...)

Pass any number of arrays, and get a single array made of the unique values of all arrays passed to dara.union

## dara.pick(array, object, callback)

Produce a new object with selected members from `object` using names in `array`. Use an optional callback to operate on `callback(object, key found in array)`.

## dara.merge(object|array, ..., callback)

Create a new object made of all objects, or arrays passed to dara.merge. All arguments must be of the same type as objects, or arrays. Use an optional callback to operate on `callback(current object, key)`. The return value of `callback` can be any value.

dara.merge only makes a shallow copy of passed objects.
dara.merge works similar to dara.union for arrays but no unique operation is done.

If you pass any value that is not an object, or array the value of the first argument is returned.

## dara.sort(array, integer|callback)

Sort an array with natural sort. Optionally specify a sort order by passing a negative number, or a positive number. Positive meaning alpha, and negative meaning reverse alpha. -1, or 1 will work fine for the direction integer.

Optionally pass a callback to create your own sort. This will work like the built in javascript sort.


# Experimental Methods

For all purposes the following methods must be considered experimental for the time being. There will be a possibility of alteration, or removal for all of these.

## dara.messenger()

## dara.computed(object, function|object);

## dara.computedOnce(object, function|object);

