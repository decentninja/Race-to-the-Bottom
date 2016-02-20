var SLICES_PER_SCREEN = 5;
var SPRING = 0.98;		// Speed kept per frame
var SLIPSTICK = 1;	// Minimum speed
var FINGER_FRICTION = 1;
var MAX_MUSIC_SPEED = 3;
var COLORS = [
	"#81a8c8",
	"#afca61",
	"#db583d",
	"#5bab51",
	"#fcce70",
];


var ctx = document.querySelector(".maincanvas").getContext("2d");
var maintrack = document.querySelector(".maintrack");

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
	if(appstate.position < 0) {
		appstate.position = 0;
		appstate.speed = 0;
		return
	}
	appstate.speed *= SPRING;
	if(Math.abs(appstate.speed) < SLIPSTICK) {
		appstate.speed = 0;
	}
}

function render_slices() {
	for(var i = 0; i < SLICES_PER_SCREEN + 1; i++) {
		var slice_number = Math.floor(appstate.position + i);
		var slice_position = slice_number - appstate.position;
		ctx.fillStyle = COLORS[slice_number % COLORS.length];
		ctx.fillRect(0, slice_position * dim.slice_height, dim.width, dim.slice_height);
	}
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

function update_audio() {
	maintrack.volume = Math.min(1, Math.max(0, appstate.speed/100));
	maintrack.playbackRate = Math.min(MAX_MUSIC_SPEED, Math.max(1, appstate.speed/50));
}

var lastframetime = Date.now();
function update() {
	var now = Date.now();
	var deltatime = (now - lastframetime) / 1000; // Time since last frame in seconds
	lastframetime = now;
	update_positions(deltatime);
	render_slices(deltatime);
	update_audio();
	window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);
