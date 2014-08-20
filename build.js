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

function escapeFileName(name) {
	return name.replace(/[<>:""\/\\|\?\*\u0000-\u001f]/g, '').replace(/[\. ]+$/, '');
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
}).filter(function(post) {
	return !("published" in post.meta) || post.meta.published;
}).sort(function(a, b) {
	return parseDate(b.meta.date).unix() - parseDate(a.meta.date).unix();
}).map(function(post) {
	post.date = parseDate(post.meta.date);
	post.url = "/posts/" + post.date.format("YYYY-MM-DD") + "-" + escapeFileName(post.meta.title.replace(/\s+/g, '-')) + ".html";
	return post;
});

var templates = {
	master: readFile("templates/master.html"),
	post: readFile("templates/post.html"),
	postLink: readFile("templates/post-link.html"),
	postListEntry: readFile("templates/post-list-entry.html"),
	homePost: readFile("templates/home-post.html")
	// projects: readFile("templates/projects.html")
};

copyFileSync("styles.css", "public/styles.css");
copyFileSync("reset.css", "public/reset.css");
copyFileSync("solarized_light.css", "public/solarized_light.css");

// post list
var postListHTML = "<ul>" + posts.map(function(post) {
	return mustache(templates.postListEntry, {
		title: post.meta.title,
		url: post.url
	});
}).reduce(function(a, b) { return a + b; }) + "</ul>";

// post pages
posts.forEach(function(post) {
	var postHTML = mustache(templates.post, {
		title: post.meta.title,
		content: post.html
	});
	var allHTML = mustache(templates.master, {
		postList: postListHTML,
		content: postHTML
	});
	fs.writeFileSync("public/" + post.url, allHTML);
});

// archives page
var archivesHTML = mustache(templates.master, {
	postList: postListHTML,
	content: posts.map(function(post) {
		return mustache(templates.postLink, {
			url: post.url,
			title: post.meta.title,
			desc: post.meta.desc || '',
			date: post.meta.date
		});
	}).reduce(function(a, b) { return a + b; })
});
fs.writeFileSync("public/archives.html", archivesHTML);

// home page
var homeContent = posts.map(function(post) {
	return mustache(templates.homePost, {
		title: post.meta.title,
		content: post.html,
		url: post.url,
		date: post.meta.date
	});
}).reduce(function(a, b) { return a + b; });
fs.writeFileSync("public/index.html", mustache(templates.master, {postList: postListHTML, content: homeContent}));
