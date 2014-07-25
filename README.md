brbower
=======

[![NPM](https://nodei.co/npm/brbower.png)](https://nodei.co/npm/brbower/)

Let `brbower` plugin require bower components for you when building bundles, then you can treat them as normal node modules in application codes.  
You can also provide external config, to guide `brbower` to external some bower components, which is useful when when building multiple bundles.


# install

With [npm](https://npmjs.org) do:

```
npm install brbower
```

# usage
In your task runner like `gulp`, add this plugin to `browserify`:
```javascript
b.plugin('brbower', {
	require: ['comp1', 'comp2:alias2'],
	external: {
		exclude: ['comp1', 'comp2']
	}
});
```
_p.s. of course, you can also configure it in node `package.json`._

And in application codes, you can just require it as below, not care about whether it's really an node module or a bower component:
```javascript
var comp1 = require('comp1');
var comp2 = require('alias2');
...
```

# options
![brbower config](https://raw.githubusercontent.com/tminglei/brbower/master/doc/brbower-config.png)

**action:** _string_, available values: `require` | `external`, default `require`  
_(guide `brbower` to **require**/**external** specified bower components for final bundle)_  

**action config:** _string array or map object_, example value:  
`[name1, name2, ...]` | `{ include: [name1, name2, ...], exclude: [name5, ...], alias: [name8, ...] }`

> _Notes:_  
> In action config, `[name1, name2, ...]` will be treated as `{ require: [name1, name2, ...] }`  
> name format: `name[:alias]`

### _Additional Rules:_
- if options undefined, `{ require: [all bower dependency names] }` will be used
- if options..include undefined, `[all bower dependency names]` will be used
- if both include/exclude and alias declared an alias for a component, declaration in alias will be used

# history
v0.1.0 (22-July-2014):  
1) first release (works fine in my personal project)

# license

MIT
