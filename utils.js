'use strict';

var path = require('path');
var fs 	 = require('fs');

function componentsHome(workdir) {
	workdir = workdir || process.cwd();
	var bowerrc = path.join(workdir, '.bowerrc'),
		defaultHome = path.join(workdir, 'bower_components');
	return (fs.existsSync(bowerrc) && require(bowerrc).directory) || defaultHome;
}

//
// get bower components names
//
function componentNames(workdir) {
	workdir = workdir || process.cwd();
	var bowerJson = require(path.join(workdir, 'bower.json'));
	return Object.keys(bowerJson.dependencies || {});
}
exports.componentNames = componentNames;

//
// extract component name from inputting rawname
//
function componentName(rawname) {
	var name = rawname.split(':')[0],
		index = name.replace('\\', '/').indexOf('/');

	return (index > 0) ? name.substring(0, index) : name;
}
exports.componentName = componentName;

//
// resolve and return entry file's full path for specified component
//
function resolve(name, workdir) {
	var compName = componentName(name),
		subname = name.substring(compName.length + 1),
		basedir = path.join(componentsHome(workdir), compName),
		bowerJson = require(path.join(basedir, 'bower.json'));

	if (subname && subname.length > 0) {
		return path.join(basedir, subname);
	} else {
		var mainfile = Array.isArray(bowerJson.main) 
			? bowerJson.main.filter(function(file) { return /\.js$/.test(file); })[0] 
			: bowerJson.main;
		return path.join(basedir, mainfile || compName);
	}
}
exports.resolve = resolve;
