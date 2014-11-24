---
title: "Crossing the Paradigms: Making a Stack-Based DSL in Clojure"
date: October TODO, 2014
desc: "Showing off Clojure's expressive power"
published: false
---

Lisps are great at making [EDSLs](http://c2.com/cgi/wiki?EmbeddedDomainSpecificLanguage). Standard API exports like functions and macros are so generic and powerful that combined with the syntactic simplicity of Lisps, they blur the lines between an API and a lispy DSL. This allows coders to wield a great degree of control over how their code can be used, making it simpler to construct easy-to-use and powerful abstractions. So in this post, I just wanted to show off some of that by using the functional, lambda-calculus-based language Clojure to construct an imperative, stack-based DSL. Because why not.

In stack-based languages, commands work by operating on a stack of values. A couple examples are `dup`, which takes the top element and pushes a copy of it onto the stack, and `swap`, which swaps the position of the top two elements on the stack. Common functions like addition operate by taking their parameters from the top of the stack and replacing them with their result. A program can be simply represented as chaining together such operations one after another. For example, an operation to solve for the hypotenuse of a right triangle (`c = sqrt(a^2 + b^2)`) could be represented as `dup * swap dup * + sqrt`.

The other part of the puzzle is how you get data on the stack in the first place. Normally, in stack-based languages, a literal is treated as an operation that puts that value onto the stack. So, `1 2 +` would put 1 on the stack, then put 2 on the stack, then add them, resulting in a 3 on the stack.

So, we need to figure out how to represent these operations in Clojure. First of all, it makes sense to implement the stack as Clojure lists and lazy seqs, which are fast for adding and removing from the head, which we can treat as the top of the stack. Since an operation modifies the stack, it can be then implemented as a Clojure function that takes a sequence and returns a new sequence representing the new stack state. So, we can implement functions for converting Clojure values into values that can be used with this approach:

```
(ns stack)

(defn stack-fn
  "Takes a function that takes n arguments and returns its results as a list and
  converts it to an equivalent function that takes a stack and returns a new stack"
  [n f]
  (fn [s]
    (concat (apply f (take n s))
            (drop n s))))

(defn stack-literal
  "Takes a value and converts it to a stack operation that puts that value on the stack"
  [x]
  (partial cons x))
```

Note that stack operations can put multiple values on the stack, so functions that can be converted into stack operations need to be able to return multiple values. So, `stack-fn` assumes that the function returns a sequence of results. Since most functions will only have one return value, we can make a helper for those cases:

```
(defn stack-fn-1
  "Takes a function that takes n arguments and returns a single value and converts
  it to an equivalent function that takes a stack and returns a new stack"
  [n f]
  (fn [s]
    (cons (apply f (take n s))
          (drop n s))))
```

Okay, now let's make some stack operations. Because we want things like `+`, we're going to have to exclude them from the default `clojure.core` namespace, so we're going to set up a new namespace to add these operations to.

```
(ns stack.core
  (:refer-clojure :exclude [= > < >= <= not= + - * / rem])
  (:require [stack :refer :all]))

(def dup (stack-lift 1 #(list % %)))
(def swap (stack-lift 2 #(list %2 %1)))

(def + (stack-lift-1 2 clojure.core/+))
(def - (stack-lift-1 2 clojure.core/-))
(def * (stack-lift-1 2 clojure.core/*))
(def / (stack-lift-1 2 clojure.core//))
(def rem (stack-lift-1 2 clojure.core/rem))
(def = (stack-lift-1 2 clojure.core/=))
(def > (stack-lift-1 2 clojure.core/>))
(def >= (stack-lift-1 2 clojure.core/>=))
(def < (stack-lift-1 2 clojure.core/<))
(def <= (stack-lift-1 2 clojure.core/<=))
(def not= (stack-lift-1 2 clojure.core/not=))
(def sqrt (stack-lift-1 1 #(Math/sqrt %)))

(def ifelse (stack-lift-1 3 #(if %1 %2 %3)))
```
