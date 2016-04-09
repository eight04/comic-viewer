var fs = require("fs"),
	path = require("path");
	
function strCmp(a, b) {
	return a < b ? -1 : a > b;
}
	
function fnCmp(a, b) {
	var ma = a.match(/\d+|\D+/g),
		mb = b.match(/\d+|\D+/g);
	
	var i, nanA = Number.isNaN(+ma[0][0]), nanB = Number.isNaN(+mb[0][0]), diff, q;
	if (nanA ^ nanB) {
		return strCmp(a, b);
	}
	if ((diff = ma.length - mb.length)) {
		return diff;
	}
	if (nanA) {
		q = 1;
	} else {
		q = 0;
	}
	for (i = 0; i < ma.length; i++) {
		if (i % 2 == q) {
			if ((diff = ma[i] - mb[i])) {
				return diff;
			}
		} else {
			if ((diff = strCmp(ma[i], mb[i]))) {
				return diff;
			}
		}
	}	
}

function createWebViewer(app){
	
	app.all("*", function(req, res, next){
		if (req.query.path) {
			req.query.path = path.normalize(req.query.path);
		}
		next();
	});
	
	app.get("/view", function(req, res, next){
		// basic information
		var curr = res.locals.curr = {
			dir: path.dirname(req.query.path),
			dirname: path.basename(path.dirname(req.query.path)),
			full: req.query.path,
			name: path.basename(req.query.path)
		};
		
		res.locals.prev = null;
		res.locals.next = null;
		
		// read parent dir, get prev, next
		if (curr.dir == curr.full) {
			// under drive
			next();
			return;
		}
		fs.readdir(curr.dir, function(err, files){
			if (err) {
				next();
				return;
			}
			
			files.sort(fnCmp);
			
			var i = files.indexOf(curr.name),
				p = files[i - 1],
				n = files[i + 1];
			
			res.locals.prev = p && {
				full: path.join(curr.dir, p),
				name: p
			};
			
			res.locals.next = n && {
				full: path.join(curr.dir, n),
				name: n
			};
			
			next();
		});
	}, function(req, res, next) {
		// get stats
		fs.stat(res.locals.curr.full, function(err, stat){
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
			res.locals.files = [res.locals.curr];
			res.locals.dirs = [];
			next();
			return;
		}
		fs.readdir(res.locals.curr.full, function(err, files) {
			if (err) {
				res.sendStatus(500);
				return;
			}
			
			files.sort(fnCmp);
			
			var i, promises = [];
			for (i = 0; i < files.length; i++) {
				promises.push(getStats({
					name: files[i],
					full: path.join(res.locals.curr.full, files[i]),
					isFile: null
				}));
			}
			Promise.all(promises).then(function(values){
				var files = [], dirs = [], i;
				for (i = 0; i < values.length; i++) {
					if (values[i].isFile) {
						files.push(values[i]);
					} else {
						dirs.push(values[i]);
					}
				}
				res.locals.files = files;
				res.locals.dirs = dirs;
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
	
	function getStats(file) {
		return new Promise(function(resolve){
			fs.stat(file.full, function(err, stat){
				if (!err) {
					file.isFile = stat.isFile();
				}
				resolve(file);
			});
		});
	}
	
	return app;
}

module.exports = createWebViewer;
