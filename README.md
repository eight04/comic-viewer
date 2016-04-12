Comic Viewer
============
Runs a comic viewer website locally.

Install
-------
```
npm install -g comic-viewer
```

Usage
-----
```
Comic Viewer

Usage:
  comic-viewer [--port <port>] (--start | --stop)
  comic-viewer [--port <port>] [--start | --stop] [--run-with <browser>] <file>
  comic-viewer --help | --version
  
Options:
  --port <port>         Set the port of the server. [default: 8080]
  --start               Start the server, if the server is not already running.
  --stop                Stop the server.
  --run-with <browser>  Specify browser executable.
  <file>                The file to open, if provided.
  --help                Show help message.
  --version             Show version number.`;
```

For example:

```
comic-viewer --start "C:\My Pictures\test.jpg"
```

Hotkeys
-------
* `[` - previous directory.
* `]` - next directory.
* `q` - upper level directory.
* `b` - bookmark this file.
* `shift+b` - open latest bookmark.
* `ctrl+enter` - open explorer.
* `shift+pageup` - scroll up one page.
* `shift+pagedown` - scroll down one page.
* `0` - show original size.
* `8` - match window width.
* `=` - zoom in.
* `-` - zoom out.

Todos
-----
* In firefox with overflow hidden, the page won't scroll to correct position while searching.

Related apps
------------
* https://www.ptt.cc/bbs/EZsoft/M.1303122670.A.D98.html
* https://www.ptt.cc/bbs/EZsoft/M.1445671038.A.4AF.html
* https://www.ptt.cc/bbs/EZsoft/M.1433411258.A.B80.html

Changelog
---------
* 0.3.0 (Apr 12, 2016)
	- Drop bower depency, use github tarball.
* 0.2.0 (Apr 11, 2016)
	- Replace `opener` with `open`.
	- Add `--run-with` option.
	- Only read lock file if `--start/--stop` is set.
	- Change some style.
	- Fix bookmark bug.
	- Add resize function.
* 0.1.1 (Apr 9, 2016)
	- Fix prev/next undefined bug.
	- Use localhost hostname.
* 0.1.0 (Apr 9, 2016)
	- First release

