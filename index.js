'use strict';

var path = require('path');
var utils = require('./utils');
var _  = require('lodash');

var _workdir = process.cwd();

module.exports = browserifyBower;
module.exports.workdir = function(workdir) {
	_workdir = workdir || _workdir;
	return workdir && browserifyBower || _workdir;
};

//////////////////////////////////////////////////////////////////////////////
/**
 * alias can be configured at: options.alias > currConfig.alias > currConfig.include (later can override former)
 * NOTE: options.alias and currConfig.alias can be: { name1: alias1, ... } or ['name1:alias1', ...]
 **/
function getAliasConfigs(options, currConfig) {
	var aliasConfigs = {}, 
		optAlias = {}, confAlias = {}, incAlias = {};
	
	if (_.isArray(options.alias)) {
		_.forEach(options.alias || [], function(rawname) {
			optAlias[rawname.split(':')[0]] = rawname.split(':')[1];
		});
	} else optAlias = options.alias;
	
	if (_.isArray(currConfig.alias)) {
		_.forEach(currConfig.alias || [], function(rawname) {
			confAlias[rawname.split(':')[0]] = rawname.split(':')[1];
		});
	} else confAlias = currConfig.alias;
	
	_.forEach(currConfig.include || [], function(rawname) {
			if (rawname.indexOf(':') > 0) {
				incAlias[rawname.split(':')[0]] = rawname.split(':')[1];
			}
		});
		
	return _.extend(aliasConfigs, optAlias, confAlias, incAlias);
}

function getWorkingLists(options) {
	var workinglists = {};

	var mainfiles = options.mainfiles || {};

	_.forEach(options, function(config, action) {
		if (_(['require', 'external']).includes(action)) {
			if (_(config).isArray()) config = { "include": config };

			var aliasConfigs = getAliasConfigs(options, config);

			var excludeFilter = function(name) {
				name = name.name || name;
				return !_(config.exclude).map(function(name1) {
					return name1.split(':')[0];
				}).includes(name.split(':')[0]);
			};

			var workinglist = _(config.include || utils.componentNames(_workdir))
				// process '*' including
				.map(function(name) {
					return (name === '*') ? utils.componentNames(_workdir) : name;
				})
				.flatten()
				// filter out excluded names
				.filter(excludeFilter)
				// resolve name and deps
				.uniq()
				.map(function(rawname) {
					var name = rawname.split(':')[0];
					return utils.resolve(name, _workdir, mainfiles);
				})
				// prepare the working list
				.flatten()
				// filter out excluded dependencies
				.filter(excludeFilter)
				.groupBy(function(item) {
					return item.name;
				})
				.map(function(list, name) {
					return {
						name : name,
						alias: aliasConfigs[name] || name, // merge in alias configs
						path : list[0].path
					};
				}).value();

			///
			workinglists[action] = workinglist;
		}
	});

	return workinglists;
}

function browserifyBower(browserify, options) {
	options = options || {};

	if (options.workdir) _workdir = options.workdir;
	if (options.conf) {
		var confjson = require(path.join(_workdir, options.conf));
		options = options.confnode && _.get(confjson, options.confnode) || confjson;
	}
	// if no reqiure configs are specified, let it include all components.
	options.require = options.require || utils.componentNames(_workdir);

	///
	var workinglists = getWorkingLists(options);

	// if an item existed in both 'require' and 'external' lists, let's remove it from 'require' list
	workinglists.require = _.filter(workinglists.require || [], function(item) {
		return ! _.find(workinglists.external || [], { name: item.name });
	});

	///
	_.forEach(workinglists.require  || [], function(item) {
		browserify.require(item.path, { expose: item.alias });
	});

	_.forEach(workinglists.external || [], function(item) {
		browserify.external(item.alias);
	});
};
