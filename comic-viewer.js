var doc = `Comic Viewer

Usage
  comic-viewer [--port <port>] [--no-server] [--path <file>]
  comic-viewer --help | --version
  
Options:
  --port       Set the port of the server. [default: 8080]
  --no-server  Launch the file without starting comic-viewer server.
  --help       Show help message.
  --version    Show version number.`;

var docopt = require("docopt"),
	args = docopt(doc, {version: "0.0.0"}),;
	
function startServer() {	
	var express = require("express"),
		createWV = require("web-viewer"),
		app = createWV(express());
		
	app.use("/jquery", express.static("bower_components/jquery/dist"));
	
	app.get("/view", function(req, res){
		res.locals.dumps = JSON.stringify(res.locals);
		res.render("viewer.ejs");
	});
	
	app.listen(args["--port"], launchFile);
}

function launchFile() {
	if (!args["--path"]) {
		return;
	}
	var opener = require("opener");
	opener("http://localhost:" + args["--port"] + "/view?path=" + encodeURIComponent(args["--path"]));
}

if (!args["--no-server"]) {
	startServer();
} else {
	launchFile();
}
