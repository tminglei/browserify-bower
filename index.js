'use strict';

var path = require('path');
var utils = require('./utils');
var _  = require('lodash-node');

function _mkOptions(action, options, names) {
	if (names && !_(names).isArray()) {
		options = names;
		names = null;
	}
	options = options || {};
	options.action  = action;
	options.include = options.include || names;
	return options;
}

function brbower(browserify, options) {
	options = options || {};
	var workinglist = [];

	if (options.include === '*') options.include = null;

	workinglist = _(options.include || utils.componentNames())
		// filter out excluded names
		.filter(function(name) {
			var name0 = name.split(':')[0];
			return !_(options.exclude).map(function(name1) {
				return name1.split(':')[0];
			}).contains(name0);
		})
		// merge in alias configs
		.map(function(name) {
			var found = _(options.alias).find(function(name1) {
				return name.split(':')[0] === name1.split(':')[0];
			});
			return found || name;
		})
		// prepare the working list
		.map(function(rawname) {
			var name = rawname.split(':')[0],
				alias = rawname.split(':')[1];
			return {
				name: name,
				alias: alias || name,
				path: utils.resolve(name)
			}
		});

	options.action = options.action || 'require';
	if (options.action === 'require') {
		workinglist.forEach(function(item) {
			browserify.require(item.path, { expose: item.alias });
		});
	} else { // external
		workinglist.forEach(function(item) {
			browserify.external(item.alias);
		});
	}
}

///
module.exports = brbower;

module.exports.require = function(names, options) {
	return function(browserify) {
		brbower(browserify, _mkOptions('require', options, names));
	}
};

module.exports.external = function(names, options) {
	return function(browserify) {
		brbower(browserify, _mkOptions('external', options, names));
	}
};

module.exports.resolve = function(name) {
	if(!_(utils.componentNames()).contains(utils.componentName(name))) {
		throw new Error('Can\'t find bower component for: ' + name);
	}
	return utils.resolve(name);
};
