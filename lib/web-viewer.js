var fs = require("fs"),
	path = require("path");
const natsort = require("natsort").default;
	
// readdir and get stats
function readdir(p, callback) {
	fs.readdir(p, function(err, files) {
		if (err) {
			callback();
			return;
		}
		files.sort(natsort());
		var i, pending = [];
		for (i = 0; i < files.length; i++) {
			pending.push(getStatsP(path.join(p, files[i])));
		}
		Promise.all(pending).then(function(stats){
			callback(files, stats);
		});
	});
}

function getSiblingP(locals) {
	return new Promise(function(resolve){
		readdir(locals.curr.dir, function(files, stats){
			var pos = files.indexOf(locals.curr.name),
				i;
			
			// previous sibling
			for (i = pos - 1; i >= 0; i--) {
				if (!stats[i].isDirectory()) {
					continue;
				}
				locals.prev = {
					full: path.join(locals.curr.dir, files[i]),
					name: files[i]
				};
				break;
			}
			
			// next sibling
			for (i = pos + 1; i < files.length; i++) {
				if (!stats[i].isDirectory()) {
					continue;
				}
				locals.next = {
					full: path.join(locals.curr.dir, files[i]),
					name: files[i]
				};
				break;
			}
			
			resolve();
		});
	});
}

function getStatsP(file) {
	return new Promise(function(resolve){
		fs.stat(file, function(err, stat){
			resolve(stat);
		});
	});
}

function getSubP(locals) {
	return new Promise(function(resolve){
		readdir(locals.curr.full, function(files, stats) {
			var d = locals.dirs = [], f = locals.files = [],
				i, fo;
				
			for (i = 0; i < files.length; i++) {
				fo = {
					full: path.join(locals.curr.full, files[i]),
					name: files[i]
				};
				if (stats[i].isDirectory()) {
					d.push(fo);
				} else {
					f.push(fo);
				}
			}
			
			resolve();
		});
	});
}

function createWebViewer(app){
	
	app.all("*_", function(req, res, next){
		if (req.query.path) {
			req.query.path = path.normalize(req.query.path);
		}
		next();
	});
	
	app.get("/view", function(req, res, next){
		// extract folder information
		var p = req.query.path,
			c = res.locals.curr = {
				dir: path.dirname(p),
				dirname: path.basename(path.dirname(p)),
				full: p,
				name: path.basename(p)
			};
		
		if (!c.name) {
			c.name = p;
			c.dir = "";
		}
		res.locals.prev = null;
		res.locals.next = null;
		
		var pending = [];
		
		// get siblings
		if (c.dir) {
			pending.push(getSiblingP(res.locals));
		}
		
		// check if the path is a directory
		getStatsP(p).then(function(stat){
			if (stat.isDirectory()) {
				pending.push(getSubP(res.locals));
			} else {
				res.locals.isFile = true;
				res.locals.files = [c];
				res.locals.dirs = [];
			}
			Promise.all(pending).then(function(){
				next();
			});
		});
	});
	
	app.get("/src", function(req, res, next) {
		fs.stat(req.query.path, function(err, stat){
			if (err || !stat.isFile()) {
				res.sendStatus(404);
			} else {
				next();
			}
		});
	});
	
	return app;
}

module.exports = createWebViewer;
