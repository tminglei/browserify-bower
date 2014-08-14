'use strict';

var path = require('path');
var fs 	 = require('fs');
var _  = require('lodash-node');

//
// determine bower components home dir, maybe need to get dir name from '.bowerrc'
//
function componentsHome(workdir) {
	var bowerrc = path.join(workdir, '.bowerrc'),
		defaultHome = path.join(workdir, 'bower_components');
	return (fs.existsSync(bowerrc) && require(bowerrc).directory) || defaultHome;
}

//
// extract component name from inputting rawname
//
function componentName(rawname) {
	var name = rawname.split(':')[0],
		index = name.replace('\\', '/').indexOf('/');
	return (index > 0) ? name.substring(0, index) : name;
}

//
// get bower components names
//
function componentNames(workdir) {
	workdir = workdir || process.cwd();
	var bowerJson = require(path.join(workdir, 'bower.json'));
	return _(Object.keys(bowerJson.dependencies || {}))
		.union(Object.keys(bowerJson.devDependencies || {}))
		.value();
}
exports.componentNames = componentNames;

//
// resolve and return entry file's full path for specified component
//
function resolve(name, workdir) {
	workdir = workdir || process.cwd();
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

		if (mainfile) {
			return path.join(basedir, mainfile);
		}	else {
			if (fs.existsSync(path.join(basedir, "index.js"))) {
				return path.join(basedir, "index.js");
			} else {
				return path.join(basedir, compName);
			}
		}
	}
}
exports.resolve = resolve;
