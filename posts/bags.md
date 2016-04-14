---
title: TODO
date: TODO
desc: "TODO"
comments: true
---

Most programming languages come with a basic set of data structures, either in the standard library or imported by default. Especially in the latter category and in untyped languages, these data structures become a fundamental part of how problems are expressed and solved in the language. Not only do they exist for efficiency or ease of use; they communicate important information about the properties of the data they hold. (TODO: mention clojure?) These basic data structures often consist of one or two list types, plus hash maps. Others sometimes seen include hash sets, tree maps and sets, weak associative structures, sorted structures, queues/dequeues, etc.

Here, I want to argue that [bags (aka multisets)](https://en.wikipedia.org/wiki/Multiset) should play a greater role as a basic data structure in programming languages/libraries. Like sets, they can be easily implemented using maps, but offer greater flexibility, better APIs, and indicate more about their data when treated as a separate kind of data structure.
