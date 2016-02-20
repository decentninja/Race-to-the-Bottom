var SLICES_PER_SCREEN = 10;
var FRICTION = 0.9;		// Speed kept per second
var MAXIMUM_ADDED_SPEED_PER_SCROLL = 0.2;		// In screens per second

var ctx = document.querySelector(".maincanvas").getContext("2d");

var dpi = window.devicePixelRatio;
if(dpi) ctx.scale(dpi, dpi);

var appstate = {
	position: 0,	// In screen
	speed: 0		// In screens per second
};

function update_dimentions() {
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
}

update_dimentions();

window.addEventListener("resize", update_dimentions);

function update_positions(deltatime) {
	appstate.position += appstate.speed * deltatime;
	appstate.speed *= 1 - (1 - FRICTION) * deltatime;
}

function render_slices() {
	for(var i = 0; i < SLICES_PER_SCREEN + 1; i++) {
		var slice_number = Math.floor(appstate.position + i);
		var slice_position = slice_number - appstate.position;
		ctx.fillStyle = slice_number % 2 == 0 ? "green" : "blue";
		ctx.fillRect(0, slice_position * ctx.canvas.height / SLICES_PER_SCREEN, ctx.canvas.width, ctx.canvas.height / SLICES_PER_SCREEN);
	}
}

window.addEventListener("mousewheel", function(e) {
	appstate.speed += MAXIMUM_ADDED_SPEED_PER_SCROLL;
});

var lastframetime = Date.now();
function update() {
	var now = Date.now();
	var deltatime = (now - lastframetime) / 1000; // Time since last frame in seconds
	lastframetime = now;
	update_positions(deltatime);
	render_slices(deltatime);
	window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);
