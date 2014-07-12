---
title: "TypeScript: The Bad Parts"
date: July 11, 2014
published: false
---

[TypeScript](http://www.typescriptlang.org/) is Microsoft's attempt to bring type checking to the Wild West of JS. It also brings features such as arrow functions and "classes" inspired by ES6 spec drafts. After working with it for a while, I feel it has some nice bits, but on the whole is sorely lacking. Here I'd like to go through the major features of TypeScript and identify how it got them wrong.

###Inexpressive Types

Despite having structural types (yay!), TS has a remarkably inflexible type system. It seems to ignore the advancement in structural type systems that has occurred over the past few decades and is much less expressive than languages like Haskell or even F#. However, TypeScript has a greater requirement in that it must be able to describe the types of existing JS code, which includes functions that wouldn't be allowed in many strongly typed languages. Even though this is difficult, TS could have done a far better job.

The feature I find the most lacking is union types: types the 

- lack of union types
	- underscore example
	- see https://typescript.codeplex.com/workitem/1364
- lack of higher-kinded types
	- `fmap` function
- lack of other type manipulation
	- `compose` function
	- tuples

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

###Forcing C#-iness

- The mistakes listed above seem to be caused by an attempt to turn JS into C#
- Not doing one thing
- What we should have is:
	- Expressive type definitions a la core.typed
	- ES6 transpilation a la Traceur

###Does It Solve the Problems of JS?
