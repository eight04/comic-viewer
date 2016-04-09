function createServer(port, callback, onerr) {
	var express = require("express"),
		createWV = require("./web-viewer"),
		bodyParser = require("body-parser"),
		opener = require("opener"),
		app = express();
		
	app.use("/fetchival", express.static("bower_components/fetchival"));
	app.use("/mousetrap-js", express.static("bower_components/mousetrap-js"));
	app.use(express.static("public"));
	
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
	
	app.get("/src", function(req, res) {
		if (!/\.(jpg|jpeg|png|gif)$/i.test(req.query.path)) {
			res.sendStatus(403);
		} else {
			res.sendFile(req.query.path);
		}
	});
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
		extended: true
	})); 
	
	app.post("/open", function(req){
		if (req.body.path) {
			req.body.path = decodeURIComponent(req.body.path);
			opener(req.body.path);
		}
	});
	
	app.listen(port, "localhost", callback).on("err", onerr);
}

module.exports = createServer;
