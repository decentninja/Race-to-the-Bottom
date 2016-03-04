var SLICES_PER_SCREEN = 5;
var SPRING = 0.98;
var SLIPSTICK = 0.5;	// Minimum speed
var FINGER_GRIP = 1;
var MENU_TEXT_COLOR = "white";
var MENU_TEXT_SIZE = 20;
var MENU_TEXT_FONT = "arial";
var STANDSTILL_WARNING_TIME = 0;
var STANDSTILL_GAMEOVER = 1;
var DEATH_COLOR = "#db583d";
var MENU_COLOR = DEATH_COLOR;
var COLORS = [
	"#5bab51",
	"#81a8c8",
	"#9b6cdd",
	"#afca61",
	"#be67ae",
	"#fcce70"
];
var SCREENS_UNTIL_CHANCE_DEATHSLICE_ADDED = 100;
var MAX_DEATH_SLICE_CHANCE = 0.9;
var SEED = 13;

var debug = window.location.href.indexOf("debug") != -1;

var ctx = document.querySelector(".maincanvas").getContext("2d");

var appstate = {};
function setinitialstate() {
	appstate = {
		position: 0,	// In slices
		speed: 0,		// In slices per second
		menu: false,
		totaltime: 0,
		fail_message: "",
		standstill_time: 0,
		first_scroll: false		// Can't loose until first scroll
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

window.addEventListener("touchstart", function(e) {
	e.preventDefault(); 
	maintrack.update(appstate);
	if(appstate.menu) {
		unloose();
	} else {
		appstate.speed = 0;
		var hit_slice = Math.floor(appstate.position) + Math.floor(e.changedTouches[0].clientY / dim.slice_height);
		if(slice_color(hit_slice) == DEATH_COLOR) {
			loose("You touched RED!");
		}
	}
});

function unloose() {
	setinitialstate();
}

function loose(message) {
	appstate.menu = true;
	appstate.fail_message = message;
	appstate.speed = 0;
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

window.addEventListener("touchend", function(e) {
	if(!appstate.menu) { 
		if(!appstate.first_scroll)
			appstate.first_scroll = true;
	}
});

window.addEventListener("wheel", function(e) {
	if(!appstate.menu) { 
		appstate.speed += e.deltaY / dim.slice_height * FINGER_GRIP;
	}
});

function slice_color(slice_number) {
	var slice_randomized = Math.abs(Math.sin(slice_number * 1000 + SEED));
	var red_chance = Math.min(MAX_DEATH_SLICE_CHANCE, slice_number / (SLICES_PER_SCREEN * SCREENS_UNTIL_CHANCE_DEATHSLICE_ADDED));
	return slice_randomized < red_chance ? DEATH_COLOR : COLORS[Math.abs(Math.floor(1000 * slice_randomized) % COLORS.length)];
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
	ctx.fillText(navigator.userAgent, 14, 14);
}

var lastframetime = Date.now();
function update() {
	var now = Date.now();
	var deltatime = (now - lastframetime) / 1000; // Time since last frame in seconds
	lastframetime = now;
	maintrack.update(appstate, deltatime);
	if(appstate.menu) {
		render_menu();
	} else {
		appstate.totaltime += deltatime;
		update_positions(deltatime);
		render_slices(deltatime);
		update_standstill(deltatime);
		if(appstate.first_scroll && appstate.standstill_time > STANDSTILL_WARNING_TIME) {
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
	if(appstate.first_scroll && appstate.standstill_time > STANDSTILL_GAMEOVER) {
		loose("You stood still for too long!");
	}
}

/*
// one seed that sets all first colors different
for(var k = 0; k < 1000; k++) {
	SEED++;
	var colors = []
	for(var i = 0; i < 5; i++) {
		colors.push(slice_color(i));
	}
	var bla = 0;
	for(var i = 0; i < 5; i++) {
		for(var j = i + 1; j < 5; j++) {
			if(colors[i] == colors[j])
				bla++;
		}
	}
	console.log(SEED, colors, bla);
	if(bla == 0) {
		break;
	}
}
*/
