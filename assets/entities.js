// Create our mixins namespace
Game.Mixins = {};

// Define our Moveable mixin
Game.Mixins.Moveable = {
	name: 'Moveable',
	tryMove: function(x, y, map) {
		// Nice thing about getTile(): it returns a null tile if out of bounds
		// Null Tiles are not walkable or diggable, so the move is illegal
		var tile = map.getTile(x, y);
		var target = map.getEntityAt(x, y);

		// If there's an entity, can't walk through it
		if (target) {
			return false;
		}
		// Check if we can walk and the tile and simply walk if so
		else if (tile.isWalkable()) {
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

// Main Player's actor mixin
Game.Mixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function() {
		// Re-render the screen
		Game.refresh();

		// Lock the engine and wait asynchronously
		// for the player to press a key
		this.getMap().getEngine().lock();
	}
}

Game.Mixins.FungusActor = {
	name: 'FungusActor',
	groupName: 'Actor',
	act: function() { }
}

// Player template
Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	background: 'black',
	mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor]
}

// Fungus
Game.FungusTemplate = {
	character: 'F',
	foreground: 'green',
	mixins: [Game.Mixins.FungusActor]
}
