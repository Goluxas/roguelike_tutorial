// rough interface for a screen
// enter : function()
// exit : function()
// render : function(display)
// handleInput : function(inputType, inputData)

Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
	enter: function() { console.log("Entered start screen."); },
	exit: function() { console.log("Exited start screen."); },
	render: function(display) {
		// Render our prompt to the screen
		display.drawText(1,1, "%c{yellow}Javascript Roguelike");
		display.drawText(1,2, "Press [Enter] to start!");
	},
	handleInput: function(inputType, inputData) {
		// When [Enter] is pressed, go to the play screen
		if (inputType === 'keydown') {
			if (inputData.keyCode == ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.playScreen);
			}
		}
	}
}

// Define our playing screen
Game.Screen.playScreen = {
	_map: null,
	_player: null,
	enter: function() { 
		console.log("Entered play screen"); 

		var map = [];
		var mapWidth = 100;
		var mapHeight = 48;
		for (var x=0; x < mapWidth; x++) {
			// Create the nested array for the y values
			map.push([]);
			for (var y=0; y < mapHeight; y++) {
				map[x].push(Game.Tile.nullTile);
			}
		}

		// Set up the map generator
		var generator = new ROT.Map.Cellular(mapWidth, mapHeight);
		// randomize() takes an argument which is the probability of a given cell starting as a 1 vs a 0
		generator.randomize(0.5);

		// Iteratively smoothen the map
		var totalIterations = 3;
		for (var i=0; i<totalIterations - 1; i++) {
			generator.create();
		}

		// Smoothen one last time and then update the map
		// The callback function here is called after the smoothing
		generator.create(function(x,y,v) {
			if (v === 1) {
				map[x][y] = Game.Tile.floorTile;
			} else {
				map[x][y] = Game.Tile.wallTile;
			}
		});

		// Create our player and set the position
		this._player = new Game.Entity(Game.PlayerTemplate);
		this._map = new Game.Map(map, this._player);

		// Start the map's engine
		this._map.getEngine().start();
	},
	exit: function() { console.log("Exited play screen"); },
	render: function(display) {
		// Iterate through all map tiles
		var screenWidth = Game.getScreenWidth();
		var screenHeight = Game.getScreenHeight();

		// Minimum left side check
		var topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
		// Minimum right side check
		topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
		
		// Minimum top side check
		var topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
		// Minimum bottom side check
		topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);

		for (var x=topLeftX; x < topLeftX + screenWidth; x++) {
			for (var y=topLeftY; y < topLeftY + screenHeight; y++) {
				// Fetch the glyph and draw it
				var tile = this._map.getTile(x, y);
				// Subtract topLeft value for rendering (because the screen is still at 0,0 even if the map is at 20,20)
				display.draw(x - topLeftX, 
							 y - topLeftY, 
							 tile.getChar(), 
							 tile.getForeground(), 
							 tile.getBackground());
			}
		}

		// Render the entities
		var entities = this._map.getEntities();
		for (var i=0; i < entities.length; i++) {
			var entity = entities[i];
			// only render the entity if it would show up on screen
			if (entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
				entity.getX() < topLeftX + screenWidth &&
				entity.getY() < topLeftY + screenHeight) {
				display.draw(entity.getX() - topLeftX,
							 entity.getY() - topLeftY,
							 entity.getChar(),
							 entity.getForeground(),
							 entity.getBackground());
			}
		}
	},
	handleInput: function(inputType, inputData) {
		if (inputType === 'keydown') {
			// Game-ending keys
			if (inputData.keyCode == ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.winScreen);
			} else if (inputData.keyCode === ROT.VK_ESCAPE) {
				Game.switchScreen(Game.Screen.loseScreen);
			} else {
				// Movement
				if (inputData.keyCode == ROT.VK_LEFT || inputData.keyCode == ROT.VK_A) {
					this.move(-1,0);
				} else if (inputData.keyCode == ROT.VK_RIGHT || inputData.keyCode == ROT.VK_D) {
					this.move(1,0);
				} else if (inputData.keyCode == ROT.VK_UP || inputData.keyCode == ROT.VK_W) {
					this.move(0,-1);
				} else if (inputData.keyCode == ROT.VK_DOWN || inputData.keyCode == ROT.VK_S) {
					this.move(0,1);
				}
				
				// Unlock the engine
				this._map.getEngine().unlock();
			}
		}		   
	},
	move: function(dX, dY) {
		var newX = this._player.getX() + dX;
		var newY = this._player.getY() + dY;
		// because tryMove contains our bounds-checking and movement code,
		// we can simply defer to the function and trust it to handle everything
		this._player.tryMove(newX, newY, this._map);
	}
}

// Define our winning screen
Game.Screen.winScreen = {
	enter: function() { console.log("Entered win screen"); },
	exit: function() { console.log("Exited win screen"); },
	render: function(display) {
		// Render our prompt to the screen
		for (var i=0; i<22; i++) {
			// Generate random background colors
			var r = Math.round(Math.random() * 255);
			var g = Math.round(Math.random() * 255);
			var b = Math.round(Math.random() * 255);
			var background = ROT.Color.toRGB([r, g, b]);
			display.drawText(2, i+1, "%b{" + background + "}You win!");
		}
	},
	handleInput: function(inputType, inputData) {
		// Nothing		 
	}
}

// Define our losing screen
Game.Screen.loseScreen = {
	enter: function() { console.log("Entered lose screen"); },
	exit: function() { console.log("Exited lose screen"); },
	render: function(display) {
		// Render our prompt to the screen
		for (var i=0; i<22; i++) {
			display.drawText(2, i+1, "%b{red}You lose! :(");
		}
	},
	handleInput: function(inputType, inputData) {
		// Nothing	 
	}
}
