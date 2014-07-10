---
title: JS Object Literal Inheritance
date: June 22, 2013
comments: true
---

A JavaScript question that often pops up is "How do I set the prototype of an object literal?" The short answer is that right now, you can't. When ES6 standardizes the `__proto__` property, you'll be able to do so directly, but right now, there's no native language construct. The good news is that it is downright simple to make a helper function that will let you use object literals in inheritance:

```js
function extend(proto, literal) {
	var result = Object.create(proto);
	Object.keys(literal).forEach(function(key) {
		result[key] = literal[key];
	});
	return result;
}
```

You use it by calling it with the parent object as the first argument and the literal with the changes you want to make as the second: `var myObj = extend(parent, {foo : 2, bar : 3});` Here are some more examples:

```js
var dog = {
	mammal : true,
	domestic : true,
	weight : 50,
	speak : function() {
		return "woof";
	}
};

var littleDog = extend(dog, {weight : 10});

littleDog.speak(); // "woof"
littleDog.weight; // 10

var cat = extend(dog, {
	weight : 12,
	speak : function() {
		return "meow";
	},
	breed : "siamese"
});

cat.mammal; // true
cat.speak(); // "meow"
cat.breed; // "siamese"
```

So there you have it, an easy and useful construct for better differential inheritance. I'm sure I'm not the first person to use a function like this, and I bet you can find oodles of helper libraries that have something similar, but I think the ease with which you can make such an extension to JS's OOP model shows how awesome and flexible it is.

##### Notes:
* `extend` requires ES5, or at least shims for `Object.create`, `Object.keys`, and `Array#forEach`. Here's a more complex ES3-compatible version:
```js
var extend = function() {
	function F(){}
	return function(proto, literal) {
		F.prototype = proto;
		var result = new F();
		for (var prop in literal) {
			if (literal.hasOwnProperty(prop)) {
				result[prop] = literal[prop];
			}
		}
		return result;
	};
}();
```
* `Object.create` does take a second parameter that works in the same way as `extend`'s, but it uses property descriptors rather than simple properties. So using it would look something like `var myObj = Object.create(parent, {foo : {configurable : true, writable : true, enumerable : true, value: 2}});`. A bit unwieldy.
* Since `extend` copies the properties over from the object passed as the second parameter, you can use an existing object to specify the differences and it won't be modified.
