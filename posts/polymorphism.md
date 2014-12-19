---
title: "You Might Be Doing Polymorphism Wrong"
date: TODO
desc: ""
published: false
---

I think a concise statement of the goal of Object Oriented Programming would be that it's about linking specific kinds of data to functions (methods). This allows the methods to be polymorphic in that they will have different definitions based on the data given to them. So, there are three components to this that the programmer has to establish:

- The data "type"
- The method on the data
- The link between the "type" and the method

I put "type" in quotation marks here because I don't want to confuse it with the type used by a type system. Often, they're the same, but that's not necessarily the case (e.g., OOP in untyped languages). From now on, I'll use the word 'method' to mean a function associated with a kind of data, 'tag' instead to mean the value attached to a piece of data that associates the data with its methods, and the word 'object' to mean a piece of data that can be associated with methods.

The question I'd like to look at here is how mechanisms for achieving ad-hoc polymorphism can best accomplish these components. I'll only look at single dispatch (methods are chosen based on the tag of *one* of their arguments) because of its prevalence and to keep things simple. These are the goals I'll be looking at:

###Extensibility

Can new definitions be added for existing methods? Can new methods be added to existing object definitions? Does a modules need to "own" the object or the method in order to add method definitions?

###Modularity

Can a method definition and the object definition be kept in different modules? Can importing modules cause conflicting method definitions?

###Composability

Are methods first class citizens? Can methods be treated the same way as functions?

| Polymorphism Mechanism | 
