var doc = `Comic Viewer

Usage
  comic-viewer [--port <port>] [--no-server] <file>
  comic-viewer --help | --version
  
Options:
  --port       Set the port of the server. [default: 8080]
  --no-server  Launch the file without starting comic-viewer server.
  --help       Show help message.
  --version    Show version number.`;

var docopt = require("docopt"),
	arguments = docopt(doc, {version: "0.1.0"});
	webViewer = require("web-viewer"),
	opener = require("opener"),
	app = webViewer(),
	PORT = 8080;

app.file(function(req, res){
	// render reader
	// req.path ...
});

app.dir(function(req, res){
	// render file list
});

app.listen(PORT);
