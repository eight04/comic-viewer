const fs = require("fs/promises");
const { default: isImage } = require("is-image");

function createServer(port, callback, onerr) {
	var express = require("express"),
		createWV = require("./web-viewer"),
		bodyParser = require("body-parser"),
		opener = require("open"),
		app = express();
		
	app.use("/fetchival", express.static("node_modules/fetchival"));
	app.use("/mousetrap-js", express.static("node_modules/mousetrap"));
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
	
	app.post("/open", async function(req){
		if (req.body.path) {
			const inputPath = decodeURIComponent(req.body.path);
      if (await isPathValid(inputPath)) {
        opener(inputPath);
      }
		}
	});
	
	app.listen(port, "localhost", callback).on("err", onerr);
}

async function isPathValid(p) {
  try {
    const stat = await fs.stat(p);
    if (stat.isDirectory()) {
      return true;
    }
    if (stat.isFile()) {
      return isImage(p);
    }
  } catch (e) {
    console.warn(`Invalid path: ${p}`);
  }
  return false;
}

module.exports = createServer;
