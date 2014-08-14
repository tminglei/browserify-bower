'use strict';

var path = require('path');
var utils = require('./utils');
var _  = require('lodash-node');

var _workdir = process.cwd();

var brbower = module.exports = function (browserify, options) {
	options = options || { "require": utils.componentNames(_workdir) };

	_(options).forEach(function(config, action) {
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

		if (!_(['require', 'external']).contains(action)) {
			throw new Error('unsupportted action: ' + action);
		}

		if (action === 'require') {
			workinglist.forEach(function(item) {
				browserify.require(item.path, { expose: item.alias });
			});
		} else { // external
			workinglist.forEach(function(item) {
				browserify.external(item.alias);
			});
		}
	});
};

brbower.setWorkdir = function (workdir) {
	_workdir = workdir || _workdir;
	return brbower;
};
