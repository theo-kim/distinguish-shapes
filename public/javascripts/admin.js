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
	var actions = ["", "", ""];
	var maxPayout = 0;
	for (var i = 0; i < cells.length; ++i) {
		if (!(cells[i].value || cells[i].innerHTML)) {
			alert("You are missing some action weights");
			flag = true;
			break;
		}
		actions[i % 3] += (cells[i].value || cells[i].innerHTML);
		if (parseInt(cells[i].value || cells[i].innerHTML) > maxPayout)
			maxPayout = cells[i].value || cells[i].innerHTML;
	}

	var pCells = document.querySelectorAll(".prob-cell");
	var pnCells = document.querySelectorAll(".prob-n-cell");
	var prob = [];
	var totalProb = 0;
	var totalProbN = 0;
	for (var i = 0; i < pCells.length; ++i) {
		if (!(pCells[i].value || pCells[i].innerHTML) || !(pnCells[i].value || pnCells[i].innerHTML)) {
			alert("You are missing some probabilities, check the table!");
			flag = true;
			break;
		}
		prob.push({
			prob: pCells[i].value,
			n: pnCells[i].value
		});
		
		totalProbN += parseInt(pnCells[i].value)
		totalProb += parseInt(pnCells[i].value) * parseInt(pCells[i].value)
	}

	if (totalProb != 100) {
		alert("Your probabilities don't add up to a 100%!");
		flag = true;
	}

	if (totalProbN != data.rounds) {
		alert("You haven't assigned a probability to each round!");
		flag = true;
	}

	console.log(JSON.stringify(prob));
	
	data["probabilities"] = JSON.stringify(prob)
	data["action_weights"] = actions.join(":")
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
		d.style.width = "30px"
		d.className = "weight-cell"

		e.parentNode.replaceChild(d, e);
	}
}

function editProbs(event) {
	action_saved = false;
	var cells = document.querySelectorAll(".prob-cell");
	var cellsN = document.querySelectorAll(".prob-n-cell");
	for (var i = 0; i < cells.length; ++i) {
		var e = cells[i];
		var d = document.createElement('input');
		d.value = e.innerHTML;
		d.type = "text";
		d.style.width = "30px"
		d.className = "prob-cell"

		e.parentNode.replaceChild(d, e);
	}
	for (var i = 0; i < cellsN.length; ++i) {
		var e = cellsN[i];
		var d = document.createElement('input');
		d.value = e.innerHTML;
		d.type = "text";
		d.style.width = "30px"
		d.className = "prob-n-cell"

		e.parentNode.replaceChild(d, e);
	}
}

function newProbs() {
	var t = document.querySelector(".prob-table");
	var r = document.createElement("tr");
	r.innerHTML = "<td style='text-align:right;'><input type='text' style='max-width:30px'> %</td><td style='text-align:center;'><input type='text' style='max-width:30px'></td>";

	t.appendChild(r);
}

document.getElementById("next").addEventListener("click", saveSettings);
document.getElementById("editAct").addEventListener("click", editActions);
document.getElementById("editProb").addEventListener("click", newProbs);

editActions();
editProbs();