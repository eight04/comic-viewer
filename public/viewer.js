function prepend(node, child) {
	if (typeof node == "string") {
		node = document.querySelector(node);
	}
	if (typeof child == "string") {
		node.insertAdjacentHTML("afterbegin", child);
	} else {
		node.insertBefore(child, node.childNodes[0]);
	}
}

function bind(node, event, callback) {
	if (typeof node == "string") {
		node = document.querySelector(node);
	}
	if (node) {
		node.addEventListener(event, callback);
	}
}

bind.one = function(node, event, callback) {
	if (typeof node == "string") {
		node = document.querySelector(node);
	}
	node.addEventListener(event, function self(e) {
		node.removeEventListener(event, self);
		callback.call(this, e);
	});
};

bind(document, "DOMContentLoaded", init);

function init() {
	var bookmark = function(){
		var MAX_LENGTH = 10,
			scrTop,
			nav, cmd, menu;
		
		function read() {
			var bookmarks;
			try {
				bookmarks = JSON.parse(localStorage.bookmarks);
				if (!(bookmarks instanceof Array)) {
					bookmarks = [];
				}
			} catch (err) {
				bookmarks = [];
			}
			return bookmarks;
		}
		
		function save(bookmarks) {
			while (bookmarks.length > MAX_LENGTH) {
				bookmarks.shift();
			}				
			localStorage.bookmarks = JSON.stringify(bookmarks);
		}
	
		function add() {
			var bookmarks = read(),
				bookmark = {
					path: cv.curr.full,
					scrTop: window.scrollY,
					name: cv.curr.name
				};
			
			bookmarks.push(bookmark);
			addMenuItem(bookmark);
			
			save(bookmarks);
			
			panel.notify("Saved bookmark: " + cv.curr.full);
		}
		
		function load() {
			var bookmarks = read(),
				last = bookmarks[bookmarks.length - 1];
				
			if (!last) {
				panel.notify("Bookmark is empty");
			} else if (last.path == cv.curr.full) {
				scrTop = last.scrTop;
				open();
			} else {
				location.href = "/view?path=" + encodeURIComponent(last.path) + "#SCRTOP" + last.scrTop;
			}
		}
		
		function open() {
			window.scrollTo(window.scrollX, scrTop);
			if (window.scrollY != scrTop) {
				setTimeout(open, 200);
			} else {
				panel.notify("Bookmark opened: " + cv.curr.full);
				history.pushState("", document.title, window.location.pathname + window.location.search);
			}
		}
		
		function createMenu() {
			var bookmarks = read(),
				i;
				
			for (i = 0; i < bookmarks.length; i++) {
				addMenuItem(bookmarks[i]);
			}
		}
		
		function addMenuItem(bookmark) {
			var a = document.createElement("a");
			a.href = "/view?path=" + encodeURIComponent(bookmark.path) + "#SCRTOP" + bookmark.scrTop;
			a.textContent = bookmark.name;
			prepend(menu, a);
		}
		
		function hashOpen() {
			var match;
			if ((match = location.hash.match(/^#SCRTOP(\d+)/))) {
				scrTop = match[1];
				open();
			}			
		}
		
		function showMenu() {
			nav.classList.add("show");
			cmd.classList.add("active");
			menu.classList.add("show");
			setTimeout(bindHideMenu);
		}
		
		function bindHideMenu() {
			bind.one(window, "click", hideMenu);
		}
		
		function hideMenu() {
			nav.classList.remove("show");
			cmd.classList.remove("active");
			menu.classList.remove("show");
		}
		
		cmd = document.querySelector(".command-bookmarks");
		nav = document.querySelector(".nav");
		menu = document.querySelector(".bookmark-menu");
		
		hashOpen();
		createMenu();
		
		bind(cmd, "click", showMenu);
		bind(window, "hashchange", hashOpen);
		
		return {
			load: load,
			add: add
		};
	}();
	
	function go(path, name) {
		path = encodeURIComponent(path);
		name = name ? "#" + name : "";
		return function () {
			location.href = "/view?path=" + path + name;
		};
	}
	
	var scroller = function(){
		
		function nextJump(e) {
			e.preventDefault();
			var imgs = images.current(),
				img = imgs[1] || imgs[0];
			if (img) {
				window.scrollBy(0, img.height);
			}
		}
		
		function prevJump(e) {
			e.preventDefault();
			var imgs = images.current(),
				img = imgs[imgs.length - 2] || imgs[0];
			if (img) {
				window.scrollBy(0, -img.height);
			}
		}
		
		function nextPage() {
			var imgs = images.current(),
				img = imgs[1] && imgs[1].top == window.scrollY ? imgs[1] : imgs[0];
				
			if (img) {
				window.scrollBy(0, img.top + img.height - window.scrollY);
			}
		}
		
		function prevPage() {
			var imgs = images.current(),
				img = imgs[0];
				
			if (img) {
				window.scrollBy(0, img.top - window.scrollY);
			}
		}
	
		return {
			nextJump: nextJump,
			prevJump: prevJump,
			nextPage: nextPage,
			prevPage: prevPage
		};
	}();
	
	var images = function(){
	
		function current() {
			var scrTop = window.scrollY,
				top = Math.round(document.querySelector(".images").getBoundingClientRect().top) + scrTop,
				windowHeight = window.innerHeight,
				select = [],
				images = document.querySelectorAll(".images img"),
				i, ch;
				
			for (i = 0; i < images.length; i++) {
				ch = images[i].clientHeight;
				if (top + ch < scrTop) {
					top += ch;
					continue;
				} else if (top <= scrTop + windowHeight) {
					select.push({
						top: top,
						height: ch
					});
					top += ch;
					continue;
				}
				break;
			}
			
			return select;
		}
		
		return {
			current: current
		};
	}();
	
	var panel = function(){
		var timer, x, y,
			hideStyle = document.querySelector("#hide-cursor-style"),
			nav = document.querySelector(".nav"),
			inner = document.querySelector(".container-inner"),
			notifyEl = document.querySelector(".notify");
		
		function show() {
			var scrWidth,
				scrTop = window.scrollY;
				
			document.body.classList.add("show-cursor");
			document.head.removeChild(hideStyle);
			
			scrWidth = document.documentElement.clientWidth - window.innerWidth + "px";
			nav.style.marginRight = scrWidth;
			inner.style.marginRight = scrWidth;
			
			window.scrollTo(window.scrollX, scrTop);
			timer = setTimeout(hide, 1000);
		}
		
		function hide() {
			document.head.appendChild(hideStyle);
			document.body.classList.remove("show-cursor");
			
			inner.style.marginRight = "";
			nav.style.marginRight = "";
			
			timer = null;
		}
		
		function handleMove(e) {
			// sometimes e.screenX and e.screenY will be 0
			if (!e.screenX && !e.screenY) {
				return;
			}
			if (x == null && y == null) {
				x = e.screenX;
				y = e.screenY;
				return;
			}
			// chrome fires move event even not moving
			if (e.screenX == x && e.screenY == y) {
				return;
			}
			x = e.screenX;
			y = e.screenY;
			if (timer) {
				clearTimeout(timer);
				timer = setTimeout(hide, 1000);
				return;
			}
			show();
		}
		
		var notifyTimer;
		function notify(s) {
			clearTimeout(notifyTimer);
			notifyEl.textContent = s;
			notifyEl.classList.add("show");
			notifyTimer = setTimeout(denotify, 1000);
		}
		
		function denotify() {
			notifyEl.classList.remove("show");
		}
	
		bind(window, "mousemove", handleMove);
		
		return {
			notify: notify
		};
	}();
	
	var explorer = function(){
		
		function open() {
			fetchival("/open").post({path: encodeURIComponent(cv.isFile ? cv.curr.dir : cv.curr.full)});
			panel.notify("Launch directory");
		}
		
		bind(".command-explorer", "click", open);
		
		return {
			open: open
		};
	}();
	
	(function dirSearch (){
		var box = document.querySelector(".dir-search-box"),
			cache = "";
			
		if (!box) {
			return;
		}
	
		function filter(value) {
			if (cache == value) {
				return;
			}
			if (cache + "\u3000" == value) {
				// typing
				return;
			}
			cache = value;
		
			var dirs = document.querySelectorAll(".dirs a"),
				i;
				
			for (i = 0; i < dirs.length; i++) {
				dirs[i].style.display = !value || dirs[i].textContent.indexOf(value) >= 0 ? "" : "none";
			}
		}
		
		function handleInput(e) {
			filter(e.target.value);
		}
	
		bind(box, "input", handleInput);
		
		if (box.value) {
			filter(box.value);
		}
		
	})();
	
	Mousetrap.bind("[", go(cv.prev && cv.prev.full));
	Mousetrap.bind("]", go(cv.next && cv.next.full));
	Mousetrap.bind("q", go(cv.curr.dir, cv.curr.name));
	Mousetrap.bind("b", bookmark.add);
	Mousetrap.bind("shift+b", bookmark.load);
	Mousetrap.bind("ctrl+enter", explorer.open);
	Mousetrap.bind("left", scroller.prevPage);
	Mousetrap.bind("right", scroller.nextPage);
	Mousetrap.bind("shift+left", scroller.prevJump);
	Mousetrap.bind("shift+right", scroller.nextJump);
	
}
