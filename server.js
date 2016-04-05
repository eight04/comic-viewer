//Lets require/import the HTTP module
var http = require('http'),
	fs = require("fs"),
	opener = require("opener");

//Lets define a port we want to listen to
const PORT=8080; 

root = "D:\\Downloads\\Comic Crawler\\无家可归的狐神\\";

function serve(o, res) {
	res.setHeader("Content-Type", "application/json");
	res.end(JSON.stringify(o));
}

function serveFile(name, res) {
	fs.access(name, function(err) {
		if (err) {
			return serve({error: "no access"}, res);
		}
		fs.createReadStream(name).pipe(res);
	});
}

function serveList(sub, res) {
	fs.readdir(sub, function(err, files){
		if (err) {
			return serve({error: "no access"}, res);
		}
		serve(files, res);
	});
}

function serveNext(name, res) {
	fs.readdir(name, function(err, files){
		if (err) {
			return serve({error: "no access"}, res);
		}
		var c, p;
		for (c of files) {
			if (p == name) {
				return serve({url: "../" + c + "/"}, res);
			}
			p = c;
		}
		serve({end: true}, res);
	});
}

function serveBack(name, res) {
	fs.readdir(name, function(err, files){
		if (err) {
			return serve({error: "no access"}, res);
		}
		var c, p;
		for (c of files) {
			if (c == name) {
				break;
			}
			p = c;
		}
		if (p) {
			return serve({url: "../" + p + "/"}, res);
		}
		serve({end: true}, res);
	});
}

//We need a function which handles requests and send response
function handleRequest(req, res){
	req.url = decodeURI(req.url);

	route(req, res);
}

function route(req, res) {
	var match;
	
	if (req.url == "/") {
		serveFile("index.html", res);
	} else if (req.url == "/list") {
		serveList(root, res);
	} else if (req.url.match(/^\/[^/]+\/$/)) {
		serveFile("reader.html", res);
	} else if (match = req.url.match(/^\/([^/]+)\/images$/)) {
		serveList(root + match[1], res);
	} else if (match = req.url.match(/^\/([^/]+)\/next$/)) {
		serveNext(match[1], res);
	} else if (match = req.url.match(/^\/([^/]+)\/back$/)) {
		serveBack(match[1], res);
	} else {
		serveFile(root + req.url.substr(1), res);
	}
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    opener("http://localhost:" + PORT);
});
