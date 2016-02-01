// Create our mixins namespace
Game.Mixins = {};

// MIXINS
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
			// If we are an attacker, try to attack
			if (this.hasMixin('Attacker')) {
				this.attack(target);
				return true;
			} else {
				return false;
			}
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
	init: function() {
		this._growthsRemaining = 5;
	},
	act: function() { 
		if (this._growthsRemaining > 0) {
			if (Math.random() <= 0.02) {
				// Generate cordinates of a random adjacent square
				var xOffset = Math.floor(Math.random() * 3) - 1;
				var yOffset = Math.floor(Math.random() * 3) - 1;
				
				// Make sure we aren't trying to spawn on the same tile as us
				if (xOffset != 0 || yOffset != 0) {
					// Check if we can spawn at that location
					if (this.getMap().isEmptyFloor(this.getX() + xOffset,
												   this.getY() + yOffset)) {
						var entity = new Game.Entity(Game.FungusTemplate);
						entity.setX(this.getX() + xOffset);
						entity.setY(this.getY() + yOffset);	
						this.getMap().addEntity(entity);
						this._growthsRemaining--;
					}
				}
			}
		}
	}
}

Game.Mixins.Destructible = {
	name: 'Destructible',
	init: function() {
		this._hp = 1;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		// If have 0 or less hp, then remove
		if (this._hp <= 0) {
			this.getMap().removeEntity(this);
		}
	}
}

Game.Mixins.SimpleAttacker = {
	name: 'SimpleAttacker',
	groupName: 'Attacker',
	attack: function(target) {
		if (target.hasMixin('Destructible')) {
			target.takeDamage(this, 1);
		}
	}
}
	

// TEMPLATES
// Player template
Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	background: 'black',
	mixins: [Game.Mixins.Moveable, 
			 Game.Mixins.PlayerActor,
			 Game.Mixins.Destructible,
			 Game.Mixins.SimpleAttacker]
}

// Fungus
Game.FungusTemplate = {
	character: 'F',
	foreground: 'green',
	mixins: [Game.Mixins.FungusActor,
			 Game.Mixins.Destructible]
}
