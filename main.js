(function() {
	var currentLinkBg = "#00B49C";

	Array.prototype.forEach.call(document.querySelectorAll("#top-links a, #post-list a"), function(a) {
		var href = a.getAttribute('href');
		if (href === location.pathname || href === location.href)
			a.style.backgroundColor = currentLinkBg;
	});
})();
