window.onload = function() {
	// Check if rot.js can work on this browser
	if (!ROT.isSupported()) {
		alert("The rot.js library isn't supported by your browser.");
	} else {
		// Good to go!

		// Create 80x20 char display
		var display = new ROT.Display({width:80, height:20});
		var container = display.getContainer();

		// Add container to HTML
		document.body.appendChild(container);

		var foreground, background, colors;
		for (var i=0; i<20; i++) {
			// Calculate the foreground color, getting darker
			// and background color, getting lighter
			foreground = ROT.Color.toRGB([255 - (i*13), 	255 - (i*13), 	255 - (i*13)]);
			background = ROT.Color.toRGB([i*13, 			i*13, 			i*13]);

			// Create the color format specifier
			colors = "%c{" + foreground + "}%b{" + background + "}";

			// Draw the text at col 2 and row i
			display.drawText(2, i, colors + "The world is gray!");
		}
	}
}
