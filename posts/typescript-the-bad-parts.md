---
title: "TypeScript: The Bad Parts"
date: July 11, 2014
published: false
---

[TypeScript](http://www.typescriptlang.org/) is Microsoft's attempt to bring type checking to the Wild West of JS. It also brings features such as arrow functions and "classes" inspired by ES6 spec drafts. After working with it for a while, I feel it has some nice bits, but on the whole is sorely lacking. Here I'd like to go through the major features of TypeScript and identify how it got them wrong.

###Inexpressive Types

Despite having structural types (yay!), TS has a remarkably inflexible type system. It's lacking many powerful features that are common in modern structural type systems, which reduces its ability to model and verify JS programs. However, TypeScript has an even greater requirement in that it must be able to describe the types of existing JS code, which includes functions that wouldn't be allowed in many strongly typed languages. Even though this is difficult, TS could have done a far better job.

The feature I find the most lacking is union types: where a value can be considered to be one of two types. This is so common in JS that I can't understand why TypeScript wouldn't include it. Sure, you can implement an `Either<TLeft, TRight>` type in TS, but the lack of native support forces the use of `any` [in](https://github.com/borisyankov/DefinitelyTyped/blob/9d88dadf44aaedcabde88053342617575a851f39/easeljs/easeljs.d.ts#L100) [many](https://github.com/borisyankov/DefinitelyTyped/blob/52b37e40fa69c6a57b09578305827294a7c24f36/iscroll/iscroll-5.d.ts#L38) [cases](https://github.com/borisyankov/DefinitelyTyped/blob/dd35f69637817e3f7f8fb23b8d4b033885ad32cd/fancybox/fancybox.d.ts#L100), which removes type verification. One of the first bugs I had to deal with in TypeScript was caused by an Underscore function that returned a number or a given generic type, but the TypeScript annotation simply said that it returned the generic type (a problem that (still exists)[https://github.com/borisyankov/DefinitelyTyped/issues/1513]).

- lack of union types
	- underscore example
	- see https://typescript.codeplex.com/workitem/1364
- lack of higher-kinded types
	- `fmap` function
- lack of other type manipulation
	- `compose` function
	- tuples

On the whole, you can look through the TS typings for [just about any JS library](https://github.com/borisyankov/DefinitelyTyped/blob/master/jquery/jquery.d.ts) and tell how bad a job it does by the sheer number of `any`s in places where the actual type is well-defined but inexpressible by TS's poor type system.

###Faulty Type System

- null

###Annoying Type Syntax

- different ways to define functions
- requirement to name arguments
- interfaces instead of intersection types
- lack of arbitrary type aliases
	- types are limited to interfaces

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
