---
title: Expressing Yourself
date: April 20, 2014
desc: "What 'expressive programming' means and how your language can help"
comments: true
---

The concept of 'expressiveness' is one that appears a lot in programming language debates. Broadly speaking, it means the ease with which a language can express ideas. This is often taken to mean whether the language express common constructs prettily and tersely. But I feel that this isn't the whole story. For example, I'm not a fan of 'expressive' syntactical constructs like list comprehensions. Sure, they can express some common list operations in a readable manner, but they're inherently limited to the features supported by the syntax. Once you want to do an operation that isn't part of the list comprehension syntax, you have to fall back on the primitive constructs of the language, and you'd better hope that they don't uglify the whole thing. I feel that an expressive language should go further.

In particular, it bothers me to see people gushing about how the new Python-ish features of ES6 such as `for..of`, list comprehensions, and classes will finally make JS expressive. I disagree for a few reasons:

- Expressive programming is an approach to programming, not a characteristic of the language
- This approach is already possible and easy in JS
- Whether a language can be used expressively is far more determined by its powerful generic features, such as first-class functions and metaprogramming, than problem-specific syntactical constructs, like list comprehensions

Instead, I would contend that expressive programming is about writing operations in a way that closely resembles a simple abstract description of each operation, using as few unimportant programming concerns as possible, and that this can be accomplished without highly specialized syntactical constructs.

I'll show some code to explain. A simple example of a non-expressive construct is the for loop. For example, it's commonly used to do a thing for each element of an array:

``` javascript
for (var i = 0; i < arr.length; i++) {
	// Do stuff with arr[i]
}
```

Conceptually, we want to just do something for each element of an array, but the for loop forces us to deal instead with handling an index variable and using it. This is an example of [incidental complexity](http://en.wikipedia.org/wiki/Accidental_complexity): it's an implementation detail we don't care about and that gets in the way of expressing the idea we want to express. A more expressive formulation would be the following:

``` javascript
forEach(arr, el => {
	// Do stuff with el
});
```

You'll note that this is very close to our original statement of the problem: *do a thing for each element of an array*, just with the words rearranged. It's way more expressive than the for loop, and we can make it ourselves very easily without needing to wait for the language designers to add special syntactical constructs like `foreach` or `for of` loops:

``` javascript
function forEach(arr, fn) {
	for (var i = 0; i < arr.length; i++) {
		fn(arr);
	}
}
// arr.forEach can be used instead, but I'm reimplementing it for the sake of argument
```

This shows why higher order functions are so important for expressive programming. They let you make abstractions like our forEach function that can abstract over behaviour, rather than just dealing with data structures. This means you have far more flexibility in the expressive constructs you use and you have access to a much wider variety of them without being limited by the syntactical constructs of the language. Any decent functional list library will have a range of functionality many times bigger than specialized list handling syntax can muster.

What this example also shows is that expressive programming is not just a characteristic of the language, it's an approach the programmer must take. This is especially true in JavaScript, where you have access to both high-level functional approaches and low-level C-ish constructs like loops and switch statements. And I would point to Scheme as a great example of a language that despite having few specialized features can be programmed very expressively (see SICP and the beautiful functions therein).

A good way to get used to this approach is to tackle problems in the following way:

- Determine an approach that will solve your problem in terms of simpler and more generic operations
- Write that approach in a straightforward expressive way, even if it means using functions you don't have yet
- Implement those functions the same way, writing them expressively in terms of smaller problems
- Continue until all of the necessary functions are implemented
	- In some cases, generic operations might need to use low-level approaches, like the `forEach` function above

Let's do an example. [Project Euler problem 3](http://projecteuler.net/problem=3) asks for the largest prime factor of 600851475143. I'll use ES6 arrow functions for readability, but these are easily translatable into normal JS functions.

``` javascript
var projectEuler3 = () =>
	Math.max.apply(null, primeFactors(600851475143));
```

So, we've expressed exactly what we're looking for: the maximum element of the list of prime factors of 600851475143. Now, we need to implement primeFactors. Let's use the following algorithm:

- Find the first number from 2 to sqrt(x) that is a factor of x
- If such a number exists, return that number, along with the prime factors of x divided by that number
- Otherwise, return an array just with x (because x is prime)

``` javascript
var primeFactors = x => {
	var factor = find(range(2, Math.floor(Math.sqrt(x)) + 1),
		n => isFactor(n, x));
	return factor !== null ?
		[factor].concat(primeFactors(x / factor)) :
		[x];
};
```

Again, really close to how we expressed the solution. But we used the functions `find`, `range`, and `isFactor`, so let's implement those. (The reason for adding one to the square root calculation is that range functions are generally inclusive on the lower bound and exclusive on the upper bound.)

``` javascript
var isFactor = (a, b) => isInteger(b / a);

var isInteger = x => x % 1 === 0;
```

A number is a factor of another if the result of their division is an integer, and a number is an integer if the number modulo one is zero. Reads like a book, although in reality you certainly wouldn't constantly reimplement these.

Now we're down to more generic, simpler functions. Unfortunately, given the features JS provides, these have to be a bit more low-level. But they're still much shorter and easy to understand than the monolithic solutions you usually see for these kinds of problems. They're also generic enough to be gotten from libraries or put in a library and reused.

``` javascript
var find = (arr, pred) => {
	for (var i = 0; i < arr.length; i++)
		if (pred(arr[i]))
			return arr[i];
	return null;
};

var range = (from, to) => {
	var result = [];
	for (var n = from; n < to; n++)
		result.push(n);
	return result;
};
```

So here, we're using `for` loops to implement more the more abstract operations of finding the first element of a list that matches a predicate (a higher order function!) and getting a range of numbers. Any decent functional list library will provide similar functions, and `Array.prototype.find` is coming in ES6.

[And we're done!](http://www.es6fiddle.net/hu8fuftc/)

So, this is how I see expressive programming. It's about coding your solutions as closely to the conceptual solutions as possible. This can be done with short, simple, pure functions and taking advantage of higher-order functions to make powerful, expressive abstractions. And it has many benefits:

- The problem-specific functions are short and easily understood 
- Little incidental complexity
- Each function is easily testable and reusable
- Understanding and writing each function has a low cognitive load
- Low-level and difficult-to-read approaches are only used when really necessary
- Allows for easy construction of [abstraction barriers](http://mitpress.mit.edu/sicp/full-text/sicp/book/node29.html)
- No specific syntax needed

So, as a JavaScript programmer, the features I am most excited about in ES6 are those that help with this goal, like arrow functions, which make functions easier to read and use, and the new HOFs coming to Array.prototype. Those are the features that really help expressive programming in JS, not limited syntactical additions.
