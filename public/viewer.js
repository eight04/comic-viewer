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
		var nav = document.querySelector(".nav"),
			cmd = document.querySelector(".command-bookmarks"),
			menu = document.querySelector(".bookmark-menu"),
			MAX_LENGTH = 10;
		
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
				bookmark = create();
				
			if (!bookmark) {
				return;
			}
			
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
				return;
			}
			go(last);
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
			a.href = "/view?path=" + encodeURIComponent(bookmark.path) + "#" + encodeURIComponent(bookmark.name) + "#offset=" + bookmark.offset;
			a.textContent = bookmark.name;
			prepend(menu, a);
		}
		
		function hashOpen() {
			var tokens = location.hash.split("#"),
				bookmark = {},
				i, parts;
			for (i = 0; i < tokens.length; i++) {
				if (!tokens[i]) {
					continue;
				}
				if (tokens[i].indexOf("=") < 0) {
					bookmark.name = decodeURIComponent(tokens[i]);
				} else {
					parts = tokens[i].split("#").map(decodeURIComponent);
					bookmark[parts[0]] = parts[1];
				}
			}
			if (!bookmark.name && !bookmark.offset) {
				return;
			}
			history.pushState("", document.title, window.location.pathname + window.location.search);
			go(bookmark);
			panel.notify("Bookmark opened: " + cv.curr.full);
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
		
		function create() {
			var imgs = images.current(),
				img = imgs[1] && imgs[1].top == window.scrollY ? imgs[1] : imgs[0];
				
			if (img) {
				return {
					path: cv.curr.full,
					name: img.name,
					offset: window.scrollY - img.top
				};
			}
		}
		
		function go(bookmark) {
			if (!bookmark || bookmark.offset == null) {
				return;
			}
			if (bookmark.path && bookmark.path != cv.curr.full) {
				location.href = "/views?path=" + encodeURIComponent(bookmark.path) + "#" + bookmark.name + "#offset=" + bookmark.offset;
				return;
			}
			var offset = +bookmark.offset;
			if (bookmark.name) {
				offset += images.get(bookmark.name).top;
			}
			window.scrollTo(window.scrollX, offset);
		}
		
		createMenu();
		
		if (document.readyState == "complete") {
			hashOpen();
		} else {
			bind.one(window, "load", hashOpen);
		}
		
		bind(cmd, "click", showMenu);
		bind(window, "hashchange", hashOpen);
		
		return {
			load: load,
			add: add,
			create: create,
			go: go
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
		var cont = document.querySelector(".images"),
			maxWidthStyle = document.createElement("style"),
			images = cont.querySelectorAll("img"),
			orig = false, resize = 100;
			
		function current() {
			var scrTop = window.scrollY,
				top = Math.round(cont.getBoundingClientRect().top) + scrTop,
				windowHeight = window.innerHeight,
				select = [],
				i, ch;
				
			for (i = 0; i < images.length; i++) {
				ch = images[i].clientHeight;
				if (top + ch < scrTop) {
					top += ch;
					continue;
				} else if (top <= scrTop + windowHeight) {
					select.push({
						top: top,
						height: ch,
						name: images[i].id
					});
					top += ch;
					continue;
				}
				break;
			}
			
			return select;
		}
		
		function handleClick(e) {
			if (!(e.target instanceof HTMLImageElement)) {
				return;
			}
			e.target.classList.toggle("original-size");
		}
		
		function resetWidth() {
			orig = false;
			resize = 100;
			if (maxWidthStyle.parentNode) {
				var st = scrollStamp();
				maxWidthStyle.parentNode.removeChild(maxWidthStyle);
				imageResize();
				st();
			}
		}
		
		function origWidth() {
			orig = true;
			resize = 100;
			var st = scrollStamp();
			maxWidthStyle.textContent = ".images img {max-width: none}";
			imageResize();
			document.head.appendChild(maxWidthStyle);
			st();
		}
		
		function increaseWidth() {
			resize += 10;
			applyResize();
		}
		
		function decreaseWidth() {
			resize = resize - 10 <= 0 ? 10 : resize - 10;
			applyResize();
		}
		
		function applyResize() {
			var st = scrollStamp();
			if (orig) {
				maxWidthStyle.textContent = ".images img {max-width: none}";
			} else {
				maxWidthStyle.textContent = ".images img {max-width: " + resize + "vw}";
			}
			imageResize();
			document.head.appendChild(maxWidthStyle);
			st();
		}
		
		function imageResize() {
			var i;
			for (i = 0; i < images.length; i++) {
				images[i].width = images[i].naturalWidth * resize / 100;
			}
		}
		
		function get(name) {
			var img = cont.querySelector("#" + CSS.escape(name));
			if (img) {
				return {
					name: name,
					top: Math.round(img.getBoundingClientRect().top + window.scrollY),
					height: img.clientHeight
				};
			}
		}
		
		function scrollStamp() {
			var bm = bookmark.create(),
				scrollable = document.documentElement.scrollWidth - document.documentElement.clientWidth,
				scrollX = window.scrollX;
				
			return function() {
				bookmark.go(bm);
				
				var scrollable2 = document.documentElement.scrollWidth - document.documentElement.clientWidth,
					scrollX2;
					
				if (scrollable) {
					scrollX2 = scrollX / scrollable * scrollable2;
				} else {
					scrollX2 = scrollable2 / 2;
				}
				
				window.scrollTo(scrollX2, window.scrollY);
			};
		}
		
		bind(cont, "click", handleClick);
		
		return {
			current: current,
			resetWidth: resetWidth,
			origWidth: origWidth,
			increaseWidth: increaseWidth,
			decreaseWidth: decreaseWidth,
			get: get
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
	// Mousetrap.bind("left", scroller.prevPage);
	// Mousetrap.bind("right", scroller.nextPage);
	Mousetrap.bind("shift+pageup", scroller.prevJump);
	Mousetrap.bind("shift+pagedown", scroller.nextJump);
	Mousetrap.bind("0", images.origWidth);
	Mousetrap.bind("8", images.resetWidth);
	Mousetrap.bind("-", images.decreaseWidth);
	Mousetrap.bind("=", images.increaseWidth);
}
