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
	post.date = parseDate(post.meta.date);
	post.url = "/posts/" + post.date.format("YYYY-MM-DD") + "-" + encodeURIComponent(post.meta.title.replace(/\s+/g, '-')) + ".html";
	return post;
});

var templates = {
	master: readFile("templates/master.html"),
	post: readFile("templates/post.html"),
	postLink: readFile("templates/post-link.html"),
	postListEntry: readFile("templates/post-list-entry.html"),
	// projects: readFile("templates/projects.html")
};

copyFileSync("styles.css", "public/styles.css");
copyFileSync("reset.css", "public/reset.css");

// post list
var postListHTML = "<ul>" + posts.map(function(post) {
	return mustache(templates.postListEntry, {
		title: post.meta.title,
		url: post.url
	});
}).reduce(function(a, b) { return a + b; }) + "</ul>";

// post pages
posts.forEach(function(post) {
	var postHTML = mustache(templates.master, {
		postList: postListHTML,
		content: mustache(templates.post, {
			title: post.meta.title,
			content: post.html
		})
	});
	fs.writeFileSync("public" + post.url, postHTML);
});

// archives page
var archivesHTML = mustache(templates.master, {
	postList: postListHTML,
	content: posts.map(function(post) {
		return mustache(templates.postLink, {
			url: post.url,
			title: post.meta.title,
			desc: post.meta.desc || ''
		});
	}).reduce(function(a, b) { return a + b; })
});
fs.writeFileSync("public/archives.html", archivesHTML);
