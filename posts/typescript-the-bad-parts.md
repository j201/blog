---
title: "TypeScript: The Bad Parts"
date: July 11, 2014
published: true
---

[TypeScript](http://www.typescriptlang.org/) is Microsoft's attempt to bring type checking to the Wild West of JS. It also brings features such as arrow functions and "classes" inspired by ES6 spec drafts. After working with it for a while, I feel it has some nice bits, but on the whole is sorely lacking. It seems to be trying to turn JS into C# while ignoring the drawbacks and limitations of that approach. Here I'd like to go through the major features of TypeScript and identify how it got them wrong.

###Inexpressive Types

Despite having structural types (yay!), TS has a remarkably inflexible type system. It's lacking many powerful features that are common in modern structural type systems, which reduces its ability to model and verify JS programs. However, TypeScript has an even greater requirement in that it must be able to describe the types of existing JS code, which includes functions that wouldn't be allowed in many strongly typed languages. Even though this is difficult, TS could have done a far better job.

####Union Types

The feature I find the most lacking is union types: where a value can be considered to be one of two types. This is so common in JS that I can't understand why TypeScript wouldn't include it. Sure, you can implement an `Either<TLeft, TRight>` type in TS, but the lack of native support forces the use of `any` [in](https://github.com/borisyankov/DefinitelyTyped/blob/9d88dadf44aaedcabde88053342617575a851f39/easeljs/easeljs.d.ts#L100) [many](https://github.com/borisyankov/DefinitelyTyped/blob/52b37e40fa69c6a57b09578305827294a7c24f36/iscroll/iscroll-5.d.ts#L38) [cases](https://github.com/borisyankov/DefinitelyTyped/blob/dd35f69637817e3f7f8fb23b8d4b033885ad32cd/fancybox/fancybox.d.ts#L100), which removes type verification. One of the first bugs I had to deal with in TypeScript was caused by an Underscore function that returned a number or a given generic type, but the TypeScript annotation simply said that it returned the generic type (a problem that [still exists](https://github.com/borisyankov/DefinitelyTyped/issues/1513)). This problem [has been raised](https://typescript.codeplex.com/workitem/1364), but there doesn't seem to be any interest from the devs, possibly because it's a feature that's alien to languages like C# and Java.

####Higher-kinded Types

Consider the following interfaces:

```
interface Orderable<Coll<T>> {
	sortBy: (comparator: (a: T, b: T) => number) => Coll<T>;
}

interface Mappable<Box<T>> {
	map(f: (el: T) => U)<U>: Box<U>;
}
```

(Those familiar with functors will recognize the second one, but I'm calling it Mappable to keep things accessible.)

These are pretty clear and useful types. They represent, respectively, collections that can be sorted to return the same kind of collection and types that contain a value that can be transformed with a function. You can then use them in less abstract types:

```typescript
interface Sequence<T> extends Mappable<Sequence<T>> {
	first: () => T;
	rest: () => Sequence<T>;
	cons: (t: T) => Sequence<T>;
	empty: () => boolean;
	// Automatically derives:
	// map<U>(f: (el: T) => U): Sequence<U>;
}

function list<T>(): Sequence<T> {
	function cons(e: T, l: Sequence<T>): Sequence<T> {
		var me = {
			first: () => e,
			rest: () => l,
			empty: () => false,
			map: function<U>(f: (el: T) => U) { // See "Annoying Type Syntax" below for why we have to do this
				return l.map(f).cons(f(e))
			},
			cons: v => cons(v, me)
		};
		return me;
	}

	var empty: Sequence<T> = {
		first: () => null,
		rest: () => empty,
		map: () => empty,
		empty: () => true,
		cons: v => cons(v, empty)
	};

	return empty;
}
```

So our sequence type just extended Mappable and automatically got a definition for a map function that takes a `T => U` function and returns a `Sequence<U>`. This is nice for concisenesss and it enables us to write functions that can take any `Mappable` or a similar type and handle them without having to know the underlying implementation. There's just one problem: TypeScript doesn't allow Mappable. More specifically, it doesn't allow nested generics like `Mappable<Box<T>>`, where `Box` and `T`	aren't known by `Mappable`. Instead, we must write `Mappable<T>` where the type signature of `map<U>` is `(f: (t: T) => U) => Mappable<U>`. That means that something extending `Mappable` doesn't have to return the same `Box` type. For example, our sequence's map function could return a promise, an `Either`, a tree, or any other value as long as it implemented `Mappable`. That's a violation of type safety and a failure to represent `map` generically, and, more importantly, it prevents us from encoding useful abstractions like Mappable in such a way that their meaning is clear.

####Failure to Model JS Values

In practice, TS types often can't represent JS values. There are just too many kinds of data and functions that are commonly used in JS for TS's limited type system to handle. One example is using arrays as [tuples](http://msdn.microsoft.com/en-us/library/dd233200.aspx), which are generally implemented in typed language as sequences with a specified number of elements, each with its own type. Again, TypeScript has no support at all, making it impossible to correctly model JS code that uses them.

On the whole, you can look through the TS typings for [just about any JS library](https://github.com/borisyankov/DefinitelyTyped/blob/master/jquery/jquery.d.ts) and tell how bad a job it does by the sheer number of `any`s in places where the actual type is well-defined but inexpressible by TS's poor type system.

(If you want to see a type system with a similar goal to TypeScript that does it a lot better, look at Clojure's [core.typed](https://github.com/clojure/core.typed/wiki).)

###Faulty Type System

And, despite adding a type system for correctness, TypeScript fails to eliminate what's probably the most common error that a type system could fix: `TypeError: <thing> is undefined`. This is because TypeScript does have one kind of union type: every type is actually a union of that type, `null`, and `undefined`. So I can write the following code:

```typescript
var x: number = null;
console.log(x.toString());
```

And TypeScript won't bat an eyelid. In any real JS program, this represents a huge class of errors that will go unchecked. And it doesn't have to be this way; many modern typed languages require you to deal with nil values in a type-safe manner, as they should (Haskell, F#, Rust, OCaml, etc.). Again, this seems to be caused by the unfortunate influence of Java/C# and really reduces the practical benefit of TS.

###Annoying Type Syntax

In many ways, TypeScript's type syntax is limited and annoying to work with.

####Functions

- different ways to define functions
- requirement to name arguments
- interfaces instead of intersection types
- lack of arbitrary type aliases
	- types are limited to interfaces
- no generics with lambdas

###"Classes"

- Don't do that!
- `this` weirdness
- Complect type declaration with behaviour

###Forcing C#-iness

- The mistakes listed above seem to be caused by an attempt to turn JS into C#
- Not doing one thing
- What we should have is:
	- Expressive type definitions a la core.typed
	- ES6 transpilation a la Traceur

###Does It Solve the Problems of JS?
