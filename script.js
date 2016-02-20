var SLICES_PER_SCREEN = 10;
var SPRING = 0.98;		// Speed kept per frame
var SLIPSTICK = 1;	// Minimum speed
var FINGER_FRICTION = 1;


var ctx = document.querySelector(".maincanvas").getContext("2d");

var dpi = window.devicePixelRatio;
if(dpi) ctx.scale(dpi, dpi);

var appstate = {
	position: 0,	// In slices
	speed: 0		// In slices per second
};

var dim = {
	width: 0,
	height: 0,
	slice_height: 0
};

function update_dim() {
	dim.width = ctx.canvas.width = window.innerWidth;
	dim.height = ctx.canvas.height = window.innerHeight;
	dim.slice_height = dim.height / SLICES_PER_SCREEN;
}

update_dim();

window.addEventListener("resize", update_dim);

function update_positions(deltatime) {
	appstate.position += appstate.speed * deltatime;
	appstate.speed *= SPRING;
	if(Math.abs(appstate.speed) < SLIPSTICK) {
		appstate.speed = 0;
	}
}

function render_slices() {
	for(var i = 0; i < SLICES_PER_SCREEN + 1; i++) {
		var slice_number = Math.floor(appstate.position + i);
		var slice_position = slice_number - appstate.position;
		ctx.fillStyle = slice_number % 2 == 0 ? "green" : "blue";
		ctx.fillRect(0, slice_position * dim.slice_height, dim.width, dim.slice_height);
	}
}

var start_touch, original_speed, touch_time;
window.addEventListener("touchstart", function(e) {
	start_touch = e.changedTouches[0].clientY;
	touch_time = new Date();
	original_speed = appstate.speed;
});

window.addEventListener("touchmove", function(e) {
	//appstate.speed = original_speed + (start_touch - e.changedTouches[0].clientY) / dim.slice_height;
});

window.addEventListener("touchend", function(e) {
	var deltatime = ((Date.now()) - touch_time) / 1000;
	appstate.speed = (start_touch - e.changedTouches[0].clientY) / (dim.slice_height * deltatime) * FINGER_FRICTION;
});

window.addEventListener("wheel", function(e) {
	appstate.speed += e.deltaY / dim.slice_height * FINGER_FRICTION;
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
