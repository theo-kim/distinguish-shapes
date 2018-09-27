var counter = 0;

document.querySelector("#hidden-0").style.display = "block";

var continueBtn = document.querySelector("#continue");
continueBtn.addEventListener("click", function() {
	++counter;
	if (counter < max) {
		var c = document.querySelector("#hidden-" + counter)
		c.style.display = "block";
		window.scrollTop = c.scrollTop
	}
	else window.location = "/survey";
})