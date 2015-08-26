browserify-bower
================

[![NPM](https://nodei.co/npm/browserify-bower.png)](https://nodei.co/npm/browserify-bower/)

_(former name `brbower`)_

Let `browserify-bower` plugin require bower components for you when building bundles, then you can `require` them as normal node modules in application codes.  
You can also provide external config, to guide `browserify-bower` to external some bower components, which is useful when when building multiple bundles.


# install

With [npm](https://npmjs.org) do:

```
npm install browserify-bower
```

# usage
## Programmatic API
In your task runner like `gulp`, add this plugin to `browserify`:
```javascript
b.plugin('browserify-bower', {
	require: ['*', 'base62/lib/base62', 'base62/xxx:xxx'],
	external: {
		exclude: ['comp1', 'comp2']
	},
	alias: ['base62/lib/base62:base62'], // or alias: { 'base62/lib/base62':'base62', ... }
	mainfiles: { // specify the main file for packages without a bower.json
		'base62': 'main.js'
	}
});
```
_p.s. of course, you can also configure this in node `package.json`._

Then, in js or html codes, you can require it like normal node module:
```
// in xxx.js
var comp1 = require('comp1');
var comp2 = require('alias2');
...

// in xx.html
<div class="container-fluid">
...
</div>
<script type="text/javascript">
  require('domready')(function() {
    var comp1 = require('comp1');
    ...
  });
</script>
```

###Options
**require:** `{ include: [...], exclude: [...] }` or `[...]`, configure which ones you want `browserify-bower` to help **_require_** in `browserify` for you.   
> If only `include` part is required, you can simplify it to `require: [...]`.  
> _If if no reqiure configs are specified, all components under bower components dir will be included by default._  

**external:** `{ include: [...], exclude: [...] }` or `[...]`, configure which ones you want `browserify-bower` to help **_external_** in `browserify` for you.   
> If only `include` part is required, you can simplify it to `external: [...]`.  

**alias:** `{ name: alias, ...}` or `['name:alias', ...]`, define aliases, then you can use alias instead of name/path in your codes.  
> In fact, you can define aliases in `root.alias` (global) or `root.[require|external].include` (append to name, like this `name:alias`), and later will override former if conflict.  

**mainfiles:** `{ name: mainfile, ...}`, specify which file you want to use as the main (entry) file for a package  
> It's specially useful when a package hasn't a `bower.json`.  

_p.s. with `browerify-bower`, you can also only **require** a sub module instead of a full module, by say 'base62/lib/base62'._


## Command Line
Use conf file,
```shell
$ browserify entry.js -d -p [browserify-bower --conf conf.json] > bundle.js
```
Use a node of the conf json,
```shell
$ browserify entry.js -d -p [browserify-bower --conf conf.json --confnode aa.bbb] > bundle.js
```

## workdir
By default, `browserify-bower` will try to find the working bower components dir from the dir of `process.cwd()`. But you can specify another one.

In programmatic API, pls use like `b.plugin(browserifyBower.workdir(thedir), {..})`.
In command line, pls use parameter `--workdir thedir`.


> p.s. pls feel free to use it side by other plugins/transforms, since it's a standard [`browserify`](https://github.com/substack/node-browserify) plugin, no hack, no change to your codes.


# run test
_You need ensure related node modules (for `browserify-bower`) and bower components (for test codes) installed, then run `npm test`._

For first time, you can do it like this:
```sh
browserify-bower $ npm install
...
browserify-bower $ cd test
browserify-bower/test $ bower install
...
browserify-bower/test $ cd ..
browserify-bower $ npm test

	> browserify-bower@0.5.0 test ~/repos/browserify-bower
	> mocha


	  ....

	  4 passing (580ms)

browserify-bower $
```
# diffenence with `debowerify`
`browserify-bower` and `debowerify` try to resolve same problem, but by different ways.  
_(p.s. in fact, browserify-bower's test codes were copied and modified from `debowerify`, thanks so much ^^)_

**debowerify's way:** analyze every js files of the application, to find/replace require string for bower components with their real paths  
**browserify-bower's way:** pre resolve specified bower components and require them to browserify, then when required, they're already there

#### Comparison of `browserify-bower` and `debowerify`:  
|                             |   browserify-bower            |  debowerify                                    |
| --------------------------- | ----------------------------- | ---------------------------------------------- |
| require submodules <br> _(in application codes)_ | support <br> _(built-in)_ | support <br> _(built-in)_ |
| require ... in html/template files | OK               | not OK <br> _(since it doesn't anaylze html/template files)_ |
| individual require/external <br> _(in build scripts)_ | easy <br> _(with options)_ | not so easy <br> _(through `bower-resolve`)_ |
| extension type              | plugin                        | transform                                                           |
| work mode                   | synchronous                   | asynchronous <br> _(since it depends on bower's resolving results)_ |
| performance                 | slight and quickly <br> _(~ 2s to build a project of mine)_ | slowly <br> _(13 ~ 14s to build the same project)_ <br> _(since it analyzes every js files of the application)_ |


# history
v0.6.0 (9-Aug-2015):  
1) add mainfiles option, which allows specification of the main file for packages without a bower.json  
2) enhancement: alias configs under options or 'require'/'external', can be also `{ name: alias, ... }`, except `['name:alias', ...]`  

v0.5.0 (24-July-2015):  
1) allow alias to be configured from an sibling node of 'require'/'external', too  
2) enhancement: if an item existed in both 'require' and 'external' lists, let's remove it from 'require' list  

v0.4.0 (20-Dec-2014):  
1) add command line support  

v0.3.0 (14-Aug-2014):  
1) built-in support for submodules  
2) enhancement: if bower.main undefined, check 'index.js' then 'compname'.js

v0.2.0 (25-July-2014):  
1) added tests  
2) document improvement  
3) logic change: include all components declared in `dependencies` and `devDependencies` of bower.json, not only `dependencies`, if options..include undefined  
4) enhancement: allow to specify workdir, where to determine bower components' home dir; default `process.cwd()`

v0.1.0 (22-July-2014):  
1) first release (works fine in my personal project)

# license

MIT
