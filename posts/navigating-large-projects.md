Navigation methods:
- y Cycle: <C-J/K>
- y Jump to: <n><C-J/K>
- Jump to definition: <C-]>
- y By name: :b ...
- y By number: <n><C-6>
- By jumps: <C-O/I>
- By MRU buffers: <C-M/N>
- y Searching: -o/p...
- Grepping: <Space>gg
- y MRU files
- y Opening in the same folder \eh
- y unite buffers
- gf

#Navigating Large Projects Without Thinking Hard

When dealing with large programming projects (tens of thousands of lines of code, large folder hierarchies, hundreds of code files, etc.), moving around in the codebase can start taking up a significant chunk of your time. More importantly, having to put more effort into finding files and moving around is distracting and mentally taxing, reducing your ability to stay focused on the task at hand. Over the past couple years, I've been putting together a navigation workflow for projects like these with the goal of minimizing [cognitive load](TODO): making me think and remember as little as possible about the project's code organization. While I think that this is the kind of thing that deserves a personally customized approach, hopefully some of these ideas can prove useful for other people dealing with large projects. I use vim, so I'll be describing techniques, plugins, and features specific to vim, but I think the ideas can equally be applied in other customizable text editors like emacs. (Developing this kind of approach in less customizable editors like most IDEs is more difficult, since they don't lend themselves to UI customization or end users adding new features.)

In short: think less, move faster.

##Opening Files

I'll first look at the task of opening files by name. The first thing I'll point out here is that navigating file hierarchies is bad. I don't want to have to remember exactly where a file lives and I don't want to have to spend the time typing out directories. This is where file finders like [ctrlp.vim](https://github.com/ctrlpvim/ctrlp.vim) and [unite.vim](https://github.com/Shougo/unite.vim) come in. The gist of what they allow you to do is have a window open up where you can type parts of a file path which will filter a list of every file in your project, which you can then choose from. This makes directory depth irrelevant, reduces the effect of having a large number of files in you project, is faster than navigating through a visual file tree, and allows you to type in the first things that come to mind about a file's name and path instead of having to remember specifics. For example, if I want to open the file `myproject/dev/frontend/styles/themes/lugubrious/animations.css`, I would type `-p`, which opens a unite file finder, then I might type something like `styles lug anim`: a few relevant words that would narrow down the results, probably allowing me to just hit enter to open it.

Another feature generally provided by these kinds of tools is the ability to do the same kind of filtering through a list of recently used files. I use [neomru.vim](https://github.com/Shougo/neomru.vim) to add support for this in unite, mapped to the key sequence `-o`. This gives you more or less the same benefits as I just described, but it can also be useful when you want to open a file you know you were just editing: just open up the list of recently used files and scroll down a few. It's also often faster, since it isn't affected by the number of files in your project.

Another situation that allows you to take a shortcut is when you know that you want a file in the same folder as the one you're currently editing. I have the the key sequence `\eh` set to type `:e %:h/`, which, in vim, puts you in a command line to open a file with the current directory inserted. I can then use tab completion to quickly type in the name of the file I'm looking for. I also have vim set up to list all of the files in the current folder if I hit `<Tab>`, which means I don't have to try to remember the name of the file I'm looking for if it doesn't immediately come to mind.

###Summary

```
-p    Opens a project file selection window that can be filtered by typing parts of the file path
-o    Opens a similar window for recently opened files
\eh   Fills in the start of a command to open a file in the same directory as the current file
```

##Buffers

In terms of navigation, buffers (generally called "open files" outside of vim/emacs/etc.) are a set of files relevant to your current task. Of course they have other uses, but for the sake of navigation, we can see them as special targets that you should be able to get to more quickly than unopened files, since they're more likely to be needed. On top of this, there should be fast ways to get to buffers that are particularly likely to be needed, such as recently accessed buffers.

I have `<C-J>` and `<C-K>` mapped to go to the next buffer and the previous buffer respectively (for non-vimmers, `<C-J>` means `Ctrl+J`). This provides a quick way to access buffers that were opened around the same time as the current one, which is one indication that they're more likely to be needed and therefore should be more accessible. These mappings can also be used with a number; for example, using `3<C-J>` will go three buffers ahead in the list. However, the more buffers you have open, the less practical this approach is. A random-access way to get to buffers is needed in these casses

Vim provides the `:b` command for this use case, which takes either the name of the buffer, a partial name that uniquely identifies the buffer, or the buffer number. I don't use it much. Giving the name of the buffer takes too long, finding a partial match that would work takes too much thinking, and accessing a buffer by number can be done faster using `{buffer #}<C-^>` (I use `<C-6>`, which is the same thing for vim). In order to leverage this as a way to get to any buffer quickly, I keep a persistent list of open buffers in a small pane on the left side of my screen. TODO: image I find it's generally faster to scan the list for a buffer and access it by number than accessing by name. Having a list that opens up on command would take too long and I have the screen size to spare. I find that I also get used to where a buffer is in the list so I can quickly find its number visually (some people end up remembering buffer numbers, but I find that difficult). And finally, this makes using `<C-J>` and `<C-K>` with a count, like I described above, more useful since I can see where I'll end up if I go, say, 2 buffers forward in the list.

It's worth noting that when I do want to access a buffer by name, for example if I have many buffers with a similar name open and I don't want to waste time looking closely at my buffer list, I'll use `-b`, which opens up unite like I described above for files, but with a list of current buffers instead, which I can then filter and select from. (The great thing about unite is that it's agnostic about what kind of information it lists, so it can let you select from many useful lists.)

TODO: MRU buffers

##Content-based Navigation
