var MAX_MUSIC_SPEED = 1.5;
var MUSIC_SPEED_SEPARATOR = 35;
var SPEED_THRESHOLD = 50;

var tracks = {
    "scroller1slow": document.querySelector(".scroller1slow"),
    "scroller1fast": document.querySelector(".scroller1fast"),
    "scroller1slowreverse": document.querySelector(".scroller1slowreverse"),
    "scroller1fastreverse": document.querySelector(".scroller1fastreverse"),
    "scroller2slow": document.querySelector(".scroller2slow"),
    "scroller2fast": document.querySelector(".scroller2fast"),
    "scroller2slowreverse": document.querySelector(".scroller2slowreverse"),
    "scroller2fastreverse": document.querySelector(".scroller2fastreverse")
};

var current_track = "";

var maintrack = {
    update: function(appstate) {
        if(appstate.menu) {
            for(var key in tracks) {
                tracks[key].pause();
                tracks[key].currentTime = 0;
            }
        } else {
            var track = "scroller";
            track += appstate.position >= 0 ? "1" : "2";
            var over_speed_threshold = Math.abs(appstate.speed) > SPEED_THRESHOLD;
            track += over_speed_threshold ? "fast" : "slow";
            track += appstate.speed >= 0 ? "" : "reverse";
            var elem = tracks[track];
            if(current_track)
                var elemlast = tracks[current_track];
            for(var key in tracks) {
                if(key == track) {
                    elem.play()
                    elem.volume = Math.min(1, Math.max(0, Math.abs(appstate.speed) / 100));
                    elem.playbackRate = Math.min(MAX_MUSIC_SPEED, Math.max(1, Math.abs(appstate.speed) / (MUSIC_SPEED_SEPARATOR * (over_speed_threshold ? 3 : 1))));
                } else {
                    tracks[key].pause();
                }
            }
            if(track != current_track && current_track) {
                if(current_track.indexOf("slow") && track.indexOf("fast"))
                    elem.currentTime = elemlast.currentTime * 3;
                if(current_track.indexOf("fast") && track.indexOf("slow"))
                    elem.currentTime = elemlast.currentTime / 3;
                current_track = track;
            }
        }
    }
};


