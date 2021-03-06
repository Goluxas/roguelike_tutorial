// Create our mixins namespace
Game.Mixins = {};

// MIXINS

// Main Player's actor mixin
Game.Mixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function() {
		// Detect if the game is over
		if (this.getHP() < 1) {
			Game.Screen.playScreen.setGameEnded(true);
			// Send a last message to the player
			Game.sendMessage(this, 'You have died... Press [Enter] to continue!');
		}

		// Re-render the screen
		Game.refresh();

		// Lock the engine and wait asynchronously
		// for the player to press a key
		this.getMap().getEngine().lock();

		// Clear the message queue
		this.clearMessages();
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
												   this.getY() + yOffset,
												   this.getZ())) {
						var entity = new Game.Entity(Game.FungusTemplate);
						entity.setPosition(this.getX() + xOffset,
										   this.getY() + yOffset,
										   this.getZ());
						this.getMap().addEntity(entity);
						this._growthsRemaining--;

						// Send a message nearby
						Game.sendMessageNearby(this.getMap(), 
											   entity.getX(), 
											   entity.getY(), 
											   entity.getZ(),
											   'The fungus is spreading!');
					}
				}
			}
		}
	}
}

Game.Mixins.Destructible = {
	name: 'Destructible',
	init: function(template) {
		this._maxHP = template['maxHP'] || 10;
		this._hp = template['hp'] || this._maxHP;
		this._defenseValue = template['defenseValue'] || 0;
	},
	getHP: function() {
		return this._hp;
	},
	getMaxHP: function() {
		return this._maxHP;
	},
	getDefenseValue: function() {
		return this._defenseValue;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		// If have 0 or less hp, then remove
		if (this._hp <= 0) {
			Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);

			// Check if the player died
			// If so, call their act method to prompt the user
			if (this.hasMixin(Game.Mixins.PlayerActor)) {
				this.act();
			} else {
				this.getMap().removeEntity(this);
			}
		}
	}
}

Game.Mixins.Attacker = {
	name: 'Attacker',
	groupName: 'Attacker',
	init: function(template) {
		this._attackValue = template['attackValue'] || 1;
	},
	getAttackValue: function() {
		return this._attackValue;
	},
	attack: function(target) {
		if (target.hasMixin('Destructible')) {
			var attack = this.getAttackValue();
			var defense = target.getDefenseValue();
			var max = Math.max(0, attack - defense);
			var damage = 1 + Math.floor(Math.random() * max)
			
			Game.sendMessage(this, 'You strike the %s for %d damage!', [target.getName(), damage]);
			Game.sendMessage(target, 'The %s strikes you for %d damage!', [this.getName(), damage]);

			target.takeDamage(this, damage);
		}
	}
}

Game.Mixins.MessageRecipient = {
	name: 'MessageRecipient',
	init: function(template) {
		this._messages = [];
	},
	receiveMessage: function(message) {
		this._messages.push(message);
	},
	getMessages: function() {
		return this._messages;
	},
	clearMessages: function() {
		this._messages = [];
	}
}

Game.Mixins.Sight = {
	name: 'Sight',
	groupName: 'Sight',
	init: function(template) {
		this._sightRadius = template['sightRadius'] || 5;
	},
	getSightRadius: function() {
		return this._sightRadius;
	}
}

Game.Mixins.WanderActor = {
	name: 'WanderActor',
	groupName: 'Actor',
	act: function() {
		// Flip coin to determine if moving by 1 in the positive or negative direction
		var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;

		// Flip coin to determine if moving in x or y direction
		if (Math.round(Math.random()) === 1) {
			this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
		} else {
			this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
		}
	}
}


// Message sending function
Game.sendMessage = function(recipient, message, args) {
	// Make sure the recipient can receive the message
	// before doing any work
	if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
		// If args were passed, then we format the message
		if (args) {
			message = vsprintf(message, args);
		}
		recipient.receiveMessage(message);
	}
}

Game.sendMessageNearby = function(map, centerX, centerY, centerZ, message, args) {
	// Radius is fixed at 5 (for now)
	if (args) {
		message = vsprintf(message, args);
	}

	// Get nearby entities
	entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);

	// Iterate through nearby entities and send the message
	for (var i=0; i < entities.length; i++) {
		if (entities[i].hasMixin(Game.Mixins.MessageRecipient)) {
			entities[i].receiveMessage(message);
		}
	}
}
	

// TEMPLATES
// Player template
Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	background: 'black',
	maxHP: 40,
	attackValue: 10,
	sightRadius: 6,
	mixins: [Game.Mixins.PlayerActor,
			 Game.Mixins.Destructible,
			 Game.Mixins.Attacker,
			 Game.Mixins.MessageRecipient,
			 Game.Mixins.Sight]
}

// Fungus
Game.FungusTemplate = {
	name: 'fungus',
	character: 'F',
	foreground: 'green',
	maxHP: 10,
	mixins: [Game.Mixins.FungusActor,
			 Game.Mixins.Destructible]
}

// Bat
Game.BatTemplate = {
	name: 'bat',
	character: 'B',
	foreground: 'white',
	maxHP: 5,
	attackValue: 4,
	mixins: [Game.Mixins.WanderActor,
			 Game.Mixins.Attacker,
			 Game.Mixins.Destructible]
}

// Newt
Game.NewtTemplate = {
	name: 'newt',
	character: ':',
	foreground: 'yellow',
	maxHP: 3,
	attackValue: 2,
	mixins: [Game.Mixins.WanderActor,
			 Game.Mixins.Attacker,
			 Game.Mixins.Destructible]
}
