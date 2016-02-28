var SLICES_PER_SCREEN = 5;
var SPRING = 0.98;
var SLIPSTICK = 1;	// Minimum speed
var FINGER_GRIP = 1;
var MAX_MUSIC_SPEED = 2; 
var MUSIC_EXTRA_FACTOR = 2;
var LOOSING_COLOR = "#db583d";
var MENU_COLOR = LOOSING_COLOR;
var MENU_TEXT_COLOR = "white";
var MENU_TEXT_SIZE = 20;
var MENU_TEXT_FONT = "arial";
var STANDSTILL_WARNING_TIME = 2;
var STANDSTILL_GAMEOVER = 6;
var COLORS = [
	"#81a8c8",
	"#afca61",
	"#db583d", // red
	"#5bab51",
	"#fcce70",
];

var debug = window.location.href.indexOf("debug") != -1;

var ctx = document.querySelector(".maincanvas").getContext("2d");
var maintrack = document.querySelector(".maintrack");


var appstate = {};
function setinitialstate() {
	appstate = {
		position: 0,	// In slices
		speed: 0,		// In slices per second
		menu: false,
		totaltime: 0,
		fail_message: "",
		standstill_time: 0
	};
}
setinitialstate();

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
	if(appstate.menu) {
		unloose();
	} else {
		maintrack.play();	// Some platfrom may only play sound after first touch
		appstate.speed = 0;
		var hit_slice = Math.floor(appstate.position) + Math.floor(e.changedTouches[0].clientY / dim.slice_height);
		if(slice_color(hit_slice) == LOOSING_COLOR) {
			loose("Don't touch RED!");
		}
	}
});

function unloose() {
	maintrack.play();
	setinitialstate();
}

function loose(message) {
	appstate.menu = true;
	appstate.fail_message = message;
	appstate.speed = 0;
	maintrack.pause();
}

var start_touch, touch_time;
window.addEventListener("touchmove", function(e) {
	if(!appstate.menu) { 
		if(touch_time && start_touch) {
			var deltatime = ((Date.now()) - touch_time) / 1000;
			appstate.speed = (start_touch - e.changedTouches[0].clientY) / (dim.slice_height * deltatime) * FINGER_GRIP;
		}
		start_touch = e.changedTouches[0].clientY;
		touch_time = new Date();
	}
});

window.addEventListener("wheel", function(e) {
	if(!appstate.menu) { 
		appstate.speed += e.deltaY / dim.slice_height * FINGER_GRIP;
	}
});

function slice_color(slice_number) {
	var slide_randomized = Math.floor(Math.sin(slice_number) * 1000);
	return COLORS[Math.abs(slide_randomized % COLORS.length)];
}

function render_slices() {
	for(var i = 0; i < SLICES_PER_SCREEN + 1; i++) {
		var slice_number = Math.floor(appstate.position + i);
		var slice_position = slice_number - appstate.position;
		ctx.fillStyle = slice_color(slice_number);
		ctx.fillRect(0, slice_position * dim.slice_height, dim.width, dim.slice_height);
	}
}

function render_debug() {
	ctx.font = "12px arial";
	ctx.fillStyle = "white";
	JSON.stringify(appstate).split(',').forEach(function(line, i) {
		ctx.fillText(line, 50, 50 + 14 * i, dim.width);
	})
}

var lastframetime = Date.now();
function update() {
	var now = Date.now();
	var deltatime = (now - lastframetime) / 1000; // Time since last frame in seconds
	lastframetime = now;
	if(appstate.menu) {
		render_menu();
	} else {
		appstate.totaltime += deltatime;
		update_positions(deltatime);
		render_slices(deltatime);
		update_audio();
		update_standstill(deltatime);
		if(appstate.standstill_time > STANDSTILL_WARNING_TIME) {
			blinking_screen();
		}
		if(debug) {
			render_debug();
		}
	}
	window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);

function render_menu() {
	ctx.fillStyle = MENU_COLOR;
	ctx.fillRect(0, 0, dim.width, dim.height);
	ctx.fillStyle = MENU_TEXT_COLOR;
	ctx.textAlign = "center"; 
	ctx.font = MENU_TEXT_SIZE + "px " + MENU_TEXT_FONT;
	ctx.fillText(appstate.fail_message, dim.width / 2, dim.height / 4, dim.width -10);
	ctx.fillText(Math.floor(appstate.position) + " slices @ " + Math.floor(appstate.position / appstate.totaltime) + " avarage slices / second", dim.width / 2, 2 * dim.height / 4, dim.width - 10);
	ctx.fillText("Click to restart", dim.width / 2, 3 * dim.height / 4, dim.width - 10);
	ctx.textAlign = "left"; 
}

function blinking_screen(deltatime) {
	if(lastframetime % 3 == 0) {
		ctx.fillStyle = COLORS[lastframetime % COLORS.length];
		ctx.globalAlpha = 0.5;
		ctx.fillRect(0, 0, dim.width, dim.height);
		ctx.globalAlpha = 1;
	}
}

function update_standstill(deltatime) {
	if(appstate.speed == 0) {
		appstate.standstill_time += deltatime;
	} else {
		appstate.standstill_time = 0;
	}
	if(appstate.standstill_time > STANDSTILL_GAMEOVER) {
		loose("You stood still for too long!");
	}
}
