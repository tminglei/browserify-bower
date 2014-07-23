'use strict';

var path = require('path');
var utils = require('./utils');
var _  = require('lodash-node');

module.exports = function (browserify, options) {
	options = options || { "require": utils.componentNames() };

	_(options).forEach(function(conf, action) {
		if (_(conf).isArray()) conf = { "include": conf };

		var workinglist = _(conf.include || utils.componentNames())
			// filter out excluded names
			.filter(function(name) {
				return !_(conf.exclude).map(function(name1) {
					return name1.split(':')[0];
				}).contains(name.split(':')[0]);
			})
			// merge in alias configs
			.map(function(name) {
				var found = _(conf.alias).find(function(name1) {
					return name.split(':')[0] === name1.split(':')[0];
				});
				return found || name;
			})
			// prepare the working list
			.map(function(rawname) {
				var name = rawname.split(':')[0],
					alias = rawname.split(':')[1];
				return {
					name:  name,
					alias: alias || name,
					path: utils.resolve(name)
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