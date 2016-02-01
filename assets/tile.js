Game.Tile = function(properties) {
	properties = properties || {};
	
	// Call the glyph constructor with our properties
	Game.Glyph.call(this, properties);

	// Set up the properties
	this._isWalkable = properties['isWalkable'] || false;
	this._isDiggable = properties['isDiggable'] || false;
};
// Make tiles inherit all the functionality from glyphs
Game.Tile.extend(Game.Glyph);

// Getters
Game.Tile.prototype.isWalkable = function() {
	return this._isWalkable;
}
Game.Tile.prototype.isDiggable = function() {
	return this._isDiggable;
}

// Our tiles
Game.Tile.nullTile = new Game.Tile({});
Game.Tile.floorTile = new Game.Tile({
	character: '.',
	isWalkable: true
});
Game.Tile.wallTile = new Game.Tile({
	character: '#',
	foreground: 'goldenrod',
	isDiggable: true
});
