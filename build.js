var fs = require('fs');
var mustache = require('mustache');
var metaMarked = require('meta-marked');
var highlight = require('highlight.js');
var wrench = require('wrench');

function readFile(file) {
	return fs.readFileSync(file, { encoding: "utf-8" });
}

marked.setOptions({
	highlight: function (code, lang) {
		return lang ? 
			highlight.highlight(lang, code).value :
			highlight.highlightAuto(code).value;
	}
});

wrench.rmdirSyncRecursive('public', function() {}); // fail silently - it might not be there
fs.mkdirSync('public');

var posts = fs.readdirSync('posts').map(function(post) {
	return metaMarked(readFile('posts/' + post));
}).sort(function(a, b) {
	return Date.parse(a.meta.date) - Date.parse(b.meta.date);
});

posts.forEach(function(post) {

