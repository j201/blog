---
title: "Evil JS: With Considered Somewhat Useful"
date: August 3, 2013
desc: "Why `with` isn't as awful as you think"
comments: true
---

*Note: Do not try this at work. It's not that bad but your coworkers and Douglas Crockford might get cross.*

`with` statements are a little-used, oft-reviled, and underappreciated part of JavaScript. Basically, they allow you to write a statement, often a block, with the properties of a given object added to the scope. Here's an example:

``` javascript
var x = Math.cos(3/2 * Math.PI);

with(Math) {
	var y = cos(3/2 * PI);
}

x; // -1
y; // -1
```

The thing is, `with` statements are almost universally renounced in the JavaScript community. For example, you can read Douglas Crockford's attack on `with` from 2006 [here](http://yuiblog.com/blog/2006/04/11/with-statement-considered-harmful/). First of all, `with` can slow code down by making it difficult for the engine to know what variable is being referred to. But the main problem with `with` is that it complicates JS's notion of scope. Without `with`, the variables available in a scope are all of the global variables plus any variables made in local scopes using `var` or `function` statements. All of these variables can be both accessed and modified. But using `with` adds variables to the local scope that were not declared with a `var` or `function` statement and shadow those that were. Here's an example of the confusion that can be caused:

``` javascript
var obj = {
	a : 1,
	b : 2
};

with (obj) {
	a = 3;
	var b = 4;
	b = 5;
	c = 6;
}
```

Now, what are the values of `obj.a`, `obj.b`, `obj.c`, `a`, `b`, and `c`? ANSWER: <span class="spoiler">`obj` is `{a : 3, b : 5}`, `a` isn't defined, `b` is 4, and `c` is 6.</span>

So there are good reasons to avoid `with`. In fact, ES5's strict mode prohibits its use. But the level of hatred and fear directed at it isn't proportional to its flaws and ignores the legitimate uses of with, which I'll cover now.

###Libraries and Modules

To use a library in JS, one generally has to constantly refer to its object when using its functions, for example using `jQuery.ajax` instead of `ajax`. This has led JS libraries to adopt short names such as `goog`, `_`, or `$` for somewhat easier typing, but with the costs of poor readability and losing useful short local variable names. Not adding the library functions to the scope is fine for libraries that you aren't using much, but can be inconvenient for libraries you're using heavily, which is why most programming languages provide a way to import the functions of a module into the current scope. Well, JS has one too:

``` javascript
// Returns a random angle in radians from a circle divided into the given number of steps

function randomAngle(steps) {
	with(Math) {
		if (!steps)
			return random() * 2 * PI;
		else
			return floor(random() * steps) / steps * 2 * PI;
	}
}

function randomAngle2(steps) {
	if (!steps)
		return Math.random() * 2 * Math.PI;
	else
		return Math.floor(Math.random() * steps) / steps * 2 * Math.PI;
}
```

Yes, it's the same `Math` example. But it shows an important point: `with` can make dealing with libraries and built-in modules a lot easier. Unfortunately, with current attitudes towards `with`, we're stuck waiting until ES6 for a (hopefully) accepted way to do this.

###Block Scope

One oddity that makes JavaScript different from most C-style languages is the lack of block scope. Instead of local variables beings scoped to nearest block they're declared in (delimited by `{` and `}`), like in C or Java, JS variables are scoped to the nearest `function() {...}` in which they are declared. This is mostly fine (and in my opinion, not a problem at all if you use higher order array iterators), but can be occasionally problematic.

A common issue in asynchronous JS is using callbacks in a loop:

``` javascript
for (var i = 0; i < 5; i++) {
	setTimeout(function() { console.log(i); }, 10);
}

// From console:
// 5
// 5
// 5
// 5
// 5
```

So, since the `for` loop finished executing before the callbacks were executed, the value of `i` is 5 every time.  In other languages, to get around this, you'd just add a block-scoped variable for each iteration of the loop. In fact, this can be done right now in Firefox, but won't be standard until ES6 (see Solution 1 below). So, the standard solution is to wrap the whole thing in an [IIFE](http://en.wikipedia.org/wiki/IIFE) (see Solution 2) which is widely supported, but adds a lot of visual noise. The other solution is to use `with` to emulate a block scope (Solution 3):

``` javascript
// Solution 1 - Elegant, but not widely supported
for (var i = 0; i < 5; i++) {
	let j = i; // A block scoped variable
	setTimeout(function() { console.log(j); }, 10);
}

// Solution 2 - Idiomatic but ugly
for (var i = 0; i < 5; i++) {
	(function(j) {
		setTimeout(function() { console.log(j); }, 10);
	})(i);
}

// Solution 3 - Widely supported and readable
for (var i = 0; i < 5; i++) {
	with ({j : i})
		setTimeout(function() { console.log(j); }, 10);
}

// From console:
// 0
// 1
// 2
// 3
// 4
```

Basically, `with` lets you make block scoped variables. In fact, it's very similar to the `let` blocks that are coming in ES6:

``` javascript
var a;

let (b = 2, c = 3) {
	a = b + c;
}

a; // 5

with ({b : 4, c : 7}) {
	a = b + c;
}

a; // 11
```

So, while function scoped variables are usually adequate, `with` lets you use block scoping when you need it.

###Summary

####Pros:

- `with` makes it easier to work with libraries and modules.
- `with` allows you to clearly emulate block scope.
- In general, using `with` sparingly can make your code easier to read and write.

####Cons:

- Using `with` poorly can result in unclear code.
- `with` is rejected by most linters and style guides.
- `with` can make code slower.
- ES5 strict mode forbids the use of `with`.

###Conclusion

I've identified two cases where `with` can make for clearer code and emulate features that exist in most other languages. However, the JS community's aversion to `with` makes it almost unusable except in personal projects. Fortunately, both of its use cases will be replaced in ES6 by `let` and `import`, but for now, many coders are depriving themselves of a useful tool.So, don't use it at work, but if you have some hobby coding where readability is more important than speed, don't be too afraid to use `with`.
