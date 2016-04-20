---
title: TODO
date: TODO
desc: "TODO"
comments: true
---

Most programming languages come with a basic set of data structures, either in the standard library or imported by default. Especially in the latter category and in untyped languages, these data structures become a fundamental part of how problems are expressed and solved in the language. Not only do they exist for efficiency or ease of use; they communicate important information about the properties of the data they hold. (TODO: mention clojure?) These basic data structures often consist of one or two list types, plus hash maps. Others sometimes seen include hash sets, tree maps and sets, weak associative structures, sorted structures, queues/dequeues, etc.

Here, I want to argue that [bags (aka multisets)](https://en.wikipedia.org/wiki/Multiset) should play a greater role as a basic data structure in programming languages/libraries. Like sets, they can be easily implemented using maps, but offer greater flexibility, better APIs, and indicate more about their data when treated as a separate kind of data structure.

##Intro to bags

A bag is simply a data structure that stores arbitrary elements with no defined order. This is different from a list, which has a defined order, and a set, which has no order but cannot store multiple elements with the same value. Losing the property of being ordered can give bags performance boosts over lists for certain operations, like checking how many of an element exist in the bag, or which unique elements exist.

A basic bag interface might only expose `add` and `remove` operations, aside from a constructor. ([Here's](https://gist.github.com/j201/7365644) a sample implemetation in Clojure.) Of course, a real implementation would provide a `size` function, a function to see how many times a value appears ('multiplicity'), iterators (there's more than one way to iterate through a bag), set operations, functions to map, filter, or fold, etc. The implementation can vary based on what kind of efficiency characteristics are wanted. A hash map linking keys to an integer representing the number of times a key appears in the bag generally provides the best asymptotic behaviour, but trees and vectors can also be used. An implementation could even use a combination of implementation approaches or switch between them according to usage.

This table shows basic asymptotic average case performance and tasks where bags differ substantially from lists and sets. It assumes implementation with a hash map from values to multiplicities.

TODO: highlight
|| Hash bags | Arrays | Linked Lists | Hash sets
--- | --- | --- | --- | ---
Random insert/delete | O(1) | O(n) | O(n) | O(1)
Best case insert/delete | O(1) | O(1) | O(1) | O(1)
Search for value | O(1) | O(n) | O(n) | O(n)
Multiplicity | O(1) | O(n) | O(n) | N/A
Union/concatenation | O(n) | O(n) | O(1) | O(n)
Unique values | O(1) | O(n) | O(n) | O(1)

##Example: prime factors

A basic example of using bags is getting the prime factors of a number. For instance, the prime factorization of 149688 is 2²⋅3⁵⋅7⋅11². For the general case in high-level programming, I would argue that a bag containing {2, 2, 3, 3, 3, 3, 3, 7, 11, 11} is the best way to represent this. This is a simplistic example where the performance advantages and disadvantages of bags don't come into play much, but it demonstrates these differences as well as semantic differences.

Prime factorization functions generally return lists. For instance, calling `factor(149688)` in Matlab or Octave will return a vector `[2, 2, 3, 3, 3, 3, 3, 7, 11, 11]`. This approach has the advantage of returning the values in a sorted order. However, determining whether a value is present or its multiplicity is an O(n) operation. For dealing with prime factors, these are common tasks. Furthermore, these operations, although immediately available for hash bags, are often not part of the list API (which is the case in Matlab) as they aren't fast and, in the case of multiplicity, are uncommon in interacting with lists in general.

TODO: semantic advantages of bags

It's worth noting that in languages with lazy evaluation or lazy lists, it's reasonable for functions like this to return lazy lists that can be collected into bags (since they represent incomplete computations where the computations occur in some order and not necessarily the structure of data). See 'Lazy bags' below.

##Example: statistical data

##The case for bags

##A note on persistence

##Appendix: Special bags

###Lazy bags

###Sorted bags
