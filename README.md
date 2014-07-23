brbower
=======

Let brbower plugin require bower components for you in build scripts, then in application codes you can treat them as other node modules.
It also provided external options, to let you external specified bower components when you're building multiple bundles.


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

**action config:** _string array or map object_, example value: `[name1, name2, ...]` | `{ include: [name1, name2, ...], exclude: [name5, name7, ...], alias: [name8, name9, ...] }`

> Notes:  
> In action config, [name1, name2, ...] will be treated as { require: [name1, name2, ...] };  
> name format: name[:alias]

### Additional Rules:
- if options undefined, { require: [all bower dependency names]  } will be used
- if options..include undefined, [all bower dependency names] will be used
- if both include/exclude and alias declared an alias for a component, declaration in alias will be used

# license

MIT
