// Create our mixins namespace
Game.Mixins = {};

// Define our Moveable mixin
Game.Mixins.Moveable = {
	name: 'Moveable',
	tryMove: function(x, y, map) {
		// Nice thing about getTile(): it returns a null tile if out of bounds
		// Null Tiles are not walkable or diggable, so the move is illegal
		var tile = map.getTile(x, y);
		// Check if we can walk and the tile and simply walk if so
		if (tile.isWalkable()) {
			this._x = x;
			this._y = y;
			return true;
		}
		// Check if the tile is diggable and if so dig it
		else if (tile.isDiggable()) {
			map.dig(x,y);
			return true;
		}
		// Otherwise it's an illegal move
		return false;
	}
}

// Player template
Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	background: 'black',
	mixins: [Game.Mixins.Moveable]
}
