---
title: "Evil JS: Macros"
date: June 16, 2013
comments: true
---

*Note: Don't try this at work. This is bad code that shouldn't be used in production.*

As every JS hacker knows, `eval` is evil. It's slow, insecure, and generally unnecessary. The same goes for the `Function` constructor, which can, but shouldn't be used to create functions using strings to specify the arguments and body. But the badness of `eval` and `Function` doesn't mean you can't have some fun with them.

`Function.prototype.toString` is a function that returns the source code of the function it's called from. For example,
``` javascript
var add = function(x, y) {
	return x + y;
};

add.toString();
/*
"function (x, y) {
	return x + y;
}"
*/
```
This is a feature that is mostly used in debugging, but you'll note that since we can get the function as a string, we can modify it and pass it to the Function constructor. This allows us to implement a feature JS has been sorely lacking, C-style macros!

### Simple Replacements
So the first thing to implement is simple replacements, like #defines without arguments. Let's use an object to represent these definitions:
``` javascript
var defines = {
	PI : '3.14159',
	E : '2.71828',
	GREETING : '"Hello, "'
};
```

And now we can implement the first version of the JS preprocesser (let's call it the JSPP). It takes a definition object and a function and returns another function with the macro expansion applied:
``` javascript
function getBody(fn) { // Gets the body of a function as a string
	fnStr = fn.toString();
	return fnStr.slice(fnStr.indexOf('{') + 1, fnStr.lastIndexOf('}'));
};

function getArgs(fn) { // Gets the arguments of a function as an array of strings
	fnStr = fn.toString();
	return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).split(',').map(function(x) { return x.trim(); });
}

function JSPP(defines, fn) {
	var args = getArgs(fn);

	// Do the replacements
	var body = Object.keys(defines)
		.reduce(function (text, replacement) {
			// Uses a RegExp to ensure that the macro name has non-word characters on either side
			// Note that macro names should only use \w characters
			return text.replace(RegExp('(\\W+)' + key + '(\\W+)', 'g'), '$1' + defines[key] + '$2');
		}, getBody(fn));
	
	// Use the function constructor to rebuild the function
	return Function.apply(null, args.concat(body));
}
```

Example usage:
``` javascript
var defines = {
	PI : '3.14159',
	E : '2.71828',
	GREETING : '"Hello, "'
};

var doStuff = JSPP(defines, function(val) {
	return typeof val === 'number' ? PI + E * val : GREETING + val;
});

doStuff(2) // 8.57815
doStuff('Bob') // Hello, Bob
doStuff.toString() // function anonymous(val) { return typeof val === 'number' ? 3.14159 + 2.71828 * val : "Hello, " + val; }
```

### Function-like Macros
Okay, let's go one level deeper: macro arguments. We'll use the same syntax as the `Function` constructor, argument strings followed by body, except in an array:
``` javascript
var defines = {
	ABS : ['x', '((x)<0?-(x):(x))']
};
```

And the new (buggy) JSPP implementation:
``` javascript
function getBody(fn) { // Gets the body of a function as a string
	fnStr = fn.toString();
	return fnStr.slice(fnStr.indexOf('{') + 1, fnStr.lastIndexOf('}'));
};

function getArgs(fn) { // Gets the arguments of a function as an array of strings
	fnStr = fn.toString();
	return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).split(',').map(function(x) { return x.trim(); });
}

function JSPP(defines, fn) {
	var args = getArgs(fn);

	// Do the replacements
	var body = Object.keys(defines)
		.reduce(function (text, key) {
			if (typeof defines[key] === 'string') { // Do a simple replacement
				return text.replace(RegExp('(\\W+)' + key + '(\\W+)', 'g'), '$1' + defines[key] + '$2');
			} else { // Do a replacement with arguments
				// First, convert the arguments into regex replacement patterns, such as $1 or $23
				var macroBody = defines[key][defines[key].length - 1];
				var macroArgs = defines[key].slice(0, -1);
				var replacement = macroArgs.reduce(function(text, arg, index) {
					return text.replace(RegExp(arg, 'g'), '$' + (index + 1));
				}, macroBody);
				// Now, use RegExp capturing to apply the replacement
				// Note that macro names can't have regex metacharacters, macro arguments cannot have commas
				// and will often fail if they have ending parens, and there must be at least one argument.
				// This is a messy, bad, but easy way of doing the replacement,
				// which fits with the theme of the post, I feel.
				return text.replace(RegExp(key + // The macro name
				                           '\\s*\\(\\s*(.+?)' + // The initial paren and first argument
				                           Array(macroArgs.length).join('\\s*,\\s*(.+?)') + // The other args, separated by commas
				                           '\\s*\\)', // The final paren
				                           'g'), replacement);
			}
		}, getBody(fn));
	// Use the function constructor to rebuild the function
	return Function.apply(null, args.concat(body));
}
```

Example usage:
``` javascript
var defines = {
	PI : '3.14159',
	E : '2.71828',
	ABS : ['x', '((x)<0?-(x):(x))'],
	RESISTORS_PARALLEL : ['a', 'b', '((a)*(b)/((a)+(b)))']
};

var doStuff = JSPP(defines, function(val) {
	return RESISTORS_PARALLEL(PI, E) * ABS(val);
});

doStuff(2) // 2.9146452959536644
doStuff(-2) // 2.9146452959536644
doStuff.toString()
/*
function anonymous(val) {
	return ((3.14159)*(2.71828)/((3.14159)+(2.71828))) * ((val)<0?-(val):(val));
}
*/
```

So there you go, everyone's favourite preprocesser partially ported to JavaScript! And while this is not a good use of `Function` and `Function.prototype.toString`, it does show their power. They both have legitimate purposes, and if you're not afraid to go down that road, you can do some pretty wacky stuff with them.
