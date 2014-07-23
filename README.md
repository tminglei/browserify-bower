brbower
=======

[![NPM](https://nodei.co/npm/brbower.png)](https://nodei.co/npm/brbower/)

Let `brbower` plugin require bower components for you in build scripts, then in application codes you can treat them as normal node modules.  
You can also provided external options, to let it external specified bower components for you when building multiple bundles.


# install

With [npm](https://npmjs.org) do:

```
npm install brbower
```

# usage
```javascript
b.plugin('brbower', {
	require: ['comp1', 'comp2:alias2'],
	external: {
		exclude: ['comp1', 'comp2']
	}
});
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

# license

MIT
