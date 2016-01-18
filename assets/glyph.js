// Glyphs are the symbols that represent things in our roguelike

Game.Glyph = function(chr, fg, bg) {
	// Instantiate properties to default if they weren't passed
	this._char = chr || ' ';
	this._foreground = fg || 'white';
	this._background = bg || 'black';
};

// Create standard getters for glyphs
Game.Glyph.prototype.getChar = function() {
	return this._char;
};

Game.Glyph.prototype.getBackground = function() {
	return this._background;
};

Game.Glyph.prototype.getForeground = function() {
	return this._foreground;
};
