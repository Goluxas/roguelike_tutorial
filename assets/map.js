Game.Map = function(tiles, player) {
	this._tiles = tiles;

	// cache the width and height based on the length of the dimensions of the tiles array
	this._width = tiles.length;
	this._height = tiles[0].length;

	// list of entities on map
	this._entities = [];

	// engine and scheduler
	this._scheduler = new ROT.Scheduler.Simple();
	this._engine = new ROT.Engine(this._scheduler);

	// add the player
	this.addEntityAtRandomPosition(player);
	for (var i = 0; i < 50; i++) {
		this.addEntityAtRandomPosition(new Game.Entity(Game.FungusTemplate));
	}
};

// Standard getters
Game.Map.prototype.getWidth = function() {
	return this._width;
};
Game.Map.prototype.getHeight = function() {
	return this._height;
};
Game.Map.prototype.getEntities = function() {
	return this._entities;
};
Game.Map.prototype.getEngine = function() {
	return this._engine;
};

Game.Map.prototype.dig = function(x, y) {
	// If the tile is diggable, update it to a floor
	if (this.getTile(x,y).isDiggable()) {
		this._tiles[x][y] = Game.Tile.floorTile;
	}
}

Game.Map.prototype.getRandomFloorPosition = function() {
	// Randomly find a tile which is a floor
	var x, y;
	do {
		x = Math.floor( Math.random() * this._width);
		y = Math.floor( Math.random() * this._height);
	} while ( !this.isEmptyFloor(x, y) );
	return {x: x, y: y};
}

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

Game.Map.prototype.getEntityAt = function(x, y) {
	// Iterate through all entities searching for one
	// with matching position
	for (var i=0; i < this._entities.length; i++) {
		if (this._entities[i].getX() == x && this._entities[i].getY() == y) {
			return this._entities[i];
		}
	}
	// No match
	return false;
}

Game.Map.prototype.addEntity = function(entity) {
	// Make sure the entity's position is within bounds
	if (entity.getX() < 0 || entity.getX() > this._width ||
		entity.getY() < 0 || entity.getY() > this._height) {
		throw new Error('Adding entity out of bounds.');
	}
	// Update the entity's map
	entity.setMap(this);
	// Add the entity to the list of entities
	this._entities.push(entity);
	// Check if entity is an actor, and if so add it to scheduler
	if (entity.hasMixin('Actor')) {
		this._scheduler.add(entity, true);
	}
}

Game.Map.prototype.addEntityAtRandomPosition = function(entity) {
	var position = this.getRandomFloorPosition();
	entity.setX(position.x);
	entity.setY(position.y);
	this.addEntity(entity);
}

Game.Map.prototype.removeEntity = function(entity) {
	// Find the entity in the list if present
	for (var i=0; i < this._entities.length; i++) {
		if (this._entities[i] == entity) {
			this._entities.splice(i, 1);
			break;
		}
	}

	// If the entity is an actor, remove them from the scheduler
	if (entity.hasMixin('Actor')) {
		this._scheduler.remove(entity);
	}
}

Game.Map.prototype.isEmptyFloor = function(x, y) {
	// Check if the tile is a floor and has no entity
	return this.getTile(x, y) == Game.Tile.floorTile && !this.getEntityAt(x, y);
}

Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, radius) {
	results = [];

	//Determine bounds
	var leftX = centerX - radius;
	var rightX = centerX + radius;
	var topY = centerY - radius;
	var bottomY = centerY + radius;

	// Iterate through our entities, adding any that are within bounds
	for (var i=0; i < this._entities.length; i++) {
		if (this._entities[i].getX() >= leftX && this._entities[i].getX() <= rightX &&
			this._entities[i].getY() >= topY  && this._entities[i].getY() <= bottomY) {
			results.push(this._entities[i]);
		}
	}
	return results;
}
