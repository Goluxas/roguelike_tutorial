Game.Entity = function(properties) {
	properties = properties || {};

	Game.Glyph.call(this, properties);

	this._name = properties['name'] || '';
	this._x = properties['x'] || 0;
	this._y = properties['y'] || 0;
	this._map = null;

	// Object to track the added mixins
	this._attachedMixins = {}
	// Similar object for groups
	this._attachedMixinGroups = {}

	// Set up the object's mixins
	var mixins = properties['mixins'] || [];
	for (var i=0; i < mixins.length; i++) {
		// Copy over all properties from each mixin as long
		// as its not the name or the init property.
		// We also make sure not to override a property that 
		// already exists on the entity
		for (var key in mixins[i]) {
			if (key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
				this[key] = mixins[i][key];
			}
		}
		// Add the mixin name to our attachedMixins array
		this._attachedMixins[mixins[i].name] = true;
		// If a group name is present, add it
		if (mixins[i].groupName) {
			this._attachedMixinGroups[mixins[i].groupName] = true;
		}

		// And call the mixin's init if there is one
		if (mixins[i].init) {
			mixins[i].init.call(this, properties);
		}
	}
}
Game.Entity.extend(Game.Glyph);

// Setter/Getters
Game.Entity.prototype.setName = function(name) {
	this._name = name;
}
Game.Entity.prototype.setX = function(x) {
	this._x = x;
}
Game.Entity.prototype.setY = function(y) {
	this._y = y;
}
Game.Entity.prototype.setMap = function(map) {
	this._map = map;
}

Game.Entity.prototype.getName = function() {
	return this._name;
}
Game.Entity.prototype.getX = function() {
	return this._x;
}
Game.Entity.prototype.getY = function() {
	return this._y;
}
Game.Entity.prototype.getMap = function() {
	return this._map;
}

Game.Entity.prototype.hasMixin = function(obj) {
	// Allow passing the mixin itself or the name as a string
	if (typeof obj == 'object') {
		return this._attachedMixins[obj.name];
	} else {
		return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
	}
}
