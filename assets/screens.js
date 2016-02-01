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
	_centerX: 0,
	_centerY: 0,
	enter: function() { 
		console.log("Entered play screen"); 

		var map = [];
		var mapWidth = 500;
		var mapHeight = 500;
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

		this._map = new Game.Map(map)
	},
	exit: function() { console.log("Exited play screen"); },
	move: function(dX, dY) {
		// Get the minimum between map width/height and the movement position (prevents out-of-bounds max)
		// Then get the maximum between 0 and the movement position (prevents out-of-bounds min)
		this._centerX = Math.max(0, Math.min(this._map.getWidth() - 1, this._centerX + dX));
		this._centerY = Math.max(0, Math.min(this._map.getHeight() - 1, this._centerY + dY));
	},
	render: function(display) {
		// Iterate through all map tiles
		var screenWidth = Game.getScreenWidth();
		var screenHeight = Game.getScreenHeight();

		// Minimum left side check
		var topLeftX = Math.max(0, this._centerX - (screenWidth / 2));
		// Minimum right side check
		topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
		
		// Minimum top side check
		var topLeftY = Math.max(0, this._centerY - (screenHeight / 2));
		// Minimum bottom side check
		topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);

		for (var x=topLeftX; x < topLeftX + screenWidth; x++) {
			for (var y=topLeftY; y < topLeftY + screenHeight; y++) {
				// Fetch the glyph and draw it
				var glyph = this._map.getTile(x, y).getGlyph();
				// Subtract topLeft value for rendering (because the screen is still at 0,0 even if the map is at 20,20)
				display.draw(x - topLeftX, 
							 y - topLeftY, 
							 glyph.getChar(), 
							 glyph.getForeground(), 
							 glyph.getBackground());
			}
		}

		// Finally, render cursor
		display.draw(this._centerX - topLeftX,
					 this._centerY - topLeftY,
					 '@',
					 'white',
					 'black');
	},
	handleInput: function(inputType, inputData) {
		if (inputType === 'keydown') {
			// Game-ending keys
			if (inputData.keyCode == ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.winScreen);
			} else if (inputData.keyCode === ROT.VK_ESCAPE) {
				Game.switchScreen(Game.Screen.loseScreen);
			}

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
		}		   
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
