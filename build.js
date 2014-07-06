var fs = require('fs');
var mustache = require('mustache').render;
var metaMarked = require('meta-marked');
var highlight = require('highlight.js');
var wrench = require('wrench');
var moment = require('moment');

function readFile(file) {
	return fs.readFileSync(file, { encoding: "utf-8" });
}

function copyFileSync(from, to) {
	fs.writeFileSync(to, fs.readFileSync(from, { encoding: 'utf8' }));
}

metaMarked.setOptions({
	highlight: function (code, lang) {
		return lang ? 
			highlight.highlight(lang, code).value :
			highlight.highlightAuto(code).value;
	}
});

function parseDate(str) {
	return moment(str, "MMM DD, YYYY");
}

wrench.rmdirSyncRecursive('public', function() {}); // fail silently - it might not be there
fs.mkdirSync('public');
fs.mkdirSync('public/posts');

var posts = fs.readdirSync('posts').map(function(post) {
	return metaMarked(readFile('posts/' + post));
}).sort(function(a, b) {
	return parseDate(a.meta.date).unix() - parseDate(b.meta.date).unix();
}).map(function(post) {
	post.date = parseDate(post.date);
	post.url = "/posts/" + post.date.format("YYYY-MM-DD") + "-" + encodeURIComponent(post.meta.title.replace(/\s+/g, '-')) + ".html";
	return post;
});

var templates = {
	master: readFile("templates/master.html"),
	post: readFile("templates/post.html"),
	// postLink: readFile("templates/post-link.html"),
	// projects: readFile("templates/projects.html")
};

posts.forEach(function(post) {
	var postHTML = mustache(templates.master, {postList: '', content: mustache(templates.post, {title: post.title, content: post.html})});
	fs.writeFileSync("public" + post.url, postHTML);
});
