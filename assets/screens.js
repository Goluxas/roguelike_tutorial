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
	_gameEnded: false,
	enter: function() { 
		console.log("Entered play screen"); 

		var width = 100;
		var height = 48;
		var depth = 6;

		var tiles = new Game.Builder(width, height, depth).getTiles();
		this._player = new Game.Entity(Game.PlayerTemplate);
		this._map = new Game.Map(tiles, this._player);

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

		// This will keep track of all visible map cells
		var visibleCells = {};

		// Store this._map and player's z to avoid losing it in callbacks
		var map = this._map;
		var currentDepth = this._player.getZ();

		// Find all visible cells and update the object
		this._map.getFOV(this._player.getZ()).compute(
			this._player.getX(), this._player.getY(),
			this._player.getSightRadius(),
			function(x, y, radius, visibility) {
				visibleCells[x + ',' + y] = true;
				// Mark cell as explored
				map.setExplored(x, y, currentDepth, true);
			});

		// Tile Rendering
		for (var x=topLeftX; x < topLeftX + screenWidth; x++) {
			for (var y=topLeftY; y < topLeftY + screenHeight; y++) {
				if (map.isExplored(x, y, currentDepth)) {
					// Fetch the glyph and draw it
					var tile = this._map.getTile(x, y, this._player.getZ());

					// The foreground color becomes dark gray if the tile has been explored but is not visible
					var foreground = visibleCells[x + ',' + y] ? tile.getForeground() : 'darkGray';
					// Subtract topLeft value for rendering (because the screen is still at 0,0 even if the map is at 20,20)
					display.draw(x - topLeftX, 
								 y - topLeftY, 
								 tile.getChar(), 
								 foreground, 
								 tile.getBackground());
				}
			}
		}

		// Render the entities
		var entities = this._map.getEntities();
		for (var key in entities) {
			var entity = entities[key];
			// only render the entity if it would show up on screen
			if (entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
				entity.getX() < topLeftX + screenWidth &&
				entity.getY() < topLeftY + screenHeight &&
				entity.getZ() == this._player.getZ()) {
				if (visibleCells[entity.getX() + ',' + entity.getY()]) {
					display.draw(entity.getX() - topLeftX,
								 entity.getY() - topLeftY,
								 entity.getChar(),
								 entity.getForeground(),
								 entity.getBackground());
				}
			}
		}

		// Get the messages in the player's queue and render them
		var messages = this._player.getMessages();
		var messageY = 0;
		for (var i=0; i < messages.length; i++) {
			// Draw each message, adding the number of lines
			messageY += display.drawText(0, messageY, '%c{white}%b{black}' + messages[i]);
		}

		// Render player HP
		var stats = '%c{white}%b{black}';
		stats += vsprintf('HP: %d/%d', [this._player.getHP(), this._player.getMaxHP()]);
		display.drawText(0, screenHeight, stats);
	},
	handleInput: function(inputType, inputData) {
		// If the game is over, enter will bring the user to the game over screen
		if (this._gameEnded) {
			if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.loseScreen);
			}
			
			// Return to make sure the user can't still play
			return;
		}

		if (inputType === 'keydown') {
			// Game-ending keys
			if (inputData.keyCode == ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.winScreen);
			} else if (inputData.keyCode === ROT.VK_ESCAPE) {
				Game.switchScreen(Game.Screen.loseScreen);
			} else {
				// Movement
				if (inputData.keyCode == ROT.VK_LEFT || inputData.keyCode == ROT.VK_A) {
					this.move(-1,0,0);
				} else if (inputData.keyCode == ROT.VK_RIGHT || inputData.keyCode == ROT.VK_D) {
					this.move(1,0,0);
				} else if (inputData.keyCode == ROT.VK_UP || inputData.keyCode == ROT.VK_W) {
					this.move(0,-1,0);
				} else if (inputData.keyCode == ROT.VK_DOWN || inputData.keyCode == ROT.VK_S) {
					this.move(0,1,0);
				} else {
					// Not a valid key
					return;
				}
				
				// Unlock the engine
				this._map.getEngine().unlock();
			}
		} else if (inputType == 'keypress') {
			var keyChar = String.fromCharCode(inputData.charCode);
			if (keyChar == '>') {
				this.move(0, 0, 1);
			} else if (keyChar == '<') {
				this.move(0, 0, -1);
			} else {
				// Not a valid key
				return;
			}

			// Unlock the engine
			this._map.getEngine().unlock();
		}
	},
	setGameEnded: function(gameEnded) {
		this._gameEnded = gameEnded;
	},
	move: function(dX, dY, dZ) {
		var newX = this._player.getX() + dX;
		var newY = this._player.getY() + dY;
		var newZ = this._player.getZ() + dZ;
		// because tryMove contains our bounds-checking and movement code,
		// we can simply defer to the function and trust it to handle everything
		this._player.tryMove(newX, newY, newZ, this._map);
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
