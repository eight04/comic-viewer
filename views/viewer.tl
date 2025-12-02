<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
  <title>${escapeHtml(d.curr.name)}</title>
	<link rel="stylesheet" href="/viewer.css">
	<style id="hide-cursor-style">
		::-webkit-scrollbar {
			display: none;
		}
	</style>
	<script src="/mousetrap-js/mousetrap.js"></script>
	<script src="/fetchival/index.js"></script>
	<script>
    var cv = ${d.comicViewer};
    var match;
		
		// check isfile
		if (cv.isFile) {
			location.href = "/view?path=" + encodeURIComponent(cv.curr.dir) + "#" + cv.curr.name;
		}
	</script>
	<script src="/viewer.js"></script>
</head>
<body>
	<div class="container">
		<div class="container-inner">
			<div class="nav">
        <a class="title main">${escapeHtml(d.curr.name)}</a>
				<div class="right">
					<a class="command-explorer">Explorer</a>
					<a class="command-bookmarks">Bookmarks</a>
					<div class="bookmark-menu"></div>
				</div>
			</div>
			<div class="images">
        ${d.files.map(file => {
          if (/\.(jpg|jpeg|png|gif)$/i.test(file.name)) {
            return `<img src="/src?path=${encodeURIComponent(file.full)}" id="${escapeHtml(file.name)}">`;
          } else {
            return '';
          }
        }).join('')}
			</div>
      ${d.dirs.length ? `<div class="dir-controls">
        <input type="text" class="dir-search-box">
      </div>` : ''}
			<div class="dirs">
        ${d.dirs.map(file =>
          `<a href="/view?path=${encodeURIComponent(file.full)}" id="${escapeHtml(file.name)}">${escapeHtml(file.name)}</a>`
          ).join('')}
			</div>
			<div class="controls">
        ${d.prev ?  `<a href="/view?path=${encodeURIComponent(d.prev.full)}" id="prev" title="${escapeHtml(d.prev.name)}">Prev</a>` : '' }
        ${d.curr.dir ? `<a href="/view?path=${encodeURIComponent(d.curr.dir)}#${d.curr.name}" title="${escapeHtml(d.curr.dirname)}">..</a>` : '' }
        ${d.next ? `<a href="/view?path=${encodeURIComponent(d.next.full)}" id="next" title="${escapeHtml(d.next.name)}">Next</a>` : '' }
      </div>
		</div>
	</div>
	<div class="layers">
		<div class="notify"></div>
	</div>
</body>
</html>
