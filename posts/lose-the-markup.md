---
title: "Lose the Markup"
date: TODO
desc: ""
published: false
---

JS frameworks are moving in two directions these days. On one side, you have a push to make HTML documents capable of representing the kinds of complex elements that are used in web applications. Angular, Knockout, Polymer, and Web Components all subscribe to this approach. On the other side, you have frameworks that give up on markup templates and represent UIs programmatically. This camp includes React, Mercury, Mithril, and Elm.

In my experience, those used to frameworks from the HTML group are disgusted when first seeing JSX or hyperscript or other JS representations of visual elements. It is a bit of a jump from XMLish templates that clearly show hierarchical structure to plain old JS code where those structures can seem bogged down in programming syntax. But I would argue that with a couple of exceptions, those doubts are unfounded and that the advantages of markup-free frameworks usually outweight their downsides. Hopefully here I can help dispel some of the [FUD](http://en.wikipedia.org/wiki/Fear,_uncertainty_and_doubt) around markup-free UIs.

A couple notes:

React's JSX is a curious case. It is an XML-like embedded language, but it translates fairly transparently to similar JS code. Given that it's a JS syntax extension with the abilities and advantages of JS behind it, I'm not including it when I refer to markup languages here. I'll also avoid using it in examples to make it clear that the UIs are expressed in a programming language.

Because of their popularity, the examples I'll give here will mostly use Angular and React. However, I feel the points I'm making apply in general to templated vs. programmatic client-side web UI approaches. Also, for React, I generally use `var dom = React.DOM;`, and I'll be following that convention for my examples.

## Separations of Concerns

Using a separate language is also a rather crude way of enforcing separation of concerns. It would be like using different languages for the models, the views, and the controllers in an MVC UI just to make sure that they stayed separate.

A counter-argument could be that HTML is more suited to expressing UIs than JS.

```html
<div class="foo" ng-click="bar()">
    <span class="baz">
        Content goes here: {{content}}
    </span>
</div>
```

```javascript
dom.div({ className: "foo", onClick: bar },
    dom.span({ className: "baz" },
        "Content goes here" + content
    )
)
```

The JS version expresses the difference between content and structure more effectively. Instead of `eval`ing a string, the function `bar` can simply be assigned as an object property. Similarly, instead of using string interpolation to render a templated string, JS string operations can be used, and the distinction between a string literal and changing string data occurs naturally.

## Powerful Manipulations

A lot of reinventing the wheel goes on in templating frameworks. Things like mapping a list of objects to a list of HTML elements that are simple in JS require new syntax to work in bindings (e.g., `ng-repeat` in Angular, `foreach` in Knockout). In fact, looking at these frameworks, you'll see a lot of simple programmatic operations being reimplemented with new syntax. For example, Angular's `ng-repeat`, `ng-if`, `ng-init`, and so on have simple, standard analogues in JS.
However, because you're dealing with markup and not a programming language,

When you specify your UIs in a programming language instead, you lose this clunkiness.

You also gain the ability to abstract over operations that construct UIs. For example,

```javascript

function makeUl(ulAttrs, liAttrs, data) {
    return dom.ul(ulAttrs, data.map(function(s) {
        return dom.li(liAttrs, s);
    });
}

var blueList = React.createClass({
    render: function() {
        return makeUl({}, { style: "color: blue" }, this.props.items);
    }
});

```

So, we can easily make functions that return elements, that manipulate elements, that take elements as parameters, etc. and just use them like we would any other function. Combined with JS's ability to have higher-order functions, this opens up opportunities for abstractions that range from clunky to impossible in templating frameworks.

## Virtual DOM
## Testing
## Designers
