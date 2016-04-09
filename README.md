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
  comic-viewer [--port <port>] [--start | --stop] [<file>]
  comic-viewer --help | --version
  
Options:
  --port <port>  Set the port of the server. [default: 8080]
  --start        Start the server, if the server is not already running.
  --stop         Stop the server.
  <file>         The file to open in browser, if provided.
  --help         Show help message.
  --version      Show version number.
```

For example:

```
comic-viewer --start "C:\My Pictures\test.jpg"
```

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
* 0.1.1 (Apr 9, 2016)
	- Fix prev/next undefined bug.
	- Use localhost hostname.
* 0.1.0 (Apr 9, 2016)
	- First release

