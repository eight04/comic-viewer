var doc = `Comic Viewer

Usage:
  comic-viewer [--port <port>] [--start | --stop] [<file>]
  comic-viewer --help | --version
  
Options:
  --port <port>  Set the port of the server. [default: 8080]
  --start        Start the server, if the server is not already running.
  --stop         Stop the server.
  <file>         The file to open in browser, if provided.
  --help         Show help message.
  --version      Show version number.`;

var docopt = require("docopt"),
	mkdirp = require("mkdirp"),
	process = require("process"),
	fs = require("fs"),
	
	args = docopt.docopt(doc, {version: "0.0.0"}),
	path = require("path-extra"),
	appDir = path.datadir("comic-viewer"),
	lock = path.join(appDir, "lock"),
	
	server = {
		pid: null,
		isLocked: null
	},
	
	createCV = require("../lib/comic-viewer");
	
function launchFile() {
	if (!args["<file>"]) {
		return;
	}
	var opener = require("opener");
	opener("http://localhost:" + args["--port"] + "/view?path=" + encodeURIComponent(args["<file>"]));
}

function createLock() {
	mkdirp(appDir, function(err) {
		if (err && err.code != "EEXIST") {
			console.err(err);
			exit();
			return;
		}
		fs.writeFile(lock, process.pid, function(err) {
			if (err) {
				console.err(err);
				exit();
				return;
			}
			// handle SIGINT
			process.on("SIGINT", function(){
				exit();
			});
		});
	});
}

function startServer() {
	createCV(args["--port"], createLock, exit);
}

function exit() {
	removeLock(process.exit);
}

function removeLock(callback) {
	fs.unlink(lock, callback);
}

function init() {
	if (args["--start"]) {
		if (server.isLocked) {
			console.log("Server is already running at pid:" + server.pid);
		} else {
			startServer();
		}
	}
	if (args["--stop"] && server.isLocked) {
		process.kill(server.pid);
	}
	launchFile();
}

process.chdir(path.join(__dirname, ".."));

fs.readFile(lock, function(err, pid) {
	server.isLocked = !err;
	server.pid = +pid;
	
	if (server.isLocked) {
		try {
			process.kill(+pid, 0);
		} catch (err) {
			// the process doesn't exist
			server.isLocked = false;
			removeLock(init);
			return;
		}
	}
	process.nextTick(init);
});
