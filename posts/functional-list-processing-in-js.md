---
title: Functional List Processing in JS
date: September 27, 2013
comments: true
---

Many functional programming languages such as Scheme, Clojure and Haskell are heavily based on list processing, which has proved to be a useful approach for dealing with data and code alike. In particular, they tend to have a wide range of useful list processing functions that can simplify the use of lists while allowing them to replace constructs like loops. While JS doesn't share the elegance or theoretical purity of such languages, it took some cues from them in ES5 when the `map`, `reduce`, `reduceRight`, `some`, `every`, and `filter` functions were added to `Array.prototype`. These higher-order functions added flexibility, better scoping, and simplicity to programming techniques that were usually previously accomplished with `for` loops. JS is still lacking many of the useful features that functional languages use for creating and processing lists, but many of them can be implemented fairly easily in order to make it easier to use arrays and banish loops once and for all.

##`range`, or list comprehensions without the sugar

Languages like Python and CoffeeScript have [list comprehensions](http://en.wikipedia.org/wiki/List_comprehension): terse syntaxes for making lists with given ranges and constraints. However, I agree with the LISP philosophy that you shouldn't solve such simple problems by throwing more syntax at them - existing syntax should be used instead. For example, Clojure uses a couple of regular functions to do the same thing: whereas you could write `(i * 5 for i in [1..5])` in CoffeeScript, the equivalent Clojure would look like `(for [i (range 1 6)] (* i 5))`, which justs uses function calls and a binding form, maintaining syntactic simplicity. Well, the same approach can be applied in JavaScript with the following helper function:

```javascript
function range(startOrEnd, end, step) {
	var start;
	if (arguments.length > 1) {
		start = startOrEnd;
	} else {
		start = 0;
		end = startOrEnd;
	}
	step = step || 1;

	if (step > 0 && start > end || step < 0 && start < end)
		return [];

	var result = [];
	if (step > 0)
		for (var i = start; i < end; i += step)
			result.push(i);
	else
		for (var i = start; i > end; i += step)
			result.push(i);
	return result;
}
```

This function acts more or less the same way as [Clojure's range function](http://clojuredocs.org/clojure_core/clojure.core/range):

```javascript
range(5); // [0, 1, 2, 3, 4]
range(-2, 3); // [-2, -1, 0, 1, 2]
range(10, 0, -1); // [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
```

So, first of all, this pretty much replaces `for` loops. Instead of writing `for (var i = 0; i < 10; i += 2) { ...`, you can write `range(0, 10, 2).forEach(function(i) { ...`, which is clearer in my opinion and carries other stylistic benefits. Also note that if you use `map` instead of `forEach`, you can get an array of results as well as getting the for loop behaviour, which can be very convenient and which brings us to our final goal of emulating list comprehensions:

```javascript
range(1, 6).map(function(x) { return x * 5;}); // Tadaa! [5, 10, 15, 20, 25]
```

That's nice and useful, but not very pretty. Fortunately ES6 arrow functions will make it look much nicer. (ES6 also has list comprehensions, which I don't think are really necessary, but ES6 is proving to be a mish-mash of features anyway).

```javascript
range(1, 6).map(x => x * 5); // [5, 10, 15, 20, 25]
```

And there you have it: the `for` loop and loop comprehension killer. You'll occasionally see hacks like `Array.apply(null, Array(10)).map(Number.call, Number)` to get a range on the fly, but you're much better off doing it properly with a helper function or using one from a library like Underscore.

More than any other function on this page, I'd like to see this implemented as a native function, `Array.range` perhaps. It's really the last piece in the puzzle to making full use of `forEach`, `map`, etc.

## Zipping around

```javascript
function zipWith(fn) {
    var arrays = Array.prototype.slice.call(arguments, 1);
    if (arrays.length < 2)
        throw new Error('zip requires at least 2 arrays');

    var length = arrays.slice(1).reduce(function(minLength, arr) {
        return arr.length < minLength ? arr.length : minLength;
    }, arrays[0].length);
    
    var result = [];
    for (var i = 0; i < length; i++) {
        result.push(fn.apply(null, arrays.map(function(arr) {
            return arr[i];
        })));
    }
    return result;
    
    /* 
	 * If you have range(...), this last section could be expressed more cleanly as
     * return range(length).map(function(i) {
     *     return fn.apply(null, arrays.map(function(arr) {
     *         return arr[i];
     *     }));
     * });
     */
}
```

This one is in Haskell and Clojure (as `map`). It takes a function as its first parameter and at least two arrays as subsequent parameters, then it returns an array of the results of calling the function with the array elements at the corresponding indices as arguments. So for example, if you called `zipWith(fn, arr1, arr2)`, it would return `[fn(arr1[0], arr2[0]), fn(arr1[1], arr2[1]), fn(arr1[2], arr2[2]), ...]`. `zipWith.apply(...)` is especially useful for working with matrices, but it has a range of other uses. Here are a couple of practical examples:

```javascript
var arr1 = [1, 2, 3], arr2 = [6, 2, -1];

// Sum the corresponding elements of the arrays
zipWith(function(a, b) { return a + b; }, arr1, arr2); // [7, 4, 2]

// Test if the arrays are equal
zipWith(function(a, b) { return a === b; }, arr1, arr2).every(function(x) { return x; }); // false
```

And while we're talking about array equality,

##Array equality

When you're using arrays as your main data structure, you need to be able to check whether one array has the same values as another. There are good reasons for arrays to be treated as unique for comparison operators, but you _will_ need an equation like this in order to do functional-style list processing. Note that this uses deep equality testing for arrays and shallow equality testing for other objects.

```javascript
function arraysEqual(arr1, arr2) {
	if (arr1.length != arr2.length)
		return false;
	if (arr1 == null || arr2 == null)
		return arr1 === arr2;
	
	for (var i = 0; i < arr1.length; i++) {
		if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
			if (!arraysEqual(arr1[i], arr2[i]))
				return false;
		} else {
			if (arr1[i] !== arr2[i])
				return false;
		}
	}
	return true;
}

arraysEqual([1, 2, [3, 4, 5]], [1, 2, [3, 4, 5]]); // true
arraysEqual([1, 2, [3, 4]], [1, 2, 3, 4]); // false
```

##Repetition

`range` is by far the most useful list builder function, but sometimes it comes in handy to make a list that's just the same thing over and over again:

```javascript
function repeat(times, value) {
	var result = [];
	while (times > 0) {
		result.push(value);
		times--;
	}
	return result;
}
```

And some examples:

```javascript
// Multiplying a string
var googol = '1' + repeat(100, '0').join('');
// "10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"


// Roll 10d6
function rollDie(sides) {
	return Math.floor(Math.random() * sides) + 1;
}

repeat(10, 6).map(rollDie).reduce(function(a, b) { return a + b; }); // 38 (for example)
```

##Nesting and unnesting

Last of all, it's often useful to deal with lists within lists, so here are a couple of functions for that. This first one returns a list split up into a sublists of a given length.

```javascript
function partition(n, array) {
	var result = [];
	var length = Math.floor(array.length / n);

	// Again, range would make this part nicer
	for (var i = 0; i < length; i++) {
		result.push([]);
		for (var j = 0; j < n; j++) {
			result[i].push(array[n * i + j]);
		}
	}
	return result;
}

partition(3, range(9)); // [[0, 1, 2], [3, 4, 5], [6, 7, 8]]

// Make an empty 4*4 matrix
partition(4, repeat(16, 0)); // [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
```

And this takes a nested list and flattens it into a single layer.

```javascript
function flatten(arr) {
	var result = [];
	arr.forEach(function(el) {
		if (Array.isArray(el))
			result = result.concat(flatten(el)); // w00t recursion
		else
			result.push(el);
	});
	return result;
}

flatten([1, 2, [3, 4, [[[5]]]]]); // [1, 2, 3, 4, 5]

flatten(repeat(4, range(2))); // [0, 1, 0, 1, 0, 1, 0, 1]
```

##Conclusion

The point of these functions isn't just to make list processing a bit less wordy; they allow you to manipulate lists in a completely different way. Instead of dealing with lists in they way you generally see in the functions themselves - changing an index variable to represent the current element, pushing and changing arrays of results, etc. - you can express most list functions in a single statement, with no variable modifications whatsoever. Then, you can build up list operations and eventually entire programs by combining such functions into other functions, without having to mentally keep track of variables changing state. It takes some getting used to, but it's a great way to program.

Here's an example: the [Vigenère cipher](http://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher). Basically, it's a Caesar cipher, but each letter is shifted by a different amount depending on a key, which if too short is repeated.

```javascript
// Does modular addition of capital letters, e.g., Y + D = B
function modAddCapsLetters(a, b) {
    return String.fromCharCode((a.charCodeAt(0) + b.charCodeAt(0) - 65 * 2) % 26 + 65);
}

// The imperative way
function vigenereImp(str, key) {
    var keyPos = 0, result = "";
    for (var i = 0; i < str.length; i++) {
        result += modAddCapsLetters(str.charAt(i), key[keyPos]));
        keyPos++;
        if (keyPos >= key.length)
            keyPos = 0;
    }
    return result;
}

// The functional way
function vigenere(str, key) {
	var keyRepeats = Math.ceil(str.length / key.length),
	    repeatedKey = flatten(repeat(keyRepeats, key.split('')));
	return zipWith(modAddCapsLetters, str.split(''), repeatedKey).join('');
}

vigenere("LOOPSAREFORTHEWEAK", "LISPY");
// "WWGEQLZWUMCBZTUPIC"

```

So the imperative way does it step by step. It creates a variable `i` that increases for each letter, a variable `keyPos` that increases for each letter but gets reset to 0 once it's equal to the key length, and then shifts the letter in the input string by the given letter in the key. It concatenates each one to the end of a result string then returns it. Simple enough, but increases in complexity based on the amount of mutable data you have to keep track of. The functional way, instead, finds out how many times to repeat the key, creates a new array of letters with the key repeated the necessary amount, and then zips that with the original string using `modAddCapsLetters`. It's really a matter of preference, but I find the latter way of doing things conceptually simpler, and that helps a lot when building larger programs.

Check out Underscore or Lo-Dash for implementations of many of these functions.
