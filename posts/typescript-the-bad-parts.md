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

```typescript
interface Orderable<Coll<T>> {
	sortBy: (comparator: (a: T, b: T) => number) => Coll<T>;
}

interface Mappable<Box<T>> {
	map: <U>(f: (el: T) => U) => Box<U>;
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
			map: <U>(f: (el: T) => U) => l.map(f).cons(f(e)),
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

So our sequence type just extended Mappable and automatically got a definition for a map function that takes a `T => U` function and returns a `Sequence<U>`. This is nice for concisenesss and it enables us to write functions that can take any `Mappable` or a similar type and handle them without having to know the underlying implementation. There's just one problem: TypeScript can't do that. More specifically, it doesn't allow nested generics like `Mappable<Box<T>>`, where `Box` and `T`	aren't known by `Mappable`. Instead, we must write `Mappable<T>` where the type signature of `map<U>` is `(f: (t: T) => U) => Mappable<U>`. That means that something extending `Mappable` doesn't have to return the same `Box` type. For example, our sequence's map function could return a promise, an `Either`, a tree, or any other value as long as it implemented `Mappable`. Also, the expression `l.map(f).cons(f(e))` would cause a type error because TS wouldn't know that `l.map(f)` returns a sequence rather than an unspecified `Mappable`. This a violation of type safety, a failure to represent `map` generically, and, more importantly, it prevents us from encoding useful abstractions like Mappable.

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

Function type signatures should be pretty simple, right? You just need something like `(number, string) => string`, maybe with corresponding syntax for rest and optional parameters. Well, unfortunately, TS overcomplicates this. First of all, function parameters need to be named in the type, not just in the function literal. Not only is this unusual and redundant, it often leads to devs writing things like `(n: number, s:string) => string` and creating useless noise. 

The other bizarreness is that there are three different ways to define a function type, but you can't always use all three, depending on context. 

```
map: <U>(f: (el: T) => U) => Box<U>;
map<U>(f: (el: T) => U): Box<U>;
map: {<U>(f: (el: T) => U): Box<U>};
```

So, TypeScript function typing is far more complicated than it needs to be

####No Type Aliases

When you're working with a structural type system, the names you give types don't actually matter, since type compatibility is determined by the structure of the types. So, if you have something like this:

```typescript
interface Foo {
	a: number;
	b: string;
}
```

You're just declaring the name `Foo` to be equivalent to `{a: number; b: string;}`. So it would make sense to have a syntax like `type Foo = {a: number; b: string;};`. However, TypeScript went with a C#-ey interface syntax, which only allows type aliases for objects. So, there's no equivalent for these:

```typescript
type OscillatorType = string;
type Deck = Set<Card>;
type Comparator<T> = (a: T, b: T) => number;
```

(Actually you can do the last one, but the syntax is clunky and counter-intuitive.)

So aside from being more complex and less flexible than something like `type`, `interface` is far less intuitive. It's as if TypeScript is in denial about using structural types.

####Clunky Intersection Types

A similar concept to union types are intersection types: where you specify that a value must satisfy two types. So, for example, if you have an argument to a function that must be a Thenable and a Runnable, you could ideally do something like `param: Thenable & Runnable`. You can do this in TS, but it's messy because it uses interfaces (which are clearly pretty overburdened):

```typescript
// Declare intersection type
interface ThenableRunnable extends Thenable, Runnable {}

// Only now can we use it
var myFn : (param: ThenableRunnable) => Thenable;
```

###"Classes"

The other main change that TypeScript makes is that it adds "classes" to JS. I'm using quotes because it doesn't actually add any new semantics: a TS class is equivalent to a JS constructor. It adds some sugar to make it look Java/C#-ey, but ultimately it's still just functions and prototypical objects.

First of all, classes are the last feature I think should be added to JS. When we have higher order functions, we can construct much more powerful abstractions (see SICP/HTDP for this approach) rather than taking the messy, inflexible set of additions to C-ish structs that classes are. I understand that this is an argument I wouldn't win with many people, so I'm not going to go into depth, but [this post](http://raganwald.com/2014/03/31/class-hierarchies-dont-do-that.html) explains well why JS shouldn't have classes.

Secondly, this leads you into the minefield that is `this`. Rather than `this` being bound like it is in Java/C#, it's generlly determined by the object the function is called from. This works to a certain extent when using prototypical inheritance, but in practice it leads to non-composable and unpredictable functions, as well as silliness like `Function.prototype.call.bind(Array.prototype.slice)`. It's not hard to avoid `this`, but TypeScript uses it enthusiastically in classes. That's further complicated by the fact that arrow functions have lexical `this` (it's the instance of the class that they're defined in, not the object they're called on), while methods and regular functions have JS's normal dynamic `this`. So this kind of messiness is a clear example of why classes don't translate well to JS.

And lastly, classes complect type definitions with behaviour. I'm fine with them having inferred types, but often, in TypeScript code, one ends up being pushed into using classes in order to get the types of objects being easily shared between modules. Using interfaces or inference instead in non-classical code often results in longer code for defining types and having to use arcane features like ambient modules and TS's `typeof`. You shouldn't have to use a bad construct like classes in order to get convenient cross-module object typing.

###Does It Solve the Problems of JS?

So the recurring theme here is that the TS developers have repeatedly chosen C#-ey approaches over more useful ones (I assume C# since it's a Microsoft effort, but they could be aiming for Java-ey too). Whether or not you think this is a good goal is a matter of opinion, but I hope I've shown here that in practice, it integrates poorly with JS. In particular, a C#-ey type system proves to be very limited in modelling JS values and adding type safety.

So, if you consider lack of type safety to be JS's largest deficiency, TypeScript isn't an adequate solution. If you want ES6 features, TypeScript isn't an adequate solution, since it only has a few of them. And if you want classes like C# (ugh), then TypeScript isn't an adequate solution, since its classes are a thin film of sugar over totally different semantics. It only really works if you want a half-assed implementation of all three.

What I'd like to see instead is something like [clojure.core.typed](http://typedclojure.org) for JS. That is, something that only provides type annotation and type checking but that is designed to accomodate the way the language is written and therefore allows a far wider range of types. Not being based on a C#-ey type system would also allow the inclusion of more powerful type features such as higher-kinded types. Note that such a checker could use special comments, meaning that it could work with normal JS files. In short, a type checker that does one thing and does it well.
