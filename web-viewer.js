var fs = require("fs"),
	express = require("express"),
	path = require("path");

function createWebViewer(port, reqCallback, listenCallback){
	var app = express();
	
	app.use(express.static("public"));
	
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
		
		// read parent dir, get prev, next
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
	}, function(req, res, next) {
		// get stats
		fs.stat(req.query.path, function(err, stat){
			if (err) {
				res.sendStatus(404);
				return;
			}
			res.locals.isFile = stat.isFile();
			next();
		});
	}, function(req, res, next) {
		// get dir info
		if (res.locals.isFile) {
			res.locals.files = [res.locals.basename];
			next();
			return;
		}
		fs.readdir(req.query.path, function(err, files) {
			if (err) {
				res.sendStatus(500);
				return;
			}
			var i, promises = [];
			for (i = 0; i < files.length; i++) {
				promises.push(getStats(path.join(res.locals.path, files[i]), {
					name: files[i],
					isFile: null
				}));
			}
			Promise.all(promises).then(function(values){
				var files = [], dirs = [], i;
				for (i = 0; i < values.length; i++) {
					if (values[i].isFile) {
						files.push(values[i].name);
					} else {
						dirs.push(values[i].name);
					}
				}
				res.locals.files = files;
				res.locals.dirs = dirs;
				next();
			});
		});
	}, reqCallback);
	
	app.get("/src", function(req, res) {
		fs.stat(req.query.path, function(err, stat){
			if (err || !stat.isFile()) {
				res.sendStatus(404);
			} else {
				res.sendFile(req.query.path);
			}
		});
	});
	
	function getStats(fn, file) {
		return new Promise(function(resolve, reject){
			fs.stat(fn, function(err, stat){
				if (err) {
					file.isFile = stat.isFile()
				}
				resolve(file);
			});
		});
	}
	
	app.listen(port, listenCallback);
}

module.export = createWebViewer;
