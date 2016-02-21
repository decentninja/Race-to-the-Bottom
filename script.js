var SLICES_PER_SCREEN = 5;
var SPRING = 0.98;		// Speed kept per frame when in sweetspot
var SLIPSTICK = 1;	// Minimum speed
var FINGER_FRICTION = 1;
var MAX_MUSIC_SPEED = 3;
var TEXT_FONT = "arial";
var TEXT_SIZE = 14;				// Corrected for DPI ie same as browser "pixels"
var TEXT_COLOR = "white";
var SWEETSPOT_ANGLE_CENTRUM = 0;
var SWEETSPOT_POSSIBLE_MAX_ANGLE = 90; // With ANGLE_CENTRUM in the middle
var SWEETSPOT_WIGGLEROOM = 5;
var SWEETSPOT_TIME = 5;	// seconds in sweetspot before change
var COLORS = [
	"#81a8c8",
	"#afca61",
	"#db583d",
	"#5bab51",
	"#fcce70",
];

var debug = window.location.href.indexOf("debug") != -1;

var ctx = document.querySelector(".maincanvas").getContext("2d");
var maintrack = document.querySelector(".maintrack");


var appstate = {
	position: 0,	// In slices
	speed: 0,		// In slices per second
	in_sweetspot: false,
	sweetspot_angle: 0,
	sweetspot_time: 0,
	orientation: 0
};

var dim = {
	width: 0,
	height: 0,
	slice_height: 0,
	dpi: 1
};

function update_dim() {
	dim.dpi = window.devicePixelRatio || 1;
	dim.width = ctx.canvas.width = window.innerWidth * dim.dpi;
	dim.height = ctx.canvas.height = window.innerHeight * dim.dpi;
	ctx.scale(dim.dpi, dim.dpi);
	ctx.canvas.style.width = window.innerWidth + "px";
	dim.width *= 1/dim.dpi;
	dim.height *= 1/dim.dpi;
	dim.slice_height = dim.height / SLICES_PER_SCREEN;
}
update_dim();
window.addEventListener("resize", update_dim);

function pick_sweetspot() {
	appstate.sweetspot_angle = SWEETSPOT_ANGLE_CENTRUM + Math.random() * SWEETSPOT_POSSIBLE_MAX_ANGLE;
}
pick_sweetspot();

function update_sweetspot(deltatime) {
	if(appstate.in_sweetspot) {
		appstate.sweetspot_time += deltatime;
	}
	if(appstate.sweetspot_time > SWEETSPOT_TIME) {
		appstate.sweetspot_time = 0;
		appstate.in_sweetspot = false;
		pick_sweetspot();
	}
}

function update_positions(deltatime) {
	appstate.position += appstate.speed * deltatime;
	if(appstate.position < 0) {
		appstate.position = 0;
		appstate.speed = 0;
		return
	}
	if(!appstate.in_sweetspot)
		appstate.speed *= SPRING;
	if(Math.abs(appstate.speed) < SLIPSTICK) {
		appstate.speed = 0;
	}
}

function update_audio() {
	maintrack.volume = Math.min(1, Math.max(0, Math.abs(appstate.speed)/100));
	maintrack.playbackRate = Math.min(MAX_MUSIC_SPEED, Math.max(1, Math.abs(appstate.speed)/50));
}

var start_touch, original_speed, touch_time;
window.addEventListener("touchstart", function(e) {
	start_touch = e.changedTouches[0].clientY;
	touch_time = new Date();
	original_speed = appstate.speed;
	maintrack.play();
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

function render_slices() {
	for(var i = 0; i < SLICES_PER_SCREEN + 1; i++) {
		var slice_number = Math.floor(appstate.position + i);
		var slice_position = slice_number - appstate.position;
		ctx.fillStyle = COLORS[slice_number % COLORS.length];
		ctx.fillRect(0, slice_position * dim.slice_height, dim.width, dim.slice_height);
	}
}

function render_blinking_sweetspot(deltatime) {
	if(appstate.in_sweetspot && lastframetime % 3 == 0) {
		ctx.fillStyle = COLORS[lastframetime % COLORS.length];
		ctx.globalAlpha = 0.5;
		ctx.fillRect(0, 0, dim.width, dim.height);
		ctx.globalAlpha = 1;
	}
}

function render_speedometer() {
	ctx.font = TEXT_SIZE + "px " + TEXT_FONT;
	ctx.fillStyle = TEXT_COLOR;
	ctx.fillText(Math.round(appstate.speed) + " slices/second @ " + Math.floor(appstate.position) + " slices", 10, 20, dim.width);
}

if(window.DeviceOrientationEvent) {
	window.addEventListener("deviceorientation", function(e) {
		var b = appstate.orientation = e.beta;
		appstate.in_sweetspot = appstate.sweetspot - SWEETSPOT_WIGGLEROOM <= b && b <= appstate.sweetspot + SWEETSPOT_WIGGLEROOM;
	});
}


function render_debug() {
	ctx.font = 12 + "px " + TEXT_FONT;
	ctx.fillStyle = TEXT_COLOR;
	JSON.stringify(appstate).split(',').forEach(function(line, i) {
		ctx.fillText(line, 50, 50 + 14 * i, dim.width);
	})
}

var lastframetime = Date.now();
function update() {
	var now = Date.now();
	var deltatime = (now - lastframetime) / 1000; // Time since last frame in seconds
	lastframetime = now;
	update_sweetspot(deltatime);
	update_positions(deltatime);
	render_slices(deltatime);
	render_speedometer(deltatime);
	render_blinking_sweetspot();
	update_audio();
	if(debug) {
		render_debug();
	}
	window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);
