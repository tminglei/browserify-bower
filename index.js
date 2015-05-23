'use strict';

var path = require('path');
var utils = require('./utils');
var _  = require('lodash-node');
var dotAccess = require('dot-access');

var _workdir = process.cwd();

module.exports = browserifyBower;
module.exports.workdir = function(workdir) {
	_workdir = workdir || _workdir;
	return workdir && browserifyBower || _workdir;
};

//////////////////////////////////////////////////////////////////////////////

function browserifyBower(browserify, options) {
	options = options || { "require": utils.componentNames(_workdir) };

	if (options.workdir) _workdir = options.workdir;
	if (options.conf) {
		var confjson = require(path.join(_workdir, options.conf));
		options = options.confnode && dotAccess.get(confjson, options.confnode) || confjson;
	}

	_(options).forEach(function(config, action) {
		if (_(['require', 'external']).contains(action)) {
			if (_(config).isArray()) config = { "include": config };

			var aliasConfig = _(config.include).filter(function(name) {
					return name.indexOf(':') > 0 
						&& !_(config.alias).any(function(name1) {
							return name.split(':')[0] === name1.split(':')[0];
						});
				}).union(config.alias).value();

			var workinglist = _(config.include || utils.componentNames(_workdir))
				// process '*' including
				.map(function(name) {
					return (name === '*') ? utils.componentNames(_workdir) : name;
				})
				.flatten()
				// filter out excluded names
				.filter(function(name) {
					return !_(config.exclude).map(function(name1) {
						return name1.split(':')[0];
					}).contains(name.split(':')[0]);
				})
				// merge in alias configs
				.map(function(name) {
					var found = _(aliasConfig).find(function(name1) {
						return name.split(':')[0] === name1.split(':')[0];
					});
					return found || name;
				})
				// prepare the working list
				.uniq()
				.map(function(rawname) {
					var name = rawname.split(':')[0],
						alias = rawname.split(':')[1];
					return {
						name:  name,
						alias: alias || name,
						path: utils.resolve(name, _workdir)
					};
				});

			///
			if (action === 'require') {
				workinglist.forEach(function(item) {
					browserify.require(item.path, { expose: item.alias });
				});
			} else { // external
				workinglist.forEach(function(item) {
					browserify.external(item.alias);
				});
			}
		}
	});
};
