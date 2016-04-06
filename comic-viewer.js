var doc = `Comic Viewer

Usage:
  comic-viewer [--port <port>] [--no-server] [<file>]
  comic-viewer --help | --version
  
Options:
  --port <port>  Set the port of the server. [default: 8080]
  --no-server    Launch the file without starting comic-viewer server.
  <file>         The file path. Open URL if provided. (http://localhost:8080/
                 view?path=<file>)
  --help         Show help message.
  --version      Show version number.`;

var docopt = require("docopt"),
	args = docopt.docopt(doc, {version: "0.0.0"});
	
function startServer() {	
	var express = require("express"),
		createWV = require("./web-viewer"),
		app = express();
		
	app.use("/jquery", express.static("bower_components/jquery/dist"));
	
	createWV(app);
	
	app.get("/view", function(req, res){
		res.locals.comicViewer = JSON.stringify({
			isFile: res.locals.isFile,
			curr: res.locals.curr,
			next: res.locals.next,
			prev: res.locals.prev
		});
		res.render("viewer.ejs");
	});
	
	app.listen(args["--port"], launchFile).on("error", handleError);
}

function handleError(err) {
	if (err.code == "EADDRINUSE") {
		launchFile();
	} else {
		throw err;
	}
}

function launchFile() {
	// console.log(args);
	if (!args["<file>"]) {
		return;
	}
	var opener = require("opener");
	opener("http://localhost:" + args["--port"] + "/view?path=" + encodeURIComponent(args["<file>"]));
}

if (!args["--no-server"]) {
	startServer();
} else {
	launchFile();
}
