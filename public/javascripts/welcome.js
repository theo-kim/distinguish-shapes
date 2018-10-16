var counter = 0;
var delay = 1000;

document.querySelector("#hidden-0").style.display = "block";

var continueBtn = document.querySelector("#continue");

function initClock() {
  updateClock();
  window.setInterval("updateClock()", 1);
}

function countDown (time, interval) {
	count = -interval;
	function reset() {
		count += interval
		if (count < time) {
			continueBtn.innerHTML = (time/1000 - count / 1000)
			setTimeout(reset, interval)
		}
		else 
			continueBtn.innerHTML = "Continue";
	}
	reset();
}

function continueInstr () {
	++counter;
	if (counter < max) {
		var c = document.querySelector("#hidden-" + counter)
		c.style.display = "block";
		// console.log(document.body.scrollHeight - (c.getBoundingClientRect().height + ((c - c) * 50)))
		// console.log(document.body.scrollHeight, '-', window.innerHeight)
		window.scroll(0, document.body.scrollHeight - (c.getBoundingClientRect().height + ((counter - 1) * 50)));
	}
	else window.location = "/practice";

	countDown(delay, 1000);

	continueBtn.removeEventListener("click", continueInstr)
	setTimeout(function() {
		continueBtn.addEventListener("click", continueInstr)
	}, delay)

}

continueBtn.addEventListener("click", continueInstr)