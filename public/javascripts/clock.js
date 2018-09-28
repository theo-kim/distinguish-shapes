Number.prototype.pad = function(n) {
  for (var r = this.toString(); r.length < n; r = 0 + r);
  return r;
};

var running = false;

function updateClock() {
  var now = new Date();
  var milli = now.getMilliseconds(),
    sec = now.getSeconds(),
    min = now.getMinutes(),
    hou = now.getHours()
    corr = [hou.pad(2), min.pad(2), sec.pad(2), milli];
    var tags = ["h", "m", "s", "mi"]
  	for (var i = 0; i < tags.length; i++)
    	document.getElementById(tags[i]).firstChild.nodeValue = corr[i] + ((i + 1 == tags.length) ? "" : ":");
    if (running) 
      setTimeout(updateClock, 1);
}

function initClock() {
  if (!running) {
    running = true;
    updateClock();
  }
}

function stopClock() {
  console.log(running)
  if (running) {
    running = false;
  }
}

document.querySelector("#start").addEventListener("click", initClock)
document.querySelector("#stop").addEventListener("click", stopClock)