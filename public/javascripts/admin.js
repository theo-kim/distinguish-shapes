var action_saved = true;

function saveSettings() {
	var settingsInputs = document.querySelectorAll(".setting-input");
	var data = {}
	var flag = false;
	for (var i = 0; i < settingsInputs.length; ++i) {
		if (!settingsInputs[i].className.includes("array"))
			data[settingsInputs[i].getAttribute("data-key")] = settingsInputs[i].value
		else if (!data[settingsInputs[i].getAttribute("data-key")])
			data[settingsInputs[i].getAttribute("data-key")] = [(settingsInputs[i].checked == false) ? 0 : 1]
		else 
			data[settingsInputs[i].getAttribute("data-key")].push((settingsInputs[i].checked == false) ? 0 : 1)  
	}

	var cells = document.querySelectorAll(".weight-cell");
	var actions = [];
	var maxPayout = 0;
	for (var i = 0; i < cells.length; ++i) {
		var min = parseInt(document.querySelector("#min-table-" + cells[i].table).value);
		var max = parseInt(document.querySelector("#max-table-" + cells[i].table).value);
		if (!(cells[i].value || cells[i].innerHTML)) {
			alert("You are missing some action weights");
			flag = true;
			break;
		}
		actions.push({
			payout: parseInt(cells[i].value),
			start_round: min,
			end_round: max,
			tableid: parseInt(cells[i].table),
			action: (i % 3),
			shape: Math.floor((i / 3) % 3),
		});
		if (parseInt(cells[i].value || cells[i].innerHTML) > maxPayout)
			maxPayout = cells[i].value || cells[i].innerHTML;
	}

	data["action_weights"] = JSON.stringify(actions)
	data["max_payout"] = maxPayout
	data["polygons"] = data["polygons"].join("")
	data["true_polygons"] = data["true_polygons"].join("")

	if (data["n"] != (data["polygons"].split("1").length - 1) || data["m"] != (data["true_polygons"].split("1").length - 1)) {
		alert("Your 'n' value must be the same as the number of selected polygons and your 'm' number must be the same as the number of selected true_polygons.")
		flag = true;
	}

	if (parseInt(data["max_delta"]) <= parseInt(data["mid_delta"])) {
		flag = true;
		alert("max_delta MUST be greater than mid_delta")
	}

	if (parseInt(data["mud_delta"]) > (1/parseInt(data.m)) * ((parseInt(data['total_n']) / parseInt(data.n)) * (parseInt(data.n) - 
		parseInt(data.m)) - data["max_delta"] - data["mid_delta"])) {
		flag = true;
		alert("Illegal mud_delta value")
	}

	if (!flag) {
		console.log(data)
		$.post('/api/admin', data, () => location.reload());
	}
}

function editActions(event) {
	action_saved = false;
	var cells = document.querySelectorAll(".weight-cell");
	for (var i = 0; i < cells.length; ++i) {
		var e = cells[i];
		var d = document.createElement('input');
		d.value = e.innerHTML;
		d.type = "text";
		d.style.width = "30px";
		d.className = "weight-cell";
		d.table = e.getAttribute("data-table");

		e.parentNode.replaceChild(d, e);
	}
}

function newActions(event) {
	action_saved = false;
	var cells = document.querySelectorAll(".weight-cell");
	for (var i = 0; i < cells.length; ++i) {
		var e = cells[i];
		var d = document.createElement('input');
		d.value = e.innerHTML;
		d.type = "text";
		d.style.width = "30px";
		d.className = "weight-cell";
		d.table = e.getAttribute("data-table");

		e.parentNode.replaceChild(d, e);
	}
}

document.getElementById("next").addEventListener("click", saveSettings);
document.getElementById("editAct").addEventListener("click", newActions);

editActions();