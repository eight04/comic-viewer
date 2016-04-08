var process = require("process"),
	replace = require("replace"),
	pkg = require("../package.json");
	
replace({
	regex: /version("|'|): ("|'|)[\d.]+/,
	replacement: "version$1: $2" + pkg.version,
	paths: process.argv.slice(2)
});
