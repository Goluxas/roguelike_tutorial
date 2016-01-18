Game.Map = function(tiles) {
	this._tiles = tiles;

	// cache the width and height based on the length of the dimensions of the tiles array
	this._width = tiles.length;
	this._height = tiles[0].length;
};

// Standard getters
Game.Map.prototype.getWidth = function() {
	return this._width;
};

Game.Map.prototype.getHeight = function() {
	return this._height;
};

// Get tile at coordinate
Game.Map.prototype.getTile = function(x, y) {
	// Make sure we're in bounds
	if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
		// If not, return nullTile
		return Game.Tile.nullTile;
	} else {
		return this._tiles[x][y] || Game.Tile.nullTile;
	}
};
