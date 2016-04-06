var fs = require("fs"),
	express = require("express"),
	path = require("path");

function createWebViewer(){
	var app = express(),
		userHandler = {
			file: null,
			dir: null
		};
	
	app.all("*", function(req, res, next){
		if (!req.query.path) {
			res.sendStatus(404);
			return;
		}
		req.query.path = path.normalize(req.query.path);
		next();
	});
	
	app.get("/view", function(req, res, next){
		// basic information
		res.locals.path = req.query.path;
		res.locals.dirname = path.dirname(req.query.path),
		res.locals.basename = path.basename(req.query.path);
		
		// read parent dir
		if (res.locals.dirname == req.query.path) {
			next();
			return;
		}
		fs.readdir(res.locals.dirname, function(err, files){
			if (err) {
				next();
				return;
			}
			var i = files.indexOf(res.locals.basename);
			
			res.locals.prev = files[i - 1];
			res.locals.next = files[i + 1];
			
			next();
		});
	}, function(req, res) {
		// route to file or dir
		fs.stat(req.query.path, function(err, stat){
			if (err) {
				res.sendStatus(404);
				return;
			}
			if (stat.isFile()) {
				viewFile(req, res);
			} else {
				viewDir(req, res);
			}
		});
	});
	
	app.get("/src", function(req, res) {
		fs.stat(req.query.path, function(err, stat){
			if (err || !stat.isFile()) {
				res.sendStatus(404);
			} else {
				res.sendFile(req.query.path);
			}
		});
	});
	
	function viewFile(req, res) {
		userHandler.file(req, res);
	}
	
	function viewDir(req, res) {
		// read dir
		fs.readdir(req.query.path, function(err, files) {
			if (err) {
				res.sendStatus(500);
				return;
			}
			res.locals.files = files;
			userHandler.dir(req, res);
		});
	}
	
	function file(callback) {
		userHandler.file = callback;
	}
	
	function dir() {
		userHandler.dir = callback;
	}
	
	function listen() {
		app.listen.apply(app, arguments);
	}
	
	return {
		file: file,
		dir: dir,
		listen: listen
	};
}

module.export = createWebViewer;
