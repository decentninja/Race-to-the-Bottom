var SLICES_PER_SCREEN = 5;
var SPRING = 0.98;
var SLIPSTICK = 1;	// Minimum speed
var FINGER_GRIP = 1;
var MAX_MUSIC_SPEED = 2; 
var MUSIC_EXTRA_FACTOR = 2;
var TEXT_FONT = "arial";
var TEXT_SIZE = 14;				// Corrected for DPI ie same as browser "pixels"
var TEXT_COLOR = "white";
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
	speed: 0		// In slices per second
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

function update_positions(deltatime) {
	appstate.position += appstate.speed * deltatime;
	appstate.speed *= SPRING;
	if(Math.abs(appstate.speed) < SLIPSTICK) {
		appstate.speed = 0;
	}
}

function update_audio() {
	maintrack.volume = Math.min(1, Math.max(0, Math.abs(appstate.speed)/100));
	maintrack.playbackRate = MUSIC_EXTRA_FACTOR * Math.min(MAX_MUSIC_SPEED, Math.max(1, Math.abs(appstate.speed)/50));
}

window.addEventListener("touchstart", function(e) {
	maintrack.play();	// Some platfrom may only play sound after first touch
	appstate.speed = 0;
});

var start_touch, touch_time;
window.addEventListener("touchmove", function(e) {
	if(touch_time && start_touch) {
		var deltatime = ((Date.now()) - touch_time) / 1000;
		appstate.speed = (start_touch - e.changedTouches[0].clientY) / (dim.slice_height * deltatime) * FINGER_GRIP;
	}
	start_touch = e.changedTouches[0].clientY;
	touch_time = new Date();
});

window.addEventListener("wheel", function(e) {
	appstate.speed += e.deltaY / dim.slice_height * FINGER_GRIP;
});

function render_slices() {
	for(var i = 0; i < SLICES_PER_SCREEN + 1; i++) {
		var slice_number = Math.floor(appstate.position + i);
		var slice_position = slice_number - appstate.position;
		var slide_randomized = Math.floor(Math.sin(slice_number) * 1000);
		ctx.fillStyle = COLORS[Math.abs(slide_randomized % COLORS.length)];
		ctx.fillRect(0, slice_position * dim.slice_height, dim.width, dim.slice_height);
	}
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
	update_positions(deltatime);
	render_slices(deltatime);
	update_audio();
	if(debug) {
		render_debug();
	}
	window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);

window.addEventListener("click", function(e) {
	e.preventDefault();
	var elem = document.documentElement;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.msRequestFullscreen) {
		elem.msRequestFullscreen();
	} else if (elem.mozRequestFullScreen) {
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
		elem.webkitRequestFullscreen();
	}
});
