var webViewer = require("web-viewer"),
	opener = require("opener"),
	app = webViewer();
	
app.file(function(req, res){
	// render reader
	// req.path ...
});

app.dir(function(req, res){
	// render file list
});

app.listen(8080, function(){
	opener("http://localhost:" + PORT);
});
