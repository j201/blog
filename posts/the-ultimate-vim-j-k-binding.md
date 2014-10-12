---
title: "The Ultimate Vim j/k Binding"
date: October 12, 2014
desc: "Until I find a better one, that is"
published: true
---

As a user of `relativenumber`, I get a bit more mileage out of `j` and `k` than many Vim users. It enables me to quickly see how far away I am from a line, making jumps like `28j` easy and practical. However, `relativenumber` works with lines delimited by newline characters, not the lines you see on the screen. And if a line wraps, `j` and `k` will move by text lines, not visual lines, causing awkward jumps. Because of this, may users have this in their .vimrcs:

```
nnoremap j gj
nnoremap k gk
```

But, since `j` and `k` no longer act on text lines, `23j` may no longer go the the line marked `23` in the gutter. If there is a wrapped line between the cursor and the target, it will actually take multiple presses of `j` to pass that line, meaning that the cursor's end position will be too high. A good way to get around this would be to have single presses of `j` and `k` act as `gj` and `gk` while `j` and `k` with a count would act normally.

The other issue that bothered me was that large `j` and `k` jumps didn't get added to the jumplist, meaning that there was no easy way to undo and redo them. That can be fixed by automatically setting the `'` mark if `j` or `k` is executed with a count.

So, without further ado, this is what I've come up with:

```
nnoremap <silent> k :<C-U>execute 'normal!' (v:count > 1 ? "m'" . v:count : 'g') . 'k'<CR>
nnoremap <silent> j :<C-U>execute 'normal!' (v:count > 1 ? "m'" . v:count : 'g') . 'j'<CR>
```

This does the following:

- For an *n*`j` command, `m'nj` is instead executed
- For a `j` command without a count, `gj` is instead executed

It's not perfect - in visual mode, `j` and `k` revert to their normal definitions, but I'm really enjoying its more intuitive behaviour in normal mode.
