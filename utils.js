'use strict';

var path = require('path');
var fs 	 = require('fs');
var _  = require('lodash');

//
// determine bower components home dir, maybe need to get dir name from '.bowerrc'
//
function componentsHome(workdir) {
	var bowerrc = path.join(workdir, '.bowerrc'), bowerConfig = {};
	if (fs.existsSync(bowerrc)) bowerConfig = JSON.parse(fs.readFileSync(bowerrc));
	return path.join(workdir, bowerConfig.directory || 'bower_components');
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
// resolve and return entry file's full path w/ deps for specified component
//
function resolve(name, workdir, mainfiles) {
	workdir = workdir || process.cwd();
	var compName = componentName(name),
		subname = name.substring(compName.length + 1),
		basedir = path.join(componentsHome(workdir), compName),
		bowerJson = {},
		mainfile;

	if (mainfiles[compName]) {
		mainfile = mainfiles[compName];
	} else {
		var bowerPath = path.join(basedir, 'bower.json');
		var exists = fs.existsSync(bowerPath);
		if (!exists) {
			bowerPath = path.join(basedir, '.bower.json');
			exists = fs.existsSync(bowerPath);
		}
		if (exists) {
			bowerJson = require(bowerPath);
			mainfile = Array.isArray(bowerJson.main)
				? bowerJson.main.filter(function(file) { return /\.js$/.test(file); })[0]
				: bowerJson.main;
		}
	}

	var entryPath = '';
	if (subname && subname.length > 0) {
		var subpath = mainfile && path.join(basedir, mainfile, '..', subname);
		if (subpath && (fs.existsSync(subpath) || fs.existsSync(subpath + '.js'))) {
			entryPath = path.join(basedir, mainfile, '..', subname);
		} else {
			entryPath = path.join(basedir, subname);
		}
	} else {
		if (mainfile) {
			entryPath = path.join(basedir, mainfile);
		} else {
			if (fs.existsSync(path.join(basedir, "index.js"))) {
				entryPath = path.join(basedir, "index.js");
			} else {
				entryPath = path.join(basedir, compName);
			}
		}
	}

	var deps = (subname && subname.length > 0) ? [] // don't resolve deps for partial reference
		: _(bowerJson.dependencies || {})
			.map(function(ver, name) {
				return resolve(name, workdir, mainfiles);
			}).flatten().value();

	if (!entryPath) throw new Error('Unable to resolve mainfile for component ' + name);

	return [{
		name: name,
		path: entryPath
	}].concat(deps);
}
exports.resolve = resolve;
