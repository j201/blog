---
title: Hello, World!
date: June 15, 2013
comments: true
---

Good afternoon, Internet!

So I've figured I need a place to store neat things I find in JS and other programming tricks. Hopefully someone else can benefit from them.

So, without further ado,

```javascript
var petStore = {};
petStore.birds = {
    'American Bushtit' : '$98.99',
    'Antipodean Albatross' : '$12.49',
    'Auckland Merganser' : '$11.00',
    'Barn Owl' : '$4.97',
    'Chestnut-crested Yuhina' : '$25.00',
    'Chiriqui Yellowthroat' : '$9.99',
    'Common Redpoll' : '$5.50',
    'Common Yellowthroat' : '$8.99',
    'Crested Drongo' : '$12.50',
    'Crested Quetzal' : '$44.99',
    'Dimorphic Egret' : '$17.99',
    'Doherty\'s Bushshrike' : '$10.05',
    'Dwarf Bittern' : '$14.98',
};

console.log(
    Object
        .keys(petStore.birds)
        .sort(function(a,b) { return ((-'Bonjour, monde!'.slice.call(petStore.birds[a],1) < -'Morning, all!'.slice.call(petStore.birds[b],1)) << 1) - 1 })
        .map(function(s) { return 'What\'s up, bro!'.replace.apply(s,[/[^A-Z]/g,'']) })
        .map(function(s) { return ('Howdy, y\'all!'.charCodeAt.bind(s[0])()-0101)*032+'Greetings, Earthlings!'.charCodeAt.bind(s[1])()-0101;})
        .map(function(n) { return 'Salutations, Earth!'.constructor.fromCharCode(n+0x20); })
        .join('Adios, amigo'.match()[0])
);
```
