'use strict';

var path = require('path');
var utils = require('./utils');
var _  = require('lodash');
var dotAccess = require('dot-access');

var _workdir = process.cwd();

module.exports = browserifyBower;
module.exports.workdir = function(workdir) {
	_workdir = workdir || _workdir;
	return workdir && browserifyBower || _workdir;
};

//////////////////////////////////////////////////////////////////////////////

function browserifyBower(browserify, options) {
	if (_.isEmpty(options)) {
		options = { "require": utils.componentNames(_workdir) };
	}	

	if (options.workdir) _workdir = options.workdir;
	if (options.conf) {
		var confjson = require(path.join(_workdir, options.conf));
		options = options.confnode && dotAccess.get(confjson, options.confnode) || confjson;
	}

	_.forEach(options, function(config, action) {
		if (_(['require', 'external']).contains(action)) {
			if (_(config).isArray()) config = { "include": config };

			var aliasConfigs = _(config.include)
				.filter(function(name) {
					return name.indexOf(':') > 0
						&& !_(config.alias).any(function(name1) {
								return name.split(':')[0] === name1.split(':')[0];
							});
				})
				.union(config.alias)
				.map(function(rawname) {
					return {
						name: rawname.split(':')[0],
						alias: rawname.split(':')[1]
					}
				})
				.value();

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
				// resolve name and deps
				.uniq()
				.map(function(rawname) {					
					var name = rawname.split(':')[0];
					return utils.resolve(name, _workdir);
				})
				// prepare the working list
				.flatten()
				.groupBy(function(item) {
					return item.name;
				})
				.map(function(list, name) {
					return {
						name: name,
						path: list[0].path
					};
				})
				// merge in alias configs
				.map(function(item) {
					var found  = _.find(aliasConfigs, { name: item.name });
					item.alias = found ? found.alias : item.name;
					return item;
				});

			///
			if (action === 'require') {
				workinglist.forEach(function(item) {
					browserify.require(item.path, { expose: item.alias });
				}).value();
			} else { // external
				workinglist.forEach(function(item) {
					browserify.external(item.alias);
				}).value();
			}
		}
	});
};
